angular.module('myJogo', []).controller('jogo', function ($scope, $http) {
	
	$scope.round = 0;
	$scope.enemyTurn = false;
// Initialize Firebase
// TODO: Replace with your project's customized code snippet
	// var config = {
	// 	apiKey: "AIzaSyBWTn-nzSkja6F2oTWKUeRkrYJwFaw-Hu8",
	// 	authDomain: "fir-admin-1add3.firebaseapp.com",
	// 	databaseURL: "https://fir-admin-1add3.firebaseio.com",
	// 	storageBucket: "gs://fir-admin-1add3.appspot.com",
	// 	messagingSenderId: "644958744075",
	// };
	// firebase.initializeApp(config);

	var config = {
		apiKey: "AIzaSyBVVQnrtmt9D9arsU0xTrNB7s9pHeX6tac",
		authDomain: "teste-firebase-23985.firebaseapp.com",
		databaseURL: "https://teste-firebase-23985.firebaseio.com",
		projectId: "teste-firebase-23985",
		storageBucket: "teste-firebase-23985.appspot.com",
		messagingSenderId: "493837150254"
	};
	firebase.initializeApp(config);

	//window.onload = function(){
	$scope.checkIfLoggedIn = function(){

		firebase.auth().onAuthStateChanged(function(user){
			if(user){//logado
				console.log("página jogo: user logged in");

			}else{//nao logado

				console.log("página jogo: não logado");
			}
			
		})

	}
	
		$scope.checkIfLoggedIn();
		
	
		  
	//socket----------------------------------------------------------------------------------
	var socket = io('http://localhost:8080');

	socket.on('toClient', function (msg) {
		var chat = document.getElementById('chat');
		chat.innerHTML += msg;
		
	});

	$scope.enviar = function() {
		var msg = document.getElementById('msg');
		console.log(msg);
		socket.emit('enviaAtaque', msg.value);
	};
	
	$scope.ataque = function(nAtaque) {
		console.log(firebase.auth().currentUser.uid);
		socket.emit('enviaAtacanteAtaque',{uid: firebase.auth().currentUser.uid, 
											nAtaque: nAtaque,
											turno: 0
										});
	}

	socket.on('turno', function (msg) {
		console.log(msg);
	});
	
    $scope.escolhaAtaque = {
		ataque1 : '1',
		ataque2 : '2',
		ataque3 : '3'
    };
	
	var playersGlob = [];
	var personagemGlob = [];
	var playersOnline = [];

	//pega ID dos personagens da fila----------------------------------------------------------
	socket.emit('pedeOsPlayers');
	socket.on('enviaOsPlayers', function (players) {//array de jogadors na lista
		for(var i = 0 ; i < players.length ; i++){
			playersGlob[i] = players[i];
		}

		$scope.chamePersonagens();
	});


	// $scope.chamePersonagens = function(){
	// 	socket.emit('getMyChar',firebase.auth().currentUser.uid);

	// }

	// socket.on('loadCharacter', function (personagen) {
	// 	$scope.$apply(function() {
	// 		$scope.player1URL = personagen.sprite;
	// 		$scope.player1HP = personagen.hp;
	// 	});
	// });
	//-----------------------------------------------------------------------------------------
	//pega personagens do banco----------------------------------------------------------------
	$scope.chamePersonagens = function(){
		//console.log(playersGlob);
		
		socket.emit('buscaPersonagens');
		socket.on('enviaOsPersonagens', function (personagens) {
			
			$scope.$apply(function() {
			
					//console.log(personagens.length);
					for(var i = 0 ; i < personagens.length; i++){
						personagemGlob.push(personagens[i]);
						//console.log(personagemGlob[i]);
					}
					
					$scope.comparaId();
			});
		});
	}
	//-----------------------------------------------------------------------------------------
	
	//verifica se o player esta on-------------------------------------------------------------
	//compara o id do personagem da lista com o id do personagem do banco
	$scope.comparaId = function(){
		//console.log(playersGlob.length);
		var it = 0;
		for(var i = 0 ; i < playersGlob.length; i++){
			for(var j = 0 ; j < personagemGlob.length; j++){
				//console.log("playersGlob[i].uid"+ playersGlob[i].uid);
				//console.log("personagemGlob[j].userId"+ personagemGlob[j].userId);
				if(playersGlob[i].uid == personagemGlob[j].userId){
					
					playersOnline[it] = personagemGlob[j]; // playersOnline são os jogadores que irão estar disponiveis  para jogar
					it++;
				}
			}
		}
		// if(it>=2)
			$scope.getPlayerStats();
	}

	$scope.getPlayerStats = function(){

		console.log("jogo :");
		console.log(playersOnline);
		
		$scope.player1URL = playersOnline[0].sprite;
		$scope.player1HP = playersOnline[0].hp;

		$scope.player2URL = playersOnline[1].sprite;
		$scope.player2HP = playersOnline[1].hp;

		//console.log($scope.player1HP);
	}
	
	$scope.getCharacter = function(uid){
		
		for(var j = 0 ; j < personagemGlob.length; j++){
			if(uid == personagemGlob[j].userId){
				console.log(personagemGlob[j]);
				return personagemGlob[j];
			}
		}
	}
	
//-----------------------------------------------------------------------------------------

	// $scope.getEnemyStats = function(enemyName){
	// 	console.log("enemyURL(1) is: " + $scope.enemyURL);                    
		
	// 	var database = firebase.database();    
	// 	var EnemiesRef = database.ref('/enemiesSprite');
	// 	EnemiesRef.on('child_added', function(snapshot){
	// 		console.log("cheguei aquiqqqq");
			
			
	// 		if(snapshot.val().name == enemyName){
	// 			$scope.$apply(function () {
					
	// 			$scope.enemyURL = snapshot.val().sprite;
	// 			$scope.enemyHP = snapshot.val().hp;
	// 			console.log("enemyURL(2) is: " + $scope.enemyURL);   
	// 		});
	// 		}
			
	// 	})
	// }

	// $scope.getEnemyStats = function(){
		
	// 	socket.emit('buscaInimigo');
	// }
	
	// $scope.getEnemyStats();
	
	socket.on('trazInimigo', function (inimigo) {
		
		console.log("inimigo");  
		console.log(inimigo);  
		
		 $scope.$apply(function () {
			$scope.enemyURL = inimigo.sprite;
			$scope.enemyHP = inimigo.hp;
		 });

	});
			
	$scope.getRandomInt = function (min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}

	$scope.getRandomEnemy = function(){

		var enemyNumber = $scope.getRandomInt(4,1);
		console.log("enemyNumber is : " + enemyNumber);

		switch(enemyNumber)   {
			case 1:

				$scope.getEnemyStats("enemy1");
				break;

			case 2:

				$scope.getEnemyStats("enemy2");                
				break;

			case 3:

				$scope.getEnemyStats("enemy3");                
				break;

			default:
				break;
		}         
	}

	// $scope.checkIfEnemyDead = function() {
	// 	if($scope.enemyHP <= 0){
	// 		console.log("ENEMY DEAD");
	// 		$scope.round++;
	// 		setTimeout(function() {
	// 			$scope.getRandomEnemy(); 
	// 		}, 1000);                    
			
	// 	}
	// 	else{
	// 		console.log("NOT DEAD");
	// 	}
	//    // return true
	// }

	$scope.attack = function(numberAttack){
		//console.log("CURRENT USER: " + $scope.getCharacter(firebase.auth().currentUser.uid));
		//console.log("CLASSE: " + $scope.getCharacter(firebase.auth().currentUser).class);
		
		//$scope.$apply (function(){
			socket.emit('attack',{character: $scope.getCharacter(firebase.auth().currentUser.uid), 
													nAtaque: numberAttack
												});
		//});
		$scope.enemyTurn = true;
	}

	socket.on('enemyDamaged', function (hpMonster) {
		
		$scope.$apply (function(){
			$scope.enemyHP = hpMonster;
		});
	});


	socket.on('newRound', function () {
		$scope.$apply (function(){
			$scope.round++;
		});
	});

	socket.on('playersTurn', function () {
		$scope.$apply (function(){
			$scope.enemyTurn = false;
		});
	});
	// socket.on('playersturn', function (hpMonster) {
	// 	$scope.$apply (function(){
			
	// 		$scope.enemyHP = -111;
	// 		//$scope.enemyTurn = false;
	// 	});
	// 	//console.log('called here');
	// });


	// socket.on('playersturn', function () {
		
	// 	$scope.$apply (function(){
	// 		console.log('called here');
	// 		$scope.enemyTurn = false;
	// 	});
	// });
	
	// socket.on('sendAttack', function (dano) {
	// 	$scope.$apply (function(){
	// 		$scope.enemyHP -= dano;  //com apply atualiza o hp e round no usuário que não atacou somente...
	// 	});
	// 		console.log("enemyHP is... " + $scope.enemyHP);
	// 		$scope.checkIfEnemyDead();
		

	// })

	

	//$scope.getPlayerStats("player1");
	//$scope.getPlayerStats("player2");
	//$scope.getRandomEnemy();

});

/*
criaInimigo = function(){//popular banco com monstros
	var database = firebase.database();    
	var inimigo = database.ref('/enemiesSprite');
		
	inimigo.push({//1°
		hp: 20,
		mp: 10,
		name: "enemy1",
		sprite: "https://s3.amazonaws.com/gameartpartnersimagehost/wp-content/uploads/edd/2015/08/Gameartpartner-featured-image2.png"

	})
	
	inimigo.push({//2°
		hp: 20,
		mp: 10,
		name: "enemy2",
		sprite: "https://orig04.deviantart.net/a4e0/f/2009/108/b/7/zork__ogre_by_zubby.png"

	})
	
	inimigo.push({//3°
		hp: 20,
		mp: 10,
		name: "enemy3",
		sprite: "http://gamebuildingtools.com/wp-content/uploads/2016/05/robot.png"

	})
	
}
*/

// function inimigos(){//popular inimigos no banco
// console.log("pass");
	// var dataBase = firebase.database();
	// var personagemRef = dataBase.ref('/inimigos');

	// //var charName = "rat";
	// //var charName = "bug";
	// var charName = "wolf";
	
	// personagemRef.push({
		// level:0,
		// nome: charName,
		// poder: 10

	// })
// }

//debug no console angular -> angular.element(personagem).scope().existePersonagem();