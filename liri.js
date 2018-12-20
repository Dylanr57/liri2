require("dotenv").config();

var Spotify = require("node-spotify-api");
var inquirer = require("inquirer");
var fs = require("fs");
var axios = require("axios");
var moment = require("moment");

var keys = require("./keys.js");

var spotify = new Spotify(keys.spotify);

function MovieInfo(response){
    if (response.title === ""){
        var movieTitle = "mr+nobody";
    }
    else {
    var movieTitle = response.title.replace(/ /g, "+");
    }

    axios.get("http://www.omdbapi.com/?t=" + movieTitle + "&plot=short&apikey=trilogy").then(
        function(response) {
            
            console.log("Title: " + response.data.Title);
            console.log("Released: " + response.data.Released);
            console.log("IMDB Rating: " + response.data.Ratings[0].Value);
            console.log("Rotten Tomatoes Rating: " + response.data.Ratings[1].Value);
            console.log("Country of production: " + response.data.Country);
            console.log("Language: " + response.data.Language);
            console.log("Plot: " + response.data.Plot);
            console.log("Actors: " + response.data.Actors);

        }
    )    
}

function SongInfo(response){

    if (response.title === ""){
        var songTitle = "The Sign";
    }
    else{
        var songTitle = response.title;
    }

    spotify.search({ type: "track" , query: songTitle, limit: 1}, function (error, data) {
        if (error){
            return console.log(error);
        }

        // console.log(data.tracks.items[0]);
        console.log("Artists: " + data.tracks.items[0].artists[0].name);
        console.log("Song: "+ data.tracks.items[0].name);
        console.log("Preview: " + data.tracks.items[0].preview_url);
        console.log("Album: " + data.tracks.items[0].album.name);

    })
}


function ConcertInfo(response){

    var bandName = response.band.replace(/ /g, "+");

    axios.get("https://rest.bandsintown.com/artists/" + bandName + "/events?app_id=codingbootcamp").then(
        function(response) {
            // console.log(response.data);
            console.log("Name of venue: " + response.data[0].venue.name);
            console.log("Location: " + response.data[0].venue.city + " " + response.data[0].venue.region + " " + response.data[0].venue.country);
            var dateString = response.data[0].datetime.split("T");
            date = moment(dateString[0], "YYYY-MM-DD").format("MM-DD-YYYY");
            console.log("Date: " + date);
        }
    )
}

inquirer.prompt(
    {
        type: "list",
        message: "What would you like to know more about?",
        choices: ["Movie", "Concert", "Song", "do what it says"],
        name: "choice"
    }

).then(function(choice){
    if (choice.choice === "do what it says"){
        fs.readFile("./random.txt" , "utf8", function(error, data) {
            console.log(data);
            var order = data.split(",")
            console.log(order);
            if (order[0] === "movie-this"){
                var response = {
                    title: order[1]
                }
                MovieInfo(response);
            }
            if (order[0] === "spotify-this-song"){
                var response = {
                    title: order[1]
                }
                SongInfo(response);
            }
            if (order[0] === "concert-this"){
                var response = {
                    band: order[1]
                }
                ConcertInfo(response);
            }
        })
    }


    if (choice.choice === "Movie"){
        inquirer.prompt(
            {
                type: "input",
                message: "What movie would you like to know more about?",
                name: "title"
            }
        ).then(function(response){

            MovieInfo(response);

        });
    };

    if (choice.choice === "Song"){
        inquirer.prompt(
            {
                type: "input",
                message: "What song would you like to know more about?",
                name: "title"
            }
        ).then(function(response){

            SongInfo(response);

        })
    };

    if (choice.choice === "Concert"){
        inquirer.prompt(
            {
                type: "input",
                message: "What band would you like to for a concert for?",
                name: "band"
            }
        ).then(function(response){

            ConcertInfo(response);

        })
    };
});
