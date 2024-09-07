
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const authMiddleware = require('./middleware/auth');
require('dotenv').config();
const tradeRoutes = require('./routes/trades');
const cargoRoutes = require('./routes/cargo');
const inventoryRoutes = require('./routes/inventory');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(cors());
app.use(bodyParser.json());


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api', authMiddleware);
app.use('/api', tradeRoutes);
app.use('/api', cargoRoutes);
app.use('/api', inventoryRoutes);




io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('newTrade', (tradeData) => {
    io.emit('tradeUpdate', tradeData);
  });

  socket.on('cargoStatusUpdate', (cargoData) => {
    io.emit('cargoUpdate', cargoData);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});