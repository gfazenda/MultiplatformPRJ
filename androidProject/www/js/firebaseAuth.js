angular.module('myApp', ['ionic.native']).controller('Game', function ($scope, $cordovaGooglePlus, $http ) {

	//$scope.existePersonagem();
	
	$scope.checkIfLoggedIn = function(){
		firebase.auth().onAuthStateChanged(function(user){
			if(user){//logado
				window.location.href = 'inicio.html'; 
				console.log("user logged in");				
				

			}else{//nao logado

				
			}
			
		})

	}

	$scope.userData;
	$scope.loginUser = function() {
	  $cordovaGooglePlus.login({})
	  .then(function(res) {
		console.log('good');
		$scope.userData = res
	  }, function(err) {
		console.log('error');
		console.log(err);
	  });
	};
	
	$scope.checkIfLoggedIn();

	$scope.signOut = function(){

		firebase.auth().signOut();
		window.location.reload(); 
		//document.getElementById('google-pic').setAttribute('src', '');
		
		$scope.checkIfLoggedIn();
	}
					
	$scope.signInWithGoogle = function(){
		console.log(navigator);	
		$scope.loginUser();
		

	// 	var credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken);
	// //firebase.auth().signInWithRedirect(provider);
	// 	// [END googlecredential]
	// 	// Sign in with credential from the Google user.
	// 	// [START authwithcred]
	// 	firebase.auth().signInWithCredential(credential).catch(function(error) {
	// 	// var googleAuthProvider = new firebase.auth.GoogleAuthProvider();

	// 	// firebase.auth().signInWithPopup(googleAuthProvider).then(function(data){
			
	// 		$scope.checkIfLoggedIn();//vericifa se logado esta
	// 	})
	// 	.catch(function(error){
	// 		console.log("erro"+error);
	// 	})
	}

});

function onSignIn(googleUser) {
	var profile = googleUser.getBasicProfile();
	console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
	console.log('Name: ' + profile.getName());
	console.log('Image URL: ' + profile.getImageUrl());
	console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  }