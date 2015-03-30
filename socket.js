var fs = require('fs');
var index = fs.readFileSync('index.html');
var app = require('http').createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});
var io = require('socket.io')(app);



var port = process.env.PORT || 5000;

app.listen(port);

console.log("Server starter på port "+port+".");

var hide = true;

var personer = ["Arne", "Hans", "Jonas", "Vegard", "Lars", "Anders", "Martin", "Erik", "Silje", "Petter", "Roger", "Sveinung", "Tore", "Svein", "Gemma", "Sofie", "Ragnhild", "Lasse", "Ida", "Jakob", "Tobias", "Preben"];
var numbers = [1, 3, 5, 8, 13, 20, 40, 60, 100];

//var ppl = [{"name":"Richard","number":0, "ses":""},{"name":"Vemund","number":0,"ses":""}];
var ppl = [];

var sessions = [];

var currentActiveUsers = 0;


function checkIfExist(ses) {
    console.log("checking if sess exist, input: " + ses )
    for (var i = 0; i < ppl.length; i++) {
        console.log(ppl[i].ses);
        if (ppl[i].ses === ses) {
            console.log("The user exist!")
            return i;
        }
    }
    return -1;
}

function setNumberOnUser(number, ses) {

    var index = checkIfExist(ses);
    if (index !== -1) {
        ppl[index].number = number;
        console.log("Setter " + number + " på bruker " + ppl[index].name);
        return ppl;
    } else {
        console.log("session dosnt exist!");
    }
}

function setNameOnUser(name, ses) {

    var index = checkIfExist(ses);
    if (index !== -1) {
        ppl[index].name = name;
        console.log("Setter " + name + " på bruker " + ppl[index].name);
        return ppl;
    } else {
        console.log("session dosnt exist!");
    }
}


function giRandomTall() {
    for (var i = 0; i < ppl.length; i++) {

        var person = ppl[i];
        person.number = numbers[Math.floor(Math.random() * numbers.length)];
        ppl[i] = person;

    }
}

function setNumberOnAll(tall) {
    for (var i = 0; i < ppl.length; i++) {

        var person = ppl[i];
        person.number = tall;
        ppl[i] = person;
    }
}

function addPerson(ses) {
    console.log(ses);
    var randomPerson = personer[Math.floor(Math.random() * personer.length)];
    var now = new Date().getTime();
    var per = {"name": randomPerson, "number": 0, "ses": ses, "lastActive": now};
    ppl.push(per);
    return ppl;
};

function updateLastActive(ses){
    var oldValue = currentActiveUsers;
    var index = checkIfExist(ses);
    if(index !== -1){
        var now = new Date().getTime();
        ppl[index].lastActive = now;
    }
    var newPpl = getLastActive();
    var newValue = currentActiveUsers;
    if(oldValue !== newValue){
         io.emit("newList", newPpl);
    }
}

function getLastActive(){
    var array = [];
   // var fiveMinutes = 300000;
    var twoMinutes = 120000;
    var size = ppl.length;
    var active = 0; 

    for(var i = 0; i < ppl.length; i++){
        var now = new Date().getTime();
        var userTime = ppl[i].lastActive+twoMinutes;
        if(userTime > now ){
            array.push(ppl[i]);
            active++;
        }

    }
    currentActiveUsers = active;
    //console.log("Number of active users: " + active + "/" + size);
    return array;
}

function randomString() {
    var a = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    return a;
}


function userGotCookie(socket){

     var userCookie = socket.request.headers.cookie;
    console.log(userCookie);
    var uCookie;
    var index = -1;
    if (userCookie != null) {
        index = userCookie.indexOf("user=");
        //console.log("indeksen er " + index);
        uCookie = userCookie.substring(index, userCookie.length);
        //console.log(socket.request.headers.cookie);
    }

    if(index !== -1){
        return true;
    }else{
        return false;
    }
}


function addCookie(socket) {
    var date = new Date();
    date.setTime(date.getTime() + (1 * 24 * 60 * 60 * 1000)); // set day value to expiry
    //date = new Date("Thu, 01 Jan 1970 00:00:00 UTC");
    var expires = "; expires=" + date.toGMTString();
    var randomSomething = randomString();
    // socket.request.headers.cookie = name+"="+socket.id+expires+"; path=/";
    var cookie = {"cookieValue": randomSomething, "expires": date};

    //console.log("Sender cookie " + JSON.stringify(cookie));
    socket.emit("setCookie", cookie);

    var cookieStringen = "user=" + randomSomething;
    //io.emit("newList", pa);
   // socket.request.headers.cookie = 'user=' + randomSomething + '; expires=' + expires + '; path=/';

    addPerson(cookieStringen);

}


io.on('connection', function (socket) {
    
    setInterval(function() {
     socket.emit("areYouThere",{});
    }, 60 * 1000);

    var userCookie = socket.request.headers.cookie;
    console.log(userCookie);
    var uCookie;
    var index = -1;
    if (userCookie != null) {
        index = userCookie.indexOf("user=");
        uCookie = userCookie.substring(index, userCookie.length);
    }


    //User does not have any cookie!
    if (index === -1 || userCookie === null) {
        console.log("User dont have a cookie!")
         addCookie(socket);

       //The user is known, settting him as active.
    } else if(checkIfExist(uCookie) !== -1){
        updateLastActive(uCookie);
        //The user is not known, adding him.
    } else if(checkIfExist(uCookie) === -1){
        addPerson(uCookie);
    }

    console.log("sender ut hide som har følgande verdi: " + hide);

    socket.emit("toggleHide", {"hide": hide});
    var tempppl = getLastActive();
     io.emit("newList", tempppl);


    socket.on('send', function (data) {
        var tempppl = getLastActive();
        io.emit("newList", tempppl);

    });

    socket.on('toggleHide', function () {
        hide = !hide;
        io.emit("toggleHide", {"hide": hide});
 
    });


    socket.on('restart', function () {
        console.log("Restarting!");
        hide = true
        io.emit("toggleHide", {"hide": hide});
        setNumberOnAll(0);
        var tempppl = getLastActive();
        io.emit("newList", tempppl);
    });


    socket.on("setNumber", function (data) {
        //	console.log("Setting number" + data.number);

        var userCookie = socket.request.headers.cookie;

        console.log(userCookie);
        var index = userCookie.indexOf("user=");
        //console.log("indeksen er " + index);
        //	console.log(userCookie);
        var uCookie = userCookie.substring(index, userCookie.length);

        console.log(uCookie);
        //Before user=cb50446e-1e11-4372-9156-b249f2c4e3b1; expires=; expires=Thu, 26 Mar 2015 21:25:21 GMT; path=/
        //After user=cb50446e-1e11-4372-9156-b249f2c4e3b1
        uCookie = uCookie.substring(0,41);
        setNumberOnUser(data.number, uCookie);
         var tempppl = getLastActive();

        io.emit("newList", tempppl);

    });

    socket.on("setName", function (data) {
        //	console.log("Setting number" + data.number);

        var userCookie = socket.request.headers.cookie;
        var index = userCookie.indexOf("user=");
        var uCookie = userCookie.substring(index, userCookie.length);

        console.log(uCookie);
        //Before user=cb50446e-1e11-4372-9156-b249f2c4e3b1; expires=; expires=Thu, 26 Mar 2015 21:25:21 GMT; path=/
        //After user=cb50446e-1e11-4372-9156-b249f2c4e3b1
        uCookie = uCookie.substring(0,41);
        setNameOnUser(data.nameOnPerson, uCookie);
         var tempppl = getLastActive();
        io.emit("newList", tempppl);

    });

    socket.on("yesIamHere",function(data){
        
        var userCookie = socket.request.headers.cookie;
        var index = userCookie.indexOf("user=");
        var uCookie = userCookie.substring(index, userCookie.length);
        console.log(uCookie);
        //Before user=cb50446e-1e11-4372-9156-b249f2c4e3b1; expires=; expires=Thu, 26 Mar 2015 21:25:21 GMT; path=/
        //After user=cb50446e-1e11-4372-9156-b249f2c4e3b1
        uCookie = uCookie.substring(0,41);
        updateLastActive(uCookie);
    })

});