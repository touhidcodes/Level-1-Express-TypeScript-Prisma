# E-Commerce API Documentation

This is a comprehensive REST API for an e-commerce platform built with Express.js, TypeScript, and Prisma ORM. The API manages users, products, categories, shopping carts, and orders.

## Base URL
```
http://localhost:5000/api/v1
```

---

## Table of Contents
1. [Users API](#users-api)
2. [Products API](#products-api)
3. [Categories API](#categories-api)
4. [Cart Items API](#cart-items-api)
5. [Orders API](#orders-api)

---

## Users API

### Overview
Handles user management including registration, profile updates, and deletion.

### Endpoints

#### 1. Create User
**POST** `/users`

Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashedPassword123",
  "role": "CUSTOMER"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 2. Get All Users
**GET** `/users`

Retrieves all active users.

**Query Parameters:**
- `includeDeleted` (boolean): Include soft-deleted users (default: false)

**Response (200):**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "CUSTOMER",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 3. Get User by ID
**GET** `/users/:id`

Retrieves a specific user with their orders and cart items.

**Response (200):**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "isDeleted": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "orders": [],
    "cartItems": []
  }
}
```

#### 4. Update User
**PATCH** `/users/:id`

Updates user information.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "ADMIN"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "ADMIN",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:35:00Z"
  }
}
```

#### 5. Delete User
**DELETE** `/users/:id`

Soft deletes a user (marks as deleted).

**Query Parameters:**
- `permanent` (boolean): Permanently delete from database (default: false)

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": "uuid",
    "message": "User marked as deleted"
  }
}
```

---

## Products API

### Overview
Manages products with advanced filtering, pagination, and stock management.

### Endpoints

#### 1. Create Product
**POST** `/products`

Creates a new product.

**Request Body:**
```json
{
  "title": "Laptop",
  "description": "High performance gaming laptop",
  "price": 999.99,
  "stock": 50,
  "image": "https://example.com/laptop.jpg",
  "categoryId": "category-uuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "uuid",
    "title": "Laptop",
    "description": "High performance gaming laptop",
    "price": 999.99,
    "stock": 50,
    "image": "https://example.com/laptop.jpg",
    "categoryId": "category-uuid",
    "category": { ... },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 2. Get All Products
**GET** `/products`

Retrieves products with filtering, sorting, and pagination.

**Query Parameters:**
- `categoryId` (string): Filter by category
- `search` (string): Search by title or description
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `sortBy` (string): Sort field - 'price', 'createdAt' (default: createdAt)
- `order` (string): 'asc' or 'desc' (default: desc)
- `includeDeleted` (boolean): Include deleted products

**Example:** `/products?categoryId=cat-123&search=laptop&page=1&limit=10&sortBy=price&order=asc`

**Response (200):**
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [
    {
      "id": "uuid",
      "title": "Laptop",
      "price": 999.99,
      "stock": 50,
      "category": { ... }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalProducts": 100,
    "totalPages": 10
  }
}
```

#### 3. Get Product by ID
**GET** `/products/:id`

Retrieves a specific product with all details.

**Response (200):**
```json
{
  "success": true,
  "message": "Product fetched successfully",
  "data": {
    "id": "uuid",
    "title": "Laptop",
    "description": "...",
    "price": 999.99,
    "stock": 50,
    "category": { ... },
    "cartItems": [],
    "orderItems": []
  }
}
```

#### 4. Update Product
**PATCH** `/products/:id`

Updates product information.

**Request Body:**
```json
{
  "title": "Updated Laptop",
  "price": 1099.99,
  "stock": 45
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { ... }
}
```

#### 5. Delete Product
**DELETE** `/products/:id`

Soft deletes a product.

**Query Parameters:**
- `permanent` (boolean): Permanently delete

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Categories API

### Overview
Manages product categories.

### Endpoints

#### 1. Create Category
**POST** `/categories`

Creates a new product category.

**Request Body:**
```json
{
  "name": "Electronics"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "uuid",
    "name": "Electronics",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 2. Get All Categories
**GET** `/categories`

Retrieves all categories with optional products.

**Query Parameters:**
- `includeProducts` (boolean): Include products in each category (default: false)
- `includeDeleted` (boolean): Include deleted categories

**Response (200):**
```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Electronics",
      "products": []
    }
  ]
}
```

#### 3. Get Category by ID
**GET** `/categories/:id`

Retrieves a specific category with its products.

**Query Parameters:**
- `includeProducts` (boolean): Include products (default: true)

**Response (200):**
```json
{
  "success": true,
  "message": "Category fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Electronics",
    "products": [
      { ... }
    ]
  }
}
```

#### 4. Update Category
**PATCH** `/categories/:id`

Updates category information.

**Request Body:**
```json
{
  "name": "Updated Category Name"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": { ... }
}
```

#### 5. Delete Category
**DELETE** `/categories/:id`

Soft deletes a category.

**Query Parameters:**
- `permanent` (boolean): Permanently delete

**Response (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## Cart Items API

### Overview
Manages shopping cart operations for users.

### Endpoints

#### 1. Add Item to Cart
**POST** `/cart-items`

Adds a product to user's cart or updates quantity if already in cart.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "productId": "product-uuid",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "productId": "product-uuid",
    "quantity": 2,
    "product": { ... },
    "user": { ... }
  }
}
```

#### 2. Get All Cart Items
**GET** `/cart-items`

Retrieves all cart items (can filter by user).

**Query Parameters:**
- `userId` (string): Filter by specific user

**Response (200):**
```json
{
  "success": true,
  "message": "Cart items fetched successfully",
  "data": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "productId": "product-uuid",
      "quantity": 2,
      "product": { ... },
      "user": { ... }
    }
  ]
}
```

#### 3. Get User's Cart
**GET** `/cart-items/user/:userId`

Retrieves specific user's cart with summary.

**Response (200):**
```json
{
  "success": true,
  "message": "User cart fetched successfully",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "data": [
    { ... }
  ],
  "summary": {
    "itemCount": 3,
    "totalQuantity": 5,
    "totalPrice": 2999.97
  }
}
```

#### 4. Update Cart Item Quantity
**PATCH** `/cart-items/:id`

Updates the quantity of an item in cart.

**Request Body:**
```json
{
  "quantity": 5
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": { ... }
}
```

#### 5. Remove Item from Cart
**DELETE** `/cart-items/:id`

Removes a product from user's cart.

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

#### 6. Clear Cart
**DELETE** `/cart-items/user/:userId`

Clears entire cart for a user.

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "data": {
    "itemsRemoved": 5
  }
}
```

---

## Orders API

### Overview
Manages orders and order history.

### Endpoints

#### 1. Create Order
**POST** `/orders`

Creates a new order from user's cart.

**Request Body Option 1 - From existing cart:**
```json
{
  "userId": "user-uuid"
}
```

**Request Body Option 2 - Custom items:**
```json
{
  "userId": "user-uuid",
  "cartItems": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "price": 99.99
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "totalAmount": 199.98,
    "status": "PENDING",
    "user": { ... },
    "orderItems": [
      {
        "id": "uuid",
        "orderId": "order-uuid",
        "productId": "product-uuid",
        "quantity": 2,
        "price": 99.99,
        "product": { ... }
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 2. Get All Orders
**GET** `/orders`

Retrieves all orders with optional filtering.

**Query Parameters:**
- `userId` (string): Filter by user
- `status` (string): Filter by status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `includeDeleted` (boolean): Include deleted orders

**Response (200):**
```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalOrders": 50,
    "totalPages": 5
  }
}
```

#### 3. Get Order by ID
**GET** `/orders/:id`

Retrieves a specific order with all details.

**Response (200):**
```json
{
  "success": true,
  "message": "Order fetched successfully",
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "totalAmount": 199.98,
    "status": "PENDING",
    "user": { ... },
    "orderItems": [ ... ]
  }
}
```

#### 4. Get User's Orders
**GET** `/orders/user/:userId`

Retrieves all orders for a specific user with statistics.

**Query Parameters:**
- `status` (string): Filter by status
- `page` (number): Page number
- `limit` (number): Items per page

**Response (200):**
```json
{
  "success": true,
  "message": "User orders fetched successfully",
  "user": { ... },
  "data": [ ... ],
  "stats": {
    "totalOrders": 10,
    "totalSpent": 5000.00,
    "ordersByStatus": {
      "pending": 2,
      "processing": 1,
      "shipped": 2,
      "delivered": 5,
      "cancelled": 0
    }
  },
  "pagination": { ... }
}
```

#### 5. Update Order Status
**PATCH** `/orders/:id`

Updates the status of an order.

**Request Body:**
```json
{
  "status": "PROCESSING"
}
```

**Valid Statuses:** PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED

**Response (200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": { ... }
}
```

#### 6. Cancel Order
**DELETE** `/orders/:id`

Cancels an order (soft delete).

**Query Parameters:**
- `permanent` (boolean): Permanently delete

**Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "id": "uuid",
    "status": "PENDING"
  }
}
```

---

## Error Handling

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Description of the error"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

---

## Database Models

### User
- Roles: ADMIN, CUSTOMER
- Can have multiple orders and cart items

### Product
- Belongs to a Category
- Has quantity tracking (stock)
- Can appear in cart items and order items

### Category
- Contains multiple products
- Used for organizing products

### CartItem
- Belongs to User and Product
- Tracks quantity
- Unique per user-product combination

### Order
- Belongs to User
- Contains multiple OrderItems
- Statuses: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED

### OrderItem
- Belongs to Order and Product
- Captures price at time of purchase

---

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file with:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
   PORT=5000
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000/api/v1`

---

## Key Features

✅ **Complete CRUD Operations** - All resources support Create, Read, Update, Delete
✅ **Advanced Filtering** - Products support search, category filtering, and sorting
✅ **Pagination** - All list endpoints support pagination
✅ **Soft Deletes** - Records are marked as deleted instead of removed
✅ **Error Handling** - Comprehensive error messages and validation
✅ **Type Safety** - Full TypeScript support with strict mode
✅ **Database Relationships** - Properly modeled with Prisma ORM
✅ **Stock Management** - Product stock tracking and validation

---

## Notes for Beginners

- Each service file handles one resource (users, products, etc.)
- All endpoints follow REST conventions
- Comments in code explain each operation
- Error handling includes validation for all inputs
- Use Postman or similar tools to test endpoints
- Database relationships are maintained through foreign keys
- All timestamps are in ISO 8601 format
