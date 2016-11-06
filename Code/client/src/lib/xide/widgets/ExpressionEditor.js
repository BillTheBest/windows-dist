define([
    'dcl/dcl',
    'xide/utils',
    'xide/widgets/WidgetBase',
    'xide/views/ConsoleView',
    'xide/views/_LayoutMixin'
], function (dcl,utils, WidgetBase, ConsoleView,_LayoutMixin) {

    var Module = dcl([WidgetBase,_LayoutMixin.dcl,ConsoleView.HandlerClass],{
        type:'javascript',
        reparent:false,
        consoleTabTitle:'Editor',
        consoleTabOptions:null,
        consoleTabType:'DefaultTab',
        EditorClass:null,
        declaredClass:'xide.widgets.ExpressionEditor',
        instantChanges:false,
        templateString: '<div class="" style="height: inherit">' +
        '<div attachTo="consoleParent" class="" style="height:inherit;padding: 0;margin: 0;"></div></div>',
        onAddEditorActions:function(evt){
            var actions  = evt.actions,
                owner  = evt.owner;

            var mixin = {
                addPermission:true
            }
            actions.push(owner.createAction({
                label: 'Send',
                command: 'Console/Send',
                icon: 'fa-paper-plane',
                group: 'Console',
                tab:'Home',
                mixin:mixin,
                handler:function(){
                    debugger;
                }
            }));


        },
        getConsoleClass:function(){
            return ConsoleView.ConsoleWidget;
        },
        startup:dcl.superCall(function(sup) {
            return function () {
                var res = sup.call(this);
                var thiz = this;
                this.EditorClass = this.EditorClass || dcl(ConsoleView.Editor,{});
                var storeDelegate = {
                    saveContent:function(value){
                        thiz.setValue(value);
                    }
                }

                this.editorArgs  = this.editorArgs || {
                        options:{
                            showGutter: false,
                            wordWrap: true
                        },
                        storeDelegate:storeDelegate
                    }

                var consoleTarget = this.consoleParent;
                var userData = this.userData;
                var value = userData.value || this.value;
                var _console = utils.addWidget(this.getConsoleClass(), {
                    delegate: this,
                    type: this.type,
                    value: value,
                    ctx:this.ctx
                }, this, consoleTarget, true);
                this.add(_console, null, false);

                this.instantChanges!== false && _console._on('change',function(_value){
                    if(value!==_value){
                        thiz.setValue(_value);
                    }
                });
                this.onCreatedConsole && this.onCreatedConsole(_console);
                this.console = _console;
                return _console;

            }
        })
    });
    dcl.chainAfter(Module,'onAddEditorActions');
    return Module;

});