var fs = require('fs');
var index = fs.readFileSync('index.html');
var app = require('http').createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});
var io = require('socket.io')(app);

var port = process.env.PORT || 5000;

app.listen(port);

console.log("Server starting on port "+port+".");
var hide = true;
var personer = ["Arne", "Hans", "Jonas", "Vegard", "Lars", "Anders", "Martin", "Erik", "Silje", "Petter", "Roger", "Sveinung", "Tore", "Svein", "Gemma", "Sofie", "Nils", "Lasse", "Ida", "Jakob", "Tobias", "Preben"];
var numbers = [1, 3, 5, 8, 13, 20, 40, 60, 100];
var ppl = [];
var tempSessionMap = {};


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
    //Check the tempSessionMap
    console.log("Her er utgangspunktet: " + ses);
    if(tempSessionMap[ses]){
        console.log("fann denn her " +  tempSessionMap[ses])
       var tempIndex = checkIfExist(tempSessionMap[ses])
        return tempIndex;
    }

    return -1;
}

function setNumberOnUser(number, ses) {
    console.log(JSON.stringify(ses));
    console.log(ses);
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
    var per = {"name": randomPerson, "number": 0, "ses": ses, "lastActive": now, "highest" : false, "lowest" : false};
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

    array = getLowestAndHighest(array);

    //console.log("Number of active users: " + active + "/" + size);
    return array;
}

function getLowestAndHighest(array){

    var highestValue = 0;
    var lowestValue = 100;

    if(array.length > 1){
        for(var i = 0; i < array.length; i++){
            if(array[i].number > highestValue){
                highestValue = array[i].number;
            } if(array[i].number < lowestValue){
                lowestValue = array[i].number;
            }
        }

        if(highestValue !== lowestValue){
            var numberUsersWithHighest = usersWithNumber(array,highestValue);
            var numberUsersWithLowest = usersWithNumber(array,lowestValue);
           
            if(numberUsersWithLowest === 1 || numberUsersWithHighest === 1){

                for(var i = 0; i < array.length; i++){
                    if(array[i].number === highestValue && numberUsersWithHighest === 1){
                        array[i].highest = true;
                    }else{
                        array[i].highest = false;
                    }
                    if(array[i].number === lowestValue && numberUsersWithLowest === 1){
                        array[i].lowest = true;
                    }else{
                        array[i].lowest = false;
                    }
                }
            }

            }else{

                for(var i = 0; i < array.length; i++){
                    array[i].highest = false;
                    array[i].lowest = false;
                 }
            }
    }
   
    return array;

}


function usersWithNumber(array,number){
    
    var count = 0;
    for(var i = 0; i < array.length; i++){
        if(array[i].number === number){
            count++;
        }
    }
    return count;
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

function addToTempArray(socket,cookie){

        var userCookie = socket.request.headers.cookie;
        console.log("setNumber " + userCookie);
        var index = userCookie.indexOf("io=");
       var currentUserCookie = userCookie.substring(index, userCookie.length);
        console.log("Ny funksjon " + userCookie + " la til denne " + cookie);

        tempSessionMap[currentUserCookie] = cookie;
}


function addCookie(socket) {
    var date = new Date();
    date.setTime(date.getTime() + (2 * 24 * 60 * 60 * 1000)); // set day value to expiry
    //date = new Date("Thu, 01 Jan 1970 00:00:00 UTC");
    var expires = "; expires=" + date.toGMTString();
    var randomSomething = randomString();
    // socket.request.headers.cookie = name+"="+socket.id+expires+"; path=/";
    var cookie = {"cookieValue": randomSomething, "expires": date};

    //console.log("Sender cookie " + JSON.stringify(cookie));
    console.log("Sender cookie til klient "  + JSON.stringify(cookie));
    socket.emit("setCookie", cookie);

     var cookieStringen = "user=" + randomSomething;

    console.log(cookieStringen + "  er cookieStringen");
    //io.emit("newList", pa);
   // socket.request.headers.cookie = 'user=' + randomSomething + '; expires=' + expires + '; path=/';


    addPerson(cookieStringen);
    return cookieStringen;
}


io.on('connection', function (socket) {
    console.log("heiii");
    setInterval(function() {
     socket.emit("areYouThere",{});
    }, 60 * 1000);

    var userCookie = socket.request.headers.cookie;
    console.log("Denne er der no: " +  userCookie);
    var uCookie;
    var index = -1;
    if (userCookie != null) {
        index = userCookie.indexOf("user=");
        uCookie = userCookie.substring(index, userCookie.length);
    }


    //User does not have any cookie!
    if (index === -1 || userCookie === null) {
        console.log("User dont have a cookie!")
         var cookieValue = addCookie(socket);
         //fixing the refresh bug
         addToTempArray(socket,cookieValue);

       //The user is known, settting him as active.
    } else if(checkIfExist(uCookie) !== -1){
        updateLastActive(uCookie);
        //The user is not known, adding him.
    } else if(checkIfExist(uCookie) === -1){
        addPerson(uCookie);
    }

    

    socket.emit("toggleHide", {"hide": hide});
   // console.log("Bruker koblet til, Hide har følgande verdi: " + hide)
    var tempppl = getLastActive();
     io.emit("newList", tempppl);


    socket.on('send', function (data) {
        var tempppl = getLastActive();
        io.emit("newList", tempppl);

    });

    socket.on('toggleHide', function () {
          var tempppl = getLastActive();
         io.emit("newList", tempppl);
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

        console.log("setNumber " + userCookie);
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