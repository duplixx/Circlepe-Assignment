// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');


const tradeRoutes = require('./routes/trades');
const cargoRoutes = require('./routes/cargo');
const inventoryRoutes = require('./routes/inventory');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(cors());
app.use(bodyParser.json());


app.use('/api', tradeRoutes);
app.use('/api', cargoRoutes);
app.use('/api', inventoryRoutes);

// Socket.IO for real-time communication
io.on('connection', (socket) => {
  console.log('New client connected');

  
  socket.on('newTrade', (tradeData) => {
    io.emit('tradeUpdate', tradeData);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
