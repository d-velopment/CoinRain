// ----- Start of the assigment ----- //
const SCENE = {
	WIDTH: 800,
	HEIGHT: 450
}

const PARTICLES = {
	FRAMERATE: 2
}

class ParticleSystem extends PIXI.Container {
	constructor() {
		super();
		// Set start and duration for this effect in milliseconds
		this.start    = 0;
		this.duration = 500 + Math.random() * 2000;
		// Create a sprite
		let sp        = game.sprite("CoinsGold000");
		// Set pivot to center of said sprite
		sp.pivot.x    = sp.width/2;
		sp.pivot.y    = sp.height/2;

		sp.scale.x = sp.scale.y = (2500 / this.duration) * 0.5;
		sp.x 		  = Math.random() * SCENE.WIDTH;

		// Add the sprite particle to our particle effect
		this.addChild(sp);
		// Save a reference to the sprite particle
		this.sp = sp;
		console.log(this.sp)
	}
	animTick(timeProgress, timeDuration, timeGlobal) {
		// Every update we get three different time variables: timeProgress, timeDuration and timeGlobal.
		//   timeProgress: Normalized time in procentage (0.0 to 1.0) and is calculated by
		//       just dividing local time with duration of this effect.
		//   timeDuration: Local time in milliseconds, from 0 to this.duration.
		//   timeGlobal: Global time in milliseconds,

		// Set a new texture on a sprite particle
		let num = ("000"+Math.floor((timeGlobal / PARTICLES.FRAMERATE) % 8)).substr(-3);
		game.setTexture(this.sp,"CoinsGold"+num);

		// Animate position
		// this.sp.x = 100; // + timeProgress*800;
		if (timeProgress == 0.0) {
			console.log(timeProgress)
			this.sp.x = Math.random() * SCENE.WIDTH;
		}

		this.sp.y = -this.sp.height/2 + timeProgress * (SCENE.HEIGHT+this.sp.height);
		
		// Animate scale
		//this.sp.scale.x = this.sp.scale.y = 0.5; // timeProgress;
		
		// Animate alpha
		// this.sp.alpha = timeProgress;
		// Animate rotation
		
		// this.sp.rotation = timeProgress*Math.PI*2;
	}
}

// ----- End of the assigment ----- //

class Game {
	constructor(props) {
		this.totalDuration = 0;
		this.effects = [];
		this.renderer = new PIXI.WebGLRenderer(SCENE.WIDTH, SCENE.HEIGHT);
		document.body.appendChild(this.renderer.view);
		this.stage = new PIXI.Container();
		this.loadAssets(props&&props.onload);
	}
	loadAssets(cb) {
		let textureNames = [];
		// Load coin assets
		for (let i=0; i<=8; i++) {
			let num  = ("000"+i).substr(-3);
			let name = "CoinsGold"+num;
			let url  = "gfx/CoinsGold/"+num+".png";
			textureNames.push(name);
			PIXI.loader.add(name,url);
		}
		PIXI.loader.load(function(loader,res){
			// Access assets by name, not url
			let keys = Object.keys(res);
			for (let i=0; i<keys.length; i++) {
				var texture = res[keys[i]].texture;
				if ( ! texture) continue;
				PIXI.utils.TextureCache[keys[i]] = texture;
			}
			// Assets are loaded and ready!
			this.start();
			cb && cb();
		}.bind(this));
	}
	start() {	
		this.isRunning = true;
		this.timeStart = Date.now();
		update.bind(this)();
		function update(){
			if ( ! this.isRunning) return;
			this.tick();
			this.render();
			requestAnimationFrame(update.bind(this));
		}
	}
	addEffect(effect) {
		this.totalDuration = Math.max(this.totalDuration, (effect.duration + effect.start)||0);
		this.effects.push(effect);
		this.stage.addChild(effect);
	}
	render() {
		this.renderer.render(this.stage);
	}
	tick() {
		let timeGlobal = Date.now();
		
		for (let i=0; i < this.effects.length; i++) {
			
			let thisEffect = this.effects[i];
			let timeDuration = (timeGlobal - this.timeStart) % thisEffect.duration // thisEffect.totalDuration;

			if (timeDuration > thisEffect.start + thisEffect.duration || timeDuration < thisEffect.start) continue;
			let estimateLeftTime = timeDuration - thisEffect.start;
			let currentProgress = estimateLeftTime / thisEffect.duration;
			thisEffect.animTick(currentProgress, estimateLeftTime, timeGlobal);
		}
	}
	sprite(name) {
		return new PIXI.Sprite(PIXI.utils.TextureCache[name]);
	}
	setTexture(sp,name) {
		sp.texture = PIXI.utils.TextureCache[name];
		if ( ! sp.texture) console.warn("Texture '"+name+"' don't exist!")
	}
}

window.onload = function(){
	window.game = new Game({onload:function(){
		for (let i=0; i<10; i++)
			game.addEffect(new ParticleSystem());
	}});
}
