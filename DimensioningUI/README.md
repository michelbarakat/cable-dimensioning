# Cable Dimensioning - Web Assembly

A React + TypeScript + Vite application for cable dimensioning calculations using WebAssembly (WASM) compiled from C code.

## Features

- **WebAssembly Performance**: Heavy calculations run in compiled C code via WebAssembly
- **Web Worker Architecture**: All WASM computations execute in a separate Web Worker thread, keeping the UI responsive
- **Real-time Calculations**: Voltage drop, cross-section, power loss, and derating calculations
- **Interactive Canvas**: Visual cable simulation with drag-and-drop segment creation

## Architecture

### Web Worker Implementation

All WASM calculations are executed in a **Web Worker** to ensure the main UI thread remains responsive:

- **Main Thread**: Handles UI rendering, user interactions, and React state management
- **Worker Thread**: Executes all WASM functions (voltage drop, cross-section, power loss, etc.)
- **Communication**: Message-based API between main thread and worker

This architecture ensures that even during heavy calculations, the UI remains smooth and interactive.

For more details, see [Web Worker Documentation](./docs/WEB_WORKER.md).

## Technology Stack

- **React** + **TypeScript** + **Vite**
- **WebAssembly** (compiled from C using Emscripten)
- **Web Workers** for off-main-thread computation
- **Konva** for canvas rendering

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
