var Run = Run || {};



Run.GameState = {
    
    //init game config
    init: function(currentLevel, oldHealth, oldLotus, inBonusLevel, transform, toBonus, backgroundKey) {
        //use all area
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        
        //init physics
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //constants
        this.PLAYER_SPEED = 350;
        this.GRASS_SPEED = 100;
        this.WOMAN_STAND = 43;
        this.WOMAN_WALK1 = 42;
        this.WOMAN_WALK2 = 43;
        this.WOMAN_WALK3 = 44;
        
        this.MAN_STAND = 37;
        this.MAN_WALK1 = 36;
        this.MAN_WALK2 = 37;
        this.MAN_WALK3 = 38;
        
        this.INIT_HEALTH = oldHealth ? oldHealth : 5;
        this.INIT_LOTUS = oldLotus ? oldLotus : 0;
        this.TRANSFORM = transform ? transform : 7;
        this.NEXTTRANSFORM = 10;
        
        this.TOBONUS = toBonus ? toBonus : 25;
        //this.BONUSLENGTH = 7;
        
        this.MAX_BONUS = 1;
        
        //level data
        this.levels = ["normalLevel", "femaleMonkLevel"];
        this.currentLevel = currentLevel ? currentLevel : "normalLevel";
        console.log('current level: ' + this.currentLevel);
        this.cardLevels = ["maghaPujaLevel", "asalhaLevel", "pilgrimageLevel", "takBatThewoLevel", "visakhaLevel"];
        
        //this.bonusNum = bonusNum ? bonusNum : 0;
        this.inBonusLevel = inBonusLevel ? inBonusLevel : false;
        
        this.backgroundKey = backgroundKey ? backgroundKey : 'grass';
        
        
        
        
    },
    
    create: function() {
        //grass
        this.background = this.add.tileSprite(0,
                                              0,
                                              this.game.world.width,
                                              this.game.world.height,
                                              this.backgroundKey);
        this.background.autoScroll(0, this.GRASS_SPEED);
        
        //stats
        var style = {font: '20px Arial', fill: '#fff'};
        this.game.add.text(10, 20, 'Lotus:', style);
        this.game.add.text(10, 50, 'Boon Points:', style);
        this.lotusNumText = this.game.add.text(80, 20, '', style);
        this.pointText = this.game.add.text(130, 50, '', style);
        
        
        
        
        //levels
        if(this.cardLevels.indexOf(this.currentLevel)==-1) {
        //if(this.cardLevels.includes(this.currentLevel)) {
            this.loadLevel();
        }
        else {
            this.loadCardLevel();
            
        }
        this.player.health = this.INIT_HEALTH;
        this.player.lotus = this.INIT_LOTUS;
        
        this.maleTimeout = false;
        //this.player.health = this.INIT_HEALTH;
        
        //counter
        this.dieCounter = 0;
        this.levelCounter = 0;
        this.toBonusLevelCounter = 0;
        this.toMaleCounter = 0;
        this.femaleMonkTimerCounter = 0;
        
    },
    
    loadLevel: function() {
        this.currentMonkIndex = 0;
        this.levelData = JSON.parse(this.game.cache.getText(this.currentLevel));
        
        /*
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
        */
        
        
        //init level
        
        //player
        this.addPlayer(this.levelData.player, this.game.world.centerX, this.game.world.height - 50);
        
        //temple
        this.initTemple();
        this.templeTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.levelData.templeFrequency, this.createTemple, this);
        
        //lotus
        this.initLotus();
        this.lotusTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.levelData.lotusFrequency, this.createLotus, this);
        
        //monk
        this.initMonks(); this.scheduleNextMonk(null, 1);
        
        //cards
        this.initCards();
        this.takBatCardTimer = this.game.time.events.loop(Phaser.Timer.SECOND * 2, this.createTakBatCard, this);
        


    },
    
    scheduleNextMonk: function(x, initPosition) {
        this.currentMonkIndex = (this.currentLevel == "takBatThewoLevel" ? 0 : this.currentMonkIndex);
        //this.currentMonkIndex = monkIndex ? monkIndex : this.currentMonkIndex;
        console.log("currentMonkIndex: " + this.currentMonkIndex);
        nextMonk = this.levelData.monks[this.currentMonkIndex];
        if(nextMonk) {
            var nextTime = 1000 * (nextMonk.time - (this.currentMonkIndex == 0 ? 0 : this.levelData.monks[this.currentMonkIndex - 1].time));
            this.nextMonkTimer = this.game.time.events.add(nextTime, function() {
                this.monkTimer = this.game.time.events.loop(Phaser.Timer.SECOND * nextMonk.frequency, this.createMonk, this, this.levelData.monkType, this.getRandomSpeedY(nextMonk), x, initPosition);
                this.currentMonkIndex++;
                this.scheduleNextMonk(x, initPosition);
                
            }, this);
        }
    },
    
    loadCardLevel: function() {
        //level data
        this.levelData = JSON.parse(this.game.cache.getText(this.currentLevel));
        //player
        this.addPlayer(this.levelData.player, this.game.world.centerX, this.game.world.height - 50);
        if(this.currentLevel == "takBatThewoLevel") {
            this.currentMonkIndex = 0;
            this.initMonks();
            this.scheduleNextMonk(300, 5);
            //this.currentMonkIndex = 0;
            this.scheduleNextMonk(100, 8);
            this.startTimerAndSwitch(this.levelData.duration, false);
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
            
            this.alert(this.player, 'boon', true);
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
        if(!this.player.invisible && this.player) {
            this.game.physics.arcade.overlap(this.player, this.monks, this.damageOrHeal, null, this);
            this.game.physics.arcade.overlap(this.player, this.lotuses, this.collectLotus, null, this);
            this.game.physics.arcade.overlap(this.player, this.temples, this.pray, null, this);
            this.game.physics.arcade.overlap(this.player, this.takBatCards, this.takBat, null, this)
        }
        
    
        //stats
        if(this.player) {
            this.refreshStats();
        }
        
        
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
        

        // transition to male player
        if(this.currentLevel == "normalLevel" &&
           this.player.health >= this.TRANSFORM &&
           this.toMaleCounter == 0 &&
           //this.bonusNum < this.MAX_BONUS &&
           this.player.gender == "woman" &&
           !this.inBonusLevel) {
            this.TRANSFORM = this.TRANSFORM + this.NEXTTRANSFORM;
            console.log("this.TRANSFORM  = " + this.TRANSFORM)
            //this.game.paused = true;
            console.log(this.player.gender);
            this.boonEmitter = this.game.add.emitter(this.player.body.x, this.player.body.y, 5);
            this.boonEmitter.makeParticles('boon');
            this.boonEmitter.setScale(5,7,5,7);
            this.boonEmitter.start(false, 5000, 20);
            this.player.tint = 0xff0000;
            this.player.invisible = true;
            //this.game.time.events.add(Phaser.Timer.SECOND * 2, this.flash, this);
            //this.bonusNum++;
            //this.boonEmitter.destroy();
            this.toMaleCounter++;
            this.game.time.events.add(Phaser.Timer.SECOND * 2,
                                      function() {
                                        this.switchPlayerTo("man");
                                        this.boonEmitter.destroy();
                                        this.startTimerAndSwitch(10, true);
                                        //var timer;
                                        //this.timer = this.game.time.create(false);
                                        //  Set a TimerEvent to occur after 2 seconds
                                        //this.timer.loop(10000, this.switchPlayerTo, this, "woman");
                                        //  Start the timer running - this is important!
                                        //  It won't start automatically, allowing you to hook it to button events and the like.
                                        //this.timer.start();
                                        //this.game.debug.text('Remaining Time: ' + timer.duration.toFixed(0), this.game.world.centerX, this.game.world.centerY);
                                      },
                                      this);
            //this.game.time.events.add(Phaser.Timer.SECOND * 10,
              //                       function() {
                //                        this.switchPlayerTo("woman");
                  //                   },
                    //                 this);
        }
        
        //touchable
        switch (this.levelData.monkType) {
            case "maleMonk":
                this.touchable = this.player.gender == "man" ? true : false;
                break;
            case "femaleMonk":
                this.touchable = this.player.gender == "woman" ? true : false;
                break;
        }
        
        //timer
        if(this.timer && this.timer.running) {
            this.game.debug.text('Remaining Time: ' + this.timer.duration.toFixed(0), this.game.world.centerX, this.game.world.centerY);
            this.game.debug.text('Time Survived: ' + this.game.time.totalElapsedSeconds(), this.game.world.centerX, this.game.world.centerY - 20);
        }
        else {
            this.game.debug.text('Time Survived: ' + this.game.time.totalElapsedSeconds(), this.game.world.centerX, this.game.world.centerY);
        }
        
        //transition to femaleMonk bonus level
        if(this.game.time.totalElapsedSeconds() > this.TOBONUS && this.toBonusLevelCounter == 0 && !this.inBonusLevel) {
            //this.currentLevel = ;
            //this.loadLevel();
            this.TOBONUS = this.TOBONUS + 20;
            console.log("NEXT TOBONUS = " + this.TOBONUS);
            this.toBonusLevelCounter = 1;
            var oldHealth = this.player.health;
            var oldLotus = this.player.lotus;
            console.log("oldHealth = " + oldHealth);
            console.log("oldLotus = " + oldLotus);
            this.game.state.start('GameState', true, false, "femaleMonkLevel", this.player.health, this.player.lotus, true, this.TRANSFORM, this.TOBONUS);
            //add timer
            //this.startTimerAndSwitch(this.BONUSLENGTH, false);
            //this.game.state.remove('GameState');
        }
        
        //transition back from femaleMonk bonus level to normalLevel
        if(this.inBonusLevel) {
            //this.toBonusLevelCounter++;
            this.game.time.events.add(Phaser.Timer.SECOND * this.levelData.duration, function() {
                console.log('TIMEOUT');
                //console.log('IN BONUS bonusNum = ' + this.bonusNum);
                this.game.state.start('GameState', true, false, "normalLevel", this.player.health, this.player.lotus, false, this.TRANSFORM, this.TOBONUS);
            }, this);
            
        }
        
        //add timer for femaleMonk bonus level
        if(this.currentLevel == "femaleMonkLevel" && this.femaleMonkTimerCounter == 0) {
            this.femaleMonkTimerCounter++;
            this.startTimerAndSwitch(this.levelData.duration, false);
        }
        
        
    },
    /*
    render: function () {
        // If our timer is running, show the time in a nicely formatted way, else show 'Done!'
        if (this.timer.running) {
            this.game.debug.text('Remaining Time: ' + timer.duration.toFixed(0), this.game.world.centerX,
            //this.game.debug.text(this.formatTime(Math.round((timerEvent.delay - timer.ms) / 1000)), 2, 14, "#ff0");
        }
        else {
            this.game.debug.text("Done!", 2, 14, "#0f0");
        }
    },*/
    
    startTimerAndSwitch: function(amount, doSwitch) {
        this.timer = this.game.time.create(false);
        if(doSwitch) {
            this.timer.loop(amount * 1000, this.switchPlayerTo, this, "woman");
            this.timer.start();
        }
        else {
            this.timer.loop(amount * 1000, this.stopTimer, this);
            this.timer.start();
        }
        
    },
    
    stopTimer: function() {
        //this.timeText.destroy();
        this.timer.destroy();
    },
    
    switchPlayerTo: function(gender) {
        console.log("calling switchPlayerTo");
        console.log("this.player.health = " + this.player.health);
        console.log("this.player.lotus = " + this.player.lotus);
        if(gender == "woman") {
            this.stopTimer();
        }
        var x = this.player.body.x;
        var y = this.player.body.y;
        this.player.destroy();
        this.addPlayer(gender, x + 30, y + 30, this.player.health, this.player.lotus);  
    },
    
    animate: function(sprite, movingArray, speed) {
        sprite.animations.add('move', movingArray);
        sprite.animations.play('move', speed, true);
    },
    
    addPlayer: function(gender, x, y, oldHealth, oldLotus) {
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
        this.player = this.add.sprite(x, y, 'player', this.stand);
        this.player.anchor.setTo(0.5);
        this.player.scale.x = 1.5;
        this.player.scale.y = 1.5;
        this.player.gender = gender;
        this.game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;
        this.animate(this.player, [this.walk1, this.walk2, this.walk3], 6);
        this.player.health = oldHealth ? oldHealth : this.INIT_HEALTH;
        this.player.lotus = oldLotus ? oldLotus : this.INIT_LOTUS;
        this.player.praying = false;
        this.player.alive = true;
        this.player.invisible = false;
        
    },
    
    initMonks: function() {
        this.monks = this.add.group();
        this.monks.enableBody = true;
    },
    
    createMonk: function(monkType, monkSpeedY, x, initPosition) {
        if(!this.player.alive) {
            return;
        }

        var monk = this.monks.getFirstExists(false);
        
        if(!monk) {
            monk = new Run.Monk(this.game, (this.currentLevel == "takBatThewoLevel" ? x : this.game.rnd.between(0,this.game.world.width)), 0, monkType, initPosition);
            this.monks.add(monk);
        }
        else {
            monk.reset((this.currentLevel == "takBatThewoLevel" ? x : this.game.rnd.between(0,this.game.world.width)), 0);
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
    
    initCards: function() {
        this.maghaCards = this.add.group();
        this.maghaCards.enableBody = true;
        this.takBatCards = this.add.group();
        this.takBatCards.enableBody = true;
        this.pilgrimageCards = this.add.group();
        this.pilgrimageCards.enableBody = true;
        this.asalhaCards = this.add.group();
        this.asalhaCards.enableBody = true;
        this.visakhaCards = this.add.group();
        this.visakhaCards.enableBody = true;
    },
    
    createTakBatCard: function() {
        var card = this.takBatCards.getFirstExists(false);
        
        if(!card) {
            card = new Run.Card(this.game, this.game.rnd.between(0,this.game.world.width), 0);
            this.takBatCards.add(card);
        }
        else {
            card.reset(this.game.rnd.between(0,this.game.world.width), 0);
        }
        
        card.body.velocity.y = this.GRASS_SPEED;
    },
    
    damageOrHeal: function(player, monk) {
        //console.log("touchable?: " + this.touchable);
        var alertMsg = this.touchable ? 'boon': 'hurt';
        if(monk.life) {
            this.touchable ? player.heal(1) : player.damage(1);
            this.alert(player, alertMsg, false);
            monk.life = false;
        }
        else {
            this.alert(player, alertMsg, false);
            return;
        }
        if(player.health == 0) {
            player.alive = false;
        }
    },
    
    alert: function(player, key, toTheLeft) {
        var x;
        if(toTheLeft) {
            x = player.x - 40;
        }
        else {
            x = player.x;
        }
        
        this.msg = this.add.sprite(x, player.top, key);
        this.msg.scale.x = 1.5;
        this.msg.scale.y = 1.5;
        this.msg.lifespan = 1.5;
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
        if(player && !this.player.invisible) {
            player.health += 1;
            player.praying = false;
            player.animations.paused = false;    
        }
        
    },
    
    die: function(player) {
        console.log('player dies');
        this.dyingPlayer = this.add.sprite(player.body.x + 50,
                                           player.body.y + 57,
                                           'dyingPlayer',
                                           1);
        this.dyingPlayer.anchor.setTo(0.5);
        this.dyingPlayer.scale.x = 1.5;
        this.dyingPlayer.scale.y = 1.5;
        this.animate(this.dyingPlayer, [0,1,2,3,4,5,6,7,8], 7);
        
    },
    
    takBat: function() {
        console.log('takBat is called');
        this.game.state.start('GameState', true, false, "takBatThewoLevel", this.player.health, this.player.lotus, true, this.TRANSFORM, this.TOBONUS, 'carpet');
        
    },
    
    //flash: function() {
      //  this.game.camera.flash(0xff0000, 10000);
        //this.game.camera.flash(0xff0000, 10000);
        //this.game.camera.flash(0xff0000, 10000);
    //},
    
    gameOver: function() {
        this.game.paused = true;
        //this.player.destroy();
        this.gameover = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'gameover');
        this.gameover.scale.x = 0.5;
        this.gameover.scale.y = 0.5;
        this.gameover.anchor.setTo(0.5);
        
    },
    
    gameFinished: function() {
        this.game.paused = true;
    }
};




