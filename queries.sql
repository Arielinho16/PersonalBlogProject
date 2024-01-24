/*crear la bd con el nombre de blog o tambien el que desees :)*/
CREATE TABLE posts(
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    content TEXT
);

CREATE TABLE contact(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(50),
    coment TEXT
);

