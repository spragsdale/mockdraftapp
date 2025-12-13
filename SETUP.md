# Setup Guide

## Prerequisites

1. Node.js (v18 or higher)
2. A Supabase account and project

## Installation Steps

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Once your project is ready, go to the SQL Editor
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Run the migration to create all tables, indexes, and RLS policies

3. **Configure environment variables**:
   - Create a `.env` file in the root directory
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - You can find these values in your Supabase project settings under "API"

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   - Navigate to `http://localhost:5173` (or the port shown in terminal)

## First Steps

1. **Create a League**:
   - Go to the Configuration tab
   - Fill in league settings (name, number of teams, roster size)
   - Add positional requirements (C, 1B, 2B, SS, 3B, OF, SP, RP, etc.)
   - Click "Save League Settings"

2. **Import Players**:
   - Go to the Players tab
   - Use the CSV import feature or add players manually
   - CSV format: name, positions (comma-separated), adp, auction_value, tier, team

3. **Create a Draft**:
   - Select your league from the dropdown
   - Click the "+" button to create a new draft
   - Teams will be automatically created

4. **Configure Draft**:
   - Set the draft order
   - Assign keepers if needed
   - Plan your draft strategy

5. **Start Drafting**:
   - Go to the Draft tab
   - Make your picks when it's your turn
   - Other teams will auto-draft based on ADP and positional needs

## Troubleshooting

- **Supabase connection errors**: Make sure your `.env` file has the correct Supabase URL and anon key
- **Database errors**: Ensure you've run the migration SQL file in your Supabase project
- **Import errors**: Check that your CSV file matches the expected format


