var Run = Run || {};

Run.GameState = {
    
    //init game config
    init: function() {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.PLAYER_SPEED = 350;
        this.GRASS_SPEED = 170;
        this.MONK_SPEED = 200;
    },
    
    //load assets
    preload: function() {
        this.load.image('grass', 'assets/images/grass.png');
        this.load.spritesheet('player', 'assets/images/girl.png', 32, 32, 84);
        this.load.spritesheet('monk', 'assets/images/monk.png', 32, 32);
        this.load.image('hurt', 'assets/images/hurt.png');
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
        this.player.health = 10;
        
        //monk
        this.initMonks();
        this.monkTimer = this.game.time.events.loop(Phaser.Timer.SECOND * 1.5, this.createMonk, this);
        
    },
    
    update: function() {
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        
        if(this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            console.log('LEFT');
            this.player.body.velocity.x -= this.PLAYER_SPEED;
        }
        else if(this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            console.log('RIGHT');
            this.player.body.velocity.x += this.PLAYER_SPEED;
        }
        else if(this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            console.log('UP');
            this.player.body.velocity.y -= this.PLAYER_SPEED;
        }
        else if(this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            console.log('DOWN');
            this.player.body.velocity.y += this.PLAYER_SPEED;
        }
        
        
        //collision
        this.game.physics.arcade.overlap(this.player, this.monks, this.damagePlayer, null, this);
        
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
            monk = new Run.Monk(this.game, this.game.rnd.between(0,this.game.world.width), 0);
            this.monks.add(monk);
        }
        else {
            monk.reset(this.game.rnd.between(0,this.game.world.width), 0);
        }
        
        monk.body.velocity.y = this.MONK_SPEED;
    },
    
    damagePlayer: function(player, monks) {
        console.log('damage!');
        console.log(player.health);
        player.damage(0.005);
        this.ouch(player);
    },
    
    ouch: function(player) {
        console.log('ouch!');
        this.hurt = this.add.sprite(player.x, player.top, 'hurt');
        this.hurt.scale.x = 3;
        this.hurt.scale.y = 3;
        this.hurt.lifespan = 1.5;
    }
};
