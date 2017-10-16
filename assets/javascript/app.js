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



//Get input from the user, ensuring all values entered (input)
$(".btn").on("click", function(){
    if ($("input").val().trim() !== "" && $("#time-input").val() !== ""){
        //Store time string and rate integer from HTML
        var initialTime = $("#time-input").val();
        var rate = $("#rate-input").val();

        //Convert time to military format
        convertTime(initialTime);
        //Calculate next arrival
        newArrival(initialTime, rate);
        
        //Push the new train data to the server
        newTrainRef.set({
            name: $("#name-input").val(),
            destination: $("#place-input").val(),
            frequency: $("#rate-input").val(),
            initialTime: initialTime,
            //Calculate minutes away
            //timeRemaining: moment(initialTime).add()
        });
        //Append new data to the table
        var trainName = $("<td>").append($("#name-input").val())
        var trainPlace = $("<td>").append($("#place-input").val());
        var trainRate = $("<td>").append(rate);
        var trainTime = initialTime;
        //Next Arrival
        //Minutes away
        var newTrainRow = $("<tr>").append(trainName, trainPlace, trainRate, trainTime);
        $("#table-body").append(newTrainRow);
    }
        
});

//Convert time into Moment object using 2400 format
function convertTime (timeString){
    timestring = moment(timeString, "HH:mm A").format("HH:mm");
    return timeString;
}
//Add
//var newTime = moment(militaryTime, "HH:mm").add(rate, "minutes").format("LT");

//Calc next arrival
//initial time + rate = next arrival
//if current time ahead of next arrival, next arrival += rate

function newArrival (initialTime, rate){
    var nextArrival = moment(initialTime, "HH:mm").add(rate, "minutes").format("LT");
    if(moment().isAfter(nextArrival, "hours")){
        nextArrival = moment(initialTime, "HH:mm").add(rate, "minutes").format("LT");
        console.log("YEs");
    }
    console.log(nextArrival);
    return nextArrival;
    
}