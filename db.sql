/* Database Definition */

CREATE TABLE users (
  id_user serial primary key,
  username varchar(40) UNIQUE NOT NULL,
  name varchar(40),
  last_name varchar(40),
  password text NOT NULL
);

CREATE TABLE trees (
  id integer, /* Not set as primary key because the dataset allows duplicated */
  date date,
  scientific_name text,
  value decimal
);

CREATE EXTENSION pgcrypto;

/*
 * Extra query to get the percentage of trees with a scientific name
 * equal to 'Platanus x hispanica' and a value greater than 5 in 2015.
 */

SELECT count_total, count_hispanica, (count_hispanica * 100 / count_total) AS percentage
  FROM
    (SELECT count(id) AS count_total FROM trees) t1,
    (SELECT count(id) AS count_hispanica FROM trees WHERE
      scientific_name = 'Platanus x hispanica' AND value > 5
      AND EXTRACT(YEAR FROM date) = 2015) t2;