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
        'Time' : 200
    }
};
var bestFood = ""
var bestAttraction = ""
var nextTime = 0

var pickerVisible = false
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
    //textures.findFirst('noText'),
    //textures.findFirst('food'),
    //textures.findFirst('attractions'),
    //textures.findFirst('time')
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
    //const noInfoChoice = objects[9];
    //const bestFoodChoice = objects[10];
    //const bestAttractionChoice = objects[11];
    //const nextTrainChoice = objects[12];

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
            if (seconds < 10) {
                stationText.text = 'Next Train:\n' + minutes.toString() + ':0' + seconds.toString();
            }
            else {
                stationText.text = 'Next Train:\n' + minutes.toString() + ':' + seconds.toString();
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