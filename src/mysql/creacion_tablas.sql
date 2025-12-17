CREATE DATABASE gestime;
USE gestime;

-- =========================
-- EMPRESA (una sola)
-- =========================
CREATE TABLE empresa (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cif VARCHAR(15) NOT NULL,
    email_admin VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- DEPARTAMENTOS
-- =========================
CREATE TABLE departamento (
    id_departamento INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- =========================
-- EMPLEADOS
-- =========================
CREATE TABLE empleado (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(15) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido1 VARCHAR(50) NOT NULL,
    apellido2 VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    imagen_perfil VARCHAR(255),
    estado ENUM('alta','baja','baja_temporal') DEFAULT 'alta',
    dias_vacaciones_restantes INT DEFAULT 0,
    id_departamento INT,
    FOREIGN KEY (id_departamento) REFERENCES departamento(id_departamento)
);

-- =========================
-- ROLES
-- =========================
CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

CREATE TABLE rol_usuario (
    id_rol_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_rol INT NOT NULL,
    id_departamento INT NULL,
    id_proyecto INT NULL,
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado),
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

-- =========================
-- REGISTRO HORARIO
-- =========================
CREATE TABLE registro_horario (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    hora_llegada DATETIME NOT NULL,
    hora_salida DATETIME,
    tiempo_total TIME,
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

-- =========================
-- PAUSAS
-- =========================
CREATE TABLE pausa (
    id_pausa INT AUTO_INCREMENT PRIMARY KEY,
    id_registro INT NOT NULL,
    inicio DATETIME NOT NULL,
    fin DATETIME,
    FOREIGN KEY (id_registro) REFERENCES registro_horario(id_registro)
);

-- =========================
-- CORRECCIONES DE FICHAJE
-- =========================
CREATE TABLE correccion_fichaje (
    id_correccion INT AUTO_INCREMENT PRIMARY KEY,
    id_registro INT NOT NULL,
    id_solicitante INT NOT NULL,
    nuevo_inicio DATETIME,
    nuevo_fin DATETIME,
    motivo TEXT,
    estado ENUM('pendiente','aprobada','rechazada') DEFAULT 'pendiente',
    id_aprobador INT,
    fecha_resolucion DATETIME,
    FOREIGN KEY (id_registro) REFERENCES registro_horario(id_registro),
    FOREIGN KEY (id_solicitante) REFERENCES empleado(id_empleado),
    FOREIGN KEY (id_aprobador) REFERENCES empleado(id_empleado)
);

-- =========================
-- PROYECTOS Y EQUIPOS
-- =========================
CREATE TABLE proyecto (
    id_proyecto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado ENUM('activo','en_pausa','finalizado') DEFAULT 'activo'
);

CREATE TABLE proyecto_empleado (
    id_proyecto_empleado INT AUTO_INCREMENT PRIMARY KEY,
    id_proyecto INT NOT NULL,
    id_empleado INT NOT NULL,
    FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

-- =========================
-- TAREAS Y TIEMPOS
-- =========================
CREATE TABLE tarea (
    id_tarea INT AUTO_INCREMENT PRIMARY KEY,
    id_proyecto INT NOT NULL,
    id_empleado INT,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    prioridad ENUM('baja','media','alta') DEFAULT 'media',
    estado ENUM('pendiente','en_proceso','finalizada') DEFAULT 'pendiente',
    FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

CREATE TABLE tiempo_tarea (
    id_tiempo INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,
    id_empleado INT NOT NULL,
    inicio DATETIME NOT NULL,
    fin DATETIME,
    FOREIGN KEY (id_tarea) REFERENCES tarea(id_tarea),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

-- =========================
-- TIMESHEET (PERIODOS)
-- =========================
CREATE TABLE timesheet (
    id_timesheet INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    inicio_periodo DATE NOT NULL,
    fin_periodo DATE NOT NULL,
    estado ENUM('borrador','enviado','aprobado','rechazado') DEFAULT 'borrador',
    id_aprobador INT,
    comentario TEXT,
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado),
    FOREIGN KEY (id_aprobador) REFERENCES empleado(id_empleado)
);

-- =========================
-- AUSENCIAS / GESTIONES
-- =========================
CREATE TABLE tipo_ausencia (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    remunerado BOOLEAN DEFAULT true
);

CREATE TABLE solicitud (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_tipo INT NOT NULL,
    inicio DATE NOT NULL,
    fin DATE NOT NULL,
    comentario TEXT,
    estado ENUM('pendiente','aprobada','rechazada','cancelada') DEFAULT 'pendiente',
    id_aprobador INT,
    fecha_resolucion DATETIME,
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado),
    FOREIGN KEY (id_tipo) REFERENCES tipo_ausencia(id_tipo),
    FOREIGN KEY (id_aprobador) REFERENCES empleado(id_empleado)
);

-- =========================
-- CHAT
-- =========================
CREATE TABLE chat (
    id_chat INT AUTO_INCREMENT PRIMARY KEY,
    id_remitente INT NOT NULL,
    id_destinatario INT NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_remitente) REFERENCES empleado(id_empleado),
    FOREIGN KEY (id_destinatario) REFERENCES empleado(id_empleado)
);

-- =========================
-- NOTIFICACIONES
-- =========================
CREATE TABLE notificacion (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    tipo VARCHAR(50),
    mensaje TEXT,
    leida BOOLEAN DEFAULT false,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

-- =========================
-- AUDITORIA
-- =========================
CREATE TABLE auditoria (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT,
    accion VARCHAR(100),
    entidad VARCHAR(50),
    entidad_id INT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);
