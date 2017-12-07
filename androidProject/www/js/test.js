// const socket = io('http://localhost:8080');

//unisinos
 const socket = io.connect('http://multiplataforma-gb-gabrielfazenda.c9users.io/');
 



//4g
// const socket = io('http:///192.168.43.94:8080');
// ('http://179.154.248.2:8080');

// const socket = io.connect();

function myFunction() {
    // if(socket == undefined){
    //     socket = io.connect('http://191.4.103.21:8080');
    // }
    document.getElementById("title").innerHTML = "Hello World";
    // console.log(socket.connected);
    document.getElementById("logs").innerHTML += '<br>' + socket.connected;
    socket.emit('testthing','ulala');
    console.log(socket.connected);
}

function myTest() {
    document.getElementById("title").innerHTML = "i work";
}

function GoLogIn() {
   window.location.href = 'home.html'; 
}

socket.on('hellohello', (char) => {
    document.getElementById("title").innerHTML = char;
});

socket.on('disconnect', () => {
    console.log('left');
});

socket.on('connect', () => {
    document.getElementById("logs").innerHTML += '<br>' + socket.id;
    // console.log(socket.id); // 'G5p5...'
  });


  socket.on('error', (error) => {
    document.getElementById("logs").innerHTML += '<br>' + ('oh shiet ' + error);
    console.log('oh shiet ' + error);
  });