
const Scene = require('Scene');
const Reactive = require('Reactive');
const Patches = require('Patches');
export const Diagnostics = require('Diagnostics');
const Time = require('Time')

const sceneRoot = Scene.root;

Promise.all([
    sceneRoot.findFirst('APIText')
])
.then(function(objects) {
    const textObject = objects[0]
    const patchValue = Patches.getScalarValue('inputNum')
    //textObject.text = patchValue.toString()


    Reactive.monitorMany([patchValue]).subscribe(function(event) {
        const case1 = event.newValues["0"] == 0;
        const case2 = event.newValues["0"] == 1;

        if (case1) textObject.text = "Best Food\nDin Tai Fung";
        else if (case2) textObject.text = "Top Attraction\nThe Racetrack";
        else textObject.text = "Next Train\nIn 30 min";
    }) 
});