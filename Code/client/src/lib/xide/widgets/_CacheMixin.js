define([
    'dcl/dcl',
    'dojo/_base/declare',
    "dojo/dom-style"
], function (dcl,declare, domStyle) {


    var _getStruct = function(widget,where){
        if(!widget){
            return null;
        }

        var node = widget.domNode || widget,
            widgetCache = dojo.byId(where);

        if(!node || !widgetCache){
            return null;
        }

        return {
            node:node,
            target:widgetCache
        }
    };


    return dcl(null,{

        declaredClass:"xide/widgets/_CacheMixin",
        cacheRoot:'widgetCache',
        park:function(widget){

            var _struct = _getStruct(widget,this.cacheRoot);
            if(!_struct){
                return false;
            }

            domStyle.set(_struct.node,'display','node');

            dojo.place(_struct.node, _struct.target);

            return true;
        },

        unpark:function(widget,where){

            var _struct = _getStruct(widget,this.cacheRoot);
            if(!_struct){
                return false;
            }

            domStyle.set(_struct.node,'display','');

            dojo.place(_struct.node, where);

            return true;

        }

    });
});