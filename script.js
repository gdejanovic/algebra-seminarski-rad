import randomEmoji from './components/randomemoji.js';
import nameGenerator  from './components/nameGenerator.js'

// random username za chat preko API-a i stavljanje varijable u local storage
nameGenerator();
// dohvat varijable
const name = localStorage.getItem('username');

// random emoji iz arraya koji se nalazi u modulu 
const emoji = randomEmoji();


if (!location.hash) {
  location.hash = Math.floor(Math.random() * 0xffffff).toString(16);
}
const chatHash = location.hash.substring(1);
const googleURL = "stun:stun.l.google.com:19302";
const configuration = {
  iceServers: [
    {
      url: googleURL,
    },
  ],
};

let pc;
let dataChannel;

// skrivanje Api key-a jednostavnom enkripcijom
function decode(str) {
  return decodeURIComponent(escape(window.atob(str)));
}

const code = "NVVyOXMzV3pNNXlDZU5lZw==";
const crypted = decode(code);
const drone = new ScaleDrone(crypted);
const roomName = "observable-" + chatHash;
let room;
// komunikakcija sa webRTC 
drone.on("open", (error) => {
  if (error) {
    return console.error(error);
  }
  room = drone.subscribe(roomName);
  room.on("open", (error) => {
    if (error) {
      return console.error(error);
    }
    console.log("Connected to signaling server");
  });

  room.on("members", (members) => {
    if (members.length >= 3) {
      return alert("The room is ocuppied!");
    }

    const isOfferer = members.length === 2;
    startWebRTC(isOfferer);
  });
});


function sendSignalingMessage(message) {
  drone.publish({
    room: roomName,
    message,
  });
}

function startWebRTC(isOfferer) {
  console.log("Starting WebRTC in as", isOfferer ? "offerer" : "waiter");
  pc = new RTCPeerConnection(configuration);

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      sendSignalingMessage({ candidate: event.candidate });
    }
  };

  if (isOfferer) {
    pc.onnegotiationneeded = () => {
      pc.createOffer(localDescCreated, (error) => console.error(error));
    };
    dataChannel = pc.createDataChannel("chat");
    setupDataChannel();
  } else {
    pc.ondatachannel = (event) => {
      dataChannel = event.channel;
      setupDataChannel();
    };
  }

  startListentingToSignals();
}

function setupDataChannel() {
  checkDataChannelState();
  dataChannel.onopen = checkDataChannelState;
  dataChannel.onclose = checkDataChannelState;
  dataChannel.onmessage = (event) =>
    insertMessageToDOM(JSON.parse(event.data), false);
}

function checkDataChannelState() {
  console.log("State of the connection is :", dataChannel.readyState);
  if (dataChannel.readyState === "open") {
    insertMessageToDOM({ content: "You are connected to the chat" });
  }
}

function startListentingToSignals() {
  room.on("data", (message, client) => {
    if (client.id === drone.clientId) {
      return;
    }
    if (message.sdp) {
      pc.setRemoteDescription(
        new RTCSessionDescription(message.sdp),
        () => {
          console.log("pc.remoteDescription.type", pc.remoteDescription.type);

          if (pc.remoteDescription.type === "offer") {
            console.log("Answering offer");
            pc.createAnswer(localDescCreated, (error) => console.error(error));
          }
        },
        (error) => console.error(error)
      );
    } else if (message.candidate) {
      pc.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  });

}

function localDescCreated(desc) {
  pc.setLocalDescription(
    desc,
    () => sendSignalingMessage({ sdp: pc.localDescription }),
    (error) => console.error(error)
  );
}

function insertMessageToDOM(options, isFromMe) {
  const template = document.querySelector('template[data-template="message"]');
  const nameEl = template.content.querySelector(".message__name");
  if (options.emoji || options.name) {
    nameEl.innerText = options.emoji + " " + options.name;
  }
  template.content.querySelector(".message__bubble").innerText =
    options.content;
  const clone = document.importNode(template.content, true);
  const messageEl = clone.querySelector(".message");
  if (isFromMe) {
    messageEl.classList.add("message--mine");
  } else {
    messageEl.classList.add("message--theirs");
  }

  const messagesEl = document.querySelector(".messages");
  messagesEl.appendChild(clone);

  messagesEl.scrollTop = messagesEl.scrollHeight - messagesEl.clientHeight;
}

const form = document.querySelector("form");
form.addEventListener("submit", () => {
  const input = document.querySelector('input[type="text"]');
  const value = input.value;
  input.value = "";

  const data = {
    name,
    content: value,
    emoji,
  };

  dataChannel.send(JSON.stringify(data));

  insertMessageToDOM(data, true);
});

insertMessageToDOM({

  content: "URL = " + location.href
  
});

// qr kod za lakše spajanje korisnika sa mobilnim uređajima na chat
const qr = () => {
  const qrURL = "https://api.qrserver.com/v1/create-qr-code/?data=";
const src = location.href;
document.getElementById('imgqr').src=(qrURL+src+"&amp;size=100x100");
document.querySelector('h5').innerText="Scan QR code to connect \n with any device...";
};
qr();
