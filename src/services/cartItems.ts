import prisma from "@/lib/prisma.js";
import { Router, Request, Response } from "express";

// Initialize Express router for cart item-related routes
const router = Router();

/**
 * ============================================
 * CART ITEMS ROUTES - Shopping Cart Management
 * ============================================
 * 
 * Cart items represent products that users have added to their shopping carts.
 * Each user can have multiple cart items, but only one of each product.
 * 
 * This router handles:
 * - Adding products to cart
 * - Retrieving user's cart items
 * - Updating item quantities
 * - Removing items from cart
 * - Clearing entire cart
 */

/**
 * POST /cart-items
 * 
 * Add a product to user's cart (or update quantity if already in cart)
 * 
 * Expected Request Body:
 * {
 *   "userId": "user-uuid",
 *   "productId": "product-uuid",
 *   "quantity": 2 // Optional, defaults to 1
 * }
 * 
 * Returns: Created or updated cart item
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    // Extract cart item data from request body
    const { userId, productId, quantity = 1 } = req.body;

    // Validate required fields
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required",
      });
    }

    // Validate quantity is positive
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if product has sufficient stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}`,
      });
    }

    // Check if product is deleted
    if (product.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Product is no longer available",
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update existing cart item quantity
      const newQuantity = existingCartItem.quantity + quantity;

      // Check if new quantity exceeds stock
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Available: ${product.stock}, Already in cart: ${existingCartItem.quantity}`,
        });
      }

      cartItem = await prisma.cartItem.update({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        data: {
          quantity: newQuantity,
        },
        include: {
          product: true,
          user: true,
        },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
        include: {
          product: true,
          user: true,
        },
      });
    }

    // Return success response
    res.status(201).json({
      success: true,
      message: existingCartItem ? "Cart item updated" : "Item added to cart",
      data: cartItem,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error adding item to cart",
      error: error.message,
    });
  }
});

/**
 * GET /cart-items
 * 
 * Retrieve all cart items (can be filtered by user)
 * 
 * Query Parameters:
 * - userId: Filter by specific user (optional)
 * 
 * Returns: Array of cart items with product and user details
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    // Extract user ID filter from query parameters
    const userId = req.query.userId as string | undefined;

    // Build filter condition
    const whereCondition: any = {};
    if (userId) {
      whereCondition.userId = userId;
    }

    // Fetch cart items from database
    const cartItems = await prisma.cartItem.findMany({
      where: whereCondition,
      include: {
        product: {
          include: {
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate total cart value if filtering by user
    let totalCartValue = 0;
    if (userId) {
      totalCartValue = cartItems.reduce((sum: number, item: any) => {
        return sum + item.product.price * item.quantity;
      }, 0);
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: "Cart items fetched successfully",
      data: cartItems,
      ...(userId && { totalCartValue: parseFloat(totalCartValue.toFixed(2)) }),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching cart items",
      error: error.message,
    });
  }
});

/**
 * GET /cart-items/user/:userId
 * 
 * Retrieve specific user's cart with summary
 * 
 * Path Parameters:
 * - userId: User ID (UUID)
 * 
 * Returns: Array of user's cart items with cart summary (total items, total price)
 */
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    // Extract user ID from URL parameters and cast to string
    const userId = req.params.userId as string;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate cart summary
    const cartSummary = cartItems.reduce(
      (summary: any, item: any) => {
        return {
          totalItems: summary.totalItems + item.quantity,
          totalPrice:
            summary.totalPrice + item.product.price * item.quantity,
          itemCount: summary.itemCount + 1, // Number of different products
        };
      },
      { totalItems: 0, totalPrice: 0, itemCount: 0 }
    );

    // Return success response with cart details
    res.status(200).json({
      success: true,
      message: "User cart fetched successfully",
      user,
      data: cartItems,
      summary: {
        itemCount: cartSummary.itemCount,
        totalQuantity: cartSummary.totalItems,
        totalPrice: parseFloat(cartSummary.totalPrice.toFixed(2)),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching user cart",
      error: error.message,
    });
  }
});

/**
 * PATCH /cart-items/:id
 * 
 * Update quantity of a cart item
 * 
 * Path Parameters:
 * - id: Cart Item ID (UUID)
 * 
 * Expected Request Body:
 * {
 *   "quantity": 5
 * }
 * 
 * Returns: Updated cart item
 */
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    // Extract cart item ID from URL parameters and cast to string
    const id = req.params.id as string;
    // Extract new quantity from request body
    const { quantity } = req.body;

    // Validate quantity
    if (quantity === undefined || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    // Find cart item and its product
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Check if product has sufficient stock
    if (quantity > cartItem.product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${cartItem.product.stock}`,
      });
    }

    // Update cart item quantity
    const updatedCartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: true,
        user: true,
      },
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: updatedCartItem,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating cart item",
      error: error.message,
    });
  }
});

/**
 * DELETE /cart-items/:id
 * 
 * Remove a product from user's cart
 * 
 * Path Parameters:
 * - id: Cart Item ID (UUID)
 * 
 * Returns: Success message
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    // Extract cart item ID from URL parameters and cast to string
    const id = req.params.id as string;

    // Delete cart item from database
    await prisma.cartItem.delete({
      where: { id },
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error removing item from cart",
      error: error.message,
    });
  }
});

/**
 * DELETE /cart-items/user/:userId
 * 
 * Clear entire cart for a user
 * 
 * Path Parameters:
 * - userId: User ID (UUID)
 * 
 * Returns: Success message with number of items removed
 */
router.delete("/user/:userId", async (req: Request, res: Response) => {
  try {
    // Extract user ID from URL parameters and cast to string
    const userId = req.params.userId as string;

    // Delete all cart items for the user
    const result = await prisma.cartItem.deleteMany({
      where: { userId },
    });

    // Return success response with count of deleted items
    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: {
        itemsRemoved: result.count,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message,
    });
  }
});

// Export router to be used in main application
export default router;
