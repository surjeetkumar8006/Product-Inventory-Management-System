# Product Inventory Management System

A robust, full-stack Product Inventory Management System built using the MERN stack (MongoDB, Express.js, React, Node.js). 

## 🚀 Features
- **Secure Authentication:** JWT-based user registration and login with bcrypt password hashing.
- **Interactive Dashboard:** Real-time metrics overview including Total Products, Total Categories, and Products Added Today, complete with beautiful charts (Recharts).
- **Product Management:** Full CRUD capabilities for products.
- **Advanced Listing:** Client-side and server-side pagination (10 items/page), searching by name, filtering by category/status, and sorting by price.
- **Modern UI/UX:** Fully responsive, premium glassmorphism design with seamless Light/Dark mode toggling.

## 🛠️ Technology Stack
- **Frontend:** React, Vite, React Router DOM, Axios, Recharts, Lucide React (Icons).
- **Backend:** Node.js, Express.js, MongoDB, Mongoose.
- **Authentication:** JSON Web Tokens (JWT).

## 📋 Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd <repo-name>
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory based on the `.env.example` file provided:
```bash
cp .env.example .env
```
*Ensure you update `MONGO_URI` with your own MongoDB connection string if you wish to use a different database.*

Start the backend server:
```bash
npm start
# or 'node server.js'
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

### 4. Access the Application
Open your browser and navigate to: `http://localhost:5173`

## 📚 API Documentation
*Include link to your Postman Collection or Swagger documentation here*

## 🌐 Live Demo
*Include link to your deployed application here (e.g., Vercel for frontend, Render/Railway for backend)*
