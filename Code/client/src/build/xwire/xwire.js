//>>built
require({cache:{"xwire/main":function(){define("xwire/Binding xwire/Source xwire/Target xwire/WidgetSource xwire/WidgetTarget xwire/EventSource xwire/DeviceTarget".split(" "),function(){})},"xwire/Binding":function(){define(["dcl/dcl","xwire/_Base"],function(a,d){return a(d,{declaredClass:"xwire.Binding",source:null,target:null,accept:null,transform:null,destroy:function(){this.source&&this.source.destroy();this.target&&this.target.destroy();delete this.transform;delete this.accept},trigger:function(c){this.target&&
this.target.run(c)},start:function(){this.source&&(this.source.binding=this,this.source.start());this.target&&(this.target.binding=this,this.target.start())}})})},"xwire/_Base":function(){define(["dcl/dcl","xide/mixins/EventedMixin"],function(a,d){function c(b,f){for(var c=g(f),a=0,e=c.length;a<e;++a){var d=c[a];b=null==b?b:b[d]}return b}function g(b,f){return""===b?[]:"function"!==typeof b.splice?b.split("."):f?b.slice():b}return a([d.dcl],{declaredClass:"xwire._Base",constructor:function(b){for(var f in b)b.hasOwnProperty(f)&&
(this[f]=b[f])},getValue:function(b,f){return c(b,f)},setValue:function(b,f,a){var d=g(f,!0),e=d.pop();b=0<d.length?c(b,d):b;return Object(b)===b&&f?"function"===typeof b.set?b.set(e,a):b[e]=a:void 0}})})},"xwire/Source":function(){define(["dcl/dcl","xide/types","xwire/_Base"],function(a,d,c){return a(c,{declaredClass:"xwire.Source"})})},"xwire/Target":function(){define(["dcl/dcl","xwire/_Base"],function(a,d){var c=a(d,{declaredClass:"xwire.Target",binding:null,object:null,path:null,run:function(){},
start:function(){}});a.chainAfter(c,"run");return c})},"xwire/WidgetSource":function(){define(["dcl/dcl","dojo/base/_kernel"],function(a,d,c){return a(d,{declaredClass:"xwire.WidgetSource",trigger:null,object:null,onTriggered:function(a){var b=this;this.object&&!0===this.object.ignore?setTimeout(function(){b.object.ignore=!1},500):this.binding&&this.binding.trigger({value:a,source:this})},start:function(){var a=this;this.handle=c.connect(this.object,this.trigger,function(b){a.onTriggered(b)})},destroy:function(){this.handle.remove()}})})},
"xwire/WidgetTarget":function(){define(["dcl/dcl","xide/types","xwire/Target","xide/utils"],function(a,d,c,g){return a(c,{declaredClass:"xwire.WidgetTarget",targetFilter:null,binding:null,delegate:null,run:function(b){var a=null!==this.object&&null!=this.object.render,c=this.binding.accept?this.binding.accept.getFunction():null,d=this.binding.transform?this.binding.transform.getFunction():null;if(this.object){var e=b.value;null!=this.targetFilter&&this.targetFilter.length&&this.delegate&&this.delegate.resolveFilter&&
(e=this.delegate.resolveFilter(this.targetFilter,e,this.object));this.object.ignore=!0;if(!c||c.apply(this.delegate,[e,this.binding.accept,this.delegate,,this.object])){d&&(c=d.apply(this.delegate,[e,this.binding.transform,this.delegate,this.object]),null!==c&&void 0!==c&&(e=c));if(!a&&this.object.set)this.object.set(this.path,e);else if(this.object._set){if(this.object._set(this.path,e),a="set"+g.capitalize(this.path),this.object[a])this.object[a](e,b)}else this.object[this.path]=e;this.object.ignore=
!1}}}})})},"xwire/EventSource":function(){define(["dcl/dcl","xwire/Source","xide/mixins/EventedMixin"],function(a,d,c){return a([d,c.dcl],{declaredClass:"xwire.EventSource",trigger:null,path:null,filters:null,_started:!1,_matches:function(a,b){for(var c=0;c<b.length;c++)if(this.getValue(a,b[c].path)!==b[c].value)return!1;return!0},onTriggered:function(a){this.filters&&!this._matches(a,this.filters)||!this.path||(a=this.getValue(a,this.path),this.binding&&this.binding.trigger({value:a,source:this}))},
start:function(){this._started||(this.subscribe(this.trigger,this.onTriggered),this._started=!0)}})})},"xwire/DeviceTarget":function(){define(["dcl/dcl","xide/types","xwire/Target"],function(a,d,c){return a(c,{declaredClass:"xwire.DeviceTarget",variable:null,command:null,run:function(a){this.inherited(arguments);this.object&&(this.variable&&this.object.setVariable(this.variable,a.value,!1,!1,d.MESSAGE_SOURCE.GUI),this.command&&this.object.callCommand(this.command))}})})}}});
//# sourceMappingURL=xwire.js.map