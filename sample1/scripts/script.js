// Available modules include (this is not a complete list):
const Scene = require('Scene');
const Textures = require('Textures');
const Materials = require('Materials');
const FaceTracking = require('FaceTracking');
const Animation = require('Animation');
const Reactive = require('Reactive');
const Diagnostics = require('Diagnostics');
const Time = require('Time');

const progress0 = Scene.root.find("progress0");
const progress1 = Scene.root.find("progress1");

const face0 = FaceTracking.face(0);
const face1 = FaceTracking.face(1);
const mouth0 = face0.cameraTransform.applyTo(face0.mouth.center).expSmooth(200);
const mouth1 = face1.cameraTransform.applyTo(face1.mouth.center).expSmooth(200);

// const facemesh0 = Scene.root.find('theface0');

// facemesh0.transform.x = mouth0.x;
// facemesh0.transform.y = mouth0.y;
// facemesh0.transform.z = mouth0.z;

const mouthXDist = mouth0.x.sub(mouth1.x);
const mouthYDist = mouth0.y.sub(mouth1.y);
const mouthZDist = mouth0.z.sub(mouth1.z);
const distance = mouthXDist.pow(2).add(mouthYDist.pow(2)).add(mouthZDist.pow(2)).pow(0.5);

progress0.transform.scaleX = distance.neg().mul(3).add(1.1).mul(0.5);
progress1.transform.scaleX = distance.neg().mul(3).add(1.1).neg().mul(0.5);

Time.ms.monitor().subscribe(function () {


if(distance.lastValue < 0.3) {    
    Diagnostics.log("KISS Dist: " + distance.lastValue);
}else{
    Diagnostics.log("Friend Zone: " + distance.lastValue);
}
});

distance.lt(0.3).onOn().subscribe(function () {
Diagnostics.log("KISS!!!");
});

