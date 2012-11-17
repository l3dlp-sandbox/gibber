Swarm = function(props) {
	var boids;
	if(Array.isArray(arguments[0])) {
		var boids = arguments[0];
	}else{
		boids = [];
		type = props.type || "Sphere";
		var isRandomX = false, isRandomY = false, isRandomZ = false;
		
		for(var i = 0; i < props.size; i++ ) {
			var _props = {};
			for(var key in props) {
				if(typeof props[key] === 'function') {
					_props[key] = props[key]();
					if(key === 'x') isRandomX = true;
					if(key === 'y') isRandomY = true;
					if(key === 'z') isRandomZ = true;
				}else if(Array.isArray(props[key])){
					var p = [];
					for(var j = 0; j<props[key].length; j++) {
						if(typeof props[key][j] === 'function') {
							p.push(props[key][j]());
						}else{
							p.push(props[key][j]);
						}
					}
					_props[key] = p;
				}else{
					_props[key] = props[key];
				}
			}
			
			if(typeof _props.x === 'undefined') {
				_props.x = rndf(-1, 1);
			}else if(typeof _props.x === 'number' && !isRandomX) {
				_props.x = rndf(_props.x - 1, _props.x + 1);
			}
			if(typeof _props.y === 'undefined') {
				_props.y = rndf(-1, 1);
			}else if(typeof _props.y === 'number' && !isRandomY) {
				_props.y = rndf(_props.y - 1, _props.y + 1);
			}
			if(typeof _props.z === 'undefined') {
				_props.z = rndf(-1, 1);
			}else if(typeof _props.z === 'number' && !isRandomZ) {
				_props.z = rndf(_props.z - 1, _props.z + 1);
			}
			
			if(i===0) console.log(_props);
			var agent = {
				shape : window[type](_props),
			}
			
			boids.push(agent);
		}
	}
		
    var that = {
		distance : 3,
		center : {x:0, y:0, z:0},
		speedMax: 5,
		centerTendency:100,
		flockTendency: 100,
		boids : boids,
		shouldRotate : props.shouldRotate || false,	
		findVelocity : function() {
            var pvj = {
                x: 0,
                y: 0,
                z: 0
            };

            for (var i = 0; i < boids.length; i++) {
                var _boid = boids[i];
                pvj.x += _boid.velocity.x;
                pvj.y += _boid.velocity.y;
                pvj.z += _boid.velocity.z;
            }

            pvj.x /= boids.length - 1;
            pvj.y /= boids.length - 1;
            pvj.z /= boids.length - 1;
		
			this.averageVelocity = pvj;
		},
		findCenter : function() {
			var vc = {x:0, y:0, z:0};
			
            for (var i = 0; i < boids.length; i++) {
                var _boid = boids[i];
                vc.x += _boid.shape.x;
                vc.y += _boid.shape.y;
                vc.z += _boid.shape.z;
            }
			
            vc.x /= boids.length - 1;
            vc.y /= boids.length - 1;
            vc.z /= boids.length - 1;
			
			this.averageCenter = vc;
		},
        rules: [
        function(boid) {
			var vc = that.averageCenter;
			
            var result = {
                x: (vc.x - boid.shape.x) / that.flockTendency,
                y: (vc.y - boid.shape.y) / that.flockTendency,
                z: (vc.z - boid.shape.z) / that.flockTendency,
            };
			
            return result;
        },

        function(boid) {
            var c = {
                x: 0,
                y: 0,
                z: 0
            };
            //for (var i = 0; i < boids.length; i++) {
                //var _boid = boids[i];
				var _boid = boid.id < boids.length - 2 ? boids[boid.id + 1] : boids[0];
                if (_boid.id !== boid.id) {
                    var diff = {
                        x: _boid.shape.x - boid.shape.x,
                        y: _boid.shape.y - boid.shape.y,
                        z: _boid.shape.z - boid.shape.z,
                    };

                    if (Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2) + Math.pow(diff.z, 2)) < that.distance) {
                        c.x -= _boid.shape.x - boid.shape.x;
                        c.y -= _boid.shape.y - boid.shape.y;
                        c.z -= _boid.shape.z - boid.shape.z;
                    }
                }
				//}

            return c;
        },

        function(boid) {
            var pvj = that.averageVelocity;

            return {
                x: (pvj.x - boid.velocity.x) / 8,
                y: (pvj.y - boid.velocity.y) / 8,
                z: (pvj.z - boid.velocity.z) / 8
            }

        },
		
        function(boid) {
            return {
                x: (that.center.x - boid.shape.x) / that.centerTendency,
                y: (that.center.y - boid.shape.y) / that.centerTendency,
                z: (that.center.z - boid.shape.z) / that.centerTendency,
            }
        }, ],
		
		limit: function(boid) {
			var lim = that.speedMax;
			var v = Math.sqrt(Math.pow(boid.velocity.x, 2) + Math.pow(boid.velocity.y, 2) + Math.pow(boid.velocity.z, 2));
			
			if(v > lim) {
				boid.velocity.x /= Math.sqrt( Math.pow(boid.velocity.x, 2) ) * lim;
				boid.velocity.y /= Math.sqrt( Math.pow(boid.velocity.y, 2) ) * lim;
				boid.velocity.z /= Math.sqrt( Math.pow(boid.velocity.z, 2) ) * lim;
			}
		},

        update: function() {
			this.findCenter();
			this.findVelocity();
			
            for (var i = 0; i < boids.length; i++) {
                var boid = boids[i];
				
                for (var j = 0; j < this.rules.length; j++) {
					var v = this.rules[j](boid);
					
                    boid.velocity.x += v.x;
                    boid.velocity.y += v.y;
                    boid.velocity.z += v.z;
                }
				
				this.limit(boid);
				
				if(this.shouldRotate) {
					var length = Math.sqrt( (boid.velocity.x * boid.velocity.x) + (boid.velocity.y * boid.velocity.y) + (boid.velocity.z * boid.velocity.z) );
					var normalizedVelocity = {
						x: boid.velocity.x / length,
						y: boid.velocity.y / length,
						z: boid.velocity.z / length,												
					}
					boid.shape.rotation = normalizedVelocity;
				}

                boid.shape.position.x += boid.velocity.x;
                boid.shape.position.y += boid.velocity.y;
                boid.shape.position.z += boid.velocity.z;
            };
        },
		
		reset : function() {
			boids.all( function() {
			    this.shape.x = rndf(-100, 100);
			    this.shape.y = rndf(-100, 100);
			    this.shape.z = rndf(-100, 100);
  
			    this.velocity = {x:0, y:0, z:0};
			});
		},
		
		_update : function() {},
		kill : function() {
			for(var i = 0; i < boids.length; i++) {
				var boid = boids[i];
				boid.shape.remove();
			}
			Graphics.graph.remove(this);
		},
		init : function() {
			for(var i = 0; i < boids.length; i++) {
				var boid = boids[i];
				boid.velocity = {x:0, y:0, z:0};
				boid.id = i;
			}
			Graphics.graph.push(this);
		},
    };
	
	that.init();
	
    return that;
};
