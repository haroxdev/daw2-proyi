# GesTime

> Aplicación web de **gestión de tiempo y control horario** para empresas. Permite el fichaje de jornadas, gestión de ausencias, calendario de eventos, timesheets, proyectos, tareas y reporting — todo desde una interfaz moderna tipo SPA.

[![Estado del Build](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php&logoColor=white)](#)
[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](#)

---

## Tecnologías

| Capa | Tecnología |
|------|------------|
| **Backend** | PHP 8.2 · Laravel 12 |
| **Frontend** | React 18 · React Router 6 · Axios |
| **Estilos** | Tailwind CSS 4 |
| **Bundler** | Vite 7 |
| **Base de datos** | MySQL |
| **Servidor** | Nginx / Apache |

---

## Funcionalidades principales

- Control de fichaje (entrada, salida, pausas)
- Gestión de ausencias y tipos de ausencia
- Calendario con eventos personales, de equipo, compañía y festivos
- Timesheets de registro de horas
- Gestión de proyectos y tareas
- Panel de administración con reporting
- Sistema de notificaciones
- Chat interno
- Gestión de departamentos y empleados
- Perfil de usuario y configuración de empresa

---

## Estructura del proyecto

```
gestime/
├── configuracion/          # Variables de entorno (dev/prod)
├── devops/                 # Despliegue e infraestructura
├── documentacion/          # Análisis, diseño, requisitos, manuales
├── planificacion/          # Cronograma, historias de usuario, tareas
├── pruebas/                # Tests de aceptación, integración, unitarios
└── web/                    # Aplicación Laravel + React
    ├── app/                # Modelos, controladores, servicios, middleware
    ├── config/             # Configuración de Laravel
    ├── database/           # Migraciones, seeders, factories
    ├── mysql/              # Script SQL de creación de tablas
    ├── public/             # Punto de entrada y assets compilados
    ├── resources/          # Código fuente React (js/) y estilos (css/)
    ├── routes/             # Rutas web y API
    ├── storage/            # Logs, caché, sesiones (no se sube)
    ├── tests/              # Tests PHPUnit
    └── vendor/             # Dependencias PHP (no se sube)
```

---

## Inicio rápido

### Prerrequisitos

- PHP >= 8.2
- Composer
- Node.js >= 18 y npm
- MySQL 8
- Servidor web (Nginx / Apache)

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/haroxdev/daw2-proyi.git
   cd daw2-proyi
   ```

2. **Instalar dependencias del backend:**
   ```bash
   cd web
   composer install
   ```

3. **Configurar el entorno:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Edita `.env` con tus credenciales de base de datos:
   ```dotenv
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=gestime
   DB_USERNAME=tu_usuario
   DB_PASSWORD=tu_contraseña
   ```

4. **Crear la base de datos y ejecutar migraciones:**
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS gestime;"
   php artisan migrate --seed
   ```

5. **Instalar dependencias del frontend y compilar:**
   ```bash
   npm install
   npm run build
   ```

6. **Iniciar el servidor de desarrollo:**
   ```bash
   php artisan serve
   ```
   La aplicación estará disponible en `http://localhost:8000`.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR (Vite) |
| `npm run build` | Compilar assets para producción |
| `php artisan serve` | Servidor PHP de desarrollo |
| `php artisan migrate` | Ejecutar migraciones |
| `php artisan db:seed` | Poblar la base de datos con datos de prueba |

---

## Equipo de desarrollo

- **Adrián Martínez** 
- **Adrián Terán**
- **Pablo Acero**

---

## Licencia

Proyecto académico — DAW2.
