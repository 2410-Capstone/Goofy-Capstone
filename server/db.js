require("dotenv").config();

const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// const JWT = process.env.JWT || "shhh";
//will need this for authentication later ^

//create the db tables
const createTables = async () => {
  try {
    await client.connect();
    console.log("Connected to db");
    await client.query(/*sql*/ `
      DROP TABLE IF EXISTS payments;
      DROP TABLE IF EXISTS order_items;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS cart_items;
      DROP TABLE IF EXISTS carts;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS users;
     
       /* add types Supposedly, it's best practice when these roles/statuses will have consistent values */
      DROP TYPE IF EXISTS user_role;
      DROP TYPE IF EXISTS cart_status;
      DROP TYPE IF EXISTS order_status;
      DROP TYPE IF EXISTS payment_status;
      `);
    //created Enum types for the tables enum = enumeration create our own data types to
    // (prevent errors with naming types) was not aware of this previously. Also, my understanding is this is the information admin's can access
    await client.query(/*sql*/ `
      CREATE TYPE user_role AS ENUM ('customer', 'admin');
      CREATE TYPE cart_status AS ENUM ('active', 'checked_out');
      CREATE TYPE order_status AS ENUM ('created', 'processing', 'completed', 'cancelled');
      CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');
      `);
    //create users table
    // I did an await on the client.query to make debugging easier
    await client.query(/*sql*/ `
    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255),
        user_role NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      `);
    /* create products table */
    await client.query(/*sql*/ `
    CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        artist VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        image_url VARCHAR(255),
        genre VARCHAR(255),
        stock INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      `);

    /*create carts table*/
    await client.query(/*sql*/ `
    CREATE TABLE carts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        cart_status NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      `);

    /*create cart_items table*/
    await client.query(/*sql*/ `
    CREATE TABLE cart_items (
        id SERIAL PRIMARY KEY,
        cart_id UUID NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
      `);

    /*create orders table*/
    await client.query(/*sql*/ `
    CREATE TABLE orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        order_status NOT NULL DEFAULT 'created',
        total NUMERIC(10, 2),
        shipping_address TEXT,
        tracking_number VARCHAR(255),
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      `);
    /*create order_items table*/
    await client.query(/*sql*/ `
    CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id UUID NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
      `);
    /*create payments table*/
    await client.query(/*sql*/ `
    CREATE TABLE payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL,
        billing_name VARCHAR,
        billing_address TEXT,
        payment_method VARCHAR,
        payment_status DEFAULT 'pending',
        payment_date TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      );
    `);
    /* This was the first time I used indexes supposedly it helped with faster, searching for a large database It makes 
     it to where our queries don't have to scan the whole table, but utilizes the indexes to find the products,items, orders ect.
     I also learned that indexes are not automatically created for foreign keys so Basically it links the foreign keys to the tables they're associated with.
     (idx_table_foreignKey)*/
    await client.query(/*sql*/ `
      CREATE INDEX idx_cart_user ON carts(user_id);
      CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
      CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
      CREATE INDEX idx_order_user ON orders(user_id);
      CREATE INDEX idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX idx_order_items_product_id ON order_items(product_id);
      CREATE INDEX idx_payment_order_id ON payments(order_id);
    `);
    console.log("Tables created successfully.");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await client.end();
  }
};

module.exports = {
  client,
  createTables,
  // add any other functions export here
  // e.g., createUser, getUserById, etc.
};
