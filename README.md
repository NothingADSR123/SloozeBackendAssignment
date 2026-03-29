# Food Ordering System - REST API

A production-ready backend REST API for a food ordering system with role-based and country-based access control.

## 🚀 Live Deployment

👉 Base URL  
https://sloozebackendassignment.onrender.com

👉 Health Check Endpoint  
https://sloozebackendassignment.onrender.com/api/health

✅ If the server is running, it will return:
{
  "success": true,
  "message": "Server is running"
}

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Joi Validation
- bcryptjs for password hashing

## Features

### User Roles
- **Admin**: Full access to all operations and all countries
- **Manager**: Can place/cancel orders, view restaurants (own country only)
- **Member**: Can create orders, view restaurants (own country only)

### Country-Based Access Control
- Users belong to either **India** or **America**
- Managers and Members can only see and interact with data from their own country
- Admin has unrestricted access to all countries

### Core Functionality
- User authentication (register/login) with JWT
- View restaurants and menus (filtered by country)
- Create orders (all roles)
- Place orders - checkout (Admin & Manager only)
- Cancel orders (Admin & Manager only)
- Update payment method (Admin only)
- View orders (filtered by role and country)

## Project Structure

```
food-ordering-api/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User model
│   │   ├── Restaurant.js         # Restaurant model
│   │   └── Order.js              # Order model
│   ├── middleware/
│   │   ├── auth.js               # JWT verification, RBAC, country filtering
│   │   └── errorHandler.js       # Global error handler
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   ├── restaurantController.js
│   │   └── orderController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── restaurantRoutes.js
│   │   └── orderRoutes.js
│   └── server.js                 # Entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd food-ordering-api
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
copy .env.example .env
```

4. Configure environment variables in `.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/food-ordering
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

5. Start MongoDB (if running locally)
```bash
mongod
```

6. Run the server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Manager",
  "country": "India"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Manager",
      "country": "India"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register

---

### Restaurants

#### Get All Restaurants
```http
GET /api/restaurants
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "name": "Spice Kitchen",
      "country": "India",
      "menuItems": [
        { "name": "Butter Chicken", "price": 350 },
        { "name": "Naan", "price": 50 }
      ]
    }
  ]
}
```

**Note:** Managers and Members only see restaurants from their country. Admin sees all.

---

### Orders

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "name": "Butter Chicken",
      "price": 350,
      "quantity": 2
    },
    {
      "name": "Naan",
      "price": 50,
      "quantity": 3
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "items": [...],
    "totalAmount": 850,
    "status": "CREATED",
    "country": "India",
    "paymentMethod": "Cash"
  }
}
```

#### Get All Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

**Note:** Filtered by country for Manager/Member. Admin sees all orders.

#### Place Order (Checkout)
```http
POST /api/orders/:id/place
Authorization: Bearer <token>
```

**Access:** Admin, Manager only

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "_id": "...",
    "status": "PLACED",
    ...
  }
}
```

**Member Access:**
```json
{
  "success": false,
  "message": "Access denied. Members cannot place orders."
}
```

#### Cancel Order
```http
POST /api/orders/:id/cancel
Authorization: Bearer <token>
```

**Access:** Admin, Manager only

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "_id": "...",
    "status": "CANCELLED",
    ...
  }
}
```

#### Update Payment Method
```http
PATCH /api/orders/:id/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "Credit Card"
}
```

**Access:** Admin only

**Response:**
```json
{
  "success": true,
  "message": "Payment method updated successfully",
  "data": {...}
}
```

---

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-03-29T10:30:00.000Z"
}
```

## Sample Postman Collection

### 1. Register Admin (India)
```
POST http://localhost:5000/api/auth/register
Body: {
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "Admin",
  "country": "India"
}
```

### 2. Register Manager (America)
```
POST http://localhost:5000/api/auth/register
Body: {
  "name": "Manager USA",
  "email": "manager@example.com",
  "password": "manager123",
  "role": "Manager",
  "country": "America"
}
```

### 3. Register Member (India)
```
POST http://localhost:5000/api/auth/register
Body: {
  "name": "Member India",
  "email": "member@example.com",
  "password": "member123",
  "role": "Member",
  "country": "India"
}
```

### 4. Login and Get Token
```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "admin@example.com",
  "password": "admin123"
}
```
Copy the token from response

### 5. Create Order (Any Role)
```
POST http://localhost:5000/api/orders
Headers: Authorization: Bearer <your_token>
Body: {
  "items": [
    {"name": "Pizza", "price": 500, "quantity": 2},
    {"name": "Coke", "price": 50, "quantity": 2}
  ]
}
```

### 6. Place Order (Admin/Manager Only)
```
POST http://localhost:5000/api/orders/<order_id>/place
Headers: Authorization: Bearer <your_token>
```

### 7. View All Orders
```
GET http://localhost:5000/api/orders
Headers: Authorization: Bearer <your_token>
```

## Access Control Matrix

| Action | Admin | Manager | Member |
|--------|-------|---------|--------|
| Register/Login | ✅ | ✅ | ✅ |
| View Restaurants | ✅ All | ✅ Own Country | ✅ Own Country |
| Create Order | ✅ | ✅ | ✅ |
| Place Order | ✅ | ✅ | ❌ |
| Cancel Order | ✅ | ✅ | ❌ |
| Update Payment | ✅ | ❌ | ❌ |
| View Orders | ✅ All | ✅ Own Country | ✅ Own Country |

## Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['Admin', 'Manager', 'Member'],
  country: Enum ['India', 'America']
}
```

### Restaurant
```javascript
{
  name: String,
  country: Enum ['India', 'America'],
  menuItems: [{
    name: String,
    price: Number
  }]
}
```

### Order
```javascript
{
  userId: ObjectId (ref: User),
  items: [{
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,
  status: Enum ['CREATED', 'PLACED', 'CANCELLED'],
  paymentMethod: String,
  country: Enum ['India', 'America']
}
```

## Error Handling

All errors return consistent format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

## Security Features

- Passwords hashed with bcryptjs (12 rounds)
- JWT tokens with expiration
- Role-based access control (RBAC)
- Country-based data isolation
- Input validation with Joi
- MongoDB injection protection via Mongoose
- CORS enabled

## Testing the Country-Based Access Control

1. Create a Manager user in India
2. Create a Manager user in America
3. Create restaurants in both countries (manually via MongoDB)
4. Login as India Manager - should only see India restaurants
5. Login as America Manager - should only see America restaurants
6. Login as Admin - should see all restaurants

## Seeding Sample Data (Optional)

You can manually insert sample data via MongoDB shell or Compass:

```javascript
// Sample Restaurants
db.restaurants.insertMany([
  {
    name: "Spice Kitchen",
    country: "India",
    menuItems: [
      { name: "Butter Chicken", price: 350 },
      { name: "Naan", price: 50 },
      { name: "Biryani", price: 400 }
    ]
  },
  {
    name: "American Diner",
    country: "America",
    menuItems: [
      { name: "Burger", price: 12 },
      { name: "Fries", price: 5 },
      { name: "Milkshake", price: 8 }
    ]
  }
])
```
