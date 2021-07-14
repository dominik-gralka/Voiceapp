const PORT = process.env.PORT || 3000;
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io").listen(server);
var counter = 0;

//Creating Channel and Socket Constant
const channels = {};
const sockets = {};

//change root directory to /public
var mainpath = __dirname + "/public";

app.use(express.static(mainpath));

//start Server
server.listen(PORT, null, function() {
  console.log("Listening on port " + PORT);
});

//Send Main Page
app.get(["/", "/:room"], (req, res) =>
  res.sendFile(mainpath + "/html/index.html")
);

//Executed when peers are connected and deletes Channel after disconnect
io.sockets.on("connection", socket => {
  socket.channels = {};
  sockets[socket.id] = socket;
  socket.on("disconnect", () => {
    for (const channel in socket.channels) {
      part(channel);
    }
    delete sockets[socket.id];
  });

//Connects Peers
  socket.on("join", config => {
    const channel = config.channel;
    const userdata = config.userdata;

    if (channel in socket.channels) {
      return;
    }

    if (!(channel in channels)) {
      channels[channel] = {};
    }

    for (id in channels[channel]) {
      channels[channel][id].emit("addPeer", {
        peer_id: socket.id,
        should_create_offer: false
      });
      socket.emit("addPeer", { peer_id: id, should_create_offer: true });
    }

    channels[channel][socket.id] = socket;
    socket.channels[channel] = channel;
  });

//Removes peer
  const part = channel => {
    if (!(channel in socket.channels)) {
      return;
    }

    delete socket.channels[channel];
    delete channels[channel][socket.id];

    for (id in channels[channel]) {
      channels[channel][id].emit("removePeer", { peer_id: socket.id });
      socket.emit("removePeer", { peer_id: id });
    }
  };

//I dont fucking know
  socket.on("part", part);

//Connectes to Stun
  socket.on("relayICECandidate", config => {
    let peer_id = config.peer_id;
    let ice_candidate = config.ice_candidate;

    if (peer_id in sockets) {
      sockets[peer_id].emit("iceCandidate", {
        peer_id: socket.id,
        ice_candidate: ice_candidate
      });
    }
  });
  
  socket.on("relaySessionDescription", config => {
    let peer_id = config.peer_id;
    let session_description = config.session_description;

    if (peer_id in sockets) {
      sockets[peer_id].emit("sessionDescription", {
        peer_id: socket.id,
        
        session_description: session_description
      });
    }
  });
});
