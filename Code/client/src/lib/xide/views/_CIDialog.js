/** @module xgrid/Base **/
define([
    "dcl/dcl",
    'xide/types',
    'xide/utils',
    'xide/views/_Dialog',
    'xide/views/CIView'

], function (dcl,types,utils,_Dialog,CIView) {

    var Module =dcl(_Dialog, {
        declaredClass:'xide/views/_CIDialog',
        type: types.DIALOG_TYPE.INFO,
        size: types.DIALOG_SIZE.SIZE_NORMAL,
        bodyCSS: {
            'height': 'auto',
            'min-height': '200px',
            /*'width':'600px',
             'min-width':'600px',*/
            'padding': '8px',
            'margin-right': '16px'
        },
        cssClass:'bootstrap3-dialog CIDialog',
        failedText:' Failed!',
        successText:': Success!',
        showSpinner:true,
        spinner:'  <span class="fa-spinner fa-spin"/>',
        notificationMessage:null,
        cisView:null,
        getData:function(){
            var cis = this.cisView.getCIS();
            for (var i = 0; i < cis.length; i++) {
                var obj = cis[i];
                if (obj._widget) {
                    delete obj['_widget'];
                }
            }
            return cis;
        },
        getField:function(name){
            var cis = this.cisView.cis,
                ci = utils.getCIByChainAndName(cis,0,name),
                value = ci ? ci.value :null,
                invalid = null;
                if(ci){
                    invalid = ci.invalid == true;
                }
            return invalid ? null : value;
        },
        onShow:function(dlg){
            var cisView = this.cisView,
                self = this;
            cisView.startup();
            this.resize();
            this.startDfd.resolve();
        },
        onReady:function(){},
        message:function(dlg){
            var thiz = dlg.owner;
            //if(!thiz.cis){}
            var cisView = thiz.initWithCIS(thiz.cis);
            thiz.cisView = cisView;
            return $(cisView.domNode);
        },
        initWithCIS: function (cis) {

            cis = cis || [];

            var viewArgs = {
                delegate: this,
                options: {},
                cis: cis.inputs || cis,
                style: 'height:inherit',
                tabContainerStyle: 'height:inherit',
                resizeToParent:true

            },self = this;
            utils.mixin(viewArgs, this.viewArgs);
            var view = utils.addWidget(CIView, viewArgs, this.containerNode, null, false);

            self.onCIValueChanged && view._on('valueChanged',function(e){
                self.onCIValueChanged(e.ci, e.newValue, e.oldValue);
            });

            view._on('widget',function(e){
                self._emit('widget',e);
            });

            this.add(view);
            return view;
        }

    });


    dcl.chainAfter(Module, "onReady");
    dcl.chainAfter(Module, "onOk");
    dcl.chainAfter(Module, "onCancel");
    dcl.chainAfter(Module, "resize");
    dcl.chainAfter(Module, "onCIValueChanged");
    dcl.chainAfter(Module, "onShow");


    return Module;

});