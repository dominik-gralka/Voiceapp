/*
* This class is going to be a sate Check with different css actions 
*/

function stateChange(Change){
  
  switch (Change) {
      
  case "loadMain":
      document.getElementById("connectioninfo-pre").textContent =
      "Connecting RTC";
    document.getElementById("signal").className = "fas fa-clock";
    document.getElementById("usercounticon").style.display = "none";
    document.getElementById("usercount").style.display = "none";
    document.getElementById("connectioninfo").textContent = "";
    document.getElementById("signal").style.color = "#FBA631";
    document.getElementById("roomurl").textContent =
    appURL() + "/" + getRoomName();
    document.getElementById("roomurl").addEventListener("click", event => {
      let range, selection;
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(event.target);
      selection.removeAllRanges();
      selection.addRange(range);
    });
    document.getElementById("roomurl-mobile").textContent =
      appURL() + "/" + getRoomName();
    document.getElementById("roomurl-mobile").addEventListener("click", event => {
      let range, selection;
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(event.target);
      selection.removeAllRanges();
      //selection.addRange(range);
    });
    break;
      
  case "usercheck":
      document.getElementById("connectioninfo-pre").textContent =
          "No Route";
        document.getElementById("connectioninfo").textContent = "";
        document.getElementById("usercounticon").style.display = "none";
        document.getElementById("usercount").style.display = "none";
        document.getElementById("signal").className = "fas fa-times-circle";
        document.getElementById("signal").style.color = "#F43C36";
      break;
    case "sessionDescription":
      document.getElementById("connectioninfo-pre").textContent = "Connected and Encrypted";
      document.getElementById("signal").className = "fas fa-shield-alt";
      document.getElementById("usercounticon").style.display = "inline";
      document.getElementById("usercount").style.display = "inline";
      //document.getElementById("connectioninfo").textContent = ROOM_ID;
      //document.getElementById('signal').className = "fas fa-comment";
      document.getElementById("signal").style.color = "#41EB7E";
      break
  }
}