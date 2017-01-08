var Run = Run || {};

Run.game = new Phaser.Game('100%', '100%', Phaser.AUTO);

Run.game.state.add('GameState', Run.GameState);
Run.game.state.start('GameState');

Run.game.state.add('SubGameState', Run.SubGameState);
//Run.subGame = new Phaser.Game('100%', '100%', Phaser.AUTO);
//Run.subGame.state.add('GameState', Run.GameState);