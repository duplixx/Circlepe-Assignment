// routes/inventory.js
const express = require('express');
const db = require('../models/db');
const router = express.Router();

router.post('/inventory', async (req, res) => {
    const { stationId, planetId, itemId, quantity } = req.body;
  
    try {
      const result = await db.query(
        'INSERT INTO Inventory (StationID, PlanetID, ItemID, Quantity) VALUES ($1, $2, $3, $4) RETURNING *',
        [stationId, planetId, itemId, quantity]
      );
  
      res.status(201).json({
        message: 'Inventory added successfully',
        inventory: result.rows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error adding inventory' });
    }
  });

  
router.get('/inventory/:stationId', async (req, res) => {
  const { stationId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM Inventory WHERE StationID = $1',
      [stationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No inventory found for this station' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving inventory' });
  }
});

module.exports = router;
