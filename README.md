# Zenvia API (Backend)

Zenvia API is a robust and scalable **ecommerce backend** built to power the Zenvia platform.  
It provides secure authentication, product management, orders, payments, cart, and admin operations via RESTful APIs.

---

## 🚀 Overview

The Zenvia backend is designed to handle core ecommerce operations with a strong focus on security, scalability, and clean architecture.  
It supports both **admin** and **user** workflows, integrates with **Stripe for payments**, and includes **OAuth authentication**.

---

## ✨ Features

- Secure authentication & authorization
- Admin management (products, users, orders, payments, reports)
- User cart and order management
- Product and category management
- Stripe payment integration
- Google & GitHub OAuth authentication
- RESTful API architecture
- Role-based access control (Admin & User)

---

## 🛠️ Tech Stack

- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT, OAuth (Google & GitHub)  
- **Payments:** Stripe  
- **Environment Management:** dotenv  
- **Package Manager:** npm  

---

## 📌 API Modules & Routes

### 🔐 Admin Authentication
- `POST /api/admin/admin-account/create` – Create admin account  
- `DELETE /api/admin/admin-account/delete` – Delete admin account  
- `GET /api/admin/admin-all` – Get all admins  

---

### 📦 Admin Products
- `POST /api/admin/product` – Create product  
- `GET /api/admin/product` – Get all products  
- `GET /api/admin/product/{id}` – Get single product  
- `PUT /api/admin/product/{id}` – Update product  
- `DELETE /api/admin/product/{id}` – Delete product  
- `PATCH /api/admin/product/{id}/stock` – Update product stock  

---

### 🗂️ Admin Categories
- `POST /api/admin/categories` – Create category  
- `GET /api/admin/categories` – Get all categories  
- `PUT /api/admin/categories/{id}` – Update category  
- `DELETE /api/admin/categories/{id}` – Delete category  

---

### 👥 Admin Users
- `GET /api/admin/users` – Get all users  
- `GET /api/admin/users/{id}` – Get user by ID  
- `PUT /api/admin/users/{id}` – Update user  
- `DELETE /api/admin/users/{id}` – Delete user  
- `PATCH /api/admin/users/{id}/ban` – Ban user  

---

### 🛒 Admin Orders
- `GET /api/admin/orders` – Get all orders  
- `GET /api/admin/orders/{id}` – Get order by ID  
- `DELETE /api/admin/orders/{id}` – Delete order  
- `PATCH /api/admin/orders/{id}/status` – Update order status  

---

### 💳 Admin Payments
- `GET /api/admin/payments` – Get all payments  
- `GET /api/admin/payments/{id}` – Get payment by ID  
- `PATCH /api/admin/payments/{id}/refund` – Refund payment  

---

### 🚚 Admin Shipping
- `POST /api/admin/shipping-method` – Create shipping method  
- `GET /api/admin/shipping-method` – Get all shipping methods  
- `PUT /api/admin/shipping-method/{id}` – Update shipping method  
- `DELETE /api/admin/shipping-method/{id}` – Delete shipping method  

---

### 📊 Admin Reports
- `GET /api/admin/reports/sales` – Sales report  
- `GET /api/admin/reports/revenue` – Revenue report  
- `GET /api/admin/reports/users` – User report  

---

### 🛍️ Admin Cart
- `GET /api/admin/get-all-cart` – Get all carts  

---

### 🔐 Authentication (Users)
- `POST /api/auth/register` – Register user  
- `POST /api/auth/login` – Login user  
- `POST /api/auth/logout` – Logout user  
- `POST /api/auth/forget-password` – Request password reset  
- `POST /api/auth/reset-password` – Reset password  
- `POST /api/auth/verify-account` – Verify account  
- `GET /api/auth/me` – Get logged-in user  
- `PUT /api/auth/users/{id}` – Update user details  

---

### 🛒 Cart (User)
- `GET /api/cart` – Get user cart  
- `POST /api/cart` – Add to cart  
- `PUT /api/cart` – Update cart quantity  
- `DELETE /api/cart` – Clear cart  
- `DELETE /api/cart/{productId}` – Remove product  

---

### 🗂️ Categories (Public)
- `GET /api/categories` – Get all categories  
- `GET /api/categories/{id}` – Get category by ID  
- `GET /api/categories/slug/{slug}` – Get category by slug  

---

### 🔑 OAuth
- `GET /api/auth/google` – Google authentication  
- `GET /api/auth/google/callback` – Google callback  
- `GET /api/auth/github` – GitHub authentication  
- `GET /api/auth/github/callback` – GitHub callback  

---

### 📦 Orders (User)
- `POST /api/order/place-orders` – Place order  
- `GET /api/order/my-orders` – Get user orders  
- `GET /api/order/orders/{id}` – Get order by ID  
- `PATCH /api/order/orders/{id}/cancel` – Cancel order  
- `GET /api/order/last-shipping` – Get last shipping info  

---

### 💳 Payments
- `POST /api/payment/create` – Create Stripe payment  
- `POST /api/payment/webhook` – Stripe webhook  

---

### 🛍️ Products (Public)
- `GET /api/product` – Get all products  
- `GET /api/product/{id}` – Get product by ID  

---

## ⚙️ Installation & Setup

1. Clone the repository:
```
git clone https://github.com/OMOLADESUNDAY/zenviaAPI.git
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file and configure environment variables:
```
MONGO_URI
PORT
GMAIL_USER
 GMAIL_APP_PASSWORD
REDIS_URL
EMAIL_FROM
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GOOGLE_CALLBACK_URL
JWT_SECRET
GITHUB_CALLBACK_URL
STRIPE_SECRET_KEY
CLOUDINARY_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
STRIPE_WEBHOOK_SECRET

```

4. Start the server:
```
npm run dev
```
---

## 👤 Author

### Omolade Sunday  
### Full-Stack Developer  
### Focused on building secure, scalable, real-world backend systems.
