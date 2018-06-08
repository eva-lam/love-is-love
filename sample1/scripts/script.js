// Available modules include (this is not a complete list):
const Scene = require('Scene');
const Textures = require('Textures');
const Materials = require('Materials');
const FaceTracking = require('FaceTracking');
const Animation = require('Animation');
const Reactive = require('Reactive');
const Diagnostics = require('Diagnostics');
const Time = require('Time');

const face0 = FaceTracking.face(0);
const face1 = FaceTracking.face(1);
const mouth0 = face0.cameraTransform.applyTo(face0.mouth.center);
const mouth1 = face1.cameraTransform.applyTo(face1.mouth.center);

const mouthXDist = mouth0.x.sub(mouth1.x);
const mouthYDist = mouth0.y.sub(mouth1.y);
const mouthZDist = mouth0.z.sub(mouth1.z);
const distance = mouthXDist.pow(2).add(mouthYDist.pow(2)).add(mouthZDist.pow(2)).pow(0.5);

Time.ms.monitor().subscribe(function () {
if(distance.lastValue < 30) {    
    Diagnostics.log("KISS Dist: " + distance.lastValue);
}else{
    Diagnostics.log("Friend Zone: " + distance.lastValue);
}
});

distance.lt(30).onOn().subscribe(function () {
Diagnostics.log("KISS!!!");
});

