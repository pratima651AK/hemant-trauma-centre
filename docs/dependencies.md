# Project Dependencies: Hemant Trauma Centre

This document lists the core libraries and tools used in the development of the Hemant Trauma Centre website.

## Production Dependencies
- **Next.js (v16.1.1)**: React framework with Turbopack for high-performance server-side rendering and static generation.
- **React (v19.2.3)**: Core library for building the user interface.
- **React-DOM (v19.2.3)**: Entry point to the DOM and server renderers for React.
- **Lucide-React (v0.378.0)**: Modern, clean, and flexible icon library used for theme toggles, footer icons, and the WhatsApp button.
- **Nodemailer**: Email sending library for administrative alerts and patient receipts (currently implemented as a disabled module).

## Development Dependencies
- **TypeScript (v5.x)**: Static type checking for robust and maintainable code.
- **Tailwind CSS (v3.4.1)**: Utility-first CSS framework for modern, responsive styling.
- **PostCSS & Autoprefixer**: CSS transformation tools for browser compatibility.
- **ESLint**: Linting tool configured with `eslint-config-next` to maintain code quality.
- **@types/node, @types/react, @types/react-dom**: TypeScript type definitions for environment and core libraries.

## Key Features Enabled by Dependencies
- **Turbopack**: Ultra-fast build and development cycles.
- **Next/Image**: Automatic image optimization for the Hero slider (lazy loading, responsive sizes).
- **Next/Font**: Optimized Google Fonts integration (Outfit).



Get-Process -Name "postgresql-17.7-2-windows-x64" -ErrorAction SilentlyContinue
