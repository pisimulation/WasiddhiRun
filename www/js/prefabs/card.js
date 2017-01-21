var Run = Run || {};

Run.Card = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'card');
    this.anchor.setTo(0.5);
    //this.scale.x = 0.125;
    //this.scale.y = 0.125;
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    Run.GameState.animate(this, [0,1,2], 5, true);
};

Run.Card.prototype = Object.create(Phaser.Sprite.prototype);
Run.Card.prototype.constructor = Run.Card;