let showSource = false;

document.querySelectorAll(".source-link").forEach(item => {
  item.addEventListener("click", e => {

    if (showSource) {
      document.getElementById("source").classList.add("hidden");
      document.querySelectorAll(".source-link").forEach(jtem => {
        jtem.innerHTML = "View game source";
      });
    } else {
      document.getElementById("source").classList.remove("hidden");
      document.querySelectorAll(".source-link").forEach(jtem => {
        jtem.innerHTML = "Hide game source";
      });
    }
    showSource = !showSource;
  });
});
