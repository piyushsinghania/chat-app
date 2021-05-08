const users = [];

// addUsers, removeUsers, getUser, getUserInRoom

//! addUsers function to validate and add users
const addUsers = ({ id, username, room }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate the data
  if (!username || !room) {
    return {
      error: "Username and Room are required!",
    };
  }

  // Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: "Username already exists!",
    };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

//! removeUser function to remove user
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//! getUser function to get a particular user back
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

//! getUsersInRoom function to get all the users in a particular room
const getUsersInRoom = (room) => {
  room = room.toLowerCase().trim();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUsers,
  removeUser,
  getUser,
  getUsersInRoom,
};
