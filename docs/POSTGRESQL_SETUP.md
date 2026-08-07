# PostgreSQL & pgAdmin4 Setup Guide

Follow these steps to set up PostgreSQL and create the database for the e-commerce API.

## Step 1: Verify PostgreSQL is Running

### On Windows:
1. Open **Services** (Press `Win + R`, type `services.msc`)
2. Look for **postgresql-x64-15** (or similar version)
3. Status should show **Running** (green arrow)
4. If it's stopped, right-click and select **Start**

### Check via PowerShell:
```powershell
Get-Service postgresql-*
```

You should see:
```
Status   Name
------   ----
Running  postgresql-x64-15
```

---

## Step 2: Access pgAdmin4

1. Open your browser and go to: **http://localhost:5050**
2. If prompted, login with:
   - **Email:** `postgres@pgadmin.org`
   - **Password:** `admin`

---

## Step 3: Create Database via pgAdmin4

1. In the left sidebar, click **Servers**
2. If "PostgreSQL" server is not listed:
   - Right-click **Servers** → **Register** → **Server**
   - **Name:** PostgreSQL
   - **Connection Tab:**
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: (your PostgreSQL password, default is `postgres`)
   - Click **Save**

3. Expand **Servers** → **PostgreSQL** → **Databases**

4. Right-click **Databases** → **Create** → **Database**

5. Fill in:
   - **Database name:** `ecommerce_db`
   - Click **Save**

---

## Step 4: Verify Connection in pgAdmin4

1. In pgAdmin, expand: **Servers** → **PostgreSQL** → **Databases** → **ecommerce_db**
2. Right-click **ecommerce_db** → **Properties**
3. Verify all settings look correct
4. You should see **Connected** status

---

## Step 5: Update .env File

Make sure your `.env` file has:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db"
PORT=5000
```

**Important:** Replace `postgres` (the password) with your actual PostgreSQL password if different.

---

## Step 6: Generate Prisma Client

Run this command to generate the Prisma client:

```bash
npx prisma generate
```

---

## Step 7: Create Tables (Migrate Database)

Create the database tables from the schema:

```bash
npx prisma migrate dev --name init
```

This will:
- Create all tables in your PostgreSQL database
- Generate migration files
- Automatically push schema to database

---

## Step 8: Verify Tables in pgAdmin4

1. In pgAdmin, navigate to: **Servers** → **PostgreSQL** → **Databases** → **ecommerce_db** → **Schemas** → **public** → **Tables**
2. You should see these tables:
   - `users`
   - `categories`
   - `products`
   - `cart_items`
   - `orders`
   - `order_items`

---

## Step 9: Test the API

Now run the development server:

```bash
npm run dev
```

You should see:
```
🚀 Server is running on http://localhost:5000
```

---

## Troubleshooting

### Issue: "Connection refused"
**Solution:** PostgreSQL is not running
```powershell
Start-Service postgresql-x64-15
```

### Issue: "password authentication failed"
**Solution:** Wrong password in `.env`
- Open pgAdmin4
- Right-click your server → **Properties**
- Copy the exact connection details to `.env`

### Issue: "SCRAM-SERVER-FIRST-MESSAGE: client password must be a string"
**Solution:** DATABASE_URL not being read properly
1. Make sure `.env` file is in the project root
2. Check that DATABASE_URL is not commented out
3. Restart the development server: `npm run dev`

### Issue: Cannot see tables in pgAdmin
**Solution:** Run migrations
```bash
npx prisma migrate dev --name init
```

### Issue: "database does not exist"
**Solution:** Create the database in pgAdmin as shown in Step 3-4

---

## Common Commands

```bash
# View database schema and tables
npx prisma studio

# Create backup of database
pg_dump -U postgres ecommerce_db > backup.sql

# Reset database (delete all data)
npx prisma migrate reset

# Check Prisma schema
npx prisma validate
```

---

## Default Credentials

**PostgreSQL:**
- Username: `postgres`
- Password: `postgres` (usually)
- Port: `5432`

**pgAdmin4:**
- Email: `postgres@pgadmin.org`
- Password: `admin`
- URL: `http://localhost:5050`

---

## Next Steps

Once connected:
1. Run `npm run dev` to start the API
2. Test endpoints using Postman or cURL
3. Use `npx prisma studio` to view/edit data

---

## Need Help?

If you encounter errors:
1. Check PostgreSQL is running (Services)
2. Verify database exists in pgAdmin
3. Verify .env file has correct credentials
4. Run `npx prisma migrate dev --name init` to create tables
5. Restart the development server
