define([
    'dcl/dcl',
    "dojo/_base/declare",
    'xide/utils',
    'xide/widgets/TemplatedWidgetBase',
    './_ActionValueWidgetMixin'
    //"dojo/text!./templates/ActionValueWidget.html"
], function (dcl,declare, utils,TemplatedWidgetBase,_ActionValueWidgetMixin) {

    var Module = dcl([TemplatedWidgetBase,_ActionValueWidgetMixin], {
        declaredClass:"xide.widgets.ActionValueWidget",
        //templateString:Template,
        renderer:null,
        iconNode: null,
        linkNode: null,
        label: null,
        widget:null,
        widgetNode:null,
        widgetArgs:{},
        _setIconClassAttr: { node: "iconNode", type: "class" },
        set:function(what,value){

            this.inherited(arguments);

            if(this.widget){
                this.widget.set(what,value);
            }
        },
        get:function(what){
            if(this.widget){
                return this.widget.get(what);
            }
        },
        _setLabelAttr: function(/*String*/ content){
            // summary:
            //		Hook for set('label', ...) to work.
            // description:
            //		Set the label (text) of the button; takes an HTML string.
            this._set("label", content);
            var labelNode = this.containerNode || this.focusNode;
            labelNode.innerHTML = content;
        },
        constructor:function(args){
            this.widgetArgs = args;
        },
        createWidget:function(){

            this.widget = utils.addWidget(this.renderer,this.widgetArgs,this,this.widgetNode,true);
            this.bindWidget(this.widget);
        },
        startup: function () {

            this.inherited(arguments);
            if(this.renderer) {
                this.createWidget();
            }
        }
    });

    Module.defaultMapping = Module.prototype.defaultMapping = _ActionValueWidgetMixin.defaultMapping;
    Module.createTriggerSetting = Module.prototype.createTriggerSetting = _ActionValueWidgetMixin.createTriggerSetting;

    return Module;
});