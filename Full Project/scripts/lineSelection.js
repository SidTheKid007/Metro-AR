const Scene = require('Scene');
const Reactive = require('Reactive');
const Patches = require('Patches');
const Diagnostics = require('Diagnostics');
const Materials = require('Materials');
const TouchGestures = require('TouchGestures');
//const Networking = require('Networking');
const textures = require("Textures")

const sceneRoot = Scene.root;
const generalText = "Are you sure you want \n";
var pickedStation = 'None'

const stationJSON = {
    'None' : {
        'Food' : 'None',
        'Attraction' : 'None',
        'Time' : 300
    },
    'Arcadia' : {
        'Food' : 'Din Tai Fung',
        'Attraction' : 'RaceTrack',
        'Time' : 10
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
    sceneRoot.findFirst('stationTrain')
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
    Reactive.monitorMany([timePassed, choicePicked]).subscribe(function(event) {
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