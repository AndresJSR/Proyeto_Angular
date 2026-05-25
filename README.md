# TailwindAdmin-Angular

Dashboard administrativo moderno construido con Angular 21, Tailwind CSS y Angular Material.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados:

- **Node.js** (versión 18.x o superior)
- **npm** (versión 9.x o superior) o **yarn**
- **Git**

Puedes verificar tus versiones ejecutando:
```bash
node --version
npm --version
```

##  Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/AndresJSR/Proyeto_Angular.git
cd Proyeto_Angular
```

### 2. Instalar dependencias

```bash
npm install
```

O si prefieres usar yarn:

```bash
yarn install
```

##  Comandos Disponibles

### Iniciar el servidor de desarrollo

```bash
npm start
```

O con ng cli directamente:

```bash
ng serve
```

El servidor estará disponible en: `http://localhost:4200/`

### Compilar para producción

```bash
npm run build
```

O:

```bash
ng build
```

Los archivos compilados se guardarán en la carpeta `dist/`

### Watch mode (desarrollo con recompilación automática)

```bash
npm run watch
```

O:

```bash
ng build --watch --configuration development
```

### Ejecutar tests

```bash
npm test
```

##  Estructura de la plantilla

```
src/
├── app/
│   ├── components/        # Componentes reutilizables
│   ├── layouts/           # Layouts principales
│   ├── pages/             # Páginas de la aplicación
│   ├── services/          # Servicios (HTTP, datos)
│   ├── pipe/              # Pipes personalizados
│   ├── app.routes.ts      # Rutas principales
│   └── app.config.ts      # Configuración de la app
├── assets/
│   ├── i18n/              # Archivos de traducción (i18n)
│   ├── images/            # Imágenes del proyecto
│   └── scss/              # Estilos globales
├── styles.scss            # Estilos principales
└── main.ts                # Punto de entrada
```

##  Tecnologías Utilizadas

- **Angular** 21
- **Tailwind CSS** 4.x
- **Angular Material** 21
- **ApexCharts** - Gráficos
- **NGX Translate** - Internacionalización
- **SCSS** - Pre-procesador CSS
- **TypeScript**

##  Internacionalización (i18n)

El proyecto incluye soporte multiidioma con **ngx-translate**. Los archivos de traducción se encuentran en:

- `src/assets/i18n/en.json` - Inglés
- `src/assets/i18n/es.json` - Español
- `src/assets/i18n/de.json` - Alemán
- `src/assets/i18n/fr.json` - Francés

##  Variables de Entorno

Para configurar variables específicas del entorno, edita los archivos:
- `environment.ts` - Desarrollo
- `environment.prod.ts` - Producción

##  Troubleshooting

### El servidor no inicia

```bash
# Limpia la caché de npm
npm cache clean --force

# Elimina node_modules y reinstala
rm -r node_modules
npm install

# Intenta iniciar de nuevo
npm start
```

### Puerto 4200 ya en uso

Inicia el servidor en otro puerto:

```bash
ng serve --port 4201
```

##  Build para Producción

Para crear una versión optimizada para producción:

```bash
npm run build
```

Los archivos estarán en la carpeta `dist/tailwindadmin`

##  Licencia

Este proyecto es parte del curso de Frontend - Universidad de caldas 

## 👨 Autor

Felipe Buitrago Carmona
GitHub
https://github.com/felipebuitragocarmona