ExhaustParticle = function (game, x, y) {
    Phaser.Particle.call(this, game, x, y, game.cache.getBitmapData('exhaust'));
};

ExhaustParticle.prototype = Object.create(Phaser.Particle.prototype);
ExhaustParticle.prototype.constructor = ExhaustParticle;

ExhaustParticle.prototype.onEmit = function() {
    var a = Math.max(Math.abs(G.player.body.acceleration.x), Math.abs(G.player.body.acceleration.y));
    this.x = G.player.x - G.player.radius * G.player.body.acceleration.x/a;
    this.y = G.player.y - G.player.radius * G.player.body.acceleration.y/a;
    this.body.velocity.x = -G.player.body.acceleration.x*1.5 + G.player.body.velocity.x + this.game.rnd.integerInRange(-G.player.THRUST/10, G.player.THRUST/10);
    this.body.velocity.y = -G.player.body.acceleration.y*1.5 + G.player.body.velocity.y + this.game.rnd.integerInRange(-G.player.THRUST/10, G.player.THRUST/10);
};