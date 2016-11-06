/** @module xgrid/Base **/
define([
    "dcl/dcl",
    'xide/utils',
    'xide/views/_Panel'
], function (dcl,utils,_Panel,CIView) {

    var Module = dcl(_Panel,{
        containerClass:'CIDialog',
        getDefaultOptions:function(mixin){
            var self = this;
            var options = {
                "contentSize": {
                    width: '600px',
                    height: '500px'
                },
                footerToolbar:[
                    {
                        item:     "<button style='margin-left:5px;' type='button'><span class='...'></span></button>",
                        event:    "click",
                        btnclass: "btn btn-danger btn-sm",
                        btntext:  " Cancel",
                        callback: function( event ){
                            event.data.close();
                            self.onCancel();
                        }
                    },
                    {
                        item:     "<button style='margin-left:5px;' type='button'><span class='...'></span></button>",
                        event:    "click",
                        btnclass: "btn btn-primary btn-sm",
                        btntext:  " Ok",
                        callback: function( event ){
                            self.onOk(self.changedCIS);
                            event.data.close();
                        }
                    }
                ]
            };
            utils.mixin(options,mixin);
            return options;
        },
        onShow:function(panel,contentNode,instance){

        }
    });

    dcl.chainAfter(Module,"onShow");
    return Module;
});