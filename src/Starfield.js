var Starfield = function(game) {
    Phaser.Group.call(this, game);

    // The starfield is multiple layers moving at different speeds
    this.makeStarfield(3000, 1, 0.4, 6);
    this.makeStarfield(800, 2, 0.4, 12);
    this.makeStarfield(400, 2, 0.6, 18);
    this.makeStarfield(200, 3, 0.8, 24);

    this.filters = [ this.game.add.filter('Glow') ];
};

Starfield.prototype = Object.create(Phaser.Group.prototype);
Starfield.prototype.constructor = Starfield;

Starfield.prototype.update = function() {
};

Starfield.prototype.makeStarfield = function(number, size, brightness, speed) {
    var bm = this.game.add.bitmapData(this.game.width*2, this.game.height);
    var ctx = bm.context;

    ctx.fillStyle = 'rgba(255, 255, 255, ' + brightness + ')';
    for(var i = 0; i < number; i++) {
        var x = this.game.rnd.integerInRange(0, this.game.width*2);
        var y = this.game.rnd.integerInRange(0, this.game.height);
        ctx.fillRect(x, y,  size, size);
    }

    var sprite = this.game.add.tileSprite(0, 0, this.game.width*2, this.game.height, bm, 0, this);

    this.game.add.tween(sprite.tilePosition).to({ x: -this.game.width*2 }, this.game.width*2/speed * 1000, Phaser.Easing.Linear.None, true, 0, Number.POSITIVE_INFINITY);

    return sprite;
};
