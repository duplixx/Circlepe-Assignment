// routes/trades.js
const express = require('express');
const db = require('../models/db');
const router = express.Router();

router.get('/trades', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Trades ORDER BY Date DESC LIMIT 10');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving trades' });
  }
});
router.post('/buy', async (req, res) => {
  const { buyerId, sellerId, itemId, quantity, price } = req.body;

  try {
    // Start a transaction
    await db.query('BEGIN');

    // Check if the seller has enough inventory
    const sellerInventory = await db.query(
      'SELECT Quantity FROM Inventory WHERE UserID = $1 AND ItemID = $2',
      [sellerId, itemId]
    );

    if (sellerInventory.rows.length === 0 || sellerInventory.rows[0].quantity < quantity) {
      await db.query('ROLLBACK');
      return res.status(400).json({ message: 'Seller does not have enough inventory' });
    }

    // Check if the buyer has enough credits
    const buyerCredits = await db.query(
      'SELECT Credits FROM Users WHERE UserID = $1',
      [buyerId]
    );

    if (buyerCredits.rows[0].credits < price * quantity) {
      await db.query('ROLLBACK');
      return res.status(400).json({ message: 'Buyer does not have enough credits' });
    }

    // Update seller's inventory
    await db.query(
      'UPDATE Inventory SET Quantity = Quantity - $1 WHERE UserID = $2 AND ItemID = $3',
      [quantity, sellerId, itemId]
    );

    // Update buyer's inventory
    const buyerInventory = await db.query(
      'SELECT * FROM Inventory WHERE UserID = $1 AND ItemID = $2',
      [buyerId, itemId]
    );

    if (buyerInventory.rows.length === 0) {
      await db.query(
        'INSERT INTO Inventory (UserID, ItemID, Quantity) VALUES ($1, $2, $3)',
        [buyerId, itemId, quantity]
      );
    } else {
      await db.query(
        'UPDATE Inventory SET Quantity = Quantity + $1 WHERE UserID = $2 AND ItemID = $3',
        [quantity, buyerId, itemId]
      );
    }

    // Update credits
    await db.query(
      'UPDATE Users SET Credits = Credits - $1 WHERE UserID = $2',
      [price * quantity, buyerId]
    );
    await db.query(
      'UPDATE Users SET Credits = Credits + $1 WHERE UserID = $2',
      [price * quantity, sellerId]
    );

    // Create a trade record
    await db.query(
      'INSERT INTO Trades (Date, TraderA, TraderB, ItemsTraded) VALUES (NOW(), $1, $2, $3)',
      [buyerId, sellerId, JSON.stringify([{ itemId, quantity, price }])]
    );

    // Commit the transaction
    await db.query('COMMIT');

    res.status(201).json({ message: 'Purchase successful' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Error processing purchase' });
  }
});

router.post('/sell', async (req, res) => {
  const { sellerId, itemId, quantity, price } = req.body;

  try {
    // Check if the seller has enough inventory
    const sellerInventory = await db.query(
      'SELECT Quantity FROM Inventory WHERE UserID = $1 AND ItemID = $2',
      [sellerId, itemId]
    );

    if (sellerInventory.rows.length === 0 || sellerInventory.rows[0].quantity < quantity) {
      return res.status(400).json({ message: 'Not enough inventory to list for sale' });
    }

    await db.query(
      'INSERT INTO MarketListings (SellerID, ItemID, Quantity, Price, ListingDate) VALUES ($1, $2, $3, $4, NOW())',
      [sellerId, itemId, quantity, price]
    );

    res.status(201).json({ message: 'Item listed for sale successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error listing item for sale' });
  }
});

router.get('/trades/:tradeId', async (req, res) => {
  const { tradeId } = req.params;

  try {
    const result = await db.query('SELECT * FROM Trades WHERE TradeID = $1', [tradeId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving trade' });
  }
});

module.exports = router;
