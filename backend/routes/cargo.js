// routes/cargo.js
const express = require('express');
const db = require('../models/db');
const router = express.Router();

// Create a new cargo shipment
router.post('/cargo', async (req, res) => {
  const { status, source, destination } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO Cargo (ShipmentDate, Status, Source, Destination) VALUES (NOW(), $1, $2, $3) RETURNING CargoID',
      [status, source, destination]
    );
    res.status(201).json({ cargoId: result.rows[0].cargoid, message: 'Cargo created successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating cargo' });
  }
});

// Get cargo details
router.get('/cargo/:cargoId', async (req, res) => {
  const { cargoId } = req.params;

  try {
    const result = await db.query('SELECT * FROM Cargo WHERE CargoID = $1', [cargoId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cargo not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving cargo' });
  }
});

module.exports = router;
