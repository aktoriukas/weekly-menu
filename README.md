# Menu for a Week

A modern meal planning application that helps you organize your weekly meals, manage recipes, and automatically generate shopping lists.

## Features

- **Weekly Meal Planning** - Plan breakfast, lunch, and dinner for the entire week with an intuitive calendar view
- **Recipe Management** - Build your personal recipe library with ingredients, descriptions, and categories
- **Smart Shopping Lists** - Automatically generate shopping lists from your weekly menu
- **Family Sharing** - Share meal plans with your household and collaborate on planning
- **AI Assistant** - Get personalized meal suggestions powered by Claude AI
- **Mobile Responsive** - Full mobile support with a responsive design

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Database**: PostgreSQL with [Prisma](https://www.prisma.io/) ORM
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) with Google OAuth
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) with Tailwind CSS
- **AI Integration**: [Anthropic Claude](https://www.anthropic.com/) via AI SDK
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **State Management**: [SWR](https://swr.vercel.app/) for data fetching

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials (for authentication)
- Anthropic API key (for AI features)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/menuforaweek?schema=public"

# NextAuth
AUTH_SECRET="your-auth-secret-generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Anthropic AI (for AI chat features)
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application"
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
7. Copy the Client ID and Client Secret

## Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/menu-for-a-week.git
   cd menu-for-a-week
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Management

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login)
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── calendar/      # Calendar view
│   │   ├── chat/          # AI chat interface
│   │   ├── dashboard/     # Weekly menu view
│   │   ├── dishes/        # Recipe management
│   │   ├── settings/      # User settings
│   │   └── shopping/      # Shopping list
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── dishes/           # Dish-related components
│   ├── menu/             # Menu-related components
│   ├── calendar/         # Calendar components
│   ├── shopping/         # Shopping list components
│   ├── chat/             # AI chat components
│   └── household/        # Household management
├── lib/                  # Utility functions and configurations
└── middleware.ts         # Auth middleware
```

## Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   Add all environment variables from your `.env` file in Vercel's project settings

4. **Configure Database**
   - Use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or any PostgreSQL provider
   - Update `DATABASE_URL` in Vercel environment variables

5. **Deploy**
   Vercel will automatically deploy on push to main branch

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/*` | Various | NextAuth.js authentication endpoints |
| `/api/dishes` | GET, POST | List and create dishes |
| `/api/dishes/[id]` | GET, PUT, DELETE | Manage individual dishes |
| `/api/menu` | GET, POST | Get and update weekly menu |
| `/api/shopping` | GET, POST | Manage shopping list |
| `/api/shopping/generate` | POST | Generate list from menu |
| `/api/household/invite` | POST | Send household invites |
| `/api/household/members` | GET, DELETE | Manage household members |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
