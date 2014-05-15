var Player = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, game.cache.getBitmapData('ship'));

    this.THRUST = 60;
    this.STARTING_FUEL = 100;
    this.MAX_FUEL = 100;
    this.FUEL_BURN_PER_SECOND = 25;
    this.SEGMENTS = 8;

    this.radius = 12;
    this.fuel = this.STARTING_FUEL;

    // Fuel guage
    this.fuelBitmap = this.game.add.bitmapData(this.radius*2, this.radius*2);
    this.fuelSprite = this.game.add.image(0, 0, this.fuelBitmap);
    this.fuelSprite.anchor.setTo(0.5, 0.5);
    this.addChild(this.fuelSprite);
    this.updateTexture();

    // Physics
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.setTo(0.5, 0.5);
    this.body.maxVelocity.setTo(100, 100);
    this.body.drag.setTo(this.THRUST/10, this.THRUST/10);

    // Exhaust
    this.exhaust = this.game.add.emitter(0, 0, 10);
    this.exhaust.gravity = 0;
    this.exhaust.particleClass = ExhaustParticle;
    this.exhaust.makeParticles();
    this.exhaust.setScale(0.5, 1, 0.5, 1, 500);
    this.exhaust.setAlpha(1, 0, 500, Phaser.Easing.Cubic.In);
    this.exhaust.start(false, 500, 100, 1);
    this.exhaust.on = false;
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function() {
    this.body.acceleration.setTo(0, 0);

    // Thrust
    if (G.player.alive && this.fuel > 0) {
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.A) || this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            this.body.acceleration.x = -this.THRUST;
        }
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.D) || this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            this.body.acceleration.x = this.THRUST;
        }
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.W) || this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            this.body.acceleration.y = -this.THRUST;
        }
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.S) || this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            this.body.acceleration.y = this.THRUST;
        }
    }

    if (this.body.acceleration.x !== 0 || this.body.acceleration.y !== 0) {
        this.addFuel(-this.FUEL_BURN_PER_SECOND * this.game.time.elapsed/1000);
        if (this.fuel < 0) this.fuel = 0;
        if (!G.sfx.thrust.isPlaying) G.sfx.thrust.play();
        this.exhaust.on = true;
        this.exhaust.x = this.x;
        this.exhaust.y = this.y;

        // This basically says, if we're thrusting in the opposite direction that we're moving,
        // then shake the camera an amount proportional to the player's current speed.
        if (this.body.acceleration.x !== 0 && this.body.acceleration.x/Math.abs(this.body.acceleration.x) != this.body.velocity.x/Math.abs(this.body.velocity.x)) {
            G.shake(this.body.speed * 0.01, 10);
        }
        if (this.body.acceleration.y !== 0 && this.body.acceleration.y/Math.abs(this.body.acceleration.y) != this.body.velocity.y/Math.abs(this.body.velocity.y)) {
            G.shake(this.body.speed * 0.01, 10);
        }
    } else {
        if (G.sfx.thrust.isPlaying) G.sfx.thrust.stop();
        this.exhaust.on = false;
    }

    // Bounce
    if (this.body.x < 0) {
        this.body.x = 0;
        this.body.velocity.x = -this.body.velocity.x;
        G.sfx.bounce.play();
        G.highlightBounce(this);
        G.shake(1, 250);
    }
    if (this.body.x > G.arena.width - this.radius*2) {
        this.body.x = G.arena.width - this.radius*2;
        this.body.velocity.x = -this.body.velocity.x;
        G.sfx.bounce.play();
        G.highlightBounce(this);
        G.shake(1, 250);
    }
    if (this.body.y < 0) {
        this.body.y = 0;
        this.body.velocity.y = -this.body.velocity.y;
        G.sfx.bounce.play();
        G.highlightBounce(this);
        G.shake(1, 250);
    }
    if (this.body.y > G.arena.height - this.radius*2) {
        this.body.y = G.arena.height - this.radius*2;
        this.body.velocity.y = -this.body.velocity.y;
        G.sfx.bounce.play();
        G.highlightBounce(this);
        G.shake(1, 250);
    }
};

Player.prototype.addFuel = function(fuel) {
    if (fuel > 0 && this.fuel >= this.MAX_FUEL) {
        G.addPoints(fuel);
        if (!G.sfx.beep.isPlaying) G.sfx.beep.play();
    } else {
        this.fuel = this.fuel + fuel;
    }

    if (this.fuel <= 0) {
        this.fuel = 0;
        if (!G.sfx.outoffuel.isPlaying) {
            G.sfx.outoffuel.play();
        }
    }

    this.updateTexture();
};

Player.prototype.updateTexture = function() {
    var ctx = this.fuelBitmap.context;

    ctx.clearRect(0, 0, this.fuelBitmap.width, this.fuelBitmap.height);

    // Draw fuel
    var cx = this.fuelBitmap.width/2;
    var cy = this.fuelBitmap.height/2;
    var a1 = -Math.PI/2;
    var a2 = -Math.PI/2 + 2 * Math.PI * this.fuel / this.MAX_FUEL;
    if (this.fuel > this.MAX_FUEL * 0.5) {
        // Green
        ctx.fillStyle = 'rgb(0, 255, 0)';
    } else if (this.fuel > this.MAX_FUEL * 0.25) {
        // Orange
        ctx.fillStyle = 'rgb(255, 255, 0)';
    } else if (this.fuel > this.MAX_FUEL * 0) {
        // Red
        ctx.fillStyle = 'rgb(255, 0, 0)';
    }
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    if (this.fuel > 0) {
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, this.radius - 5, a1, a2, false);
        ctx.fill();
    } else {
        ctx.arc(cx, cy, this.radius/3, 0, 2 * Math.PI, false);
        ctx.stroke();
    }

    this.fuelBitmap.dirty = true;
};
