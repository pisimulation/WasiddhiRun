var Run = Run || {};

Run.GameState = {
    
    //init game config
    init: function() {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.PLAYER_SPEED = 200;
        this.GRASS_SPEED = 200;
        this.MONK_SPEED = 200;
    },
    
    //load assets
    preload: function() {
        this.load.image('grass', 'assets/images/grass.png');
        this.load.spritesheet('player', 'assets/images/girl.png', 32, 32, 84);
        this.load.spritesheet('monk', 'assets/images/monk.png', 32, 32);
    },
    
    create: function() {
        //grass
        this.background = this.add.tileSprite(0,
                                              0,
                                              this.game.world.width,
                                              this.game.world.height,
                                              'grass');
        this.background.autoScroll(0, this.GRASS_SPEED);
        
        //woman
        this.player = this.add.sprite(this.game.world.centerX,
                                      this.game.world.height - 50,
                                      'player',
                                      43);
        this.player.anchor.setTo(0.5);
        this.player.scale.x = 3;
        this.player.scale.y = 3;
        this.game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;
        this.animate(this.player, 42, 43, 44);
        
        //monk
        this.initMonks();
        this.monkTimer = this.game.time.events.loop(Phaser.Timer.SECOND * 1.5, this.createMonk, this);
        
    },
    
    update: function() {
        this.player.body.velocity.x = 0;
        
        if(this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            this.player.body.velocity.x -= this.PLAYER_SPEED;
        }
        else if(this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            this.player.body.velocity.x += this.PLAYER_SPEED;
        }
    },
    
    animate: function(sprite,walk1,walk2,walk3) {
        sprite.animations.add('walk',[walk1,walk2,walk3]);
        sprite.animations.play('walk', 5, true);
    },
    
    initMonks: function() {
        this.monks = this.add.group();
        this.monks.enableBody = true;
    },
    
    createMonk: function() {
        var monk = this.monks.getFirstExists(false);
        
        if(!monk) {
            monk = new Run.Monk(this.game, this.game.world.centerX, 0);
            this.monks.add(monk);
        }
        else {
            monk.reset(this.game.world.centerX, 0);
        }
        
        monk.body.velocity.y = this.MONK_SPEED;
    }
};
