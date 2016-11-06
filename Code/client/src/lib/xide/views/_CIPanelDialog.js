/** @module xgrid/Base **/
define([
    "dcl/dcl",
    'xide/utils',
    'xide/views/_Panel',
    'xide/views/CIView'
], function (dcl,utils,_Panel,CIView) {

    return dcl(_Panel,{
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
        CIViewClass:CIView,
        CIViewOptions:{},
        onShow:function(panel,contentNode,instance){
            this.changedCIS = [];
            var self = this;
            this.cisView = utils.addWidget(this.CIViewClass, utils.mixin({
                delegate: this,
                resizeToParent:true,
                ciSort:false,
                options: {
                    groupOrder: {
                        'General': 1,
                        'Send': 2,
                        'Advanced': 4,
                        'Description': 5
                    }
                },
                cis: this.cis
            },this.CIViewOptions), this, contentNode, false);
            self.add(this.cisView,null,false);
            this.cisView.startup();
            this.cisView.startDfd.then(function(){
                self.resize();
            });
            //collect changed CIs
            this.cisView._on('valueChanged', function (evt) {
                var ci = _.find(self.changedCIS,{ci:evt.ci});
                if(ci){
                    self.changedCIS.remove(ci);
                }

                self.changedCIS.push({
                    ci:evt.ci,
                    oldValue:evt.oldValue,
                    newValue:evt.newValue,
                    dst:evt.ci.dst,
                    props:evt.props
                });
            });

            return [this.cisView];
        }
    });

});