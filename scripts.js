var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 320;
var score = 0;
var highscore = localStorage.getItem("highscore");
e
var canvasElement = $("<canvas width ='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT +"'></canvas>");
var canvas = canvasElement.get(0).getContext("2d");
canvasElement.appendTo('body');

var FPS = 30;
setInterval(function(){
	update();
	draw();
}, 1000/FPS);

function gameOver(){
	canvas.textAlign = "center";
	canvas.font = "30px Verdana"; 
	canvas.fillText("GAME OVER", CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
	canvas.fillText(score, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 60);
	canvas.fillText("Press 'r' to restart", CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 90);
	canvas.restore();
	playerBullets.forEach(function(bullet){
		bullet.active = false;
	})
}

$(document).on("keydown", function(event){
	if(event.which === 82){
		location.reload();
	}
})

function update(){
	if(keydown.space && player.active){
		player.shoot();
	}
	if(keydown.left && player.x > 0 && player.active){
		player.x -= 5;
	}

	if(keydown.right && player.x < CANVAS_WIDTH - player.width && player.active){
		player.x += 5;
	}

	playerBullets.forEach(function(bullet){
		bullet.update();
	});

	playerBullets = playerBullets.filter(function(bullet){
		return bullet.active;
	});

	enemies.forEach(function(enemy){
		enemy.update();
	});

	oldEnemies = enemies.filter(function(enemy){
		return enemy.exploded;
	})

	score += oldEnemies.length;

	enemies = enemies.filter(function(enemy){
		return enemy.active;
	});



	if(Math.random() < 0.1) {
		enemies.push(Enemy());
	}

	handleCollisions();
};

function draw(){
	canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	player.draw();
	drawScore();
	playerBullets.forEach(function(bullet){
		bullet.draw();
	})
	enemies.forEach(function(enemy){
		enemy.draw();
	})
};

function drawScore(){
	canvas.font = "20px Verdana";
	if(score > highscore && !player.active){
		localStorage.setItem("highscore", score);
		canvas.fillText("High Score!!!: " + score, 10, 20);
	}else{
		canvas.fillText("Score: " + score, 10, 20);
		canvas.restore();
	}
}

function collides(a, b){
	return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.width > b.y;
}

function handleCollisions(){
	playerBullets.forEach(function(bullet){
		enemies.forEach(function(enemy){
			if(collides(bullet, enemy)){
				enemy.explode();
				bullet.active = false;
			}
		})
	})

	enemies.forEach(function(enemy){
		if(collides(enemy, player)){
			player.explode();
			enemy.explode();
		}
	})
}

var playerBullets = [];
var enemies = [];
var oldEnemies = [];

function Bullet(I){
	I.active = true;
	I.xVelocity = 0;
	I.yVelocity = -I.speed;
	I.width = 3;
	I.height = 3;
	I.color = "#000";

	I.inBounds = function(){
		return I.x >= 0 && I.x <= CANVAS_WIDTH && I.y >= 0 && I.y <= CANVAS_HEIGHT;

	}

	I.draw = function(){
		canvas.fillStyle = this.color;
		canvas.fillRect(this.x, this.y, this.width, this.height);
	}

	I.update = function(){
		I.x += I.xVelocity;
		I.y += I.yVelocity;
		I.active = I.active && I.inBounds();
	}

	return I;
}

function Enemy(I){
	I = I || {};

	I.active = true;
	I.exploded = false;
	I.age = Math.floor(Math.random() * 128);

	I.color = "#A2B";

	I.x = CANVAS_WIDTH/4 + Math.random() * CANVAS_WIDTH/2;
	I.y = 0;
	I.xVelocity = 0;
	I.yVelocity = 2;
	I.width = 32;
	I.height = 32;

	I.inBounds = function(){
		return I.x >= 0 && I.x <= CANVAS_WIDTH && I.y >= 0 && I.y <= CANVAS_HEIGHT;
	}

	I.draw = function(){
		//canvas.fillStyle = this.color;
		//canvas.fillRect(this.x, this.y, this.width, this.height);
        	canvas.drawImage(Vader, this.x, this.y, this.width, this.height);
	}

	I.explode = function(){
		I.active = false;
		I.exploded = true;
	}

	I.update = function(){
		I.x += I.xVelocity;
		I.y += I.yVelocity;
		I.xVelocity = 3 * Math.sin(I.age * Math.PI / 64);
		I.age++;
		I.active = I.active && I.inBounds();
	}
	return I;
}

var player ={
	color: "#00a",
	x: 220,
	y: 270,
	width: 32,
	height: 32,
	active: true,
	draw: function(){
		//canvas.fillStyle = this.color;
		//canvas.fillRect(this.x, this.y, this.width, this.height);
		if(this.active){
			canvas.drawImage(ship, this.x, this.y, this.width, this.height);
		}else{
			gameOver();
		}
	},
	 shoot: function(){
	 	var bulletPosition = this.midpoint();

	 	playerBullets.push(Bullet({
	 		speed: 5,
	 		x: bulletPosition.x,
	 		y: bulletPosition.y
	 	}))
	 },

	 midpoint: function(){
	 	return{
	 		x: this.x + this.width/2,
	 		y: this.y + this.height/2
	 	}
	 },

	 explode: function(){
	 	player.active = false;
	 	player.x = null;
	 	player.y = null;
	 }
};