(function() {
	var box2d = require("ti.box2d");
	
	var walls = [];	
	var bricks = [];
	var score = "000";
	var numballs = 5;
	var maxvelocity = 10;
	var window = Ti.UI.createWindow({fullscreen: true});
	
	var scoreLabel = Titanium.UI.createLabel({
	    text: score,
	    height:'auto',
	    top: 0,
	    left: 50,
	    width:'auto',
	    color:'#ababab',
	    font:{fontSize:52,fontFamily:'Mini Kaliber S TT BRK'},
	    textAlign:'center'
	});
	
	var numballsLabel = Titanium.UI.createLabel({
	    text: numballs,
	    height:'auto',
	    top: 0,
	    right: 50,
	    width:'auto',
	    color:'#ababab',
	    font:{fontSize:52,fontFamily:'Mini Kaliber S TT BRK'},
	    textAlign:'center'
	});
	
	var gameoverLabel = Titanium.UI.createLabel({
	    text: "Game Over",
	    height:'auto',
	    width:'auto',
	    visible: false,
	    color:'#ababab',
	    font:{fontSize:72,fontFamily:'Mini Kaliber S TT BRK'},
	    textAlign:'center'
	});
	
	var winLabel = Titanium.UI.createLabel({
	    text: "You Win",
	    height:'auto',
	    width:'auto',
	    visible: false,
	    color:'#ababab',
	    font:{fontSize:72,fontFamily:'Mini Kaliber S TT BRK'},
	    textAlign:'center'
	});
	
	var restartButton = Titanium.UI.createButton({
		title: 'Restart',
		width: 100,
		height: 30,
		bottom: 60,
		visible: false
	});
	
	
	
	var view = Ti.UI.createView({
		backgroundColor: "#000000"
	});
	
	view.add(scoreLabel);
	
	view.add(numballsLabel);

	view.add(gameoverLabel);
	
	view.add(restartButton);
	
	window.add(view);
	window.open();
	
	var brickSound = Ti.Media.createSound({url:"/sound/brick.wav", preload: true});
	var wallSound = Ti.Media.createSound({url:"/sound/wall.wav",  preload: true});
	var pitSound = Ti.Media.createSound({url:"/sound/pit.wav",  preload: true});
	
	var world;
	var bat;
	var ball;
	
	function createWorld() {
		if (world) {
			world.stop();
			//world.dealloc();
		}
		world = box2d.createWorld(view);
		world.setGravity(0, 0);
		world.start();
	}
	
	var leftWall;
	var topWall;
	var rightWall;
	var bottomWall;
		
	function createWalls() {
		//Create Walls	
		
		var wallProperties = { density:100.0, friction:0.0, restitution:1.0, type:"static" };
		
		leftWall = world.addBody(
			Ti.UI.createView({
		  	backgroundColor:"#ababab",
		  	width:8,
		  	top:40,
		  	bottom:0,
		  	left:0,
		  	type: 'wall'
			}),wallProperties);
	
		topWall = world.addBody(
			Ti.UI.createView({
		  	backgroundColor:"#ababab",
		  	height:20,
		  	top:40,
		  	left:0,
		  	type: 'wall'
			}),wallProperties);
	
		rightWall = world.addBody(
			Ti.UI.createView({
		  	backgroundColor:"#ababab",
		  	width:8,
		  	top:40,
		  	bottom:0,
		  	right:0,
		  	type: 'wall'
			}),wallProperties);
	
		bottomWall = world.addBody(
			Ti.UI.createView({
		  	backgroundColor:"#ababab",
		  	height:42,
		  	bottom:0,
		  	left:0,
		  	type: 'pit',
		  	backgroundColor: "#000000"
			}),wallProperties);	
		
	}
	function createBat() {
		if (bat) {
			world.destroyBody(bat);
		}
		var batProperties = { density:10.0, friction:0.4, restitution:0.1, type:"static" };		
		bat = world.addBody(
			Ti.UI.createView({
		  	backgroundColor:"#d63bc3",
		  	height:6,
		  	width:40,
		  	bottom:49,
		  	type: 'bat',
			}),batProperties);		
	}

	function createBall() {
		if (ball) {
			world.destroyBody(ball);
		}		
		var ballProperties = { density:1.0, friction:0, restitution:1.0, radius:5.0, type:"dynamic" };	
		ball = world.addBody(
			Ti.UI.createView({
		  	backgroundColor:"#d63bc3",
		  	height:6,
		  	width: 6,
		  	type: 'ball'
			}),ballProperties);			
		ball.setLinearVelocity([10,10]);		
	}
	
	// create bricks
	function createBricks() {		
		bricks = [];

		var bx = 10;
		var by = 100;
	
		var brickProperties = { density:10.0, friction:0.0, restitution:0.1, type:"static" };
		var brickColors = [ "#d03ad1", "#f75352", "#fd8014", "#ff9024", "#05b320", "#6d65f6" ];
		
		
		for (var y = 0; y < 6; y++) {
			for (var x = 0; x < 20; x++) {			
				bricks.push(			
					world.addBody(
						Ti.UI.createView({
					  	backgroundColor: brickColors[y],
					  	height: 15,
					  	width: 15,
					  	left: bx,
					  	top: by,
					  	type: 'brick'
						}),brickProperties)
				);
				bx += 15;
			}
			bx = 10;
			by += 15;
		}		
	}
	
	var batYPos;		

	view.addEventListener("click",batMove);	
	
	function batMove(e) {
		var batPos = bat.getPosition();
		if (!batYPos){
			batYPos = batPos[1] - 7;
		}
		var leftLimit = (bat.view.width / 2) + leftWall.view.width;
		var rightLimit = (view.width - (bat.view.width / 2)) - rightWall.view.width;
		if (e.x < leftLimit){
			e.x = leftLimit;
		} else if (e.x > rightLimit) {
			e.x = rightLimit;
		}
		bat.SetTransform({posX: e.x, posY: batYPos, angle: 0});
	}
	
	function createCollision() {
		

		world.addEventListener("collision",function(e) {
			var ballVelocity = ball.getLinearVelocity();
			
			if (e.a.view.type == 'bat' && e.b.view.type == 'ball' && e.phase == "begin") {			  
			  	var batmid = bat.getPosition()[0] + (bat.view.width / 2);
				var ballmid = ball.getPosition()[0] + (ball.view.width / 2);
				if (ballmid < batmid) {
					ball.setLinearVelocity([ballVelocity[0]-1,ballVelocity[1]]);
				} else if (ballmid > batmid) {				
					ball.setLinearVelocity([ballVelocity[0]+1,ballVelocity[1]]);
				}
				wallSound.play();
			 } else if (e.b.view.type == 'ball' && e.a.view.type == 'pit' && e.phase == "begin"){
			 	numballs--;
			 	numballsLabel.text = numballs;
			 	pitSound.play();
			 	
			 	createBall();
			 	
			 	if (numballs <= 0) {
			 		world.destroyBody(ball);
			 		world.destroyBody(bat);
			 		gameoverLabel.visible = true;
			 		restartButton.visible = true;		 		
			 	}
			 } else if (e.a.view.type == 'wall' && e.b.view.type == 'ball' && e.phase == "end") {
		 		wallSound.play();
		 	 } else if (e.a.view.type == 'brick' && e.b.view.type == 'ball' && e.phase == "end") {
		 		brickSound.play();
				if (e.a) {
					world.destroyBody(e.a);
					score++;
					if (score < 10){
						score = "0"+score;
					}
					if (score < 100){
						score = "0" + score
					}
					scoreLabel.text = score;				
					bricks.pop();
					
					if (bricks.length == 0) {
						winLabel.visible = true;
						ball.setAwake(false);
			 			view.removeEventListener('click',batMove);					
					}
					
				}
			 } 
			 
			if (e.b.view.type == "ball" && e.phase == "begin") {
				var xvel = (ballVelocity[0] > maxvelocity) ? ballVelocity[0] - 1 : ballVelocity[0];
				var yvel = (ballVelocity[1] > maxvelocity) ? ballVelocity[1] - 1 : ballVelocity[1];			
				ball.setLinearVelocity([xvel,yvel]);
			}
		});		
	}
	
	Ti.Gesture.addEventListener('shake',function(e) {
		resetGame();
	});
	
	function resetGame(){
		createWorld();
		createWalls();
		createBricks();
		createBat();
		createBall();
		createCollision();
		gameoverLabel.visible = false;
		restartButton.visible = false;
		view.addEventListener('click',batMove);
		score = '000';
		scoreLabel.text = score;
		numballs = 5;
		numballsLabel.text = numballs;
	}	
	
	restartButton.addEventListener('click',function(e){
		resetGame();
   	});

	resetGame();
})();