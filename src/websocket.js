const httpServer = require('http').createServer();
const socketIO = require('socket.io');

const port = process.env.PORT_WS || 5001;

const io = socketIO(httpServer, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.on('join-room', (userData) => {
    console.log('join-room event received', JSON.stringify(userData, null, 2));
    const { roomId, userId } = userData;
    socket.join(roomId);
    socket.to(roomId).emit('new-user-connect', userData);
    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
    socket.on('broadcast-message', (message) => {
      socket.to(roomId).emit('new-broadcast-messsage', { ...message, userData });
    });
    // socket.on('reconnect-user', () => {
    //     socket.to(roomID).broadcast.emit('new-user-connect', userData);
    // });
    socket.on('display-media', (value) => {
      socket.to(roomId).emit('display-media', { userId: userId, value });
    });
    socket.on('user-video-off', (value) => {
      socket.to(roomId).emit('user-video-off', value);
    });
  });
});

httpServer.listen(port, () => {
  console.log(`Listening on the port ${port}`);
});
