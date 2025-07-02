# Inventory App

A modern inventory management system built with **Next.js**, **Prisma**, **Clerk** authentication, and **React Query** for real-time data fetching.

## ✨ Features

- **Authentication**: Secure login & register with Clerk
- **Dashboard**: Real-time analytics, recent transactions, and stock summary
- **Items Management**: Add, edit, delete, and view inventory items
- **Stock In/Out**: Record incoming and outgoing stock with transaction history
- **Categories**: Organize items by category
- **Low Stock Alerts**: Get notified when stock is below minimum
- **History**: View all stock movements
- **Responsive UI**: Built with Tailwind CSS and modern UI components

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd inventory-app
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your database and Clerk credentials.

### 4. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/)
- [Prisma ORM](https://www.prisma.io/)
- [Clerk Auth](https://clerk.com/)
- [React Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)

## 📦 Project Structure

```
src/
  app/           # Next.js app directory (pages, API routes)
  components/    # Reusable UI components
  hooks/         # Custom React hooks (React Query, etc)
  contexts/      # React context providers
  lib/           # Utility libraries (prisma, supabase, etc)
  prisma/        # Prisma schema and migrations
```

## 📝 Customization

- Update `prisma/schema.prisma` to change your data model.
- Use [Prisma Studio](https://www.prisma.io/studio) to view and edit your database:
  ```bash
  npx prisma studio
  ```

## 📄 License

MIT

---

**Note:**

- Make sure your database is running and credentials are correct in `.env`.
- For Clerk setup, see [Clerk Docs](https://clerk.com/docs/quickstarts/nextjs).
