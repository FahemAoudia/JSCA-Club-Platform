# JSCA — Dashboard (Vercel Postgres)

## Prérequis
- Node.js >= 18.17
- Un mot de passe admin (variable `ADMIN_PASSWORD`)
- Une base Vercel Postgres (variable `POSTGRES_URL`)

## Variables d’environnement
Créer un fichier `.env` (ou configurer sur Vercel):

```bash
ADMIN_PASSWORD=...
POSTGRES_URL=postgresql://...
```

> En production Vercel: `POSTGRES_URL` est fourni par l’intégration **Vercel Postgres**.

## Installation

```bash
npm install
```

## Prisma (migrations)

Générer le client Prisma:

```bash
npx prisma generate
```

Créer les tables (au choix):

- **Migrations** (recommandé):

```bash
npx prisma migrate dev --name init
```

- **DB push** (prototype):

```bash
npx prisma db push
```

## Migration des seeds (1 fois)

Après avoir une DB prête, importer les données de démo:

```bash
curl -X POST http://localhost:3000/api/admin/migrate-seeds
```

> La route est protégée par la session admin (`/dashboard/login`).

## Smoke test
- Se connecter: `/dashboard/login`
- Appeler la migration seeds
- Ajouter un sportif / séance / abonnement
- Rafraîchir la page et se reconnecter: les données doivent rester

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
