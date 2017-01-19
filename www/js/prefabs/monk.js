var Run = Run || {};

Run.Monk = function(game, x, y, key, initPosition) {
    Phaser.Sprite.call(this, game, x, y, key, initPosition);
    this.anchor.setTo(0.5);
    this.scale.x = 1.5;
    this.scale.y = 1.5;
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    if(initPosition == 1) {
        Run.GameState.animate(this, [0, 1, 2], 6, true);
    }
};

Run.Monk.prototype = Object.create(Phaser.Sprite.prototype);
Run.Monk.prototype.constructor = Run.Monk;