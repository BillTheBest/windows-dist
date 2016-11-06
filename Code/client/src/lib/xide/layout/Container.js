define([
    'dcl/dcl',
    "xide/_base/_Widget"
], function (dcl,_Widget) {

    var Module = dcl(_Widget,{
        declaredClass:'xide.layout.Container',
        resizeToParent:true,
        templateString:'<div attachTo="containerNode" class="widget" style="height: inherit"/>'
    });
    dcl.chainAfter(Module,'destroy');
    return Module;
});
