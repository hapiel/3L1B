
// load js file depending on url parameter
(async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const s = document.createElement("script");
  s.type = "text/javascript";
  let res = await fetch(`games/${urlParams.get("game")}.js`)
  if(res.status < 200 || res.status >= 300) {
    res = await fetch(`tests/${urlParams.get("game")}.js`)
  }
  s.src = res.url
  document.getElementsByTagName("head")[0].appendChild(s);

  // dropdown menu
  document.getElementById("game-list").addEventListener("change", (e) =>{
    // change url parameter to select value
    window.location.search = "?game=" + e.target.value;
  });
}());
