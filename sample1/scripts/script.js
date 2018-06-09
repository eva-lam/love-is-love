
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
const cloudface0 = Scene.root.find('cloud_face0');
const cloudface1 = Scene.root.find('cloud_face1');

const heartEmitter = Scene.root.find('heartEmitter');
const likesEmitter = Scene.root.find('likesEmitter');
const heartModel = Scene.root.find('Heart1');

const daystillparade = Scene.root.find('text0');

function DayDiff(CurrentDate)
{
	var TYear=CurrentDate.getFullYear();
        var TDay=new Date("July, 7, 2018");
        TDay.getFullYear(TYear);
        var DayCount=(TDay-CurrentDate)/(1000*60*60*24);
        DayCount=Math.round(DayCount); 
    return(DayCount);
}

var Today = new Date(); 
daystillparade.text = DayDiff(Today) + ' days untill the parade.';

const mouthXDist = mouth0.x.sub(mouth1.x);
const mouthYDist = mouth0.y.sub(mouth1.y);
const mouthZDist = mouth0.z.sub(mouth1.z);
const distance = mouthXDist.pow(2).add(mouthYDist.pow(2)).pow(0.5);
// const distance = mouthXDist.pow(2).add(mouthYDist.pow(2)).add(mouthZDist.pow(2)).pow(0.5);
const MidBetwenPersons = Reactive.point(mouth0.x.add(mouth1.x).div(2),mouth0.y.add(mouth1.y).div(2),mouth0.z.add(mouth1.z).div(2));

//for heart

const heartGroup = Scene.root.find('heartGroup');
const hList = [
    Scene.root.find('Heart1'),
    Scene.root.find('Heart2'),
    Scene.root.find('Heart3'),
    Scene.root.find('Heart4'),
    Scene.root.find('Heart5')
];

const hMatL = [
    Materials.get('heartMat1'),
    Materials.get('heartMat2'),
    Materials.get('heartMat3'),
    Materials.get('heartMat4'),
    Materials.get('heartMat5')
];
const hDr = [,,,,];

const hSsampler = Animation.samplers.linear(0,20);
const hRotSsampler = Animation.samplers.linear(0,Math.PI);
const hOpSsampler = Animation.samplers.linear(1,0);


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

        context.firingHeart();
        heartGroup.hidden = true;
        // daystillparade.hidden = 
        cloudface0.hidden = cloudface1.hidden = true;
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

    var test = 0;
    this.firingHeart = function(){
        // heartEmitter.transform.x = MidBetwenPersons.x;
        // heartEmitter.transform.y = MidBetwenPersons.y;
        // heartEmitter.transform.z = MidBetwenPersons.z;
        test++;
        var scaleFactor = 3; 

        
        for(var i = 0; i < 5; i++) {
            (function (hindex) {
                hDr[hindex] = Animation.timeDriver({durationMilliseconds : 2000, loopCount: Infinity, mirror: false});
                hList[hindex].transform.x = MidBetwenPersons.x.add((Math.random()-0.5)*1);
                hList[hindex].transform.y = MidBetwenPersons.y.add(Animation.animate(hDr[hindex],hSsampler));
                hList[hindex].transform.z = MidBetwenPersons.z;
                hList[hindex].transform.rotationY = Animation.animate(hDr[hindex],hRotSsampler);
                hMatL[hindex].opacity = Animation.animate(hDr[hindex],hOpSsampler);
                Time.setTimeout(function() {
                    hDr[hindex].start();
                },(Math.random()*2000));
            })(i);
        }
        //heartEmitter.transform.rotationX = signalY2.sub(signalY).mul(scaleFactor);
    }
    this.trackDistance = function(context){

        context.heartFlex.hidden = distance.ge(10);
        distance.lt(10).onOn().subscribe(function () {
            Diagnostics.log("KISS!!!");
            // heartEmitter.birthrate = 7;
            heartGroup.hidden = false;
            likesEmitter.hidden = true; 
            cloudface0.hidden = cloudface1.hidden = false;
            //daystillparade.hidden = false; 
        });

        distance.lt(10).onOff().subscribe(function () {
            Diagnostics.log("GO AWAY!!!");
            // heartEmitter.birthrate = 0;
            heartGroup.hidden = true;
            likesEmitter.hidden = false; 
            cloudface0.hidden = cloudface1.hidden = true;
            //daystillparade.hidden = true; 
        });
    }

    Time.ms.monitor().subscribe(function () {

        if(distance.lastValue < 0.3) {    
            Diagnostics.log("KISS Dist: " + distance.lastValue);
        } else{
            Diagnostics.log("Friend Zone: " + distance.lastValue);
        }
    });
}
var friends = new Rainbow(); 
friends.init(); 

