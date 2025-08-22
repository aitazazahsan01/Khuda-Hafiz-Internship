# 🚀 ProductTracker - Offer Alert System

ProductTracker is a full-stack web application designed to help a person or a team keep track of products, their prices from various stores, and special time-sensitive offers. It features a role-based system, allowing administrators to manage all data while regular users have view-only permissions.



## ✨ Key Features

* **Product & Offer Management:** Add products with multiple sources (stores), each with its own price and offer dates.
* **User & Role Management:** A secure authentication system with two roles: **Administrator** (full control) and **User**.
* **Category Management:** Organize products into custom categories for better filtering and analysis.
* **Secure, Role-Based Access Control:** Backend API routes are protected to ensure only authorized users (e.g., admins) can perform sensitive actions like adding, updating, or deleting data.
* **Price Calculator:** A built-in tool to calculate optimal selling prices based on configurable costs, commissions, and VAT.
* **Statistics Panel:** A visual dashboard to see statistics about products, top contributors, and popular categories.

## 🛠️ Tech Stack

### Frontend
* **Framework:** React (with Vite)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **UI Components:** Shadcn/UI
* **State Management:** React Query for server state

### Backend
* **Framework:** Node.js with Express.js
* **Database:** MySQL
* **Authentication:** Custom implementation using JSON Web Tokens (JWT)
* **Security:** Password hashing with Bcrypt, role-based middleware

## 🔄 Project Migration Overview

This project underwent a complete backend migration from a third-party BaaS (Backend as a Service) to a custom, self-hosted solution.

The primary goal was to move from **Supabase** to a **Node.js/Express + MySQL** stack to gain more control, flexibility, and a deeper understanding of the full-stack architecture.

The migration involved the following key tasks:
1.  **Replaced Supabase DB with MySQL:** Designed and implemented a new relational database schema from scratch.
2.  **Built a Custom Node.js/Express API:** Created a full RESTful API with endpoints for all CRUD (Create, Read, Update, Delete) operations for products, users, and categories.
3.  **Implemented Custom Authentication:** Replaced Supabase Auth with a secure, JWT-based login system, including password hashing (`bcrypt`) and token generation.
4.  **Established Role-Based Access Control:** Implemented server-side middleware to protect sensitive API routes, ensuring actions are restricted based on user roles (e.g., only admins can add products).
5.  **Refactored the Frontend:** Updated all frontend components to communicate with the new custom API using `fetch`, completely removing the Supabase client and its dependencies.

## ⚙️ Local Setup and Installation

To run this project locally, you need to set up both the backend server and the frontend application.

### Backend Setup

1.  **Navigate to the backend folder:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    * Create a file named `.env` inside the `backend` folder.
    * Add your database credentials and a secure JWT secret:
        ```
        # .env file
        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=your_mysql_password
        DB_DATABASE=offer_alert_system
        JWT_SECRET=your_super_long_and_random_secret_key
        ```
4.  **Set up the database:**
    * Make sure you have created the `offer_alert_system` database.
    * Run the SQL commands in `MYSQLCodeBase.sql` (or the `CREATE TABLE` commands we built) to create all the necessary tables.
5.  **Create an admin user:**
    * Run the one-time script to add your first admin user to the database:
        ```bash
        npx ts-node addUser.ts
        ```
6.  **Start the backend server:**
    ```bash
    node server.js
    ```
    The server should now be running on `http://localhost:3001`.

### Frontend Setup

1.  **Navigate to the root project folder** (if you are in the `backend` folder, go back one level with `cd ..`).
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The application should now be running, typically on `http://localhost:5173` or a similar port.

## 📄 License

This project is licensed under the MIT License.
