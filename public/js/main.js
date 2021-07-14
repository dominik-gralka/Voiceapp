//HostURL
const appURL = () => {
  const protocol =
    "http" + (location.hostname == "localhost" ? "" : "s") + "://";
  return (
    protocol +
    location.hostname +
    (location.hostname == "localhost" ? ":3000" : "")
  );
};

//getRoomName function
const getRoomName = () => {
  let roomName = location.pathname.substring(1);
  return roomName;
};

//Main Parameter
var counter = 1;
var connected = false;
var signaling_socket = null;
var local_media_stream = null;
var peers = {};
var peer_media_elements = {};
var SIGNALING_SERVER = appURL();
var USE_AUDIO = true;
var USE_VIDEO = false;
var ROOM_ID = getRoomName();
var ICE_SERVERS = [
  {
    urls: "stun:stun.l.google.com:19302"
  },
  {
    urls: "stun:stun.stunprotocol.org:3478"
  },
  {
    urls: "stun:stun.sipnet.net:3478"
  },
  {
    urls: "stun:stun.ideasip.com:3478"
  },
  {
    urls: "stun:stun.iptel.org:3478"
  }
];

function join_chat_channel(channel, userdata) {
  signaling_socket.emit("join", {
    channel: channel,
    userdata: userdata
  });
}

function part_chat_channel(channel) {
  signaling_socket.emit("part", channel);
}

function init() {
  //Globale Variablen sind geladen
  
  ROOM_ID = getRoomName();

  signaling_socket = io(SIGNALING_SERVER);
  signaling_socket = io();

  signaling_socket.on("connect", function() {
    setup_local_media(function() {
      join_chat_channel(ROOM_ID, {});
    });
  });

  signaling_socket.on("disconnect", function() {
    for (peer_id in peer_media_elements) {
      document.body.removeChild(peer_media_elements[peer_id].parentNode);
      resizeVideos();
    }
    for (peer_id in peers) {
      peers[peer_id].close();
    }

    peers = {};
    peer_media_elements = {};
  });

  signaling_socket.on("addPeer", function(config) {
    var peer_id = config.peer_id;
    if (peer_id in peers) {
      return;
    }
    var peer_connection = new RTCPeerConnection(
      {
        iceServers: ICE_SERVERS
      },
      {
        optional: [
          {
            DtlsSrtpKeyAgreement: true
          }
        ]
      }
    );
    
    peers[peer_id] = peer_connection;

    peer_connection.onicecandidate = function(event) {
      if (event.candidate) {
        signaling_socket.emit("relayICECandidate", {
          peer_id: peer_id,
          ice_candidate: {
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            candidate: event.candidate.candidate
          }
        });
      }
    };
    peer_connection.onaddstream = function(event) {
      console.log("onAddStream", event);
      const videoWrap = document.createElement("div");
      videoWrap.className = "video";
      const remote_media = document.createElement("video");
      videoWrap.appendChild(remote_media);
      remote_media.setAttribute("playsinline", true);
      remote_media.mediaGroup = "remotevideo";
      remote_media.autoplay = true;
      remote_media.controls = false;
      peer_media_elements[peer_id] = remote_media;
      document.body.appendChild(videoWrap);
      attachMediaStream(remote_media, event.stream);
      resizeVideos();
      checkParticipantsCount();
      userJoin();
    };
    peer_connection.addStream(local_media_stream);

    
    stateChange("loadMain");
    
    setTimeout(function() {
      if (document.getElementById("usercount").textContent <= 1) {
        stateChange("usercheck")
        openSettings();
        userLeave();
      }
    }, 5000);

    if (config.should_create_offer) {
      // console.log("Creating RTC offer to ", peer_id);
      peer_connection.createOffer(

        function(local_description) {
          // console.log("Local offer description is: ", local_description);
          peer_connection.setLocalDescription(
            local_description,
            function() {
              signaling_socket.emit("relaySessionDescription", {
                peer_id: peer_id,
                session_description: local_description
              });
              // console.log("Offer setLocalDescription succeeded");
            },
            function() {
              Alert("Offer setLocalDescription failed!");
            }
          );
        },
        function(error) {
          console.log("Error sending offer: ", error);
        }
      );
    } else {
      
    }
  });
  //https://www.scaledrone.com/blog/webrtc-chat-tutorial/

  signaling_socket.on("sessionDescription", function(config) {
    console.log("Remote description received: ", config);
    var peer_id = config.peer_id;
    var peer = peers[peer_id];
    var remote_description = config.session_description;
    console.log(config.session_description);
    const peercount = document.querySelectorAll("peer_id");
    
    stateChange("sessionDescription");

    var desc = new RTCSessionDescription(remote_description);
    var stuff = peer.setRemoteDescription(
      desc,
      function() {
        if (remote_description.type == "offer") {
          peer.createAnswer(
            function(local_description) {
              peer.setLocalDescription(
                local_description,
                function() {
                  signaling_socket.emit("relaySessionDescription", {
                    peer_id: peer_id,
                    session_description: local_description
                  });
                },
                function() {
                  Alert("Answer setLocalDescription failed!");
                }
              );
            },
            function(error) {
              console.log("Error creating answer: ", error);
              // console.log(peer);
            }
          );
        }
      },
      function(error) {
        console.log("setRemoteDescription error: ", error);
      }
    );
    // console.log("Description Object: ", desc);
  });

  signaling_socket.on("iceCandidate", function(config) {
    var peer = peers[config.peer_id];
    var ice_candidate = config.ice_candidate;
    peer.addIceCandidate(new RTCIceCandidate(ice_candidate));
  });

  signaling_socket.on("removePeer", function(config) {
    // console.log('Signaling server said to remove peer:', config);
    var peer_id = config.peer_id;
    if (peer_id in peer_media_elements) {
      document.body.removeChild(peer_media_elements[peer_id].parentNode);
      resizeVideos();
      userLeave();
      document.getElementById("userLeaveMessage").style.animation =
        "fading-in 0.5s";
      document.getElementById("userLeaveMessage").style.display = "block";
      setTimeout(() => {
        if (
          (document.getElementById("userLeaveMessage").style.display = "block")
        ) {
          document.getElementById("userLeaveMessage").style.animation =
            "fading-out 0.5s";
          setTimeout(() => {
            document.getElementById("userLeaveMessage").style.display = "none";
          }, 500);
        }
      }, 3000);
    }
    if (peer_id in peers) {
      peers[peer_id].close();
    }

    delete peers[peer_id];
    delete peer_media_elements[config.peer_id];
  });

}

const resizeVideos = () => {
  const numToString = ["", "one", "two", "three", "four", "five", "six"];
  const videos = document.querySelectorAll(".video");
  document.querySelectorAll(".video").forEach(v => {
    v.className = "video " + numToString[videos.length];
  });
  console.log("resizeVideo function disabled + " + videos.length);
  document.getElementById("usercount").textContent = videos.length;
};

const userJoin = () => {
  connected = true;
  var userjoin = new Audio(
    "https://cdn.glitch.com/2a073e21-1e77-487e-8bdf-6dd4c71efc27%2Fuserjoin.mp3?v=1616598128484"
  );
  userjoin.play();
  document.getElementById("userJoinMessage").style.animation = "fading-in 0.5s";
  document.getElementById("userJoinMessage").style.display = "block";
  setTimeout(() => {
    if ((document.getElementById("userJoinMessage").style.display = "block")) {
      document.getElementById("userJoinMessage").style.animation =
        "fading-out 0.5s";
      setTimeout(() => {
        document.getElementById("userJoinMessage").style.display = "none";
      }, 500);
    }
  }, 3000);
};

const userLeave = () => {
  var userleave = new Audio(
    "https://cdn.glitch.com/2a073e21-1e77-487e-8bdf-6dd4c71efc27%2Fuserleave.mp3?v=1616598128484"
  );
  userleave.play();
};

const checkParticipantsCount = () => {
  const videos = document.querySelectorAll(".video");
  if (videos.length > 5) {
    document.getElementById("tooManyParticipants").style.display = "block";
    setTimeout(() => {
      document.getElementById("tooManyParticipants").style.display = "none";
    }, 3000);
  }
  if (videos.length > 1) {
    document.getElementById("intro").style.animation = "message-fade-out 1.5s";
    setTimeout(() => {
      document.getElementById("intro").style.display = "none";
    }, 1500);
    document.getElementById("intro-mobile").style.display = "none";
    connected = true;
  }
};

function copylink() {
  //Das kann noch in eine andere Klasse
  var copyText = document.getElementById("roomurl");
  var textArea = document.createElement("textarea");
  textArea.value = copyText.textContent;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("Copy");
  textArea.remove();
  document.getElementById("copyMessage").style.animation = "fading-in 0.5s";
  document.getElementById("copyMessage").style.display = "block";
  setTimeout(() => {
    if ((document.getElementById("copyMessage").style.display = "block")) {
      document.getElementById("copyMessage").style.animation =
        "fading-out 0.5s";
      setTimeout(() => {
        document.getElementById("copyMessage").style.display = "none";
      }, 500);
    }
  }, 3000);
}

function openSettings() {
  document.getElementById("intro").style.animation = "message-fade-in 1.5s";
  document.getElementById("intro").style.display = "block";
}

function setup_local_media(callback, errorback) {
  //Das kann auch in eine andere Klasse

  if (local_media_stream != null) {
    if (callback) callback();
    return;
  }
  attachMediaStream = function(element, stream) {
    element.srcObject = stream;
  };
  navigator.mediaDevices
    .getUserMedia({
      audio: USE_AUDIO,
      video: USE_VIDEO
    })
    .then(stream => {
      //HIER KOMMT ES ZUM GROßEN FEHLER
      local_media_stream = stream;
      var mute = new Audio(
        "https://cdn.glitch.com/2a073e21-1e77-487e-8bdf-6dd4c71efc27%2Fmute.mp3?v=1616598128371"
      );
      var unmute = new Audio(
        "https://cdn.glitch.com/2a073e21-1e77-487e-8bdf-6dd4c71efc27%2Funmute.mp3?v=1616598128077"
      );
      const videoWrap = document.createElement("div");
      videoWrap.className = "video";
      videoWrap.setAttribute("id", "selfVideoWrap");
      //const btnWrap = document.createElement("div");
      const btnWrap = document.getElementById("btnWrap");
      //btnWrap.setAttribute("id", "btnWrap");
      const muteBtn = document.createElement("button");
      muteBtn.setAttribute("id", "mutebtn");
      muteBtn.className = "fas fa-microphone";
      muteBtn.addEventListener("click", e => {
        local_media_stream.getAudioTracks()[0].enabled = !local_media_stream.getAudioTracks()[0]
          .enabled;
        e.target.className =
          "fas fa-microphone" +
          (local_media_stream.getAudioTracks()[0].enabled ? "" : "-slash");
        console.log(
          "Streaming audio: " + local_media_stream.getAudioTracks()[0].enabled
        );
        if (local_media_stream.getAudioTracks()[0].enabled == true) {
          mute.play();
          document.getElementById("mutebtn").style.animation = "none";
        } else {
          unmute.play();
          document.getElementById("mutebtn").style.animation = "click_button 0.5s";
        }
      });
      btnWrap.appendChild(muteBtn);
      const videoMuteBtn = document.createElement("button");
      videoMuteBtn.setAttribute("id", "videomutebtn");
      videoMuteBtn.className = "fas fa-share-square";
      videoMuteBtn.addEventListener("click", e => {
        /*local_media_stream.getVideoTracks()[0].enabled = !(local_media_stream.getVideoTracks()[0].enabled);
                    e.target.className = 'fas fa-video'+(local_media_stream.getVideoTracks()[0].enabled ? '' : '-slash');*/
        var fail = new Audio(
          "https://cdn.glitch.com/2a073e21-1e77-487e-8bdf-6dd4c71efc27%2Ffail.mp3?v=1616600406587"
        );
        fail.play();
        document.getElementById("videoFail").style.animation = "fading-in 0.5s";
        document.getElementById("videoFail").style.display = "block";
        setTimeout(() => {
          if ((document.getElementById("videoFail").style.display = "block")) {
            document.getElementById("videoFail").style.animation =
              "fading-out 0.5s";
            setTimeout(() => {
              document.getElementById("videoFail").style.display = "none";
            }, 500);
          }
        }, 3000);
      });
      btnWrap.appendChild(videoMuteBtn);
      videoWrap.appendChild(btnWrap);
      const local_media = document.createElement("video");
      videoWrap.appendChild(local_media);
      local_media.setAttribute("id", "selfVideo");
      local_media.setAttribute("playsinline", true);
      local_media.autoplay = false;
      local_media.muted = true;
      local_media.volume = 0;
      local_media.controls = false;
      document.body.appendChild(videoWrap);
      attachMediaStream(local_media, stream);
      resizeVideos();
      if (callback) callback();
    })
    .catch(e => {
      /* user denied access to a/v */
      console.log(e);
      document.getElementById("connectioninfo-pre").textContent =
        "Oops! We couldn't find your microphone.";
      document.getElementById("connectioninfo").textContent = "";
      document.getElementById("usercounticon").style.display = "none";
      document.getElementById("usercount").style.display = "none";
      document.getElementById("signal").className = "fas fa-times-circle";
      document.getElementById("signal").style.color = "#F43C36";
      openSettings();
      userLeave();
      if (errorback) errorback();
    });
}


//When user presses enter on welcome form

var input = document.getElementById("txtRoomName");

input.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("joinroombutton").click();
  }
});
