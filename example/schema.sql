CREATE DATABASE app_tareas;
USE app_tareas;

CREATE TABLE usuarios
(id integer PRIMARY KEY AUTO_INCREMENT,
nombre varchar(255) NOT NULL,
email varchar(255) NOT NULL);

CREATE TABLE tareas
(id integer PRIMARY KEY AUTO_INCREMENT,
nombre VARCHAR(255) NOT NULL,
categoria VARCHAR(255) NOT NULL,
id_usuario INTEGER NOT NULL,

FOREIGN KEY (id_usuario) REFERENCES usuarios(id));

INSERT INTO usuarios (nombre, email) VALUES
('pedro', 'pedro@mail.com'),
('galapha', 'galapha@email.com');

INSERT INTO tareas (nombre, categoria, id_usuario) VALUES 
('terminar monografía', 'urgente', 1), 
('arreglar calefón', 'puede esperar', 2);
