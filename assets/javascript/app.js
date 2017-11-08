/*TO DO
    Minutes away must calculate in minutes only (>45 shows as a day)
    Responsiveness (Overflow scroll)
    Styling
*/

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
var database = firebase.database();

//Update newArrival/minutesAway for all trains in database when page loads
//Old trains will have updated arrival times...
database.ref('trains/').once("value", snap => {
    snap.forEach(snap => {
        snap.ref.update({
            newArrival : newArrival(snap.val().initialTime, snap.val().frequency),
            minutesAway: moment(snap.val().newArrival, 'HH:mm').fromNow(moment().format("HH:mm"))
        });
    });
});

//Update table when values change in the server
database.ref('trains/').on("value", snap => {
    $("#table-body").empty();
    snap.forEach(snap => {
        appender(snap.val());
    });
});

//On button click...
$(".btn").on("click", function () {
    //Reference all input fields
    var nameInput  = $("#name-input").val().trim();
    var placeInput = $("#place-input").val().trim();
    var rateInput  = parseInt($("#rate-input").val().trim());
    var timeInput  = $("#time-input").val().trim();

    //If all fields are entered correctly...
    if (nameInput !== "" && placeInput !== "" && !isNaN(rateInput) && timeInput !== "") {
        //Create a local train object with properties equal to respective input values
        var train = {
            name       : nameInput,
            destination: placeInput,
            frequency  : rateInput,
            initialTime: timeInput,
            newArrival : newArrival(timeInput, rateInput),
            minutesAway: moment(newArrival(timeInput, rateInput), 'HH:mm').fromNow(moment().format("HH:mm")),
        }
        //Push to server as a child of trains
        database.ref('trains/').push(train);
    }

});

//Update minutesAway every 15 seconds (accuracy)
setInterval( function() {
    //Reference current time
    var current = moment().format("HH:mm");
    database.ref('trains/').once("value", snap => {
        //Iterate through firebase
        snap.forEach(snap => {
            //Reference time left for current train
            var timeLeft = moment(snap.val().newArrival, 'HH:mm').fromNow(current);
            //If a few seconds left, update new arrival time
            if (timeLeft === 'a few seconds') {
                snap.ref.update({
                    newArrival: moment(snap.val().newArrival, "HH:mm").add(snap.val().frequency, "minutes").format("HH:mm")
                });
            }
            //Update minutes away
            snap.ref.update({
                minutesAway: moment(snap.val().newArrival, 'HH:mm').fromNow(moment().format("HH:mm"))
            });
        });
    });
}, 15000)

//CONVERT TIME: Convert time into Moment object using 24-hr format
function convertTime(timeString) {
    timestring = moment(timeString, "HH:mm").format("HH:mm");
    return timeString;
}

//NEW ARRIVAL: Calculates the nextArrival time with these two parameters and the current time
function newArrival(firstArrival, frequency) {
    //Calculate next arrival based on initial time/rate, get current time
    var nextArrival = moment(firstArrival, "HH:mm").add(frequency, "minutes").format("HH:mm");
    var current     = moment().format("HH:mm");

    //Replace colon with decimal point for parseFloat, number comparison purposes
    var convertNext    = nextArrival.replace(":", ".");
    var convertCurrent = current.replace(":", ".");

    //Write times as a decimal number (i.e. 13:02 will be 13.02)
    var nextDecimal    = parseFloat(convertNext);
    var currentDecimal = parseFloat(convertCurrent);

    //While current time is ahead of next arrival time...
    while (currentDecimal > nextDecimal) {
        //Continuously update until nextArrival is ahead of current time
        nextArrival = moment(nextArrival, "HH:mm").add(frequency, "minutes").format("HH:mm");
        convertNext = nextArrival.replace(":", ".");
        nextDecimal = parseFloat(convertNext);
    }
    //Return updated arrival time
    return nextArrival;
}

//APPENDER
//Appends train data to the HTML table body
function appender(train) {
    //Create a data cell for each variable
    var name        = $("<td>").append(train.name);
    var destination = $("<td>").append(train.destination);
    var frequency   = $("<td>").append(train.frequency);
    var initialTime = $("<td>").append(train.initialTime);
    var newArrival  = $("<td>").append(train.newArrival);
    var minutesAway = $("<td>").append(train.minutesAway);

    //Append all data to row in correct order
    var newTrainRow = $("<tr>").append(name, destination, frequency, initialTime, newArrival, minutesAway);

    //All data in correct order goes to the table body
    $("#table-body").append(newTrainRow);
}