const path = require("path");
const http = require("http");
const express = require("express");
const app = express();
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUsers,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketio(server);

//! Define paths for Express config
const publicDirectoryPath = path.join(__dirname, "../public");

//! Setup satic directory to serve
app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New websocket connected!");

  socket.on("join", (options, callback) => {
    const { error, user } = addUsers({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (msg, callback) => {
    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return callback("Profanity not allowed");
    }

    const user = getUser(socket.id);

    io.to(user.room).emit("message", generateMessage(user.username, msg));
    callback();
  });

  socket.on("sendLocation", ({ latitude, longitude }, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${latitude},${longitude}`
      )
    );
    callback("Location Shared!");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

//! Starting the express server
server.listen(port, () => {
  console.log(`Server started at port: ${port}`);
});
