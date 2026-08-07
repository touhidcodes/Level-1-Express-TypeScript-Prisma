import { Router, Request, Response } from "express";
import prisma from "@/lib/prisma";

// Initialize Express router for category-related routes
const router = Router();

/**
 * ============================================
 * CATEGORY ROUTES - Complete CRUD Operations
 * ============================================
 * 
 * Categories are used to organize products into logical groups.
 * This router handles:
 * - Creating product categories
 * - Retrieving categories with products
 * - Updating category information
 * - Deleting categories
 */

/**
 * POST /categories
 * 
 * Create a new product category
 * 
 * Expected Request Body:
 * {
 *   "name": "Electronics"
 * }
 * 
 * Returns: Created category object with ID and timestamps
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    // Extract category data from request body
    const { name } = req.body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Create category in database using Prisma
    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
      },
    });

    // Return success response with created category
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error: any) {
    // Handle duplicate category name error
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
});

/**
 * GET /categories
 * 
 * Retrieve all categories
 * 
 * Query Parameters:
 * - includeDeleted: Include soft-deleted categories (default: false)
 * - includeProducts: Include products in each category (default: false)
 * 
 * Returns: Array of all categories with optional product details
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    // Extract query parameters
    const includeDeleted = req.query.includeDeleted === "true";
    const includeProducts = req.query.includeProducts === "true";

    // Fetch all categories from database
    const categories = await prisma.category.findMany({
      where: includeDeleted ? {} : { isDeleted: false },
      include: {
        // Conditionally include products based on query parameter
        products: includeProducts
          ? {
              where: { isDeleted: false },
            }
          : false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Return success response with categories list
    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
});

/**
 * GET /categories/:id
 * 
 * Retrieve a specific category by ID with its products
 * 
 * Path Parameters:
 * - id: Category ID (UUID)
 * 
 * Query Parameters:
 * - includeProducts: Include products in this category (default: true)
 * 
 * Returns: Single category object with its products
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    // Extract category ID from URL parameters and cast to string
    const id = req.params.id as string;
    // Extract query parameter
    const includeProducts = req.query.includeProducts !== "false";

    // Find category by ID in database
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        // Include products belonging to this category
        products: includeProducts
          ? {
              where: { isDeleted: false },
              orderBy: {
                createdAt: "desc",
              },
            }
          : false,
      },
    });

    // Check if category exists
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category is soft-deleted
    if (category.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Category not found (deleted)",
      });
    }

    // Return success response with category data
    res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching category",
      error: error.message,
    });
  }
});

/**
 * PATCH /categories/:id
 * 
 * Update category information
 * 
 * Path Parameters:
 * - id: Category ID (UUID)
 * 
 * Expected Request Body:
 * {
 *   "name": "Updated Category Name"
 * }
 * 
 * Returns: Updated category object
 */
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    // Extract category ID from URL parameters and cast to string
    const id = req.params.id as string;
    // Extract update data from request body
    const { name } = req.body;

    // Validate that name is provided and not empty
    if (name !== undefined && name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Category name cannot be empty",
      });
    }

    // Check if another category has the same name
    if (name) {
      const existingCategory = await prisma.category.findUnique({
        where: { name: name.trim() },
      });

      if (existingCategory && existingCategory.id !== id) {
        return res.status(400).json({
          success: false,
          message: "Category name already in use",
        });
      }
    }

    // Update category in database
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: name ? { name: name.trim() } : {},
    });

    // Return success response with updated category
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error: any) {
    // Handle not found error
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
});

/**
 * DELETE /categories/:id
 * 
 * Delete a category (soft delete - marks as deleted without removing from DB)
 * 
 * Path Parameters:
 * - id: Category ID (UUID)
 * 
 * Query Parameters:
 * - permanent: boolean (default: false) - Permanently delete from database
 * 
 * Returns: Success message
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    // Extract category ID from URL parameters and cast to string
    const id = req.params.id as string;
    // Check if permanent deletion is requested
    const permanent = req.query.permanent === "true";

    if (permanent) {
      // Permanently delete category from database
      // Note: Products in this category won't be deleted due to foreign key constraint
      // Consider the business logic: should products be reassigned or deleted?
      await prisma.category.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Category permanently deleted",
      });
    }

    // Soft delete: mark category as deleted instead of removing from database
    const deletedCategory = await prisma.category.update({
      where: { id },
      data: { isDeleted: true },
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: {
        id: deletedCategory.id,
        message: "Category marked as deleted",
      },
    });
  } catch (error: any) {
    // Handle not found error
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
});

// Export router to be used in main application
export default router;
