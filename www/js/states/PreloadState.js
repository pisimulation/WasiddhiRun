var Run = Run || {};

Run.PreloadState = {
    //load assets
    preload: function() {
        this.load.image('wingLobPrah', 'assets/images/wingLobPrah.png');
        this.load.image('yaiLobPrahNoiJa', 'assets/images/yaiLobPrahNoiJa.png')
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
        this.game.state.start('HomeState');
    }
};

        
        