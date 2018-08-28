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
		if(keys[DIR.LEFT]){
			dAngle -= 3;
		}
		if(keys[DIR.RIGHT]){
			dAngle += 3;
		}
		this.angle += dAngle;
		if(keys[DIR.UP]){
			this.xVel += 0.038*Math.cos(this.angle * Math.PI / 180);
			this.yVel += 0.038*Math.sin(this.angle * Math.PI / 180);
		}
		if(keys[DIR.DOWN]){
			this.xVel -= 0.038*Math.cos(this.angle * Math.PI / 180);
			this.yVel -= 0.038*Math.sin(this.angle * Math.PI / 180);
		}
		if(keys[DIR.SPACE] && this.bulletTick > 12){
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
const DIR = Object.freeze({
	LEFT: 37, UP: 38, RIGHT: 39, DOWN:40, SPACE: 32,
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

class Game {

	constructor(canvas){
		this.canvas = canvas;
		this.canvas.height = 700;
		this.canvas.width = 700;
		paper.setup(canvas);
		this.ship = new Ship(this.canvas);
		this.bullets = [];
		this.meteors = [];
		this.score = 0;

		this.scoreItem = new paper.PointText(new paper.Point(20, 20));
		this.scoreItem.strokeColor = "white";
		this.scoreItem.fontSize = 12;

		if(getCookie("highscore") == null){
			console.log("No high score exists. Adding new one.");
			setCookie("highscore", "0");
		}
	}

	start(){
		addEventListener("keydown", handleKeyDown(this.ship), false);
		addEventListener("keyup", handleKeyUp, false);
		
		this.loop();
	}

	loop(){
		var count = 0;
		intervalId = setInterval(()=>{
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

let canvas = document.getElementById("screen");
let game = new Game(canvas);

game.start();