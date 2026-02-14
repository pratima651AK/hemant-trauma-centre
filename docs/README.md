# Hemant Trauma Centre Website

A premium, high-performance website for **Hemant Trauma and Sport Injury Centre**. Built with Next.js 16, TypeScript, and Tailwind CSS, featuring a bilingual interface, dynamic hero slider, and robust appointment booking.

## 🚀 Technology Stack
- **Framework**: Next.js 16.1.1 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Engine**: Turbopack

## ✨ Key Features
- **Bilingual Support**: Full English and Hindi support with instant toggle.
- **Dynamic Hero Slider**: High-definition medical-themed slider with optimized image delivery.
- **Premium UI**: 
  - Light theme by default with a high-end Dark mode toggle.
  - Sticky WhatsApp integration with pulse animation.
  - Thick, distinguishable form borders for accessibility.
- **Appointment Form**: 2-step booking process with strict numeric and character limit validations.
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile viewports.
- **Turnstile Security**: Cloudflare Turnstile integration on Step 2 of the booking form to prevent spam.
- **Admin Power Tools**: 
  - **Secret Delete Mode**: Long-press logo trigger to enable soft-deletion of test records.
  - **One-Click Archival**: Move soft-deleted records to a separate archive table to maintain database performance.
- **Hydration Optimized**: Clean server-to-client transitions with zero console errors.

## 📦 Core Dependencies
*Summary of production libraries. For a full list, see [dependencies.md](./dependencies.md).*
- `next`: ^16.1.1
- `react`: ^19.2.3
- `lucide-react`: ^0.378.0
- `tailwindcss`: ^3.4.1

## 🛠️ Getting Started

1.  **Clone the repository**:
    ```bash
    git clone [repository-url]
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```
4.  **Build for production**:
    ```bash
    npm run build
    ```

## 📝 Documentation
- [Phase 1 & 2 Plan](./plan.md)
- [Delivery Walkthrough](./walkthrough.md)
- [Detailed Design Audit](./docs/implementation_plan.md)
- [Technical Dependencies](./dependencies.md)

---
© 2026 Hemant Trauma and Sport Injury Centre. All rights reserved.
