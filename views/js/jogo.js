angular.module('myJogo', []).controller('jogo', function ($scope, $http, $timeout) {
	
	$scope.round = 0;
	$scope.enemyTurn = false;
	$scope.waitingTurns = 0;
	$scope.myCharacter;
	$scope.partnerCharacter;
	$scope.classMage = false;
	$scope.actionText;
	$scope.showActionText = false;
	$scope.cureActive = false;
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
	}

	socket.on('actionText', function(text){

		//$scope.$apply (function(){
		$scope.actionText = text;
		$scope.showActionText = true;
		$timeout(function(){
			$scope.showActionText = false;	
			console.log("showActionText: " + $scope.showActionText);		
		}, 2000);
		console.log("showActionText: " + $scope.showActionText);
	//});
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
			}
			else {
				console.log("PLAYER DAMAGED: " + $scope.partnerCharacter.class);				
				$scope.player2HP -= damage;				
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
		$scope.$apply (function(){
			$scope.enemyTurn = false;
		});
	});

});