angular.module('myPersonagem', []).controller('personagem', function ($scope, $http) {
	
	var socket = io('http://localhost:8080');

	// socket.on('warriorChar', function (msg) {
		// var chat = document.getElementById('chat');
		// chat.innerHTML += msg;
	// });
	
	// socket.on('mageChar', function (msg) {
		// var chat = document.getElementById('chat');
		// chat.innerHTML += msg;
	// });
	
	
	
	$scope.criaPersonagem = function(escolhaClass){
		//escolhaClass é o numero da classe. 0 para warrior e 1 para mago
		
		var charInputName = document.getElementById('addChar');
		var charName = charInputName.value;
		charInputName.value = '';

		if(charName !== "" ){
			if(charName.length >= parseInt(4)){
				if(escolhaClass){
					//console.log("pass");
					//console.log(charName);
					//console.log(charName.length);
					var dataBase = firebase.database();
					var personagemRef = dataBase.ref('/personagem');

					personagemRef.push({
						class: $scope.personagem[escolhaClass-1].class,
						level:$scope.personagem[escolhaClass-1].level,
						power: $scope.personagem[escolhaClass-1].power,
						hp: $scope.personagem[escolhaClass-1].hp,
						hpMax: $scope.personagem[escolhaClass-1].hpMax,
						mp: $scope.personagem[escolhaClass-1].mp,
						name: charName,
						sprite: $scope.personagem[escolhaClass-1].sprite,
						xp: $scope.personagem[escolhaClass-1].xp,
						userId: firebase.auth().currentUser.uid

					})
					.then(function(){
						window.location.href = '/inicio'; 
						
					})
					.catch(function(error){
						console.log(error);	
					})
				}else{
					console.log("escolhaClass nao existe");
				}
			}else{
				//console.log("Npass");
				//console.log(charName);
				//console.log(charName.length);
			}
		}else{
			//console.log("Npass");
			//console.log(charName);
			//console.log(charName.length);
		}

	}


	window.onload = function() {
		console.log('aaa');
		socket.emit('tragaPersonagensModelos');
		
		socket.on('levaPersonagensModelos', function (personagemEscolha) {//personagens modelo que vem do servidor que o servidor pega do banco

			if(!personagemEscolha[0]){
				window.location.reload(); 
			}else{
				console.log(personagemEscolha[0]);
				console.log(personagemEscolha[1]);

				$scope.personagem = personagemEscolha;
				//char 1------------------------------------------
				document.getElementById('spriteChar1').setAttribute('src', personagemEscolha[0].sprite);
				document.getElementById('classChar1').innerHTML = personagemEscolha[0].class;
			  
				document.getElementById('powerChar1').innerHTML = "Power: " + personagemEscolha[0].power;
				document.getElementById('hpChar1').innerHTML = "HP: " + personagemEscolha[0].hp;
				document.getElementById('mpChar1').innerHTML = "MP: " + personagemEscolha[0].mp;
				//------------------------------------------------
				//char 2------------------------------------------
				document.getElementById('spriteChar2').setAttribute('src', personagemEscolha[1].sprite);
				document.getElementById('classChar2').innerHTML = personagemEscolha[1].class;
			  
				document.getElementById('powerChar2').innerHTML = "Power: " + personagemEscolha[1].power;
				document.getElementById('hpChar2').innerHTML = "HP: " + personagemEscolha[1].hp;
				document.getElementById('mpChar2').innerHTML = "MP: " + personagemEscolha[1].mp;
				//------------------------------------------------
			}
		});
	};

	$scope.escolhaPersonagem = {//radio button
		char1 : '1',
		char2 : '2',
    };

	$scope.voltar = function(){

		window.location.href = '/inicio'; 
		//document.getElementById('google-pic').setAttribute('src', '');

	}

});
//------------------------------------------------------------------------------
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
		name: "player1",
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

function criaP2(){
	console.log("pass");
	var dataBase = firebase.database();
	var personagemRef = dataBase.ref('/modeloPersonagem');

	personagemRef.push({
		class: "mage",
		level:0,
		power: 10,
		hp: 10,
		hpMax:20,
		mp: 20,
		name: "player2",
		sprite: "https://vignette1.wikia.nocookie.net/finalfantasy/images/8/85/Blackmage-ff1-nes.png/revision/20090719203756",
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
//------------------------------------------------------------------------------


//debug no console angular -> angular.element(personagem).scope().existePersonagem();