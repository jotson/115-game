var Asteroid = function(game) {
    Phaser.Sprite.call(this, game, 0, 0, game.cache.getBitmapData('asteroid'));

    this.FUEL_DRAIN_PER_SECOND = 60;
    this.FUEL_SIZE_RATIO = 0.35;
    this.TRACTOR_GRAVITY = 0.5;

    this.initAsteroid();
};

Asteroid.prototype = Object.create(Phaser.Sprite.prototype);
Asteroid.prototype.constructor = Asteroid;

Asteroid.prototype.initAsteroid = function() {
    this.x = this.game.rnd.integerInRange(0, G.arena.width);
    this.y = this.game.rnd.integerInRange(0, G.arena.height);
    this.fuel = this.game.rnd.integerInRange(20,60);
    this.radius = this.fuel * this.FUEL_SIZE_RATIO;

    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.setTo(0.5, 0.5);
    this.body.maxVelocity.setTo(100, 100);
    this.body.velocity.setTo(this.game.rnd.integerInRange(-25, 25), this.game.rnd.integerInRange(-25, 25));
    this.body.angularVelocity = this.game.rnd.integerInRange(-90, 90) * 8 / this.radius;

    this.alpha = 0;
    this.game.add.tween(this).to({ alpha: 1 }, 750, Phaser.Easing.Sinusoidal.In, true);
};

Asteroid.prototype.update = function() {
    // Bounce
    if (this.body.x < 0) {
        this.body.x = 0;
        this.body.velocity.x = -this.body.velocity.x;
        G.highlightBounce(this);
    }
    if (this.body.x > G.arena.width - this.radius*2) {
        this.body.x = G.arena.width - this.radius*2;
        this.body.velocity.x = -this.body.velocity.x;
        G.highlightBounce(this);
    }
    if (this.body.y < 0) {
        this.body.y = 0;
        this.body.velocity.y = -this.body.velocity.y;
        G.highlightBounce(this);
    }
    if (this.body.y > G.arena.height - this.radius*2) {
        this.body.y = G.arena.height - this.radius*2;
        this.body.velocity.y = -this.body.velocity.y;
        G.highlightBounce(this);
    }

    if (this.radius <= 6) this.fuel = 0;
    this.radius = this.fuel * this.FUEL_SIZE_RATIO;

    this.scale.setTo(this.radius / 32, this.radius / 32);
};
