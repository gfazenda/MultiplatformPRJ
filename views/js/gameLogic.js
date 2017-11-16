//PHASER
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaserG', { preload: preload, create: create, update: update });
var platforms;
var player;
var cursors;
// var stars;
var score = 0;
var scoreText;
var enemies;
var direction = "left";
var gameOverText;
var ParticleEditorPlugin = require('@koreez/phaser-particle-editor-plugin');
var numberLifes;
var lifeCounter;
var invencible;
var fireButton;
var emitter;
var socket;

var dataBase;
var players = [];


// var socket = io.connect();
// socket.connect();
// var socket = io.connect();

var loaded = false;
var config = {
		apiKey: "AIzaSyBVVQnrtmt9D9arsU0xTrNB7s9pHeX6tac",
		authDomain: "teste-firebase-23985.firebaseapp.com",
		databaseURL: "https://teste-firebase-23985.firebaseio.com",
		projectId: "teste-firebase-23985",
		storageBucket: "teste-firebase-23985.appspot.com",
		messagingSenderId: "493837150254"
    };
firebase.initializeApp(config);


function criaP1(){
	console.log("pass");
	var dataBase = firebase.database();
	var personagemRef = dataBase.ref('/modeloPersonagem');

	personagemRef.push({
		class: "warrior",
		level:0,
		power: 10,
		hp: 20,
		hpMax:20,
		mp: 10,
		name: "vaitomarnocopo",
		sprite: "https://img00.deviantart.net/3afa/i/2011/007/b/f/final_fantasy___fighter_hd_by_wahaadnan-d36kddl.png",
		xp: 0,
		userId: 123456789
		// nome: charName,

	})
	.then(function(){

	})
	.catch(function(error){
		console.log(error);	
	})

}


        // console.log("SPRITE64: " + spritePlayer);
        


// var magic = JSON.load('partyMagic.json');
// var magic = JSON.add("partyMagic.json");

// function loadThings(onDone){
//     socket.on('64toPhaser', function (sprite64) {
            
//             game.load.image('player1', sprite64);
            
//             console.log("LOADED: " + loaded);
//             console.log("SPRITE64: " + sprite64);
//             console.log("RECEBENDO DO SERVIDOR");  
//             onDone = true;
// });
// }

function getCharacter(uid){
		console.log('blabla ' + players.length)
		console.log(uid)
		for(var i=0;i<players.length;i++){
			if(players[i].uid == uid){
				return players[i].character;
			}
		}
		return null;
}


function playerInfo(uid,obj){
	this.uid = uid;
	this.character = obj;

}

function getThings(uid) { 
		var personagemRef = dataBase.ref('/personagem');
		personagemRef.once('value', function(snapshot){
			snapshot.forEach(function(obj) {
				if(uid === obj.val().userId){//id do unuario igual ao id do usuario que esta no personagem
					console.log('sending char found')
					var existingCharacter = getCharacter(uid);
					if(existingCharacter == null){
					var newPlayer = new playerInfo(uid,obj.val());
					players.push(newPlayer);
					console.log('size ' + players.length);
                        if(players[0].character.class == "mage"){
                            game.load.image('player1', '/assets/blackMage.png');
                            game.load.image('player2', '/assets/warrior.png');
                            loaded = true;
                            console.log('dsaddasd');
                        } else{
                            game.load.image('player1', '/assets/warrior.png');
                            game.load.image('player2', '/assets/blackMage.png');
                            console.log('11111111');
                        }

						// getNewEnemy();
                        LoadSprites();
				    }
				}
			});
		})
		// if(players.length == 2){
		// 	console.log('send monster')
		// 	getNewEnemy();
		// }
}
    console.log("USER: " + firebase.auth().currentUser.uid);

 function checkIfLoggedIn(){
console.log('starting maaan2232321222');
		firebase.auth().onAuthStateChanged(function(user){
			if(user){//logado
                console.log(firebase.auth().currentUser.uid);
				console.log("página jogo: user logged in222");
                dataBase = firebase.database();
               // getThings(firebase.auth().currentUser.uid);
			}else{//nao logado

				console.log("página jogo: não logado");
			}
			
		})

	}

	 function Initialize() {
		console.log('starting maaan222');
		checkIfLoggedIn();
	    players = [];
	}
      
function preload() {
    
    // game.time.events.add(Phaser.Timer.SECOND * 4, fadePicture, this);
    // socket = io('http://localhost:8080');
    
    // socket.emit("PhasertoServer");
    // var urlImg = {{player1URL}};
    // game.load.image('image-url',  urlImg);
   // criaP1();
   //Initialize();


    // file.data.src = file.url;
    // file.data.crossOrigin = this.crossOrigin;
    // file.data.src = this.baseURL + file.url;
    
    
    // while(spritePlayer == null){
    
    //     game.load.image('player1', spritePlayer);
    // }
    // var dataURI = {{player1URL}};
    // game.load.image('player1', '/assets/blackMage.png');
    // game.load.image('player2', '/assets/blackMage.png');
    Initialize();

    game.load.image('sky', '/assets/background.jpg');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('enemy', 'assets/baddie.png', 32, 32);
    // game.load.json('magic', 'partyMagic.json'); //PARTICLE EDITOR
    game.load.image('magicA', 'assets/magicSprite.png');
    game.load.image('life', 'assets/characterLife.png');
    
    //game.load.image('player1', '/assets/blackMage.png');
   // game.load.image('player2', '/assets/warrior.png');
    // game.load.particleEffect('party', 'partyMagic.json');
    // game.load.particleEffect('partyMagic.json');
}
var player1;
var player2;
function LoadSprites(){
    player1 = game.add.sprite(400, 300, 'player1');
    player1.scale.x = 0.2;
    player1.scale.y = 0.2;

    player2 = game.add.sprite(600, 300, 'player2');
    player2.scale.x = 0.2;
    player2.scale.y = 0.2;
}

function create() {
   
    
    // game.add.sprite(0, 0, 'star');
    
    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //ADD SPRITE 64
    // socket.on('podeCriarImagem64', function () {
        
    //     game.add.sprite(400, 300, 'player1');
                
    //     console.log("IMAGEM CRIADA");
        
                
    // });
   

    
    
    // game.add.sprite(0, 0, 'image-url');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');

    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');

    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');
    
    //  We need to enable physics on the player
    game.physics.arcade.enable(player);


    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    cursors = game.input.keyboard.createCursorKeys();

    // stars = game.add.group();

    // stars.enableBody = true;

    // for(var i=0; i<12; i++)
    // {
    //     var star = stars.create(i * 70, 0, 'star');

    //     star.body.gravity.y = 50;

    //     star.body.bounce.y = 0.7 + Math.random() * 0.2;
    // }

     //life
     lifeCounter = game.add.group();
     lifeCounter.scale.setTo(1.5, 1.5);
     numberLifes = 3;
     // lifeSprite = game.add.sprite(16, 20, 'life');
     // lifeSprite.setScale(200,200);

     for(var i=0; i<numberLifes; i++)
     {
         var lifeSprite = lifeCounter.create((i * 20) + 11, 50, 'life');  
        
     }

    scoreText = game.add.text(16, 16, 'Score: 0', {fontSize: '32px', fill: '#000'});


    //enemy
    
    enemies = game.add.group();
    
    enemies.enableBody = true;

    // game.physics.arcade.enable(enemies);

    for(var i = 0; i<2; i++)
    {
        var enemy = enemies.create(100 + (i * 200), 40, 'enemy');

        enemy.body.gravity.y = 300;
        enemy.body.collideWorldBounds = true; 
        enemy.animations.add('left', [0, 1], 10, true);
        enemy.animations.add('right', [2, 3], 10, true);       
    }

    // game.plugins.add(ParticleEditorPlugin);

    // var phaserJSON = game.cache.getJSON('magic');
    // dude = game.make.particleEffect(10, 10, phaserJSON);
    // dude.emitParticle();

    emitter = game.add.emitter(game.world.centerX, 400, 400);

    emitter.makeParticles('magicA');

    emitter.setRotation(0, 90);
    emitter.setAlpha(0.7, 1, 3000);
    emitter.setScale(0.1, 2, 0.1, 2, 6000, Phaser.Easing.Quintic.Out);
    emitter.gravity = 0;

    emitter.start(false, 500, 100);    
    emitter.on = false;

   invencible = false;

   fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    
    

}

function update() {
    // dude.flow();
    if(!loaded){
    getThings(firebase.auth().currentUser.uid);
  
    }

    // console.log("WIDHT: " + game.scale.width);
    // console.log("HEIGHT: " + game.scale.height);
    
    //  Collide the player and the stars with the platforms
    var hitPlatform = game.physics.arcade.collide(player, platforms);

    // game.physics.arcade.collide(stars, platforms);

    game.physics.arcade.collide(enemies, platforms);

    // game.physics.arcade.overlap(player, stars, collectStar, null, this);

    game.physics.arcade.overlap(player, enemies, playerDeath, null, this);
    

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    // enemies.body.velocity.x = 50;


    if(fireButton.isDown){
        console.log("SPACEBAR PRESSED!");
        socket.emit("SPACEBAR");
    }
    if(cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');

    }
    else if(cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }

    //  Allow the player to jump if they are touching the ground.
    if(cursors.up.isDown && player.body.touching.down && hitPlatform)
    {
        player.body.velocity.y = -350;
    }

    enemyBehaviour();

}

function placeLifeCounter(){

    for(var i = 0; i<life; i++){


    }
}

// function collectStar(player, star){

//     // Removes the star from the screen
//     emitter.on = true;
    
//     // emitter.x = player.x;
//     // emitter.y = player.y;

//     emitter.emitX = player.position.x;
//     emitter.emitY = player.position.y;

    
//     star.kill();
//     // Add and update the score
//     score += 10;
//     scoreText.text = 'Score: ' + score;

//     game.time.events.add(Phaser.Timer.SECOND * 2, killEmitter, this).autoDestroy = true;
// }

function killEmitter(){

    emitter.on = false;
}

function enemyBehaviour(){
    
    enemies.forEachAlive(function(enemy){

        if(enemy.body.touching.down){

            if(enemy.body.blocked.right)
            {
                direction = "left";                
                
                
            }
            else if(enemy.body.blocked.left)
            {
                direction = "right";                
                
                
            }

            if(direction == "left")
            {
                enemy.body.velocity.x = -50;
                enemy.animations.play('left');
                // console.log("LEFT");
            }
            else if(direction == "right")
            {
                enemy.body.velocity.x = +50;
                enemy.animations.play('right');
                // console.log("RIGHT");
            }

        }

    });
    
    
}

function playerDeath(){

    if(invencible == false)
    {
        invencible = true;
        tween = game.add.tween(player).to( { alpha: 0 }, 250, Phaser.Easing.Linear.None, true, 0, 1000, true);
        console.log("LIFES: "  + numberLifes);
        lifeCounter.getChildAt(numberLifes-1).kill();
        numberLifes --;
        game.time.events.add(Phaser.Timer.SECOND * 2, invencibilityOff, this).autoDestroy = true;
    }
    
    if(numberLifes <= 0)
    {
        gameOverText = game.add.text(game.scale.width/2, game.scale.height/2, 'Game Over', {fontSize: '32px', fill: '#000'});
        gameOverText.anchor.x = Math.round(gameOverText.width * 0.5) / gameOverText.width;
        gameOverText.anchor.y = Math.round(gameOverText.height * 0.5) / gameOverText.height;
        player.kill();
    }
}

function invencibilityOff(){

    invencible = false;
    tween.stop();
    player.alpha = 1;
}



