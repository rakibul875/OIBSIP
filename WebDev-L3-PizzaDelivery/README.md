# 🍕 SliceCraft — Pizza Delivery Full-Stack Web Application
> **Oasis Infobyte Internship (OIBSIP) — Web Development & Designing — Level 3 Task**  
> A production-grade, full-stack MERN application featuring a 4-step Custom Pizza Builder, Razorpay payment gateway integration, WebSockets real-time order tracking, and an automated inventory Sentinel driven by `node-cron` & `nodemailer`.

---

## 🌟 Key Features

### 👤 User Experience
* **Authentication & Security:** JWT-based stateless auth, password hashing with `bcryptjs`, email verification link flow, and forgot-password token recovery.
* **Artisan Preset Menu:** Chef-curated signature pizzas fetched dynamically from MongoDB with bestseller badges and category tagging (Veg / Non-Veg).
* **Interactive 4-Step Custom Pizza Builder:**
  * **Step 1:** Dough Base selection (5 distinct artisan crusts).
  * **Step 2:** Gourmet Sauce selection (5 slow-simmered sauces).
  * **Step 3:** Melted Cheese selection (Fior di Latte, Aged Cheddar, Smoked Gouda, Parmigiano, Vegan).
  * **Step 4:** Fresh Farm Vegetables (multi-select toppings with dynamic price summing).
  * **Live Visualizer & Dynamic Pricing:** Real-time visual layer stacking diagram and instant ingredient price calculation.
* **Order Summary & Razorpay Checkout:** Cart management, delivery coordinates validation, test mode Razorpay modal popup, signature verification, and post-payment confetti celebration.
* **Real-time Order Status Tracker:** Instant WebSocket (`Socket.io`) synchronization across stages:  
  `Order Received` ➔ `In Kitchen` ➔ `Sent to Delivery` ➔ `Delivered`.

### 🛡️ Kitchen & Admin Command Center
* **Separate Admin Portal:** Inaccessible through public registration; secured by role-based middleware (`requireAdmin`).
* **Inventory Stock Sentinel:** Categorized dashboard monitoring Bases, Sauces, Cheeses, and Vegetables with visual safety thresholds.
* **Automatic Inventory Deduction:** Upon successful payment verification, the exact quantity of bases, sauces, cheeses, and vegetables used is atomically deducted from MongoDB.
* **Manual Stock Replenishment:** Inline quick-edit to manually update stock counts or thresholds on the fly.
* **Automated Node-Cron Alerts:** Background scheduled worker (`node-cron`) checks inventory levels periodically. If any ingredient falls below safety threshold (e.g., `< 20 units`), an automated alert email is dispatched via `nodemailer`.
* **Real-Time Order Dispatch:** Live incoming order sound/toast notification with a status changer dropdown that broadcasts updates directly to the customer's dashboard in real-time.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, Lucide Icons, Canvas Confetti, Axios, Socket.io-Client, Modern CSS Design System |
| **Backend** | Node.js, Express.js, Socket.io (WebSockets), Node-Cron, Nodemailer |
| **Database** | MongoDB & Mongoose ORM |
| **Payments** | Razorpay Gateway (Test Mode / Sandbox) |
| **Auth** | JSON Web Tokens (JWT), Bcrypt.js, Crypto |

---

## 📁 Repository Directory Structure

```text
WebDev-L3-PizzaDelivery/
│
├── README.md                          # Comprehensive project documentation
│
├── server/                            # Node.js + Express.js Backend
│   ├── .env.example                   # Environment variable template
│   ├── package.json                   # Server dependencies & scripts
│   ├── server.js                      # Main entrypoint, HTTP + Socket.io server
│   ├── config/
│   │   ├── db.js                      # MongoDB Mongoose connection
│   │   ├── mailer.js                  # Nodemailer transporter & email templates
│   │   └── razorpay.js                # Razorpay SDK configuration
│   ├── controllers/
│   │   ├── authController.js          # Register, verify, login, admin login, reset
│   │   ├── inventoryController.js     # Stock querying, manual updates, new items
│   │   ├── orderController.js         # Razorpay checkout, deduction, live tracking
│   │   └── pizzaController.js         # Preset pizza catalog retrieval
│   ├── cron/
│   │   └── inventoryAlertCron.js      # Node-cron background low-stock sentinel
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT verification & Admin role guard
│   ├── models/
│   │   ├── InventoryItem.js           # Bases, sauces, cheeses, veggies schema
│   │   ├── Order.js                   # Orders, delivery address, status history
│   │   ├── Pizza.js                   # Preset pizza catalog schema
│   │   └── User.js                    # User & Admin credentials schema
│   └── utils/
│       └── seedData.js                # Pre-seeds default Admin, 5 Bases, 5 Sauces, Cheeses & Pizzas
│
└── client/                            # React.js + Vite Frontend
    ├── .env.example                   # Client environment variables
    ├── index.html                     # HTML5 entry with Razorpay script & Google Fonts
    ├── package.json                   # Client dependencies & scripts
    ├── vite.config.js                 # Vite dev server configuration
    └── src/
        ├── App.jsx                    # Route mapping & layout wrapper
        ├── index.css                  # Dark artisan glassmorphic design system
        ├── main.jsx                   # React root mounting with context providers
        ├── components/
        │   ├── Footer.jsx             # Footer with OIBSIP credentials & brand info
        │   ├── Navbar.jsx             # Navigation bar with live cart badge & auth state
        │   ├── OrderStatusStepper.jsx # Real-time visual 4-step progress tracker
        │   └── ProtectedRoute.jsx     # User & Admin route guards
        ├── context/
        │   ├── AuthContext.jsx        # JWT session persistence & login/register state
        │   ├── CartContext.jsx        # Shopping cart state & quantity calculations
        │   └── SocketContext.jsx      # WebSockets connection & real-time room manager
        ├── pages/
        │   ├── CustomPizzaBuilder.jsx # 4-step interactive custom pizza studio
        │   ├── ForgotPassword.jsx     # Password reset request flow
        │   ├── Home.jsx               # Hero banner & preset pizza menu cards
        │   ├── Login.jsx              # Customer login page
        │   ├── OrderSummary.jsx       # Order review & Razorpay payment integration
        │   ├── Register.jsx           # Customer registration with email verification
        │   ├── ResetPassword.jsx      # Password reset token confirmation
        │   ├── UserDashboard.jsx      # Real-time order tracking & history
        │   ├── VerifyEmail.jsx        # Email verification confirmation page
        │   └── admin/
        │       ├── AdminDashboard.jsx # Kitchen orders dispatch & inventory sentinel
        │       └── AdminLogin.jsx     # Restricted admin portal sign-in
        └── services/
            └── api.js                 # Axios instance with JWT interceptor
```

---

## ⚙️ Environment Configuration

### Backend (`server/.env`)
Create a `.env` file in `/server` based on `.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/slicecraft_pizza
JWT_SECRET=super_secret_jwt_key_slicecraft_2026_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Razorpay Test Mode Credentials (https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_placeholder_key
RAZORPAY_KEY_SECRET=placeholder_secret_key

# Nodemailer SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password_here
EMAIL_FROM="SliceCraft Artisan Pizza <no-reply@slicecraft.com>"

# Admin Notifications & Sentinel Threshold
ADMIN_EMAIL=admin@slicecraft.com
LOW_STOCK_THRESHOLD=20
```
> **Note on Email & Razorpay Sandbox:** If SMTP or Razorpay test keys are left at defaults, the server runs in built-in **Development Simulation Mode**. Email verification links and password reset tokens will be logged directly to the server terminal, and Razorpay provides simulated payment flow so that development and evaluation are never blocked!

### Frontend (`client/.env`)
Create a `.env` file in `/client`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Step-by-Step Installation & Running Guide

### 1. Prerequisites
Ensure you have installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally or a MongoDB Atlas connection string.

### 2. Backend Setup
Open a terminal in the project directory:
```bash
# Navigate to server
cd OIBSIP/WebDev-L3-PizzaDelivery/server

# Install dependencies
npm install

# (Optional) Seed the database manually, or let it auto-seed on first start
npm start
```
*The server will automatically connect to MongoDB, seed the default Admin user, default 5 bases, 5 sauces, 5 cheeses, 8 vegetables, and 6 preset pizzas, and start listening on port 5000.*

### 3. Frontend Setup
Open a second terminal:
```bash
# Navigate to client
cd OIBSIP/WebDev-L3-PizzaDelivery/client

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**

---

## 🔑 Default Pre-Seeded Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@slicecraft.com` | `Admin@12345` | `/admin/login` ➔ `/admin/dashboard` |
| **User** | Register via `/register` | Custom | `/login` ➔ `/dashboard` |

---

## 🔌 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register user & send verification email.
- `GET  /api/auth/verify-email/:token` — Verify user email address.
- `POST /api/auth/login` — Customer login (requires email verification).
- `POST /api/auth/admin/login` — Dedicated admin portal login.
- `POST /api/auth/forgot-password` — Dispatch reset password email.
- `POST /api/auth/reset-password` — Set new password using token.
- `GET  /api/auth/me` — Get authenticated user details.

### 🥦 Inventory Sentinel (`/api/inventory`)
- `GET  /api/inventory` — Get all inventory items (categorized for custom builder).
- `PUT  /api/inventory/:id` — Manual update of stock count/threshold *(Admin only)*.
- `POST /api/inventory` — Add new ingredient *(Admin only)*.

### 🍕 Pizza Catalog (`/api/pizzas`)
- `GET  /api/pizzas` — Get all signature preset pizzas.
- `POST /api/pizzas` — Create new preset pizza *(Admin only)*.

### 📦 Orders & Checkout (`/api/orders`)
- `POST /api/orders/create-razorpay-order` — Check stock & initialize Razorpay order.
- `POST /api/orders/verify-payment` — Verify HMAC signature, deduct stock & save order.
- `GET  /api/orders/my-orders` — Get current logged-in customer's orders.
- `GET  /api/orders/detail/:id` — Get single order details.
- `GET  /api/orders/admin/all` — Get all customer orders with filters *(Admin only)*.
- `PUT  /api/orders/:id/status` — Update order status in real-time *(Admin only)*.

---

## ⚡ Real-Time WebSockets Events (`Socket.io`)

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `joinOrderRoom` | Client ➔ Server | `orderId` | Customer joins private room for their order |
| `joinAdminRoom` | Client ➔ Server | — | Admin joins kitchen operations room |
| `orderStatusUpdated` | Server ➔ Client | `{ orderId, newStatus }` | Broadcasts real-time order status change |
| `newIncomingOrder` | Server ➔ Client | `order` | Kitchen admin ding/toast on incoming orders |
| `inventoryBatchUpdated` | Server ➔ Client | `[updatedItems]` | Notifies admin & builder of stock deduction |

---

## 👨‍💻 Author & Acknowledgements
- **Developer:** Oasis Infobyte Full-Stack Web Development Intern
- **Project Domain:** Level 3 Task — Pizza Delivery Application
- **Organization:** [Oasis Infobyte (OIBSIP)](https://oasisinfobyte.com/)
