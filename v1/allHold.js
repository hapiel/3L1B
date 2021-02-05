
gameInfo = {
  title: "All hold",
  description: "Just some demo code, <br> all lights are on when holding button",
}
function loop(){
  
  if(button){
    lights[0] = true;
    lights[1] = true;
    lights[2] = true;
  } else{
    lights[0]= false;
    lights[1]= false;
    lights[2]= false;
  }
}