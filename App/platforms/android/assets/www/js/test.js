// const socket = io('http://localhost:8080');
 const socket = io('http://192.168.0.7:8080');
// const socket = io('http://179.154.248.2:8080');
// ('http://179.154.248.2:8080');


function myFunction() {
    document.getElementById("title").innerHTML = "Hello World";
    console.log(socket.connected);

    socket.emit('testthing');
    console.log(socket.connected);
}


socket.on('hellohello', (char) => {
    document.getElementById("title").innerHTML = char;
});

socket.on('disconnect', () => {
    console.log('left');
});

socket.on('connect', () => {
    console.log(socket.id); // 'G5p5...'
  });


  socket.on('error', (error) => {
    console.log('oh shiet ' + error);
  });