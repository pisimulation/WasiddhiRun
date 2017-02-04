var Run = Run || {};



Run.GameState = {
    
    //init game config
    init: function(currentLevel, oldHealth, oldLotus, inBonusLevel, transform, toBonus, backgroundKey, oldTime, monkIndex) {
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
        
        this.INIT_HEALTH = oldHealth ? oldHealth : 0;
        this.INIT_LOTUS = oldLotus ? oldLotus : 0;
        this.TRANSFORM = transform ? transform : 60;
        this.NEXTTRANSFORM = 140;
        
        this.TOBONUS = toBonus ? toBonus : 120;
        this.NEXTBONUS = 120000;
        //this.BONUSLENGTH = 7;
        
        this.MAX_BONUS = 1;
        
        this.CARDFREQ = 25;
        
        //level data
        this.levels = ["normalLevel", "femaleMonkLevel"];
        this.currentLevel = currentLevel ? currentLevel : "normalLevel";
        console.log('current level: ' + this.currentLevel);
        this.cardLevels = ["maghaPujaLevel", "asalhaLevel", "pilgrimageLevel", "takBatThewoLevel", "visakhaLevel"];
        
        this.inBonusLevel = inBonusLevel ? inBonusLevel : false;
        
        this.backgroundKey = backgroundKey ? backgroundKey : 'grass';
        
        this.oldTime = oldTime ? oldTime : 0;
        console.log('oldTime = ' + this.oldTime);
        
        this.oldMonkIndex = monkIndex ? monkIndex : 0;
        if(monkIndex) {
            if(monkIndex >= 3) {
                this.oldMonkIndex = 2;
            }
            else {
                this.oldMonkIndex = monkIndex;
            }
        }
        else {
            this.oldMonkIndex = 0;
        }
        console.log('oldMonkIndex = ' + this.oldMonkIndex);
        this.currentMonkIndex = (this.currentLevel == "normalLevel") ? this.oldMonkIndex : 0;
        console.log('currentMonkIndex = ' + this.currentMonkIndex);
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
        this.game.add.text(10, 20, 'ดอกบัว:', style);
        this.game.add.text(10, 50, 'แต้มบุญ:', style);
        this.lotusNumText = this.game.add.text(80, 20, '', style);
        this.pointText = this.game.add.text(90, 50, '', style);
        this.score = this.game.add.text(this.game.world.centerX, this.game.world.bottom - 40, '', { font: "10pt Courier", fill: "#19cb65", stroke: "#119f4e", strokeThickness: 2 });
        
        //levels
        if(this.cardLevels.indexOf(this.currentLevel)==-1) {
            this.loadLevel();
        }
        else {
            this.loadCardLevel();
            
        }
        this.player.health = this.INIT_HEALTH;
        this.player.lotus = this.INIT_LOTUS;
        
        this.maleTimeout = false;
        
        //counter
        this.dieCounter = 0;
        this.levelCounter = 0;
        this.toBonusLevelCounter = 0;
        this.toMaleCounter = 0;
        this.femaleMonkTimerCounter = 0;
        this.informCounter = 0;
        
        this.randomizeSpace();
        this.game.time.events.loop(10000,  this.randomizeSpace, this);
        
        //timer
        this.startTime = new Date();
        this.totalTime = 120;
        this.timeElapsed = 0;

        this.createStopwatch();

        this.gameStopwatch = this.game.time.events.loop(100, this.updateStopwatch, this);
        
        if(this.timeoutLabel) {
            //if(this.player.gender == "man") {
              //  var duration = 10;
            //} else {
              //  var duration = this.levelData.duration;
            //}
            //var duration = this.player.gender == "man" ? 10 : this.levelData
            this.gameTimer = this.game.time.events.loop(100, this.updateTimer, this, this.levelData.duration);
        }
        
    },
    
    loadLevel: function() {
        this.levelData = JSON.parse(this.game.cache.getText(this.currentLevel));
        
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
        this.game.time.events.loop(Phaser.Timer.SECOND * this.CARDFREQ, this.randomizeCards, this); 
        //this.takBatCardTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.TAKBATFREQ, this.createCard, this, this.takBatCards);
        //this.maghaCardTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.MAGHAFREQ, this.createCard, this, this.maghaCards);
        //this.asalhaCardTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.ASALHAFREQ, this.createCard, this, this.asalhaCards);
        //this.pilgrimageCardTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.PILGRIMAGEFREQ, this.createCard, this, this.pilgrimageCards);
        ////this.visakhaCardTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.VISAKHAFREQ, this.createCard, this, this.visakhaCards);
        if(this.currentLevel == "femaleMonkLevel") {
            this.createTimer(this.levelData.duration);
        }

    },
    
    scheduleNextMonk: function(x, initPosition) {
        console.log('scheduling nextmonk');
        nextMonk = this.levelData.monks[this.currentMonkIndex];
        console.log("currentMonkIndex = " + this.currentMonkIndex);
        if(nextMonk) {
            console.log("nextMonk.time" + nextMonk.time);
            
            var nextTime = 1000 * (nextMonk.time - (this.currentMonkIndex == 0 ? 0 : this.levelData.monks[this.currentMonkIndex - 1].time));
            this.nextMonkTimer = this.game.time.events.add(nextTime, function() {
                this.monkTimer = this.game.time.events.loop(Phaser.Timer.SECOND * nextMonk.frequency, this.createMonk, this, this.levelData.monkType, this.getRandomSpeedY(nextMonk), x, initPosition);
                if((this.currentLevel == "takBatThewoLevel")){
                    this.monkTimer2 = this.game.time.events.loop(Phaser.Timer.SECOND * nextMonk.frequency, this.createMonk, this, this.levelData.monkType, this.getRandomSpeedY(nextMonk), 100, 6);
                }
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
            this.scheduleNextMonk(300, 3);
            //this.currentMonkIndex = 0;
            //this.game.time.events.add(Phaser.Timer.SECOND * 1, this.scheduleNextMonk, this, 100, 6);
            this.createTimer(this.levelData.duration);
        }
        else if(this.currentLevel == "maghaPujaLevel") {
            this.currentMonkIndex = 0;
            this.initMonks();
            this.monkCounter = 0;
            this.scheduleNextMonk(null, 1);
            this.game.add.text(15, 530, "พระภิกษุ", {font: "18px Arial", fill: "#fff"});
            this.monkText = this.game.add.text(50, 550, this.monkCounter, {font: "30px Arial", fill: "#fff"});
        }
        else if(this.currentLevel == "asalhaLevel") {
            this.monkCounter = 0;
            this.currentMonkIndex = 0;
            this.initMonks();
            //this.scheduleNextMonk(null, 1);
            this.monkCounter = 0;
            this.game.add.text(this.world.centerX - 40, 480, "ปัญจวัคคีย์", {font: "18px Arial", fill: "#fff"});
            this.monkText = this.game.add.text(this.world.centerX - 50, 500, "", {font: "30px Arial", fill: "#fff"});
            this.createMonk(this.levelData.monkType, 200, null, 1);
            //this.createMonk(this.levelData.monkType, 100, null, 1);
            //this.monkCounter = 1;
            this.game.time.events.add(Phaser.Timer.SECOND * 1, function() {
                //this.randomizeSpace();
                this.createMonk(this.levelData.monkType, 200, null, 1);
            }, this);
            
            this.game.time.events.add(Phaser.Timer.SECOND * 3, function() {
                //this.randomizeSpace();
                this.createMonk(this.levelData.monkType, 200, null, 1);
            }, this);
            
            this.game.time.events.add(Phaser.Timer.SECOND * 5, function() {
                //this.randomizeSpace();
                this.createMonk(this.levelData.monkType, 200, null, 1);
            }, this);
            
            this.game.time.events.add(Phaser.Timer.SECOND * 6, function() {
                //this.randomizeSpace();
                this.createMonk(this.levelData.monkType, 200, null, 1);
            }, this);
            
            this.createTimer(this.levelData.duration);
            
            
            //bush1
            this.initBush("bush1");
            this.bush1Timer = this.game.time.events.loop(Phaser.Timer.SECOND * this.levelData.bush1Frequency, this.createBush, this, "bush1");

            //bush2
            this.initBush("bush2");
            this.bush2Timer = this.game.time.events.loop(Phaser.Timer.SECOND * this.levelData.bush2Frequency, this.createBush, this, "bush2");
        }
        else if(this.currentLevel == "pilgrimageLevel") {
            this.currentMonkIndex = 0;
            this.initMonks();
            this.scheduleNextMonk(200, 1);
            this.createTimer(this.levelData.duration);
            //temple
            this.initTemple();
            this.templeTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.levelData.templeFrequency, this.createTemple, this);

            //lotus
            this.initLotus();
            this.lotusTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.levelData.lotusFrequency, this.createLotus, this);
        }
        else if(this.currentLevel == "visakhaLevel") {
            console.log('this is visakha');
            //this.temp();
            //this.startTimerAndSwitch(this.levelData.duration, false);
            //temple
            //this.initTemple();
            //continue here timer loop not working
            //this.createTemple();
            //this.visakhaTempleTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.levelData.templeFrequency, this.createTemple, this);

            //lotus
            //this.initLotus();
            //this.createLotus();
            //this.visakhaLotusTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.levelData.lotusFrequency, this.createLotus, this);
        }
    },
    
    getRandomSpeedY: function(nextMonk) {
        var speeds = nextMonk.speedY;
        return speeds[Math.floor(Math.random()*speeds.length)];
    },
     
    update: function() {
        
        if(this.currentLevel == "asalhaLevel") {
            this.randomizeSpace();
        }
        /*
        if(this.currentLevel == "maghaPujaLevel") {
            if(this.monk.body) {
                console.log(this.monk.)
                if(this.monk.body.y > 200) {
                    this.monkCounter++;
                    console.log('!!!!!outOfBounds!!!!!');
                    console.log("monk counter = " + this.monkCounter);
                    this.monkText.setText(this.monkCounter);
                }
            }
            
        }*/
        //CONTINUE!! for each body.y of monk in monks: check if it is outofbound
        
        //level informer
        if(this.informCounter == 0 && !(this.currentLevel == "normalLevel")) {
            /*
            if(this.currentLevel == "normalLevel" &&  this.player.gender == "man") {
                this.clearText();
                this.content = [
                    " ",
                    "ท่านสั่งสมบุญมากพอแล้ว"
                    "ได้เกิดเป็นเพศบริสุทธิ์10วิ",
                    "รีบhigh5พระเก็บบุญเร็ว"
                ];
            }
            else if(this.currentLevel == "normalLevel" && this.player.gender == "woman") {
                var options = [
                    [" ", "ระวังบุญหกบุญหล่นนะยาย"],
                    [" ", "บุญหมดโดนธรณีสูบนะ"],
                    [" ", "ยายหลบพระหน่อยจ้า"],
                    [" ", "เจอดอกบัวรีบเก็บนะยาย"]
                ];
                this.content = options[Math.floor(Math.random()*options.length)];
            }
            */
            if(this.currentLevel == "femaleMonkLevel") {
                this.content = [
                    " ",
                    "ด่านโบนัสภิกษุณี",
                    "high5 เก็บบุญเร็วยาย"
                ]
            }
            else if(this.currentLevel == "maghaPujaLevel") {
                this.content = [
                    " ",
                    "วันมาฆบูชา"
                ]
            }
            else if(this.currentLevel == "asalhaLevel") {
                this.content = [
                    " ",
                    "วันอาสาฬหบูชา"
                ]
            }
            else if(this.currentLevel == "pilgrimageLevel") {
                this.content = [
                    " ",
                    "พระธุดงค์"
                ]
            }
            else if(this.currentLevel == "takBatThewoLevel") {
                this.content = [
                    " ",
                    "วันตักบาตรเทโว"
                ]
            }
            this.addInformer();
        }
        
        this.player.animations.currentAnim.speed = 6    
        
        
        if(this.player.praying) {
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = this.GRASS_SPEED;
            
            this.alert(this.player, 'boon', true);
        }
        else{
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
            this.game.physics.arcade.overlap(this.player, this.takBatCards, this.takBat, null, this);
            this.game.physics.arcade.overlap(this.player, this.maghaCards, this.magha, null, this);
            this.game.physics.arcade.overlap(this.player, this.asalhaCards, this.asalha, null, this);
            this.game.physics.arcade.overlap(this.player, this.pilgrimageCards, this.pilgrimage, null, this);
            this.game.physics.arcade.overlap(this.player, this.visakhaCards, this.visakha, null, this);
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
            //console.log('restarting game');
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
            console.log("this.TRANSFORM  = " + this.TRANSFORM);
            console.log(this.player.gender);
            this.boonEmitter = this.game.add.emitter(this.player.body.x, this.player.body.y, 5);
            this.boonEmitter.makeParticles('boon');
            this.boonEmitter.setScale(5,7,5,7);
            this.boonEmitter.start(false, 5000, 20);
            this.player.tint = 0xff0000;
            this.player.invisible = true;
            this.toMaleCounter++;
            this.game.time.events.add(Phaser.Timer.SECOND * 2,
                                      function() {
                                        this.informCounter = 0;
                                        this.switchPlayerTo("man");
                                        this.boonEmitter.destroy();
                                        this.startTimerAndSwitch(10, true);
                                        //this.createTimer(10);
                                      },
                                      this);
        }
        
        
        //touchable
        switch(this.levelData.monkType) {
            case "maleMonk":
                this.touchable = this.player.gender == "man" ? true : false;
                break;
            case "pilgrimageMonk":
                this.touchable = this.player.gender == "man" ? true : false;
                break;
            case "femaleMonk":
                this.touchable = this.player.gender == "woman" ? true : false;
                break;
            case "panchawakkhi":
                this.touchable = this.player.gender == "womanOnDeer" ? true : false;
                break;
        }
        
        //transition to femaleMonk bonus level
         if(this.timeSurvived > this.TOBONUS && this.toBonusLevelCounter == 0 && !this.inBonusLevel) {
             //this.currentLevel = ;
             //this.loadLevel();
             this.toBonusLevelCounter++;
             console.log(this.toBonusLevelCounter);
             this.game.state.start('GameState', true, false, "femaleMonkLevel", this.player.health, this.player.lotus, true, this.TRANSFORM, this.NEXTBONUS, null, this.timeSurvived, this.currentMonkIndex);
             
             //this.game.state.remove('GameState');
         }
         
         //transition back from femaleMonk bonus level to normalLevel
         if(this.inBonusLevel) {
             this.game.time.events.add(Phaser.Timer.SECOND * this.levelData.duration, function() {
                 this.game.state.start('GameState', true, false, "normalLevel", this.player.health, this.player.lotus, false, this.TRANSFORM, this.TOBONUS, null, this.timeSurvived, this.currentMonkIndex);
             }, this);
         }
        
        //add timer for femaleMonk bonus level
        if(this.currentLevel == "femaleMonkLevel" && this.femaleMonkTimerCounter == 0) {
            this.femaleMonkTimerCounter++;
            this.startTimerAndSwitch(this.levelData.duration, false);
        }
        
        //visakha hell
        if(this.currentLevel == "visakhaLevel" &&
           ((this.player.body.x > 0 && this.player.body.x < 39) ||
            (this.player.body.x > 104 && this.player.body.x < 135) ||
            (this.player.body.x > 230 && this.player.body.x < 265) ||
            (this.player.body.x > 0 && this.player.body.x < 39))) {
            //to hell
           this.player.alive=false;
        }
        
        //time
        if((this.timeElapsed >= this.levelData.duration) || (this.currentLevel == "maghaPujaLevel" && this.monkCounter > 1250)){
            /*
            this.game.time.events.add(Phaser.Timer.SECOND * 3, function() {
                this.game.state.start('GameState', true, false, "normalLevel", this.player.health, this.player.lotus, false, this.TRANSFORM, this.TOBONUS, null, this.timeSurvived, this.oldMonkIndex)
            }, this);
            */
            this.game.state.start('GameState', true, false, "normalLevel", this.player.health, this.player.lotus, false, this.TRANSFORM, this.TOBONUS, null, this.timeSurvived, this.oldMonkIndex)
        }
    },
    
    updateLine: function() {

        //console.log('updateLine is called');
        //console.log('this.line.length' + this.line.length);
        //console.log('this.index' + this.index);
        //console.log('this.content[this.index].length' + this.content[this.index].length);
        if (this.line.length < this.content[this.index].length)
        {
            this.line = this.content[this.index].substr(0, this.line.length + 1);
            // text.text = line;
            this.text.setText(this.line);
        }
        else
        {
            //  Wait 2 seconds then start a new line
            this.lineTimer = this.game.time.events.add(Phaser.Timer.SECOND * 2, this.nextLine, this);
        }

    },

    nextLine: function() {
        //console.log('nextLine is called');
        this.index++;

        if (this.index < this.content.length)
        {
            this.line = '';
            this.game.time.events.repeat(80, this.content[this.index].length + 1, this.updateLine, this);
        }
        else {
            this.bubble.destroy();
            this.text.destroy();
            //this.animate(this.levelInformer, [2,1,0],5,false);
            this.levelInformer.destroy();
        }

    },
    
    clearText: function() {
        this.bubble.destroy();
        this.text.destroy();
        //this.animate(this.levelInformer, [2,1,0],5,false);
        this.levelInformer.destroy();
        //this.lineTimer.destroy();
    },
    
    addInformer: function() {
        this.index = 0;
        this.line = '';
        this.levelInformer = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'levelInformer', 0);
        this.levelInformer.anchor.setTo(0.5);
        this.levelInformer.scale.x = 0.4;
        this.levelInformer.scale.y = 0.4;
        this.animate(this.levelInformer, [0,1,2], 5, false);
        this.informCounter++;

        //bubble
        this.bubble = this.add.sprite(this.game.world.centerX + 25, this.game.world.centerY - 130, 'bubble');
        this.bubble.anchor.setTo(0.5);
        this.bubble.scale.x = 1;
        this.bubble.scale.y = 0.4;
        this.bubble.alpha = 0.5;

        //text
        this.text = this.game.add.text(this.game.world.centerX - 100, this.game.world.centerY - 140, '', { font: "16pt Courier", fill: "#000000", stroke: "#119f4e", strokeThickness: 2 });

        this.nextLine();
    },
    
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
        this.timer.destroy();
    },
    
    switchPlayerTo: function(gender) {
        if(gender == "woman") {
            this.stopTimer();
        }
        this.player.tint = 0xff0000;
        this.player.invisible = true;
        this.game.time.events.add(Phaser.Timer.SECOND * 2, function() {
            var x = this.player.body.x;
            var y = this.player.body.y;
            this.player.destroy();
            this.addPlayer(gender, x + 30, y + 30, this.player.health, this.player.lotus); 
        }, this);
         
    },
    
    animate: function(sprite, movingArray, speed, repeat) {
        sprite.animations.add('move', movingArray);
        sprite.animations.play('move', speed, repeat);
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
            case "womanOnDeer":
                this.stand = 1;
                this.walk1 = 0;
                this.walk2 = 1;
                this.walk3 = 2;
                break;
        }
        if(gender == "womanOnDeer") {
            this.player = this.add.sprite(x, y, 'womanOnDeer', this.stand);    
        }
        else {
            this.player = this.add.sprite(x, y, 'player', this.stand);    
        }
        this.player.anchor.setTo(0.5);
        this.player.scale.x = 1.5;
        this.player.scale.y = 1.5;
        this.player.gender = gender;
        this.game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;
        this.animate(this.player, [this.walk1, this.walk2, this.walk3], 6, true);
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
        console.log('creating monk at x = ' + x);
        var initX;
        if(this.currentLevel == "takBatThewoLevel" || 
           this.currentLevel == "pilgrimageLevel"){
            initX = x;
        }
        else {
            //console.log('leftedge = ' + this.leftEdge);
            //console.log('rightedge = ' + this.rightEdge);
            var left = this.game.rnd.between(10, this.leftEdge);
            var right = this.game.rnd.between(this.rightEdge, this.game.world.width);
            initX = this.game.rnd.between(left, right);
            //console.log('random between ' + left + ' and ' + right);
            //console.log('initX = ' + initX);
        }
        if(!this.player.alive) {
            return;
        }
        
        //var monk = this.monks.getFirstExists(false);
        this.monk = this.monks.getFirstExists(false);
        
        if(!this.monk) {
            this.monk = new Run.Monk(this.game, initX, 0, monkType, initPosition);
            this.monks.add(this.monk);
        }
        else {
            this.monk.reset(initX, 0);
        }
        //console.log("this.monk.body.y" + this.monk.body.y);
        this.monk.body.setSize(13, 26, 10, 1);
        this.monk.life = true;
        this.monk.body.velocity.y = monkSpeedY;
        if(this.currentLevel == "maghaPujaLevel") {// && !monk.onOutOfBounds) {
            this.monkCounter++;
            console.log("monk counter = " + this.monkCounter);
            this.monkText.setText(this.monkCounter);
            //if(this.monkCounter = 10) {
                //console.log("all monks done");
                //return;
            //}
        }
        
        if(this.currentLevel == "asalhaLevel") {
            var puns = ["โกณฑัญญะ", "วัปปะ", "ภัททิยะ", "มหานามะ", "อัสสชิ"];
            this.currentPun = puns[this.monkCounter];
            console.log("current pun: " + puns[this.monkCounter]);
            this.monkText.setText(puns[this.monkCounter]);
            this.monkCounter++;
            console.log("monk counter = " + this.monkCounter);
            //if(this.monkCounter == 5) {
                //console.log("all monks done");
                //return;
            //}
        }
        
    },
    
    initTemple: function() {
        this.temples = this.add.group();
        this.temples.enableBody = true;
    },
    
    createTemple: function() {
        var temple = this.temples.getFirstExists(false);
        var x1;
        var x2;
        if(this.currentLevel == "visakhaLevel") {
            x1 = 296;
            x2 = 360;
        }
        else {
            x1 = 0;
            x2 = this.game.world.width;
        }
        
        if(!temple) {
            temple = new Run.Temple(this.game, this.game.rnd.between(x1,x2), 0);
            this.temples.add(temple);
        }
        else {
            temple.reset(this.game.rnd.between(x1,x2), 0);
            
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
        var x1;
        var x2;
        if(this.currentLevel == "visakhaLevel") {
            console.log("creating lotus for visakha");
            x1 = 296;
            x2 = 360;
        }
        else {
            //console.log('not visakha');
            x1 = 0;
            x2 = this.game.world.width;
        }
        if(!lotus) {
            lotus = new Run.Lotus(this.game, this.game.rnd.between(x1,x2), 0);
            this.lotuses.add(lotus);
        }
        else {
            lotus.reset(this.game.rnd.between(x1,x2), 0);
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
    
    initBush: function(bushKey) {
        if(bushKey == "bush1") {
            this.bushes1 = this.add.group();
            this.bushes1.enableBody = true;
        }
        else if(bushKey =="bush2") {
            this.bushes2 = this.add.group();
            this.bushes2.enableBody = true;
        }
        
    },
    
    createBush: function(bushKey) {
        var bushes;
        if(bushKey == "bush1") {
            bushes = this.bushes1;
        }
        else if(bushKey == "bush2") {
            bushes = this.bushes2;
        }
        
        var bush = bushes.getFirstExists(false);
        var x1 = 0;
        var x2 = this.game.world.width;
        
        if(!bush) {
            bush = new Run.Bush(this.game, this.game.rnd.between(x1,x2), 0, bushKey);
            bushes.add(bush);
        }
        else {
            bush.reset(this.game.rnd.between(x1,x2), 0);
            
        }
        
        //temple.life = true;
        bush.body.velocity.y = this.GRASS_SPEED;
    },
    
    createCard: function(cardGroup) {
        var card = cardGroup.getFirstExists(false);
        
        if(!card) {
            card = new Run.Card(this.game, this.game.rnd.between(0,this.game.world.width), 0);
            cardGroup.add(card);
        }
        else {
            card.reset(this.game.rnd.between(0,this.game.world.width), 0);
        }
        card.body.setSize(19, 9, 5, 6);
        card.body.velocity.y = this.GRASS_SPEED;        
    },
    
    damageOrHeal: function(player, monk) {
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
        this.dyingPlayer = this.add.sprite(player.body.x + 40,
                                           player.body.y + 40,
                                           'dyingPlayer',
                                           1);
        this.dyingPlayer.anchor.setTo(0.5);
        this.dyingPlayer.scale.x = 1.5;
        this.dyingPlayer.scale.y = 1.5;
        this.animate(this.dyingPlayer, [0,1,2,3,4,5,6,7,8], 7, false);
        
    },
    
    takBat: function() {
        console.log('takBat is called');
        this.player.invisible = true;
        this.game.paused = true;
        this.addScroll("วันตักบาตรเทโว\nภิกษุสงฆ์มาประชุมกัน\nโดยมิได้นัดหมาย", "หลบพระบิณฑบาต");
        this.game.state.start('GameState', true, false, "takBatThewoLevel", this.player.health, this.player.lotus, true, this.TRANSFORM, this.TOBONUS, 'carpet', this.timeSurvived, this.currentMonkIndex);
        
    },
    
    magha: function() {
        
        this.player.invisible = true;
        this.game.paused = true;
        this.addScroll("วันมาฆบูชา\nภิกษุสงฆ์มาประชุมกัน\nโดยมิได้นัดหมาย", "หลบพระให้ครบ 1,250 รูป");
        this.game.state.start('GameState', true, false, "maghaPujaLevel", this.player.health, this.player.lotus, true, this.TRANSFORM, this.TOBONUS, null, this.timeSurvived, this.currentMonkIndex);
    },
    
    asalha: function() {
        console.log('asalha is called');
        this.player.invisible = true;
        this.game.paused = true;
        this.addScroll("วันอาสาฬหบูชา\nพระพุทธเจ้าทรงแสดง\nธัมมจักกัปปวัตตนสูตร", "ขี่กวาง high5 ปัญจวัคคีย์\nทั้งห้าผู้มาฟังปฐมเทศนา");
        this.game.state.start('GameState', true, false, "asalhaLevel", this.player.health, this.player.lotus, true, this.TRANSFORM, this.TOBONUS, null, this.timeSurvived, this.currentMonkIndex);
    },
    
    visakha: function() {
        this.game.time.events.add(Phaser.Timer.SECOND * 3,
                                  function() {
            this.game.state.start('GameState', true, false, "visakhaLevel", this.player.health, this.player.lotus, true, this.TRANSFORM, this.TOBONUS, "bridges", this.timeSurvived, this.currentMonkIndex);
        }, this);
        
    },
    
    pilgrimage: function() {
        this.player.invisible = true;
        this.game.paused = true;
        this.addScroll("พระธุดงค์", "ยายหลบพระธุดงค์หน่อยจ้า");
        console.log('pilgrimage is called');
        this.game.state.start('GameState', true, false, "pilgrimageLevel", this.player.health, this.player.lotus, true, this.TRANSFORM, this.TOBONUS, null, this.timeSurvived, this.currentMonkIndex);
    },
    
    randomizeCards: function() {
        var cardGroup;
        var cards = ["takBat", "magha", "asalha", "pilgrimage"];
        var selected = cards[Math.floor(Math.random()*cards.length)];
        switch(selected) {
            case "takBat":
                cardGroup = this.takBatCards;
                break;
            case "magha":
                cardGroup = this.maghaCards;
                break;
            case "asalha":
                cardGroup = this.asalhaCards;
                break;
            case "pilgrimage":
                cardGroup = this.pilgrimageCards;
                break;
        }
        
        this.createCard(cardGroup);
    },
    
    randomizeSpace: function() {
        this.leftEdge = this.game.rnd.between(10,this.game.world.width - 200);
        this.rightEdge = this.leftEdge + 200;
    },
    
    addScroll: function(head, mission) {
        if(this.game.paused) {
            this.scroll = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'scroll');
            this.scroll.scale.x = 0.5;
            this.scroll.scale.y = 0.7;
            this.scroll.anchor.setTo(0.5);
            this.game.add.text(70, 120, "ท่านหยิบการ์ด", { font: '24px Arial', fill: '#fff' });
            this.game.add.text(45, 160, head, { font: '30px Arial', fill: '#000' });
            this.game.add.text(80, 300, "ภารกิจ", { font: '24px Arial', fill: '#fff' });
            this.game.add.text(45, 340, mission, { font: '30px Arial', fill: '#000' });
            this.goLabel = this.game.add.text(this.game.world.centerX - 20, this.game.world.centerY + 130, 'พร้อมแล้วเริ่มเลย', { font: '24px Arial', fill: '#fff' });
            
            var enterKey = this. game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            enterKey.onDown.add(this.unpause, this);
        }
                
    },
    
    unpause: function() {
        console.log('click');
        this.scroll.destroy();
        this.game.paused = false;
    },
    
    createStopwatch: function(){
        console.log('creating timer');
        var initTime = "";
        this.game.add.text(275, 530, "Time survived", {font: "18px Arial", fill: "#fff"}); 
        this.timeLabel = 
        this.game.add.text(350, 550, initTime, {font: "30px Arial", fill: "#fff"}); 
        this.timeLabel.anchor.setTo(0.5, 0);
        this.timeLabel.align = 'center';

    },
    
    updateStopwatch: function(){

        console.log("updating stopwatch")
        var currentTime = new Date();
        var timeDifference = this.startTime.getTime() - currentTime.getTime();

        //Time elapsed in seconds
        this.timeElapsed = Math.abs(timeDifference / 1000);

        //Time remaining in seconds
        
        this.timeSurvived = this.timeElapsed + this.oldTime;
        

        //Convert seconds into minutes and seconds
        var minutes = Math.floor(this.timeSurvived / 60);
        var seconds = Math.floor(this.timeSurvived) - (60 * minutes);

        //Display minutes, add a 0 to the start if less than 10
        var result = (minutes < 10) ? "0" + minutes : minutes; 

        //Display seconds, add a 0 to the start if less than 10
        result += (seconds < 10) ? ":0" + seconds : ":" + seconds; 

        this.timeLabel.text = result;
 
    },
    
    createTimer: function(totalTime){
        console.log('creating timer');
        this.game.add.text(15, 530, "Time remaining", {font: "18px Arial", fill: "#fff"}); 
        this.timeoutLabel = 
        this.game.add.text(50, 550, totalTime, {font: "30px Arial", fill: "#fff"}); 
        this.timeoutLabel.anchor.setTo(0.5, 0);
        this.timeoutLabel.align = 'center';

    },
    
    updateTimer: function(totalTime){

        var currentTime = new Date();
        var timeDifference = this.startTime.getTime() - currentTime.getTime();

        //Time elapsed in seconds
        this.timeElapsed = Math.abs(timeDifference / 1000);

        //Time remaining in seconds
        
        this.timeRemaining = totalTime - this.timeElapsed;
        

        //Convert seconds into minutes and seconds
        var minutes = Math.floor(this.timeRemaining / 60);
        var seconds = Math.floor(this.timeRemaining) - (60 * minutes);

        //Display minutes, add a 0 to the start if less than 10
        var result = (minutes < 10) ? "0" + minutes : minutes; 

        //Display seconds, add a 0 to the start if less than 10
        result += (seconds < 10) ? ":0" + seconds : ":" + seconds; 

        this.timeoutLabel.text = result;
 
    },
    gameOver: function() {
        this.game.paused = true;
        this.gameover = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'gameover');
        this.gameover.scale.x = 0.4;
        this.gameover.scale.y = 0.4;
        this.gameover.anchor.setTo(0.5);
        
        
        this.game.add.text(this.game.world.centerX - 120, this.game.world.centerY + 190, 'ENTER to restart', { font: '30px Arial', fill: '#007', fontWeight: 'bold'});
        
        //this.game.add.text(this.game.world.centerX - 100, this.game.world.centerY - 100, "ท่านโดนธรณีสูบ", { font: '45px Arial', fill: '#fff' });
        //this.game.add.text(this.game.world.centerX - 20, this.game.world.centerY - 50, "อายุขัย " + this.timeSurvived, { font: '30px Arial', fill: '#fff' });
        
        
        //this.content = [
        //        " ",
        //        "ท่านโดนธรณีสูบ",
        //        "อายุขัย " + this.timeSurvived
        //    ];
        //this.addInformer();    
        var enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        enterKey.onDown.add(function() {
            location.reload();
            
        }, this);
        
    },
    /*
    gameFinished: function() {
        this.game.paused = true;
        this.game.restart();
    }
    */
};

/*
        float var = time,
        for a stage with 70 seconds
        "frequency": 2.5-sqrt(time/10)
        "speedY": [110+(var*0.75),130+(var*1),150+(var*1.5)]
        */


