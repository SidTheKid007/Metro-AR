
const Scene = require('Scene');
const Reactive = require('Reactive');
const Patches = require('Patches');
const Diagnostics = require('Diagnostics');
const Time = require('Time')
const Networking = require('Networking');

const sceneRoot = Scene.root;

//const url = 'https://api.metro.net/agencies/lametro-rail/routes/804/stops/80422/predictions/';

const apiInfo = {
  "Arcadia Station":
  {
    "Food": "Din Tai Fung",
    "Attraction": "Santa Anita Racetrack",
    "NextMetro": 30
  }
}
var myJSON = JSON.stringify(apiInfo)
var apiFull = JSON.parse(myJSON)
// change this to be based off the string output in a different js file


Promise.all([
    sceneRoot.findFirst('APIText'),
    sceneRoot.findFirst('APIBackground')
])
.then(function(objects) {
    const textObject = objects[0];
    const textBox = objects[1];

    const switchValue = Patches.getScalarValue('optionPicked');

    var apiCheck = false;

    Reactive.monitorMany([switchValue]).subscribe(function(event) {
        const case1 = event.newValues["0"] == 0;
        const case2 = event.newValues["0"] == 1;
        const case3 = event.newValues["0"] == 2;

        if (case1)
        {
        	textBox.hidden = true;
        	apiCheck = false;
        }
        else if (case2)
        {
        	textBox.hidden = false;
        	textObject.text = "Top Attraction\n" + apiFull["Arcadia Station"]["Attraction"];
        	apiCheck = false;
        }
        else if (case3)
        {
        	textBox.hidden = false;
        	textObject.text = "Next Train\n" + apiFull["Arcadia Station"]["NextMetro"].toString();

        }
        else
        {
        	textBox.hidden = false;
        	textObject.text = "Best Food\n" + apiFull["Arcadia Station"]["Food"];
        	apiCheck = false;
        }
    }) 
});

