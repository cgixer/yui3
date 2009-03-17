YUI.add("queue-io",function(B){var A=B.Queue.prototype._init;B.mix(B.Queue.prototype,{_init:function(){this.before("executeCallback",this._bindIOListeners);this.after("executeCallback",this._detachIOStartListener);return A.apply(this,arguments);},_waiting:null,_ioStartSub:null,_ioSuccessSub:null,_ioFailureSub:null,_ioAbortSub:null,_shiftSub:null,isReady:function(){return !this._tId&&!this._waiting;},_bindIOListeners:function(C){if(C.waitForIOResponse){this._ioStartSub=B.on("io:start",B.bind(this._ioStartHandler,this));this._ioSuccessSub=B.on("io:success",B.bind(this._ioEndHandler,this));this._ioFailureSub=B.on("io:failure",B.bind(this._ioEndHandler,this));this._ioAbortSub=B.on("io:abort",B.bind(this._ioEndHandler,this));this._shiftSub=this.before("shiftCallback",this._detachIOListeners);}},_detachIOStartListener:function(C){if(this._ioStartSub){this._ioStartSub.detach();}},_ioStartHandler:function(C){this._waiting=this._waiting||{};this._waiting[C]=true;},_ioEndHandler:function(E){var D=!this._waiting,C=this;if(!D){delete this._waiting[E];D=!B.Object.keys(this._waiting).length;}if(D){this._waiting=null;setTimeout(function(){C.run();},0);}},_detachIOListeners:function(){this._ioSuccessSub.detach();this._ioFailureSub.detach();this._ioAbortSub.detach();this._shiftSub.detach();}},true);},"@VERSION@",{requires:["queue-full","io-base"]});