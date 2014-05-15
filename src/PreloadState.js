var DEBUG_PRELOADER = false;
if (DEBUG_PRELOADER) {
    Phaser.Loader.prototype.originalNextFile = Phaser.Loader.prototype.nextFile;

    Phaser.Loader.prototype.nextFile = function(previousIndex, success) {
        var self = this;
        window.setTimeout(function() { Phaser.Loader.prototype.originalNextFile.call(self, previousIndex, success); }, 100);
    };
}

var PreloadState = function(game) {
};

PreloadState.prototype.preload = function() {
    // Show progress bar
    preloadIcon = this.game.add.sprite(0, 0, this.game.cache.getBitmapData('enemy'));
    preloadIcon.y = this.game.height/2 - preloadIcon.height - 20;
    preloadIcon.x = this.game.width/2 - preloadIcon.width/2;
    preloadIcon.anchor.setTo(0.5, 0.5);
    this.game.add.tween(preloadIcon).to({ angle: 360 }, 2000, Phaser.Easing.Linear.None, true, 0, Number.POSITIVE_INFINITY);

    preloadBg = this.game.add.sprite(0, 0, this.game.cache.getBitmapData('preloader-bg'));
    preloadBg.y = this.game.height/2 - preloadBg.height/2;
    preloadBg.x = this.game.width/2 - preloadBg.width/2;

    preloadFg = this.game.add.sprite(0, 0, this.game.cache.getBitmapData('preloader-fg'));
    preloadFg.y = this.game.height/2 - preloadFg.height/2;
    preloadFg.x = this.game.width/2 - preloadFg.width/2;

    this.game.load.setPreloadSprite(preloadFg);

    // Setup load callback
    this.game.load.onFileComplete.add(this.fileLoaded, this);

    // Load assets
    this.game.load.image('menu-background', 'assets/gfx/start.png');
    this.game.load.image('hud-background', 'assets/gfx/hud.png');

    // Sounds
    this.game.load.audio('beep', ['assets/sfx/beep.ogg', 'assets/sfx/beep.mp3']);
    this.game.load.audio('bounce', ['assets/sfx/bounce.ogg', 'assets/sfx/bounce.mp3']);
    this.game.load.audio('detected', ['assets/sfx/detected.ogg', 'assets/sfx/detected.mp3']);
    this.game.load.audio('ding', ['assets/sfx/ding.ogg', 'assets/sfx/ding.mp3']);
    this.game.load.audio('explosion', ['assets/sfx/explosion.ogg', 'assets/sfx/explosion.mp3']);
    this.game.load.audio('homing', ['assets/sfx/homing.ogg', 'assets/sfx/homing.mp3']);
    this.game.load.audio('levelup', ['assets/sfx/levelup.ogg', 'assets/sfx/levelup.mp3']);
    this.game.load.audio('outoffuel', ['assets/sfx/out-of-fuel.ogg', 'assets/sfx/out-of-fuel.mp3']);
    this.game.load.audio('scanning', ['assets/sfx/scanning.ogg', 'assets/sfx/scanning.mp3']);
    this.game.load.audio('selfdestruct', ['assets/sfx/self-destruct.ogg', 'assets/sfx/self-destruct.mp3']);
    this.game.load.audio('thrust', ['assets/sfx/thrust.ogg', 'assets/sfx/thrust.mp3']);
    this.game.load.audio('tractorbeam', ['assets/sfx/tractor-beam.ogg', 'assets/sfx/tractor-beam.mp3']);

    // Music
    this.game.load.audio('song1', ['assets/sfx/song1.ogg', 'assets/sfx/song1.mp3']);
    this.game.load.audio('song2', ['assets/sfx/song2.ogg', 'assets/sfx/song2.mp3']);
    this.game.load.audio('song3', ['assets/sfx/song3.ogg', 'assets/sfx/song3.mp3']);
};

PreloadState.prototype.create = function() {
    G.setupStage();

    // Setup sound effects
    G.sfx.song1 = this.game.add.sound('song1', 0.3, false);
    G.sfx.song2 = this.game.add.sound('song2', 0.3, false);
    G.sfx.song3 = this.game.add.sound('song3', 0.3, false);

    G.sfx.beep = this.game.add.sound('beep', 1.0);
    G.sfx.bounce = this.game.add.sound('bounce', 0.6);
    G.sfx.detected = this.game.add.sound('detected', 1.0);
    G.sfx.ding = this.game.add.sound('ding', 0.6);
    G.sfx.explosion = this.game.add.sound('explosion', 1.0);
    G.sfx.homing = this.game.add.sound('homing', 1.0);
    G.sfx.levelup = this.game.add.sound('levelup', 0.6);
    G.sfx.outoffuel = this.game.add.sound('outoffuel', 1.0);
    G.sfx.scanning = this.game.add.sound('scanning', 1.0);
    G.sfx.selfdestruct = this.game.add.sound('selfdestruct', 1.0);
    G.sfx.thrust = this.game.add.sound('thrust', 1.0);
    G.sfx.tractorbeam = this.game.add.sound('tractorbeam', 0.25);

    // Delay to allow web fonts to load
    this.game.add.text(0, 0, ".", { font: '16px "jupiter"', fill: '#000000' });
    this.game.add.text(0, 0, ".", { font: '16px "8thcargo"', fill: '#000000' });
    G.fadeOut(1000, G.backgroundColor);
    this.game.time.events.add(1000, function() { this.game.state.start('menu'); }, this);
};

PreloadState.prototype.update = function() {
};

PreloadState.prototype.fileLoaded = function(progress, key, success, totalLoaded, totalFiles) {
};
