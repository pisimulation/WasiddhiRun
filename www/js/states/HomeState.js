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
        //this.background.inputEnabled = true;
        //this.background.events.onInputDown.add(function() {
        //    this.game.state.start('GameState');
        //}, this);
        var enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        enterKey.onDown.add(function() {
            this.game.state.start('GameState');
        }, this);
        this.logo = this.add.sprite(this.game.world.centerX, this.game.world.centerY - 210, 'wingLobPrah', 0);
        this.logo.anchor.setTo(0.5);
        this.logo.scale.x = 0.4;
        this.logo.scale.y = 0.4;
        Run.GameState.animate(this.logo, [0,1], 3, true);
        
        this.yai = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 100, 'yaiLobPrahNoiJa', 0);
        this.yai.anchor.setTo(0.5);
        this.yai.scale.x = 0.4;
        this.yai.scale.y = 0.4;
        Run.GameState.animate(this.yai, [0,1,2,3], 5);
        /*
        this.touch = this.add.sprite(this.game.world.width - 230, this.game.world.height - 50, 'touchToStart')
        this.touch.anchor.setTo(0.5);
        this.touch.scale.x = 0.3;
        this.touch.scale.y = 0.3;
        this.touch.scale.y = 0.3;
        */
        this.game.add.text(30, this.game.world.height - 50, 'ENTER TO START', { font: '30px Arial', fill: '#315', fontWeight: 'bold'});
        //this.game.add.text(30, this.game.world.height - 70, 'tutorial',
                           //{ font: '30px Arial', fill: '#315', fontWeight: 'bold'},
                           //function () {
                                // open in the same window (like clicking a link)
                                //window.location.href = "http://www.google.com";
                                // open in a new window instead (this will likely be blocked by popup blockers though)
                                //window.open("http://www.google.com", "_blank");}, this);
    //});
    
        this.tutorial = this.game.add.button(this.game.world.width - 85, -2, 'tutorial', function() {
            // open in the same window (like clicking a link)
            //window.location.href = "http://www.google.com";
            // open in a new window instead (this will likely be blocked by popup blockers though)
            window.open("https://pisimulation.github.io/WasiddhiRun/www/tutorial.html");}, this);
        this.tutorial.scale.x = 3;
        this.tutorial.scale.y = 3;
        
    
    }
};
