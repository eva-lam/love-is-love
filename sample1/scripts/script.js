
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

const rainbowP0 = face0.cameraTransform.applyTo(Reactive.point(0,20,0)).expSmooth(200);
const rainbowP1 = face1.cameraTransform.applyTo(Reactive.point(0,20,0)).expSmooth(200);
const cloudface0 = Scene.root.find('cloud_face0');
const cloudface1 = Scene.root.find('cloud_face1');

const heartEmitter = Scene.root.find('heartEmitter');
const likesEmitter = Scene.root.find('likesEmitter');

const mouthXDist = mouth0.x.sub(mouth1.x);
const mouthYDist = mouth0.y.sub(mouth1.y);
const mouthZDist = mouth0.z.sub(mouth1.z);

const headRainbowXDist = rainbowP0.x.sub(rainbowP1.x);
const headRainbowYDist = rainbowP0.y.sub(rainbowP1.y);
const headRainbowZDist = rainbowP0.z.sub(rainbowP1.z);

const distance = mouthXDist.pow(2).add(mouthYDist.pow(2)).add(mouthZDist.pow(2)).pow(0.5);
const MidBetwenPersons = Reactive.point(mouth0.x.add(mouth1.x).div(2),mouth0.y.add(mouth1.y).div(2),mouth0.z.add(mouth1.z).div(2));

heartEmitter.transform.x = MidBetwenPersons.x;
heartEmitter.transform.y = MidBetwenPersons.y;
heartEmitter.transform.z = MidBetwenPersons.z;

FaceTracking.count.lt(2).onOn().subscribe(function() {
    progress0.transform.scaleX = 0;
    progress1.transform.scaleX = 0;
});

FaceTracking.count.ge(2).onOn().subscribe(function() {
progress0.transform.scaleX = distance.neg().mul(0.03).add(1.1).mul(0.5);
progress1.transform.scaleX = distance.neg().mul(0.03).add(1.1).neg().mul(0.5);
});

const rainbowObj = Scene.root.find('Rainbow0');
const rainbowPoints = [
    rainbowObj.child('p0'),
    rainbowObj.child('p1'),
    rainbowObj.child('p2'),
    rainbowObj.child('p3'),
    rainbowObj.child('p4'),
    
    rainbowObj.child('p5'),
    rainbowObj.child('p6'),
    rainbowObj.child('p7'),
    rainbowObj.child('p8'),
    rainbowObj.child('p9'),
    
    rainbowObj.child('p10'),
    rainbowObj.child('p11'),
    rainbowObj.child('p12'),
    rainbowObj.child('p13'),
    rainbowObj.child('p14'),
    
    rainbowObj.child('p15'),
    rainbowObj.child('p16'),
    rainbowObj.child('p17'),
    rainbowObj.child('p18'),
    rainbowObj.child('p19')
];

function RainbowLineInit() {
    rainbowObj.transform.x = rainbowP1.x;
    rainbowObj.transform.y = rainbowP1.y;
    rainbowObj.transform.z = rainbowP1.z;

    for(var i = 0; i<rainbowPoints.length;i++) {
        (function (rindex) {
            rainbowPoints[rindex].transform.x = headRainbowXDist.div(20).mul((rindex));
            rainbowPoints[rindex].transform.y = headRainbowYDist.div(20).mul((rindex)).add(Math.sin(rindex/20*Math.PI)*10);
            rainbowPoints[rindex].transform.z = headRainbowZDist.div(20).mul((rindex));
        })(i);
    }
}
RainbowLineInit();
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

        context.heartFlex.hidden = distance.ge(15);
        distance.lt(15).onOn().subscribe(function () {
            Diagnostics.log("KISS!!!");
            heartEmitter.birthrate = 7;
            heartEmitter.hidden = false;
            likesEmitter.hidden = true; 
            cloudface0.hidden = cloudface1.hidden = false; 
        });

        distance.lt(15).onOff().subscribe(function () {
            Diagnostics.log("GO AWAY!!!");
            heartEmitter.birthrate = 0;
            heartEmitter.hidden = true;
            likesEmitter.hidden = false; 
            cloudface0.hidden = cloudface1.hidden = true; 
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

