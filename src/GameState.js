var GameState = function(game) {
    this.name = 'game';
};

GameState.prototype.create = function() {
    G.setupStage();

    // Player
    G.player = new Player(this.game, 400, 250);
    G.player.revive();
    this.game.add.existing(G.player);

    // Asteroids
    this.asteroidGroup = this.game.add.group();
    for(var i = 0; i < 20; i++) {
        this.createAsteroid();
    }

    // Enemy
    G.enemyGroup = this.game.add.group();

    // Tractor beams
    this.tractorBitmap = this.game.add.bitmapData(G.arena.width, G.arena.height);
    this.tractorBeams = this.game.add.image(0, 0, this.tractorBitmap);

    // Explosion
    this.explosion = this.game.add.emitter(0, 0, 16);
    this.explosion.gravity = 0;
    this.explosion.particleClass = ExplosionParticle;
    this.explosion.makeParticles();
    this.explosion.setScale(1, 6, 1, 1);
    this.explosion.setXSpeed(-75, 75);
    this.explosion.setYSpeed(-75, 75);
    this.explosion.setRotation(-1000, 1000);
    this.explosion.setAlpha(1, 0, 2000, Phaser.Easing.Cubic.In);

    // Bonus 1k emitter
    G.bonus1k = this.game.add.emitter(0, 0, 10);
    G.bonus1k.gravity = 0;
    G.bonus1k.particleClass = TextParticle;
    G.bonus1k.makeParticles();
    G.bonus1k.setXSpeed(0, 0);
    G.bonus1k.setYSpeed(-30, -30);
    G.bonus1k.setRotation(0, 0);
    G.bonus1k.setAlpha(1, 0, 2000, Phaser.Easing.Cubic.In);

    // Bonus x10 emitter
    G.bonusx10 = this.game.add.emitter(0, 0, 100);
    G.bonusx10.gravity = 0;
    G.bonusx10.particleClass = TextParticle;
    G.bonusx10.makeParticles();
    G.bonusx10.setXSpeed(0, 0);
    G.bonusx10.setYSpeed(-100, -100);
    G.bonusx10.setRotation(0, 0);
    G.bonusx10.setAlpha(1, 0, 1500, Phaser.Easing.Cubic.In);
    G.bonusx10.start(false, 1500, 160, 1);
    G.bonusx10.on = false;

    // Self destruct timer
    this.selfDestructTimer = this.game.add.text(0, 0, '', { font: '16px "jupiter"', fill: '#ff0000' });
    this.selfDestructTimer.visible = false;

    // HUD
    this.hud = this.game.add.group();
    this.hud.bg = this.game.add.image(0, G.arena.height, 'hud-background', 0, this.hud);
    this.hud.levelText = this.game.add.text(418, G.arena.height + 80, '', { font: '16px "jupiter"', fill: '#64c8ff' }, this.hud);
    this.hud.randomText = this.game.add.text(352, G.arena.height + 80, '', { font: '16px "jupiter"', fill: '#64c8ff' }, this.hud);
    this.hud.scoreText = this.game.add.text(535, G.arena.height + 46, '', { font: '30px "jupiter"', fill: '#64c8ff' }, this.hud);
    this.hud.fpmText = this.game.add.text(223, G.arena.height + 80, '', { font: '16px "jupiter"', fill: '#64c8ff' }, this.hud);
    this.hud.fpsText = this.game.add.text(292, G.arena.height + 45, '', { font: '16px "jupiter"', fill: '#64c8ff' }, this.hud);

    this.hud.scannerEnemy = new Enemy(this.game);
    this.hud.add(this.hud.scannerEnemy);

    // Bitmap for drawing on the HUD
    this.hud.overlayBitmap = this.game.add.bitmapData(G.arena.width, 100);
    this.hud.overlaySprite = this.game.add.sprite(0, G.arena.height, this.hud.overlayBitmap, 0, this.hud);

    this.resetGame();

    this.game.time.advancedTiming = true;
};

GameState.prototype.resetGame = function() {
    G.playMusic();

    G.level = 0;
    G.score = 0;
    G.fuel.level = 0;
    G.fuel.total = 0;
    G.fuel.goal = G.levels[G.level].fuel;
    G.fuel.graph = [];
    G.underAttack = false;
    G.gameTime = 0;
    delete G.wallBounceHighlights;

    G.message = new Message(this.game, null);
    G.message.add("Welcome, space miner!");
    G.message.add("Use W,A,S,D or ARROWS to move");
    G.message.add("Watch your fuel");
    G.message.add("Avoid mines");
    G.message.add("Collect fuel from asteroids");
    G.message.add("Collect EXTRA fuel to advance");

    G.enemyGroup.callAll('kill');

    this.self_destruct = 0;
};

GameState.prototype.update = function() {
    this.collectFuel();

    G.gameTime += this.game.time.elapsed;

    G.message.update();

    G.underAttack = false;
    G.enemyGroup.forEachAlive(function(a) {
        if (G.underAttack) return;
        var distance = this.game.math.distance(a.x, a.y, G.player.x, G.player.y);
        if (distance <= a.DETECTION_DISTANCE) G.underAttack = true;
    }, this);

    // Level
    this.hud.levelText.alpha = this.game.rnd.realInRange(0.4, 0.6);
    this.hud.levelText.setText('LVL' + (G.level + 1));

    // Random
    this.hud.randomText.alpha = this.game.rnd.realInRange(0.4, 0.6);
    this.hud.randomText.setText(this.game.rnd.integerInRange(1000,9999)/10 + '');

    // Score
    this.hud.scoreText.alpha = this.game.rnd.realInRange(0.4, 0.6);
    this.hud.scoreText.setText(G.score.toLocaleString());
    this.hud.scoreText.x = 535 + 150/2 - this.hud.scoreText.getBounds().width/2;

    // Fuel per minute
    this.hud.fpmText.alpha = this.game.rnd.realInRange(0.4, 0.6);
    this.hud.fpmText.setText('FPM ' + G.getFuelPerMinute() + '');

    // FPS
    this.hud.fpsText.alpha = this.game.rnd.realInRange(0.4, 0.6);
    this.hud.fpsText.setText(this.game.time.fps + '');

    // Prepare HUD overlays
    this.hud.overlayBitmap.context.clearRect(0, 0, G.arena.width, 100);
    this.hud.overlayBitmap.dirty = true;

    // Fuel chart
    var BARS = 51;
    var MAX_HEIGHT = 80;
    var max = 0;
    var currentIndex = Math.floor(G.gameTime/1000);
    for (var i = currentIndex - BARS; i < currentIndex; i++) {
        if (G.fuel.graph[i] !== undefined) {
            max = Math.max(G.fuel.graph[i], max);
        }
    }
    if (max === 0) max = 1;
    var w = 3;
    this.hud.overlayBitmap.context.fillStyle = 'rgba(100, 200, 255, ' + this.game.rnd.realInRange(0.4, 0.6) + ')';
    for (var n = 0; n < BARS; n++) {
        i = currentIndex - n;
        if (G.fuel.graph[i] !== undefined) {
            this.hud.overlayBitmap.context.fillRect(15 + n * (w+1), 9, w, G.fuel.graph[i]/max * MAX_HEIGHT + 4);
        } else {
            this.hud.overlayBitmap.context.fillRect(15 + n * (w+1), 9, w, 1);
        }
    }

    // Static
    G.drawStatic(this.hud.overlayBitmap.context, 7, 8, 215, 86);
    G.drawStatic(this.hud.overlayBitmap.context, 528, 40, 164, 48);

    // Fuel tank
    var tank_height = 65;
    var tank_fill = G.fuel.level/G.levels[G.level].fuel * tank_height;
    this.hud.overlayBitmap.context.fillStyle = 'rgba(100, 255, 200, ' + this.game.rnd.realInRange(0.4, 0.6) + ')';
    this.hud.overlayBitmap.context.fillRect(226, 10 + tank_height - tank_fill, 40, tank_fill);

    // Gauges
    G.drawGauge(this.hud.overlayBitmap.context, 298, 23, 10, G.player.body.maxVelocity.x, Math.abs(G.player.body.velocity.x));
    G.drawGauge(this.hud.overlayBitmap.context, 501, 23, 10, G.player.body.maxVelocity.y, Math.abs(G.player.body.velocity.y));
    G.drawGauge(this.hud.overlayBitmap.context, 310, 76, 10, G.player.THRUST, Math.abs(G.player.body.acceleration.x));
    G.drawGauge(this.hud.overlayBitmap.context, 492, 76, 10, G.player.THRUST, Math.abs(G.player.body.acceleration.y));

    // Scanner images
    this.hud.scannerEnemy.revive();
    this.hud.scannerEnemy.x = G.arena.width/2;
    this.hud.scannerEnemy.y = G.arena.height + 45;
    this.hud.scannerEnemy.state = this.hud.scannerEnemy.STATE_HOMING;
    this.hud.scannerEnemy.demo = true;
    this.hud.scannerEnemy.scale.setTo(0.6, 0.6);
    if (G.underAttack) {
        this.hud.scannerEnemy.visible = true;
    } else {
        this.hud.scannerEnemy.visible = false;
    }

    if (G.underAttack) {
        // eins! eins! fünf!
        if (!G.sfx.detected.isPlaying) G.sfx.detected.play();
        this.hud.setAll('tint', 0xff0000);
    } else {
        if (G.sfx.detected.isPlaying) G.sfx.detected.stop();
        this.hud.setAll('tint', 0xffffff);
    }

    if (G.player.alive && this.game.input.keyboard.isDown(Phaser.Keyboard.ZERO)) {
        this.selfDestruct();
    }

    if (G.fuel.level > G.fuel.goal) {
        G.nextLevel();
    }

    if (this.self_destruct > 0) {
        if (!G.sfx.selfdestruct.isPlaying) G.sfx.selfdestruct.play();
        this.self_destruct = this.self_destruct - this.game.time.elapsed;
        this.selfDestructTimer.setText(this.self_destruct/1000 + '');
        this.selfDestructTimer.visible = true;
        this.selfDestructTimer.x = G.player.x + G.player.radius + 5;
        this.selfDestructTimer.y = G.player.y - 8;
        if (this.self_destruct <= 0) {
            this.self_destruct = 0;
            this.selfDestructTimer.visible = false;
            this.explode();
        }
    }
};

GameState.prototype.collectFuel = function() {
    if (!G.player.alive) return;

    var ctx = this.tractorBitmap.context;

    ctx.clearRect(0, 0, this.tractorBitmap.width, this.tractorBitmap.height);
    ctx.lineWidth = 2;

    this.asteroidGroup.forEachAlive(function(a) {
        if (this.game.math.distance(G.player.x, G.player.y, a.x, a.y) < G.player.radius * 4) {
            if (!G.sfx.tractorbeam.isPlaying) G.sfx.tractorbeam.play();

            ctx.beginPath();
            var alpha = this.game.rnd.realInRange(0, 1);
            var color = this.game.rnd.integerInRange(0, 255);
            ctx.strokeStyle = 'rgba(' + color + ', 255, ' + color + ', ' + alpha + ')';
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(G.player.x, G.player.y);
            ctx.stroke();

            var dx = a.x - G.player.x;
            var dy = a.y - G.player.y;
            var n = Math.max(Math.abs(dx), Math.abs(dy));
            G.player.body.velocity.x += dx/n * a.TRACTOR_GRAVITY;
            G.player.body.velocity.y += dy/n * a.TRACTOR_GRAVITY;

            G.player.addFuel(a.FUEL_DRAIN_PER_SECOND * this.game.time.elapsed/1000);

            a.fuel -= a.FUEL_DRAIN_PER_SECOND * this.game.time.elapsed/1000;

            if (a.fuel <= 0) {
                if (G.sfx.tractorbeam.isPlaying) G.sfx.tractorbeam.stop();
                G.sfx.ding.play();
                G.addBonus(1000);
                a.kill();
                this.createAsteroid();
            }
        }
    }, this);

    G.enemyGroup.forEachAlive(function(a) {
        var distance = this.game.math.distance(a.x, a.y, G.player.x, G.player.y);
        if (distance <= a.radius + G.player.radius) {
            a.kill();
            this.explode();
        }
    }, this);

    this.tractorBitmap.dirty = true;
};

GameState.prototype.createAsteroid = function() {
    var asteroid = this.asteroidGroup.getFirstDead();

    if (asteroid === undefined || asteroid === null) {
        asteroid = new Asteroid(this.game);
        this.asteroidGroup.add(asteroid);
    }

    asteroid.initAsteroid();
    asteroid.revive();

    return asteroid;
};

GameState.prototype.selfDestruct = function() {
    this.self_destruct = 3000;
};

GameState.prototype.explode = function() {
    this.explosion.x = G.player.x;
    this.explosion.y = G.player.y;
    this.explosion.start(true, 2000, 0, 100);
    G.sfx.explosion.play();
    G.player.kill();
    G.fadeOut(3000, G.backgroundColor);
    this.game.time.events.add(3000, function() { this.game.state.start('end'); }, this);
};
