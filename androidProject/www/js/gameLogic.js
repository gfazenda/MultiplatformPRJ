//PHASER
var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'phaserG', { preload: preload, create: create, update: update });
var player;
var enemies;

var dataBase;
var players = [];

var player1;
var player2;

var dead = false;
var waitingTurns = 0;
var enemyTurn = false;
var monsterCanAttack = false;

var attackMageText;
var cureText;
var blessedLuckText;
var fireballText;
var cureMageText;
var cureWarriorText;
var cancelText;

var attackWarriorText;
var attractText;				
var furyText;

var player1HPText;
var player2HPText;

var playerClass;

var loadButton;
var renderNumber = 0;
var buttonGroupMage;
var buttonGroupMage2;
var buttonGroupWarrior;

var criarButton = true;

var enemyURL;
var enemyHP;
var enemyPower;
var noEnemy = true;

var playerID;

var textEnemyHP;

var myCharacter;
var player1URL;
var player1HP;

var partnerCharacter;			
var player2URL;
var player2HP;

var classMage = false;

var currentMonster;

var promiseLoad = new Promise(function(resolve, reject) {
	// do a thing, possibly async, then…
  
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
//var socket = io.connect();
const socket = io.connect('http://multiplataforma-gb-gabrielfazenda.c9users.io/');
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

// $scope.getMyCharacter = function() {
// 		console.log('getting char');
// 		socket.emit('getCharacter', firebase.auth().currentUser.uid);
		
// }
        
// function getCharacter(uid){
// 		//console.log('blabla ' + players.length)
// 		console.log(uid)
// 		for(var i=0;i<players.length;i++){
// 			if(players[i].uid == uid){
// 				return players[i].character;
// 			}
// 		}
// 		return null;
// }

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

// function getThings(uid) { 

// 		// var personagemRef = dataBase.ref('/personagem');
// 		personagemRef.once('value', function(snapshot){
// 			snapshot.forEach(function(obj) {
// 				if(uid === obj.val().userId){//id do unuario igual ao id do usuario que esta no personagem
// 					//console.log('sending char found')
// 					var existingCharacter = getCharacter(uid);
// 					if(existingCharacter == null){
// 					var newPlayer = new playerInfo(uid,obj.val());
// 					players.push(newPlayer);
// 						console.log('playerNum: ' + playerNum);

// 						if(playerNum % 2 == 0){
// 							console.log('1° playerNum');
// 						}else{
// 							console.log('2° playerNum');
// 						}
						
//                         if(players[0].character.class == "mage"){
	
//                             playerClass = "mage";
//                             buttonGroupMage = game.add.group();
// 							buttonGroupMage2 = game.add.group();

//                             // buttonGroupWarrior = game.add.group();

   
//                             createButtons();
//                             // console.log("CLASSE AAAAA: " + playerClass);
// 							LoadSpritesMage(playerNum % 2);
//                             console.log("pMage: "+ players[0].character.class);
//                         } else{

//                             playerClass = "warrior";
//                             // buttonGroupMage = game.add.group();

//                             buttonGroupWarrior = game.add.group();

   
//                             createButtons();
//                             // console.log("CLASSE AAAAA: " + playerClass);
// 							LoadSpritesWarrior(playerNum % 2);
//                             console.log("pWarrior: "+ players[0].character.class);
							
//                         }

// 						// getNewEnemy();
// 						playerReady();
                       
// 				    }
// 				}
// 			});
// 		})
// }

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
	// players = [];		
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
		player1 = game.add.sprite(500, 600, 'warrior');
		player1.scale.setTo(0.1, 0.1);
		
		player2 = game.add.sprite(700, 600, 'mage');
		player2.scale.setTo(0.25, 0.25);
	}else{
		player2 = game.add.sprite(500, 600, 'warrior');
		player2.scale.setTo(0.1, 0.1);
		
		player1 = game.add.sprite(700, 600, 'mage');
		player1.scale.setTo(0.25, 0.25);
		
	}
}

function LoadSpritesMage(p1p2){
    if(p1p2 == 0){
		player1 = game.add.sprite(500, 600, 'mage');
		player1.scale.setTo(0.25, 0.25);

		player2 = game.add.sprite(700, 600, 'warrior');
		player2.scale.setTo(0.1, 0.1);
	}else{
		player1 = game.add.sprite(500, 600, 'warrior');
		player1.scale.setTo(0.1, 0.1);
		
		player2 = game.add.sprite(700, 600, 'mage');
		player2.scale.setTo(0.25, 0.25);
		
	}
}

function hideButtons(){

	if(playerClass == "mage"){

			buttonGroupMage.visible = false;
			buttonGroupMage2.visible = false;

			attackMageText.visible = false;		
			cureText.visible = false;	
			blessedLuckText.visible = false;		
			fireballText.visible = false;	

			cureMageText.visible = false;	
			cureWarriorText.visible = false;			
			cancelText.visible = false;	
		}
		else {

			buttonGroupWarrior.visible = false;

			attackWarriorText.visible = false;		
			attractText.visible = false;	
			furyText.visible = false;		

		}
}

// function turns(){
    socket.on('playersTurn', function () {

		if(playerClass == "mage"){

			buttonGroupMage.visible = true;
			buttonGroupMage2.visible = false;

			attackMageText.visible = true;		
			cureText.visible = true;	
			blessedLuckText.visible = true;		
			fireballText.visible = true;	

			cureMageText.visible = false;	
			cureWarriorText.visible = false;			
			cancelText.visible = false;	
		}
		else {

			buttonGroupWarrior.visible = true;

			attackWarriorText.visible = true;		
			attractText.visible = true;	
			furyText.visible = true;		

		}

		if(dead)
			return;
		
		if(waitingTurns > 0){
			waitingTurns--;
			socket.emit('passTurn');
			return;
		}
		enemyTurn = false;
		
	});
// }

function actionOnClickMage1 () {

	console.log("CLIQUEI Attack");
	attack(1);
	hideButtons();
}

function actionOnClickMage2 () {


    console.log("CLIQUEI Cure!");
	buttonGroupMage.visible = false;
	buttonGroupMage2.visible = true;

	attackMageText.visible = false;		
	cureText.visible = false;	
	blessedLuckText.visible = false;		
	fireballText.visible = false;	

	cureMageText.visible = true;	
	cureWarriorText.visible = true;			
	cancelText.visible = true;	


}

function actionOnClickMage3 () {


    console.log("CLIQUEI Blessed Luck!");
	attack(4);
	hideButtons();
}

function actionOnClickMage4 () {

    console.log("CLIQUEI Fireball!");
	attack(5);
	hideButtons();
}

function cureMage () {

    console.log("Curou Mage!");
	attack(2);
	hideButtons();

}

function cureWarrior () {

    console.log("Curou Warrior!");
	attack(3);
	hideButtons();
}

function cancelAction () {

    console.log("CLIQUEI Cancel!");
	buttonGroupMage.visible = true;
	buttonGroupMage2.visible = false;

	attackMageText.visible = true;		
	cureText.visible = true;	
	blessedLuckText.visible = true;		
	fireballText.visible = true;	

	cureMageText.visible = false;	
	cureWarriorText.visible = false;			
	cancelText.visible = false;	
}

function actionOnClickWarrior1 () {
	
	console.log("CLIQUEI Attack");
	attack(1);
	hideButtons();
}
	
function actionOnClickWarrior2 () {
		
	console.log("CLIQUEI Attract!");
	attack(2);
	hideButtons();
}
	
function actionOnClickWarrior3 () {
		
	console.log("CLIQUEI Fury!");
	attack(3);
	hideButtons();
}
	
function createButtons(){

    if(playerClass == "mage"){


        var buttonAttackMage = game.make.button(game.world.centerX + 300, 100, 'button', actionOnClickMage1, this, 2, 1, 0);
		var buttonCure = game.make.button(game.world.centerX + 300, 200, 'button', actionOnClickMage2, this, 2, 1, 0);
		var buttonBlessedLuck = game.make.button(game.world.centerX + 300, 300, 'button', actionOnClickMage3, this, 2, 1, 0);
        var buttonFireball = game.make.button(game.world.centerX + 300, 400, 'button', actionOnClickMage4, this, 2, 1, 0);		

        buttonGroupMage.add(buttonAttackMage);
		buttonGroupMage.add(buttonCure);
		buttonGroupMage.add(buttonBlessedLuck);
		buttonGroupMage.add(buttonFireball);

		attackMageText = game.add.text(buttonAttackMage.x + buttonAttackMage.width/2, 145, 'Attack', {fontSize: '32px', fill: '#000'});
		attackMageText.anchor.set(0.5);		

		cureText = game.add.text(buttonCure.x + buttonCure.width/2, 245, 'Cure', {fontSize: '32px', fill: '#000'});
		cureText.anchor.set(0.5);		

		blessedLuckText = game.add.text(buttonBlessedLuck.x + buttonBlessedLuck.width/2, 345, 'Blessed Luck', {fontSize: '32px', fill: '#000'});
		blessedLuckText.anchor.set(0.5);		
		
		fireballText = game.add.text(buttonFireball.x + buttonFireball.width/2, 445, 'Fireball', {fontSize: '32px', fill: '#000'});
		fireballText.anchor.set(0.5);	

		var buttonCureMage = game.make.button(game.world.centerX + 300, 100, 'button', cureMage, this, 2, 1, 0);
		var buttonCureWarrior = game.make.button(game.world.centerX + 300, 200, 'button', cureWarrior, this, 2, 1, 0);
		var buttonCancel = game.make.button(game.world.centerX + 300, 300, 'button', cancelAction, this, 2, 1, 0);		

		buttonGroupMage2.add(buttonCureMage);
		buttonGroupMage2.add(buttonCureWarrior);
		buttonGroupMage2.add(buttonCancel);	

		buttonGroupMage2.visible = false;

		cureMageText = game.add.text(buttonCureMage.x + buttonCureMage.width/2, 145, 'Mage', {fontSize: '32px', fill: '#000'});
		cureMageText.anchor.set(0.5);	
		cureMageText.visible = false;	

		cureWarriorText = game.add.text(buttonCureWarrior.x + buttonCureWarrior.width/2, 245, 'Warrior', {fontSize: '32px', fill: '#000'});
		cureWarriorText.anchor.set(0.5);
		cureWarriorText.visible = false;			

		cancelText = game.add.text(buttonCancel.x + buttonCancel.width/2, 345, 'Cancel', {fontSize: '32px', fill: '#000'});
		cancelText.anchor.set(0.5);
		cancelText.visible = false;			

    }

    else {
        
        var buttonAttackWarrior = game.make.button(game.world.centerX + 300, 100, 'button', actionOnClickWarrior1, this, 2, 1, 0);		
		var buttonAttract = game.make.button(game.world.centerX + 300, 200, 'button', actionOnClickWarrior2, this, 2, 1, 0);
		var buttonFury = game.make.button(game.world.centerX + 300, 300, 'button', actionOnClickWarrior3, this, 2, 1, 0);		

        buttonGroupWarrior.add(buttonAttackWarrior);
		buttonGroupWarrior.add(buttonAttract);
		buttonGroupWarrior.add(buttonFury);

		attackWarriorText = game.add.text(buttonAttackWarrior.x + buttonAttackWarrior.width/2, 145, 'Attack', {fontSize: '32px', fill: '#000'});
		attackWarriorText.anchor.set(0.5);		
		
		attractText = game.add.text(buttonAttract.x + buttonAttract.width/2, 245, 'Attract', {fontSize: '32px', fill: '#000'});
		attractText.anchor.set(0.5);		
		
		furyText = game.add.text(buttonFury.x + buttonFury.width/2, 345, 'Fury', {fontSize: '32px', fill: '#000'});	
		furyText.anchor.set(0.5);				

    }
    console.log("CLASSE: " + playerClass);
}

function start() {
	
		game.load.image('picture1', 'assets/loading.png');
		
		// getThings(firebase.auth().currentUser.uid);
		socket.emit('getCharacter', firebase.auth().currentUser.uid);
		playerReady();
		
		game.load.start();
	
		// button.visible = false;		
		loadButton.visible = false;		
	
	}

function loadStart() {
	
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

	console.log("MYCHARACTER:" + myCharacter);
	console.log("PARTNER:" + partnerCharacter);

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


// 	console.log("USER DESS M*: " + firebase.auth().currentUser.uid);
// }

function attack(numberAttack){
	console.log("PLAYERID IS: " + playerID);
	socket.emit('attack',{uid: playerID, 
												nAtaque: numberAttack
											});
	
	enemyTurn = true;
	if(numberAttack==3 && playerClass == "warrior"){
		socket.emit('dead', playerID);
		waitingTurns = 2;
	}
}

function renderHP(){

	player1HPText.visible = true;
	player2HPText.visible = true;


}

function update() {
}

socket.on('getEnemy', function (enemy, firstMonster) {
	
	console.log("got enemy");  
	console.log(enemy); 

	enemyURL = enemy.sprite;
	enemyHP = enemy.hp;
	enemyPower = enemy.power; 

	if(!firstMonster){

		currentMonster.destroy(); 
		currentMonster = game.add.sprite(20, 300, enemy.name);		
		currentMonster.scale.set(0.5);
		
		textEnemyHP.setText('HP Enemy: ' + enemyHP);
	}
	else{

		currentMonster = game.add.sprite(20, 300, enemy.name);
		currentMonster.scale.set(0.5);
		
		textEnemyHP = game.add.text(game.world.centerX - 600, 200, 'HP Enemy: ' + enemyHP, {fontSize: '32px', fill: '#000'});
	}		
});


socket.on('sendPartner', function (char) {
	console.log('got partner');
	partnerCharacter = char;			
	player2URL = char.sprite;
	player2HP = char.hp;

	player2HPText = game.add.text(800, 300, 'HP:' + player2HP, { fill: '#ffffff' });
	player2HPText.visible = true;

	//$scope.player2Power = char.power;		
});

socket.on('sendCharacter', function (char) {
	console.log('got char');
	myCharacter = char;
	player1URL = char.sprite;
	player1HP = char.hp;
	playerClass = char.class;

	player1HPText = game.add.text(600, 300, 'HP:' + player1HP, { fill: '#ffffff' });	
	player1HPText.visible = true;
	
	//$scope.player1Power = char.power;
	if(char.class == "mage"){
		classMage = true;
	}
	console.log(classMage);
});

	socket.on('enemyDamaged', function (hpMonster) {
		enemyHP = hpMonster;
		console.log("ENEMYHP IS: " + enemyHP);
		textEnemyHP.setText('HP Enemy: ' + enemyHP);			
	});

	socket.on('healPlayer', function (playerInjured) {
			if(playerInjured.uid == playerID){
				console.log("PLAYER 1 HP: " + player1HP);				
				player1HP = playerInjured.character.hp;
				player1HPText.setText('HP:' + player1HP);

				console.log("PLAYER 1 HP: " + player1HP);
			}
			else {
				console.log("PLAYER 2 HP: " + player2HP);
				player2HP = playerInjured.character.hp;	
				player2HPText.setText('HP:' + player2HP);
				console.log("PLAYER 2 HP: " + player2HP);			
			}
	});

	socket.on('blessedLuck', function(powerMonster, powerWarrior){
			enemyPower = powerMonster;
			if(!classMage){
				myCharacter.power = powerWarrior;				
			}
	});

socket.on('playerDamaged', function (playerUID, damage) {
		monsterCanAttack = true;
		if(monsterCanAttack == true){
			monsterCanAttack = false;
			console.log("PLAYER UID É......... " + playerUID);
			var mychar = myCharacter;
			console.log("mychar USER ID IS ;;;;;;;;;;;  " + playerID);
			if(playerUID == playerID){
				console.log("PLAYER DAMAGED: " + playerClass);								
				player1HP -= damage;
				player1HP = Math.round(player1HP);	
				player1HPText.setText('HP:' + player1HP);
			
			}
			else {
				console.log("PLAYER DAMAGED: " + partnerCharacter.class);				
				player2HP -= damage;				
				player2HP = Math.round(player2HP);	
				player2HPText.setText('HP:' + player2HP);
			
			}
			
			if(player1HP <= 0){
				socket.emit('dead', playerID);
				dead = true;
			}
		}
	});

	socket.on('canRenderPlayers', function () {
		console.log('Rendering players ' + renderNumber + ' times.');
		renderNumber++;
					if(playerClass == 'mage'){
		
						var player1Sprite = game.add.sprite(600, 400,'mage');
						player1Sprite.scale.setTo(0.25, 0.25);
		
						var player2Sprite = game.add.sprite(800, 410,'warrior');
						player2Sprite.scale.setTo(0.1, 0.1);
		
						buttonGroupMage = game.add.group();
						buttonGroupMage2 = game.add.group();
						
						// player1HPText.visible = true;
						// player2HPText.visible = true;
		
						// renderHP();
						
						createButtons();
					}
					else{
						var player1Sprite = game.add.sprite(600, 410, 'warrior');
						player1Sprite.scale.setTo(0.1, 0.1);
		
						var player2Sprite = game.add.sprite(800, 400,'mage');
						player2Sprite.scale.setTo(0.25, 0.25);
		
						buttonGroupWarrior = game.add.group();
						
						// player1HPText.visible = true;
						// player2HPText.visible = true;
						
						createButtons();
					}	
					
	});
		