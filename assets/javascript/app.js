// Initialize Firebase
var config = {
    apiKey: "AIzaSyDULhMRgwWmnuikc1SEhioUHTgdRhMZYy0",
    authDomain: "kaa-train-schedule.firebaseapp.com",
    databaseURL: "https://kaa-train-schedule.firebaseio.com",
    projectId: "kaa-train-schedule",
    storageBucket: "",
    messagingSenderId: "731375124025"
};
firebase.initializeApp(config);

//Reference the database
var rootRef = firebase.database().ref();
//Reference the root's child
var trainsRef = rootRef.child("trains");
//Variable to push new train as a child of "trains"
var newTrainRef = trainsRef.push();

//Update table when values change in the server
trainsRef.on("value", snap => {
    $("#table-body").empty();
    snap.forEach(snap => {
        appender(snap.val());
    });
});

//On button click...
$(".btn").on("click", function(){
    //Get input from the user, ensuring all values entered (input)
    if ($("input").val().trim() !== "" && $("#time-input").val() !== ""){
        //Store time string and rate integer from HTML
        var initialTime = $("#time-input").val();
        var rate = $("#rate-input").val();
        
        //Push the new train data to the server using necessary functions
        newTrainRef.set({
            name: $("#name-input").val(),
            destination: $("#place-input").val(),
            frequency: $("#rate-input").val(),
            initialTime: convertTime(initialTime),
            newArrival: newArrival(initialTime, rate)
            //timeRemaining (updates each minute)
        });
    }
});


/*FUNCTIONS USED*/

//CONVERT TIME
//Convert time into Moment object using 24-hr format
function convertTime (timeString) {
    timestring = moment(timeString, "HH:mm A").format("HH:mm");
    return timeString;
}

//NEW ARRIVAL
//Calculates the nextArrival time with these two parameters and the current time
function newArrival (firstArrival, frequency) {
    //Calculate next arrival based on initial time/rate, get current time
    var nextArrival = moment(firstArrival, "HH:mm").add(frequency, "minutes").format("HH:mm A");
    var current = moment().format("HH:mm A");
    //Replace colon with decimal point for parseFloat, number comparison purposes
    var convertNext = nextArrival.replace(":", ".");
    var convertCurrent = current.replace(":", ".");
    //Write times as a decimal number (i.e. 13:02 will be 13.02)
    var nextDecimal = parseFloat(convertNext);
    var currentDecimal = parseFloat(convertCurrent);
    //If current time is ahead of next arrival time...
    while(currentDecimal > nextDecimal){
        //Continuously update until nextArrival is ahead of current time
        nextArrival = moment(nextArrival, "HH:mm").add(frequency, "minutes").format("HH:mm");
        convertNext = nextArrival.replace(":", ".");
        nextDecimal = parseFloat(convertNext);
    }
    //Return updated arrival time
    return nextArrival;
}

/*TIME LEFT
//Calculates the time remaining between a start and endpoint in a space-time continuum flux capacitor simulation
function timeLeft(start, end) {
    
}*/

//APPENDER
//Appends train data to the HTML table body
function appender(train) {
    var name        = $("<td>").append(train.name);
    var destination = $("<td>").append(train.destination);
    var frequency   = $("<td>").append(train.frequency);
    var initialTime = $("<td>").append(train.initialTime);
    var newArrival  = $("<td>").append(train.newArrival);
    //AND minutes away (duration?)
    //Append all data to row in correct order
    var newTrainRow = $("<tr>").append(name, destination, frequency, initialTime, newArrival);
    //All data in correct order goes to the table body
    $("#table-body").append(newTrainRow);
}