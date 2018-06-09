
const Scene = require('Scene');
const Textures = require('Textures');
const Materials = require('Materials');
const FaceTracking = require('FaceTracking');
const Animation = require('Animation');
const Reactive = require('Reactive');
const Diagnostics = require('Diagnostics');
const Time = require('Time');
const Audio = require('Audio'); 

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

heartEmitter.transform.x = MidBetwenPersons.x;
heartEmitter.transform.y = MidBetwenPersons.y;
heartEmitter.transform.z = MidBetwenPersons.z;

progress0.transform.scaleX = distance.neg().mul(3).add(1.1).mul(0.5);
progress1.transform.scaleX = distance.neg().mul(3).add(1.1).neg().mul(0.5);

function Rainbow() {
    this.heartFlex = Scene.root.find('heartFlex');
    this.heartEDriver = Animation.timeDriver({durationMilliseconds:1500,loopCount:Infinity});
    this.heartESampler = Animation.samplers.linear(0,1); 

    this.init= function(){
        var context = this; 
        context.trackDistance(context); 
        heartEmitter.hidden = true;
        likesEmitter.hidden = false;
    }

    this.trackDistance = function(context){
        Time.ms.monitor().subscribe(function () {
            if(distance.lastValue < 15) {    
                Diagnostics.log("KISS Dist: " + distance.lastValue);
            }else{
                Diagnostics.log("Friend Zone: " + distance.lastValue);
            }
        });

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

