var Run = Run || {};

Run.PreloadState = {
    //load assets
    preload: function() {
        this.load.spritesheet('wingLobPrah', 'assets/images/wingLobPrah2.png', 899, 358, 2);
        this.load.spritesheet('yaiLobPrahNoiJa', 'assets/images/yaiLobPrahNoiJa.png', 960, 1280, 4);
        this.load.image('touchToStart', 'assets/images/touchToStart.png');
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
        this.load.text('takBatThewoLevel', 'assets/data/takBatThewoLevel.json');
        this.load.text('maghaPujaLevel', 'assets/data/maghaPujaLevel.json');
        this.load.text('asalhaLevel', 'assets/data/asalhaLevel.json');
        this.load.text('pilgrimageLevel', 'assets/data/pilgrimageLevel.json');
        this.load.text('visakhaLevel', 'assets/data/visakhaLevel.json');
        
        this.load.image('door', 'assets/images/door0.png');
        this.load.spritesheet('card', 'assets/images/card.png', 32, 32, 3);
        this.load.image('carpet', 'assets/images/carpet.png');
        
        this.load.spritesheet('panchawakkhi', 'assets/images/panchawakkhi.png', 32, 32 ,3);
        this.load.spritesheet('pilgrimageMonk', 'assets/images/pilgrimageMonk.png', 32, 32 ,3);
        this.load.spritesheet('womanOnDeer', 'assets/images/womanOnDeer.png', 46, 54 ,3);
        
        this.load.image('bridges', 'assets/images/bridges.png');
        
        this.load.spritesheet('levelInformer', 'assets/images/hey.png', 960, 1280, 3);
        this.load.image('bubble', 'assets/images/bubble.png');
        this.load.image('scroll', 'assets/images/scroll.png')
        
        this.load.image('bush1', 'assets/images/bush1.png');
        this.load.image('bush2', 'assets/images/bush2.png');
        
        this.load.image('tutorial', 'assets/images/tutorial.png');
        
    },
    
    create: function() {
        this.game.state.start('HomeState');
    }
};

        
        