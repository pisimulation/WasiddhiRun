var Run = Run || {};

Run.HomeState = {
    //init: function() {
        
    //},
    
    create: function() {
        //grass
        this.background = this.add.tileSprite(0,
                                              0,
                                              this.game.world.width,
                                              this.game.world.height,
                                              'grass');
        this.background.inputEnabled = true;
        this.background.events.onInputDown.add(function() {
            this.game.state.start('GameState');
        }, this);
        this.logo = this.add.sprite(this.game.world.centerX, this.game.world.centerY - 350, 'wingLobPrah');
        this.logo.anchor.setTo(0.5);
        this.logo.scale.x = 0.6;
        this.logo.scale.y = 0.6;
        this.yai = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 150, 'yaiLobPrahNoiJa');
        this.yai.anchor.setTo(0.5);
        this.yai.scale.x = 0.7;
        this.yai.scale.y = 0.7;
        
        this.game.add.text(30, this.game.world.height - 50, 'TOUCH TO START');
    }
};