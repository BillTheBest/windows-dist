define([
    'dcl/dcl',
    "xdojo/declare",
    'xide/utils'
], function (dcl,declare, utils) {

    var _debug = false;

    var Implementation = {
        declaredClass:"xide.widgets._ActionValueMixin",
        mapping:null,
        getMapping:function(){

            if(!this.mapping){
                this.mapping = utils.clone(this.defaultMapping);
            }
            return this.mapping;
        },
        propertyFromMap:null,
        propertyToMap:{
            value:{
                name:"checked",
                value:true
            }
        },
        /**
         * Callback when source has changed. This is normally called
         * in Source::updateReferences due to a change in another
         * referencing widget.
         *
         * @param property {string} The property
         * @param value {object|null}
         */
        onSourceChanged:function(property,value){


            var thiz = this,
                action = thiz.item,
                trigger = thiz.getMapping()[action._originEvent];

            //trigger check
            if(!trigger || trigger.input.from!==property){
                return false;
            }

            //1. determine the widget's target property:
            //
            var toField = trigger.input.to;

            //2. determine the widget's target's property value

            var toValue  = trigger.input.value;
            if(toValue==null){
                toValue = value;
            }else if(typeof toValue =='function'){
                toValue = toValue.apply(this,[action._originEvent,value,trigger]);
            }

            //set lock
            action._isReferenceUpdate = true;

            _debug && console.log('source changed ' +property + ' = ' + value + '|| toField='+toField + '  | toValue='+toValue);

            this.set(toField,toValue);

            //unlock
            action._isReferenceUpdate = false;
            return true;
        },
        destroy:function(){
            this.item.removeReference(this);
            this.inherited(arguments);
        },
        _onWidgetChange:function(event,widget,value){
            var thiz = this,
                action = thiz.item,
                mapping= thiz.getMapping()[event];

            //trigger check
            if(!mapping){
                return false;
            }

            if(action._isReferenceUpdate){
                console.log('is reference update, skip');
                return;
            }


            //1. determine the action's target property:
            // mapping's default is "value"
            var toField = mapping.output.to,
                ignore=mapping.output.ignore;

            if(typeof ignore ==='function'){

                if(ignore.apply(widget,[event,value,mapping])===true){
                    console.log('ignore update');
                    return;
                }
            }


            //2. determine the action's target's property value

            var toValue  = mapping.input.value;
            if(toValue==null){
                toValue = value;
            }else if(typeof toValue =='function'){
                toValue = toValue.apply(widget,[event,value,mapping]);
            }

            action._originReference = this;
            action._originEvent = event;

            //set lock

            console.log('update source' + 'toField='+toField + '  | toValue= | invalue = ',action);
            action.set(toField,toValue);
            action._originReference = null;

        },

        bindWidget:function(widget){


            widget._store = this.item._store;
            widget.on('change',function(val){
                this._onWidgetChange('change',widget,val);
            }.bind(this));

        },
        startup: function () {

            this.inherited(arguments);
            if(this.renderer) {

            }else{
                this.bindWidget(this);
            }
        }
    };

    var Module = dcl(null,Implementation);

    Module.createTriggerSetting = function(from,to,value){
        return {
            //the source action property
            from: from || "value",

            //the widget target property
            to: to || "checked",
            /**
             * if not specified, trigger event's value
             * goes direct into the action's value
             */
            value: value || null
        }
    };

    Module.defaultTriggerInput = Module.createTriggerSetting('value','checked');
    Module.defaultTriggerOutput = Module.createTriggerSetting('checked','value');
    Module.prototype.defaultMapping = Module.defaultMapping = {

        "change":{

            //from Action to Widget
            input: Module.defaultTriggerInput,


            //from Widget to Action
            output: Module.defaultTriggerOutput
        }
    };
    return Module;
});