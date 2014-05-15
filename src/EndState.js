var EndState = function(game) {
    this.name = 'end';
};

EndState.prototype.create = function() {
    G.setupStage();

    this.addTitles();
    this.addButtons();

    G.playMusic();

    G.fadeIn(1000, G.backgroundColor);
};

EndState.prototype.addTitles = function() {
    var text = "GAME OVER\n" +
        "SCORE " + G.score.toLocaleString() + "\n" +
        "FUEL/MINUTE " + G.getFuelPerMinute() + "\n" +
        "LEVEL " + (G.level + 1);
    var t = this.game.add.text(400, 150, text, { font: '40px jupiter', fill: '#ff0000', align: 'center' });
    t.setShadow(3, 3, 0x000000, 0);
    t.x = this.game.width/2 - t.getBounds().width/2;
};

EndState.prototype.addButtons = function() {
    var text = this.game.add.text(0, 0, '[SPACE] TO START OVER', { font: '40px jupiter', fill: '#ffffff', align: 'center' });
    text.setShadow(3, 3, 0x000000, 0);
    text.x = this.game.width/2 - text.getBounds().width/2;
    text.y = this.game.height - 78;
    this.game.add.tween(text).to({ alpha: 0.2}, 1000, Phaser.Easing.Sinusoidal.In, true, 0, Number.POSITIVE_INFINITY, true);
};

EndState.prototype.update = function() {
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        this.game.state.start('game');
    }
};
