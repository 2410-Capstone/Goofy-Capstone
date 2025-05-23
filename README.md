# DiscogMVP

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Backend-Express-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?logo=stripe&logoColor=white)
![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?logo=node.js&logoColor=white)

A full-stack e-commerce platform for vinyl and music lovers — featuring artist bios, wishlists, admin tools, and Stripe-powered checkout.


## Tech Stack

- **Frontend:** React, React Router, Context API, Vite, SCSS Modules
- **Backend:** Node.js, Express  
- **Database:** PostgreSQL  
- **Authentication:** JWT, Google OAuth  
- **Payments:** Stripe (Elements + Server SDK)
- **Testing:** Jest, React Testing Library, Supertest
---

## Prerequisites

Before running the project locally, make sure you have:

- Node.js v18+
- PostgreSQL v14+
- A `.env` file in the project root with:
```bash
        DATABASE_URL=your_database_url
        JWT_SECRET=your_jwt_secret
        STRIPE_SECRET_KEY=your_stripe_secret_key
        STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
        PORT=3000
        DISCOGS_TOKEN=your_discogs_token
```
- A `.env` file in the client/ directory with:
```bash
        VITE_BACKEND_URL=http://localhost:3000
        VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
        VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Getting Started

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-repo/discogmvp.git
    cd discogmvp
    ```

2. **Install dependencies:**

    ```bash
    # Backend
    cd server
    npm install

    # Frontend
    cd ../client
    npm install
    ```

3. **Seed the database (optional):**

    cd server
    npm run seed

4. **Start development servers:**

    ```bash
    # In one terminal (backend)
    cd server
    npm run dev

    # In another terminal (frontend)
    cd client
    npm run dev
    ```

---

## Backend Script Setup

Install additional dev dependencies:

Server:
```bash
cd server
npm install --save-dev nodemon jest supertest

```

#### Update your package.json scripts in /server:
```js
"scripts": {
  "dev": "nodemon server/startServer.js",
  "start": "node server/startServer.js",
  "test": "jest",
  "seed": "node server/db/seed.js && npm run backfill:images",
  "backfill:images": "node server/utils/fetchDiscogsImages.cjs",
  "backfill:genres": "node server/utils/backfillGenres.cjs",
  "backfill:bio": "node server/utils/backfillBio.cjs"
}
```

#### Update your package.json scripts in /client:
```js
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "test": "jest"
}
```

#### Stripe integration uses the official Stripe Node SDK, and follows the Custom Checkout strategy.*

---

##  Component Overview

| Component                  | Description                                               |
|----------------------------|-----------------------------------------------------------|
| App.jsx                   | Root component with routing setup                         |
| Home.jsx                  | Homepage with welcome message and featured albums         |
| Navbar.jsx                | Main top navigation bar                                   |
| SearchBar.jsx             | Search input with dropdown suggestions                    |
| FullSearchResults.jsx     | Full page showing all matched search results              |
| ProductCard.jsx           | Card UI for displaying album/product info                 |
| ProductDetails.jsx        | Detailed view of a single product                         |
| MarketPrice.jsx           | Fetches and displays market price from Discogs            |
| Cart.jsx                  | Manages shopping cart functionality                       |
| Checkout.jsx              | Checkout page with order and payment sections             |
| PaymentForm.jsx           | Stripe Elements-based payment form                        |
| OrderConfirmation.jsx     | Displays order confirmation after successful checkout     |
| Account.jsx               | User dashboard entry point                                |
| ManageAccount.jsx         | Hub for user account editing and management               |
| EditAddress.jsx           | Edit shipping address form                                |
| EditBillingInfo.jsx       | Edit billing details form                                 |
| EditContactInfo.jsx       | Edit email/phone/name info                                |
| UserOrders.jsx            | Displays a user’s full order history                      |
| Profile.jsx               | Public-facing or editable user profile                    |
| Wishlist.jsx              | Main wishlist view for the user                           |
| CreateWishlist.jsx        | Component to initiate a new wishlist                      |
| WishlistForm.jsx          | Form for creating/editing wishlist items                  |
| WishlistShare.jsx         | Generates a sharable wishlist link                        |
| PublicWishlistPage.jsx    | View another user’s public wishlist                       |
| Register.jsx              | New user registration page                                |
| Login.jsx                 | Existing user login page                                  |
| RefundPolicy.jsx          | Static page for returns and policies                      |
| NotFound.jsx              | 404 error route component                                 |
| Dashboard.jsx             | Admin dashboard landing page                              |
| AdminLayout.jsx           | Shared layout for admin views                             |
| AdminSidebar.jsx          | Sidebar navigation for admin section                      |
| AdminTopbar.jsx           | Header bar in admin interface                             |
| AddProduct.jsx            | Form to add a new product to the store                    |
| EditProduct.jsx           | Form to edit existing product details                     |
| Inventory.jsx             | Admin stock and inventory manager                         |
| AdminOrders.jsx           | Manage and update all order statuses                      |
| UserList.jsx              | Admin view of all users                                   |
| EditUser.jsx              | Promote, demote, or delete users                          |


## Features by Tier

### MVP (Minimum Viable Product)

**Guest & Logged Users**
- Browse all products (`AllReleases.jsx`)
- View detailed product info (`ProductDetails.jsx`)
- Register and log in (`Register.jsx`, `Login.jsx`)
- View order confirmation (`OrderConfirmation.jsx`)
- Checkout with Stripe (`Checkout.jsx`, `PaymentForm.jsx`)
- Add, edit, and remove items from cart
- Persistent cart (via `localStorage`)

**Logged-In User Specific**
- Persistent cart tied to user accounts (`Cart.jsx`)
- Access order history (`UserOrders.jsx`)
- Edit profile and billing information (`ManageAccount.jsx`)

**Admin Tools**
- View, add, edit, and delete products (`AddProduct.jsx`, `EditProduct.jsx`, `Inventory.jsx`)
- View, update, and delete users (`UserList.jsx`, `EditUser.jsx`)
- View and manage all orders (`AdminOrders.jsx`)

**Infrastructure**
- Secure authentication using JWT
- Seeded data: products, users, and orders for testing
- Rate limiting and Helmet security headers

---

### E-Commerce Essentials

**User Experience**
- Sort and filter products (`FilterBar.jsx`)
- Responsive design across devices (SCSS modules)
- Accessibility: color contrast, alt text, keyboard navigation
- Mobile-responsive UI

**Functionality Enhancements**
- Error handling and fallback pages (`NotFound.jsx`)
- Guest cart stored in localStorage (`cart.js`)
- Profile editing (`ManageAccount.jsx`, `EditContactInfo.jsx`, etc.)
- Wishlist creation and sharing (`Wishlist.jsx`, `WishlistForm.jsx`, `WishlistShare.jsx`, `WishlistsPage.jsx`)

**Admin Enhancements**
- Manage stock levels (`Inventory.jsx`)
- Filter/search and update order statuses (`AdminOrders.jsx`)
- Edit user roles and permissions (`EditUser.jsx`)

---

### Extra Features

**Payments**
- Stripe Elements integration on frontend
- Backend `payments.js` module for secure transaction storage
- Payment records include billing address, method, and timestamp
- Statuses: pending, completed, failed

**Wishlists**
- Create and manage wishlists (`Wishlist.jsx`, `CreateWishlist.jsx`)
- Share public wishlist links (`WishlistShare.jsx`, `PublicWishlistPage.jsx`)

**User Engagement**
- In-app notifications (Toastify)
- Album bios and artwork from Discogs API
- Market price display (`MarketPrice.jsx`)
- Basic pagination & infinite scroll 

---
## Database Schema
[View interactive schema on dbdiagram.io](https://dbdiagram.io/d/Goofy-Capstone-67f675134f7afba184f3fd8a)
![Database Schema](./client/public/db-schema.png)

> ERD outlining users, products, carts, orders, and payment

---
### Testing

**Backend**
- Jest + Supertest
- Run with:
```bash
    cd server
    npm test
```

**Frontend**
- Jest + React Testing Library
- Run with:
```bash
    cd client
    npm test
```

## Contributors

This project was built collaboratively by the DiscogMVP team:

- [Connor Wotkowicz](https://github.com/sandpitt-turtle)
- [Joshua Thomas](https://github.com/Josh-A-T)
- [Sydney Mitchell](https://github.com/sydmitch)
- [Charley Lea](https://github.com/charleylea)
- [Andy Edwards](https://github.com/aedwardsk)

