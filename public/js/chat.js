const socket = io();

//elements
const $messageForm = document.querySelector("#message-form");
const $messageFomInput = $messageForm.querySelector("input");
const $messageFomButton = $messageForm.querySelector("button");
const $location = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // new
  const $newMessage = $messages.lastElementChild;
  // height of the new
  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  //visible height
  const visibleHeight = $messages.offsetHeight;
  //Height of message
  const containerHeight = $messages.scrollHeight;
  // how far
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("H:mm:ss"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});
socket.on("locationMessage", (message) => {
  console.log(message);
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("H:mm:ss"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //disable
  $messageFomButton.setAttribute("disabled", "disabled");

  //const message = document.querySelector("input").value;
  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {
    //enable
    $messageFomButton.removeAttribute("disabled");
    $messageFomInput.value = "";
    $messageFomInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("The message was delivered");
  });
});

// socket.on("countUpdated", (count) => {
//   console.log("The count has been updated", count);
// });

// document.querySelector("#increment").addEventListener("click", () => {
//   console.log("clicked");
//   socket.emit("increment");
// });

$location.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Your browser is not support geolocation");
  }
  $location.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    //console.log(position);
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $location.removeAttribute("disabled");

        console.log("location shared");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
