# Supabase Connection Guide for Prisma

This guide shows how to connect your e-commerce API to **Supabase**, a open-source Firebase alternative with built-in PostgreSQL database.

## What is Supabase?

Supabase is a **Backend-as-a-Service (BaaS) platform** that provides:

✅ **PostgreSQL Database** - Powerful relational database  
✅ **Real-time Subscriptions** - Live data updates  
✅ **Authentication** - Built-in user management  
✅ **Storage** - File uploads and management  
✅ **Edge Functions** - Serverless functions  
✅ **Vector Search** - AI/ML capabilities  
✅ **Free Tier** - Generous free plan for learning  

---

## Why Use Supabase?

| Feature | Supabase | NeonDB | Traditional PostgreSQL |
|---------|----------|--------|----------------------|
| PostgreSQL | ✅ Yes | ✅ Yes | ✅ Yes |
| Real-time | ✅ Yes | ❌ No | ❌ No |
| Authentication | ✅ Built-in | ❌ No | ❌ No |
| File Storage | ✅ Yes | ❌ No | ❌ No |
| Setup Time | 3 min | 2 min | 30 min |
| Cost | Free | Free | Free |
| Learning | Great | Good | Good |

---

## Step 1: Create Supabase Account

1. Go to: **https://supabase.com**
2. Click **Start Your Project** or **Sign Up**
3. Create account with:
   - GitHub (recommended)
   - Google
   - Email
4. Verify email (if needed)

---

## Step 2: Create Your First Project

1. On dashboard, click **New Project**
2. Fill in details:
   - **Project Name:** `ecommerce-api` (or any name)
   - **Database Password:** Create strong password (save it!)
   - **Region:** Choose closest to you (e.g., us-east-1)
   - **Pricing Plan:** Free (perfect for learning)
3. Click **Create New Project**
4. Wait for database to initialize (2-3 minutes)

---

## Step 3: Get Your Connection String

### Method 1: From Connection Pooler (Recommended for Prisma)

1. Go to **Settings** (bottom left)
2. Click **Database**
3. Look for **Connection String** section
4. Find **Connection Pooler** tab
5. Select **Nodejs** from dropdown
6. You'll see something like:
   ```
   postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
7. **Replace [PASSWORD] with your database password** (from project creation)
8. Copy the connection string

### Method 2: From Direct Connection

1. Same steps but select **Direct Connection** tab
2. Connection string format:
   ```
   postgresql://postgres:[PASSWORD]@aws-0-us-east-1.db.supabase.co:5432/postgres?sslmode=require
   ```

**Important:** Use Connection Pooler for better performance with Prisma!

---

## Step 4: Update .env File

```env
# Supabase PostgreSQL Connection
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
PORT=5000
```

**Example (DO NOT use this):**
```env
DATABASE_URL="postgresql://postgres.abcd1234:mypassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
PORT=5000
```

---

## Step 5: Update Prisma Configuration

### 1. Update schema.prisma

Your `prisma/schema.prisma` should have:

```prisma
datasource db {
  provider = "postgresql"
}
```

### 2. Update src/lib/prisma.ts

Make sure it looks like this:

```typescript
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env file");
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default prisma;
```

---

## Step 6: Test Connection

### Option A: Using Prisma Studio (Easiest)

```bash
npx prisma studio
```

If it opens at http://localhost:5555, your connection works! ✅

### Option B: Using Prisma Command

```bash
npx prisma db validate
```

Should show: **✓ Connection successful**

### Option C: Manual Test

```bash
npx prisma generate
```

Then run:
```bash
npm run dev
```

Check for connection errors in console.

---

## Step 7: Initialize Database Schema

Create all tables in Supabase:

```bash
# Generate Prisma client
npx prisma generate

# Create/sync tables
npx prisma migrate dev --name init

# Or use db push (no migration file)
npx prisma db push
```

---

## Step 8: Start Your API

```bash
npm run dev
```

Your API is now using Supabase! 🎉

---

## Step 9: View Data in Supabase

1. Go to Supabase dashboard
2. Click **Table Editor** (left sidebar)
3. You should see tables:
   - `users`
   - `products`
   - `categories`
   - `cart_items`
   - `orders`
   - `order_items`
4. Click any table to view/edit data

---

## Troubleshooting

### Issue 1: "Cannot connect to database"

**Cause:** Wrong connection string or password.

**Solution:**
1. Go to Supabase → Settings → Database
2. Copy fresh connection string from **Connection Pooler**
3. Replace [PASSWORD] with your actual password
4. Paste into `.env`
5. Restart: `npm run dev`

---

### Issue 2: "SSL connection error"

**Cause:** Missing SSL settings in connection string.

**Solution:**
Ensure connection string ends with `?sslmode=require`:
```
...pooler.supabase.com:6543/postgres?sslmode=require
```

---

### Issue 3: "Authentication failed"

**Cause:** Wrong password.

**Solution:**
1. The password must be **exactly** what you set during project creation
2. If forgotten, reset at: Settings → Database → Reset Database Password
3. Update `.env` with new password
4. Restart: `npm run dev`

---

### Issue 4: "Connection timeout"

**Cause:** Network/firewall issue or Supabase being slow.

**Solution:**
1. Check internet connection
2. Try direct connection instead of pooler:
   - Settings → Database → Direct Connection
   - Use the direct URL in `.env`
3. Wait a minute and try again
4. Check Supabase status: https://status.supabase.com

---

### Issue 5: "No tables found"

**Cause:** Schema not migrated.

**Solution:**
```bash
npx prisma migrate dev --name init
```

Then refresh Supabase Table Editor.

---

## Using Supabase Features

### 1. View Database in Supabase UI

**Table Editor:**
- Navigate: Supabase Dashboard → Table Editor
- See all tables and data
- Edit directly in web interface
- Export data as CSV/JSON

### 2. Run SQL Queries

**SQL Editor:**
- Navigate: Supabase Dashboard → SQL Editor
- Write custom SQL queries
- Example:
  ```sql
  SELECT * FROM users;
  SELECT COUNT(*) FROM products;
  ```

### 3. Create Backups

**Backups:**
- Navigate: Settings → Backups
- See automatic backups
- Create manual backup
- Download backup files

### 4. Manage Users

**Authentication:**
- Navigate: Authentication → Users
- View registered users
- Manage auth settings
- View login history

### 5. Upload Files (Optional)

**Storage:**
- Navigate: Storage
- Create buckets
- Upload files
- Generate public URLs

---

## Connection Pooler vs Direct Connection

### Connection Pooler (Recommended for Prisma)
```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**Benefits:**
- ✅ Better performance
- ✅ Handles many connections
- ✅ Recommended for serverless
- ✅ Works best with Prisma

**Use when:** Production, many concurrent connections

### Direct Connection
```
postgresql://postgres:[PASSWORD]@aws-0-us-east-1.db.supabase.co:5432/postgres?sslmode=require
```

**Benefits:**
- ✅ Direct database access
- ✅ Lower latency
- ✅ Full PostgreSQL features

**Use when:** Development, need raw PostgreSQL access

---

## Real-time Subscriptions (Advanced)

Supabase supports real-time data updates. Example:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xxxxx.supabase.co',
  'your-anon-key'
)

// Listen for changes
const subscription = supabase
  .from('users')
  .on('*', (payload) => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

This requires additional Supabase client library setup (beyond this guide).

---

## Authentication Setup (Optional)

Supabase has built-in authentication:

1. Go to: Authentication → Providers
2. Enable auth method (Email, Google, GitHub, etc.)
3. Configure settings
4. Use Supabase Auth in your API

(Detailed auth setup is outside this guide scope)

---

## Free Tier Limits

✅ **What's Included:**
- 500 MB database size
- 2 GB bandwidth
- 2 concurrent connections
- Unlimited API calls
- Authentication
- 100 MB file storage
- Automatic daily backups

⚠️ **Limitations:**
- Projects paused after 1 week of inactivity
- 1 project on free tier
- Limited to 100 concurrent connections

---

## Switching from Supabase to Other Databases

### To NeonDB
```bash
# 1. Export data from Supabase (if needed)
pg_dump postgres://user:pass@supabase.co/postgres > backup.sql

# 2. Update .env with NeonDB URL
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"

# 3. Migrate
npx prisma migrate dev --name migrate_to_neondb
```

### To Local PostgreSQL
```bash
# 1. Update .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db"

# 2. Migrate
npx prisma migrate dev --name migrate_to_local
```

---

## Performance Tips

1. **Use Connection Pooler** - Better performance
2. **Monitor Logs** - Supabase Dashboard → Logs
3. **Use Indexes** - Prisma handles automatically
4. **Cache Queries** - Use Redis for frequently accessed data
5. **Monitor Connections** - Settings → Database → Connection info

---

## Security Best Practices

1. **Keep password secret** - Never commit `.env`
2. **Use Row-Level Security (RLS)** - Control data access
3. **Enable SSL** - Always use `sslmode=require`
4. **Rotate password** - Change monthly
5. **Monitor activity** - Check Supabase logs

---

## Useful Commands

```bash
# Connect to database directly (if needed)
psql "postgresql://postgres:password@host:port/postgres"

# Export data
pg_dump DATABASE_URL > backup.sql

# Validate Prisma schema
npx prisma validate

# Generate Prisma types
npx prisma generate

# View database UI
npx prisma studio
```

---

## Environment Variable Reference

```env
# Supabase Connection
DATABASE_URL="postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?sslmode=require"

# Or direct connection
DATABASE_URL="postgresql://postgres:PASSWORD@aws-0-REGION.db.supabase.co:5432/postgres?sslmode=require"

# Other variables
PORT=5000
NODE_ENV=development
```

---

## Quick Start Steps

1. ✅ Create Supabase account (https://supabase.com)
2. ✅ Create project with PostgreSQL
3. ✅ Get connection string from Connection Pooler tab
4. ✅ Replace [PASSWORD] with your database password
5. ✅ Update `.env` file
6. ✅ Run `npx prisma studio` to test
7. ✅ Run `npx prisma migrate dev --name init`
8. ✅ Run `npm run dev`
9. ✅ Test endpoints with curl or Postman

---

## Comparison: Supabase vs Others

| Feature | Supabase | NeonDB | PostgreSQL Local | SQLite |
|---------|----------|--------|------------------|--------|
| PostgreSQL | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Real-time | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Auth | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Storage | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Setup | 3 min | 2 min | 30 min | 1 min |
| Cost | Free | Free | Free | Free |
| Learning | Excellent | Good | Good | Very Good |
| **Best for** | Full app | Database | Dev/Prod | Testing |

---

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Dashboard:** https://app.supabase.com
- **Prisma Docs:** https://www.prisma.io/docs
- **PostgreSQL Connection:** https://www.postgresql.org/docs/current/libpq-connect.html

---

## Getting Help

- **Supabase Support:** https://supabase.com/support
- **Supabase Discord:** https://discord.supabase.io
- **Prisma Community:** https://www.prisma.io/community
- **Stack Overflow:** Tag `supabase` and `prisma`

---

## Next Steps

1. Create Supabase project
2. Get connection string
3. Update `.env`
4. Run `npm run dev`
5. Test API endpoints
6. Explore Supabase features (auth, storage, etc.)

Happy coding! 🚀

For other database options, see:
- NEONDB_CONNECTION.md
- POSTGRESQL_SETUP.md
- DATABASE_SWITCHING.md
