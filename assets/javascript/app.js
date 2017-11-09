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

//Update table when values change in the server
database.ref('trains/').on("value", snap => {
    $("#table-body").empty();
    snap.forEach(snap => {
        AppendToTable(snap.val());
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
    if (nameInput !== "" && placeInput !== "" && !isNaN(rateInput) && rateInput > 1 && rateInput < 1440 && timeInput !== "") {
        //Create a local train object with properties equal to respective input values
        var train = {
            name       : nameInput,
            destination: placeInput,
            frequency  : rateInput,
            initialTime: timeInput,
            newArrival : NewArrival(timeInput, rateInput),
            minutesAway: moment(NewArrival(timeInput, rateInput), 'HH:mm').fromNow(moment().format("HH:mm")),
        }
        //Push to server as a child of trains
        database.ref('trains/').push(train);
    }
});

//Update minutesAway every 15 seconds (accuracy)
setInterval( function() {
    database.ref('trains/').once("value", snap => {
        //Iterate through firebase
        snap.forEach(snap => {
            //Update new arrival, minutes away
            snap.ref.update({
                newArrival: NewArrival(snap.val().initialTime, snap.val().frequency),
                minutesAway: moment(snap.val().newArrival, 'HH:mm').fromNow(moment().format("HH:mm"))
            });
        });
    });
}, 15000)



//NEW ARRIVAL: Calculates the nextArrival time with these two parameters and the current time
function NewArrival(firstArrival, frequency) {
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

//AppendToTable: Appends train data to the HTML element with id = table-body
function AppendToTable(train) {
    var newTrainRow = $("<tr><td>" + train.name + "</td><td>" + train.destination + "</td><td>" + train.frequency + " min" + "</td><td>" + train.initialTime + "</td><td>" + train.newArrival + "</td><td>" + train.minutesAway + "</td></tr>");
    $("#table-body").append(newTrainRow);
}

