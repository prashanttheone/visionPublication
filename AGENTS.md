## Project Summary
Vision Publications is an e-commerce platform specializing in healthcare and nursing books (ANM, GNM, Post Basic BSc Nursing). It includes an admin panel for managing books, courses, e-resources, and orders.

## Tech Stack
- **Frontend**: Next.js (App Router), Ant Design, Tailwind CSS
- **Backend**: Next.js API Routes, PostgreSQL (Supabase)
- **Authentication**: Custom auth with JWT and Supabase
- **Payments**: Razorpay
- **Image Hosting**: Cloudinary

## Architecture
- **Admin Components**: Located in `component/adminComponet/`. Complex components are refactored into smaller files within a `feat/` sub-directory.
- **Database**: Schema managed through migrations in `migrations/`. Compatibility views (e.g., `semesters`) ensure legacy code stability.

## User Preferences
- **Theme**: Pure Black Theme (#000000) for the entire application, especially the Admin Panel.
- **UI Framework**: Ant Design (AntD) is the preferred UI library.
- **Removed Frameworks**: Chakra UI and Framer Motion have been removed to reduce bundle size and maintain a consistent AntD look.
- **Aesthetics**: Clean, dark-mode focused UI with professional AntD components.

## Project Guidelines
- **No Comments**: Avoid adding code comments unless explicitly requested.
- **Component Refactoring**: Large single-file components should be broken down into smaller files in a `feat/` directory.
- **Filtering**: Filters should be dynamic and context-aware (e.g., showing "Semester" or "Year" labels based on the selected course).
- **Database Safety**: Always explore database schema before writing migrations or SQL. Use compatibility views for schema changes.

## Common Patterns
- **Fetch with Auth**: Use `authUtils.fetchWithAuth` for all authenticated API calls.
- **AntD Forms**: Use Ant Design `Form` with `useForm` hook for all data entry.
- **Image Uploads**: Use the `CloudinaryImageUpload` component for all image uploads.
