-- Extensión de mapas GIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabla productores
CREATE TABLE productores (
  id       SERIAL PRIMARY KEY,
  nombre   VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  correo   VARCHAR(100)
);

-- Tabla parcelas con geometría
CREATE TABLE parcelas (
  id               SERIAL PRIMARY KEY,
  nombre           VARCHAR(100) NOT NULL,
  productor_id     INT REFERENCES productores(id),
  geometria        GEOMETRY(Polygon, 4326),
  hectareas        DECIMAL(8,2),
  variedad         VARCHAR(50),
  edad_anos        INT,
  densidad_arboles INT
);

-- Tabla libreta de campo
CREATE TABLE libreta_campo (
  id            SERIAL PRIMARY KEY,
  parcela_id    INT REFERENCES parcelas(id),
  fecha         DATE,
  actividad     TEXT,
  produccion_kg DECIMAL(8,2),
  temperatura   DECIMAL(4,1),
  humedad       DECIMAL(4,1),
  observaciones TEXT,
  foto_url      TEXT
);

-- Tabla rendimientos
CREATE TABLE rendimientos (
  id                  SERIAL PRIMARY KEY,
  parcela_id          INT REFERENCES parcelas(id),
  fecha               DATE,
  produccion_real     DECIMAL(8,2),
  produccion_estimada DECIMAL(8,2)
);

-- Tabla índices NDVI históricos
CREATE TABLE ndvi_historico (
  id         SERIAL PRIMARY KEY,
  parcela_id INT REFERENCES parcelas(id),
  fecha      DATE,
  ndvi       DECIMAL(4,3),
  ndwi       DECIMAL(4,3),
  evi        DECIMAL(4,3),
  fuente     VARCHAR(50)
);

-- Tabla alertas
CREATE TABLE alertas (
  id          SERIAL PRIMARY KEY,
  parcela_id  INT REFERENCES parcelas(id),
  tipo        VARCHAR(50),
  descripcion TEXT,
  fecha       DATE,
  estado      VARCHAR(20) DEFAULT 'activa'
);

-- Dato de prueba
INSERT INTO productores (nombre, telefono, correo)
VALUES ('Juan Hernández', '271-123-4567', 'juan@ejemplo.com');

SELECT COUNT(*) as total_productores FROM productores_productor;