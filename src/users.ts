import { Router } from "express";
import prisma from "./prisma";

// Create a new Express router for user-related endpoints
const router = Router();

// POST / - Create a new user
router.post("/", async (req, res) => {
  try {
    const data = await prisma.user.create({ data: req.body });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// GET / - Retrieve all users
router.get("/", async (req, res) => {
  try {
    // findMany fetches all records in the User table
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /:id - Retrieve a specific user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// PATCH /:id - Update a user by ID
router.patch("/:id", async (req, res) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      // The fields to update are passed in the request body
      data: req.body,
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE /:id - Delete a user by ID
router.delete("/:id", async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
