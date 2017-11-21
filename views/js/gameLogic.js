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

var player1;
var player2;

var dead = false;
var waitingTurns = 0;
var enemyTurn = false;

var attackText;
var defendText;

var playerClass;

// var button;
var buttonGroupMage;
var buttonGroupWarrior;

var criarButton = true;



var playerNum = 0;
var PartidaNum = 0;
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

/*function criaP1(){
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

}*/


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
		//console.log('blabla ' + players.length)
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

function criaPartida(np){//quando um usuario loga o numero aumenta para verificar se é o layer 1 ou 2

	np = np + 1;
	firebase.database().ref('/Partidas').set({
		numPlayerPartida: np
	});
}


//match
function matchs(PUID){
	var ID = 0;
	var UidExist = -2;
	var matchRef = dataBase.ref('/match');
	
	matchRef.once('value', function(snapshot){
		
		if(!snapshot.val()){//se nada cadastrado, cadastra uma partida
			console.log("nao tem partidas cadastradas");
			console.log(snapshot.val());
			firebase.database().ref('/match').push({
				id: ID,
				player1: PUID,
				player2: PUID
			});

		}else{//ja esxite aguma partida com um player nela
			console.log("Tem partidas cadastradas");
			console.log(snapshot.val());
			
			ID++;//conta quantoas partidas já cadastradas
			//console.log("ID ");
			//console.log(ID);
			var contKey = 0;
			snapshot.forEach(function(x) {
				console.log("p1 ");
				console.log(x.val().player1);
				console.log("p2 ");
				console.log(x.val().player2);
				
				console.log("key"+contKey);
				
				if(x.val().player1 === x.val().player2){//cadastro novo jogador //p2
					//console.log(PUID);
					//console.log(snapshot.val().player1);
					//console.log(snapshot.val().player2);
					var idPlayer1 = x.val().player1;
					
					console.log(Object.keys(snapshot.val())[contKey]);
					
					firebase.database().ref('/match/'+Object.keys(snapshot.val())[contKey]).set(null);//remove o cadastro para cadastrar um atualizado com outra key				
																//se só usar o "set" ele remove a key e se usar o update ele mantem 
																//os dados e cadastra a mais, pois nao se tem a key
					
					var newKey = firebase.database().ref('/match').push().key;//cria uma nova key

					firebase.database().ref('/match/' + Object.keys(snapshot.val())[contKey]).set({//cadastra 2° jogador
						id: contKey+1,
						player1: idPlayer1,
						player2: PUID
					});
				
					console.log("Iguais");

				}
				contKey++;
			});

		}

	})
	
	

}

function newMatch(UID){
	var ID;
	var matchRef = dataBase.ref('/match');
	
		//espera até que retorne o ultimo ID-----------------------------------------------------------\/
	var returnId = new Promise(function returnId(resolve, reject) {
		var matchRef = dataBase.ref('/match');
		matchRef.on("value", function(snapshot) {
			ID = snapshot.numChildren();
			resolve(ID);
		});
		
	});

	returnId.then(function(idPartida) {//retorna o ID
		console.log("ID Success");
		console.log(idPartida);; // Success!
		
		//----------------------------------------------------\/
		matchRef.once('value', function(snapshot){
			snapshot.forEach(function(x) {

				if(UID !== x.val().player1 && UID !== x.val().player1){
					console.log("nao tem o uid no banco");
				}else{
					console.log("uid em partida");
				}
				if(x.val().id == idPartida){
					if(x.val().player1 !== x.val().player2){
						if(UID !== x.val().player1 && UID !== x.val().player1){//cadastro novo jogador //p2
							console.log("Diferente");
							firebase.database().ref('/match').push({//cadastra 2° jogador
								id: idPartida+1,
								player1: UID,
								player2: UID
							});
						}
					}
				}
			});
		});
		//----------------------------------------------------------/\
		
		
	}, function(reason) {//falha em retornar o id
		console.log("ID Error");
		console.log(reason); // Error!
	});

	//------------------------------------------------------------------------------------------------------/\

	
	//-------------------------------------------------------------
	
	// var matchRef = dataBase.ref('/match');

	// matchRef.once('value', function(snapshot){
		// if(!snapshot.val()){//verifica se existe alguma partida
			// if (snapshot.val().player1 !== snapshot.val().player2 && snapshot.val().id == ID-1){//se os 2 ids forem diferentes esta tudo certo com a partida 
																						// //e pega o ultimo cadastro do banco id-1 para ver se esta certo e 
																						// //cria uma nova partida
				
				// console.log("pass new match");
				// firebase.database().ref('/match').push({//cadastra new match
					// id: ID,
					// player1: PUID,
					// player2: PUID
				// });					
			// }
		// }
	// });

}

function getPlayerNumUpdate() { 
	var playerNumUpdateRef = dataBase.ref('/Partidas');
	playerNumUpdateRef.once('value', function(snapshot){
		snapshot.forEach(function(x) {
			//console.log(x.A.B)//x.A.B acessar o nivel B ou 2° do firebase???
			playerNum = x.A.B;
			//console.log('playerNum: ' + playerNum);
			criaPartida(playerNum);
			
		});
	})
}

function getPlayerNumUpdate() { 
	var playerNumUpdateRef = dataBase.ref('/Partidas');
	playerNumUpdateRef.once('value', function(snapshot){
		snapshot.forEach(function(x) {
			//console.log(x.A.B)//x.A.B acessar o nivel B ou 2° do firebase???
			playerNum = x.A.B;
			//console.log('playerNum: ' + playerNum);
			criaPartida(playerNum);
			
		});
	})
}

function getThings(uid) { 

		var personagemRef = dataBase.ref('/personagem');
		personagemRef.once('value', function(snapshot){
			snapshot.forEach(function(obj) {
				if(uid === obj.val().userId){//id do unuario igual ao id do usuario que esta no personagem
					//console.log('sending char found')
					var existingCharacter = getCharacter(uid);
					if(existingCharacter == null){
					var newPlayer = new playerInfo(uid,obj.val());
					players.push(newPlayer);
						console.log('playerNum: ' + playerNum);

						if(playerNum % 2 == 0){
							console.log('1° playerNum');
						}else{
							console.log('2° playerNum');
						}
						
                        if(players[0].character.class == "mage"){
	
                            playerClass = "mage";
                            buttonGroupMage = game.add.group();

                            buttonGroupWarrior = game.add.group();

   
                            createButtons();
                            // console.log("CLASSE AAAAA: " + playerClass);
							LoadSpritesMage(playerNum % 2);
                            console.log("pMage: "+ players[0].character.class);
                        } else{

                            playerClass = "warrior";
                            buttonGroupMage = game.add.group();

                            buttonGroupWarrior = game.add.group();

   
                            createButtons();
                            // console.log("CLASSE AAAAA: " + playerClass);
							LoadSpritesWarrior(playerNum % 2);
                            console.log("pWarrior: "+ players[0].character.class);
							
                        }

						// getNewEnemy();
                       
				    }
				}
			});
		})
		// if(players.length == 2){
		// 	console.log('send monster')
		// 	getNewEnemy();
		// }
}
    //console.log("USER: " + firebase.auth().currentUser.uid);

 function checkIfLoggedIn(){
//console.log('starting maaan2232321222');
		firebase.auth().onAuthStateChanged(function(user){
			if(user){//logado
                //console.log(firebase.auth().currentUser.uid);
				//console.log("página jogo: user logged in222");
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

    //getPlayerNumUpdate();
	
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
    
    game.load.image('mage', 'assets/blackMage.png');
    game.load.image('warrior', 'assets/warrior.png');
    game.load.spritesheet('button', 'assets/button.png', 297, 87);

	
    // game.load.particleEffect('party', 'partyMagic.json');
    // game.load.particleEffect('partyMagic.json');

}


function LoadSpritesWarrior(p1p2){
	if(p1p2 == 0){
		player1 = game.add.sprite(400, 300, 'warrior');
		player1.scale.setTo(0.1, 0.1);
		
		player2 = game.add.sprite(600, 300, 'mage');
		player2.scale.setTo(0.25, 0.25);
	}else{
		player2 = game.add.sprite(400, 300, 'warrior');
		player2.scale.setTo(0.1, 0.1);
		
		player1 = game.add.sprite(600, 300, 'mage');
		player1.scale.setTo(0.25, 0.25);
		
	}
}

function LoadSpritesMage(p1p2){
    if(p1p2 == 0){
		player1 = game.add.sprite(400, 300, 'mage');
		player1.scale.setTo(0.25, 0.25);

		player2 = game.add.sprite(600, 300, 'warrior');
		player2.scale.setTo(0.1, 0.1);
	}else{
		player1 = game.add.sprite(400, 300, 'warrior');
		player1.scale.setTo(0.1, 0.1);
		
		player2 = game.add.sprite(600, 300, 'mage');
		player2.scale.setTo(0.25, 0.25);
		
	}
}

function turns(){
    socket.on('playersTurn', function () {
		if(dead)
			return;
		
		if(waitingTurns > 0){
			waitingTurns--;
			socket.emit('passTurn');
			return;
		}
		enemyTurn = false;
		
	});
}


function actionOnClick (text) {

    console.log("CLIQUEI Attack");



}

function actionOnClick2 (text) {


    console.log("CLIQUEI Defend!");


}

function actionOnClick3 (text) {


    console.log("CLIQUEI Fury!");


}

function actionOnClick4 (text) {

    console.log("CLIQUEI Attract!");



}

function createButtons(){
    console.log("yeeeeeeees");

    if(playerClass == "mage"){


        var buttonAttack = game.make.button(game.world.centerX - 400, 400, 'button', actionOnClick, this, 2, 1, 0);
        var buttonDefend = game.make.button(game.world.centerX - 10, 400, 'button', actionOnClick2, this, 2, 1, 0);

        buttonGroupMage.add(buttonAttack);
        buttonGroupMage.add(buttonDefend);

        attackText = game.add.text(game.world.centerX - 400, 400, 'Attack', {fontSize: '32px', fill: '#000'});
        defendText = game.add.text(game.world.centerX - 10, 400, 'Defend', {fontSize: '32px', fill: '#000'});
    }

    else {
        

        var buttonFury = game.make.button(game.world.centerX - 400, 400, 'button', actionOnClick3, this, 2, 1, 0);
        var buttonAttract = game.make.button(game.world.centerX - 10, 400, 'button', actionOnClick4, this, 2, 1, 0);

        buttonGroupWarrior.add(buttonFury);
        buttonGroupWarrior.add(buttonAttract);

        furyText = game.add.text(game.world.centerX - 400, 400, 'Fury', {fontSize: '32px', fill: '#000'});
        attractText = game.add.text(game.world.centerX - 10, 400, 'Attract', {fontSize: '32px', fill: '#000'});

    }
    console.log("CLASSE TNC: " + playerClass);
}


function create() {

    

    // game.add.sprite(0, 0, 'star');

    
    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

   

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

var pass = 0;
function initFunc(){//cha as funçoes
	getPlayerNumUpdate();
	//criaPartida(2);

	matchs(firebase.auth().currentUser.uid);//cadastra players na partida
	newMatch(firebase.auth().currentUser.uid);//cadastra players na partida

	getThings(firebase.auth().currentUser.uid);
	console.log("USER DESS M*: " + firebase.auth().currentUser.uid);
}


function update() {
	if(firebase.auth().currentUser.uid && pass != 2){
		pass = 1;
	}
	
	if(pass == 1){//faz passar pelas funçoes somente quando o pass for 1
		initFunc();
		pass = 2;
	}
	
    // dude.flow();
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
		player1.x--;
        player.animations.play('left');

    }
    else if(cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;
		player1.x++;
		
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



