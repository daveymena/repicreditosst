# 💎 RapiCréditos Pro

<div align="center">

![RapiCréditos](https://img.shields.io/badge/RapiCréditos-Pro-emerald?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**Plataforma Profesional de Gestión de Préstamos con Inteligencia Artificial**

[Demo](http://localhost:8080) · [Documentación](./GUIA_DE_USO.md) · [Reportar Bug](https://github.com/daveymena/rapicr-ditos-pro/issues)

</div>

---

## 🌟 Características Principales

### 🤖 Inteligencia Artificial Integrada
- **Ollama AI** para análisis de comportamiento de clientes
- Generación automática de mensajes de cobro personalizados
- Predicción de riesgo de mora
- Análisis de patrones de pago

### 💬 Integración WhatsApp
- Sincronización mediante código QR
- Envío masivo de recordatorios
- Mensajes automáticos generados por IA
- Notificaciones en tiempo real

### 📊 Dashboard Analítico
- **Capital en la Calle:** Dinero total prestado
- **Clientes Activos:** Gestión completa de cartera
- **Préstamos en Mora:** Alertas automáticas
- **Ganancias Totales:** Reportes en tiempo real

### 🧮 Simulador Inteligente
- Cálculo automático de cuotas
- Múltiples frecuencias (diario, semanal, quincenal, mensual)
- Proyección de intereses
- Fechas de vencimiento automáticas

### 👤 Gestión de Perfil Profresional
- Configuración de negocio y personalización
- Estado de conexión de WhatsApp
- Estadísticas personales de cuenta
- Gestión de seguridad y notificaciones

### 📄 Documentos Profesionales
- Recibos de pago en PDF
- Certificados de Paz y Salvo
- Historial completo de transacciones
- Exportación a Excel

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm o bun

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/daveymena/rapicr-ditos-pro.git
cd rapicr-ditos-pro

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# Ejecutar en desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:8080`

---

## 🗄️ Configuración de Base de Datos

### PostgreSQL (Recomendado)

La aplicación usa PostgreSQL como base de datos principal. Configura las siguientes variables en tu archivo `.env`:

```env
# PostgreSQL Configuration
DATABASE_URL="postgresql://postgres:PASSWORD@HOST:PORT/DATABASE?sslmode=disable"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="tu_contraseña"
POSTGRES_DB="posgres-db"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
```

### Supabase (Opcional)

También soporta Supabase para funciones serverless:

```env
VITE_SUPABASE_PROJECT_ID="tu_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="tu_publishable_key"
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
```

### Esquema de Base de Datos

La aplicación incluye las siguientes tablas:

- **clients**: Información de clientes
- **loans**: Préstamos activos y completados
- **payments**: Registro de pagos
- **profiles**: Perfiles de usuario
- **reminders**: Recordatorios y mensajes

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Librería UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultra rápido
- **TailwindCSS** - Estilos utility-first
- **Shadcn/ui** - Componentes premium
- **Framer Motion** - Animaciones fluidas
- **React Query** - Gestión de estado servidor

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos relacional
- **Supabase Auth** - Autenticación
- **Supabase Storage** - Almacenamiento de archivos

### IA & Automatización
- **Ollama** - Procesamiento de lenguaje natural local
- **WhatsApp Web API** - Mensajería automatizada

---

## 📱 Características Responsive

La aplicación es **100% responsive** y funciona perfectamente en:

- 📱 Smartphones (iOS y Android)
- 💻 Tablets
- 🖥️ Desktop

### PWA (Progressive Web App)

Puedes instalar RapiCréditos como una aplicación nativa:

1. Abre la app en tu navegador móvil
2. Toca el menú del navegador
3. Selecciona "Agregar a pantalla de inicio"
4. ¡Listo! Ahora tienes un ícono como una app nativa

---

## 📖 Documentación

Para una guía completa de uso, consulta [GUIA_DE_USO.md](./GUIA_DE_USO.md)

### Temas cubiertos:
- Registro e inicio de sesión
- Gestión de clientes
- Creación de préstamos
- Registro de pagos
- Configuración de WhatsApp
- Uso de IA para mensajes
- Generación de reportes

---

## 🔐 Seguridad

- ✅ Autenticación segura con Supabase Auth
- ✅ Encriptación de datos en tránsito (HTTPS)
- ✅ Encriptación de datos en reposo
- ✅ Row Level Security (RLS) en PostgreSQL
- ✅ Validación de datos en cliente y servidor
- ✅ Protección contra SQL Injection
- ✅ Protección CSRF

---

## 🚢 Despliegue

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Netlify

```bash
# Build
npm run build

# Desplegar carpeta dist/
```

### Docker

```bash
# Build image
docker build -t rapicreditos-pro .

# Run container
docker run -p 8080:8080 rapicreditos-pro
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Davey Mena**

- GitHub: [@daveymena](https://github.com/daveymena)

---

## 🙏 Agradecimientos

- [Shadcn/ui](https://ui.shadcn.com/) por los componentes UI
- [Supabase](https://supabase.com/) por el backend
- [Vercel](https://vercel.com/) por el hosting
- [Ollama](https://ollama.ai/) por la IA local

---

<div align="center">

**RapiCréditos Pro** - *Profesionalizando el arte de prestar* 💎

Hecho con ❤️ y ☕

</div>
