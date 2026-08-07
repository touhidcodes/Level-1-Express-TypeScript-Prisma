# NeonDB Connection Guide for Prisma

This guide shows how to use **NeonDB** as a cloud database for your e-commerce API. NeonDB is perfect for learning because it's free, requires no setup, and works anywhere.

## What is NeonDB?

NeonDB is a **serverless PostgreSQL database** hosted in the cloud. Benefits:

✅ **Free tier** - Generous free plan for learning  
✅ **No installation** - Database runs in the cloud  
✅ **Automatic backups** - Data is safe  
✅ **Accessible anywhere** - Connect from any device/computer  
✅ **Works with Prisma** - Perfect for Prisma ORM  
✅ **Easy to share** - Share connection string with team  

---

## Step 1: Create NeonDB Account

1. Go to: **https://neon.tech**
2. Click **Sign Up** (or sign in with GitHub)
3. Create an account with your email
4. Verify your email address
5. You'll be redirected to the dashboard

---

## Step 2: Create Your First Project

1. Click **Create Project** button
2. Fill in:
   - **Project Name:** `ecommerce-api` (or any name)
   - **Database Name:** `ecommerce_db` (optional)
   - **PostgreSQL Version:** Select latest (e.g., 15)
3. Click **Create Project**
4. NeonDB will create your database (takes ~10 seconds)

---

## Step 3: Get Your Connection String

### Option A: Direct from Dashboard

1. After project is created, click on your project
2. In the left sidebar, click **Connection string**
3. Select **Nodejs** from the dropdown
4. You'll see something like:
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-1.aws.neon.tech/ecommerce_db?sslmode=require
   ```
5. Click the copy icon to copy it

### Option B: From Quick Connect

1. On the dashboard, look for **Quick start**
2. Select your database name from dropdown
3. Select **Nodejs** as connection type
4. Copy the connection string

---

## Step 4: Update Your .env File

Replace your DATABASE_URL with the NeonDB connection string:

```env
# NeonDB PostgreSQL Database Connection
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.us-east-1.aws.neon.tech/ecommerce_db?sslmode=require"
PORT=5000
```

**Example (DO NOT use this):**
```env
DATABASE_URL="postgresql://neondb_owner:abcd1234@ep-cool-lab-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
PORT=5000
```

---

## Step 5: Test the Connection

### Option A: Using Prisma Studio

```bash
npx prisma studio
```

This opens a visual database explorer at `http://localhost:5555`. If it opens successfully, your connection works!

### Option B: Using Prisma Command

```bash
npx prisma db push
```

This syncs your schema to NeonDB. If it succeeds, connection is working.

### Option C: Manual Test

```bash
npm install pg

node -e "
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect((err) => {
  if (err) console.error('Connection failed:', err);
  else console.log('✅ Connected to NeonDB!');
  process.exit();
});
"
```

---

## Step 6: Initialize Database with Schema

Create all tables in NeonDB:

```bash
npx prisma migrate dev --name init
```

This will:
- Create all tables in NeonDB
- Generate migration files
- Push schema to cloud database

---

## Step 7: Start Your API

```bash
npm run dev
```

Your API is now using NeonDB! 🎉

---

## Common Issues & Solutions

### Issue 1: "Cannot connect to database"

**Cause:** Connection string is incorrect or copied wrong.

**Solution:**
1. Go to NeonDB dashboard
2. Click your project
3. Click **Connection string**
4. Select **Nodejs**
5. Copy again carefully (don't miss any part)
6. Paste into `.env`
7. Restart server: `npm run dev`

---

### Issue 2: "SSL connection error"

**Cause:** Missing `?sslmode=require` in connection string.

**Solution:**
Your connection string MUST end with `?sslmode=require`:
```
...neon.tech/ecommerce_db?sslmode=require
```

If it's missing, add it manually to your `.env`:
```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/ecommerce_db?sslmode=require"
```

---

### Issue 3: "Authentication failed for user"

**Cause:** Username or password is wrong.

**Solution:**
1. Get a fresh connection string from NeonDB
2. NeonDB generates a random password - use exactly as shown
3. Don't modify the username/password

---

### Issue 4: "Connection timeout"

**Cause:** NeonDB database is suspended (free tier feature).

**Solution:**
1. Go to NeonDB dashboard
2. Click your project
3. Your database might show as "Suspended"
4. Click **Resume** to wake it up
5. Try connecting again

---

### Issue 5: "ENOTFOUND ep-xxx.us-east-1.aws.neon.tech"

**Cause:** Internet connection problem or region issue.

**Solution:**
1. Check your internet connection
2. Try pinging the server:
   ```bash
   nslookup ep-xxx.us-east-1.aws.neon.tech
   ```
3. Clear DNS cache (Windows):
   ```powershell
   ipconfig /flushdns
   ```

---

## Using Prisma Studio with NeonDB

Prisma Studio lets you view and edit data in a visual interface:

```bash
npx prisma studio
```

Then:
1. Click **Users** table to see all users
2. Click **+ Create** to add new records
3. Click any record to edit
4. Changes are saved to NeonDB immediately

This is great for learning and testing!

---

## Useful NeonDB Dashboard Features

### 1. View Connection Details
- Click your project
- See all connection strings
- Supports different languages (Python, Node.js, etc.)

### 2. Monitor Database
- See storage usage
- View connection count
- Monitor performance

### 3. Manage Users & Roles
- Create database users
- Set permissions
- Reset passwords

### 4. Branch Database
- Create temporary branches for testing
- Test changes without affecting main database
- Merge back when ready

### 5. Backup & Restore
- Automatic daily backups
- Manual backup on demand
- One-click restore if needed

---

## NeonDB Free Tier Limits

✅ **What's Included:**
- 1 project
- 3 GB storage
- Unlimited connections
- Automatic daily backups
- Up to 100 branch creations per month

⚠️ **Limitations:**
- Database sleeps after 5 minutes of inactivity (on free tier)
- Wakes up automatically when you connect
- Takes 5-10 seconds to wake up

---

## Comparison: NeonDB vs Local PostgreSQL vs SQLite

| Feature | NeonDB | Local PostgreSQL | SQLite |
|---------|--------|-----------------|--------|
| Setup Time | 2 minutes | 30 minutes | 1 minute |
| Cost | Free | Free | Free |
| Cloud Access | ✅ Yes | ❌ No | ❌ No |
| Performance | Fast | Very Fast | Good |
| Scalability | Great | Good | Limited |
| Learning | Perfect | Good | Good |
| Sharing DB | ✅ Easy | Hard | Hard |
| Backups | Automatic | Manual | Manual |

---

## Environment Variables Examples

### Using NeonDB
```env
DATABASE_URL="postgresql://user:pass@ep-cool-lab-123.us-east-1.aws.neon.tech/ecommerce_db?sslmode=require"
```

### Using Local PostgreSQL
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db"
```

### Using SQLite
```env
DATABASE_URL="file:./prisma/dev.db"
```

---

## Troubleshooting Connection String

Your connection string has this format:
```
postgresql://[username]:[password]@[host]:[port]/[database]?[options]
```

**Example breakdown:**
```
postgresql://neondb_owner:abcd1234@ep-cool-lab-123.us-east-1.aws.neon.tech/neondb?sslmode=require
           |                |       |                                        |      |
           |                |       |                                        |      options
           |                |       |                                        database
           |                |       host
           |                password
           username
```

---

## Pro Tips for Learning

1. **Use Prisma Studio to explore data:**
   ```bash
   npx prisma studio
   ```

2. **Keep your connection string secret:**
   - Never commit `.env` to GitHub
   - Use `.gitignore` (already set up)
   - For team projects, share .env.example instead

3. **Share database with teammates:**
   - Get your NeonDB connection string
   - Share it (password included) securely
   - Teammates paste into their `.env`
   - Everyone uses the same database

4. **Test API calls with Postman:**
   - Use Postman to test endpoints
   - All data goes to NeonDB
   - See results in Prisma Studio

5. **Monitor database on NeonDB dashboard:**
   - Watch queries in real-time
   - See performance metrics
   - Check storage usage

---

## Next Steps

1. ✅ Create NeonDB account
2. ✅ Create project
3. ✅ Copy connection string
4. ✅ Update `.env` file
5. ✅ Run `npx prisma studio` to test
6. ✅ Run `npm run dev` to start API
7. ✅ Test API endpoints with Postman

---

## Quick Start Command

```bash
# 1. Update .env with your NeonDB connection string

# 2. Test connection
npx prisma studio

# 3. Migrate database
npx prisma migrate dev --name init

# 4. Start API
npm run dev

# 5. Open another terminal and test
curl http://localhost:5000/api/v1/users
```

---

## Resources

- **NeonDB Docs:** https://neon.tech/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **PostgreSQL Connection String:** https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING

---

## Video Tutorial Reference

**NeonDB Setup (if visual guide helps):**
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create project
4. Copy connection string
5. Paste into `.env`
6. Run `npx prisma studio`

---

## Switching Between Databases

If you want to switch between NeonDB, Local PostgreSQL, and SQLite:

### Switch to NeonDB
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/db?sslmode=require"
```

### Switch to Local PostgreSQL
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db"
```

### Switch to SQLite
Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
}
```
Then:
```env
DATABASE_URL="file:./prisma/dev.db"
```

After changing, run:
```bash
npx prisma generate
npx prisma migrate dev --name switch
```

---

## Security Best Practices

1. **Never commit `.env`** - Already in `.gitignore`
2. **Use environment variables** - Not hardcoded strings
3. **Rotate passwords** - Change NeonDB password monthly
4. **Use `.env.example`** - Share template without secrets
5. **Limit database users** - Create separate users per app
6. **Monitor access logs** - Check NeonDB audit logs

---

## Getting Help

- **NeonDB Support:** https://neon.tech/support
- **Prisma Community:** https://www.prisma.io/community
- **Stack Overflow:** Tag `prisma` and `neondb`

---

Happy learning! 🚀

For any issues or questions, refer back to this guide or check the other docs in the `/docs` folder.
