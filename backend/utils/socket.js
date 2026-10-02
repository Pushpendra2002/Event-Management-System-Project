const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

let io;

const init = (server) => {
  io = socketIO(server, {
    cors: {
      origin: true,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication required'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication required'));
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    // Join user room
    socket.on('join-user-room', () => {
      socket.join(`user-${socket.user.id}`);
      console.log(`User ${socket.user.id} joined their room`);
    });

    // Join event room
    socket.on('join-event-room', (eventId) => {
      socket.join(`event-${eventId}`);
      console.log(`Client joined event room: ${eventId}`);
    });

    // Leave event room
    socket.on('leave-event-room', (eventId) => {
      socket.leave(`event-${eventId}`);
      console.log(`Client left event room: ${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Send notification to user
const sendNotification = (userId, notification) => {
  const io = getIO();
  io.to(`user-${userId}`).emit('notification', notification);
};

// Send event update to all users in event room
const sendEventUpdate = (eventId, update) => {
  const io = getIO();
  io.to(`event-${eventId}`).emit('event-update', update);
};

module.exports = {
  init,
  getIO,
  sendNotification,
  sendEventUpdate
};
