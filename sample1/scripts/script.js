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


const kissingSound = Scene.root.find('kissingSound');

const face0 = FaceTracking.face(0);
const face1 = FaceTracking.face(1);
const mouth0 = face0.cameraTransform.applyTo(face0.mouth.center).expSmooth(200);
const mouth1 = face1.cameraTransform.applyTo(face1.mouth.center).expSmooth(200);

const friend0 = Scene.root.find('Friend0');
const friend1 = Scene.root.find('Friend1');

const checkFace = Scene.root.find('faceCheck');

const EmittersAndSlide = Scene.root.find('EmittersAndSlide'); 
const rainbowAndHearts = Scene.root.find('rainbowAndHearts');

const rainbowP0 = face0.cameraTransform.applyTo(Reactive.point(0, 21, 0)).expSmooth(200);
const rainbowP1 = face1.cameraTransform.applyTo(Reactive.point(0, 21, 0)).expSmooth(200);

const cloudface0 = Scene.root.find('cloud_face0');
const cloudface1 = Scene.root.find('cloud_face1');

const heartEmitter = Scene.root.find('heartEmitter');
const likesEmitter = Scene.root.find('likesEmitter');

const daystillparade = Scene.root.find('text0');

const mouthXDist = mouth0.x.sub(mouth1.x);
const mouthYDist = mouth0.y.sub(mouth1.y);
const mouthZDist = mouth0.z.sub(mouth1.z);

const headRainbowXDist = rainbowP0.x.sub(rainbowP1.x);
const headRainbowYDist = rainbowP0.y.sub(rainbowP1.y);
const headRainbowZDist = rainbowP0.z.sub(rainbowP1.z);

const mouthDistance = mouthXDist.pow(2).add(mouthYDist.pow(2)).pow(0.5);
const MidBetwenPersons = Reactive.point(mouth0.x.add(mouth1.x).div(2), mouth0.y.add(mouth1.y).div(2), mouth0.z.add(mouth1.z).div(2));

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
const hDr = [, , , , ];

const hSsampler = Animation.samplers.linear(0, 20);
const hRotSsampler = Animation.samplers.linear(0, Math.PI);
const hOpSsampler = Animation.samplers.linear(1, 0);

const rainbowRoot = Scene.root.find('rainbowRoot');
const rainbowObj = Scene.root.find('Rainbow0');
const rainbowPoints = [
    rainbowObj.child('p00'),
    rainbowObj.child('p01'),
    rainbowObj.child('p02'),
    rainbowObj.child('p03'),
    rainbowObj.child('p04'),

    rainbowObj.child('p05'),
    rainbowObj.child('p07'),
    rainbowObj.child('p06'),
    rainbowObj.child('p08'),
    rainbowObj.child('p09'),

    rainbowObj.child('p10'),
    rainbowObj.child('p11'),
    rainbowObj.child('p12'),
    rainbowObj.child('p13'),
    rainbowObj.child('p14'),

    rainbowObj.child('p15'),
    rainbowObj.child('p16'),
    rainbowObj.child('p17'),
    rainbowObj.child('p18'),
    rainbowObj.child('p19'),
    rainbowObj.child('p20'),
    rainbowObj.child('p21'),
    rainbowObj.child('p22')
];

//display Date til parade 
function DayDiff(CurrentDate) {
    var TYear = CurrentDate.getFullYear();
    var TDay = new Date("July, 7, 2018");
    var DayCount = (TDay - CurrentDate) / (1000 * 60 * 60 * 24);
        TDay.getFullYear(TYear);
        DayCount = Math.round(DayCount);    

    return (DayCount);
}

var Today = new Date();
daystillparade.text = DayDiff(Today) + ' days untill the parade.';


//main function 
function Rainbow() {
    this.heartFlex = Scene.root.find('heartFlex');
    this.heartEDriver = Animation.timeDriver({
        durationMilliseconds: 1500,
        loopCount: Infinity
    });
    this.heartESampler = Animation.samplers.linear(0, 1);
    //progress bar 
    this.progress0 = Scene.root.find("progress0");
    this.progress1 = Scene.root.find("progress1");

    this.init = function () {
        var context = this;
        context.trackDistance(context);
        context.setVisibility(daystillparade, false);
        context.RainbowLineInit();
        context.firingHeart();
        context.progressBar(context); 
        cloudface0.hidden = cloudface1.hidden = true;
        rainbowRoot.hidden = true;
        heartGroup.hidden = true;
        likesEmitter.hidden = false;
    }
    this.setVisibility = function (item, visible) {
        item.hidden = !visible;
    }

    this.progressBar = function(local){
        local.progress0.transform.scaleX = mouthDistance.neg().mul(0.03).add(1.1).mul(0.5);
        local.progress1.transform.scaleX = mouthDistance.neg().mul(0.03).add(1.1).neg().mul(0.5);
    }

    this.RainbowLineInit = function() {
        rainbowObj.transform.x = rainbowP1.x.mul(1);
        rainbowObj.transform.y = rainbowP1.y.mul(1);
        rainbowObj.transform.z = rainbowP1.z.mul(1).sub(10);
    
        for (var i = 0; i < rainbowPoints.length; i++) {
            (function (rindex) {
                rainbowPoints[rindex].transform.x = headRainbowXDist.div(23).mul((rindex)); //add(Math.sin(rindex/23*Math.PI)*10);;
                rainbowPoints[rindex].transform.y = headRainbowYDist.div(23).mul((rindex)).add(Math.sin(rindex / 23 * Math.PI) * 10);
                rainbowPoints[rindex].transform.z = headRainbowZDist.div(23).mul((rindex)); //.sub(Math.sin(rindex/23*Math.PI)*10);;
            })(i);
        }
    }

    this.firingHeart = function () {
        for (var i = 0; i < 5; i++) {
            (function (hindex) {
                hDr[hindex] = Animation.timeDriver({
                    durationMilliseconds: 2000,
                    loopCount: Infinity,
                    mirror: false
                });
                hList[hindex].transform.x = MidBetwenPersons.x.add((Math.random() - 0.5) * 1);
                hList[hindex].transform.y = MidBetwenPersons.y.add(Animation.animate(hDr[hindex], hSsampler));
                hList[hindex].transform.z = MidBetwenPersons.z;
                hList[hindex].transform.rotationY = Animation.animate(hDr[hindex], hRotSsampler);
                hMatL[hindex].opacity = Animation.animate(hDr[hindex], hOpSsampler);

                Time.setTimeout(function () {
                    hDr[hindex].start();
                }, (Math.random() * 2000));

            })(i);
        }
    }

    this.trackDistance = function (context) {

        EmittersAndSlide.hidden =FaceTracking.count.le(1) ;
        rainbowAndHearts.hidden = FaceTracking.count.le(1) ;
        friend0.hidden = FaceTracking.count.le(1); 
        friend1.hidden = FaceTracking.count.le(1);
        checkFace.hidden = FaceTracking.count.gt(1) ;
        
        context.heartFlex.hidden = mouthDistance.ge(15); 

        //when mouth distance less than 10 
        mouthDistance.lt(10).onOn({fireOnInitialValue: true}).subscribe(function () {
            Diagnostics.log("KISS!!!");
            if (FaceTracking.count.lastValue > 1) kissingSound.play();
                heartEmitter.birthrate = 7;
                heartGroup.hidden = false;
                likesEmitter.hidden = true;
                rainbowRoot.hidden = true;
        });
        //when mouth distance less than 10 - drawing apart 
        mouthDistance.lt(10).onOff({fireOnInitialValue: true}).subscribe(function () {
                Diagnostics.log("GO AWAY!!!");
                heartEmitter.birthrate = 0;
                heartGroup.hidden = true;
                cloudface0.hidden = cloudface1.hidden = true;
        });

        //when mouth distance less than 25 - cloud face
        mouthDistance.lt(25).onOn({fireOnInitialValue: true}).subscribe(function () {
            context.setVisibility(daystillparade, true);
            cloudface0.hidden = cloudface1.hidden = false;
            likesEmitter.hidden = true;
            rainbowRoot.hidden = false;
        });
        //when mouth distance less than 25 
        mouthDistance.lt(25).onOff({fireOnInitialValue: true}).subscribe(function () {
            context.setVisibility(daystillparade, false);
            cloudface0.hidden = cloudface1.hidden = true;
            likesEmitter.hidden = false;
            rainbowRoot.hidden = true;
        });

    }


}

var friends = new Rainbow();
friends.init();