var Run = Run || {};

Run.Temple = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'temple');
    this.anchor.setTo(0.5);
    this.scale.x = 3.5;
    this.scale.y = 3.5;
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
};

Run.Temple.prototype = Object.create(Phaser.Sprite.prototype);
Run.Temple.prototype.constructor = Run.Temple;