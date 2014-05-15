var BootState = function(game) {
};

BootState.prototype.preload = function() {
    // Assets for the preloader
    this.game.load.image('preloader-icon', 'assets/gfx/preloader-icon.png');
    this.game.load.image('preloader-bg', 'assets/gfx/preloader-bg.png');
    this.game.load.image('preloader-fg', 'assets/gfx/preloader-fg.png');
};

BootState.prototype.create = function() {
    if (this.game.device.desktop) {

    } else {

    }

    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.maxWidth = G.width;
    this.game.scale.maxHeight = G.height;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.setScreenSize();
    this.game.stage.backgroundColor = G.backgroundColor;

    this.game.state.start('preloader');
};

BootState.prototype.update = function() {
};

window.onload = function() {
    var game = new Phaser.Game(G.width, G.height, Phaser.AUTO, 'game');

    G.game = game;

    game.state.add('boot', BootState, true);
    game.state.add('preloader', PreloadState, false);
    game.state.add('menu', MenuState, false);
    game.state.add('game', GameState, false);
    game.state.add('end', EndState, false);
    game.state.add('screenshot', ScreenshotState, false);
};
