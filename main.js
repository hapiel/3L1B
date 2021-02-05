
// load js file depending on url parameter
const urlParams = new URLSearchParams(window.location.search);
const s = document.createElement("script");
s.type = "text/javascript";
s.src = "games/" + urlParams.get("game") + ".js";
document.getElementsByTagName("head")[0].appendChild(s);

// dropdown menu
document.getElementById("game-list").addEventListener("change", (e) =>{
  // change url parameter to select value
  window.location.search = "?game=" + e.target.value;
});