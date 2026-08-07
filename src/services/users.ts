import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

// Initialize Express router for user-related routes
const router = Router();

/**
 * ============================================
 * USER ROUTES - Complete CRUD Operations
 * ============================================
 * 
 * This router handles all user-related operations including:
 * - Creating new users
 * - Retrieving user data
 * - Updating user information
 * - Deleting users
 */

/**
 * POST /users
 * 
 * Create a new user
 * 
 * Expected Request Body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "hashedPassword123",
 *   "role": "CUSTOMER" // Optional, defaults to CUSTOMER
 * }
 * 
 * Returns: Created user object with ID and timestamps
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    // Extract user data from request body
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Create user in database using Prisma
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // Note: In production, hash this password!
        role: role || "CUSTOMER",
      },
    });

    // Return success response with created user
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error: any) {
    // Handle duplicate email error
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
});

/**
 * GET /users
 * 
 * Retrieve all users
 * 
 * Query Parameters:
 * - includeDeleted: boolean (default: false) - Include soft-deleted users
 * 
 * Returns: Array of all users (excluding deleted users by default)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    // Check if deleted users should be included
    const includeDeleted = req.query.includeDeleted === "true";

    // Fetch all users from database
    // By default, only include active users (isDeleted = false)
    const users = await prisma.user.findMany({
      where: includeDeleted ? {} : { isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password from response for security
      },
    });

    // Return success response with users list
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
});

/**
 * GET /users/:id
 * 
 * Retrieve a specific user by ID
 * 
 * Path Parameters:
 * - id: User ID (UUID)
 * 
 * Returns: Single user object with all details
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    // Extract user ID from URL parameters and cast to string
    const id = req.params.id as string;

    // Find user by ID in database
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        // Include related orders and cart items
        orders: {
          where: { isDeleted: false },
        },
        cartItems: true,
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is soft-deleted
    if (user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found (deleted)",
      });
    }

    // Return success response with user data
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
});

/**
 * PATCH /users/:id
 * 
 * Update user information
 * 
 * Path Parameters:
 * - id: User ID (UUID)
 * 
 * Expected Request Body (all fields optional):
 * {
 *   "name": "Jane Doe",
 *   "email": "jane@example.com",
 *   "role": "ADMIN"
 * }
 * 
 * Returns: Updated user object
 */
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    // Extract user ID from URL parameters and cast to string
    const id = req.params.id as string;
    // Extract update data from request body
    const updateData = req.body;

    // Prevent updating email if it already exists
    if (updateData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (existingUser && existingUser.id !== id) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another user",
        });
      }
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Return success response with updated user
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    // Handle not found error
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
});

/**
 * DELETE /users/:id
 * 
 * Delete a user (soft delete - marks as deleted without removing from DB)
 * 
 * Path Parameters:
 * - id: User ID (UUID)
 * 
 * Query Parameters:
 * - permanent: boolean (default: false) - Permanently delete from database
 * 
 * Returns: Success message
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    // Extract user ID from URL parameters and cast to string
    const id = req.params.id as string;
    // Check if permanent deletion is requested
    const permanent = req.query.permanent === "true";

    if (permanent) {
      // Permanently delete user from database
      // This will also cascade delete related records (orders, cart items)
      await prisma.user.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "User permanently deleted",
      });
    }

    // Soft delete: mark user as deleted instead of removing from database
    const deletedUser = await prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {
        id: deletedUser.id,
        message: "User marked as deleted",
      },
    });
  } catch (error: any) {
    // Handle not found error
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
});

// Export router to be used in main application
export default router;
