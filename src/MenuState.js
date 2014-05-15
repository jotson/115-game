var MenuState = function(game) {
    this.name = 'menu';
};

MenuState.prototype.create = function() {
    G.setupStage();

    // Asteroids
    this.asteroidGroup = this.game.add.group();
    for(var i = 0; i < 20; i++) {
        asteroid = new Asteroid(this.game);
        this.asteroidGroup.add(asteroid);
        asteroid.initAsteroid();
        asteroid.revive();
    }

    // Dummy player
    G.player = { x: -1000, y: -1000 };

    // Enemy
    G.enemyGroup = this.game.add.group();
    G.enemyGroup.add(new Enemy(G.game));
    G.enemyGroup.add(new Enemy(G.game));
    G.enemyGroup.add(new Enemy(G.game));

    var e = new Enemy(G.game);
    G.enemyGroup.add(e);
    e.demo = true;
    e.x = G.arena.width - 150;
    e.y = G.arena.height - 100;
    e.state = e.STATE_HOMING;
    e.scale.setTo(8, 8);
    e.smoothed = false;

    this.game.add.image(0, this.game.height - 100, 'hud-background').tint = 0xff0000;
    this.game.add.image(0, 0, 'menu-background');

    this.addTitles();
    this.addButtons();

    G.playMusic();

    G.fadeIn(1000, G.backgroundColor);

    // this.game.world.filters = [ this.game.add.filter('Scanline') ];
};

MenuState.prototype.addTitles = function() {
    var text = "\"Eins Eins Funf (115)\"\n\n" +
        "Programming, art, music, sound,\n" +
        "and design by John Watson\n" +
        "flagrantdisregard.com\n\n" +
        "Source @ \n" +
        "github.com/jotson/115\n\n" +
        "(c) 2014 John Watson\n" +
        "Licensed under the MIT license";
    var t = this.game.add.text(400, 40, text, { font: '30px jupiter', fill: '#64c8ff', align: 'right' });
    t.setShadow(3, 3, 0x000000, 0);
};

MenuState.prototype.addButtons = function() {
    var text = this.game.add.text(0, 0, '[SPACE] TO START', { font: '40px jupiter', fill: '#ffffff', align: 'center' });
    text.setShadow(3, 3, 0x000000, 0);
    text.x = this.game.width/2 - text.getBounds().width/2;
    text.y = this.game.height - 78;
    this.game.add.tween(text).to({ alpha: 0.2}, 1000, Phaser.Easing.Sinusoidal.In, true, 0, Number.POSITIVE_INFINITY, true);
};

MenuState.prototype.update = function() {
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        this.game.state.start('game');
    }
};
