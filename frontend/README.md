# Chronos Frontend

React TypeScript application for the Chronos job scheduling platform.

## 🚀 Tech Stack

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool and dev server
- **CSS Variables** - Custom design system

## 📁 Project Structure

```
src/
├── components/      # Reusable UI components
│   ├── common/      # Shared components (buttons, inputs, etc.)
│   ├── layout/      # Layout components (navbar, sidebar, etc.)
│   └── features/    # Feature-specific components
├── pages/           # Page-level components (routes)
├── services/        # API service functions
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── utils/           # Helper functions and utilities
├── assets/          # Static assets (images, icons, etc.)
├── App.tsx          # Root component
├── main.tsx         # Application entry point
└── index.css        # Global styles and CSS variables
```

## 🎨 Design System

The application uses CSS custom properties for consistent styling:

### Colors
- Primary: `--primary-color` (#4f46e5)
- Success: `--success-color` (#10b981)
- Error: `--error-color` (#ef4444)
- Warning: `--warning-color` (#f59e0b)

### Spacing
- XS: `--spacing-xs` (0.25rem)
- SM: `--spacing-sm` (0.5rem)
- MD: `--spacing-md` (1rem)
- LG: `--spacing-lg` (1.5rem)
- XL: `--spacing-xl` (2rem)

### Typography
- SM: `--font-size-sm` (0.875rem)
- Base: `--font-size-base` (1rem)
- LG: `--font-size-lg` (1.125rem)
- XL: `--font-size-xl` (1.25rem)
- 2XL: `--font-size-2xl` (1.5rem)

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📝 Next Steps

1. Set up routing (React Router)
2. Configure API client (Axios)
3. Implement authentication
4. Build core components
5. Create page layouts

## 🔗 Backend Integration

The frontend connects to the Chronos backend API running on:
- Development: `http://localhost:3000`
- Production: TBD

## 📦 Required Dependencies

The following packages need to be installed:

```bash
# Routing
npm install react-router-dom

# HTTP Client
npm install axios

# State Management (if needed)
npm install zustand
# or
npm install @tanstack/react-query

# Form Handling
npm install react-hook-form

# Date/Time utilities
npm install date-fns
```
