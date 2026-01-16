# Menu for a Week

Meal planning app with recipe management, auto-generated shopping lists, household sharing, and AI assistance.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI
- **Backend:** Next.js API Routes, Prisma 7, PostgreSQL
- **Auth:** NextAuth 5 (Google OAuth), auto-creates household on first login
- **State:** SWR for client-side caching/mutations
- **AI:** Vercel AI SDK + Anthropic Claude Sonnet 4
- **PWA:** next-pwa with offline caching

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login page (Google OAuth)
│   ├── (dashboard)/      # Protected routes
│   │   ├── dashboard/    # Weekly meal plan view
│   │   ├── calendar/     # Month view
│   │   ├── dishes/       # Dish CRUD
│   │   ├── shopping/     # Shopping list
│   │   ├── chat/         # AI assistant (WIP)
│   │   └── settings/     # Household settings
│   └── api/              # REST API endpoints
├── components/
│   ├── ui/               # Radix UI primitives
│   ├── menu/             # WeeklyView, DayCard, MealSlot
│   ├── dishes/           # DishList, DishCard, DishForm
│   ├── shopping/         # ShoppingList, GenerateDialog
│   └── household/        # MemberList, InviteForm
├── hooks/                # SWR hooks (useMenu, useDishes, useShoppingList, useHousehold)
├── lib/                  # auth.ts, prisma.ts, utils.ts
└── types/                # TypeScript definitions
```

## Database Models

| Model | Purpose |
|-------|---------|
| User/Account/Session | NextAuth (Google OAuth) |
| Household | Family/group unit |
| HouseholdMember | User membership (OWNER/MEMBER roles) |
| Dish | Recipe with name, description, ingredients[], category |
| MenuDay | Daily plan (unique: date + householdId) |
| Meal | Meal assignment (BREAKFAST/LUNCH/DINNER), supports dishId OR customName |
| ShoppingItem | Shopping list item with checked state |
| HouseholdInvite | Pending email invites (7-day expiry) |

**Categories:** breakfast, lunch, dinner, snack, dessert, any

## API Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/dishes` | GET/POST | List/create dishes |
| `/api/dishes/[id]` | GET/PUT/DELETE | Single dish CRUD |
| `/api/menu` | GET/POST | Get date range / set meal |
| `/api/menu/[date]` | GET/DELETE | Single day menu |
| `/api/shopping` | GET/POST | List/add items |
| `/api/shopping/[id]` | PUT/DELETE | Update/remove item |
| `/api/shopping/clear` | POST | Clear checked items |
| `/api/shopping/generate` | POST | Generate from menu (startDate, endDate) |
| `/api/household` | GET/PUT | Household info/rename |
| `/api/household/invite` | POST/GET | Create/list invites |
| `/api/household/invite/accept` | POST | Accept invite (token) |
| `/api/household/invite/pending` | GET | User's pending invites |
| `/api/household/members/[id]` | DELETE | Remove member |
| `/api/chat` | POST | AI streaming + addDish tool |

## Key Features

1. **Weekly Planning** - 7-day grid, assign dishes or type custom meal names for breakfast/lunch/dinner
2. **Dish Library** - CRUD with categories, ingredients, images
3. **Shopping Lists** - Auto-generate from menu, check-off items, clear completed
4. **Household Sharing** - Invite members via email, role-based access (OWNER/MEMBER)
5. **AI Assistant** - Claude-powered meal suggestions with addDish tool
6. **Calendar View** - Month-at-a-glance display
7. **PWA** - Offline support, installable

## Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<secret>
GOOGLE_CLIENT_ID=<id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<secret>
ANTHROPIC_API_KEY=sk-ant-...
```

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Build (includes prisma generate)
npm run start    # Production server
npm run lint     # ESLint
```

## Development Notes

- Auth creates household automatically on first sign-in (user becomes OWNER)
- SWR hooks handle optimistic updates with rollback
- Shopping generation deduplicates ingredients (case-insensitive)
- Meal unique constraint: menuDayId + type (one dish/customName per meal slot)
- Meals can have either a dishId (linked dish) or customName (quick text entry), not both
- Uses Webpack for build (required by next-pwa, not Turbopack)
- Dark mode via next-themes with green theme (#16a34a light, #15803d dark)

## File Locations for Common Tasks

| Task | Files |
|------|-------|
| Add new API endpoint | `src/app/api/` |
| Modify auth | `src/lib/auth.ts` |
| Database schema | `prisma/schema.prisma` |
| Add UI component | `src/components/ui/` |
| New SWR hook | `src/hooks/` |
| Types | `src/types/index.ts` |
| Global styles | `src/app/globals.css` |
| PWA config | `next.config.ts` |
