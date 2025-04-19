const express = require("express");
const pool = require("../db/pool");
const authenticateToken = require("../middleware/authMiddleware");
const { getOrderByUserId } = require("../db/orders");
const { getOrderById } = require("../db/orders");
const { updateOrder } = require("../db/orders");
const { createOrder } = require("../db/orders");
const { updateOrderItem } = require("../db/orders");
const { createOrderItem } = require("../db/orders");
const { getOrderItems } = require("../db/orders");
const { deleteOrder } = require("../db/orders");
const { deleteOrderItem } = require("../db/orders");
const { calculateOrderTotal } = require("../db/orders");
const router = express.Router();

router.get("/orders", authenticateToken, async (req, res, next) => {
  try {
    const orders = await getOrderByUserId(req.user.id);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "My orders not found" });
    }
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/items", authenticateToken, async (req, res, next) => {
  const orderId = req.params.id;

  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.user_id !== req.user.id && req.user.user_role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const orderItems = await getOrderItems(orderId);
    res.json(orderItems);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", authenticateToken, async (req, res, next) => {
  const { order_status, tracking_number, shipping_address } = req.body;
  const orderId = req.params.id;

  try {
    const updatedOrder = await updateOrder({
      order_id: orderId,
      updates: { order_status, tracking_number, shipping_address },
    });

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found failed to update" });
    }
    if (updatedOrder.user_id !== req.user.id && req.user.user_role !== "admin") {
      return res.status(403).json({ error: "Forbidden from updating order" });
    }
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
});

router.patch("/:orderId/items/:itemId", authenticateToken, async (req, res, next) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  try {
    const updatedOrderItem = await updateOrderItem({
      order_item_id: itemId,
      updates: { quantity },
    });

    if (!updatedOrderItem) {
      return res.status(404).json({ error: "Order item not found can't change quantity" });
    }
    const order = await getOrderById(updatedOrderItem.order_id);
    if (order.user_id !== req.user.id && req.user.user_role !== "admin") {
      return res.status(403).json({ error: "Forbidden from updating order item" });
    }
    res.json(updatedOrderItem);
  } catch (error) {
    next(error);
    return;
  }
});

router.post("/orders", authenticateToken, async (req, res, next) => {
  const { shipping_address, items } = req.body;
  const order_status = req.body.order_status || "created";

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order must include at least one item" });
  }
  for (const item of items) {
    if (!item.product_id || !item.quantity) {
      return res.status(400).json({ error: "Each item must have a product_id and quantity" });
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const newOrder = await createOrder({
      user_id: req.user.id,
      shipping_address,
      order_status: order_status,
      tracking_number: null,
      total: 0,
    });
    console.log("Creating order with:", {
      user_id: req.user.id,
      shipping_address,
      order_status,
      tracking_number: null,
      total: 0,
    });

    for (const item of items) {
      await createOrderItem({
        order_id: newOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
      });
    }

    const total = await calculateOrderTotal(newOrder.id);

    await updateOrder({
      order_id: newOrder.id,
      updates: { total },
    });

    await client.query("COMMIT");
    const updatedOrder = await getOrderById(newOrder.id);
    res.status(201).json(updatedOrder);
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
});

router.post("/:orderId/items", authenticateToken, async (req, res, next) => {
  const { product_id, quantity } = req.body;
  const orderId = req.params.orderId;

  try {
    const newOrderItem = await createOrderItem({
      order_id: orderId,
      product_id,
      quantity,
    });

    if (!newOrderItem) {
      return res.status(400).json({ error: "Failed to create order item" });
    }
    res.status(201).json(newOrderItem);
  } catch (error) {
    next(error);
  }
});
router.delete("/:id", authenticateToken, async (req, res, next) => {
  const orderId = req.params.id;

  try {
    const deletedOrder = await deleteOrder(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (deletedOrder.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden from deleting order" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    next(error);
  }
});
router.delete("/:orderId/items/:itemId", authenticateToken, async (req, res, next) => {
  const { itemId } = req.params;

  try {
    const deletedOrderItem = await deleteOrderItem(itemId);
    if (!deletedOrderItem) {
      return res.status(404).json({ error: "Order item not found" });
    }
    if (deletedOrderItem.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden from deleting order item" });
    }
    res.json({ message: "Order item deleted successfully" });
  } catch (error) {
    next(error);
  }
});

//mybe an admin route this one may be redundant
// router.post("/orders", authenticateToken, async (req, res, next) => {
//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     // 1. Get user's cart items
//     const cartItems = await client.query(
//       /*sql*/
//       `SELECT c.product_id, c.quantity, p.price, p.stock
//        FROM cart_items c
//        JOIN products p ON c.product_id = p.id
//        WHERE c.user_id = $1`,
//       [req.user.id]
//     );

//     if (cartItems.rows.length === 0) {
//       return res.status(400).json({ error: "Cart is empty" });
//     }

//     // 2. Check stock and calculate total
//     let total = 0;
//     for (const item of cartItems.rows) {
//       if (item.quantity > item.stock) {
//         throw new Error(`Insufficient stock for product ${item.product_id}`);
//       }
//       total += item.quantity * item.price;
//     }

//     // 3. Create order
//     const orderResult = await client.query(
//       "INSERT INTO orders (user_id, total, order_status) VALUES ($1, $2, $3) RETURNING id",
//       [req.user.id, total, "pending"]
//     );
//     const orderId = orderResult.rows[0].id;

//     // 4. Create order items and update product stock
//     for (const item of cartItems.rows) {
//       await client.query("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)", [
//         orderId,
//         item.product_id,
//         item.quantity,
//         item.price,
//       ]);

//       await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [item.quantity, item.product_id]);
//     }

//     // 5. Clear cart
//     await client.query("DELETE FROM cart_items WHERE user_id = $1", [req.user.id]);

//     await client.query("COMMIT");

//     res.status(201).json({
//       message: "Order created successfully",
//       orderId,
//     });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     next(err);
//     res.status(500).json({ error: "Failed to create order" });
//   } finally {
//     client.release();
//   }
// });

module.exports = router;
