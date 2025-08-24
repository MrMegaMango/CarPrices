# CarDeals - Crowdsourced Car Pricing Platform

A modern web application built with Next.js 15 that allows users to share and discover real car deal prices, similar to levels.fyi but for automotive purchases. car-otd.com

## Features

- 🚗 **Browse Car Deals**: Search and filter real car deal prices by make, model, year, and price range
- 💰 **Price Transparency**: View MSRP vs. actual selling prices, out-the-door costs, and savings
- 📊 **Detailed Information**: Including rebates, trade-in values, financing details, and lease information
- 🔍 **Advanced Filtering**: Filter by make, model, year, price range, and sort by various criteria
- 👥 **User Authentication**: Secure login with Google and GitHub OAuth
- 📱 **Responsive Design**: Beautiful, modern UI that works on all devices
- 🔒 **Privacy Focused**: Users control visibility of their deal information

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with OAuth providers
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OAuth credentials (Google/GitHub)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd carprices
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Update `.env.local` with your values:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/carprices?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

4. Set up the database:
```bash
npm run db:push
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment on Vercel

### 1. Database Setup

Set up a PostgreSQL database (recommended: Neon, Supabase, or Railway):

- Create a new PostgreSQL database
- Copy the connection string

### 2. OAuth Setup

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`

**GitHub OAuth:**
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `https://your-domain.vercel.app/api/auth/callback/github`

### 3. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your Vercel app URL)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`

4. Deploy!

### 4. Post-Deployment

After successful deployment:

1. Run database migrations and seed:
```bash
# These commands will run automatically via Vercel build process
# Or run manually if needed
npx prisma generate
npx prisma db push
npx prisma db seed
```

## Database Schema

The application uses the following main entities:

- **Users**: Authentication and user profiles
- **CarMakes**: Car manufacturers (Toyota, Honda, etc.)
- **CarModels**: Car models linked to makes
- **CarDeals**: Main entity storing deal information including:
  - Vehicle details (make, model, year, trim, color)
  - Pricing (MSRP, selling price, OTD price, rebates)
  - Deal details (dealer, location, date)
  - Financing/lease information
  - User notes and verification status

## API Routes

- `GET /api/deals` - Fetch deals with filtering and pagination
- `POST /api/deals` - Create new deal (authenticated)
- `GET /api/makes` - Get all car makes
- `GET /api/models` - Get car models (optionally filtered by make)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue on GitHub.