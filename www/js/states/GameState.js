var Run = Run || {};



Run.GameState = {
    
    //init game config
    init: function(currentLevel, oldHealth, oldLotus, inBonusLevel, bonusNum) {
        //use all area
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        
        //init physics
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //constants
        this.PLAYER_SPEED = 350;
        this.GRASS_SPEED = 170;
        this.WOMAN_STAND = 43;
        this.WOMAN_WALK1 = 42;
        this.WOMAN_WALK2 = 43;
        this.WOMAN_WALK3 = 44;
        
        this.MAN_STAND = 37;
        this.MAN_WALK1 = 36;
        this.MAN_WALK2 = 37;
        this.MAN_WALK3 = 38;
        
        this.INIT_HEALTH = oldHealth ? oldHealth : 14;
        this.INIT_LOTUS = oldLotus ? oldLotus : 0;
        this.TRANSFORM = 15;
        
        this.MAX_BONUS = 1;
        
        //level data
        this.levels = ["normalLevel", "femaleMonkLevel"];
        this.currentLevel = currentLevel ? currentLevel : "normalLevel";
        console.log('current level: ' + this.currentLevel);
        
        this.bonusNum = bonusNum ? bonusNum : 0;
        this.inBonusLevel = inBonusLevel ? inBonusLevel : false;
        
        if(inBonusLevel) {
            this.game.time.events.add(Phaser.Timer.SECOND * 5, function() {
                console.log('TIMEOUT');
                console.log('IN BONUS bonusNum = ' + this.bonusNum);
                this.game.state.start('GameState', true, false, "normalLevel", this.player.health, this.player.lotus, false, this.bonusNum);
            }, this);
        }
        
        
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
        this.load.spritesheet('dyingPlayer', 'assets/images/dyingPlayer.png', 42, 42, 9);
        this.load.image('gameover', 'assets/images/gameover.png');
        
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
        
        this.maleTimeout = false;
        //this.player.health = this.INIT_HEALTH;
    },
    
    loadLevel: function() {
        this.currentMonkIndex = 0;
        
        this.levelData = JSON.parse(this.game.cache.getText(this.currentLevel));
        
        if(this.bonusNum >= this.MAX_BONUS && !this.inBonusLevel) {
            console.log('CHANGING LEVEL');
            this.endOfLevelTimer = this.game.time.events.add(this.levelData.duration * 1000, function() {
            var currentLevelIndex = this.levels.indexOf(this.currentLevel);
            if(currentLevelIndex < this.levels.length - 1) {
                currentLevelIndex++;
                this.currentLevel = this.levels[currentLevelIndex];
            }
            else {
                console.log('end of game')
            }
            
            this.game.state.start('GameState', true, false, this.currentLevel, this.player.health, this.player.lotus, false, this.bonusNum);
        }, this);
        }
        
        
        //init level
        
        //player
        this.addPlayer(this.levelData.player);
        
        //temple
        this.initTemple();
        this.templeTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.levelData.templeFrequency, this.createTemple, this);
        
        //lotus
        this.initLotus();
        this.lotusTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.levelData.lotusFrequency, this.createLotus, this);
        
        //monk
        this.initMonks();
        this.scheduleNextMonk();
        
        //touchable
        switch (this.levelData.monkType) {
            case "maleMonk":
                this.touchable = this.levelData.player == "man" ? true : false;
                break;
            case "femaleMonk":
                this.touchable = this.levelData.player == "woman" ? true : false;
                break;
        }
        
        //counter
        this.dieCounter = 0;
        this.levelCounter = 0;
    },
    
    scheduleNextMonk: function() {
        nextMonk = this.levelData.monks[this.currentMonkIndex];
        if(nextMonk) {
            var nextTime = 1000 * (nextMonk.time - (this.currentMonkIndex == 0 ? 0 : this.levelData.monks[this.currentMonkIndex - 1].time));
            this.nextMonkTimer = this.game.time.events.add(nextTime, function() {
                this.monkTimer = this.game.time.events.loop(Phaser.Timer.SECOND * nextMonk.frequency, this.createMonk, this, this.levelData.monkType, this.getRandomSpeedY(nextMonk));
                this.currentMonkIndex++;
                this.scheduleNextMonk();
                
            }, this);
        }
    },
    
    getRandomSpeedY: function(nextMonk) {
        var speeds = nextMonk.speedY;
        return speeds[Math.floor(Math.random()*speeds.length)];
    },
    
    update: function() {
        //this.walkFaster = false;
        this.player.animations.currentAnim.speed = 6
        if(this.player.praying) {
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = this.GRASS_SPEED;
            
            this.alert(this.player, 'boon');
        }
        else{
            //this.player.animations.play();
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;
        
            if(this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                this.player.body.velocity.x -= this.PLAYER_SPEED;
            }
            else if(this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                this.player.body.velocity.x += this.PLAYER_SPEED;
            }
            else if(this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                this.player.animations.currentAnim.speed = 20
                this.player.body.velocity.y -= this.PLAYER_SPEED;
                
            }
            else if(this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                this.player.body.velocity.y += this.PLAYER_SPEED;
            }
        }
        
        //collision
        this.game.physics.arcade.overlap(this.player, this.monks, this.damageOrHeal, null, this);
        this.game.physics.arcade.overlap(this.player, this.lotuses, this.collectLotus, null, this);
        this.game.physics.arcade.overlap(this.player, this.temples, this.pray, null, this);
    
        //stats
        this.refreshStats();
        
        //die
        if(!this.player.alive && this.dieCounter == 0) {
            this.background.stopScroll();
            this.temples.forEach(function(temple) {
                temple.body.velocity.y = 0;
            }, this);
            this.monks.forEach(function(monk) {
                monk.body.velocity.y = 0;
                monk.animations.stop();
            }, this);
            this.lotuses.forEach(function(lotus) {
                lotus.body.velocity.y = 0;
            }, this);
            this.game.time.events.remove(this.templeTimer);
            this.game.time.events.remove(this.lotusTimer);
            this.game.time.events.remove(this.monkTimer);
            this.game.time.events.remove(this.nextMonkTimer);
            
            this.die(this.player);
            console.log('restarting game');
            this.dieCounter++;
            this.game.time.events.add(Phaser.Timer.SECOND * 1.2, this.gameOver, this);
        }
        

        if(this.currentLevel == "normalLevel" && this.player.health >= this.TRANSFORM && this.bonusNum < this.MAX_BONUS) {
            this.flash();
            this.bonusNum++;
            console.log('bonusNum now = ' + this.bonusNum);
            this.game.state.start('GameState', true, false, "malePlayerLevel", this.player.health, this.player.lotus, true, this.bonusNum);
        }
        
    },
    
    animate: function(sprite, movingArray, speed) {
        sprite.animations.add('move', movingArray);
        sprite.animations.play('move', speed, true);
    },
    
    addPlayer: function(gender) {
        switch(gender) {
            case "woman":
                this.stand = this.WOMAN_STAND;
                this.walk1 = this.WOMAN_WALK1;
                this.walk2 = this.WOMAN_WALK2;
                this.walk3 = this.WOMAN_WALK3;
                break;
            case "man":
                this.stand = this.MAN_STAND;
                this.walk1 = this.MAN_WALK1;
                this.walk2 = this.MAN_WALK2;
                this.walk3 = this.MAN_WALK3;
                break;         
        }
        this.player = this.add.sprite(this.game.world.centerX,
                                      this.game.world.height - 50,
                                      'player',
                                      this.stand);
        this.player.anchor.setTo(0.5);
        this.player.scale.x = 3;
        this.player.scale.y = 3;
        this.game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;
        this.animate(this.player, [this.walk1, this.walk2, this.walk3], 6);
        this.player.health = this.INIT_HEALTH;
        this.player.lotus = this.INIT_LOTUS;
        this.player.praying = false;
        this.player.alive = true;
        
    },
    
    initMonks: function() {
        this.monks = this.add.group();
        this.monks.enableBody = true;
    },
    
    createMonk: function(monkType, monkSpeedY) {
        if(!this.player.alive) {
            return;
        }

        var monk = this.monks.getFirstExists(false);
        
        if(!monk) {
            monk = new Run.Monk(this.game, this.game.rnd.between(0,this.game.world.width), 0, monkType);
            this.monks.add(monk);
        }
        else {
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
    
    damageOrHeal: function(player, monk) {
        //console.log("touchable?: " + this.touchable);
        var alertMsg = this.touchable ? 'boon': 'hurt';
        if(monk.life) {
            this.touchable ? player.heal(1) : player.damage(1);
            this.alert(player, alertMsg);
            monk.life = false;
        }
        else {
            this.alert(player, alertMsg);
            return;
        }
        if(player.health == 0) {
            player.alive = false;
        }
    },
    
    alert: function(player, key) {
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
    
    die: function(player) {
        console.log('player dies');
        this.dyingPlayer = this.add.sprite(player.body.x + 50,
                                           player.body.y + 57,
                                           'dyingPlayer',
                                           1);
        this.dyingPlayer.anchor.setTo(0.5);
        this.dyingPlayer.scale.x = 3;
        this.dyingPlayer.scale.y = 3;
        this.animate(this.dyingPlayer, [0,1,2,3,4,5,6,7,8], 7);
        
    },
    
    flash: function() {
        this.game.camera.flash(0xff0000, 10000);
        this.game.camera.flash(0xff0000, 10000);
        this.game.camera.flash(0xff0000, 10000);
    },
    
    gameOver: function() {
        this.game.paused = true;
        //this.player.destroy();
        this.gameover = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'gameover');
        this.gameover.anchor.setTo(0.5);
        
    },
    
    gameFinished: function() {
        this.game.paused = true;
    }
};




