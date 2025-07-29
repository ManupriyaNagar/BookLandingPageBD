const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// POST /api/orders
router.post("/", async (req, res) => {
  try {
    const { name, email, mobile, copies, city } = req.body;

    const newOrder = new Order({ name, email, mobile, copies, city });
    await newOrder.save();

    res.status(201).json({ message: "Order received successfully!" });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
