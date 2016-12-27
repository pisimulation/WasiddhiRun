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
        this.load.image('temple', 'assets/images/temple.png');
        this.load.image('lotus', 'assets/images/lotus.png');
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
        this.player.lotus = 0;
        
        //monk
        //this.initMonks();
        //this.monkTimer = this.game.time.events.loop(Phaser.Timer.SECOND * 1.5, this.createMonk, this);
        
        //temple
        this.initTemple();
        this.templeTimer = this.game.time.events.loop(Phaser.Timer.SECOND * 2, this.createTemple, this);
        
        //lotus
        this.initLotus();
        this.lotusTimer = this.game.time.events.loop(Phaser.Timer.SECOND * 2, this.createLotus, this);
        
        //stats
        var style = {font: '20px Arial', fill: '#fff'}
        this.game.add.text(10, 20, 'Lotus:', style)
        this.game.add.text(10, 50, 'Boon Points:', style)
        this.lotusNumText = this.game.add.text(80, 20, '', style);
        this.pointText = this.game.add.text(130, 50, '', style)
        
    },
    
    update: function() {
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        
        if(this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            this.player.body.velocity.x -= this.PLAYER_SPEED;
        }
        else if(this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            this.player.body.velocity.x += this.PLAYER_SPEED;
        }
        else if(this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            this.player.body.velocity.y -= this.PLAYER_SPEED;
        }
        else if(this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            this.player.body.velocity.y += this.PLAYER_SPEED;
        }
        
        
        //collision
        this.game.physics.arcade.overlap(this.player, this.monks, this.damagePlayer, null, this);
        this.game.physics.arcade.overlap(this.player, this.lotuses, this.collectLotus, null, this);
        this.game.physics.arcade.overlap(this.player, this.temples, this.pray, null, this);
      
        //stats
        this.refreshStats();
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
    
    initTemple: function() {
        this.temples = this.add.group();
        this.temples.enableBody = true;
    },
    
    createTemple: function() {
        var temple = this.temples.getFirstExists(false);
        
        if(!temple) {
            temple = new Run.Temple(this.game, this.game.rnd.between(0,this.game.world.width), 0);
            this.temples.add(temple);
        }
        else {
            temple.reset(this.game.rnd.between(0,this.game.world.width), 0);
        }
        
        temple.body.velocity.y = this.GRASS_SPEED;
        
    },
    
    initLotus: function() {
        console.log('initLotus is called');
        this.lotuses = this.add.group();
        this.lotuses.enableBody = true;
    },
    
    createLotus: function() {
        //console.log('createLotus is called');
        var lotus = this.lotuses.getFirstExists(false);
        
        if(!lotus) {
            lotus = new Run.Lotus(this.game, this.game.rnd.between(0,this.game.world.width), 0);
            this.lotuses.add(lotus);
        }
        else {
            lotus.reset(this.game.rnd.between(0,this.game.world.width), 0);
        }
        
        lotus.body.velocity.y = this.GRASS_SPEED;
    },
    
    damagePlayer: function(player, monk) {
        //console.log('damage!');
        //console.log(player.health);
        player.damage(0.005);
        this.ouch(player);
    },
    
    ouch: function(player) {
        //console.log('ouch!');
        this.hurt = this.add.sprite(player.x, player.top, 'hurt');
        this.hurt.scale.x = 3;
        this.hurt.scale.y = 3;
        this.hurt.lifespan = 1.5;
    },
    
    collectLotus: function(player, lotus) {
        player.lotus += 1;
        console.log('collected lotus. current lotuses:');
        console.log(player.lotus);
        lotus.kill();
    },
    
    pray: function(player, temple) {
        console.log('touch temple!!')
        if(player.lotus > 0) {
            console.log('pray with lotus. current lotuses:');
            console.log(player.lotus);
            player.lotus -= 1;
        }
    },
    
    refreshStats: function() {
        this.lotusNumText.text = this.player.lotus;
        this.pointText.text = this.player.health;
        
    }
};
