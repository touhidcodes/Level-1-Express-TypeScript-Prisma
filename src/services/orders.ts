import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

// Initialize Express router for order-related routes
const router = Router();

/**
 * ============================================
 * ORDER ROUTES - Order Management
 * ============================================
 * 
 * Orders represent purchases made by users. Each order contains:
 * - Order header with total amount and status
 * - Order items (products in the order with quantities and prices)
 * 
 * Order statuses: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
 * 
 * This router handles:
 * - Creating orders from cart items
 * - Retrieving order details
 * - Updating order status
 * - Cancelling orders
 * - Order history
 */

/**
 * POST /orders
 * 
 * Create a new order from user's cart
 * 
 * Expected Request Body:
 * {
 *   "userId": "user-uuid",
 *   "cartItems": [ // Optional - if not provided, will use cart
 *     {
 *       "productId": "product-uuid",
 *       "quantity": 2,
 *       "price": 99.99
 *     }
 *   ]
 * }
 * 
 * OR create from existing cart automatically
 * 
 * Returns: Created order with order items
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    // Extract order data from request body
    const { userId, cartItems } = req.body;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
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

    // Get cart items
    let itemsToOrder = cartItems;

    if (!itemsToOrder || itemsToOrder.length === 0) {
      // Fetch user's cart items if not provided
      const userCart = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      if (userCart.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Cart is empty. Add items before creating order",
        });
      }

      // Convert cart items to order items format
      itemsToOrder = userCart.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      }));
    }

    // Validate and calculate total amount
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of itemsToOrder) {
      if (!item.productId || !item.quantity || !item.price) {
        return res.status(400).json({
          success: false,
          message: "Each order item must have productId, quantity, and price",
        });
      }

      // Verify product exists and has stock
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}. Available: ${product.stock}`,
        });
      }

      totalAmount += item.price * item.quantity;
      validatedItems.push(item);
    }

    // Create order within a transaction to ensure consistency
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        status: "PENDING",
        orderItems: {
          create: validatedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Clear user's cart after successful order creation
    if (!cartItems) {
      await prisma.cartItem.deleteMany({
        where: { userId },
      });
    }

    // Return success response
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
});

/**
 * GET /orders
 * 
 * Retrieve all orders with optional filtering
 * 
 * Query Parameters:
 * - userId: Filter by user ID (optional)
 * - status: Filter by order status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
 * - page: Page number for pagination (default: 1)
 * - limit: Items per page (default: 10)
 * - includeDeleted: Include deleted orders (default: false)
 * 
 * Returns: Paginated list of orders
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    // Extract query parameters
    const userId = req.query.userId as string | undefined;
    const status = req.query.status as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const includeDeleted = req.query.includeDeleted === "true";

    // Calculate pagination skip
    const skip = (page - 1) * limit;

    // Build filter condition
    const whereCondition: any = {
      isDeleted: includeDeleted ? undefined : false,
    };

    if (userId) {
      whereCondition.userId = userId;
    }

    if (status) {
      whereCondition.status = status.toUpperCase();
    }

    // Fetch orders from database
    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.order.count({
      where: whereCondition,
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalOrders: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
});

/**
 * GET /orders/:id
 * 
 * Retrieve a specific order with all details
 * 
 * Path Parameters:
 * - id: Order ID (UUID)
 * 
 * Returns: Single order with user and order items details
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    // Extract order ID from URL parameters and cast to string
    const id = req.params.id as string;

    // Find order with all related data
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    // Check if order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order is soft-deleted
    if (order.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Order not found (deleted)",
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
});

/**
 * GET /orders/user/:userId
 * 
 * Retrieve all orders for a specific user
 * 
 * Path Parameters:
 * - userId: User ID (UUID)
 * 
 * Query Parameters:
 * - status: Filter by order status
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * 
 * Returns: User's orders with pagination
 */
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    // Extract user ID from URL parameters and cast to string
    const userId = req.params.userId as string;
    // Extract query parameters
    const status = req.query.status as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);

    // Calculate pagination skip
    const skip = (page - 1) * limit;

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

    // Build filter condition
    const whereCondition: any = {
      userId,
      isDeleted: false,
    };

    if (status) {
      whereCondition.status = status.toUpperCase();
    }

    // Fetch user's orders
    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Get total count
    const totalCount = await prisma.order.count({
      where: whereCondition,
    });

    // Calculate order statistics
    const stats = {
      totalOrders: totalCount,
      totalSpent: orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0),
      ordersByStatus: {
        pending: orders.filter((o: any) => o.status === "PENDING").length,
        processing: orders.filter((o: any) => o.status === "PROCESSING").length,
        shipped: orders.filter((o: any) => o.status === "SHIPPED").length,
        delivered: orders.filter((o: any) => o.status === "DELIVERED").length,
        cancelled: orders.filter((o: any) => o.status === "CANCELLED").length,
      },
    };

    // Return success response
    res.status(200).json({
      success: true,
      message: "User orders fetched successfully",
      user,
      data: orders,
      stats,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalOrders: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching user orders",
      error: error.message,
    });
  }
});

/**
 * PATCH /orders/:id
 * 
 * Update order status
 * 
 * Path Parameters:
 * - id: Order ID (UUID)
 * 
 * Expected Request Body:
 * {
 *   "status": "PROCESSING" // Must be: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
 * }
 * 
 * Returns: Updated order
 */
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    // Extract order ID from URL parameters and cast to string
    const id = req.params.id as string;
    // Extract new status from request body
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!status || !validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: status.toUpperCase() },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: true,
      },
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }
});

/**
 * DELETE /orders/:id
 * 
 * Cancel/delete an order (soft delete)
 * 
 * Path Parameters:
 * - id: Order ID (UUID)
 * 
 * Query Parameters:
 * - permanent: Permanently delete (default: false)
 * 
 * Returns: Success message
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    // Extract order ID from URL parameters and cast to string
    const id = req.params.id as string;
    // Check if permanent deletion is requested
    const permanent = req.query.permanent === "true";

    if (permanent) {
      // Permanently delete order (cascade deletes order items)
      await prisma.order.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Order permanently deleted",
      });
    }

    // Soft delete: mark order as deleted
    const deletedOrder = await prisma.order.update({
      where: { id },
      data: { isDeleted: true },
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        id: deletedOrder.id,
        status: deletedOrder.status,
      },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error cancelling order",
      error: error.message,
    });
  }
});

// Export router to be used in main application
export default router;
