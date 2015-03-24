var fs = require('fs');
var index = fs.readFileSync('index.html');
var app = require('http').createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(index);
});
var io = require('socket.io')(app);



var port = process.env.PORT || 5000;

app.listen(port);





console.log("Server starter på port 8085");

var hide = false;

var personer = ["Arne","Hans","Jonas","Vegard","Lars","Anders","Martin","Erik","Silje","Petter","Roger","Sveinung","Tore","Svein","Gemma","Sofie","Ragnhild","Lasse","Ida","Jakob","Tobias","Preben"];
var numbers = [1,3,5,8,13,20,40,60,100];

//var ppl = [{"name":"Richard","number":0, "ses":""},{"name":"Vemund","number":0,"ses":""}];
var ppl = [];

var sessions = [];

function checkIfExist(ses){
	for(var i = 0; i < ppl.length; i++){
		if(ppl[i].ses === ses){
			return i;
		}

	}
	return -1;
}



function setNumberOnUser(number,ses){
	
	var index = checkIfExist(ses); 
	if(index !== -1){
		ppl[index].number = number;
		console.log("Setter " + number + " på bruker " + ppl.name);
		return ppl;
	}else{
		console.log("session finst ikkje!");
	}


}

function setNameOnUser(name,ses){
	
	var index = checkIfExist(ses); 
	if(index !== -1){
		ppl[index].name = name;
		console.log("Setter " + name + " på bruker " + ppl.name);
		return ppl;
	}else{
		console.log("session finst ikkje!");
	}


}

function checkIfSessionExist(ses){
//DOSNT exist..
if(checkIfExist(ses) === -1){
	
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

function addPerson(ses){
	console.log(ses);
	var rand = personer[Math.floor(Math.random() * personer.length)];
		var per = {"name" : rand, "number" : 0,"ses":ses};
	ppl.push(per);
	return ppl;
};

function randomString(){
	var a = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
});
	return a;
}

function leggTilCookie(socket){
	var date = new Date();
		    date.setTime(date.getTime()+(1*24*60*60*1000)); // set day value to expiry
			//date = new Date("Thu, 01 Jan 1970 00:00:00 UTC");
		    var expires = "; expires="+date.toGMTString();
		   	var randomSomething = randomString();
		   // socket.request.headers.cookie = name+"="+socket.id+expires+"; path=/";
		   	var cookie = {"cookieValue" : randomSomething, "expires": date};

		   	//console.log("Sender cookie " + JSON.stringify(cookie));

		   	socket.emit("setCookie",cookie);

		   	var cookieStringen = "user="+randomSomething;
		   io.emit("newList",pa);
		   socket.request.headers.cookie = 'user=' + randomSomething+'; expires='+ expires+'; path=/';
		   	var pa = addPerson(cookieStringen);
		   

}


io.on('connection', function (socket) {
	//console.log(sessions.length);
	//console.log(sessions.join());
	var userCookie = socket.request.headers.cookie;
	if(userCookie){

	var index = userCookie.indexOf("user=");
 	//console.log("indeksen er " + index);
 	var uCookie = userCookie.substring(index, userCookie.length);
 	//console.log(socket.request.headers.cookie); 		

	}
 

 	//Bruker har ingen cookie
 	if(index === -1 ){
 			var date = new Date();
		    date.setTime(date.getTime()+(1*24*60*60*1000)); // set day value to expiry
			//date = new Date("Thu, 01 Jan 1970 00:00:00 UTC");
		    var expires = "; expires="+date.toGMTString();
		   	var randomSomething = randomString();
		   // socket.request.headers.cookie = name+"="+socket.id+expires+"; path=/";
		   	var cookie = {"cookieValue" : randomSomething, "expires": date};

		   	//console.log("Sender cookie " + JSON.stringify(cookie));

		   	socket.emit("setCookie",cookie);

		   	var cookieStringen = "user="+randomSomething;
		   io.emit("newList",pa);
		   socket.request.headers.cookie = 'user=' + randomSomething+'; expires='+ expires+'; path=/';
		   	var pa = addPerson(cookieStringen);
		   
		   	
		
 	}else if(index !== -1 && checkIfExist(uCookie) === -1){
 		leggTilCookie(socket);

 	}else{
 		console.log("Er denne session lagret i minne ? " + checkIfSessionExist(uCookie));
 	}
 	
 	socket.emit("toogleHide",{"hide":hide});

 	//console.log("En bruker koblet til.");
 	


//	var iden = socket.id;
//	console.log("han har: " + iden);
  

  	socket.on('send', function (data) {
  	//	console.log("Tar imot data");
   	//	console.log(data.username);
    //	console.log(data);
   		//if(!checkIfSessionExist(socket.id)){
    	//	addPerson();
  		//}
    
    	//console.log("sender flg liste: " + JSON.stringify(ppl));
  		//console.log(ppl.length);
    
    	io.emit("newList",ppl);


  });

  		socket.on('toogleHide', function () {
  		hide = !hide;
    	if(!hide){
    		
    		io.emit("toogleHide",{"hide":hide});
    	}else{
    		io.emit("toogleHide",{"hide":hide});
    		
    	}
    	


  });


  			socket.on('restart', function () {

    		hide = false
    		io.emit("toogleHide",{"hide":hide});
    		giBestemtTall(0);
    		io.emit("newList",ppl);
    
 			 });




  	socket.on("setNumber",function(data){
  	//	console.log("Setting number" + data.number);

  var userCookie = socket.request.headers.cookie;
	

	var index = userCookie.indexOf("user=");
 	//console.log("indeksen er " + index);
 //	console.log(userCookie);
 	var uCookie = userCookie.substring(index, userCookie.length);

 		console.log(uCookie);
 	//	console.log(data.number + " " + uCookie);
  		setNumberOnUser(data.number, uCookie);
  		//giBestemtTall(data.number);
		io.emit("newList",ppl);

  	});


  	 socket.on("setName",function(data){
  		//	console.log("Setting number" + data.number);

		  var userCookie = socket.request.headers.cookie;
	

		var index = userCookie.indexOf("user=");
 		var uCookie = userCookie.substring(index, userCookie.length);

 		console.log(uCookie);
  		setNameOnUser(data.nameOnPerson, uCookie);
		io.emit("newList",ppl);

  	});

  	socket.on("random" ,function(){

  		giRandomTall();
  		io.emit("newList",ppl);
  	})



 });