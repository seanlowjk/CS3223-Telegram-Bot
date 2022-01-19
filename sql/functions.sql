CREATE OR REPLACE FUNCTION assign_new_participation( IN num_questions INTEGER, IN in_tutorial VARCHAR(3) )
RETURNS VOID AS $$
DECLARE 
    rec RECORD;
    max_participation_count INTEGER;
    min_participation_count INTEGER;
    new_week INTEGER; 
BEGIN 
    SELECT COALESCE(MAX(PC.part_count), 0) INTO max_participation_count
        FROM (
            SELECT COUNT(P.matric) AS part_count
                FROM Presentations P
                GROUP BY P.matric
        ) AS PC;
    IF max_participation_count = 0 THEN
        FOR rec IN SELECT S.matric
                FROM Students S
                WHERE S.tutorial = in_tutorial
                LIMIT num_questions
        LOOP
            INSERT INTO Presentations VALUES 
                (rec.matric, 3, FALSE, FALSE);
        END LOOP;
    ELSE
        min_participation_count := max_participation_count - 1;
        SELECT MAX(week) + 1 INTO new_week 
            FROM Presentations P;
        FOR rec IN SELECT matric 
                FROM (Students NATURAL JOIN Presentations) SP
                GROUP BY SP.matric
                HAVING COUNT(SP.matric) = min_participation_count
                    AND SP.matric IN (
                        SELECT S.matric
                            FROM Students S
                            WHERE S.tutorial = in_tutorial
                    )
                LIMIT num_questions
        LOOP
            INSERT INTO Presentations VALUES 
                (rec.matric, in_week, FALSE, FALSE);
        END LOOP;
    END IF; 
END;
$$ LANGUAGE plpgsql;
