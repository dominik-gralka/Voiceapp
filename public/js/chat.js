// prints a message in the browser's dev tools console
// con = Connection
// tbox = TextBox

//BasicVariables
var myID = null;
console.log(peers)
/*
new WinBox({
  title: "Chat",
  background: "#ff005d",
  html: `<div class="toolBar" id="peerID">
    </div>
    <div class="toolBar">
      <input id="tboxConnect" type="text">
      <button onclick="connectToPeer()" class="btn btn-primary" type="button">
      Connect
      </button>
    </div> 
    <div class="toolBar">
      <input id="tboxMessage" type="text">
      <button onclick="sendMessage()" class="btn btn-primary" type="button">
      Senden
      </button>
    </div>`
});

new WinBox({
  title: "Log",
  background: "#00ff5d",
  html: `<div class="flexContainer" id="log" style="height:100%;width:100%;overflow:scroll">
    </div>`
});

var userCount = 0
var peer = new Peer(location.pathname.substring(1) + userCount ); //Hier muss noch die anzahl der personen als id hinzugefügt werden

peer.on("open", function(id) {
  userCount++;
  console.log("My peer ID is: " + id);
  myID = id;
});

var conString = document.getElementById("tboxConnect").value; //Wenn erster nutzer = channelname
var conn = peer.connect(conString);

function connectToPeer() {
  conString = document.getElementById("tboxConnect").value;
  conn = peer.connect(conString);
  console.log("Querry: " + conString); //getConnectionString
  conn.on("open", function() {
    conn.send(myID);
  });
}

peer.on("connection", function(conn) {
  console.log(conn.peer);
  conn.on("data", function(data) {
    document.getElementById("log").innerHTML += "<p>" + data + "</p>";
  });
});

function sendMessage() {
  var msg = document.getElementById("tboxMessage").value;
  conn.send(msg);
}
*/