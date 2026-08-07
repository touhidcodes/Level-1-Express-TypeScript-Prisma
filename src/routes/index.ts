import { Router } from "express";
import users from "../users";
import products from "../products";

// Initialize the main API router
const router = Router();

// Register the user routes under the /users endpoint
router.use("/users", users);

// Register the product routes under the /products endpoint
router.use("/products", products);

export default router;
