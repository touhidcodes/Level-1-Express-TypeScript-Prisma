import { Router } from "express";
import prisma from "./prisma";

// Create a new Express router for product-related endpoints
const router = Router();

// POST / - Create a new product
router.post("/", async (req, res) => {
  try {
    const data = await prisma.product.create({ data: req.body });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// GET / - Retrieve all products
router.get("/", async (req, res) => {
  try {
    // findMany fetches all records in the Product table
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /:id - Retrieve a specific product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// PATCH /:id - Update a product by ID
router.patch("/:id", async (req, res) => {
  try {
    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      // The fields to update are passed in the request body
      data: req.body,
    });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /:id - Delete a product by ID
router.delete("/:id", async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
