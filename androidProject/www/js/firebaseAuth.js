angular.module('myApp', []).controller('Game', function ($scope, $http) {

	//$scope.existePersonagem();
	$scope.showFields = false;
	$scope.checkIfLoggedIn = function(){
		if(navigator.platform == 'Linux aarch64'){ //android
			window.location.href = 'inicio.html'; 
		}
		firebase.auth().onAuthStateChanged(function(user){
			if(user){//logado
				window.location.href = 'inicio.html'; 
				console.log("user logged in");				
				

			}else{//nao logado

				
			}
			
		})

	}
	
	$scope.checkIfLoggedIn();

	$scope.signOut = function(){

		firebase.auth().signOut();
		window.location.reload(); 
		//document.getElementById('google-pic').setAttribute('src', '');
		
		$scope.checkIfLoggedIn();
	}
					
	$scope.signInWithGoogle = function(){
		console.log(navigator.platform)	
		if(navigator.platform == 'Linux aarch64'){ //android
			console.log('got you')
			$scope.checkIfLoggedIn();
			$scope.showFields = true;
		}else{
			$scope.showFields = true;
		var googleAuthProvider = new firebase.auth.GoogleAuthProvider();

		firebase.auth().signInWithPopup(googleAuthProvider).then(function(data){
			
			$scope.checkIfLoggedIn();//vericifa se logado esta
		})
		.catch(function(error){
			console.log("erro"+error);
		})
	}
	}

});