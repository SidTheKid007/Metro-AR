const Scene = require('Scene');
const Reactive = require('Reactive');
const Patches = require('Patches');
const Diagnostics = require('Diagnostics');
const Materials = require('Materials');
const TouchGestures = require('TouchGestures');
//const Networking = require('Networking');

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

const timePassed = Patches.getScalarValue('timePassed');

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
    sceneRoot.findFirst('stationInfoKey'),
    sceneRoot.findFirst('choice-noInfo'),
    sceneRoot.findFirst('choice-nextTrain'),
    sceneRoot.findFirst('choice-bestFood'),
    sceneRoot.findFirst('choice-bestAttraction'),
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
    const stationKey = objects[9];
    const noInfoChoice = objects[10];
    const nextTrainChoice = objects[11];
    const bestFoodChoice = objects[12];
    const bestAttractionChoice = objects[13];

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
        stationKey.hidden = false;
        if (pickedStation == 'Arcadia') {
            arcadiaMap.hidden = false;
            // Change this to a method call?
        }
        bestFood = stationJSON[pickedStation]['Food'];
        bestAttraction = stationJSON[pickedStation]['Attraction'];
        nextTime = stationJSON[pickedStation]['Time'];
    });
    TouchGestures.onTap(noInfoChoice).subscribe(function (gesture) {
        stationBox.hidden = true;
    });
    TouchGestures.onTap(nextTrainChoice).subscribe(function (gesture) {
        Reactive.monitorMany([timePassed]).subscribe(function(event) {
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
        });
    });
    TouchGestures.onTap(bestFoodChoice).subscribe(function (gesture) {
        stationBox.hidden = false;
        stationText.text = 'Best Food:\n' + bestFood;
    });
    TouchGestures.onTap(bestAttractionChoice).subscribe(function (gesture) {
        stationBox.hidden = false;
        stationText.text = 'Attraction:\n' + bestAttraction;
    });
});