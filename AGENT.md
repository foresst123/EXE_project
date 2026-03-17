You are a senior full-stack engineer.

Your task is to design and generate a complete e-commerce web application from scratch.

PROJECT OVERVIEW
Build a small online store where users can browse products, add items to cart, and place orders.

TECH STACK
Frontend:

- React + Vite
- TailwindCSS
- Axios for API calls

Backend:

- Node.js + Express
- REST API architecture
- JWT authentication

Database:

- PostgreSQL

Dev Tools:

- Docker support
- Environment variables
- ESLint + Prettier

FEATURES

User features:

- Register / Login
- Browse product catalog
- Product search
- Product detail page
- Shopping cart
- Checkout
- Order history

Admin features:

- Admin login
- CRUD products
- Manage orders
- Manage users

DATABASE SCHEMA

Tables:
Users

- id
- name
- email
- password_hash
- role
- created_at

Products

- id
- name
- description
- price
- stock
- category_id
- created_at

Categories

- id
- name

Orders

- id
- user_id
- status
- total_price
- created_at

OrderItems

- id
- order_id
- product_id
- quantity
- price

CartItems

- id
- user_id
- product_id
- quantity

API ENDPOINTS

Auth
POST /api/auth/register
POST /api/auth/login

Products
GET /api/products
GET /api/products/:id
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id

Orders
POST /api/orders
GET /api/orders
GET /api/orders/:id

Cart
GET /api/cart
POST /api/cart/add
DELETE /api/cart/remove

OUTPUT REQUIREMENTS

Generate:

1. Complete project folder structure
2. Backend code (Express + PostgreSQL)
3. Database schema and migration SQL
4. API routes and controllers
5. Frontend pages and components
6. Example .env configuration
7. Sample seed data
8. Instructions to run locally

CODE QUALITY REQUIREMENTS

- Use clean architecture
- Separate controllers, services, and routes
- Use async/await
- Add validation and error handling
- Use secure password hashing (bcrypt)
- Use environment variables for secrets

EXTRA

Add:

- pagination
- product filtering
- basic UI design
- loading and error states
