var Enemy = function(game) {
    Phaser.Sprite.call(this, game, 0, 0, game.cache.getBitmapData('enemy'));

    this.STATE_IDLE = 1;
    this.STATE_HOMING = 2;
    this.MAX_SPEED = 40;
    this.THRUST = 30;
    this.DETECTION_DISTANCE = G.arena.width/8;
    this.THRUST_INTERVAL = 2000; // milliseconds

    this.thrust_elapsed = 0;
    this.homing_elapsed = 0;
    this.total_elapsed = 0;

    this.radius = 5;
    this.demo = false;
    this.alive = true;

    this.scannerBitmap = this.game.add.bitmapData(this.DETECTION_DISTANCE * 2, this.DETECTION_DISTANCE * 2);
    this.scannerSprite = this.game.add.sprite(0, 0, this.scannerBitmap);
    this.scannerSprite.anchor.setTo(0.5, 0.5);
    this.addChild(this.scannerSprite);

    this.initEnemy();
};

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.initEnemy = function() {
    // Try up to 5 times to find a position away from the player
    for(var i = 0; i < 5; i++) {
        this.x = this.game.rnd.integerInRange(50, G.arena.width-50);
        this.y = this.game.rnd.integerInRange(50, G.arena.height-50);

        var distance = this.game.math.distance(this.x, this.y, G.player.x, G.player.y);
        if (distance > this.DETECTION_DISTANCE) {
            break;
        }
    }

    this.rotationOffset = this.game.rnd.realInRange(0, 2 * Math.PI);

    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED);
    this.body.drag.setTo(this.THRUST, this.THRUST);

    this.anchor.setTo(0.5, 0.5);

    this.state = this.STATE_IDLE;

    this.alpha = 0;
    this.game.add.tween(this).to({ alpha: 1 }, 750, Phaser.Easing.Sinusoidal.In, true);
};

Enemy.prototype.update = function() {
    this.updateScannerSprite();

    this.thrust_elapsed += this.game.time.elapsed;
    this.homing_elapsed += this.game.time.elapsed;
    this.total_elapsed += this.game.time.elapsed;

    this.rotation = (Math.sin(this.total_elapsed/1000) * Math.PI + this.rotationOffset);

    if (this.demo === true) return;

    var distance = this.game.math.distance(this.x, this.y, G.player.x, G.player.y);

    if (G.player.alive && distance <= this.DETECTION_DISTANCE) {
        // Homing sound
        if (this.homing_elapsed > 800 * (distance/this.DETECTION_DISTANCE) + 50) {
            if (G.sfx.homing.isPlaying) G.sfx.homing.stop();
            G.sfx.homing.play();
            this.homing_elapsed = 0;
        }

        this.state = this.STATE_HOMING;

        // Calculate vector to player and GO
        var dx = G.player.x - this.x;
        var dy = G.player.y - this.y;
        var n = Math.max(Math.abs(dx), Math.abs(dy));

        // Accelerate towards the player. Increase acceleration the closer we get.
        // If the acceleration doesn't change as we approach, then the acceleration
        // acts just like gravity and allows the enemies to orbit the player.
        this.body.acceleration.x = dx/n * this.THRUST * this.DETECTION_DISTANCE/distance;
        this.body.acceleration.y = dy/n * this.THRUST * this.DETECTION_DISTANCE/distance;
    } else {
        if (this.state == this.STATE_HOMING) {
            if (!G.sfx.scanning.isPlaying) G.sfx.scanning.play();
        }

        this.state = this.STATE_IDLE;

        if (this.game.math.chanceRoll(6000)) {
            if (!G.sfx.scanning.isPlaying) G.sfx.scanning.play();
        }

        if (this.thrust_elapsed > this.THRUST_INTERVAL) {
            this.body.acceleration.x = this.game.rnd.integerInRange(-this.THRUST/5, this.THRUST/5);
            this.body.acceleration.y = this.game.rnd.integerInRange(-this.THRUST/5, this.THRUST/5);
            this.thrust_elapsed = 0;
        }
    }

    // Bounce
    if (this.body.x < 0) {
        this.body.x = 0;
        this.body.velocity.x = -this.body.velocity.x;
    }
    if (this.body.x > G.arena.width - this.radius*2) {
        this.body.x = G.arena.width - this.radius*2;
        this.body.velocity.x = -this.body.velocity.x;
    }
    if (this.body.y < 0) {
        this.body.y = 0;
        this.body.velocity.y = -this.body.velocity.y;
    }
    if (this.body.y > G.arena.height - this.radius*2) {
        this.body.y = G.arena.height - this.radius*2;
        this.body.velocity.y = -this.body.velocity.y;
    }
};

Enemy.prototype.updateScannerSprite = function() {
    var ctx = this.scannerBitmap.context;

    ctx.save();
    ctx.clearRect(0, 0, this.DETECTION_DISTANCE * 2, this.DETECTION_DISTANCE * 2);

    var cx = this.scannerBitmap.width/2;
    var cy = this.scannerBitmap.height/2;
    ctx.translate(cx, cy);

    if (this.state != this.STATE_IDLE) {
        // The 115 animation
        ctx.strokeStyle = 'rgba(255, 0, 0, ' + this.game.rnd.realInRange(0.5, 1.0) + ')';
        ctx.beginPath();
        ctx.arc(0, 0, this.DETECTION_DISTANCE, 0, 2 * Math.PI);
        ctx.stroke();
        var visualizer = Math.sin(this.total_elapsed / 1000);
        var characters = '1 1 5';
        var i, j, a, c, r;

        // Static
        ctx.save();
        ctx.fillStyle = 'rgba(255, 0, 0, ' + this.game.rnd.realInRange(0.2, 0.7) + ')';
        for (i = 0; i < 1000; i++) {
            a = this.game.rnd.realInRange(0, 2 * Math.PI);
            r = this.game.rnd.integerInRange(this.DETECTION_DISTANCE * 0.75, this.DETECTION_DISTANCE);
            ctx.rotate(a);
            ctx.fillRect(r, 0, 1, 1);
        }
        ctx.restore();

        ctx.font = '18px "8thcargo"';
        ctx.fillStyle = 'rgba(255, 0, 0, ' + this.game.rnd.realInRange(0.2, 0.7) + ')';
        if (visualizer >= 0) {
            for (i = 0; i < 40; i++) {
                a = this.game.rnd.realInRange(0, 2 * Math.PI);
                c = characters.substr(this.game.rnd.integerInRange(0, characters.length-1), 1);
                r = 40 + this.game.rnd.integerInRange(0, 2) * 10;
                ctx.rotate(a);
                ctx.fillText(c, r, 0);
            }
        } else {
            a = 2 * Math.PI / 10;
            for (i = 0; i < 10; i++) {
                ctx.rotate(a);
                ctx.fillText(characters, 40, 0);
            }
        }
    }

    // Circles
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, this.DETECTION_DISTANCE * Math.abs(Math.sin(this.total_elapsed/1000 * 3)), 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, this.DETECTION_DISTANCE * Math.abs(Math.sin(this.total_elapsed/1000 * 18)), 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, this.DETECTION_DISTANCE * Math.abs(Math.sin(this.total_elapsed/1000 * 32)), 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();

    this.scannerBitmap.dirty = true;
};