var Run = Run || {};

Run.Bush2 = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'bush2');
    this.anchor.setTo(0.5);
    this.scale.x = 3.5;
    this.scale.y = 3.5;
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
};

Run.Bush2.prototype = Object.create(Phaser.Sprite.prototype);
Run.Bush2.prototype.constructor = Run.Bush2;