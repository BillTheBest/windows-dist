define([
    'dcl/dcl',
    "xdojo/declare",
    'dojo/has',
    'dojo/_base/connect',
    "xide/widgets/TemplatedWidgetBase",
    'xide/types',
    'xide/utils',
    'xide/factory',
    'xdocker/Docker2',
    'xaction/ActionStore',
    'xide/widgets/Ribbon',
    "dojo/window"
], function (dcl,declare,has, connect, TemplatedWidgetBase, types, utils, factory,Docker2,ActionStore,Ribbon,win) {

    return dcl(TemplatedWidgetBase, {
        declaredClass:"xide.views.MainView",
        config: null,
        ctx: null,
        layoutMain: null,
        layoutTop: null,
        layoutLeft: null,
        layoutCenter: null,
        layoutRight: null,
        layoutBottom: null,
        toolbar: null,
        preventCaching: true,
        panelManager: null,
        leftPanel: null,
        centerPanel: null,
        centerTabContainer: null,
        breadCrumb: null,
        bottomTabContainer: null,
        logPanel: null,
        layoutBottomPlaceHolder: null,
        initialReload: false,
        persistent: false,
        _restoredPermaItems: 0,
        rightBorderContainer: null,
        rightTopTabParent: null,
        rightTopTabContainer: null,
        rightBottomContainer: null,
        rightBottomTabContainer: null,
        layoutRightPlaceHolder: null,
        leftTabContainer: null,
        leftMainContainer: null,
        leftLayoutTopContainer: null,
        leftLayoutBottomContainer: null,
        docker: null,
        mainMenu: null,
        beanContextName: "main",
        extraBottomHeight : 0,
        templateString: "<div>" +
        "<div data-dojo-attach-point='layoutMain' data-dojo-type='xide.layout.BorderContainer' data-dojo-props=\"design:'headline'\" class='layoutMain '/>",
        _openRight: function () {
            return true;
        },
        getLeftTabContainer: function () {
            return this.leftTabContainer;
        },
        getLeftMainContainer: function () {
            return this.leftMainContainer;
        },
        getLeftLayoutTopContainer: function () {
            return this.leftLayoutTopContainer;
        },
        getLeftLayoutBottomContainer: function () {
            return this.leftLayoutBottomContainer;
        },
        getRightBottomTarget: function (clear, open, single) {
            return null;
        },
        getLayoutRightMain: function (style, className) {
            return null;
        },
        getNewAlternateTarget: function () {
            return this.layoutCenter;
        },
        prepareLayout: function (config) {
        },
        _getState: function (region, data) {

            for (var i = 0; i < data.length; i++) {
                if (data[i].region == region) {
                    return data[i].state;
                }
            }

            return null;

        },
        _restoreSplitter: function () {},
        _restoreToggleSplitters: function () {
        },
        createPanels: function (config) {
        },
        createBreadCrumb: function (config) {},

        initWithConfig: function (config) {
        },
        removeEmptyContainers: function () {
        },
        startup: function () {
            try {
                this.inherited(arguments);
            }catch(e){
                logError(e);
            }
        },
        _resizeContainer: function (container, name) {
        },
        _fixToolbar: function () {
        },
        resize: function () {
            this.inherited(arguments);
            this.layoutMain.resize();
            if (this.docker) {
                this.docker.resize();
            }
        },
        _createBottomTabContainer: function () {
        },
        showLogPanel: function () {
        },
        repaint: function (evt, parent) {
        },
        ///////////////////////////////////////////////////////////
        //
        //  Commons
        //
        getDocker: function () {
            return this.docker;
        },
        _createDocker: function (where) {
            return new Docker2.createDefault($(this.layoutCenter.containerNode), {
                ctx: this.ctx,
                uuid: 'main view docker'
            });
        },
        getActionStore:function(){},
        getRibbon:function(){
            return this.toolbar;
        },
        getToolbar:function(){
            return this.toolbar;
        },
        _onResize:function(){
            this.layoutMain.resize();
        },
        createWidgets: function () {

            this.initMainMenu();

            if(!has('ribbons')) {
                //this.initToolbar();
            }else{

                this.toolbar =  utils.addWidget(Ribbon,{
                    store:new ActionStore({}),
                    flat:false
                },this,this.layoutTop,true);


                var self = this,
                    toolbar = this.toolbar;

                toolbar._on('RibbonClosed',function(evt){
                    self._onResize();
                    self.resize();
                });

                toolbar._on('RibbonExpand',function(evt){
                    self._onResize();
                    self.resize();
                });

                toolbar._on('setActionEmitter',function(evt){
                    self._onResize();
                    self._resizeToWindow();
                    if(toolbar.isOpen) {
                        setTimeout(function () {
                            factory.publish(types.EVENTS.RESIZE, {
                                force: true
                            });
                        }, 10);
                    }
                });
                this.toolbar._on(types.EVENTS.RESIZE,function(evt){
                    self._onResize();
                });
            }
        }
    });
});