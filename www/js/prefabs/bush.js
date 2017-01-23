var Run = Run || {};

Run.Bush = function(game, x, y, bushKey) {
    Phaser.Sprite.call(this, game, x, y, bushKey);
    this.anchor.setTo(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
};

Run.Bush.prototype = Object.create(Phaser.Sprite.prototype);
Run.Bush.prototype.constructor = Run.Bush;