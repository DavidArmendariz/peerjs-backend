const express = require('express');
const cors = require('cors');
const httpServer = require('http');
const { v4: uuidV4 } = require('uuid');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = httpServer.Server(app);
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

// Server listen initialized
server
  .listen(port, () => {
    console.log(`Listening on the port ${port}`);
  })
  .on('error', (e) => {
    console.error(e);
  });
