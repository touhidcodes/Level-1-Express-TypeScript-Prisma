import { Router } from "express";
import users from "../services/users";
import products from "../services/products";

// Initialize the main API router
const router = Router();

// Register the user routes under the /users endpoint
router.use("/users", users);

// Register the product routes under the /products endpoint
router.use("/products", products);

export default router;
