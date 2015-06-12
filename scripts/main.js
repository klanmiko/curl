var WIDTH = window.innerWidth, HEIGHT = window.innerHeight, delta;
var gamerdata, WIN = 1, LOSE = 0;
var lastFrame, delta, time, fps = 0, tempfps, lastFPS = getTime();
var btnPressSnd = new Audio("http://ragulbalaji.github.io/curl/audio/BtnPress.mp3");
var ballHitWallSnd = new Audio("http://ragulbalaji.github.io/curl/audio/BallHitWall.mp3");
var ballHitBatSnd = new Audio("http://ragulbalaji.github.io/curl/audio/BallHitBat.mp3");
var PointScoredSnd = new Audio("http://ragulbalaji.github.io/curl/audio/PointScored.mp3");
var leftBatElement = document.getElementById("leftBat"), rightBatElement = document.getElementById("rightBat"), BallElement = document.getElementById("Ball");
var mainMenu = document.getElementById("mainMenu"), gameState = document.getElementById("gameState"), multiplayerState = document.getElementById("multiplayerState"), creditState = document.getElementById("creditState"), settingsState = document.getElementById("settingsState");
var leftScoreEle = document.getElementById("leftScore"), rightScoreEle = document.getElementById("rightScore");
var debugspin = document.getElementById("ballspin");
var gameLoopVar, gameRunning;
var batClampVelocity = 0.6;
var Ball, leftBat, rightBat;
var leftScore, rightScore;
var ballrotation=0;
var batAcceleration = 0.1;
var batWallCoefficient=0.03;
var ballBounceEfficiency = 0.999, batMoveVelocity = 0.4, batBallFrictionCoeff = 0.45, batSpinFriction=0.5, ballTerminalVelocity = Math.SQRT2;
var CurrentState = 0, State = {MainMenu: 1, Game: 2, Multiplayer: 3, Settings:4, Credits:5};
var XMin = 0, XMax = WIDTH, YMin = 0.17 * HEIGHT, YMax = 0.95 * HEIGHT;
var ballradius = WIDTH*1/100;
var keys = new Array(255), oldKeys = new Array(255);
var resetDelayInMs = 50;
var ballRotationalInertia = 0.02;
gamerCheckIn();
var splashes = ["A Ball Game with Physics", gamerdata.userid + " has " + gamerdata.wins + " wins & " + gamerdata.losses + " losses", "PONG IS BACK!", "I was bored, so I made this.", "Ping Pong " + gamerdata.userid + "?", "Let's Dance", "As seen on TV!", "100% pure!", "Hello, " +gamerdata.userid +"!","Made by Ragul","Singleplayer!","Multiplayer!","Haha, Lol","Hand Hurts","I Should Sleep.","Made in Singapore","Open Source without intention","Wow!","Not on Steam!","Now with difficulty!","90% insect or bug free!","Soon with real balls.","Mostly HTML5","Minecraft is Better","<strike>Thousands of</strike> 2 colors!"];
var peer = new Peer(gamerdata.userid, {key: 'nkp6d8culreh4cxr'}); 
function gotoState(id){
   if(id == State.MainMenu){
      mainMenu.style.display="block";
      gameState.style.display= "none";
       multiplayerState.style.display="none";
      settingsState.style.display="none";
      creditState.style.display="none";
      document.getElementById("splash").innerHTML = splashes[randInt(0,splashes.length-1)];
   }else if(id == State.Game){
      mainMenu.style.display="none";
      gameState.style.display="block";
      multiplayerState.style.display="none";
      settingsState.style.display="none";
      creditState.style.display="none";
   }else if(id == State.Multiplayer){
   	mainMenu.style.display="none";
      gameState.style.display="none";
      multiplayerState.style.display="block";
      settingsState.style.display="none";
      creditState.style.display="none";
   }else if(id == State.Settings){
   	mainMenu.style.display="none";
      gameState.style.display="none";
      multiplayerState.style.display="none";
      settingsState.style.display="block";
      creditState.style.display="none";
      document.getElementById("useridbox").value = gamerdata.userid;
   }else if(id == State.Credits){
   	mainMenu.style.display="none";
      gameState.style.display="none";
      multiplayerState.style.display="none";
      settingsState.style.display="none";
      creditState.style.display="block";
   }
}

function setObjToEle(obj, ele){
   ele.style.left = obj.x;
   ele.style.top = obj.y;
}

function startGame(){
   gotoState(State.Game);
   WIDTH = window.innerWidth;
   HEIGHT = window.innerHeight;
   gameRunning = true;
   leftScore = 0;
   rightScore = 0;
   getDelta();
   Ball = new gameObj(WIDTH/2-HEIGHT/100,11*HEIGHT/20,0,0);
   leftBat = new gameObj((HEIGHT*5)/100,HEIGHT*23/50,0,0);
   rightBat = new gameObj(WIDTH - 2*((HEIGHT*5)/100),HEIGHT*23/50,0,0);
   //init
   if(randInt(1,2)==1){
      resetBall(1);
   }else{
      resetBall(-1);
   }
   setObjToEle(Ball, BallElement);
   setObjToEle(leftBat, leftBatElement);
   setObjToEle(rightBat, rightBatElement);
   //
   gameLoopVar = setInterval(gameLoop,0);
}
function input(){
    if(leftBat.vy<0)
    {
        leftBat.vy+=0.01*delta;
    }
    else if(leftBat.vy>0)
    {
        leftBat.vy-=0.01*delta;
    }
    if(Math.abs(leftBat.vy-0)<0.02)
    {
        leftBat.vy=0;
    }
   if(keys[87] || keys[38]){
      leftBat.vy += -2*batAcceleration*delta;
   }else if(keys[83] || keys[40]){
      leftBat.vy += 2*batAcceleration*delta;
   }
    if(keys[27]){ //Esc
      gameLoopVar = clearInterval(gameLoopVar);
      gotoState(State.MainMenu);
   }else if(keys[80] && !oldKeys[80]){ //Pause-P
      if(gameRunning){
         gameRunning = false;
         gameLoopVar = clearInterval(gameLoopVar);
      }else{
         gameRunning = true;
         getDelta();
         gameLoopVar = setInterval(gameLoop,0);
      }
   }
}
function touch(x, y, action) {
   leftBat.vy = 0;
   if(x <= WIDTH/2 && action){
      if(y < leftBat.y+(HEIGHT*9/100)){
         leftBat.vy = -batMoveVelocity;
      }else if(y > leftBat.y+(HEIGHT*9/100)){
         leftBat.vy = batMoveVelocity;
      }
   }
}
var yhit;
var angle=0;
function ballpath(){
    angle = Math.atan2(Ball.vy,Ball.vx);
    var angletonearestedge;
    if(Ball.vy>0)
    {
        angletonearestedge= Math.atan2((HEIGHT-Ball.y),WIDTH);
    }
    else if(Ball.vy<0)
    {
        angletonearestedge= Math.atan2(-Ball.y,WIDTH);
    }
    if(Math.abs(angle)<Math.abs(angletonearestedge))
    {
        //linear assignment
        yhit = Math.tan(angle)*WIDTH+Ball.y;
    }
    else{
        var period = angle;
        var phase = Ball.y*(Ball.vy,Math.abs(Ball.vy));
        yhit = HEIGHT*Math.sin((2*Math.PI/period)*WIDTH)-HEIGHT*10/100;
        yhit=0
    }
    
}
function ai(){
    //if we visualise the ball and the couse as a sine wave, we can use that to calculate the ball's end position and be there
    if(yhit==0){
        if(Ball.y > rightBat.y+(HEIGHT*9/100)){
        rightBat.vy = batMoveVelocity;
    }else if(Ball.y < rightBat.y+(HEIGHT*9/100)){
        rightBat.vy = -batMoveVelocity;
    }else{
        rightBat.vy = 0;
    }
    }
    else{
        if(rightBat.y>yhit)
        {
           rightBat.vy = -batMoveVelocity;
        }
        else if(rightBat.y<yhit)
        {
            rightBat.vy = batMoveVelocity;
        }
    }
}

function score(){
    if(Ball.x <= XMin){ // LEFTHIT
      PointScoredSnd.play();
      delay(resetDelayInMs);
      getDelta();
      resetBall(1);
      getDelta();
      updateStats(LOSE);
      rightScore++;
   }else if(Ball.x >= XMax){ //RIGHTHIT
      PointScoredSnd.play();
      delay(resetDelayInMs);
      getDelta();
      resetBall(-1);
      getDelta();
      updateStats(WIN);
      leftScore++;
   }
}
function gameLoop(){
   getDelta();
    input();
   //updates
   score();
    var impult;
    var mangle = Math.atan(Ball.vy/Ball.vx);
   if(Ball.y >= YMax ||  Ball.y <= YMin){
       if(Ball.y >= YMax)
            var relativespeed = Ball.vx+ballrotation*2;
       else if(Ball.y <= YMin)
            var relativespeed = Ball.vx+ballrotation*2;
        impult = Ball.vy+ballBounceEfficiency*Ball.vy;
      ballHitWallSnd.play();
      Ball.vy -= impult;
       //ballrotation+=batWallCoefficient*relativespeed/2;
       //Ball.vx+=batWallCoefficient*relativespeed;
      if(Ball.y >= YMax){
         Ball.y = YMax;
      }else{
         Ball.y = YMin;
      }
   }
   ai();
    var impulse;
    var angle=Math.atan(Ball.vy/Ball.vx);
   if(Ball.x+(HEIGHT*2/100) >= rightBat.x 
      && Ball.x+(HEIGHT*2/100) <= rightBat.x+(HEIGHT*5/100) 
      && Ball.y+(HEIGHT*1/100) >= rightBat.y 
      && Ball.y+(HEIGHT*1/100) <= rightBat.y+(HEIGHT*20/100)){
          ballHitBatSnd.play();
          Ball.x=rightBat.x-2*HEIGHT/100;
       var relativespeed = -Ball.vy+ballrotation*ballradius+rightBat.vy;
       impulse = Ball.vx+ballBounceEfficiency*Ball.vx;
       var normal = impulse/delta;
          Ball.vx-=impulse;
       ballrotation -= batSpinFriction*relativespeed/ballradius;
        Ball.vy+=batBallFrictionCoeff*relativespeed;
       document.getElementById("relativespeed").innerHTML=relativespeed;
   }else if(Ball.x <= leftBat.x+(HEIGHT*5/100) 
            && Ball.x >= leftBat.x
            && Ball.y+(HEIGHT*1/100) >= leftBat.y 
            && Ball.y+(HEIGHT*1/100) <= leftBat.y+(HEIGHT*20/100)){
      ballHitBatSnd.play();
           ballpath();
      Ball.x=leftBat.x+7*HEIGHT/100;
       var relativespeed = -Ball.vy-ballrotation*ballradius+leftBat.vy;
      impulse = Ball.vx+ballBounceEfficiency*Ball.vx;
       var normal = impulse/delta;
          Ball.vx-=impulse;          
       ballrotation += batSpinFriction*relativespeed/ballradius;
        Ball.vy+=batBallFrictionCoeff*relativespeed;
        document.getElementById("relativespeed").innerHTML=relativespeed;
   }
   if(rightBat.y >= YMax-(HEIGHT*19/100)){
      rightBat.y = YMax-(HEIGHT*19/100);
   }else if(rightBat.y <= YMin+(HEIGHT/100)){
      rightBat.y = YMin+(HEIGHT/100);
   }
   if(leftBat.y >= YMax-(HEIGHT*19/100)){
      leftBat.y = YMax-(HEIGHT*19/100+1);
       leftBat.vy=-0.4;
   }else if(leftBat.y <= YMin+(HEIGHT/100+1)){
      leftBat.y = YMin+(HEIGHT/100);
       leftBat.vy=+0.4;
   }
    if(leftBat.vy>batClampVelocity)
    {
        leftBat.vy=batClampVelocity;
    }
    else if(leftBat.vy<-batClampVelocity)
    {
        leftBat.vy=-batClampVelocity;
    }
   leftBat.x += leftBat.vx*delta;
   leftBat.y += leftBat.vy*delta;
   rightBat.x += rightBat.vx*delta;
   rightBat.y += rightBat.vy*delta;
   Ball.x += Ball.vx*delta;
   Ball.y += Ball.vy*delta;
    
   //
   gameRender();
   updateFPS();
}
function gameRender(){
   setObjToEle(Ball, BallElement);
   setObjToEle(leftBat, leftBatElement);
   setObjToEle(rightBat, rightBatElement);
   leftScoreEle.innerHTML = leftScore;
   rightScoreEle.innerHTML = rightScore;
    debugspin.innerHTML=ballrotation;
}
function saveOptions(){
	if(document.getElementById("useridbox").value != "") gamerdata.userid = document.getElementById("useridbox").value;
	localStorage.setItem("GamerData", JSON.stringify(gamerdata));
	console.log("Updated GamerData to localStorage >>",gamerdata);
}
function gameObj(px,py, pvx, pvy){
   this.x = px;
   this.y = py;
   this.vx = pvx;
   this.vy = pvy;
}
function resetBall(direction){
   Ball.x = WIDTH/2-HEIGHT/100;
   Ball.y = 11*HEIGHT/20;
   Ball.vx = (randInt(3,8)/(10*direction));
   Ball.vy = Math.random()-0.5;
    ballrotation=0;
    ballpath();
}
function updateStats(stat){
	if(stat == WIN){
		gamerdata.wins++;
	}else if(stat == LOSE){
		gamerdata.losses++;
	}
	console.log("User Statistics Updated :)");
	localStorage.setItem("GamerData", JSON.stringify(gamerdata));
}
function resetStats(){
	gamerdata.wins = 0;
	gamerdata.losses = 0;
	console.log("User Statistics Reset! YAY NEW BEGINNING");
	localStorage.setItem("GamerData", JSON.stringify(gamerdata));
}
function getTime() {return Date.now();}
function updateFPS() {
   if (getTime() - lastFPS > 1000) {
      console.log(fps);// FPS OUTPUT
      fps = tempfps;
      tempfps = 0;
      lastFPS += 1000;
   }
   tempfps++;
}
function getDelta() {
   time = getTime();
   delta = (time - lastFrame);
   lastFrame = time;
}
function randInt(min, max) {
   return Math.floor(Math.random() * (max - min + 1)) + min;
}
function delay(millis){
	var date = Date.now();
	var curDate = null;
	do { curDate = Date.now(); } 
	while(curDate-date < millis);
} 
function gamerCheckIn(){
	gamerdata = localStorage.getItem("GamerData");
	if(gamerdata == null){
		gamerdata = {userid:prompt("It seems you haven't got a UserName, give me one now?"),wins:0, losses:0};
		localStorage.setItem("GamerData", JSON.stringify(gamerdata));
		console.log("Created GamerData on localStorage >>",gamerdata);
	}else{
		gamerdata = JSON.parse(gamerdata);
	}
	document.title += " :: " +gamerdata.userid;
	console.log("Loaded GamerData from localStorage >>",gamerdata);
}
window.onkeydown = function (e) {
   keys[e.keyCode] = true;
   oldKeys[e.keyCode] = false;
};
window.onkeyup = function (e) {
   keys[e.keyCode] = false;
   oldKeys[e.keyCode] = true;
};
window.addEventListener('touchstart', function(e) {
 touch(e.changedTouches[0].pageX, e.changedTouches[0].pageY, true);
}, false);
window.addEventListener('touchmove', function(e) {
   e.preventDefault();
   touch(e.targetTouches[0].pageX, e.targetTouches[0].pageY, true);
}, false);

function main(){
   //Math.seedrandom(2000);
   gotoState(State.MainMenu);
   //startGame();
}
main();
