\c cs3223;

DROP TABLE IF EXISTS Students, Admins, Presentations CASCADE;

CREATE TABLE Students (
    matric CHAR(9) PRIMARY KEY, 
    fullname VARCHAR(100) NOT NULL, 
    tutorial VARCHAR(3) NOT NULL,
    username VARCHAR(50)
);

CREATE INDEX ON Students(LEFT(username, 3));

CREATE TABLE Admins (
    fullname VARCHAR(100) NOT NULL, 
    username VARCHAR(50) NOT NULL,
    tutorial VARCHAR(3) PRIMARY KEY,
    userid INTEGER NOT NULL
);

CREATE TABLE Presentations (
    matric CHAR(9) NOT NULL REFERENCES Students
        ON DELETE CASCADE, 
    week INTEGER NOT NULL DEFAULT 3, 
    question INTEGER NOT NULL,
    has_submitted BOOLEAN NOT NULL DEFAULT FALSE, 
    has_presented BOOLEAN NOT NULL DEFAULT FALSE,
    CHECK (week >= 3 AND week <= 13),
    PRIMARY KEY (matric, week)
);
