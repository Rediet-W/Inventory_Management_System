# Inventory Management System

## 📌 Features

- 📦 **Product Management**: Add, edit, delete, and view products with quantity tracking.
- 🔄 **Sales Tracking**: Record sales transactions, auto-deduct from inventory.
- 📊 **Reports & Summary**: View sales and purchase summaries with date filtering.
- 📋 **Requested Products**: Users can request unavailable products for stock consideration.
- 🔑 **Authentication & Authorization**: Secure login with user roles (Admin, User, Viewer).
- 🛠 **Role-Based Access**: Admins manage inventory, users track sales, and viewers access reports.

## 📡 API Endpoints

### 🔑 **Authentication**

```http
POST /api/auth/register
```

Registers a new user.

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

```http
POST /api/auth/login
```

Logs in a user and returns a token.

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### 📦 **Products**

```http
GET /api/products
```

Fetches all products.

```http
POST /api/products
```

Adds a new product.

```json
{
  "name": "Laptop",
  "quantity": 10,
  "buyingPrice": 500,
  "sellingPrice": 700
}
```

```http
PUT /api/products/:id
```

Updates a product by ID.

```http
DELETE /api/products/:id
```

Deletes a product by ID.

### 🔄 **Sales**

```http
GET /api/sales?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

Fetches sales within a date range.

```http
POST /api/sales
```

Records a sale.

```json
{
  "productId": "12345",
  "quantity": 2,
  "sellingPrice": 750
}
```

### 📝 **Requested Products**

```http
GET /api/requested-products
```

Fetches all requested products.

```http
POST /api/requested-products
```

Adds a requested product.

```json
{
  "name": "Wireless Mouse",
  "description": "Needed for customers."
}
```

```http
DELETE /api/requested-products/:id
```

Deletes a requested product by ID.

### 📊 **Reports & Summary**

```http
GET /api/reports
```

Fetches inventory reports.

```http
GET /api/summary
```

Fetches a summarized view of sales and purchases.

---

📌 **Further instructions on how to run the project will be added after Docker setup.**
