var Run = Run || {}

Run.Monk = function(game, x, y, frame) {
    Phaser.Sprite.call(this, game, x, y, 'monk', 1)
    this.anchor.setTo(0.5)
    this.scale.x = 3;
    this.scale.y = 3;
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    Run.GameState.animate(this, 0, 1, 2)
};

Run.Monk.prototype = Object.create(Phaser.Sprite.prototype);
Run.Monk.prototype.constructor = Run.Monk;