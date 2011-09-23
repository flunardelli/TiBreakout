(function() {
    app.ui = {};
    app.ui.createStartWindow = function() {

		app.ui.scoreLabel = Titanium.UI.createLabel({
		    height:'auto',
		    top: 0,
		    left: 50,
		    width:'auto',
		    color:'#ababab',
		    font:{fontSize:52,fontFamily:'Mini Kaliber S TT BRK'},
		    textAlign:'center'
		});
		
		app.ui.numballsLabel = Titanium.UI.createLabel({
		    text: app.numballs,
		    height:'auto',
		    top: 0,
		    right: 50,
		    width:'auto',
		    color:'#ababab',
		    font:{fontSize:52,fontFamily:'Mini Kaliber S TT BRK'},
		    textAlign:'center'
		});
		
		app.ui.gameoverLabel = Titanium.UI.createLabel({
		    text: "Game Over",
		    height:'auto',
		    width:'auto',
		    visible: false,
		    color:'#ababab',
		    font:{fontSize:72,fontFamily:'Mini Kaliber S TT BRK'},
		    textAlign:'center'
		});
		
		app.ui.winLabel = Titanium.UI.createLabel({
		    text: "You Win",
		    height:'auto',
		    width:'auto',
		    visible: false,
		    color:'#ababab',
		    font:{fontSize:72,fontFamily:'Mini Kaliber S TT BRK'},
		    textAlign:'center'
		});
		
		app.ui.restartButton = Titanium.UI.createButton({
			title: 'Restart',
			width: 100,
			height: 30,
			bottom: 60,
			visible: false
		});
		
	
		app.ui.view = Ti.UI.createView({
			backgroundColor: "#000000"
		});
		
		app.ui.view.add(app.ui.scoreLabel);	
		app.ui.view.add(app.ui.numballsLabel);
		app.ui.view.add(app.ui.gameoverLabel);
		app.ui.view.add(app.ui.restartButton);
		
		var window = Ti.UI.createWindow({fullscreen: true});
		window.add(app.ui.view);
		return window;
	}		
	app.ui.startGame = function() {

        // var win = app.ui.createGame();
        // win.open();
		// 
		var win = app.ui.createStartWindow();
		win.open();

        var world = app.createWorld(app.ui.view);
       // world.start();

    };
 	// app.ui.createGame = function() {
		// app.game.reset();
	// }				
	
	// restartButton.addEventListener('click',function(e){
		// resetGame();
   	// });		

	// Ti.Gesture.addEventListener('shake',function(e) {
		// resetGame();
	// });
	
})();