angular.module('myApp', []).controller('Game', function ($scope, $http) {

	//$scope.existePersonagem();
	
	$scope.checkIfLoggedIn = function(){
		firebase.auth().onAuthStateChanged(function(user){
			if(user){//logado
				window.location.href = '/inicio.html'; 
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
		
		var googleAuthProvider = new firebase.auth.GoogleAuthProvider();

		firebase.auth().signInWithPopup(googleAuthProvider).then(function(data){
			
			$scope.checkIfLoggedIn();//vericifa se logado esta
		})
		.catch(function(error){
			console.log("erro"+error);
		})
	}

});