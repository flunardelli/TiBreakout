(function() {
	var box2d = require("ti.box2d");
	
	var walls = [];	
	var bricks = [];
	var score = "000";
	var numballs = 5;
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
	
	var view = Ti.UI.createView({
		backgroundColor: "#000000"
	});
	
	view.add(scoreLabel);
	
	view.add(numballsLabel);

	view.add(gameoverLabel);
	
	window.add(view);
	window.open();
	
	var brickSound = Ti.Media.createSound({url:"/sound/brick.wav", preload: true});
	var wallSound = Ti.Media.createSound({url:"/sound/wall.wav",  preload: true});
	var pitSound = Ti.Media.createSound({url:"/sound/pit.wav",  preload: true});
	
	var world = box2d.createWorld(view);
	
	//Create Walls	
	var wallProperties = { density:100.0, friction:0.0, restitution:1.0, type:"static" };
	
	var leftWall = world.addBody(
		Ti.UI.createView({
	  	backgroundColor:"#ababab",
	  	width:8,
	  	top:40,
	  	bottom:0,
	  	left:0,
	  	type: 'wall'
		}),wallProperties);

	var topWall = world.addBody(
		Ti.UI.createView({
	  	backgroundColor:"#ababab",
	  	height:20,
	  	top:40,
	  	left:0,
	  	type: 'wall'
		}),wallProperties);

	var rightWall = world.addBody(
		Ti.UI.createView({
	  	backgroundColor:"#ababab",
	  	width:8,
	  	top:40,
	  	bottom:0,
	  	right:0,
	  	type: 'wall'
		}),wallProperties);

	var bottomWall = world.addBody(
		Ti.UI.createView({
	  	backgroundColor:"#ababab",
	  	height:42,
	  	bottom:0,
	  	left:0,
	  	type: 'pit',
	  	backgroundColor: "#000000"
		}),wallProperties);
		
	walls = [leftWall, topWall, rightWall, bottomWall];

	//create bat
	var batProperties = { density:5000.0, friction:0.2, restitution:0.0, type:"static" };	

	var bat = world.addBody(
		Ti.UI.createView({
	  	backgroundColor:"#d63bc3",
	  	height:6,
	  	width:40,
	  	bottom:49,
	  	type: 'bat',
		}),batProperties);

	//create ball
	var ballProperties = { density:0.5, friction:0.0, restitution:1.0, radius:5.0, type:"dynamic" };	

	var ball = world.addBody(
		Ti.UI.createView({
	  	backgroundColor:"#d63bc3",
	  	height:6,
	  	width: 6,
	  	type: 'ball'
		}),ballProperties);	
	
	// create bricks
	var bx = 10;
	var by = 100;

	var brickProperties = { density:1.0, friction:0.0, restitution:0.0, type:"static" };
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
	
	world.addEventListener("collision",function(e) {
		if (e.a.view.type == 'bat' && e.b.view.type == 'ball' && e.phase == "begin") {			  
		  	var ballVelocity = ball.getLinearVelocity();
		  	Ti.API.info("bat -> ball = collide: " + ballVelocity[0]);
		  	var batmid = bat.getPosition()[0] + (bat.view.width / 2);
			var ballmid = ball.getPosition()[0] + (ball.view.width / 2);
			var diff;
			if (ballmid < batmid) {
				diff = batmid - ballmid;
				ball.setLinearVelocity([ballVelocity[0]-10,ballVelocity[1]]);
				//ball.setLinearVelocity([(-3 * diff),ballVelocity[1]]);
			} else if (ballmid > batmid) {				
				diff = ballmid - batmid;
				ball.setLinearVelocity([ballVelocity[0]+10,ballVelocity[1]]);
				//ball.setLinearVelocity([(3 * diff),ballVelocity[1]]);
			} else {
				//ball.setLinearVelocity([2 + Math.random() * 3,ballVelocity[1]]);
			}
			wallSound.play();
		 } else if (e.b.view.type == 'ball' && e.a.view.type == 'pit' && e.phase == "begin"){
		 	numballs--;
		 	numballsLabel.text = numballs;
		 	pitSound.play();
		 	if (numballs <= 0) {
		 		ball.setAwake(false);
		 		view.removeEventListener('click',batMove);
		 		gameoverLabel.visible = true;		 		
		 	}
		 }  else if (e.a.view.type == 'wall' && e.b.view.type == 'ball' && e.phase == "end") {
	 		wallSound.play();
	 	 } else if (e.a.view.type == 'brick' && e.b.view.type == 'ball' && e.phase == "end") {
	 		brickSound.play();
	 		//var brickRemoved = bricks.splice(brickIndex,1);
			//Ti.API.info("brick -> ball = collide" + brickIndex + " -- " + bricks.length);
			//e.a.setAwake(false);
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
			}
		 } 
	});
	Ti.Gesture.addEventListener('shake',function(e) {
		if (numballs <= 0) {	
			gameoverLabel.visible = false;
	    	ball.setAwake(true);
			view.addEventListener('click',batMove);
			score = '000';
			scoreLabel.text = score;
			ball.applyLinearImpulse([0,5], [1,2]);
			//ball.SetTransform({posX: 100, posY: 50, angle: 0});
			numballs = 5;
			numballsLabel.text = numballs;
		}
	});
	world.start();
})();