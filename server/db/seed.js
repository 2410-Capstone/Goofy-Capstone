require("dotenv").config({ path: "../../.env" });
console.log("env check - DATABASE_URL =", process.env.DATABASE_URL);

const pool = require("./pool.js");
const { createTables } = require("./db.js");
const { createUser } = require("./users.js");
const { createProduct } = require("./products.js");
const { createCart } = require("./carts.js");
const { createOrder, createOrderItem } = require("./orders.js");
const { createPayment } = require("./payments.js");
const { createCartItem } = require("./carts.js");

const seedUsers = async () => {
  console.log("Seeding users...");

  const users = await Promise.all([
    // Admin user - for testing purposes
    createUser({
      email: "admin@admin.com",
      password: "hashedpassword0",
      name: "Admin User",
      address: "0 Admin St",
      user_role: "admin",
    }),
    createUser({
      email: "test@example.com",
      password: "testpassword1",
      name: "test user",
      address: "1 test St",
      user_role: "customer",
    }),
    createUser({
      email: "luffy@example.com",
      password: "hashedpassword1",
      name: "Monkey D. Luffy",
      address: "1 Sunny Go St",
      user_role: "customer",
    }),
    createUser({
      email: "zoro@example.com",
      password: "hashedpassword2",
      name: "Roronoa Zoro",
      address: "2 Swords Ave",
      user_role: "customer",
    }),
    createUser({
      email: "nami@example.com",
      password: "hashedpassword3",
      name: "Nami",
      address: "3 Navigation Blvd",
      user_role: "customer",
    }),
    createUser({
      email: "sanji@example.com",
      password: "hashedpassword4",
      name: "Sanji",
      address: "4 Kitchen Ln",
      user_role: "customer",
    }),
    createUser({
      email: "ichigo@example.com",
      password: "hashedpassword5",
      name: "Ichigo Kurosaki",
      address: "5 Soul Society Rd",
      user_role: "customer",
    }),
    createUser({
      email: "rukia@example.com",
      password: "hashedpassword6",
      name: "Rukia Kuchiki",
      address: "6 Shinigami St",
      user_role: "customer",
    }),
    createUser({
      email: "renji@example.com",
      password: "hashedpassword7",
      name: "Renji Abarai",
      address: "7 Hollow Blvd",
      user_role: "customer",
    }),
    createUser({
      email: "byakuya@example.com",
      password: "hashedpassword8",
      name: "Byakuya Kuchiki",
      address: "8 Espada Ln",
      user_role: "customer",
    }),
    createUser({
      email: "naruto@example.com",
      password: "hashedpassword9",
      name: "Naruto Uzumaki",
      address: "9 Hidden Leaf Village",
      user_role: "customer",
    }),
    createUser({
      email: "sasuke@example.com",
      password: "hashedpassword10",
      name: "Sasuke Uchiha",
      address: "10 Avenger Ave",
      user_role: "customer",
    }),
    createUser({
      email: "sakura@example.com",
      password: "hashedpassword11",
      name: "Sakura Haruno",
      address: "11 Medical Ninjutsu Rd",
      user_role: "customer",
    }),
    createUser({
      email: "kakashi@example.com",
      password: "hashedpassword12",
      name: "Kakashi Hatake",
      address: "12 Copy Ninja Blvd",
      user_role: "customer",
    }),
    createUser({
      email: "tanjiro@example.com",
      password: "hashedpassword13",
      name: "Tanjiro Kamado",
      address: "13 Demon Slayer St",
      user_role: "customer",
    }),
    createUser({
      email: "nezuko@example.com",
      password: "hashedpassword14",
      name: "Nezuko Kamado",
      address: "14 Demon Slayer Ln",
      user_role: "customer",
    }),
    createUser({
      email: "zenitsu@example.com",
      password: "hashedpassword15",
      name: "Zenitsu Agatsuma",
      address: "15 Thunder Rd",
      user_role: "customer",
    }),
    createUser({
      email: "inosuke@example.com",
      password: "hashedpassword16",
      name: "Inosuke Hashibira",
      address: "16 Boar Path",
      user_role: "customer",
    }),
    createUser({
      email: "usopp@example.com",
      password: "hashedpassword17",
      name: "Usopp",
      address: "17 Sniper St",
      user_role: "customer",
    }),
    createUser({
      email: "chopper@example.com",
      password: "hashedpassword18",
      name: "Tony Tony Chopper",
      address: "18 Reindeer Rd",
      user_role: "customer",
    }),
    createUser({
      email: "robin@example.com",
      password: "hashedpassword19",
      name: "Nico Robin",
      address: "19 Archaeology Ave",
      user_role: "customer",
    }),
    createUser({
      email: "franky@example.com",
      password: "hashedpassword20",
      name: "Franky",
      address: "20 Shipwright Blvd",
      user_role: "customer",
    }),
  ]);

  console.log("Users seeded successfully:", users.length);
  return users;
};

const seedProducts = async () => {
  console.log("Seeding products...");

  const products = await Promise.all([
    createProduct({
      artist: "DISTRUSTER",
      description: "World War Zero",
      price: 29.99,
      image_url: "https://api.discogs.com/releases/27552465",
      genre: "Rock",
      stock: 50,
    }),
    createProduct({
      artist: "Interpol",
      description: "Our Love To Admire",
      price: 31.99,
      image_url: "https://api.discogs.com/releases/1055329",
      genre: "Indie",
      stock: 60,
    }),
    createProduct({
      artist: "Grimes",
      description: "Visions",
      price: 27.5,
      image_url: "https://api.discogs.com/releases/3483978",
      genre: "Electronic",
      stock: 40,
    }),
    createProduct({
      artist: "Mac Miller",
      description: "Faces",
      price: 34.99,
      image_url: "https://api.discogs.com/releases/20924756",
      genre: "Hip Hop",
      stock: 30,
    }),
    createProduct({
      artist: "Cocteau Twins",
      description: "Heaven Or Las Vegas",
      price: 22.99,
      image_url: "https://api.discogs.com/releases/1587672",
      genre: "Alternative",
      stock: 45,
    }),
    createProduct({
      artist: "DJ Shadow",
      description: "Endtroducing.....",
      price: 27.99,
      image_url: "https://api.discogs.com/releases/35691",
      genre: "Trip Hop",
      stock: 35,
    }),
    createProduct({
      artist: "Slowdive",
      description: "Souvlaki",
      price: 28.49,
      image_url: "https://api.discogs.com/releases/1165242",
      genre: "Shoegaze",
      stock: 50,
    }),
    createProduct({
      artist: "Flying Lotus",
      description: "Cosmogramma",
      price: 29.99,
      image_url: "https://api.discogs.com/releases/2261172",
      genre: "Electronic",
      stock: 25,
    }),
    createProduct({
      artist: "MF DOOM",
      description: "MM..Food",
      price: 35.99,
      image_url: "https://api.discogs.com/releases/289489",
      genre: "Hip Hop",
      stock: 40,
    }),
    createProduct({
      artist: "Mazzy Star",
      description: "So Tonight That I Might See",
      price: 24.99,
      image_url: "https://api.discogs.com/releases/1519469",
      genre: "Dream Pop",
      stock: 55,
    }),
    createProduct({
      artist: "Radiohead",
      description: "Kid A",
      price: 33.5,
      image_url: "https://api.discogs.com/releases/38658",
      genre: "Alternative",
      stock: 30,
    }),
    createProduct({
      artist: "Kendrick Lamar",
      description: "To Pimp A Butterfly",
      price: 39.99,
      image_url: "https://api.discogs.com/releases/6811538",
      genre: "Hip Hop",
      stock: 20,
    }),
    createProduct({
      artist: "Arctic Monkeys",
      description: "AM",
      price: 28.99,
      image_url: "https://api.discogs.com/releases/4783579",
      genre: "Indie Rock",
      stock: 45,
    }),
    createProduct({
      artist: "Massive Attack",
      description: "Mezzanine",
      price: 32.99,
      image_url: "https://api.discogs.com/releases/14049",
      genre: "Trip Hop",
      stock: 35,
    }),
    createProduct({
      artist: "Sufjan Stevens",
      description: "Illinois",
      price: 26.99,
      image_url: "https://api.discogs.com/releases/477165",
      genre: "Indie Folk",
      stock: 40,
    }),
    createProduct({
      artist: "The xx",
      description: "xx",
      price: 27.99,
      image_url: "https://api.discogs.com/releases/1929743",
      genre: "Indie",
      stock: 50,
    }),
    createProduct({
      artist: "Tyler, The Creator",
      description: "IGOR",
      price: 29.99,
      image_url: "https://api.discogs.com/releases/13796836",
      genre: "Hip Hop",
      stock: 30,
    }),
    createProduct({
      artist: "Portishead",
      description: "Dummy",
      price: 30.99,
      image_url: "https://api.discogs.com/releases/37745",
      genre: "Trip Hop",
      stock: 25,
    }),
    createProduct({
      artist: "King Krule",
      description: "The OOZ",
      price: 33.99,
      image_url: "https://api.discogs.com/releases/11022901",
      genre: "Experimental",
      stock: 20,
    }),
    createProduct({
      artist: "The War On Drugs",
      description: "Lost In The Dream",
      price: 31.99,
      image_url: "https://api.discogs.com/releases/5469428",
      genre: "Indie Rock",
      stock: 40,
    }),
    // Add more products as needed!
  ]);

  console.log("Seeded products:", products.length);
  return products;
};

const seedCartsAndOrders = async (users, products) => {
  console.log("seeding carts, cart_items, orders, order_items");

  for (let i = 0; i < 20; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const cart = await createCart({
      user_id: user.id,
      cart_status: Math.random() > 0.5 ? "active" : "checked_out",
    });

    const cartProductSample = getRandomProducts(products, 1, 3);

    console.log("cartProductSample:", cartProductSample);

    for (let product of cartProductSample) {
      if (!product || !product.id) {
        console.error("Missing or invalid product:", product);
        throw new Error("Cannot seed cart item: missing product ID");
      }

      await createCartItem({
        cart_id: cart.id,
        product_id: product.id,
        quantity: getRandomInt(1, 5),
      });
    }

    const order_statuses = ["created", "processing", "shipped", "delivered"];
    const orderProductSample = getRandomProducts(products, 1, 3);
    const orderItems = [];
    let total = 0;

    console.log("orderProductSample:", orderProductSample);

    for (let product of orderProductSample) {
      if (!product || !product.id) {
        console.error("Missing or invalid product for order:", product);
        continue; // skip this product
        // throw new Error('Cannot seed order item: missing product ID');
      }

      const quantity = getRandomInt(1, 3);
      const price = product.price;
      total += price * quantity;

      orderItems.push({
        product_id: product.id,
        quantity,
        price,
      });
    }

    const shippingAddress = user.shipping_address || user.address;
    //may need to change this to user.address
    const order = await createOrder({
      user_id: user.id,
      order_status: order_statuses[Math.floor(Math.random() * order_statuses.length)],
      total: Math.round(total * 100) / 100,
      shipping_address: shippingAddress,
      tracking_number: `TRACK${Math.floor(Math.random() * 1000000)}XYZ`,
    });

    for (let item of orderItems) {
      if (!item.product_id) {
        console.error("Order item missing product_id:", item);
        continue;
      }
      console.log("Creating order item:", item);
      await createOrderItem({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      });
    }
  }

  console.log("Seeded 20 carts and orders with items.");

  function getRandomProducts(products, min, max) {
    if (!products || products.length === 0) return [];
    const count = Math.min(getRandomInt(min, max), products.length); // clamp the count
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};
const seedPayments = async () => {
  console.log("Seeding payments...");

  const { rows: orders } = await pool.query(/*sql*/ `SELECT * FROM orders`);
  const { rows: users } = await pool.query(/*sql*/ `SELECT * FROM users`);

  const paymentMethods = ["credit_card", "paypal", "bank_transfer"];

  const payments = await Promise.all(
    orders.map((order) => {
      const user = users.find((u) => u.id === order.user_id);
      const billing_name = user?.name || "John Doe";
      const billing_address = user?.address || "123 Default St";

      const payment_method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      const payment_status = Math.random() < 0.9 ? "paid" : "failed"; // 90% success rate

      const payment_date = payment_status === "paid" ? new Date() : null;

      const amount = order.total || 0;

      return createPayment({
        order_id: order.id,
        billing_name,
        billing_address,
        payment_method,
        payment_status,
        payment_date,
        amount,
      });
    })
  );

  console.log("Payments seeded successfully:", payments.length);
};

module.exports = {
  seedProducts,
  seedUsers,
  seedCartsAndOrders,
  seedPayments,
};

const seed = async () => {
  let client;
  try {
    // client = await pool.connect();
    console.log("Connected to database.");
    console.log("Seeding database:", process.env.DATABASE_URL);

    await createTables();

    // Seed users with progress feedback
    console.log("Starting user creation...");
    const users = await seedUsers();
    console.log("Users created successfully!");
    console.log("✅ Users seeded:", users.length);
    // Continue with other seeding...
    const products = await seedProducts();
    console.log("Products created successfully!");
    console.log("✅ Products seeded:", products.length);

    // Now seed carts and orders using users/products
    await seedCartsAndOrders(users, products);
    console.log("Carts and orders created successfully!");

    // Seed payments
    await seedPayments();
    console.log("Payments created successfully!");

    console.log("Seeding complete!");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    if (client) client.release();
    // await pool.end();
    console.log("Database connection closed.");
  }
};

// Run the seed function and close the connection if this file is executed directly
// This is for testing purposes
if (require.main === module) {
  seed().then(() => {
    pool.end(); // Only closes when run directly, i.e. 'npm run seed'
  });
}

module.exports = seed;
