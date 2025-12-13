# Fantasy Baseball Mock Draft App

A comprehensive fantasy baseball mock draft application for practicing drafts solo. Configure league settings, manage players, plan your draft strategy, and execute mock drafts with AI-powered auto-drafting for other teams.

## Features

- **League Configuration**: Set up positional requirements, number of teams, and roster sizes
- **Player Management**: Import players via CSV, manage ADP and auction values, organize players into tiers
- **Draft Planning**: Pre-assign positions to upcoming draft slots
- **Mock Draft Execution**: Interactive draft interface with:
  - Real-time draft board
  - Auto-draft for other teams based on ADP and positional needs
  - Draft pool view grouped by position and sorted by tiers
  - Team roster views
  - Draft history

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **State Management**: React Hooks + Zustand

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Create a new Supabase project
   - Run the migration file in `supabase/migrations/001_initial_schema.sql`
   - Copy `.env.example` to `.env` and fill in your Supabase credentials

3. **Start development server**:
   ```bash
   npm run dev
   ```

## Database Setup

The app uses Supabase (PostgreSQL) for data persistence. Run the migration SQL file in your Supabase SQL editor to create all necessary tables, indexes, and RLS policies.

## Usage

1. **Configure League**: Set up your league's positional requirements and settings
2. **Import Players**: Import player data via CSV or add manually
3. **Set Tiers**: Organize players into tiers for better draft planning
4. **Create Draft**: Create a new draft session
5. **Set Draft Order**: Configure the order teams will draft
6. **Assign Keepers**: Set keepers for teams before the draft
7. **Plan Draft**: Pre-assign positions to upcoming picks
8. **Execute Draft**: Run the mock draft with auto-drafting for other teams

## CSV Import Format

Player CSV files should have the following columns:
- `name` or `player`: Player name
- `positions` or `position`: Comma-separated list of positions (e.g., "1B,2B")
- `adp`: Average Draft Position (numeric)
- `auction_value` or `value`: Auction dollar value (numeric)
- `tier`: Tier number (integer)
- `team`: Player's MLB team (optional)

## License

MIT
