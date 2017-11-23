angular.module('myJogo', []).controller('jogo', function ($scope, $http, $timeout) {
	
	$scope.round = 0;
	$scope.enemyTurn = false;
	$scope.waitingTurns = 0;
	$scope.myCharacter;
	$scope.partnerCharacter;
	$scope.classMage = false;
	$scope.actionText;
	$scope.showActionText = false;
	$scope.showActionTextMonster = false;
	$scope.cureActive = false;
	$scope.promise;
	$scope.Math = window.Math;
	$scope.dead = false;
    $scope.player1_S64;
	var socket = io('http://localhost:8080');
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
				$scope.getMyCharacter()
			}else{//nao logado

				console.log("página jogo: não logado");
			}
			
		})

	}

	$scope.Initialize = function() {
		console.log('starting maaan');
		$scope.checkIfLoggedIn();
		
	}
		 
	
	$scope.getMyCharacter = function() {
		console.log('getting char');
		socket.emit('getCharacter', firebase.auth().currentUser.uid);
		
	}

	$scope.cureSelect = function(state){
		$scope.cureActive = state;
	}

	
	
	//socket----------------------------------------------------------------------------------
	

	socket.on('sendCharacter', function (char) {
		console.log('got char');
		$scope.$apply(function() {
		$scope.myCharacter = char;
		$scope.player1URL = char.sprite;
		$scope.player1HP = char.hp;
        $scope.player1_S64 = char.sprite64;
        socket.emit('send64', $scope.player1_S64);
		$scope.class = char.class;
		//$scope.player1Power = char.power;
		if(char.class == "mage"){
			$scope.classMage = true;
		}
			console.log($scope.classMage);
		})
	});

	socket.on('sendPartner', function (char) {
		console.log('got partner');
		$scope.$apply(function() {
		$scope.partnerCharacter = char;			
		$scope.player2URL = char.sprite;
		$scope.player2HP = char.hp;
		//$scope.player2Power = char.power;		
		});
	});

	socket.on('toClient', function (msg) {
		var chat = document.getElementById('chat');
		chat.innerHTML += msg;
		
	});

	$scope.enviar = function() {
		var msg = document.getElementById('msg');
		console.log(msg);
		socket.emit('enviaAtaque', msg.value);
	};

	socket.on('turno', function (msg) {
		console.log(msg);
	});
	
    $scope.escolhaAtaque = {
		ataque1 : '1',
		ataque2 : '2',
		ataque3 : '3'
    };
	
	socket.on('getEnemy', function (inimigo) {
		
		console.log("got enemy");  
		console.log(inimigo);  
		
		 $scope.$apply(function () {
			$scope.enemyURL = inimigo.sprite;
			$scope.enemyHP = inimigo.hp;
			$scope.enemyPower = inimigo.power;
		 });
	});

	$scope.attack = function(numberAttack){
		//console.log("CURRENT USER: " + $scope.getCharacter(firebase.auth().currentUser.uid));
		//console.log("CLASSE: " + $scope.getCharacter(firebase.auth().currentUser).class);
		
		//$scope.$apply (function(){
			socket.emit('attack',{uid: firebase.auth().currentUser.uid, 
													nAtaque: numberAttack
												});
		//});
		
		$scope.enemyTurn = true;
		if(numberAttack==3 && $scope.myCharacter.class == "warrior"){
			socket.emit('dead', firebase.auth().currentUser.uid);
			$scope.waitingTurns = 2;
		}
	}
	
	socket.on('gameOver', function(){
		window.location.href = '/inicio';
	});

	socket.on('actionText', function(text, player = true){
		$timeout.cancel($scope.promise);
		$scope.$apply (function(){
		$scope.actionText = text;
		var delay = 2000;
		if(player){
			$scope.showActionText = true;
		}else{
			$scope.showActionTextMonster = true;
			delay = 1500;
		}
		$scope.promise =
		$timeout(function(){
			$scope.showActionText = false;	
			$scope.showActionTextMonster = false;
			console.log("showActionText: " + $scope.showActionText);		
		}, delay);
		console.log("showActionText: " + $scope.showActionText);
	});
		//$scope.showActionText = false;
	});

	socket.on('enemyDamaged', function (hpMonster) {
		
		$scope.$apply (function(){
			$scope.enemyHP = hpMonster;
		});
	});

	socket.on('playerDamaged', function (playerUID, damage) {
		console.log("PLAYER UID É......... " + playerUID);
		$scope.$apply (function(){
			var mychar = $scope.myCharacter;
			console.log("mychar USER ID IS ;;;;;;;;;;;  " + firebase.auth().currentUser.uid);
			if(playerUID == firebase.auth().currentUser.uid){
				console.log("PLAYER DAMAGED: " + $scope.myCharacter.class);								
				$scope.player1HP -= damage;
				$scope.player1HP = $scope.Math.round($scope.player1HP);				
			}
			else {
				console.log("PLAYER DAMAGED: " + $scope.partnerCharacter.class);				
				$scope.player2HP -= damage;				
				$scope.player2HP = $scope.Math.round($scope.player2HP);				
			}
			
			if($scope.player1HP <= 0){
				socket.emit('dead', firebase.auth().currentUser.uid);
				$scope.dead = true;
			}
		});
	});

	socket.on('healPlayer', function (playerInjured) {
		$scope.$apply (function(){
			if(playerInjured.uid == firebase.auth().currentUser.uid){
				console.log("PLAYER 1 HP: " + $scope.player2HP);				
				$scope.player1HP = playerInjured.character.hp;
			}
			else {
				console.log("PLAYER 2 HP: " + $scope.player2HP);
				$scope.player2HP = playerInjured.character.hp;				
			}
		});
	});

	socket.on('blessedLuck', function(powerMonster, powerWarrior){
		$scope.$apply (function(){
			$scope.enemyPower = powerMonster;
			if(!classMage){
				$scope.myCharacter.power = powerWarrior;				
			}
		});
	});

	socket.on('newRound', function () {
		$scope.$apply (function(){
			$scope.round++;
		});
	});

	socket.on('playersTurn', function () {
		if($scope.dead)
			return;
		$scope.$apply (function(){
			if($scope.waitingTurns > 0){
				$scope.waitingTurns--;
				socket.emit('passTurn');
				return;
			}
			$scope.enemyTurn = false;
		});
	});

});