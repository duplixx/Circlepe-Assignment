// routes/trades.js
const express = require('express');
const db = require('../models/db');
const router = express.Router();

router.post('/trades', async (req, res) => {
  const { traderA, traderB, itemsTraded } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO Trades (Date, TraderA, TraderB, ItemsTraded) VALUES (NOW(), $1, $2, $3) RETURNING TradeID',
      [traderA, traderB, JSON.stringify(itemsTraded)]
    );
    res.status(201).json({ tradeId: result.rows[0].tradeid, message: 'Trade created successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating trade' });
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
