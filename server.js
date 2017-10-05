const KEY = 'nome-do-cookie';
const SECRET = 'chave-secreta-aqui!';

var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var admin = require("firebase-admin");

var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

   
var serviceAccount = require('./teste-firebase-23985-firebase-adminsdk-ruged-29c6e56ddb.json');

var firebaseAdmin = admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://teste-firebase-23985.firebaseio.com',
	
});

var dataBase = firebaseAdmin.database();

var app = express();
var rota = express.Router();

var server = require('http').createServer(app)
   
var io = require('socket.io').listen(server);
var cookie = cookieParser(SECRET);
var store = new expressSession.MemoryStore();

app.set('view engine', 'ejs');

app.use(express.static('views'))

app.set('views', __dirname + '/views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(logger('dev'));

app.use('/', rota);

app.use(cookie);
app.use(expressSession({
	secret: SECRET,
	name: KEY,
	resave: true,
	saveUninitialized: true,
	store: store
}));
 
// Compartilhando a sessão válida do Express no Socket.IO
io.use(function(socket, next) {
	var data = socket.request;
	cookie(data, {}, function(err) {
		var sessionID = data.signedCookies[KEY];
		store.get(sessionID, function(err, session) {
			if (err || !session) {
				return next(new Error('Acesso negado!'));
			} else {
				socket.handshake.session = session;
				return next();
			}
		});
	});
});
 
app.get('/personagem', function(request, response){

	response.render('personagem.ejs');
	console.log("'GET request to the personagem");
});


//autentication create
function isAuthenticated(request, response, next){
	// check if user loggin
	console.log("logadoS");
}

app.get('/', function(request, response){


	//response.render('home.ejs');
	var restaurantRef = dataBase.ref('/personagem');
	

	restaurantRef.once('value', function(snapshot){
		//console.log(snapshot.val());
	
		response.render('home.ejs', {personagem: snapshot.val()});

	})
});

var userbytwo = 0; /* added var definition for userbytwo here */

app.get('/inicio', function(request, response){

	/* add statement to increment userbytwo by two here */
	userbytwo = userbytwo + 1;
	response.render('inicio.ejs', {userbytwo: userbytwo});
	

});

app.get('/jogo', function(request, response){

	response.render('jogo.ejs');

});
 
app.get('homecoming-queen',isAuthenticated, function(request, response){
	response.render('homecomingQueen.ejs');
console.log("'GET request to the homepage");
});

app.post('/', function(request, response){
	console.log("POST request to the homepage");
	firebase.auth().onAuthStateChanged(function(user){
		if(user){
			//logado
			console.log("logadoS");
		}else{
			//deslogado
			console.log("deslogadoS");
		}
	});
});


var players = [];
var personagens = [];
var jogadores = [];
var jogadoresRef = [];
var poder;
var currentMonster;
var turnCount = 0; //se = 2, monstro ataca
var usedAttract = false;
var userAttractedUid;
var enemyBurned = false;
var monsterDamageLimit = 7;

healPlayer = function(mage, className){

	var hpHealed = mage.power;
	var playerInjured = players;
	var playerNumber;
	for (i = 0; i < playerInjured.length; i++) {
		if(playerInjured[i].character.class == className){
			playerNumber = i;
			playerInjured[i].character.hp += hpHealed;
			if(playerInjured[i].character.hp > playerInjured[i].character.hpMax){
				playerInjured[i].character.hp = playerInjured[i].character.hpMax;
			}
		}
	} 	
	
	io.sockets.emit('healPlayer', playerInjured[playerNumber]);
}

fireball = function(damage){

	enemyBurned = true;
	damageMonster(damage*3)
}

blessedLuck = function(){
	// 4 - Corta o dano do inimigo em X% / Aumenta dano do cavaleiro em X%
	currentMonster.power = currentMonster.power/2;
	if(currentMonster.power < 1) currentMonster.power = 1;

	var playerNumber;
	for (i = 0; i < players.length; i++) {
		playerNumber = i;
		if(players[i].character.class == "warrior"){
			players[i].character.power = players[i].character.power*2;
		}
	} 	

	io.sockets.emit('blessedLuck', currentMonster.power, players[playerNumber].character.power);
}

attackMage = function(mage, numberAttack){
	
	//MAGE
	// 1 - Ataque Básico
	// 2 - Poder de cura: Mage
	// 3 - Poder de cura: Warrior
	// 4 - Corta o dano do inimigo em X% / Aumenta dano do cavaleiro em X%
	// 5 - Bola de fogo (queima inimigo, dano por turno)
	
	var damage = mage.power;

	switch(numberAttack){
			
			case 1:
				console.log("damage mage: " + damage);
				io.sockets.emit('actionText', 'Attack');
				damageMonster(damage);
				break;
			
			case 2:
			
				io.sockets.emit('actionText', 'Cure');
				healPlayer(mage, "mage");				
				break;
			
			case 3:
			
				io.sockets.emit('actionText', 'Cure');
				healPlayer(mage, "warrior");	
				break;
			
			case 4:
			
				io.sockets.emit('actionText', 'Blessed Luck');
				blessedLuck();
				break;

			case 5:
				
				io.sockets.emit('actionText', 'Fireball');
				fireball(damage);
				break;
				
			default:
				
				break;
		}

}

attackWarrior = function(warrior, numberAttack){
	
	//WARRIOR
	// 1 - Ataque Básico
	// 2 - Poder de absorver danos causados ao mago
	// 3 - Ataque de fúria - atk em área com dano muito alto, porém fica impossibilitado de jogar na rodada seguinte
	var damage = warrior.power
	switch(numberAttack){
			
			case 1:

				io.sockets.emit('actionText', 'Attack');
				damageMonster(damage);
				break;
			
			case 2:

				io.sockets.emit('actionText', 'Attract');
				usedAttract = true;
				break;
			
			case 3:

				io.sockets.emit('actionText', 'Fury');
				damageMonster(damage*3);
				break;
				
			default:
				
				break;
		}

}

damageMonster = function(damage){
	currentMonster.hp -= damage;
	if(currentMonster.hp <= 0){
		enemyBurned = false;
		getNewEnemy();
		io.sockets.emit('newRound');
	}
	
}

getNewEnemy = function(damage){
	var enemiesRef = dataBase.ref('/enemiesSprite');
	
	//getRandomEnemy() - > retorna o nome do iimigo
	var nameEnemy = getRandomEnemy();
	enemiesRef.on('value', function(snapshot){
		snapshot.forEach(function(enemy){
			if(enemy.val().name == nameEnemy){
				currentMonster = enemy.val();
				// console.log(enemy.val());//enemy.val() inimigo selecionado randomicamente
				io.sockets.emit('getEnemy', enemy.val());
			}
		})

	})
}

// Iniciando uma conexão com Socket.IO.
io.sockets.on('connection', function (client) {
   // Recuperando uma sessão Express.
 
	//personagemEscolha-----------------------------------------\/
	client.on('tragaPersonagensModelos', function () {
		var personagemRef = dataBase.ref('/modeloPersonagem');

		personagemRef.on('value', function(snapshot){
			snapshot.forEach(function(id) {
				personagens[personagens.length] = id.val();
			});
		})
		
		/*mod = personagensModelos;*/
		client.emit('levaPersonagensModelos', personagens);
		client.broadcast.emit('levaPersonagensModelos', personagens);
	});
	
    //----------------------------------------------------------/\
	//pegaNome jogador------------------------------------------\/
	var session = client.handshake.session;

	client.on('toServer2', function (nomeJogador) {
		// console.log(nomeJogador);
		nome = nomeJogador;
	});

	client.on('toServer', function (msg) {
		msg = "<b>" + nome + ":</b> " + msg + "<br>";
		client.emit('toClient', msg);
		client.broadcast.emit('toClient', msg);
	});
	//-----------------------------------------------------------/\
	//fila-------------------------------------------------------\/
	var contExisteNaLista;
	
	client.on('userOnServer', function (jogador) {

		if(jogadores.length > 0){
			for(var i = 0; i <= jogadores.length-1; i++){
				// console.log(jogadoresRef);
				if(jogadoresRef[i].uid == jogador.uid){
					// console.log("jogadores[i].uid "+jogadores.length);
					// console.log("jogador.uid "+jogador.uid);
					contExisteNaLista = 1;
				}
			}
		}
	
	
		if(contExisteNaLista != 1){
			// console.log(jogador);
			jogadoresRef[jogadores.length] = jogador;
			jogadores[jogadores.length] = "<p id="+ jogador.uid +">" + jogador.name + "</p>";
			client.emit('userOnClient', jogadores);
			client.broadcast.emit('userOnClient', jogadores);
		}

	});
	
	client.on('devolveFila', function () {
		client.emit('filaReload', jogadores);
		client.broadcast.emit('filaReload', jogadores);
	});
	
	client.on('pedeOsPlayers', function () { 
		getNewEnemy();
		io.sockets.emit('enviaOsPlayers', jogadoresRef);
	});
	
	//-------------------------------------------------------------
	client.on('buscaPersonagens', function () { 
		var players = [];
		
		var playersRef = dataBase.ref('/personagem');
		var index = 0;
		playersRef.on('value', function(snapshot){
			snapshot.forEach(function(id) {
				players[index] = id.val();
				// console.log(players[index]);
				index++;
			});
		})
		io.sockets.emit('enviaOsPersonagens', players);
	});
	
	
	//Inimigos---------------------------------------------------\/
	client.on('buscaInimigo', function () {
		getNewEnemy();
	});
	//-----------------------------------------------------------/\
	
	client.on('getCharacter', function (uid) { 
		var personagemRef = dataBase.ref('/personagem');
		personagemRef.once('value', function(snapshot){
			snapshot.forEach(function(obj) {
				if(uid === obj.val().userId){//id do unuario igual ao id do usuario que esta no personagem

					var existingCharacter = getCharacter(uid);
					if(existingCharacter == null){
					var newPlayer = new playerInfo(uid,obj.val());
					players.push(newPlayer);
					if(players.length == 1){
						client.emit('sendCharacter', players[0].character); //envia o objeto do client
					}else{
						client.emit('sendCharacter', players[1].character); //envia o objeto do client
						client.emit('sendPartner', players[0].character);//envia 'parceiro' do client
						client.broadcast.emit('sendPartner', players[1].character); //envia 'parceiro' do outro client

						getNewEnemy();
					}
				}else{
					client.emit('sendCharacter', existingCharacter);
					if(players.length == 2){
						existingCharacter == players[0] ? client.broadcast.emit('sendPartner', players[1].character) : 
						client.broadcast.emit('sendPartner', players[0].character);
					}

				}
				}
			});
		})
		if(players.length == 2){
			getNewEnemy();
		}
	
	});
	//-------------------------------------------------------------
	

	getCharacter = function(uid){
		for(var i=0;i<players.length;i++){
			if(players[i].uid == uid){
				return players[i].character;
			}
		}
		return null;
	}

	client.on('attack', function (info) { 
		//client.emit('enviaOsPlayers', jogadoresRef);
		// console.log(info);
		attacker = getCharacter(info.uid);
		//console.log("CLASSE: " + character.class);
		if(attacker.class == "mage"){
			//damage = 
			attackMage(attacker, info.nAtaque);
		}else{
			attackWarrior(attacker, info.nAtaque);
			if(info.nAtaque == 2){
				userAttractedUid = info.uid;
			}
		}
		io.sockets.emit('enemyDamaged',currentMonster.hp);
		setTimeout(function(){
			turnCount++;
			CheckMonsterAttack();
		}, 2000);
	});

	CheckMonsterAttack = function(){
		if(turnCount>=2){
			if(enemyBurned){
				damageMonster(10);
			}
			var damage = doEnemyAttack();
			setTimeout(function(){
				io.sockets.emit('playerDamaged', getRandomPlayer(), damage);
				turnCount = 0;
				io.sockets.emit('playersTurn');
			}, 2000);
		}
	}

	client.on('passTurn', function () { 
		turnCount++;
		CheckMonsterAttack();
	});
	
	client.on('dead', function (uid) { 
		console.log(players.length);
		for(var i=0;i<players.length;i++){
			if(players[i].uid == uid){
				players.splice(i,1);
			}
		}
		console.log(players.length);
		if(players.length == 0){
			console.log('game over');
			io.sockets.emit('gameOver');
		}
		
	});

	doEnemyAttack = function(){
		console.log('destroying players!!!!!!!');

		var damage = currentMonster.power;
		var chance = getRandomInt(1,10);
		console.log('my chance' + chance)
		if(chance <= 4){
			console.log('doing sp atk');
			switch(currentMonster.SpecialAttack){
				case 1:{
					
					if(usedAttract){
						io.sockets.emit('playerDamaged', userAttractedUid, (damage*2));
					}else{
						for(var i=0;i<players.length;i++){
							io.sockets.emit('playerDamaged', players[i].uid, damage);
						}
					}
					return 0;
				}
				break;
				case 2:{
					io.sockets.emit('turnPenalty', getRandomPlayer(), getRandomInt(1,2));
				}
				break;
				case 3:{
					currentMonster.power *= 1.5;
					if(currentMonster.power > monsterDamageLimit)
						currentMonster.power = monsterDamageLimit;
				}
				break;	
			}
		}
		//setTimeout(function(){
			io.sockets.emit('actionText', 'Attack', false);

		//}, 1000);
					return damage;


		
	}

	getRandomPlayer = function(){
		if(players.length == 0){
			return;
		}
		else if(players.length == 1){
			return players[0].uid;
		}

		if(usedAttract){
			usedAttract = false;	
			return userAttractedUid;
		}

		var playerNumber = getRandomInt(3,1);
		var id = playerNumber-1;
		
		
		return players[id].uid;

	}
	
	//-------------------------------------------------------------
	//calcAtaque(atacante.uid, atacante.nAtaque);
	//-----------------------------------------------------------/\
	
	/*
	client.emit('toClient', msg);
	client.broadcast.emit('toClient', msg);
	*/
});

playerInfo = function(uid,obj){
	this.uid = uid;
	this.character = obj;

}

getRandomEnemy = function(){
	
		var enemyNumber = getRandomInt(4,1);
		//console.log("enemyNumber is : " + enemyNumber);
		var nameEnemy;
		switch(enemyNumber)   {
			case 1:
				nameEnemy = "enemy1";
				break;
			case 2:
				nameEnemy = "enemy2";                
				break;
			case 3:
				nameEnemy = "enemy3";                
				break;
			default:
				break;
		}     
	
		return nameEnemy;
	}
	

getRandomInt = function (min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}

var port = process.env.PORT || 8080;

server.listen(port, function(){
	
	console.log('run port: ' + port);
	
});


//current user -> console.log(firebase.auth().currentUser.uid);