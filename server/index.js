const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PATCH'] },
});

app.use(cors());
app.use(express.json());
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes(io));

io.on('connection', () => {});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
