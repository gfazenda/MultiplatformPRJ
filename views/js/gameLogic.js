//PHASER
var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'phaserG', { preload: preload, create: create, update: update });
var platforms;
var player;
var cursors;
var score = 0;
var scoreText;
var enemies;
var direction = "left";
var gameOverText;
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

var loadButton;

var buttonGroupMage;
var buttonGroupWarrior;

var criarButton = true;

var enemyURL;
var enemyHP;
var enemyPower;
var noEnemy = true;

var playerID;

var textEnemyHP;

var promiseLoad = new Promise(function(resolve, reject) {
	// do a thing, possibly async, then…
  
	// getThings(firebase.auth().currentUser.uid);
	Initialize();

	if (playerClass != null) {
	  resolve("Stuff worked!");
	}
	else {
	  reject(Error("It broke"));
	}
  });

var x = 550;
var y = 600;

var playerNum = 0;
var PartidaNum = 0;
var socket = io.connect();
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
					
					console.log(contKey);
					console.log(snapshot.val());
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

				}else{
					newMatch(firebase.auth().currentUser.uid);//cadastra players na partida
					
				}
				contKey++;
			});

		}

	})
	
	

}

function newMatch(UID){
	var ID;
	var idEmUso = 0;
	var matchRef = dataBase.ref('/match');
	
		//espera até que retorne o ultimo ID-----------------------------------------------------------\/
	var returnId = new Promise(function returnId(resolve, reject) {
		var matchRef = dataBase.ref('/match');
		matchRef.once("value", function(snapshot) {
			ID = snapshot.numChildren();
			
			snapshot.forEach(function(x) {

				if(UID !== x.val().player1 && UID !== x.val().player2){
					console.log("nao tem o uid no banco");
					idEmUso = 1
				}else{
					idEmUso = 2;
					console.log("uid em partida");
				}
			})
			
			resolve(ID);
		});
		
	});

	returnId.then(function(idPartida) {//retorna o ID
		console.log("ID Success");
		console.log(idPartida);; // Success!
		
		//----------------------------------------------------\/
		matchRef.once('value', function(snapshot){
			snapshot.forEach(function(x) {
				console.log("idEmUso");
				console.log(idEmUso);
				if(x.val().id == idPartida && idEmUso == 1){
					if(x.val().player1 !== x.val().player2){
						if(UID !== x.val().player1 && UID !== x.val().player2){//cadastro novo jogador //p2
							console.log("Diferente");
							firebase.database().ref('/match').push({//cadastra 2° jogador
								id: idPartida,
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
	
	return false;
	
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
						playerReady();
                       
				    }
				}
			});
		})
}

function playerReady(){

	socket.emit("playerReady");
}


function checkIfLoggedIn(){
	firebase.auth().onAuthStateChanged(function(user){
		if(user){//logado
        	dataBase = firebase.database();
		}
		else{//nao logado
			console.log("página jogo: não logado");
		}	
	})
}

function Initialize() {
	// console.log('starting maaan222');
	players = [];		
	checkIfLoggedIn();
}
    
function preload() {


	Initialize();
  
    game.load.image('sky', '/assets/background.jpg');

    game.load.image('mage', 'assets/blackMage.png');
    game.load.image('warrior', 'assets/warrior.png');
	game.load.spritesheet('button', 'assets/button.png', 297, 87);
	
	game.load.image('enemy1', 'assets/enemy1.png');	
	game.load.image('enemy2', 'assets/enemy2.png');	
	game.load.image('enemy3', 'assets/enemy3.png');		
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
	attack(1);
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
    console.log("CLASSE: " + playerClass);
}

function start() {
	
		game.load.image('picture1', 'assets/loading.png');
		
		getThings(firebase.auth().currentUser.uid);
		
		game.load.start();
	
		// button.visible = false;		
		loadButton.visible = false;		
	
	}

function loadStart() {
	// getThings(firebase.auth().currentUser.uid);
	
	// loadText.setText("Loading ...");
	console.log("LOAD START(): " + firebase.auth().currentUser.uid)
	playerID = firebase.auth().currentUser.uid;
	loadText.setText(firebase.auth().currentUser.uid);

	
}
	
//	This callback is sent the following parameters:
function fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {
	
	loadText.setText("File Complete: " + progress + "% - " + totalLoaded + " out of " + totalFiles);
	
	var newImage = game.add.image(x, y, cacheKey);
	
	newImage.scale.set(0.1);
	
	x += newImage.width + 20;
	
	if (x > 700)
	{
		x = 32;
		y += 332;
	}
}
	
function loadComplete() {
	// console.log("LOAD START(): " + firebase.auth().currentUser.uid)
	
	loadText.setText("Load Complete");
}


function create() {

	var sky = game.add.sprite(0, 0, 'sky');
	sky.scale.set(0.68);

	//LOAD STATES
	game.load.onLoadStart.add(loadStart, this);
    game.load.onFileComplete.add(fileComplete, this);
	game.load.onLoadComplete.add(loadComplete, this);

	loadButton = game.add.button(game.world.centerX - 100, 600, 'button', start, this, 2, 1, 0);
	loadText = game.add.text(game.world.centerX, 630, 'Ready!', { fill: '#ffffff' });	
	

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    cursors = game.input.keyboard.createCursorKeys();

}

// var pass = 0;
// function initFunc(){//cha as funçoes
// 	getPlayerNumUpdate();
// 	//criaPartida(2);

// 	matchs(firebase.auth().currentUser.uid);//cadastra players na partida


// 	getThings(firebase.auth().currentUser.uid);
// 	console.log("USER DESS M*: " + firebase.auth().currentUser.uid);
// }

function attack(numberAttack){
	console.log("PLAYERID IS: " + playerID);
	socket.emit('attack',{uid: playerID, 
												nAtaque: numberAttack
											});
	
	enemyTurn = true;
	// if(numberAttack==3 && playerClass == "warrior"){
	// 	socket.emit('dead', firebase.auth().currentUser.uid);
	// 	$scope.waitingTurns = 2;
	// }
}


function update() {

	if(noEnemy == true){
		noEnemy = false;
		socket.on('getEnemy', function (inimigo) {
			
			console.log("got enemy");  
			console.log(inimigo);  
			
			enemyURL = inimigo.sprite;
			enemyHP = inimigo.hp;
			enemyPower = inimigo.power;
			var enemy = game.add.sprite(20, 300, inimigo.name);
			enemy.scale.set(0.5);
			
			textEnemyHP = game.add.text(game.world.centerX - 600, 200, 'HP Enemy: ' + enemyHP, {fontSize: '32px', fill: '#000'});			
		});
	}

	socket.on('enemyDamaged', function (hpMonster) {
		
		enemyHP = hpMonster;
		console.log("ENEMYHP IS: " + enemyHP);
	});

    if(cursors.left.isDown)
    {
  
		player1.x--;
    }
    else if(cursors.right.isDown)
    {
 
		player1.x++;
    }
}

