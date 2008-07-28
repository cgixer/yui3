YUI.add("queue",function(C){var B=Array.prototype.slice,A=Array.prototype.splice;C.Queue=function(){var D=this instanceof C.Queue?this:new C.Queue();D.q=[];return D.add.apply(D,arguments);};C.Queue.prototype={id:0,run:function(){var G=this.q[0],E;if(!G){this.fire("complete");return this;}else{if(this.id){return this;}}E=G.fn||G;if(typeof E==="function"){var D=G.timeout||0,F=this;if(D<0){this.id=D;if(G.until){for(;!G.until();){this._exec(E,G);}}else{if(G.iterations){for(;G.iterations-->0;){this._exec(E,G);}}else{this._exec(E,G);}}this._shift();this.id=0;return this.run();}else{if(G.until){if(G.until()){this._shift();return this.run();}}else{if(!G.iterations||!--G.iterations){this._shift();}}this.id=setTimeout(function(){F._exec(E,G);if(F.id){F.id=0;F.run();}},D);}}return this;},_exec:function(D,E){this.fire("beforeCallback",{fn:D,callback:E});D.call(this);this.fire("afterCallback",{fn:D,callback:E});},_shift:function(){this.fire("shiftCallback",this.q.shift());},add:function(){var D=C.Array(arguments,0,true);A.apply(this.q,[this.q.length,0].concat(D));this.fire("addCallback",D);return this;},pause:function(){clearTimeout(this.id);this.id=0;this.fire("pause");return this;},stop:function(){this.pause();this.q=[];this.fire("stop");return this;}};C.augment(C.Queue,C.Event.Target);},"@VERSION@");