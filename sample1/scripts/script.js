
const Scene = require('Scene');
const Textures = require('Textures');
const Materials = require('Materials');
const FaceTracking = require('FaceTracking');
const Animation = require('Animation');
const Reactive = require('Reactive');
const Diagnostics = require('Diagnostics');
const Time = require('Time');
const Audio = require('Audio'); 
const Instruction = require('Instructions');

const progress0 = Scene.root.find("progress0");
const progress1 = Scene.root.find("progress1");

const face0 = FaceTracking.face(0);
const face1 = FaceTracking.face(1);
const mouth0 = face0.cameraTransform.applyTo(face0.mouth.center).expSmooth(200);
const mouth1 = face1.cameraTransform.applyTo(face1.mouth.center).expSmooth(200);

const heartEmitter = Scene.root.find('heartEmitter');
const likesEmitter = Scene.root.find('likesEmitter');

const mouthXDist = mouth0.x.sub(mouth1.x);
const mouthYDist = mouth0.y.sub(mouth1.y);
const mouthZDist = mouth0.z.sub(mouth1.z);
const distance = mouthXDist.pow(2).add(mouthYDist.pow(2)).add(mouthZDist.pow(2)).pow(0.5);
const MidBetwenPersons = Reactive.point(mouth0.x.add(mouth1.x).div(2),mouth0.y.add(mouth1.y).div(2),mouth0.z.add(mouth1.z).div(2));


function Rainbow() {
    this.heartFlex = Scene.root.find('heartFlex');
    this.heartEDriver = Animation.timeDriver({durationMilliseconds:1500,loopCount:Infinity});
    this.heartESampler = Animation.samplers.linear(0,1); 
    this.faceSignalY = FaceTracking.face(0).cameraTransform.y.expSmooth(100); 
    this.faceSignalY2 = FaceTracking.face(0).cameraTransform.y.expSmooth(96); 

    this.init= function(){
        var context = this; 
        context.trackDistance(context); 
        context.countFace(context);
        context.firingHeart(context,context.heartEDriver, context.heartESampler, context.faceSignalY, context.faceSignalY2);
        heartEmitter.hidden = true;
        likesEmitter.hidden = false;
    }

    this.countFace = function(context){
        FaceTracking.count.lt(2).onOn().subscribe(function() {
            progress0.transform.scaleX = 0;
            progress1.transform.scaleX = 0;
        });
        
        FaceTracking.count.ge(2).onOn().subscribe(function() {
             progress0.transform.scaleX = distance.neg().mul(0.03).add(1.1).mul(0.5);
             progress1.transform.scaleX = distance.neg().mul(0.03).add(1.1).neg().mul(0.5);
        });
    }

    this.firingHeart = function(context, driver, sampler, signalY, signalY2){
        heartEmitter.transform.x = MidBetwenPersons.x;
        heartEmitter.transform.y = MidBetwenPersons.y;
        heartEmitter.transform.z = MidBetwenPersons.z;

        var scaleFactor = 3; 
        heartEmitter.transform.rotationX = signalY2.sub(signalY).mul(scaleFactor);
    }

    this.trackDistance = function(context){

        context.heartFlex.hidden = distance.ge(15);
        distance.lt(15).onOn().subscribe(function () {
            Diagnostics.log("KISS!!!");
            heartEmitter.birthrate = 7;
            heartEmitter.hidden = false;
            likesEmitter.hidden = true; 
        });

        distance.lt(15).onOff().subscribe(function () {
            Diagnostics.log("GO AWAY!!!");
            heartEmitter.birthrate = 0;
            heartEmitter.hidden = true;
            likesEmitter.hidden = false; 
        });
    }

    Time.ms.monitor().subscribe(function () {

        if(distance.lastValue < 0.3) {    
            Diagnostics.log("KISS Dist: " + distance.lastValue);
        }else{
            Diagnostics.log("Friend Zone: " + distance.lastValue);
        }
    });
}
var friends = new Rainbow(); 
friends.init(); 

