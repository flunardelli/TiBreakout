(function() {

    app.game = {
        bricks : []
    };
    
	app.createWorld = function(gameView) {
		// if (world) {
			// world.stop();
		// }
		
		//var world;
		//var score = "000";
		app.game.maxvelocity = 10;
		app.game.batYPos;		
		
		app.game.brickSound = Ti.Media.createSound({url:"/sound/brick.wav", preload: true});
		app.game.wallSound = Ti.Media.createSound({url:"/sound/wall.wav",  preload: true});
		app.game.pitSound = Ti.Media.createSound({url:"/sound/pit.wav",  preload: true});
			
		var world = box2d.createWorld(gameView);
		world.setGravity(0, 0);
		//world.start();			
				
		var wallProperties = { density:100.0, friction:0.0, restitution:1.0, type:"static" };
			
		app.game.leftWall = world.addBody(
			Ti.UI.createView({
		  	backgroundColor:"#ababab",
		  	width:8,
		  	top:40,
		  	bottom:0,
		  	left:0,
		  	type: 'wall'
			}),wallProperties);
		
		app.game.topWall = world.addBody(
			Ti.UI.createView({
		  	backgroundColor:"#ababab",
		  	height:20,
		  	top:40,
		  	left:0,
		  	type: 'wall'
			}),wallProperties);
		
		app.game.rightWall = world.addBody(
			Ti.UI.createView({
		  	backgroundColor:"#ababab",
		  	width:8,
		  	top:40,
		  	bottom:0,
		  	right:0,
		  	type: 'wall'
			}),wallProperties);
		
		app.game.bottomWall = world.addBody(
			Ti.UI.createView({
		  	backgroundColor:"#ababab",
		  	height:42,
		  	bottom:0,
		  	left:0,
		  	type: 'pit',
		  	backgroundColor: "#000000"
			}),wallProperties);			
		
			// if (bat) {
				// world.destroyBody(bat);
			// }
		var batProperties = { density:10.0, friction:0.4, restitution:0.1, type:"static" };		
		app.game.bat = world.addBody(
			Ti.UI.createView({
		  	backgroundColor:"#d63bc3",
		  	height:6,
		  	width:40,
		  	bottom:49,
		  	type: 'bat',
			}),batProperties);		

		
		app.game.createBall = function() {				
			var ballProperties = { density:1.0, friction:0, restitution:1.0, radius:5.0, type:"dynamic" };	
			app.game.ball = world.addBody(
				Ti.UI.createView({
			  	backgroundColor:"#d63bc3",
			  	height:6,
			  	width: 6,
			  	type: 'ball'
				}),ballProperties);	
				app.game.ball.setLinearVelocity([0,(Math.random() * 6) * -1]);		
				
						
		}		

		var bx = 10;
		var by = 100;	
		var brickProperties = { density:10.0, friction:0.0, restitution:0.1, type:"static" };
		var brickColors = [ "#d03ad1", "#f75352", "#fd8014", "#ff9024", "#05b320", "#6d65f6" ];	
		
		for (var y = 0; y < 6; y++) {
			for (var x = 0; x < 20; x++) {			
				app.game.bricks.push(			
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
		

		app.game.handleBatMove = function (e) {
			var batPos = app.game.bat.getPosition();
			if (!app.game.batYPos){
				app.game.batYPos = batPos[1] - 7;
			}
			var leftLimit = (app.game.bat.view.width / 2) + app.game.leftWall.view.width;
			var rightLimit = (app.ui.view.width - (app.game.bat.view.width / 2)) - app.game.rightWall.view.width;
			if (e.x < leftLimit){
				e.x = leftLimit;
			} else if (e.x > rightLimit) {
				e.x = rightLimit;
			}
			app.game.bat.SetTransform({posX: e.x, posY: app.game.batYPos, angle: 0});
		}
		
		app.ui.view.addEventListener("click",app.game.handleBatMove);
		
		world.addEventListener("collision",function(e) {
			if (e.phase == "begin") {
				var ballVelocity = app.game.ball.getLinearVelocity();
				var aType = e.a.view.type;
				var bType = e.b.view.type;
				if (aType == 'bat' && bType == 'ball') {			  
				  	var batmid = e.a.getPosition()[0] + (e.a.view.width / 2);
					var ballmid = e.b.getPosition()[0] + (e.b.view.width / 2);
					if (ballmid < batmid) {
						e.b.setLinearVelocity([ballVelocity[0]-1,ballVelocity[1]]);
					} else if (ballmid > batmid) {				
						e.b.setLinearVelocity([ballVelocity[0]+1,ballVelocity[1]]);
					}
					app.game.handleSound('wall');
				 } else if (bType == 'ball' && aType == 'pit'){
				 	app.numballs--;
				 	app.ui.numballsLabel.text = app.numballs;
				 	app.game.handleSound('pit');
				 	app.game.ball.setAwake(false);
				 	world.destroyBody(app.game.ball);
				 	
				 	if (app.numballs <= 0) {
				 		
				 		world.destroyBody(app.game.bat);
				 		app.ui.gameoverLabel.visible = true;
				 		app.ui.restartButton.visible = true;		 		
				 	} else {
				 		app.game.createBall();
				 	}
				 } else if (aType == 'wall' && bType == 'ball') {
			 		app.game.handleSound('wall');
			 	 } else if (aType == 'brick' && bType == 'ball') {
			 		app.game.handleSound('brick');
					if (e.a) {
						world.destroyBody(e.a);
						app.score++;
						if (app.score < 10){
							app.score = "0"+app.score;
						}
						if (app.score < 100){
							app.score = "0" + app.score
						}
						app.ui.scoreLabel.text = app.score;				
						app.game.bricks.pop();
						
						if (app.game.bricks.length == 0) {
							app.ui.winLabel.visible = true;
							e.b.setAwake(false);
				 			//view.removeEventListener('click',batMove);					
						}
						
					}
				 } 
				 
				// if (bType == "ball") {
					// var xvel = (ballVelocity[0] > app.game.maxvelocity) ? ballVelocity[0] - 1 : ballVelocity[0];
					// var yvel = (ballVelocity[1] > app.game.maxvelocity) ? ballVelocity[1] - 1 : ballVelocity[1];			
					// e.b.setLinearVelocity([xvel,yvel]);
				// }
	
			};
			
		});		


		app.game.reset = function(){
			// createWorld();
			// createWalls();
			// createLevel();
			// createBat();
			// createBall();
			// handleCollision();
			// gameoverLabel.visible = false;
			// restartButton.visible = false;
			// view.addEventListener('click',batMove);
			// score = '000';
			// scoreLabel.text = score;
			// numballs = 5;
			// numballsLabel.text = numballs;
		}
		
		app.game.handleSound = function(sound){
			switch(sound){
				case 'brick': 
					app.game.brickSound.play();
				break;
				case 'pit':
					app.game.pitSound.play();
				break;
				default:
					app.game.wallSound.play();
				break;
			}	
		}
		
		app.game.createBall();
		
		
		return world;	
	}
			

})();