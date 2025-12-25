# SmartCraft Sparkline - Cable Dimensioning Web Assembly

A **Proof of Concept** web-based cable dimensioning tool built with **WebAssembly** for high-performance electrical engineering calculations. This application demonstrates modern web technologies including PWA capabilities, offline support, and real-time interactive canvas visualization.

## 🚀 Features

### Core Calculations
- **Resistivity Calculation**: Calculate material resistivity based on temperature and material type (copper/aluminum)
- **Voltage Drop**: Calculate voltage drop for single-phase, three-phase, and multi-segment chain configurations
- **Cross-Section Sizing**: Determine required cable cross-section based on current, length, and maximum voltage drop
- **Power Loss**: Calculate power loss in cables
- **Current Derating**: Apply derating factors based on ambient temperature
- **Standard Sizes**: Round calculated cross-sections to standard cable sizes

### Interactive Canvas
- **Visual Cable Simulation**: Draw cable segments on an interactive canvas
- **Floorplan Support**: Upload and calibrate floorplan images for accurate measurements
- **Real-time Calculations**: Voltage drop updates in real-time as you draw
- **Intuitive Editing**: Select, move, resize, and delete segments with ease
- **Grid Snapping**: Optional grid snapping for precise alignment
- **Zoom & Pan**: Navigate large drawings with smooth zoom and pan controls

### Progressive Web App (PWA)
- **Offline Mode**: Works completely offline after initial visit
- **Asset Caching**: All assets including WASM modules are cached for offline use
- **Service Worker**: Automatic caching strategy with Workbox
- **Installable**: Can be installed as a standalone app on mobile and desktop
- **Auto-updates**: Service worker automatically updates when new versions are available

## 🏗️ Architecture

### Web Worker Implementation

All WASM calculations are executed in a **Web Worker** to ensure the main UI thread remains responsive:

- **Main Thread**: Handles UI rendering, user interactions, and React state management
- **Worker Thread**: Executes all WASM functions (voltage drop, cross-section, power loss, etc.)
- **Communication**: Message-based API between main thread and worker

This architecture ensures that even during heavy calculations, the UI remains smooth and interactive.

### WASM Loading Strategy

- WASM files are **ONLY** loaded in the Web Worker, NOT in the main bundle
- This prevents double download, double compilation, and double memory usage
- WASM is loaded via `importScripts()` in the worker only
- Lazy initialization: Worker and WASM are created on first function call

### PWA & Offline Support

The application uses **Vite PWA Plugin** with Workbox for service worker management:

- **Cache Strategy**: 
  - WASM files: CacheFirst with 1-year expiration
  - JavaScript files: CacheFirst with 30-day expiration
  - Static assets: Automatically cached on first visit
- **Offline Detection**: Visual indicator shows online/offline status
- **Manifest**: Configured for standalone app installation

## 🛠️ Technology Stack

### Frontend
- **React 19** + **TypeScript** - Modern UI framework with type safety
- **Vite** - Fast build tool and dev server
- **TanStack Router** - Type-safe routing
- **Tailwind CSS v4** - Utility-first CSS framework
- **Konva/React-Konva** - 2D canvas library for interactive drawings

### Backend/Computation
- **WebAssembly (WASM)** - Compiled from C code using Emscripten
- **Web Workers** - Off-main-thread computation
- **C/C++** - Core calculation engine

### UI Components
- **@core/ui-headless** - Headless UI component library
- **@hugeicons/react** - Icon library

### PWA
- **vite-plugin-pwa** - PWA plugin for Vite
- **Workbox** - Service worker library

## 📦 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Yarn** (or npm)

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

### Development

The development server runs on `http://localhost:5173` by default.

**Note**: PWA features (service worker) are disabled in development mode to avoid conflicts. They are only active in production builds.

### Building for Production

```bash
yarn build
```

This will:
1. Type-check the codebase
2. Build optimized production bundle
3. Generate service worker and PWA manifest
4. Output to `dist/` directory

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Visit the application in your browser
2. Click the install icon in the address bar
3. Or go to Settings → Install app

### Mobile (iOS Safari)
1. Visit the application
2. Tap the Share button
3. Select "Add to Home Screen"

### Mobile (Android Chrome)
1. Visit the application
2. Tap the menu (three dots)
3. Select "Add to Home Screen" or "Install app"

## 🔧 Project Structure

```
DimensioningUI/
├── src/
│   ├── components/
│   │   ├── Canvas/          # Interactive canvas components
│   │   ├── Homepage/        # Homepage sections
│   │   └── ...              # Other calculation components
│   ├── lib/
│   │   ├── wasm/            # WASM worker and utilities
│   │   └── cable_dimensioning.ts  # Cable engine API
│   ├── routes/              # TanStack Router routes
│   ├── hooks/               # Custom React hooks
│   └── assets/              # Static assets
├── public/
│   ├── wasm/                # WASM files (cable_dimensioning.wasm, .js)
│   └── smartcraft.png       # PWA icon
├── emsdk/                   # Emscripten build scripts
└── vite.config.ts           # Vite configuration with PWA
```

## 🌐 Offline Mode

### How It Works

1. **First Visit (Online)**:
   - Service worker registers and caches all assets
   - WASM files are cached for 1 year
   - Other assets follow their cache strategies

2. **Subsequent Visits (Offline)**:
   - Service worker serves cached assets
   - WASM files load from cache
   - Application functions normally offline
   - Offline indicator shows connection status

### Testing Offline Mode

1. Build the app: `yarn build`
2. Preview: `yarn preview`
3. Open DevTools → Application → Service Workers
4. Check "Offline" in Network tab
5. Refresh the page - app should work offline

## 📚 Key Components

### Canvas (`src/components/Canvas/`)
- **CableCanvas.tsx**: Main canvas component coordinating state and handlers
- **CanvasRenderer.tsx**: Renders Konva elements (segments, grid, floorplan)
- **Toolbar.tsx**: Tool selection and controls
- **SegmentPropertiesPopover.tsx**: Edit segment properties

### WASM Integration (`src/lib/wasm/`)
- **workerManager.ts**: Manages Web Worker lifecycle and communication
- **cableWorker.ts**: Worker script that loads and executes WASM
- **voltageDropChain.ts**: Special handling for chain calculations

### Hooks (`src/hooks/`)
- **useOnlineStatus.ts**: Detects online/offline status
- **useVoltageDrop.ts**: Voltage drop calculations
- **useGrid.ts**: Grid rendering logic
- **useCursor.ts**: Cursor management based on tool state

## 📚 Documentation

Comprehensive documentation is available for developers and contributors:

- **[API Documentation](./docs/API.md)** - Complete reference for the Cable Engine API, including all functions, parameters, return types, and usage examples
- **[Performance Guide](./docs/PERFORMANCE.md)** - Performance optimizations, benchmarks, and best practices
- **[WASM Memory Management](./docs/WASM_MEMORY_MANAGEMENT.md)** - Technical details on WebAssembly memory management and array passing
- **[Contributing Guide](./CONTRIBUTING.md)** - Guidelines for contributing to the project, including code style, workflow, and PR process

## 🧪 Development Notes

### TypeScript Configuration
- Strict type checking enabled
- `noUnusedLocals` and `noUnusedParameters` enabled
- Separate configs for app and node environments

### Code Quality
- **Biome**: Used for linting and formatting
- **TypeScript**: Full type safety
- Code complexity metrics tracked

### Browser Support
- Modern browsers with WebAssembly support
- Service Worker support required for PWA features
- ES2020+ features used

## 📝 Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run linter
- `yarn lint:fix` - Fix linting issues
- `yarn format` - Format code

## 🔍 Troubleshooting

### Service Worker Issues
- Clear browser cache and service workers
- Check DevTools → Application → Service Workers
- Ensure you're testing on production build (`yarn preview`)

### WASM Loading Issues
- Verify WASM files exist in `public/wasm/`
- Check browser console for errors
- Ensure service worker is caching WASM files correctly

### Build Errors
- Run `yarn build` to see full error output
- Check TypeScript errors: `tsc --noEmit`
- Verify all dependencies are installed

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

- Emscripten for WASM compilation
- Workbox for PWA capabilities
- All open-source libraries used in this project
