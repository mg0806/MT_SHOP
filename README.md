# 🖼️ Art Store - E-commerce Website

Welcome to **Art Store**, a full-featured e-commerce web application built to buy and sell artworks. This project is powered by modern technologies including **Next.js**, **MongoDB Atlas**, **Firebase**, **Razorpay**, **Shiprocket**, and **Nodemailer**.

---

## 🚀 Tech Stack

- **Frontend:** Next.js (React, SSR & SSG)
- **Database:** MongoDB Atlas (Cloud-based NoSQL)
- **Authentication & Storage:** Firebase
- **Payment Gateway:** Razorpay
- **Shipping Integration:** Shiprocket API
- **Email Service:** Nodemailer

---

## 🛠 Features

- 🔐 User authentication (login/signup with Firebase)
- 🖼️ Product catalog for artworks
- 🛒 Cart & checkout flow
- 💳 Secure online payments using Razorpay
- 🚚 Order fulfillment via Shiprocket API
- 📬 Email notifications (order confirmation, updates) with Nodemailer
- 📦 Admin panel for managing orders & inventory

---

## 📁 Project Structure

```
/art-store
│
├── /app                # Next.js pages (Routing)
├── /components         # Reusable components
├── /pages              # pages
├── /public             # Static assets
├── /utils              # Utility functions (API handlers, helpers)
├── /lib                # Firebase config, DB connection, etc.
├── /models             # MongoDB models (Product, Order, User)
├── /api                # API routes for products, orders, payments
├── .env.local          # Environment variables
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/art-store.git
cd art-store
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

---

### 3. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Set up a new cluster.
3. Under **Database Access**, add a new user with a username and password.
4. Under **Network Access**, whitelist your IP or allow access from anywhere (`0.0.0.0/0`).
5. Get your connection string. It looks like this:

```
mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
```

---

### 4. Set Up Environment Variables

Create a `.env.local` file in the root and add:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority

# Firebase
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=sender_id
FIREBASE_APP_ID=app_id

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Nodemailer
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password_or_app_password

# Shiprocket
SHIPROCKET_EMAIL=your_email
SHIPROCKET_PASSWORD=your_password
```

---

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

## 📦 Deployment

You can deploy this app to **Vercel** (recommended for Next.js) or any Node.js-compatible hosting provider. Make sure to include all your environment variables in the deployment platform settings.

---

## ✅ To-Do / Future Enhancements
 
- 🔄 Wishlist functionality  
- 🌐 Internationalization (i18n)  
- 📱 Progressive Web App (PWA) support  

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📬 Contact

For any feedback or questions, reach out at [manohargupta0806@gmail.com](mailto:manohargupta0806@gmail.com)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
