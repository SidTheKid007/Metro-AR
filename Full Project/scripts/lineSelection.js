const Scene = require('Scene');
const Reactive = require('Reactive');
const Patches = require('Patches');
const Diagnostics = require('Diagnostics');
const Materials = require('Materials');
const TouchGestures = require('TouchGestures');
const NativeUI = require('NativeUI');
//const Networking = require('Networking');
const textures = require("Textures")

const sceneRoot = Scene.root;
const generalText = 'Are you sure you want \n';
var pickedStation = 'None'

var startStation = ''
var endStation = ''

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
        'Time' : 70,
        'Directions' : {
        	'Compton' : 'Gold Line:\n Arcadia -> Union Station\nRed Line:\n Union Station -> 7th St\nBlue Line:\n 7th St -> Compton'
        }
    }
};
var bestFood = ""
var bestAttraction = ""
var nextTime = 0

var pickerVisible = false
var animateOnce = false
Patches.setBooleanValue('pickerVisible', pickerVisible);

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
    sceneRoot.findFirst('arcadiaMap'),
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
    sceneRoot.findFirst('toLocationBox')
    // Add comments later
])
.then(function(objects) {
    const arcadiaBgObj = objects[0];
    const verifyBox = objects[1];
    const verifyText = objects[2];
    const noChoice = objects[3];
    const yesChoice = objects[4];
    const overallMap = objects[5];
    const arcadiaMap = objects[6];
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

    TouchGestures.onTap(arcadiaBgObj).subscribe(function (gesture) {
        verifyBox.hidden = false;
        verifyText.text = generalText + "Arcadia Station?";
        pickedStation = 'Arcadia';
    });
    TouchGestures.onTap(noChoice).subscribe(function (gesture) {
        verifyBox.hidden = true;
    });
    TouchGestures.onTap(yesChoice).subscribe(function (gesture) {
        verifyBox.hidden = true;
        overallMap.hidden = true;
        if (pickedStation == 'Arcadia') {
            arcadiaMap.hidden = false;
        }
        pickerVisible = true
		Patches.setBooleanValue('pickerVisible', pickerVisible);
        bestFood = stationJSON[pickedStation]['Food'];
        bestAttraction = stationJSON[pickedStation]['Attraction'];
        nextTime = stationJSON[pickedStation]['Time'];
    });
    TouchGestures.onTap(fromLocationBox).subscribe(function (gesture) {
        NativeUI.enterTextEditMode('fromLocationText');
    });
    NativeUI.getText('fromLocationText').monitor().subscribe(function(textUpdate){
    	startStation = textUpdate.newValue;
    });
    TouchGestures.onTap(toLocationBox).subscribe(function (gesture) {
        NativeUI.enterTextEditMode('toLocationText');
    });
    NativeUI.getText('toLocationText').monitor().subscribe(function(textUpdate){
    	endStation = textUpdate.newValue;
    });
    TouchGestures.onTap(submitDirection).subscribe(function (gesture) {
        resultingDirectionsBox.hidden = false;
        // do some json checking
        //resultingDirectionsText.text = startStation + "\n" + endStation;
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
        resultingDirectionsBox.hidden = true;
        directionsBox.hidden = true;
    });
    TouchGestures.onTap(directionSwitch).subscribe(function (gesture) {
        directionsBox.hidden = false;
    });
    Reactive.monitorMany([timePassed, choicePicked]).subscribe(function(event) {
    	// clean this by setting the new val things to actual names
        if (event.newValues["1"] == 0) {
        	stationBox.hidden = true;
        }
        else if (event.newValues["1"] == 1) {
        	var timeLeft = nextTime - Math.floor(event.newValues["0"]);
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
            		stationText.text = 'Train has arrived!';
            		var trainXPos = -.18 + ((1/100) * (event.newValues["0"] - nextTime))
            		var trainYPos = .13 - ((1/100) * (event.newValues["0"] - nextTime))
            		if (trainXPos < .16) {
            			trainTransform.x = trainXPos
            		}
            		if (trainYPos > -.15) {
            			trainTransform.y = trainYPos
            		}
            	}
            }
        }
        else if (event.newValues["1"] == 2) {
        	stationBox.hidden = false;
            stationText.text = 'Attraction:\n' + bestAttraction;
        }
        else if (event.newValues["1"] == 3) {
        	stationBox.hidden = false;
            stationText.text = 'Best Food:\n' + bestFood;
        }
	});
});