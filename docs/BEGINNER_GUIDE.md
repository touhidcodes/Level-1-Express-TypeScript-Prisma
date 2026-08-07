# Beginner's Guide to the E-Commerce API

Welcome! This guide explains how the code is organized and how each part works.

## Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts             # Server entry point
├── routes/
│   └── index.ts          # All API routes registration
├── services/             # Business logic for each resource
│   ├── users.ts          # User endpoints
│   ├── products.ts       # Product endpoints
│   ├── categories.ts     # Category endpoints
│   ├── cartItems.ts      # Shopping cart endpoints
│   └── orders.ts         # Order endpoints
└── lib/
    └── prisma.ts         # Database connection setup
```

## Understanding Each Service

### 1. **Users Service** (`src/services/users.ts`)
Handles everything related to user accounts.

**What it does:**
- Create new user accounts
- View user profiles
- Update user information
- Delete users

**Real-world example:**
When a customer signs up, the user service creates a new record in the database with their name, email, and password.

**Key endpoints:**
```
POST   /users           - Register new user
GET    /users           - View all users
GET    /users/:id       - View specific user
PATCH  /users/:id       - Update user details
DELETE /users/:id       - Delete user account
```

### 2. **Products Service** (`src/services/products.ts`)
Manages the products for sale.

**What it does:**
- Add new products to the store
- Search and filter products
- View product details
- Update product information
- Remove products

**Real-world example:**
When you search for "laptop" on Amazon, the products service searches all products and returns matching results with pagination.

**Key endpoints:**
```
POST   /products                   - Add new product
GET    /products                   - List products (with search/filter)
GET    /products/:id               - View product details
PATCH  /products/:id               - Update product info
DELETE /products/:id               - Remove product
```

**Advanced features:**
- **Search:** Find products by title or description
- **Filter by Category:** Show only products from specific category
- **Sorting:** Sort by price or date (ascending/descending)
- **Pagination:** Display results in pages (10 items per page by default)

### 3. **Categories Service** (`src/services/categories.ts`)
Organizes products into groups.

**What it does:**
- Create product categories
- View categories
- Update category names
- Delete categories

**Real-world example:**
On an e-commerce site, "Electronics", "Clothing", and "Books" are categories. Each category contains many products.

**Key endpoints:**
```
POST   /categories       - Create category
GET    /categories       - List all categories
GET    /categories/:id   - View category & its products
PATCH  /categories/:id   - Update category name
DELETE /categories/:id   - Delete category
```

### 4. **Cart Items Service** (`src/services/cartItems.ts`)
Manages shopping carts.

**What it does:**
- Add products to cart
- View items in cart
- Change quantity of items
- Remove items from cart
- Calculate total price

**Real-world example:**
When you add a laptop and 2 keyboards to your cart on Amazon, the cart service stores this information. When you view your cart, it shows all items with quantities and total price.

**Key endpoints:**
```
POST   /cart-items               - Add item to cart
GET    /cart-items               - List all cart items
GET    /cart-items/user/:userId  - View user's complete cart
PATCH  /cart-items/:id           - Change item quantity
DELETE /cart-items/:id           - Remove item from cart
DELETE /cart-items/user/:userId  - Clear entire cart
```

**Special features:**
- **Cart Summary:** Shows total items, quantity, and total price
- **Duplicate Prevention:** Can't add same product twice (quantity is updated instead)
- **Stock Validation:** Won't let you add more items than available

### 5. **Orders Service** (`src/services/orders.ts`)
Handles purchase orders.

**What it does:**
- Create orders from cart
- View order history
- Update order status
- Track order progress

**Real-world example:**
When you click "Checkout" on an e-commerce site, the orders service converts your cart into an order with status "PENDING". As the seller processes it, status changes to "PROCESSING", then "SHIPPED", then "DELIVERED".

**Key endpoints:**
```
POST   /orders               - Create new order
GET    /orders               - List all orders
GET    /orders/:id           - View order details
GET    /orders/user/:userId  - View user's orders
PATCH  /orders/:id           - Update order status
DELETE /orders/:id           - Cancel order
```

**Order Statuses:**
1. **PENDING** - Customer placed order, waiting for processing
2. **PROCESSING** - Admin is preparing the order
3. **SHIPPED** - Order sent to customer
4. **DELIVERED** - Customer received order
5. **CANCELLED** - Order was cancelled

## How Data Flows Through the System

### Example: Placing an Order

```
1. User adds product to cart
   └─ POST /cart-items
   └─> CartItem created in database

2. User adds another product to cart
   └─ POST /cart-items
   └─> Another CartItem created

3. User clicks "Buy Now"
   └─ POST /orders
   └─> Order created with all cart items
   └─> Cart is automatically cleared

4. Admin receives order notification
   └─ PATCH /orders/:id with status = "PROCESSING"
   └─> Order status updated

5. Admin ships package
   └─ PATCH /orders/:id with status = "SHIPPED"
   └─> Order status updated

6. Customer receives package
   └─ PATCH /orders/:id with status = "DELIVERED"
   └─> Order marked as delivered
```

## Understanding Request/Response

### Request Structure

All requests have three parts:

**1. Path Parameters** (in URL)
```
GET /users/:id
          ↑ path parameter (the user's ID)
```

**2. Query Parameters** (in URL after ?)
```
GET /products?categoryId=cat-123&page=1&limit=10
           ↑ query parameters
```

**3. Body** (for POST, PATCH - sent as JSON)
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Response Structure

All responses follow this format:

```json
{
  "success": true,              // true if successful, false if error
  "message": "User created",    // Human-readable message
  "data": {                     // The actual data (empty if error)
    "id": "uuid",
    "name": "John Doe"
  }
}
```

## Common Code Patterns

### 1. Validating Input
```typescript
if (!email || !password) {
  return res.status(400).json({
    success: false,
    message: "Email and password are required"
  });
}
```
**What it does:** Checks if required data is provided before processing.

### 2. Checking if Record Exists
```typescript
const user = await prisma.user.findUnique({
  where: { id }
});

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found"
  });
}
```
**What it does:** Makes sure the resource exists before using it.

### 3. Creating a Record
```typescript
const newProduct = await prisma.product.create({
  data: {
    title: "Laptop",
    price: 999.99,
    categoryId: "cat-123"
  }
});
```
**What it does:** Adds new data to database.

### 4. Pagination
```typescript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const products = await prisma.product.findMany({
  skip,
  take: limit
});
```
**What it does:** Shows results in pages (10 items per page).

## Error Handling

Most operations can fail in different ways:

| Error | What It Means | Example |
|-------|--------------|---------|
| 400 Bad Request | Invalid input | Missing required fields |
| 404 Not Found | Resource doesn't exist | User ID doesn't exist |
| 500 Server Error | Something broke | Database connection failed |

Every error includes a message explaining what went wrong.

## Testing the API

### Using cURL (Command Line)

**Create a user:**
```bash
curl -X POST http://localhost:5000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get all users:**
```bash
curl http://localhost:5000/api/v1/users
```

### Using Postman (Recommended)

1. Download [Postman](https://www.postman.com/downloads/)
2. Create new requests by selecting method (GET, POST, etc.)
3. Enter URL: `http://localhost:5000/api/v1/users`
4. Add headers: `Content-Type: application/json`
5. Add body for POST/PATCH requests
6. Click "Send"

## Key Concepts for Beginners

### 1. **REST API**
- **GET** = Read data (don't change anything)
- **POST** = Create new data
- **PATCH** = Update existing data
- **DELETE** = Remove data

### 2. **Prisma ORM**
Prisma is a tool that lets us interact with the database using JavaScript instead of SQL.

Instead of writing SQL:
```sql
SELECT * FROM users WHERE id = '123'
```

We write JavaScript:
```javascript
const user = await prisma.user.findUnique({
  where: { id: '123' }
});
```

### 3. **Soft Delete**
When you delete something, we don't actually remove it from the database. We just mark it as deleted by setting `isDeleted = true`. This way we can restore it later if needed.

### 4. **Foreign Keys**
Products belong to Categories. Each product has a `categoryId` that links it to a category. This is called a relationship.

### 5. **Pagination**
Instead of returning 10,000 products at once, we return them in pages:
- Page 1: Products 1-10
- Page 2: Products 11-20
- Page 3: Products 21-30

This makes the API faster and uses less memory.

## Running the API

```bash
# Install dependencies
npm install

# Start the server
npm run dev

# The API is now running at:
http://localhost:5000/api/v1
```

## Next Steps

1. **Read the comments** in the service files to understand how each operation works
2. **Try each endpoint** using Postman or cURL
3. **Look at error messages** when something fails - they're helpful!
4. **Modify and experiment** - change response messages, add validations, etc.
5. **Read the API_DOCUMENTATION.md** for detailed endpoint information

## Tips for Learning

1. **Comments explain everything** - Every line of code has a comment explaining what it does
2. **Error messages are helpful** - If something goes wrong, the error message tells you why
3. **Test incrementally** - Create a user first, then try other operations
4. **Use Postman** - It's easier than command line for learning
5. **Check the code** - When confused, read the service files - they're thoroughly commented

## FAQ

**Q: What's the difference between POST and PATCH?**
A: POST creates something new. PATCH updates existing data.

**Q: Why do we have categories?**
A: To organize products. Makes searching easier. "Electronics", "Clothing", etc.

**Q: Can I add the same product twice to my cart?**
A: No. The second time, the quantity is increased instead.

**Q: What happens to my cart when I create an order?**
A: It's automatically cleared.

**Q: Can I change my password after account creation?**
A: Currently no. We only handle basic updates. You'd need to add a password change endpoint.

**Q: What's a UUID?**
A: A unique identifier (like a serial number) for each record in the database.

---

## Need Help?

- **Error messages** - Read them carefully, they explain what went wrong
- **Comments in code** - Every service file has detailed comments
- **API_DOCUMENTATION.md** - Has all endpoint details and examples
- **Check request format** - Make sure you're sending the right data in the right format

Happy learning! 🚀
