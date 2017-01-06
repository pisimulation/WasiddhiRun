var Run = Run || {};

Run.GameState = {
    
    //init game config
    init: function(currentLevel) {
        //use all area
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        
        //init physics
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //constants
        this.PLAYER_SPEED = 350;
        this.GRASS_SPEED = 170;
        this.MONK_SPEED = 200;
        
        //level data
        //this.numLevels = 3;
        this.levels = ["normal", "femaleMonk", "malePlayer"];
        this.currentLevel = currentLevel ? currentLevel : this.levels[0];
        console.log('current level: ' + this.currentLevel);
    },
    
    //load assets
    preload: function() {
        this.load.image('grass', 'assets/images/grass.png');
        this.load.spritesheet('player', 'assets/images/girl.png', 32, 32, 84);
        this.load.spritesheet('maleMonk', 'assets/images/maleMonk.png', 32, 32);
        this.load.spritesheet('femaleMonk', 'assets/images/femaleMonk.png', 32, 32);
        this.load.image('hurt', 'assets/images/hurt.png');
        this.load.image('temple', 'assets/images/temple.png');
        this.load.image('lotus', 'assets/images/lotus.png');
        this.load.image('boon', 'assets/images/oneboon.png', 32, 32, 3);
        
        //load level data
        this.load.text('normalLevel', 'assets/data/normalLevel.json');
        this.load.text('femaleMonkLevel', 'assets/data/femaleMonkLevel.json');
        this.load.text('malePlayerLevel', 'assets/data/malePlayerLevel.json');
        
    },
    
    create: function() {
        //grass
        this.background = this.add.tileSprite(0,
                                              0,
                                              this.game.world.width,
                                              this.game.world.height,
                                              'grass');
        this.background.autoScroll(0, this.GRASS_SPEED);
        
        //stats
        var style = {font: '20px Arial', fill: '#fff'};
        this.game.add.text(10, 20, 'Lotus:', style);
        this.game.add.text(10, 50, 'Boon Points:', style);
        this.lotusNumText = this.game.add.text(80, 20, '', style);
        this.pointText = this.game.add.text(130, 50, '', style);
        
        //levels
        this.loadLevel();
    },
    
    loadLevel: function() {
        this.currentMonkIndex = 0;
        
        this.levelData = JSON.parse(this.game.cache.getText(this.currentLevel + "Level"));
        console.log(this.levelData);
        
        this.endOfLevelTimer = this.game.time.events.add(this.levelData.duration * 1000, function() {
            var currentLevelIndex = this.levels.indexOf(this.currentLevel);
            console.log('currentLevelIndex: ' + currentLevelIndex);
            if(currentLevelIndex < this.levels.length) {
                console.log('currentLevelIndex++: ' + currentLevelIndex++);
                this.currentLevel = this.levels[currentLevelIndex++];
                console.log(this.currentLevel);
            }
            else {
                //end of game
            }
            
            this.game.state.start('GameState', true, false, this.currentLevel);
        }, this);
        
        //init level
        
        //player
        var stand;
        var walk1;
        var walk2;
        var walk3;
        switch(this.levelData.player) {
            case "woman":
                stand = 43;
                walk1 = 42;
                walk2 = 43;
                walk3 = 44;
                break;
            case "man":
                stand = 37;
                walk1 = 36;
                walk2 = 37;
                walk3 = 38;
                break;         
        }
        this.player = this.add.sprite(this.game.world.centerX,
                                      this.game.world.height - 50,
                                      'player',
                                      stand);
        this.player.anchor.setTo(0.5);
        this.player.scale.x = 3;
        this.player.scale.y = 3;
        this.game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;
        this.animate(this.player, walk1, walk2, walk3);
        this.player.health = 10;
        this.player.lotus = 0;
        this.player.praying = false;
        
        
        //temple
        this.initTemple();
        this.templeTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.levelData.templeFrequency, this.createTemple, this);
        
        //lotus
        this.initLotus();
        this.lotusTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.levelData.lotusFrequency, this.createLotus, this);
        
        
        
        
        //monk
        this.initMonks();
        //this.monkTimer = this.game.time.events.loop(Phaser.Timer.SECOND * 0, this.createMonk, this, monkType);
        //schedule monks
        //this.scheduleNextMonk(this.levelData.monkType, this.levelData.monks[this.currentMonkIndex].speedY);
        this.scheduleNextMonk();
    },
    
    scheduleNextMonk: function() {
        console.log('scheduleNextMonk is called');
        var nextMonk = this.levelData.monks[this.currentMonkIndex];
        
        if(nextMonk) {
            //console.log('there is nextMonk')
            var nextTime = 1000 * (nextMonk.time - (this.currentMonkIndex == 0 ? 0 : this.levelData.monks[this.currentMonkIndex - 1].time));
            console.log('nextTime: ' + nextTime);
            this.nextMonkTimer = this.game.time.events.add(nextTime, function() {
                this.game.time.events.loop(Phaser.Timer.SECOND * nextMonk.frequency, this.createMonk, this, this.levelData.monkType, nextMonk.speedY);
                //this.createMonk(this.levelData.monkType, nextMonk.speedY);
                this.currentMonkIndex++;
                this.scheduleNextMonk();
                
            }, this);
        }
    },
    
    
    update: function() {
        if(this.player.praying) {
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = this.GRASS_SPEED;
            
            this.alert(this.player, 'boon');
        }
        else{
            this.player.animations.play();
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
        console.log('initMonks is called')
        this.monks = this.add.group();
        this.monks.enableBody = true;
    },
    
    createMonk: function(monkType, monkSpeedY) {
        var monk = this.monks.getFirstExists(false);
        
        if(!monk) {
            //console.log('there is no monk. need to create one');
            monk = new Run.Monk(this.game, this.game.rnd.between(0,this.game.world.width), 0, monkType);
            this.monks.add(monk);
        }
        else {
            //console.log('monk exists. just gonna reset position')
            monk.reset(this.game.rnd.between(0,this.game.world.width), 0);
        }
        
        monk.life = true;
        monk.body.velocity.y = monkSpeedY;
        
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
        
        temple.life = true;
        temple.body.velocity.y = this.GRASS_SPEED;
        temple.body.setSize(7, 1, 5, 13);
    },
    
    initLotus: function() {
        this.lotuses = this.add.group();
        this.lotuses.enableBody = true;
    },
    
    createLotus: function() {
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
        if(monk.life) {
            player.damage(1);
            this.alert(player, 'hurt');
            monk.life = false;
        }
        else {
            this.alert(player, 'hurt');
            return;
        }
        
    },
    
    alert: function(player, key) {
        //console.log('ouch!');
        this.hurt = this.add.sprite(player.x, player.top, key);
        this.hurt.scale.x = 3;
        this.hurt.scale.y = 3;
        this.hurt.lifespan = 1.5;
    },
    
    collectLotus: function(player, lotus) {
        player.lotus += 1;
        lotus.kill();
    },
    
    pray: function(player, temple) {
        if(temple.life) {
            if(player.lotus > 0) {
                player.lotus -= 1;
                this.stopToPray(player);
            
            
                this.game.time.events.add(Phaser.Timer.SECOND * 1, this.continueRunning, this, player);
            }
            temple.life = false;
        }
        else {
            return;
        }

    },
    
    refreshStats: function() {
        this.lotusNumText.text = this.player.lotus;
        this.pointText.text = this.player.health;
        
    },
    
    stopToPray: function(player) {
        player.praying = true;
        player.animations.paused = true;
    },
    
    continueRunning: function(player) {
        player.health += 1;
        player.praying = false;
        player.animations.paused = false;
    },
    
};
