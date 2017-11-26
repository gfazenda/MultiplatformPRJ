
angular.module('myIni', []).controller('ini', function ($scope, $http) {

	//socket----------------------------------------------------------------------------------

	var canPlay = false;

	const socket = io.connect('http://multiplataforma-gb-gabrielfazenda.c9users.io/');
 
	socket.on('toClient', function (msg) {
		var chat = document.getElementById('chat');
		chat.innerHTML += msg;
	});

	$scope.enviar = function() {
		var nomeJogador;
		nomeJogador = document.getElementById('google-displayName').innerHTML;
		//console.log("google-displayName: "+nomeJogador);
		enviarNome(nomeJogador);
		socket.emit('toServer2', nomeJogador);
		
		var msg = document.getElementById('msg');
		socket.emit('toServer', msg.value);
	};

	var enviarNome = function(nome) {
		socket.emit('toServer2', nome);
	};
	

	//recupera dados-----------------------------------------------------------\/
	$scope.entrarFila = function(jogadores) {
		
		socket.emit('userOnServer', {name: $scope.personagemJgador.name,
									uid: $scope.personagemJgador.userId
									});
	}
	
	socket.on('userOnClient', function (user) {
		console.log("user");
		console.log(user);
		//console.log("userOnClient"+user);
		var userLista = document.getElementById('user');
		userLista.innerHTML = user;
		
		var str = document.getElementById("user").innerHTML; 
		var res = str.replace(/,/gi, " ");
		document.getElementById("user").innerHTML = res;
		
	});
	//------------------------------------------------------------------------/\
	//recupera dados-----------------------------------------------------------\/
	$scope.recuperaFila = function() {
		socket.emit('devolveFila');
	}
	
	socket.on('filaReload', function (user) {
		//console.log("filaReload"+user);
		var userLista = document.getElementById('user');
		userLista.innerHTML = user;

		var str = document.getElementById("user").innerHTML; 
		var res = str.replace(/,/gi, " ");
		document.getElementById("user").innerHTML = res;
		
	});
	
	$scope.recuperaFila();//recupera os dados da fila quando o usuerio da reload da pagina - (ex. aperta F5) 
	//------------------------------------------------------------------------/\
	//----------------------------------------------------------------------------------------

	$scope.existePersonagem = function(){
		
		var dataBase = firebase.database();
		var personagemRef = dataBase.ref('/personagem');
		var nomePersonagem;
		var idUsuario;

		personagemRef.once('value', function(snapshot){
			
			//console.log(snapshot.val());
			snapshot.forEach(function(id) {
				idUsuario = id.val();
				if(idUsuario.userId === firebase.auth().currentUser.uid){//id do unuario igual ao id do usuario que esta no personagem
					//tem personagem
					$scope.personagemJgador = id.val();
					//console.log("personagemJgador "+$scope.personagemJgador.nome);
				}
			});
			
		})

	}
	$scope.nome = "nada"
	$scope.checkIfLoggedIn = function(){
		
		firebase.auth().onAuthStateChanged(function(user){
			if(user){//logado
				$scope.existePersonagem();
				console.log("entrou em auth");
				var photoURL = user.photoURL;
				var myName = user.displayName;
				var myEmail = user.email;
				console.log("photoURL: " + photoURL);
				console.log("myName: " + myName);
				console.log("myEmail: " + myEmail);
			
				document.getElementById('google-pic').setAttribute('src', photoURL);
			
				document.getElementById('google-displayName').innerHTML = myName;
		
				document.getElementById('google-email').innerHTML = myEmail;

				document.getElementById('signOut').setAttribute('style', 'display: inline-block', 'visibility: hidden');

			}else{//nao logado
				window.location.href = '/'; 
				
			}
			
		})

	}

	$scope.checkIfLoggedIn();
	window.onload = function(){
		
		firebase.auth().onAuthStateChanged(function(user){
			if(user){//logado
				var timer = 1;
				var maior = 0;
				var cronometro = window.setInterval(function() { 
				
					//console.log(maior);
					if(timer > 5 && maior === 0){
						maior = 1;
						$scope.existePersonagem();
					}
					
					if(maior === 1){
						maior = 2;
						//console.log(parseFloat(timer));
						
						//console.log("$scope.existePersonagem()");
						//console.log($scope.existePersonagem());
						
						//call function------------------------------------------\/
				
						if($scope.personagemJgador){ //jogador  tem um personagem
							//console.log("jogador com personagem ");
							document.getElementById('nomeChar').innerHTML = $scope.personagemJgador.name;
							document.getElementById('levelChar').innerHTML = "Level: " + $scope.personagemJgador.level;
							document.getElementById('poderChar').innerHTML = "Power: " + $scope.personagemJgador.power;

							var nomeJogador;
							nomeJogador = document.getElementById('google-displayName').innerHTML;
							//console.log("google-displayName: "+nomeJogador);
							enviarNome(nomeJogador);
						}else{
							//console.log("jogador sem personagem ");
							window.location.href = "/personagem.html";//redireciona para a criação de personagem;
						}
						
						//--------------------------------------------------------/\
					}
					
					if(maior === 2){
						//console.log("para");
						clearTimeout(cronometro);
					}

					if (maior === 0){
						timer = parseFloat(timer + 0.1);
						//console.log(parseFloat(timer));
					}
					
				}, 50);
			}
		});
	}
	
	
	$scope.jogar = function(){
		if(document.getElementById(firebase.auth().currentUser.uid)){//faz o jogador ter que entrar na fila par jogar
			//window.location.href = '/jogo'; 
			console.log("FIREBASE USER UID: " + firebase.auth().currentUser.uid);
			console.log("canPlay: " + canPlay);
			canPlay = true;
			console.log("canPlay: " + canPlay);

			firebase.auth().onAuthStateChanged(function(user){
				if(user){//logado
					window.location.href = '/jogo.html';
					console.log("FIREBASE USER UID: " + firebase.auth().currentUser.uid);					
				}else{//nao logado
					//window.location.href = '/'; 
				}
				
			})
			
		}else{
			console.log("Entre na fila");
		}
	}
	
	$scope.signOut = function(){

		firebase.auth().signOut();
		window.location.href = '/'; 
		//document.getElementById('google-pic').setAttribute('src', '');

	}

});


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