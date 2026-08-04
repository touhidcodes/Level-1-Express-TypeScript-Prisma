# Prisma + Express + TypeScript Starter Guide

## 1. Create Project

``` bash
mkdir prisma-express-ts
cd prisma-express-ts
npm init -y
```

## 2. Install Dependencies

### Runtime

``` bash
npm install express cors dotenv @prisma/client
```

### Development

``` bash
npm install -D typescript ts-node-dev prisma @types/node @types/express @types/cors
```

## 3. Initialize TypeScript

``` bash
npx tsc --init
```

Replace `tsconfig.json`:

``` json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## 4. Initialize Prisma

``` bash
npx prisma init
```

## 5. Environment

`.env`

``` env
DATABASE_URL="postgresql://postgres:password@localhost:5432/prisma_db"
PORT=5000
```

## 6. Project Structure

``` text
prisma-express-ts/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── routes/
│   │   └── index.ts
│   ├── prisma.ts
│   ├── server.ts
│   ├── users.ts
│   └── products.ts
├── .env
├── package.json
└── tsconfig.json
```

## 7. Prisma Schema

``` prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
}

model User{
  id String @id @default(uuid())
  name String
  email String @unique
  age Int
  createdAt DateTime @default(now())
}

model Product{
  id String @id @default(uuid())
  title String
  price Float
  createdAt DateTime @default(now())
}
```

Run:

``` bash
npx prisma migrate dev --name init
npx prisma generate
```

## 8. prisma.ts

``` ts
import { PrismaClient } from "@prisma/client";
export default new PrismaClient();
```

## 9. server.ts

``` ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const app=express();
app.use(cors());
app.use(express.json());

app.use("/api/v1",routes);

app.listen(process.env.PORT||5000);
```

## 10. routes/index.ts

``` ts
import {Router} from "express";
import users from "../users";
import products from "../products";

const router=Router();

router.use("/users",users);
router.use("/products",products);

export default router;
```

## 11. users.ts

``` ts
import {Router} from "express";
import prisma from "./prisma";

const router=Router();

router.post("/",async(req,res)=>{
 const data=await prisma.user.create({data:req.body});
 res.status(201).json(data);
});

router.get("/",async(req,res)=>{
 res.json(await prisma.user.findMany());
});

router.get("/:id",async(req,res)=>{
 res.json(await prisma.user.findUnique({where:{id:req.params.id}}));
});

router.patch("/:id",async(req,res)=>{
 res.json(await prisma.user.update({
   where:{id:req.params.id},
   data:req.body
 }));
});

router.delete("/:id",async(req,res)=>{
 await prisma.user.delete({where:{id:req.params.id}});
 res.json({message:"Deleted"});
});

export default router;
```

## 12. products.ts

Same CRUD as `users.ts`, replacing `user` with `product`.

## 13. Scripts

``` json
{
 "scripts":{
  "dev":"ts-node-dev --respawn --transpile-only src/server.ts",
  "build":"tsc",
  "start":"node dist/server.js"
 }
}
```

## 14. Useful Prisma Commands

``` bash
npx prisma studio
npx prisma generate
npx prisma migrate dev --name update
npx prisma migrate reset
```

## 15. API Endpoints

  Method   Endpoint
  -------- ----------------------
  GET      /api/v1/users
  POST     /api/v1/users
  GET      /api/v1/users/:id
  PATCH    /api/v1/users/:id
  DELETE   /api/v1/users/:id
  GET      /api/v1/products
  POST     /api/v1/products
  GET      /api/v1/products/:id
  PATCH    /api/v1/products/:id
  DELETE   /api/v1/products/:id

## 16. Deployment

Build:

``` bash
npm run build
```

Railway / Render start command:

``` bash
npx prisma migrate deploy
npm start
```
