/** @module xgrid/Base **/
define([
    "dcl/dcl",
    'xide/types',
    'xide/utils',
    'dojo/Deferred',
    'xide/widgets/JSONDualEditorWidget',
    'xide/editor/Base'
], function (dcl,types,utils, Deferred,JSONDualEditorWidget,EditorBase){
    return dcl([EditorBase],{
        widget:null,
        createEditor:function(_options,value){
            var ci = {
                value:value
            };
            this.widget = utils.addWidget(JSONDualEditorWidget,{
                userData:ci,
                dfd:this.dfd,
                item:this.item
            },null,this.domNode,false);

            this.add(this.widget,null,false);
            this.widget.startup();
        },
        getActionStore:function(){
            var editorWidget = this.widget.editorWidget;
            return editorWidget.aceEditor.getActionStore();
        },
        startup:function(){

            this.dfd = new Deferred();
            var self = this;
            this.dfd.then(function(){
                var editorWidget = self.widget.editorWidget;
                var oldAction = editorWidget.aceEditor.runAction;

                editorWidget.aceEditor.runAction=function(action){

                    if(action.command===types.ACTION.SAVE){
                        var value = self.widget.getValue();
                        self.saveContent(value);
                    }
                    return oldAction.apply(editorWidget.aceEditor,[action]);
                };
                if(self.ctx && self.registerView){
                    self.ctx.getWindowManager().registerView(self);
                }
            });
            return this.dfd;
        }
    });
});