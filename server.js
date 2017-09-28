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

	// var restaurantRef = dataBase.ref('/personagem');
	// restaurantRef.once('value', function(snapshot){
		// //console.log(snapshot.val());
		// var snap = req.body.snapshot.val();
		// console.log(snap);

	// })
});

//personagemEscolha-----------------------------------------\/
var presonagens = [];
//----------------------------------------------------------/\

var jogadores = [];
var jogadoresRef = [];
var poder;

// Iniciando uma conexão com Socket.IO.
io.sockets.on('connection', function (client) {
   // Recuperando uma sessão Express.
   
	
	//personagemEscolha-----------------------------------------\/
	client.on('tragaPersonagensModelos', function () {
		var personagemRef = dataBase.ref('/players');

		personagemRef.on('value', function(snapshot){
			snapshot.forEach(function(id) {
				presonagens[presonagens.length] = id.val();
			});
		})
		
		/*mod = personagensModelos;*/
		client.emit('levaPersonagensModelos', presonagens);
		client.broadcast.emit('levaPersonagensModelos', presonagens);
	});
	
    //----------------------------------------------------------/\
	//pegaNome jogador------------------------------------------\/
	var session = client.handshake.session;

	client.on('toServer2', function (nomeJogador) {
		console.log(nomeJogador);
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
				console.log(jogadoresRef);
				if(jogadoresRef[i].uid == jogador.uid){
					console.log("jogadores[i].uid "+jogadores.length);
					console.log("jogador.uid "+jogador.uid);
					contExisteNaLista = 1;
				}
			}
		}
	
	
		if(contExisteNaLista != 1){
			console.log(jogador);
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
	//-----------------------------------------------------------/\
	
	//jogo-------------------------------------------------------\/
	
	client.on('enviaAtacanteAtaque', function (atacante) { // calclar dano e verificar quem esta atacando atacando
		//console.log(atacante.uid);
		//console.log(atacante.nAtaque);
		//console.log(atacante.turno);
		pegaPersonagem(atacante.uid);
		
		if(atacante.nAtaque == 1){
			poder = poder + (poder/10)
		}else if(atacante.nAtaque == 2){
			poder = poder + (poder*0.5)
		}else if(atacante.nAtaque == 3){
			poder = poder*2
		}
		
		console.log(poder)
		
		client.emit('turno', atacante.turno);
	});
	//-------------------------------------------------------------
	
	client.on('pedeOsPlayers', function () { 
		client.emit('enviaOsPlayers', jogadoresRef);
		client.broadcast.emit('enviaOsPlayers', jogadoresRef);
	});
	
	//-------------------------------------------------------------
	client.on('buscaPersonagens', function () { 
		var players = [];
		
		var playersRef = dataBase.ref('/personagem');
		
		playersRef.on('value', function(snapshot){
			snapshot.forEach(function(id) {
				players[players.length] = id.val();
				console.log(players[players.length]);
			});
		})
		
		console.log(players);
		client.emit('enviaOsPersonagens', players);
		client.broadcast.emit('enviaOsPersonagens', players);

	});
	
	//Inimigos---------------------------------------------------\/
	client.on('buscaInimigo', function () {
		console.log("TESTE");
		
		var enemiesRef = dataBase.ref('/enemiesSprite');
		
		//getRandomEnemy() - > retorna o nome do iimigo
		var nameEnemy = getRandomEnemy();
		enemiesRef.on('value', function(snapshot){
			snapshot.forEach(function(enemy){
				if(enemy.val().name == nameEnemy){
					console.log(enemy.val());//enemy.val() inimigo selecionado randomicamente
					client.emit('trazInimigo', enemy.val());
					client.broadcast.emit('trazInimigo', enemy.val());
				}
			})

		})
	});

	client.on('teste', function(){
		console.log("MDS");
	});
	//-----------------------------------------------------------/\
	
	//-------------------------------------------------------------
	
	client.on('attack', function (character, numberAttack) { 
		//client.emit('enviaOsPlayers', jogadoresRef);
		
		var damage;
		
		switch(character.class){
			
			case mage:
			
				damage = attackMage(character, numberAttack);
				break;
			
			case warrior:
			
				break;
				
			default:
				
				break;
		}
		client.broadcast.emit('sendAttack', damage);
	});

	
	
	//-------------------------------------------------------------
	//calcAtaque(atacante.uid, atacante.nAtaque);
	//-----------------------------------------------------------/\
	
	/*
	client.emit('toClient', msg);
	client.broadcast.emit('toClient', msg);
	*/
});
 
var x;
var a = function(){
	function b(){
		x = 'c'
	}
	
}
console.log(x);

attackMage = function(mage, numberAttack){
	
	//MAGE
	// 1 - Ataque Básico
	// 2 - Poder de cura
	// 3 - Corta o dano do inimigo em X% / Aumenta dano do cavaleiro em X%
	// 4 - Bola de fogo (queima inimigo, dano por turno)
	
	var damage = mage.power;

	switch(numberAttack){
			
			case 1:
				
				return damage;
				break;
			
			case 2:
			
				
				break;
			
			case 3:
			
				break;
			
			case 4:
			
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
		
	switch(numberAttack){
			
			case 1:
			
				break;
			
			case 2:
			
				break;
			
			case 3:
			
				break;
				
			default:
				
				break;
		}

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

pegaPersonagem = function(usuarioId){
	var personagemRef = dataBase.ref('/personagem');

	personagemRef.once('value', function(snapshot){
		snapshot.forEach(function(id) {
			if(usuarioId === id.val().userId){//id do unuario igual ao id do usuario que esta no personagem
				poder = id.val().poder;
			}
		});
	})

}

var port = process.env.PORT || 8080;

server.listen(port, function(){
	
	console.log('run port: ' + port);
	
});


//current user -> console.log(firebase.auth().currentUser.uid);