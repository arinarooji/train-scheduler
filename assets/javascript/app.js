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

//Update values once on page load, then append to table
UpdateAllTrains();

//Update values every 10 seconds thereafter, populating table with new values
setInterval( function() {
    UpdateAllTrains();
}, 15000);

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

        //Append all LOCAL data pushed to server. Table will refesh with server's data every 10 seconds (performance). Alternatively, refresh the page.
        var newTrainRow = $("<tr><td>" + train.name + "</td><td>" + train.destination + "</td><td>" + train.frequency + " min" + "</td><td>" + train.initialTime + "</td><td>" + train.newArrival + "</td><td>" + train.minutesAway + "</td></tr>");
        $("#table-body").append(newTrainRow);
    }
});

//UPDATE ALL TRAINS: Updates all children of 'trains' in firebase once. Utilizes NewArrival()
function UpdateAllTrains() {
    //Contact 'trains' in firebase
    database.ref('trains/').once("value", snap => {
        //Iterate through children of 'trains' in firebase    
        snap.forEach(snap => {
            //Update minutesAway using current time and newArrival (using NewArrival())
            snap.ref.update({
                minutesAway: moment(snap.val().newArrival, 'HH:mm').fromNow(moment().format("HH:mm")),
                newArrival : NewArrival(snap.val().initialTime, snap.val().frequency)
            });
        });
        //Then when all values are updated... (promise)
    }).then(snap => {
        //Empty table of potentially outdated values
        $("#table-body").empty();
        //Reiterate through children of 'trains' in firebase
        snap.forEach(snap => {
            //Append all data to a table data cell, table row, and then to HTML element with id = table-body
            var newTrainRow = $("<tr><td>" + snap.val().name + "</td><td>" + snap.val().destination + "</td><td>" + snap.val().frequency + " min" + "</td><td>" + snap.val().initialTime + "</td><td>" + snap.val().newArrival + "</td><td>" + snap.val().minutesAway + "</td></tr>");
            $("#table-body").append(newTrainRow);
        })
    }, error => {
        console.log(error);
    });
}

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

