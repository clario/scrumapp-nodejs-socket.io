var app = require('http').createServer();
var io = require('socket.io')(app);
var express = require('express');
var cookie = require('cookie');
var cool = require('cool-ascii-faces');
var app1 = express();

app1.set('port', (process.env.PORT || 5000));

app1.get('/', function(request, response) {
  response.send(cool());
});

app.listen(8085);

console.log("Server starter på port 8085");


var personer = ["Arne","Hans","Jonas","Vegard","Lars","Anders","Martin","Erik","Silje","Petter","Roger","Sveinung","Tore","Svein","Gemma","Sofie","Ragnhild","Lasse","Ida","Jakob","Tobias","Preben"];
var numbers = [1,3,5,8,13,20,40,60,100];

var ppl = [{"name":"Richard","number":0},{"name":"Vemund","number":0}];

var sessions = [];

function checkIfSessionExist(ses){
//DOSNT exist..
if(sessions.indexOf(ses) === -1){
	sessions.push(ses);
	console.log("Session finst ikkje, legger denne til");
	return false;
}
console.log("Session finst, legger ikkje til");
return true;
}

function giRandomTall(){

	for(var i = 0; i < ppl.length; i++){

		var person =ppl[i];
		person.number = numbers[Math.floor(Math.random() * numbers.length)];
		ppl[i] = person;

	}

}

function giBestemtTall(tall){

	for(var i = 0; i < ppl.length; i++){

		var person =ppl[i];
		person.number = tall;
		ppl[i] = person;

	}

}



function addPerson(){

	var rand = personer[Math.floor(Math.random() * personer.length)];
		var per = {"name" : rand, "number" : 0};
	ppl.push(per);
	return ppl;
};

io.on('connection', function (socket) {
 console.log("En bruker koblet til.");
console.log(socket.request.headers.cookie);
 var iden = socket.id;
console.log("han har: " + iden);
  

  socket.on('send', function (data) {
  	console.log("Tar imot data");
    console.log(data.username);
    console.log(data);
    if(!checkIfSessionExist(socket.id)){
    	addPerson();
    }
    
    console.log("sender flg liste: " + JSON.stringify(ppl));
  	console.log(ppl.length);
    
    io.emit("newList",ppl);


  });

  socket.on("setNumber",function(data){
		giBestemtTall(data.number);
		 io.emit("newList",ppl);

  });

  socket.on("random" ,function(){

  	giRandomTall();
  	 io.emit("newList",ppl);
  })

   socket.on('hello', function (data) {
    console.log("apekatt")
    
  });


 });