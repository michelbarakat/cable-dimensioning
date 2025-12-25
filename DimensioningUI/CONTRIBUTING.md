# Contributing Guide

Thank you for your interest in contributing to SmartCraft Sparkline! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Be patient with questions and discussions

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **Yarn** package manager
- **Git** for version control
- Basic knowledge of React, TypeScript, and WebAssembly

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/dimensioning-main.git
   cd dimensioning-main/DimensioningUI
   ```

2. **Install Dependencies**
   ```bash
   yarn install
   ```

3. **Start Development Server**
   ```bash
   yarn dev
   ```

4. **Run Linter**
   ```bash
   yarn lint
   ```

5. **Fix Linting Issues**
   ```bash
   yarn lint:fix
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names:
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(canvas): add floorplan calibration tool
fix(api): handle invalid input in voltage drop calculation
docs(readme): update installation instructions
```

### Code Style

#### TypeScript

- Use TypeScript for all new code
- Enable strict type checking
- Avoid `any` types - use proper types or `unknown`
- Use interfaces for object shapes, types for unions/intersections

#### React

- Use functional components with hooks
- Extract complex logic into custom hooks
- Keep components focused and small
- Use `useCallback` and `useMemo` appropriately

#### File Organization

```
src/
├── components/        # React components
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   ├── ComponentName.helpers.ts
│   │   └── hooks/
│   └── ...
├── hooks/            # Shared custom hooks
├── lib/              # Core libraries and utilities
├── routes/           # TanStack Router routes
└── assets/           # Static assets
```

#### Naming Conventions

- **Components**: PascalCase (`CableCanvas.tsx`)
- **Hooks**: camelCase starting with `use` (`useVoltageDrop.ts`)
- **Utilities**: camelCase (`cable_dimensioning.ts`)
- **Types**: PascalCase (`CableSegment`, `TemperaturePreset`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULTS`, `RANGES`)

### Code Quality

#### Linting

We use **Biome** for linting and formatting:

```bash
# Check for issues
yarn lint

# Auto-fix issues
yarn lint:fix

# Format code
yarn format
```

#### Type Checking

```bash
# Type check without building
tsc --noEmit
```

#### Complexity Guidelines

- Keep functions under 50 lines when possible
- Extract complex logic into helper functions
- Use early returns to reduce nesting
- Keep cyclomatic complexity low

### Testing

**Note**: Currently, the project doesn't have automated tests. When adding tests:

- Write unit tests for utility functions
- Test React components with React Testing Library
- Test WASM functions through the worker API
- Aim for good coverage of critical paths

## Areas for Contribution

### High Priority

1. **Tests**: Add comprehensive test coverage
2. **Documentation**: Improve inline documentation and examples
3. **Error Handling**: Better error messages and recovery
4. **Accessibility**: Improve keyboard navigation and screen reader support
5. **Performance**: Optimize canvas rendering and calculations

### Feature Ideas

- Export/import canvas drawings
- Undo/redo for canvas operations
- Multiple floorplan layers
- Measurement tools
- Print/PDF export
- Dark mode improvements
- Mobile responsiveness

### Bug Fixes

- Check GitHub issues for known bugs
- Test edge cases and boundary conditions
- Verify offline mode functionality
- Test on different browsers

## Pull Request Process

### Before Submitting

1. **Update Documentation**
   - Update README if needed
   - Add/update API documentation
   - Update inline code comments

2. **Test Your Changes**
   - Test in development mode
   - Test production build (`yarn build && yarn preview`)
   - Test offline mode
   - Test on different browsers

3. **Check Code Quality**
   - Run `yarn lint` and fix issues
   - Run `yarn build` to check for TypeScript errors
   - Ensure no console errors or warnings

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Changes tested locally
- [ ] PR description explains changes

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #issue_number
```

### Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged
4. Thank you for contributing! 🎉

## WASM Development

### Building WASM

If you need to modify the C code:

1. Navigate to `emsdk/` directory
2. Follow instructions in `BUILD_INSTRUCTIONS.md`
3. Ensure all exported functions are marked with `EMSCRIPTEN_KEEPALIVE`
4. Test WASM functions thoroughly

### WASM Guidelines

- Keep C code simple and focused
- Document complex calculations
- Use meaningful variable names
- Handle edge cases (division by zero, negative values, etc.)

## Canvas Development

### Konva Guidelines

- Use `react-konva` components when possible
- Minimize re-renders with proper React patterns
- Use `listening={false}` for non-interactive elements
- Optimize for performance with large numbers of segments

### Coordinate Systems

- **Logical Coordinates**: Where segments are stored (meters)
- **Stage Coordinates**: After applying scale factor
- **Container Coordinates**: Screen/container pixels

Be careful when converting between coordinate systems, especially with zoom/pan.

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Check existing documentation first

Thank you for contributing! 🚀
