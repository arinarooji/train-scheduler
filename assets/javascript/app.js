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

  //Create a variable to reference the database
var rootRef = firebase.database().ref();
var trainsRef = rootRef.child("trains");
var newTrainRef = trainsRef.push();

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

        //APPEND FROM SERVER, NOT LOCAL
        //Append new data to table
        var trainName = $("<td>").append($("#name-input").val())
        var trainPlace = $("<td>").append($("#place-input").val());
        var trainRate = $("<td>").append(rate);
        var trainTime = $("<td>").append(convertTime(initialTime));
        var nextTrainTime = $("<td>").append(newArrival(initialTime, rate));
        //Minutes away (updates each minute)
        var newTrainRow = $("<tr>").append(trainName, trainPlace, trainRate, trainTime, nextTrainTime);
        $("#table-body").append(newTrainRow);
    }
        
});

//Convert time into Moment object using 24-hr format
function convertTime (timeString){
    timestring = moment(timeString, "HH:mm A").format("HH:mm");
    return timeString;
}

//Calculates the nextArrival time with these two parameters and the current time
function newArrival (firstArrival, frequency){
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