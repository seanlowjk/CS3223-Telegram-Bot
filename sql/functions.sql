CREATE OR REPLACE FUNCTION assign_new_participation( IN num_questions INTEGER, IN in_tutorial VARCHAR(3) )
RETURNS VOID AS $$
DECLARE 
    rec RECORD;
    new_week INTEGER; 
BEGIN 
    SELECT COALESCE(MAX(week) + 1, 3) INTO new_week 
        FROM Presentations P;
    FOR rec IN SELECT PC.matric
            FROM (
                SELECT matric, tutorial, CASE
                    WHEN matric 
                        IN (SELECT matric FROM Presentations) 
                        THEN (SELECT COUNT(*) FROM Presentations P WHERE P.matric = matric)
                    ELSE 0
                    END participations
                    FROM Students 
                    GROUP BY matric
            ) AS PC
            WHERE PC.tutorial = in_tutorial
            ORDER BY PC.participations
            LIMIT num_questions
    LOOP
        INSERT INTO Presentations VALUES 
            (rec.matric, new_week, FALSE, FALSE);
    END LOOP;
END;
$$ LANGUAGE plpgsql;
