var app = {
	numballs: 5,
	score: 0
};


var box2d = require("ti.box2d");

Ti.include('ui.js', 'game.js');

app.ui.startGame();
//app.ui.createStartWindow().open();