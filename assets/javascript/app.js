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
    if ($("input").val().trim() !== ""){
        //Push the new train data to the server
        newTrainRef.set({
            name: $("#name-input").val(),
            destination: $("#name-input").val(),
            initialTime: $("#time-input").val(),
            frequency: $("#rate-input").val()
        });
    }
        
});