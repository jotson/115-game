var G = {
    game: null,
    width: 800, /* stage width in pixels */
    height: 600, /* stage height in pixels */

    arena: { width: 800, height: 500 },

    sfx: {}, /* sound effects */

    message: null,
    tutorial: {},

    level: 0,
    score: 0,
    fuel: { level: 0, total: 0, goal: 0, graph: [] },
    underAttack: false,

    gameTime: 0,

    levels: [
        { enemies: 0, fuel: 100 },
        { enemies: 1, fuel: 200 },
        { enemies: 2, fuel: 250 },
        { enemies: 3, fuel: 300 },
        { enemies: 4, fuel: 350 },
        { enemies: 5, fuel: 350 },
        { enemies: 6, fuel: 350 },
        { enemies: 7, fuel: 350 },
        { enemies: 8, fuel: 350 },
        { enemies: 9, fuel: 350 },
        { enemies: 10, fuel: 500 },
        { enemies: 11, fuel: 500 },
        { enemies: 12, fuel: 500 },
        { enemies: 13, fuel: 500 },
        { enemies: 14, fuel: 500 },
        { enemies: 15, fuel: 500 }
    ]
};

G.setupStage = function() {
    G.game.stage.backgroundColor = 0x000000;

    var starfield = new Starfield(this.game);
    starfield.alpha = 0.75;

    G.game.world.setBounds(-100, -100, this.game.width + 200, this.game.height + 200);
};

G.addRectangle = function(color) {
    var rect = G.game.add.graphics(0, 0);
    rect.beginFill(color, 1);
    rect.drawRect(0, 0, G.game.width, G.game.height);
    rect.endFill();

    return rect;
};

G.fadeIn = function(length, color, delay) {
    if (delay === undefined) delay = 0;
    if (color === undefined) color = 0x000000;
    if (length === undefined) length = 500;

    var curtain = G.addRectangle(color);
    curtain.alpha = 1;
    G.game.add.tween(curtain).to({ alpha: 0 }, length, Phaser.Easing.Quadratic.In, true, delay);
};

G.fadeOut = function(length, color, delay) {
    if (delay === undefined) delay = 0;
    if (color === undefined) color = 0x000000;
    if (length === undefined) length = 500;

    var curtain = G.addRectangle(color);
    curtain.alpha = 0;
    G.game.add.tween(curtain).to({ alpha: 1 }, length, Phaser.Easing.Quadratic.In, true, delay);
};

G.showTutorial = function(flag, message) {
    if (G.tutorial[flag] === undefined && G.message.getQueueLength() === 0) {
        G.tutorial[flag] = true;
        G.message.add(message);
    }
};

G.shake = function(amount, duration) {
    var frameDuration = 1000/60;
    var repeatCount = Math.ceil(duration/frameDuration);

    var shakeFunc = function() {
        G.game.add.tween(G.game.camera)
            .to({
                x: G.game.rnd.integerInRange(-amount, amount),
                y: G.game.rnd.integerInRange(-amount, amount)
            }, frameDuration, Phaser.Easing.Sinusoidal.InOut, true);
        amount = amount * 0.9;
    };

    var resetCamera = function() {
        G.game.camera.x = 0;
        G.game.camera.y = 0;
    };

    G.game.time.events.repeat(frameDuration, repeatCount, shakeFunc);
    G.game.time.events.add(frameDuration * repeatCount + 100, resetCamera);

    // if self.shake ~= 0 then
    //     if the.view.focus then
    //         the.view.focusOffset = { x = math.random(-self.shake, self.shake), y = math.random(-self.shake, self.shake)}
    //     else
    //         the.view:panTo({ love.graphics.getWidth()/2 + math.random(-self.shake, self.shake), love.graphics.getHeight()/2 + math.random(-self.shake, self.shake)}, 0)
    //     end
    // else
    //     the.view.focusOffset = { x = 0, y = 0 }
    // end

    // var tx = G.game.camera.x + 30;
    // var ty = G.game.camera.y + 30;

    // var tween;
    // tween = G.game.add.tween(G.game.camera)
    //     .to({ x: tx }, 40, Phaser.Easing.Sinusoidal.InOut, false, 0, 3, true)
    //     .start();

    // tween = G.game.add.tween(G.game.camera)
    //     .to({ y: ty }, 80, Phaser.Easing.Sinusoidal.InOut, false, 0, 3, true)
    //     .start();
};

G.drawPolygon = function(ctx, cx, cy, radius, sides) {
    if (sides < 3) return;
    var angle = (Math.PI * 2)/sides;
    ctx.beginPath();
    ctx.moveTo(cx + radius, cy);
    for(var i = 1; i < sides; i++) {
        ctx.lineTo(cx + radius * Math.cos(angle*i), cy + radius * Math.sin(angle*i));
    }
    ctx.closePath();
};

G.generateTextures = function() {
    var ctx;

    // Ship hull
    var ship = this.game.add.bitmapData(24, 24, 'ship', true);
    ctx = ship.context;
    ctx.clearRect(0, 0, ship.width, ship.height);
    ctx.strokeStyle = 'rgb(255, 255, 255)';
    ctx.lineWidth = 2;
    G.drawPolygon(ctx, ship.width/2, ship.height/2, 10, 8);
    ctx.stroke();

    // Asteroids
    var asteroid = this.game.add.bitmapData(64, 64, 'asteroid', true);
    ctx = asteroid.context;
    ctx.strokeStyle = 'rgb(255, 255, 255)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 4;
    G.drawPolygon(ctx, asteroid.width/2, asteroid.height/2, 30, 5);
    ctx.stroke();
    // ctx.fill();

    // Enemy
    var enemy = this.game.add.bitmapData(12, 12, 'enemy', true);
    ctx = enemy.context;
    ctx.strokeStyle = 'rgb(255, 0, 0)';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    G.drawPolygon(ctx, enemy.width/2, enemy.height/2, 5, 3);
    ctx.stroke();
    ctx.fill();

    // Wall highlight
    var highlight = this.game.add.bitmapData(48, 2, 'highlight', true);
    ctx = highlight.context;
    ctx.strokeStyle = 'rgb(100, 200, 255)';
    ctx.lineWidth = 2;
    ctx.moveTo(0, 0);
    ctx.lineTo(48, 0);
    ctx.stroke();

    // Explosion particle
    var debris = this.game.add.bitmapData(2, 2, 'debris', true);
    ctx = debris.context;
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, 2, 2);

    // Exhaust particle
    var exhaust = this.game.add.bitmapData(10, 10, 'exhaust', true);
    ctx = exhaust.context;
    ctx.strokeStyle = 'rgb(255, 255, 255)';
    ctx.lineWidth = 2;
    ctx.arc(5, 5, 4, 0, 2 * Math.PI);
    ctx.stroke();
};

G.highlightBounce = function(object) {
    if (G.wallBounceHighlights === undefined) G.wallBounceHighlights = G.game.add.group();

    var angle = 0;
    var x = object.x;
    var y = object.y;

    if (x < 20) { x = 1; angle = 90; }
    if (x > G.arena.width - 20) { x = G.arena.width - 1; angle = 90; }
    if (y < 20) { y = 1; angle = 0; }
    if (y > G.arena.height - 20) { y = G.arena.height - 1; angle = 0; }

    var highlight = G.wallBounceHighlights.getFirstDead();
    if (highlight === null) {
        highlight = G.game.add.sprite(x, y, G.game.cache.getBitmapData('highlight'));
        highlight.anchor.setTo(0.5, 0.5);
        G.wallBounceHighlights.add(highlight);
    }

    highlight.reset(x, y);
    highlight.revive();
    highlight.scale.setTo(1, 1);
    highlight.alpha = 1;
    highlight.angle = angle;

    var tween = G.game.add.tween(highlight);
    tween.onComplete.add(function() { this.kill(); }, highlight);
    tween.to({ alpha: 0 }, 1000, Phaser.Easing.Sinusoidal.Out, true);

    G.game.add.tween(highlight.scale).to({ x: 0 }, 1000, Phaser.Easing.Cubic.Out, true);
};

G.playMusic = function() {
    G.game.time.events.add(3000, G.playMusic);

    if (G.sfx.music !== undefined && G.sfx.music.isPlaying) return;

    G.sfx.music = G.sfx['song' + G.game.rnd.integerInRange(1,3)];

    G.sfx.music.play();
};

G.addPoints = function(fuel) {
    G.fuel.total += fuel;
    G.fuel.level += fuel;

    if (fuel > 0) {
        var bonus = 100;
        G.bonusx10.on = false;
        if (G.underAttack) {
            bonus = bonus * 10;

            G.bonusx10.x = G.player.x;
            G.bonusx10.y = G.player.y - G.player.radius;
            G.bonusx10.bonusText = "x10";
            G.bonusx10.tint = G.game.rnd.integerInRange(0, 100) * 255 * 255 + 255 + G.game.rnd.integerInRange(0, 100);
            G.bonusx10.on = true;
        }
        G.score += fuel * (G.level+1) * bonus;
    }

    var index = Math.floor(G.gameTime/1000);
    if (G.fuel.graph[index] === undefined) {
        G.fuel.graph[index] = fuel;
    } else {
        G.fuel.graph[index] += fuel;
    }
};

G.addBonus = function(points) {
    points = points * (G.level+1);
    if (G.underAttack) points = points * 10;
    G.score += points;

    G.bonus1k.x = G.player.x;
    G.bonus1k.y = G.player.y - G.player.radius - 10;
    G.bonus1k.bonusText = "+" + points;
    G.bonus1k.tint = 0xff0000;
    G.bonus1k.emitParticle();
};

G.nextLevel = function() {
    G.level++;

    G.fuel.level = 0;

    if (G.levels[G.level] !== undefined) {
        G.fuel.goal = G.levels[G.level].fuel;
    } else {
        G.fuel.goal = 1000;
    }

    G.enemyGroup.add(new Enemy(G.game));

    G.sfx.levelup.play();

    G.message.add("LEVEL " + (G.level+1));
};

G.getFuelPerMinute = function() {
    var min = G.gameTime / 1000 / 60;
    var fpm = this.fuel.total / min;
    if (min === 0) fpm = 0;
    fpm = Math.floor(fpm);
    if (fpm > 999) fpm = 999;

    return fpm;
};

G.drawStatic = function(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, ' + G.game.rnd.realInRange(0.1, 0.2) + ')';
    for (var i = 0; i < w*h/20; i++) {
        ctx.fillRect(x + G.game.rnd.integerInRange(0,w), y + G.game.rnd.integerInRange(0,h), 2, 1);
    }
    ctx.restore();
};

G.drawGauge = function(ctx, x, y, r, max, value) {
    ctx.save();
    var a = value/max * 2 * Math.PI * 0.75 + 0.75 * Math.PI;
    var x1 = Math.cos(a) * r;
    var y1 = Math.sin(a) * r;
    ctx.strokeStyle = 'rgba(255, 255, 255, ' + G.game.rnd.realInRange(0.4, 0.6) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + x1, y + y1);
    ctx.stroke();
    ctx.restore();
};
