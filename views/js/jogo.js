angular.module('myJogo', []).controller('jogo', function ($scope, $http) {
	
	$scope.round = 0;
	$scope.enemyTurn = false;
	$scope.waitingTurns = 0;
	$scope.myCharacter;
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

	
	
	//socket----------------------------------------------------------------------------------
	

	socket.on('sendCharacter', function (char) {
		console.log('got char');
		$scope.$apply(function() {
		$scope.myCharacter = char;
		$scope.player1URL = char.sprite;
		$scope.player1HP = char.hp;
		})
	});

	socket.on('sendPartner', function (char) {
		console.log('got partner');
		$scope.$apply(function() {
		$scope.player2URL = char.sprite;
		$scope.player2HP = char.hp;
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

});