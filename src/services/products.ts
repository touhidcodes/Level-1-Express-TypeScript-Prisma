import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

// Initialize Express router for product-related routes
const router = Router();

/**
 * ============================================
 * PRODUCT ROUTES - Complete CRUD Operations
 * ============================================
 * 
 * This router handles all product-related operations including:
 * - Creating new products
 * - Retrieving products (with filtering and pagination)
 * - Updating product information
 * - Deleting products
 */

/**
 * POST /products
 * 
 * Create a new product
 * 
 * Expected Request Body:
 * {
 *   "title": "Laptop",
 *   "description": "High performance laptop",
 *   "price": 999.99,
 *   "stock": 50,
 *   "image": "https://example.com/laptop.jpg",
 *   "categoryId": "category-uuid"
 * }
 * 
 * Returns: Created product object with ID and timestamps
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    // Extract product data from request body
    const { title, description, price, stock, image, categoryId } = req.body;

    // Validate required fields
    if (!title || !price || !stock || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Title, price, stock, and categoryId are required",
      });
    }

    // Validate that price and stock are positive numbers
    if (price <= 0 || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be positive and stock cannot be negative",
      });
    }

    // Verify that category exists before creating product
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Create product in database using Prisma
    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        price,
        stock,
        image,
        categoryId,
      },
      include: {
        category: true, // Include category details in response
      },
    });

    // Return success response with created product
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
});

/**
 * GET /products
 * 
 * Retrieve all products with optional filtering and pagination
 * 
 * Query Parameters:
 * - categoryId: Filter by category (optional)
 * - search: Search by title or description (optional)
 * - page: Page number for pagination (default: 1)
 * - limit: Items per page (default: 10)
 * - sortBy: Sort field - 'price', 'createdAt' (default: createdAt)
 * - order: Sort order - 'asc' or 'desc' (default: desc)
 * - includeDeleted: Include soft-deleted products (default: false)
 * 
 * Returns: Paginated array of products with total count
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    // Extract query parameters with default values
    const categoryId = req.query.categoryId as string | undefined;
    const search = req.query.search as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10); // Max 100 items per page
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const order = (req.query.order as "asc" | "desc") || "desc";
    const includeDeleted = req.query.includeDeleted === "true";

    // Calculate pagination skip value
    const skip = (page - 1) * limit;

    // Build filter conditions
    const whereCondition: any = {
      isDeleted: includeDeleted ? undefined : false,
    };

    // Add category filter if provided
    if (categoryId) {
      whereCondition.categoryId = categoryId;
    }

    // Add search filter if provided
    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch products from database with filters, sorting, and pagination
    const products = await prisma.product.findMany({
      where: whereCondition,
      include: {
        category: true,
      },
      orderBy: {
        [sortBy]: order,
      },
      skip,
      take: limit,
    });

    // Get total count for pagination info
    const totalCount = await prisma.product.count({
      where: whereCondition,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Return success response with products and pagination info
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalProducts: totalCount,
        totalPages,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
});

/**
 * GET /products/:id
 * 
 * Retrieve a specific product by ID
 * 
 * Path Parameters:
 * - id: Product ID (UUID)
 * 
 * Returns: Single product object with category and related data
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    // Extract product ID from URL parameters and cast to string
    const id = req.params.id as string;

    // Find product by ID in database with related data
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true, // Include category information
        cartItems: {
          include: { user: true }, // Include user info for cart items
        },
        orderItems: {
          include: { order: true }, // Include order info for order items
        },
      },
    });

    // Check if product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if product is soft-deleted
    if (product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found (deleted)",
      });
    }

    // Return success response with product data
    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
});

/**
 * PATCH /products/:id
 * 
 * Update product information
 * 
 * Path Parameters:
 * - id: Product ID (UUID)
 * 
 * Expected Request Body (all fields optional):
 * {
 *   "title": "Updated Laptop",
 *   "description": "Updated description",
 *   "price": 1099.99,
 *   "stock": 45,
 *   "image": "new-image-url",
 *   "categoryId": "new-category-id"
 * }
 * 
 * Returns: Updated product object
 */
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    // Extract product ID from URL parameters and cast to string
    const id = req.params.id as string;
    // Extract update data from request body
    const updateData = req.body;

    // Validate price if provided
    if (updateData.price !== undefined && updateData.price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be positive",
      });
    }

    // Validate stock if provided
    if (updateData.stock !== undefined && updateData.stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    // Verify category exists if categoryId is being updated
    if (updateData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: updateData.categoryId },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    // Update product in database
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    // Return success response with updated product
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error: any) {
    // Handle not found error
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
});

/**
 * DELETE /products/:id
 * 
 * Delete a product (soft delete - marks as deleted without removing from DB)
 * 
 * Path Parameters:
 * - id: Product ID (UUID)
 * 
 * Query Parameters:
 * - permanent: boolean (default: false) - Permanently delete from database
 * 
 * Returns: Success message
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    // Extract product ID from URL parameters and cast to string
    const id = req.params.id as string;
    // Check if permanent deletion is requested
    const permanent = req.query.permanent === "true";

    if (permanent) {
      // Permanently delete product from database
      // Note: Cascade delete will handle related cart items and order items
      await prisma.product.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Product permanently deleted",
      });
    }

    // Soft delete: mark product as deleted instead of removing from database
    const deletedProduct = await prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: {
        id: deletedProduct.id,
        message: "Product marked as deleted",
      },
    });
  } catch (error: any) {
    // Handle not found error
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
});

// Export router to be used in main application
export default router;
