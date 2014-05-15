TextParticle = function (game, x, y) {
    Phaser.Particle.call(this, game, x, y);

    this.textSprite = this.game.add.text(0, 0, '', { font: '16px "jupiter"', fill: '#ffffff' });
    this.addChild(this.textSprite);
};

TextParticle.prototype = Object.create(Phaser.Particle.prototype);
TextParticle.prototype.constructor = TextParticle;

TextParticle.prototype.onEmit = function() {
    this.textSprite.setText(this.parent.bonusText);
    this.textSprite.tint = this.parent.tint;

    this.x -= this.getBounds().width/2;
};