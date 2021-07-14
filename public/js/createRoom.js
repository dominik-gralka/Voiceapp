// Function State Push when creating a new Room
//**********************************************************************
function createRoom() {
//**********************************************************************
  const appURL = () => {
    const protocol =
      "http" + (location.hostname == "localhost" ? "" : "s") + "://";
    return (
      protocol +
      location.hostname +
      (location.hostname == "localhost" ? ":3000" : "")
    );
  };
  

  let roomName = location.pathname.substring(1);
  
  if (roomName =! null) {
  roomName = document.getElementById("txtRoomName").value;
  const newurl = appURL() + "/" + roomName;
  /*window.history.pushState(
    {
      url: newurl
    },
    roomName,
    newurl
  );*/
    
  location.href = newurl;

  document.title = "Voiceapp - " + roomName;
    
  return roomName;
    }
  else {
    console.log("Error: roomName not found");
  }

}