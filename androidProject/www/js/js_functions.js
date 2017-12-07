function signInWithGoogle(){
    var googleAuthProvider = new firebase.auth.GoogleAuthProvider;

    firebase.auth().signInWithPopup(googleAuthProvider)
            .then(function(data){
                console.log(data);
            })
            .catch(function(error){
                console.log(error);
            });
    
    document.getElementById("google-displayName").innerHTML = "Usuário: " + firebase.auth().currentUser.displayName;
    document.getElementById("google-email").innerHTML = "Email: " + firebase.auth().currentUser.email;
    document.getElementById("google-pic").src = "https://lh5.googleusercontent.com/-gthzGWGkwDM/AAAAAAAAAAI/AAAAAAAAAFI/iS5kKaP7u3A/photo.jpg";
    
}

function createDbEntry(){
    var enemyName = document.getElementById("enemyName").value;
    var database = firebase.database();
    var DbRef = database.ref('/enemies').set({
        name: enemyName,
        hp: 20,
        mp: 10,
        turns : 5
    });
}

function addEnemy(){
    var enemyName = document.getElementById("enemyName").value;
    var database = firebase.database();
    var DbRef = database.ref('/enemies'); //.set({
    //     name: enemyName,
    //     hp: 20,
    //     mp: 10,
    //     turns : 5
    // });
    DbRef.push({
        name: enemyName,
        hp: 20,
        mp: 10,
        turns : 5
    });

    //console.log(DbRef);

    //window.location.reload();

    DbRef.on('value', function(snapshot){
        document.getElementById("dbNames").innerHTML = snapshot.val().hp;
        //console.log(snapshot.val())
    })

}

function doStuff(){
    console.log("damn, jeff!");
}

function spawnEnemy(){
    console.log("ENEMY SPAWN");
    var database = firebase.database();    
    var EnemiesRef = database.ref('/enemiesSprite');
    EnemiesRef.on('child_added', function(snapshot){
        if(snapshot.val().name == "enemy2"){
            console.log(snapshot.val().url);
            return snapshot.val().url;         
        }
        
    })
}

function spawnEnemy2(){
    return "https://www.w3schools.com/images/w3schools_green.jpg"
}

function createEnemies2(){

    var database = firebase.database();
    var DbRef = database.ref('/enemiesSprite').push({
        name: "enemy2",
        hp: 20,
        mp: 10,
        sprite: "url"
    });
}

function createPlayer(){
    
        var database = firebase.database();
        var DbRef = database.ref('/players').push({
            name: "player2",
            hp: 10,
            mp: 20,
            class: "mage",
            sprite: "http://img1.wikia.nocookie.net/__cb20090719203239/finalfantasy/images/archive/8/85/20090719203756!Blackmage-ff1-nes.png"
        });
        console.log("Player created!");
}