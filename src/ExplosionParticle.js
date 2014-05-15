ExplosionParticle = function (game, x, y) {
    Phaser.Particle.call(this, game, x, y, game.cache.getBitmapData('debris'));
};

ExplosionParticle.prototype = Object.create(Phaser.Particle.prototype);
ExplosionParticle.prototype.constructor = ExplosionParticle;

ExplosionParticle.prototype.onEmit = function() {
    this.body.velocity.x += G.player.body.velocity.x;
    this.body.velocity.y += G.player.body.velocity.y;
};