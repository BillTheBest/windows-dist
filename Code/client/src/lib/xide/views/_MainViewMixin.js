define([
    'dcl/dcl',
    "xdojo/declare",
    "dojo/_base/lang",
    'xide/types',
    'xide/utils',
    'xide/widgets/ActionToolbar',
    'xide/widgets/MainMenu',
    'xide/mixins/_BeanHistory'
], function (dcl,declare, lang, types, utils,ActionToolbar, MainMenu, _BeanHistory) {

    /**
     * Shared stuff between a regular main view and classes which do things different
     */
    return dcl([_BeanHistory], {
        declaredClass:"xide.views._MainViewMixin",
        getMenu:function(){
            return this.mainMenu;
        },
        globalPanelMixin: {},
        getDefaultStoreOptions: function () {
            return this.defaultStoreOptions || this.config['DEFAULT_STORE_OPTIONS'];
        },

        //////////////////////////////////////////////////
        //
        //  Cleanup
        //
        clear: function () {

            utils.destroy([
                this.centerTabContainer,
                this.centerPanel,
                this.leftPanel,
                this.toolbar,
                this.bottomTabContainer,
                this.breadCrumb,
                this.mainMenu
            ], true, this);

            this._contextChanged = true;

            if (this.layoutTop) {
                $(this.layoutTop.containerNode).empty();
            }

            if (this.layoutCenter) {
                $(this.layoutCenter.containerNode).empty();
            }
        },
        //////////////////////////////////////////////////
        //
        //  Toolbar
        //
        //////////////////////////////////////////////////
        //
        //  Main menu
        //
        _createMainMenu: function (config, container, mixin) {

            var _args = {
                _permanentActionStore:this.ctx.getActionStore(),
                ctx:this.ctx
            };


            utils.mixin(_args, mixin);


            this.mainMenu = utils.addWidget(MainMenu, _args, this, container, true);

            this.publish(types.EVENTS.ON_MAIN_MENU_READY, {
                widget: this.mainMenu,
                owner: this
            });

            return this.mainMenu;

        },
        //////////////////////////////////////////////////
        //
        //  Logging
        //
        _createLogItem: function (item, message, parent, terminatorMessage) {

            if (this.ctx.logManager) {
                var _message = {
                    message: message,
                    level: 'info',
                    type: 'File Operation',
                    terminatorItem: item,
                    terminatorMessage: terminatorMessage,
                    showProgress: false,
                    details: item
                };
                this.publish(types.EVENTS.ON_SERVER_LOG_MESSAGE, _message);
            }
        },
        onDeleteBegin: function (data) {
            var items = data.items;
            var message = this.translate('removing') + ' ' + items.length + ' ' + this.translate('items');
            this._createLogItem(items, message, null, types.EVENTS.ON_DELETE_END);
        },
        onMoveBegin: function (data) {

            var items = data.items;
            var message = this.translate('moving') + ' ' + items.length + ' ' + this.translate('items') + ' ' + this.translate('to') + ' ' + data.dst;
            this._createLogItem(items, message, null, types.EVENTS.ON_MOVE_END);
        },
        onCompressBegin: function (data) {
            var items = data.items;
            var message = this.translate('compressing') + ' ' + items.length + ' ' + this.translate('items');
            this._createLogItem(items, message, null, types.EVENTS.ON_COMPRESS_END);

        },
        onDownloadToBegin: function (data) {
            var message = this.translate('Downloading') + ' ' + data.url + ' to ' + data.dstPath;
            this._createLogItem(data.dst, message, null, types.EVENTS.ON_DOWNLOAD_TO_END);
        },
        onCopyBegin: function (data) {

            var items = data.items;
            var message = this.translate('copying') + ' ' + items.length + ' ' + this.translate('items') + ' ' + this.translate('to') + ' ' + data.dst;
            this._createLogItem(items, message, null, types.EVENTS.ON_COPY_END);
        },
        onUploadBegin: function (data) {

            var item = data.item,
                eventKeys = types.EVENTS;

            if (this.ctx.logManager) {
                var _message = {
                    message: 'Uploading ' + item.file.name + ' to ' + item.dstDir,
                    level: 'info',
                    type: 'File Operation',
                    terminatorItem: item,
                    terminatorMessage: types.EVENTS.ON_UPLOAD_FINISH,
                    showProgress: true,
                    progressMessage: types.EVENTS.ON_UPLOAD_PROGRESS,
                    progressFailedMessage: types.EVENTS.ON_UPLOAD_FAILED,
                    details: {
                        to: utils.buildPath(item.mount, item.file.name, false),
                        mount: item.mount,
                        dstDir: item.dstDir,
                        size: item.file.size
                    }
                };
                //_message.details[item.file.name] = item.dstDir;
                this.publish(types.EVENTS.ON_SERVER_LOG_MESSAGE, _message);
            }
        },
        //////////////////////////////////////////////////
        //
        //  Bean Event Registration
        //

        /**
         * Update toolbar & main menu
         * @param items
         * @param owner
         * @param actions
         * @param where
         */
        updateItemActions: function (items, owner, actions, where) {


            console.warn('updateItemActions called,abort');

        },
        onActionContextChanged: function (evt) {
            this._contextChanged = true;
        },
        _lastItem: null,
        _lastOwner: null,

        onItemSelected: function (evt) {


        },
        _onItemSelected: function (evt, clear) {


        },
        onViewShow: function (evt) {


        },
        shouldChangeActionContext: function (item) {
            return !!(item && !item._S);

        },
        //////////////////////////////////////////////////
        //
        //  Event Registration
        //
        registerBeanEvents: function () {

            var thiz = this;
            this.subscribe(types.EVENTS.ON_VIEW_SHOW, this.onViewShow);

        },
        /**
         *
         */
        registerFileOperationEvents: function () {

            var evenKeys = types.EVENTS;//chache

            this.subscribe(evenKeys.ON_COPY_BEGIN, this.onCopyBegin);
            this.subscribe(evenKeys.ON_DELETE_BEGIN, this.onDeleteBegin);
            this.subscribe(evenKeys.ON_MOVE_BEGIN, this.onMoveBegin);
            this.subscribe(evenKeys.ON_COMPRESS_BEGIN, this.onCompressBegin);
            this.subscribe(evenKeys.ON_DOWNLOAD_TO_BEGIN, this.onDownloadToBegin);
        },


        //////////////////////////////////////////////////
        //
        //  UI-Utils
        //
        _resizeContainer: function (container, name) {
            try {
                if (container && container.domNode) {
                    container.resize();
                } else {
                }
            } catch (e) {
            }
        },

        //////////////////////////////////////////////////
        //
        //  Accessor(s)
        //
        getPanelManager: function () {
            return this.panelManager;
        },
        getCookiePrefix: function (forSuffix) {
            return (this.beanContextName || '' ) + '_' + forSuffix;
        },
        //////////////////////////////////////////////////
        //
        //  Event filtering
        //
        isMyBeanContext: function (evtData) {
            return !(evtData.beanContextName && this.beanContextName && evtData.beanContextName !== this.beanContextName);
        },
        //////////////////////////////////////////////////
        //
        //  Widget Creation
        //
        createPanel: function (panelOptions, dstContainer, cookiePrefix, region, mixins) {


        },
        //////////////////////////////////////////////////
        //
        //  Layout and panel creation
        //
        _prepareLayout: function (config) {

            var thiz = this;

            if (config.LAYOUT_PRESET == types.LAYOUT_PRESET.SINGLE ||
                config.LAYOUT_PRESET == types.LAYOUT_PRESET.PREVIEW ||
                config.LAYOUT_PRESET == types.LAYOUT_PRESET.GALLERY) {
                this.layoutMain.removeChild(this.layoutLeft);
                this.layoutLeft = null;
            }

            if (config.LAYOUT_PRESET == types.LAYOUT_PRESET.EDITOR ||
                config.LAYOUT_PRESET == types.LAYOUT_PRESET.DUAL ||
                config.LAYOUT_PRESET == types.LAYOUT_PRESET.BROWSER) {

                if (this.layoutLeft == null) {

                    this.layoutLeft = new ContentPane({
                        className: "layoutLeft filePanelLayoutcontainer",
                        region: 'leading',
                        splitter: true
                    },null,this.layoutMain);
                    //this.layoutMain.addChild(this.layoutLeft);
                    this.layoutLeft = utils.addWidget(ContentPane,{
                        className: "layoutLeft filePanelLayoutcontainer",
                        region: 'leading',
                        splitter: true
                    },null,this.layoutMain);

                    //this.layoutMain.addChild(this.layoutLeft);


                }
            }

            if (config.PANEL_OPTIONS != null && config.PANEL_OPTIONS.ALLOW_INFO_VIEW === false) {
                this.layoutMain.removeChild(this.layoutRight);
                this.layoutRight = null;
            }

            if (config.PANEL_OPTIONS != null &&
                (
                (config.PANEL_OPTIONS.ALLOW_MAIN_MENU && config.PANEL_OPTIONS.ALLOW_BREADCRUMBS === false) ||
                config.PANEL_OPTIONS.ALLOW_BREADCRUMBS === 0) && (config.ACTION_TOOLBAR_MODE == null || config.ACTION_TOOLBAR_MODE != 'self')
            ) {
                this.layoutMain.removeChild(this.layoutTop);
                this.layoutTop = null;
            } else {
                if (this.layoutTop._splitterWidget) {
                    utils.destroy(this.layoutTop._splitterWidget);
                    this.layoutTop._splitterWidget = null;
                }
            }

            if (config.PANEL_OPTIONS != null && config.PANEL_OPTIONS.ALLOW_LOG_VIEW === false) {
                this.layoutMain.removeChild(this.layoutBottom);
            } else {
                if (this.layoutBottom._splitterWidget) {
                    this.layoutBottom._splitterWidget.fullSize = '150px';
                    this.layoutBottom._splitterWidget.collapsedSize = null;
                    if (!this.bottomTabContainer) {
                        this.bottomTabContainer = this._createBottomTabContainer();

                        var logManager = this.ctx.getLogManager();
                        if (logManager) {
                            this.logPanel = logManager.openLogView(this.bottomTabContainer, true);
                        } else {

                            this.logPanel = utils.addWidget(ContentPane, {
                                className: "bottomTabLog ui-widget-content",
                                title: 'Log',
                                style: "padding:0;",
                                parentContainer: this.bottomTabContainer
                            }, null, this.bottomTabContainer, true);

                            setTimeout(function () {
                                if (thiz.logPanel.getItemActions) {
                                    thiz.logPanel.getItemActions();
                                }
                            }, 2000);
                        }
                    }
                }
            }
        },
        /**
         * @TOOD: make this as api of Layout container
         * @param show
         * @param child
         */
        showBottom: function (show, child) {




        },
        getBottomTabContainer: function () {
            return this.layoutBottom;
        },
        getLayoutRightMain: function () {


        },
        getNewAlternateTarget: function (item, panel) {


        },
        _createPanels: function (config, parseUrl) {



        },
        _resizeToWindow:function(){

            var target = $('#root')[0];

            utils.resizeTo(target,window,true,true);

            if(this.layoutMain) {

                utils.resizeTo(this.layoutMain, target, true, true);
                this.layoutMain.resize();
                var _total = $('#root').height();
                _total-=this.extraBottomHeight;
                var _toolbar = $(this.layoutTop.domNode).height();
                $(this.layoutCenter.domNode).css('height', _total - _toolbar);

            }

            if(this.docker){
                this.docker.resize();
            }


        },
        startup:function(){

            var thiz = this;

            try {
                function _resize() {
                    thiz._resizeToWindow();
                    setTimeout(function () {
                        thiz.publish(types.EVENTS.RESIZE, {}, this);
                    }, 500);
                }

                $(window).resize(function () {
                    return thiz.debounce('resize', _resize.bind(thiz), 1000, null);
                });

                //this.subscribe(types.EVENTS.RESIZE,this.onResize);

                this.inherited(arguments);
            }catch(e){
                console.error('error',e);
                logError(e,'error starting mainview');
            }
        }

    });
});