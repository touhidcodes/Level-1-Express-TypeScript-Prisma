# Prisma Data Platform (PDP) Connection Guide

This guide shows how to use **Prisma Data Platform (PDP)**, the newly opened managed database service from the creators of Prisma ORM.

## What is Prisma Data Platform?

Prisma Data Platform is a **managed PostgreSQL database service** built specifically for Prisma users:

✅ **PostgreSQL Database** - Fully managed  
✅ **Prisma Studio** - Integrated visual editor  
✅ **Query Insights** - Performance monitoring  
✅ **Team Collaboration** - Built-in for teams  
✅ **Backup & Recovery** - Automatic backups  
✅ **Zero-config** - Works perfectly with Prisma  
✅ **Free Tier** - Great for learning and development  

---

## Why Use Prisma Data Platform?

### Best For:
- Teams using Prisma ORM
- Projects that need query monitoring
- Development with production-like environment
- Learning Prisma best practices

| Feature | Prisma PDP | NeonDB | Supabase | PostgreSQL Local |
|---------|-----------|--------|---------|-----------------|
| PostgreSQL | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Made by | Prisma | Neon | Supabase | N/A |
| Prisma Integration | ⭐⭐⭐ | Good | Good | Good |
| Query Insights | ✅ Yes | Limited | ❌ No | ❌ No |
| Team Features | ✅ Yes | No | No | No |
| Setup | 3 min | 2 min | 3 min | 30 min |
| Cost | Free | Free | Free | Free |

---

## Step 1: Create Prisma Data Platform Account

1. Go to: **https://www.prisma.io/cloud**
2. Click **Sign Up** or **Get Started**
3. Sign up with:
   - GitHub (recommended)
   - Google
   - Email
4. Verify email

---

## Step 2: Create Your First Database

1. On Prisma Cloud dashboard, click **Create New Project**
2. Select **Create a new database**
3. Fill in details:
   - **Project Name:** `ecommerce-api`
   - **Database Name:** `ecommerce_db`
   - **Region:** Choose closest region
   - **Provider:** PostgreSQL
   - **Plan:** Free (perfect for learning)
4. Click **Create Database**
5. Wait for database to be provisioned (1-2 minutes)

---

## Step 3: Get Your Connection String

### From Prisma Cloud Dashboard

1. After database created, you'll see the **Connection String**
2. Copy the full connection string:
   ```
   postgresql://user:password@host.prisma-data-cloud.com:port/database?sslmode=require
   ```
3. The string is displayed in your dashboard
4. You can also find it in **Database Settings**

---

## Step 4: Update .env File

Replace your DATABASE_URL with the Prisma Data Platform connection string:

```env
# Prisma Data Platform PostgreSQL Connection
DATABASE_URL="postgresql://user:password@host.prisma-data-cloud.com:port/database?sslmode=require"
PORT=5000
```

**Example (DO NOT use this):**
```env
DATABASE_URL="postgresql://prisma_user:abc123xyz@db-abc123.prisma-data-cloud.com:5432/ecommerce_db?sslmode=require"
PORT=5000
```

---

## Step 5: Update Prisma Configuration

### 1. Verify schema.prisma

Your `prisma/schema.prisma` should have:

```prisma
datasource db {
  provider = "postgresql"
}
```

### 2. Verify src/lib/prisma.ts

Make sure it looks like:

```typescript
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
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

---

## Step 7: Initialize Database Schema

Create all tables:

```bash
# Generate Prisma client
npx prisma generate

# Create/sync tables (recommended)
npx prisma migrate dev --name init

# Or push without migration
npx prisma db push
```

---

## Step 8: Start Your API

```bash
npm run dev
```

Your API is now using Prisma Data Platform! 🎉

---

## Step 9: Explore Prisma Cloud Features

### 1. View Database in Prisma Studio

In Prisma Cloud dashboard:
1. Click **Prisma Studio** button
2. Visual database editor opens
3. View, edit, create records
4. No need to run `npx prisma studio` locally

### 2. Monitor Query Performance

In Prisma Cloud dashboard:
1. Click **Query Insights**
2. See all database queries
3. Monitor performance
4. Find slow queries
5. Optimize based on metrics

### 3. Manage Team Access

In Prisma Cloud dashboard:
1. Click **Team Settings**
2. Invite team members
3. Set permissions
4. Collaborate on database

### 4. View Database Logs

In Prisma Cloud dashboard:
1. Click **Database Logs**
2. See all queries executed
3. Debug issues
4. Monitor activity

### 5. Manage Backups

In Prisma Cloud dashboard:
1. Click **Backups**
2. See automatic backups
3. Create manual backup
4. Download backup file
5. Restore if needed

---

## Using Local Prisma Studio with PDP

Even though Prisma Cloud has Prisma Studio, you can still use local:

```bash
# Start local Prisma Studio
npx prisma studio
```

This connects to your Prisma Data Platform database but runs locally:
- Better performance
- Custom branding
- Offline capable
- More control

---

## Advanced Features

### 1. Query Insights (Monitoring)

Prisma Data Platform tracks all queries:
- Response time
- Query frequency
- Database load
- Slow query alerts

Help optimize your API!

### 2. Backup & Restore

- **Automatic:** Daily backups
- **Manual:** Create backup anytime
- **Restore:** One-click restore
- **Export:** Download SQL file

### 3. Team Collaboration

- **Invite members:** Share database with team
- **Permissions:** Control who can do what
- **Activity logs:** See who changed what
- **Comments:** Discuss schema changes

### 4. PostgreSQL Extensions

Prisma Data Platform supports PostgreSQL extensions:
- PostGIS (geo data)
- UUID (unique IDs)
- pgvector (AI/ML)
- And more!

---

## Troubleshooting

### Issue 1: "Cannot connect to database"

**Cause:** Wrong connection string.

**Solution:**
1. Go to Prisma Cloud dashboard
2. Click your database
3. Copy fresh connection string
4. Paste into `.env`
5. Restart: `npm run dev`

---

### Issue 2: "Connection timeout"

**Cause:** Database not responding.

**Solution:**
1. Check Prisma Cloud status
2. Verify internet connection
3. Try again in a moment
4. Check firewall settings

---

### Issue 3: "Authentication failed"

**Cause:** Wrong username/password.

**Solution:**
1. Go to Prisma Cloud → Database Settings
2. Reset credentials if needed
3. Update `.env` with new credentials
4. Restart: `npm run dev`

---

### Issue 4: "No tables found"

**Cause:** Schema not migrated.

**Solution:**
```bash
npx prisma migrate dev --name init
```

---

## Monitoring Your Database

### Query Performance

```bash
# View query insights in Prisma Cloud dashboard
# See slow queries and optimize
```

### Database Size

```bash
# Check in Prisma Cloud:
# Database Settings → Storage
```

### Team Activity

```bash
# Check in Prisma Cloud:
# Team Settings → Activity Log
```

---

## Best Practices with Prisma Data Platform

1. **Use Prisma Studio** - Built into Prisma Cloud
2. **Monitor Query Insights** - Optimize slow queries
3. **Enable Backups** - Automatic by default
4. **Use Team Features** - Collaborate effectively
5. **Keep Prisma Updated** - Latest version recommended

---

## Switching from Prisma Data Platform

### To NeonDB
```bash
# 1. Export data (if needed)
pg_dump DATABASE_URL > backup.sql

# 2. Update .env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"

# 3. Migrate
npx prisma migrate dev --name migrate_to_neondb
```

### To Supabase
```bash
# 1. Update .env
DATABASE_URL="postgresql://user:pass@xxx.supabase.co:5432/postgres?sslmode=require"

# 2. Migrate
npx prisma migrate dev --name migrate_to_supabase
```

---

## Useful Commands

```bash
# Validate connection
npx prisma db validate

# View database with Prisma Studio
npx prisma studio

# Create migration
npx prisma migrate dev --name migration_name

# Generate types
npx prisma generate

# Check schema
npx prisma validate

# Reset database
npx prisma migrate reset
```

---

## Free Tier Limits

✅ **What's Included:**
- 1 database
- 1 GB storage
- Unlimited API calls
- Query insights
- Automatic backups
- Team collaboration (limited)

⚠️ **Limitations:**
- 1 project on free tier
- Limited to 10 concurrent connections
- Basic support

---

## Environment Variables

```env
# Prisma Data Platform Connection
DATABASE_URL="postgresql://prisma_user:password@host.prisma-data-cloud.com:5432/database?sslmode=require"

# Additional variables
PORT=5000
NODE_ENV=development
```

---

## Comparison with Other Options

| Aspect | Prisma PDP | NeonDB | Supabase | PostgreSQL Local |
|--------|-----------|--------|---------|-----------------|
| Made by | Prisma | Neon | Supabase | N/A |
| Best for | Prisma users | General | Full app | Local dev |
| Query Monitoring | ⭐⭐⭐ | Limited | Limited | None |
| Team Collaboration | ⭐⭐⭐ | Limited | Good | ❌ |
| Setup | 3 min | 2 min | 3 min | 30 min |
| Free Tier | ✅ | ✅ | ✅ | ✅ |
| SSL | ✅ Required | ✅ Required | ✅ Required | Optional |

---

## Quick Start

1. ✅ Go to https://www.prisma.io/cloud
2. ✅ Sign up with GitHub
3. ✅ Create project
4. ✅ Copy connection string
5. ✅ Update `.env`
6. ✅ Run `npx prisma studio`
7. ✅ Run `npx prisma migrate dev --name init`
8. ✅ Run `npm run dev`
9. ✅ Test with curl or Postman

---

## Resources

- **Prisma Cloud:** https://www.prisma.io/cloud
- **Prisma Docs:** https://www.prisma.io/docs
- **Prisma Studio:** https://www.prisma.io/studio
- **Prisma Community:** https://www.prisma.io/community

---

## Features You Get

✅ Fully managed PostgreSQL database  
✅ Automatic backups and recovery  
✅ Built-in Prisma Studio  
✅ Query performance insights  
✅ Team collaboration tools  
✅ Activity logging  
✅ Zero setup database operations  

---

## Why Prisma Data Platform?

Prisma Data Platform is **built by the creators of Prisma ORM** specifically for developers using Prisma. It integrates seamlessly with:

- ✅ Prisma Client
- ✅ Prisma Migrate
- ✅ Prisma Studio
- ✅ TypeScript types
- ✅ Query monitoring

Perfect match for your tech stack!

---

## Next Steps

1. Create Prisma Data Platform account
2. Create database
3. Get connection string
4. Update `.env`
5. Run `npm run dev`
6. Explore Query Insights
7. Add team members (if collaborating)

Happy coding with Prisma! 🚀

For other database options, see:
- SUPABASE_CONNECTION.md
- NEONDB_CONNECTION.md
- POSTGRESQL_SETUP.md
