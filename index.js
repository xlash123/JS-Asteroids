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
	}

	start(){
		addEventListener("keydown", handleKeyDown(this.ship), false);
		addEventListener("keyup", handleKeyUp, false);
		
		this.loop();
	}

	loop(){
		intervalId = setInterval(()=>{
			if(Math.random() < 0.03){
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
			if(this.ship.dead){
				alert("You died. RIP, my dude.");
				clearInterval(intervalId);
				location.reload();
			}
		}, 10);
	}

}

let canvas = document.getElementById("screen");
let game = new Game(canvas);

game.start();