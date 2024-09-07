const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const bcrypt = require('bcrypt');
const router = express.Router();


if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set. Please set it in your environment variables.');
    process.exit(1);
  }
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query('SELECT id, username, password FROM Users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user || !(await comparePasswords(password, user.password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error during authentication' });
  }
});

router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    
    try {
        const userExists = await db.query('SELECT * FROM Users WHERE username = $1 OR email = $2', [username, email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }


        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            'INSERT INTO Users (username, password, email) VALUES ($1, $2, $3) RETURNING id',
            [username, hashedPassword, email]
        );

        res.status(201).json({ message: 'User created successfully', userId: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating user' });
    }
});



async function comparePasswords(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = router;