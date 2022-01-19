CREATE OR REPLACE FUNCTION assign_new_participation( IN num_questions INTEGER, IN in_tutorial VARCHAR(3) )
RETURNS TABLE (fullname VARCHAR(100), question INTEGER) AS $$
DECLARE 
    res RECORD;
    rec RECORD;
    qn_no INTEGER;
    new_week INTEGER; 
BEGIN 
    SELECT COALESCE(MAX(week) + 1, 3) INTO new_week 
        FROM Presentations P;
    qn_no := 1;
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
            (rec.matric, new_week, qn_no, FALSE, FALSE);
        qn_no := qn_no + 1;
    END LOOP;

    FOR res in (
        SELECT S.fullname, P.question
            FROM Students S, Presentations P 
            WHERE S.matric = P.matric 
                AND P.week = new_week
            ORDER BY P.question
    )
    LOOP
        fullname := res.fullname;
        question := res.question;
        RETURN NEXT;
    END LOOP; 
END;
$$ LANGUAGE plpgsql;
