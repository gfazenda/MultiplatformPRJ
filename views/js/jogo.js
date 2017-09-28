
angular.module('myJogo', []).controller('jogo', function ($scope, $http) {
	
	$scope.round = 0;

// Initialize Firebase
// TODO: Replace with your project's customized code snippet
	var config = {
		apiKey: "AIzaSyBWTn-nzSkja6F2oTWKUeRkrYJwFaw-Hu8",
		authDomain: "fir-admin-1add3.firebaseapp.com",
		databaseURL: "https://fir-admin-1add3.firebaseio.com",
		storageBucket: "gs://fir-admin-1add3.appspot.com",
		messagingSenderId: "644958744075",
	};
	firebase.initializeApp(config);
		  
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
	//-----------------------------------------------------------------------------------------
	//pega personagens do banco----------------------------------------------------------------
	$scope.chamePersonagens = function(){
		//console.log(playersGlob);
		
		socket.emit('buscaPersonagens');
		socket.on('enviaOsPersonagens', function (personagens) {
			
			$scope.$apply(function() {
			
					//console.log(personagens.length);
					for(var i = 0 ; i < personagens.length; i++){
						personagemGlob[i] = personagens[i];
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
				
				return personagemGlob[j];
			}
		}
	}
	
//-----------------------------------------------------------------------------------------

	$scope.getEnemyStats = function(enemyName){
		console.log("enemyURL(1) is: " + $scope.enemyURL);                    
		
		var database = firebase.database();    
		var EnemiesRef = database.ref('/enemiesSprite');
		EnemiesRef.on('child_added', function(snapshot){
			$scope.$apply(function () {
			
			if(snapshot.val().name == enemyName){
				$scope.enemyURL = snapshot.val().sprite;
				$scope.enemyHP = snapshot.val().hp;
				console.log("enemyURL(2) is: " + $scope.enemyURL);   
			}
			});
		})
	}
			
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

	$scope.checkIfEnemyDead = function() {
		if($scope.enemyHP <= 0){
			console.log("ENEMY DEAD");
			$scope.round++;
			setTimeout(function() {
				$scope.getRandomEnemy(); 
			}, 1000);                    
			
		}
		else{
			console.log("NOT DEAD");
		}
	   // return true
	}

	$scope.attack = function(numberAttack){
	
		$scope.$apply (function(){
			socket.emit('attack',{character: $scope.getCharacter(firebase.auth().currentUser.uid), 
													nAtaque: numberAttack,
												});
		});
	}
	
	socket.on('sendAttack', function (dano) {
		$scope.enemyHP -= dano;
		console.log($scope.enemyHP);
		$scope.checkIfEnemyDead();
	})

	

	//$scope.getPlayerStats("player1");
	//$scope.getPlayerStats("player2");
	$scope.getRandomEnemy();

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