// All module imports
const Scene = require('Scene');
const Reactive = require('Reactive');
const Patches = require('Patches');
const Diagnostics = require('Diagnostics');
const Materials = require('Materials');
const TouchGestures = require('TouchGestures');
const NativeUI = require('NativeUI');
// const Networking = require('Networking');
const textures = require("Textures")

const sceneRoot = Scene.root;

// Set up of text used in station confirmation field
const generalText = 'Are you sure you want \n';
var pickedStation = 'None'

// Placeholders for the directions to and from data
var startStation = ''
var endStation = ''

// PseudoAPI holding the ground truth values for everything
const stationJSON = {
    'None' : {
        'Food' : 'None',
        'Attraction' : 'None',
        'Time' : 300,
        'Directions' : {
        	'Compton' : 'None -> Compton'
        }
    },
    'Arcadia' : {
        'Food' : 'Din Tai Fung',
        'Attraction' : 'RaceTrack',
        'Time' : 105,
        'Directions' : {
        	'Compton' : 'Gold Line:\n Arcadia -> Union Station\nRed Line:\n Union Station -> 7th St\nBlue Line:\n 7th St -> Compton'
        }
    },
    'Metro Center' : {
        'Food' : 'Hatch Yakitori',
        'Attraction' : 'Fine Arts Building',
        'Time' : 95,
        'Directions' : {
        	'Arcadia' : 'Red Line:\n 7th St -> Union Station\Gold Line:\n Union Station -> Arcadia'
        }
    }
};

// Storage variables for station information
var bestFood = ""
var bestAttraction = ""
var nextTime = 0

// Flags used to ensure that the UI picker is only visible on the station screen and that the train moves once
var pickerVisible = false
var animateOnce = false
Patches.setBooleanValue('pickerVisible', pickerVisible);

// Reading in time passed and the choice made on pickerUI
const timePassed = Patches.getScalarValue('timePassed');
const choicePicked = Patches.getScalarValue('choicePicked');

Promise.all([
    //Overall Map Assets
    sceneRoot.findFirst('select-Arcadia'),
    sceneRoot.findFirst('backroundBox'),
    sceneRoot.findFirst('verifyText'),
    sceneRoot.findFirst('noOption'),
    sceneRoot.findFirst('yesOption'),
    sceneRoot.findFirst('FullMap'),
    //Station Map Assets
    sceneRoot.findFirst('arcadiaMapImage'),
    sceneRoot.findFirst('stationBox'),
    sceneRoot.findFirst('stationInfoText'),
    sceneRoot.findFirst('stationTrain'),
    //Direction Box Assets
    sceneRoot.findFirst('fromLocationText'),
    sceneRoot.findFirst('toLocationText'),
    sceneRoot.findFirst('submitDirection'),
    sceneRoot.findFirst('resultingDirectionsBox'),
    sceneRoot.findFirst('resultingDirectionsText'),
    sceneRoot.findFirst('exitDirection'),
    sceneRoot.findFirst('directionsBox'),
    sceneRoot.findFirst('key-directionSwitch'),
    sceneRoot.findFirst('fromLocationBox'),
    sceneRoot.findFirst('toLocationBox'),
    //Other Stations
    sceneRoot.findFirst('select-MetroCenter'),
    sceneRoot.findFirst('otherMapImage')
])
.then(function(objects) {
    const arcadiaBgObj = objects[0];
    const verifyBox = objects[1];
    const verifyText = objects[2];
    const noChoice = objects[3];
    const yesChoice = objects[4];
    const overallMap = objects[5];
    const arcadiaStationMap = objects[6];
    const stationBox = objects[7];
    const stationText = objects[8];
    const stationTrain = objects[9];
    const trainTransform = stationTrain.transform;
    const fromLocationText = objects[10];
    const toLocationText = objects[11];
    const submitDirection = objects[12];
    const resultingDirectionsBox = objects[13];
    const resultingDirectionsText = objects[14];
    const exitDirection = objects[15];
    const directionsBox = objects[16];
    const directionSwitch = objects[17];
    const fromLocationBox = objects[18];
    const toLocationBox = objects[19];
    const metroCenterBgObj = objects[20];
    const otherMapImage = objects[21];
    // Connecting and Setting up all the scene assets needed 

    TouchGestures.onTap(arcadiaBgObj).subscribe(function (gesture) {
        // If a user presses on Arcadia station, a popup will ask if you want to go to Arcadia Station
        verifyBox.hidden = false;
        directionsBox.hidden = true;
        verifyText.text = generalText + "Arcadia Station?";
        pickedStation = 'Arcadia';
    });
    TouchGestures.onTap(metroCenterBgObj).subscribe(function (gesture) {
        // If a user presses on 7th St/Metro Ctr Station, a popup will ask if you want to go to 7th St/Metro Ctr Station
        verifyBox.hidden = false;
        directionsBox.hidden = true;
        verifyText.text = generalText + "Metro Center?";
        pickedStation = 'Metro Center';
    });
    TouchGestures.onTap(noChoice).subscribe(function (gesture) {
        // If a user presses no on station confirmation popup, the popup will disappear
        verifyBox.hidden = true;
    });
    TouchGestures.onTap(yesChoice).subscribe(function (gesture) {
        // If a user presses yes on station confirmation popup, the overall map + popup will disappear, and the right station map will show up instead. Also "pseudoAPI" data gets preloaded
        verifyBox.hidden = true;
        overallMap.hidden = true;
        if (pickedStation == 'Arcadia') {
        	arcadiaStationMap.hidden = false;
        }
        else {
        	otherMapImage.hidden = false;
        }
        pickerVisible = true
		Patches.setBooleanValue('pickerVisible', pickerVisible);
        bestFood = stationJSON[pickedStation]['Food'];
        bestAttraction = stationJSON[pickedStation]['Attraction'];
        nextTime = stationJSON[pickedStation]['Time'];
    });
    TouchGestures.onTap(fromLocationBox).subscribe(function (gesture) {
        // If a user presses the "from" location box, the user will be able to edit the text inside
        NativeUI.enterTextEditMode('fromLocationText');
    });
    NativeUI.getText('fromLocationText').monitor().subscribe(function(textUpdate){
        // This monitors what the user has entered in the "from" location box
    	startStation = textUpdate.newValue;
    });
    TouchGestures.onTap(toLocationBox).subscribe(function (gesture) {
        // If a user presses the "to" location box, the user will be able to edit the text inside
        NativeUI.enterTextEditMode('toLocationText');
    });
    NativeUI.getText('toLocationText').monitor().subscribe(function(textUpdate){
        // This monitors what the user has entered in the "to" location box
    	endStation = textUpdate.newValue;
    });
    TouchGestures.onTap(submitDirection).subscribe(function (gesture) {
        // If a user presses go on the directions box, the directions will be retrieved from the "pseudoAPI" and displayed
        resultingDirectionsBox.hidden = false;
        if (stationJSON.hasOwnProperty(startStation)){
        	const fromStationJson = stationJSON[startStation]['Directions'];
        	if (fromStationJson.hasOwnProperty(endStation)){
        		resultingDirectionsText.text = fromStationJson[endStation];
        	}
        	else {
        		resultingDirectionsText.text = startStation + " ->\n" + endStation;
        	}
        }
        else {
        	resultingDirectionsText.text = startStation + " ->\n" + endStation;
        }
    });
    TouchGestures.onTap(exitDirection).subscribe(function (gesture) {
        // If a user presses the x on the directions box, the directions box will be hidden
        resultingDirectionsBox.hidden = true;
        directionsBox.hidden = true;
    });
    TouchGestures.onTap(directionSwitch).subscribe(function (gesture) {
        // If a user presses the directions switch (the turning arrow), the directions box is shown
        directionsBox.hidden = false;
        verifyBox.hidden = true;
    });
    Reactive.monitorMany([timePassed, choicePicked]).subscribe(function(event) {
        // Setting up variables to actively monitor the time passed since the filter was opened and the choice made by the UI picker
    	var timePassedValue = event.newValues["0"];
        var choicePickedValue = event.newValues["1"];
        if (choicePickedValue == 0) {
            // Picking choice 0 hides the station info box (if it is shown)
        	stationBox.hidden = true;
        }
        else if (choicePickedValue == 1) {
            // Picking choice 1 shows a countdown timer with the minutes and seconds until the next train
        	var timeLeft = nextTime - Math.floor(timePassedValue);
            var minutes = Math.floor(timeLeft / 60);
            var seconds = (timeLeft - 60*minutes);
            stationBox.hidden = false;
            if (((minutes == 0 && seconds == 0) || (minutes < 0)) && !(animateOnce)) {
            	stationText.text = 'Train has arrived!';
            	animateOnce = true;
            	stationTrain.hidden = false;
            }
        	else if (seconds < 10 && !(animateOnce)) {
                stationText.text = 'Next Train:\n' + minutes.toString() + ':0' + seconds.toString();
            }
            else {
            	if (!(animateOnce)) {
            		stationText.text = 'Next Train:\n' + minutes.toString() + ':' + seconds.toString();
            	}
            	else {
                    // When the countdown timer hits 0, the train moves and docks in the station
            		stationText.text = 'Train has arrived!';
            		var trainXPos = -410 + ((20) * (timePassedValue - nextTime))
            		var trainYPos = 420 - ((20) * (timePassedValue - nextTime))
            		if (trainXPos < -60) {
            			trainTransform.x = trainXPos
            		}
            		if (trainYPos > 70) {
            			trainTransform.y = trainYPos
            		}
            	}
            }
        }
        else if (choicePickedValue == 2) {
            // Picking choice 2 shows the best attraction in the area by the station
        	stationBox.hidden = false;
            stationText.text = 'Attraction:\n' + bestAttraction;
        }
        else if (choicePickedValue == 3) {
            // Picking choice 3 shows the best restaraunt in the area by the station
        	stationBox.hidden = false;
            stationText.text = 'Best Food:\n' + bestFood;
        }
	});
});