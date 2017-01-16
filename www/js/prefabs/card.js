var Run = Run || {};

Run.Card = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'door');
    this.anchor.setTo(0.5);
    //this.scale.x = 0.125;
    //this.scale.y = 0.125;
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
};

Run.Card.prototype = Object.create(Phaser.Sprite.prototype);
Run.Card.prototype.constructor = Run.Card;