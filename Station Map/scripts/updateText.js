
const Scene = require('Scene');
const Reactive = require('Reactive');
const Patches = require('Patches');
const Diagnostics = require('Diagnostics');
const Time = require('Time')
const Networking = require('Networking');

const sceneRoot = Scene.root;

/*const url = 'https://api.metro.net/agencies/lametro-rail/routes/804/stops/80422/predictions/';
const request = {
	method: 'GET',
	headers: {'accept': 'application/json'}
};

Networking.fetch(url, request).then(function(result) {
	if ((result.status >= 200) && (result.status < 300)) {
    	return result.json();
	}
	throw new Error('HTTP status code - ' + result.status);
}).then(function(json) {
	Diagnostics.log('Successfully sent - ' + json.title);
}).catch(function(error) {
	Diagnostics.log('Error - ' + error.message);
});
*/

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
        	textObject.text = "Top Attraction\nThe Racetrack";
        	apiCheck = false;
        }
        else if (case3)
        {
        	textBox.hidden = false;
        	textObject.text = "Next Train\nIn 30 min";

        }
        else
        {
        	textBox.hidden = false;
        	textObject.text = "Best Food\nDin Tai Fung";
        	apiCheck = false;
        }
    }) 
});

