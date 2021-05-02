import express from 'express';
import cors from 'cors';
import httpServer from 'http';
import socketIO from 'socket.io';
import { v4 as uuidV4 } from 'uuid';
import { ExpressPeerServer } from 'peer';

const app = express();
const server = httpServer.Server(app);
const io = socketIO(server);
const peerServer = ExpressPeerServer(server);
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/peerjs', peerServer);
app.get('/join', (req, res) => {
  res.send({ link: uuidV4() });
});

io.on('connection', (socket) => {
  console.log('socket established');
  socket.on('join-room', (userData) => {
    console.log('join-room event received', JSON.stringify(userData, null, 2));
    const { roomId, userId } = userData;
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('new-user-connect', userData);
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });
    socket.on('broadcast-message', (message) => {
      socket.to(roomId).broadcast.emit('new-broadcast-messsage', { ...message, userData });
    });
    // socket.on('reconnect-user', () => {
    //     socket.to(roomID).broadcast.emit('new-user-connect', userData);
    // });
    socket.on('display-media', (value) => {
      socket.to(roomId).broadcast.emit('display-media', { userId: userId, value });
    });
    socket.on('user-video-off', (value) => {
      socket.to(roomId).broadcast.emit('user-video-off', value);
    });
  });
});

// Server listen initialized
server
  .listen(port, () => {
    console.log(`Listening on the port ${port}`);
  })
  .on('error', (e) => {
    console.error(e);
  });
