const socket = io();

//! Elements
const $messageForm = document.querySelector("#chat-window");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//! Templates
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationTemplate = document.querySelector("#location-template")
  .innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//! Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // Grabbing the new message
  const $newMessage = $messages.lastElementChild;
  // Grabbing the height along with the margin
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;
  // Height of messages container
  const containerHeight = $messages.scrollHeight;
  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  // console.log(message);
  const html = Mustache.render($messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (message) => {
  // console.log(message);
  const html = Mustache.render($locationTemplate, {
    username: message.username,
    locationURL: message.locationURL,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users,
  });

  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (event) => {
  event.preventDefault();

  //? Disabling the send button till message transaction
  $messageFormButton.setAttribute("disabled", "disabled");

  const msgField = event.target.elements.message;
  const msg = msgField.value;
  socket.emit("sendMessage", msg, (error) => {
    //? Re-enabling the send button and putting focus back to input field
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("Message deilevered!");
  });
  msgField.value = "";
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  //? Disabling sendLocation button till fetching and sending location
  $sendLocationButton.setAttribute("disabled", "disabled");

  //! navigator.geolocation is available in modern browsers, which makes it
  //! easy to fetch users location with their concent!
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (message) => {
        //? Re-enabling the sendLocation button
        $sendLocationButton.removeAttribute("disabled");
        console.log(message);
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert("User already exists");
    location.href = "/";
  }
});
