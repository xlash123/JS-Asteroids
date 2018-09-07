class Bullet {

	constructor(canvas, ship){
		this.canvas = canvas;
		this.angle = ship.angle * Math.PI / 180;
		this.xPos = ship.xPos + ship.radius*Math.cos(this.angle);
		this.yPos = ship.yPos + ship.radius*Math.sin(this.angle);

		if(this.xPos < 0) this.xPos += this.canvas.width;
		else if(this.xPos > this.canvas.width) this.xPos -= this.canvas.width;
		if(this.yPos < 0) this.yPos += this.canvas.height;
		else if(this.yPos > this.canvas.height) this.yPos -= this.canvas.height;

		this.speed = 7;
		this.kill = false;

		this.path = new paper.Path.Line(new paper.Point(this.xPos, this.yPos), new paper.Point(this.xPos+12, this.yPos));
		this.path.rotate(ship.angle);
		this.path.strokeWidth = 2;
		this.path.strokeColor = "white";
	}

	update(game){
		this.xPos += this.speed*Math.cos(this.angle);
		this.yPos += this.speed*Math.sin(this.angle);
		this.path.position = new paper.Point(this.xPos, this.yPos);

		this.kill = this.xPos < 0 || this.xPos > this.canvas.width || this.yPos < 0 || this.yPos > this.canvas.height;
		if(this.kill){
			this.path.remove();
		}
	}

}

class Meteor {

	constructor(canvas){
		this.canvas = canvas;
		this.radius = Math.floor(Math.random() * 50) + 10;
		switch(Math.floor(Math.random() * 4)){
			case 0:
				this.xPos = -this.radius
				this.yPos = Math.random() * canvas.height;
				this.xVel = Math.random() * 1.7 + 0.3;
				this.yVel = (Math.random() * 1.7 + 0.3)-2;
				break;
			case 1:
				this.xPos = canvas.width+this.radius;
				this.yPos = Math.random() * canvas.height;
				this.xVel = -Math.random() * 1.7 + 0.3;
				this.yVel = (Math.random() * 1.7 + 0.3)-2;
				break;
			case 2:
				this.yPos = -this.radius;
				this.xPos = Math.random() * canvas.width;
				this.xVel = (Math.random() * 1.7 + 0.3)-2;
				this.yVel = Math.random() * 1.7 + 0.3;
				break;
			case 3:
				this.yPos = canvas.height+this.radius;
				this.xPos = Math.random() * canvas.width;
				this.xVel = (Math.random() * 1.7 + 0.3)-2;
				this.yVel = -Math.random() * 1.7 + 0.3;
		}
		this.kill = false;

		this.path = new paper.Path.Circle(this.xPos, this.yPos, this.radius);
		this.path.strokeWidth = 3;
		this.path.strokeColor = "white";
	}

	update(game){
		this.xPos += this.xVel;
		this.yPos += this.yVel;
		this.path.position = new paper.Point(this.xPos, this.yPos);
		for (var i in game.bullets){
			var b = game.bullets[i];
			this.kill = this.radius*this.radius >= Math.pow(b.xPos-this.xPos, 2) + Math.pow(b.yPos-this.yPos, 2);
			if(this.kill){
				b.kill = true;
				b.path.remove();
				this.path.remove();
				game.score += 120 - this.radius;
				return;
			}
		}
		this.kill = this.xPos < -this.radius || this.xPos > this.canvas.width+this.radius || this.yPos < -this.radius || this.yPos > this.canvas.height+this.radius; 
		if(this.kill){
			this.path.remove();
		}
	}

}

class Ship {

	constructor(canvas) {
		this.canvas = canvas;
		this.xPos = canvas.width/2;
		this.yPos = canvas.height/2;
		this.angle = 0;
		this.radius = 12;
		this.xVel = 0;
		this.yVel = 0;
		this.bullets = [];
		this.bulletTick = 13;
		this.dead = false;

		this.path = new paper.Path();
		this.path.strokeColor = "white";
		this.path.strokeWidth = 2;
		this.path.add(new paper.Point(this.radius,0), new paper.Point(-this.radius,this.radius), new paper.Point(-this.radius/2,0), new paper.Point(-this.radius,-this.radius));
		this.path.closed = true;
	}

	update(game){
		var dAngle = 0;
		if(keys[KEY.LEFT] || keys[KEY.A]){
			dAngle -= 3;
		}
		if(keys[KEY.RIGHT] || keys[KEY.D]){
			dAngle += 3;
		}
		this.angle += dAngle;
		if(keys[KEY.UP] || keys[KEY.W]){
			this.xVel += 0.038*Math.cos(this.angle * Math.PI / 180);
			this.yVel += 0.038*Math.sin(this.angle * Math.PI / 180);
		}
		if(keys[KEY.DOWN] || keys[KEY.S]){
			this.xVel -= 0.038*Math.cos(this.angle * Math.PI / 180);
			this.yVel -= 0.038*Math.sin(this.angle * Math.PI / 180);
		}
		if(keys[KEY.SPACE] && this.bulletTick > 12){
			game.bullets.push(new Bullet(this.canvas, this));
			this.bulletTick = 0;
		}
		if(this.xVel > 1.85) this.xVel = 1.85;
		else if(this.xVel < -1.85) this.xVel = -1.85;
		if(this.yVel > 1.85) this.yVel = 1.85;
		else if(this.yVel < -1.85) this.yVel = -1.85;

		this.xPos += this.xVel;
		this.yPos += this.yVel;
		if(this.xPos < 0) this.xPos = this.canvas.width;
		else if(this.xPos > this.canvas.width) this.xPos = 0;
		if(this.yPos < 0) this.yPos = this.canvas.height;
		else if(this.yPos > this.canvas.height) this.yPos = 0;

		this.xVel *= 0.9915;
		this.yVel *= 0.9915;
		if(Math.abs(this.xVel) < 0.001) this.xVel = 0;
		if(Math.abs(this.yVel) < 0.001) this.yVel = 0;

		this.bulletTick++;

		this.path.position = new paper.Point(this.xPos, this.yPos);
		this.path.pivot = new paper.Point(this.xPos, this.yPos);
		this.path.rotate(dAngle);

		for (var i in game.meteors){
			var m = game.meteors[i];
			if(this.path.getIntersections(m.path).length>0){
				this.dead = true;
				break;
			}
		}
	}

}

let keys = [];
let intervalId = 0;
const KEY = Object.freeze({
	LEFT: 37, UP: 38, RIGHT: 39, DOWN:40, SPACE: 32, ESC: 27, W: 87, A: 65, S: 83, D: 68,
});

const handleKeyDown = function(ship){
	return function(e){
		keys[e.keyCode] = true;
		e.preventDefault();
	}
}

const handleKeyUp = function(e){
	keys[e.keyCode] = false;
}

const touchStart = function(evt){
	var changed = evt.changedTouches;
	for (var i=0; i<changed.length; i++){
		var touch = changed[i];
		handleTouch(touch);
	}
}

const touchMove = function(evt){
	var changed = evt.changedTouches;
	for (var i=0; i<changed.length; i++){
		var touch = changed[i];
		handleTouch(touch);
	}
}

const handleTouch = function(touch, down=true){
	var x = touch.pageX - game.canvasX;
	var y = touch.pageY - game.canvasY;
	var point = new paper.Point(x, y);

	keys[KEY.LEFT] = game.padLeft.contains(point);
	keys[KEY.RIGHT] = game.padRight.contains(point);
	keys[KEY.UP] = game.padUp.contains(point);
	keys[KEY.DOWN] = game.padDown.contains(point);
	keys[KEY.SPACE] = game.padShoot.contains(point);
}

const touchEnd = function(evt){
	var changed = evt.changedTouches;
	for (var i=0; i<changed.length; i++){
		handleTouch(touch, false);
	}
}

class Game {

	constructor(canvas){
		this.canvas = canvas;
		window.addEventListener('resize', resizeCanvas, false);
		window.addEventListener('orientationchange', resizeCanvas, false);
		resizeCanvas();
		this.isMobile = window.mobilecheck();
		paper.setup(canvas);
		this.ship = new Ship(this.canvas);
		this.bullets = [];
		this.meteors = [];
		this.score = 0;
		
		this.canvasX = canvas.getBoundingClientRect().left;
		this.canvasY = canvas.getBoundingClientRect().top;

		this.scoreItem = new paper.PointText(new paper.Point(20, 20));
		this.scoreItem.strokeColor = "white";
		this.scoreItem.fontSize = 12;
		this.scoreItem.content = 0;

		if(this.isMobile){
			this.padLeft = new paper.Path.Rectangle(2, canvas.height-104, 50, 50);
			this.padLeft.strokeColor = "white";
			this.padLeft.strokeWidth = 1;
			this.padDown = new paper.Path.Rectangle(53, canvas.height-52, 50, 50);
			this.padDown.strokeColor = "white";
			this.padDown.strokeWidth = 1;
			this.padRight = new paper.Path.Rectangle(104, canvas.height-104, 50, 50);
			this.padRight.strokeColor = "white";
			this.padRight.strokeWidth = 1;
			this.padUp = new paper.Path.Rectangle(53, canvas.height-154, 50, 50);
			this.padUp.strokeColor = "white";
			this.padUp.strokeWidth = 1;
			this.padShoot = new paper.Path.Circle(new paper.Point(canvas.width-50, canvas.height-50), 48);
			this.padShoot.strokeColor = "white"
			this.padShoot.strokeWidth = 1;
		}

		if(getCookie("highscore") == null){
			console.log("No high score exists. Adding new one.");
			setCookie("highscore", "0");
		}
	}

	start(){
		if(this.isMobile){
			this.canvas.addEventListener("touchstart", touchStart, false);
			this.canvas.addEventListener("touchmove", touchMove, false);
			this.canvas.addEventListener("touchend", touchEnd, false);
		}else{
			addEventListener("keydown", handleKeyDown(this.ship), false);
			addEventListener("keyup", handleKeyUp, false);
		}
		this.loop();
	}

	loop(){
		var count = 0;
		var paused = false;
		var letUp = false;
		var pausedText = new paper.PointText(new paper.Point(0,0));
		pausedText.strokeColor = "white";
		pausedText.fontSize = 60;
		pausedText.fillColor = "white"
		pausedText.content = "Paused";
		pausedText.position = new paper.Point(this.canvas.width/2, this.canvas.height/2);
		pausedText.visible = false;
		intervalId = setInterval(()=>{
			if(paused){
				if(letUp && keys[KEY.ESC]){
					paused = false;
					letUp = false;
					pausedText.visible = false;
				}
				if(!keys[KEY.ESC]){
					letUp = true;
				}
			}else{
				if(Math.random() < (0.03 + count/1200000)){
					this.meteors.push(new Meteor(this.canvas));
				}
				this.ship.update(this);

				for (var i in this.bullets){
					var b = this.bullets[i];
					b.update(this);
				}
				this.bullets = this.bullets.filter(b => !b.kill);

				for (var i in this.meteors){
					var m = this.meteors[i];
					m.update(this);
				}
				this.meteors = this.meteors.filter(m => !m.kill);
				this.scoreItem.content = this.score;
				if(this.ship.dead){
					var highScore = parseInt(getCookie("highscore"))
					if(this.score > highScore){
						setCookie("highscore", this.score)
						alert("You died. RIP, my dude.\nNew High Score!: " + this.score);
					}else alert("You died. RIP, my dude.\nYour current high score is: " + highScore);
					clearInterval(intervalId);
					location.reload();
				}
				if(count%10==0) this.score++;
				count++;
				if(letUp && keys[KEY.ESC]){
					paused = true;
					letUp = false;
					pausedText.visible = true;
				}
				if (!keys[KEY.ESC]){
					letUp = true;
				}
			}
		}, 10);
	}

	getCookie(cname) {
	    var name = cname + "=";
	    var decodedCookie = decodeURIComponent(document.cookie);
	    var ca = decodedCookie.split(';');
	    for(var i = 0; i <ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0) == ' ') {
	            c = c.substring(1);
	        }
	        if (c.indexOf(name) == 0) {
	            return c.substring(name.length, c.length);
	        }
	    }
	    return "";
	}

}

function resizeCanvas() {
	canvas.height = window.innerHeight-50;
	canvas.width = window.innerWidth-100;
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    if(!value) value = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}

// Check if a new cache is available on page load.
window.addEventListener('load', function(e) {

  window.applicationCache.addEventListener('updateready', function(e) {
    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
      // Browser downloaded a new app cache.
      // Swap it in and reload the page to get the new hotness.
      window.applicationCache.swapCache();
      window.location.reload()
    } else {
      // Manifest didn't changed. Nothing new to server.
    }
  }, false);

}, false);

window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

let canvas = document.getElementById("screen");
let game = new Game(canvas);

game.start();