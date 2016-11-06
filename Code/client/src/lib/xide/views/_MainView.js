define([
    'xide/types',
    'xdojo/has',
    'xdocker/Docker2',
    'dcl/dcl',
    'xide/utils',
    'xide/views/_LayoutMixin',
    'xide/_base/_Widget',
    'xaction/ActionProvider',
    //'xfile/Breadcrumb',
    'xide/widgets/MainMenu',
    'xide/widgets/ActionToolbar',
    'xide/widgets/Ribbon',
    'xide/registry',
    "wcDocker/iframe",
    "wcDocker/types",
    'dojo/text!./welcome.html',
    'xide/$'
], function (types, has, Docker, dcl, utils, _LayoutMixin, _Widget, ActionProvider, /*Breadcrumb*/MainMenu, ActionToolbar, Ribbon, registry, iframe, dTypes, _Welcome,$) {
    var ACTION = types.ACTION;
    var LayoutClass = dcl(null, {});

    var BorderLayoutClass = dcl(LayoutClass, {
        welcomePage: null,
        welcomeWidget: null,
        getLayoutMain: function (args, create) {
        },
        getLastTab: function () {
            var panels = this.getDocker().allPanels(),
                main = this.getLayoutMain();
            return _.find(panels, function (panel) {
                var canAdd = panel.option('canAdd');
                return panel != main && canAdd === true;
            });

        },
        /**
         * Std
         * @param args
         * @returns {module:xDocker/Panel2}
         */
        getNewDefaultTab: function (args) {
            var docker = this.getDocker(),
                main = this.getLayoutMain(),
                last = this.getLastTab();

            var DOCKER_TYPE = types.DOCKER;

            if (this.hasAction(ACTION.NAVIGATION)) {
                utils.mixin(args, {
                    target: this.layoutCenter,
                    location: DOCKER_TYPE.DOCK.STACKED,
                    tabOrientation: DOCKER_TYPE.TAB.TOP,
                    dynamic: true
                });
                return this.getDocker().addTab(null, args);
            }

            var targetTab = last || main;
            utils.mixin(args, {
                target: targetTab,
                location: DOCKER_TYPE.DOCK.STACKED,
                tabOrientation: DOCKER_TYPE.TAB.TOP
            });

            if (targetTab && targetTab.option('autoHideTabBar') === true) {
                targetTab.getFrame().showTitlebar(true);
                var title = targetTab.option('titleStacked');
                targetTab.title(title);
            }

            var tab = docker.addTab(null, args);
            setTimeout(function () {
                docker.resize();
            }, 100);
            return tab;
        },
        createWidgets: function () {

            var top = this.layoutTop;
            if (this.hasAction(ACTION.MAIN_MENU)) {
                var _args = {
                    style: 'height:auto',
                    resizeToParent: false,
                    actionStores: [this.ctx.getActionStore()]
                };
                this.mainMenu = utils.addWidget(MainMenu, _args, this, top, true);
                $(this.mainMenu.domNode).css({
                    'height': 'auto',
                    'min-height': 31
                });
            }/*
            if (this.hasAction(ACTION.RIBBON)) {
                top.resizeToChildren = true;
                this.toolbar = utils.addWidget(Ribbon, {
                    cssClass:'MainRibbonToolbar',
                    //actionStores: [this.ctx.getActionStore()],
                    actionFilter: {
                        quick: true
                    }
                }, null, top, true);
            }
            */
            if (this.hasAction(ACTION.TOOLBAR)) {
                //top.minHeight()
                this.toolbar = utils.addWidget(ActionToolbar, {
                    //attachToGlobal: true,
                    visibility: types.ACTION_VISIBILITY.QUICK_LAUNCH,
                    actionFilter: {
                        quick: true
                    },
                    _hide: false
                }, null, top, true);
                $(this.toolbar.domNode).css({
                    'margin-right': '16px'
                });
                this.toolbar.$navigation.addClass('quickToolbar');
            }

            if (this.hasAction(ACTION.BREADCRUMB)) {

                return;
                /*
                 var breadcrumb = utils.addWidget(Breadcrumb, {
                 resizeToParent: false
                 }, null, top, true);

                 breadcrumb.resizeToParent = false;
                 top._parent.$container.css({
                 padding:0
                 });
                 var _frame = top.getFrame();
                 _frame.$frame.css({
                 'border-radius':0
                 })

                 var bcNode = $(breadcrumb.domNode);
                 $(breadcrumb.domNode).css({
                 'height':'auto',
                 'width':'40%'
                 //'float':'left'
                 });
                 this.breadcrumb = breadcrumb;
                 */
            }
            top && top.resize();

        },
        createBottom: function () {
            var layoutBottom = this.getDocker().addPanel('DefaultTab', types.DOCKER.DOCK.BOTTOM, null, {
                w: '33%',
                h: '20px',
                title: '&nbsp;&nbsp;',
                mixin: {
                    _scrollable: {
                        x: false,
                        y: false
                    }
                }
            });
            layoutBottom._minSize.y = 40;
            this.layoutBottom = layoutBottom;
            layoutBottom.minSize(null, 30);
            layoutBottom.maxSize(null, 30);
            layoutBottom.closeable(false);
            layoutBottom.resizeToChildren = false;
            layoutBottom.getFrame().showTitlebar(false);
            return layoutBottom;
        },
        createLayout: function (docker, permissions) {
            var self = this,
                top;
            if (this.hasAction(ACTION.BREADCRUMB) || this.hasAction(ACTION.MAIN_MENU) || this.hasAction(ACTION.RIBBON)) {
                top = this.layoutTop = docker.addPanel('DefaultFixed', types.DOCKER.DOCK.TOP, null, {
                    h: 50,
                    title: '&nbsp;&nbsp;',
                    canAdd: false,
                    mixin: {
                        _scrollable: {
                            x: false,
                            y: false
                        }
                    }
                });
                top.title(false);
                top.initSize(null, 37);
                top.maxSize(null, 37);
            }
            if(this.hasAction(ACTION.NAVIGATION)){
                this.layoutLeft = docker.addPanel('DefaultTab', types.DOCKER.DOCK.BOTTOM, top, {
                    title: '&nbsp;&nbsp;',
                    autoHideTabBar: true,
                    titleStacked: "Navigation"
                });

                this.layoutLeft.closeable(false);
                this.layoutLeft.resizeToChildren = false;
                this.layoutLeft.getFrame().showTitlebar(false);
                $(this.layoutLeft.containerNode).css({
                    'overflow-x': 'hidden',
                    'overflow-y': 'auto'
                });
            }
            if (this.hasAction(ACTION.NAVIGATION)) {
                if (this.hasAction(ACTION.WELCOME)) {
                    this.layoutCenter = docker.addPanel('DefaultTab', types.DOCKER.DOCK.RIGHT, this.layoutLeft, {
                        w: '80%',
                        title: 'Welcome',
                        mixin: {
                            isDefault: true
                        }
                    });
                    var $container = $('<div style="position:absolute;top:0;left:0;right:0;bottom:0;"></div>');
                    this.layoutCenter.layout().addItem($container);
                    this.layoutCenter.closeable(false);
                    if (has('xcf')) {
                        var iFrame = new iframe($container, this.layoutCenter);
                        if (has('debug')) {
                            this.ctx.getSettingsManager().initStore().then(function () {
                                iFrame.openURL("../../../Control-Freak-Documentation/daux/Getting_Started?theme=" + self.ctx.getApplication().getTheme());
                                self.layoutCenter.startLoading('Loading...');
                                iFrame.onLoaded(function () {
                                    self.layoutCenter.finishLoading(250);
                                });
                            });
                        } else {
                            var url = "../../../docs/Getting_Started.html";
                            iFrame.openURL(url);
                            this.layoutCenter.startLoading('Loading...');
                            iFrame.onLoaded(function () {
                                self.layoutCenter.finishLoading(250);
                            });
                        }
                        this.welcomePage = this.layoutCenter;
                        this.welcomeWidget = iFrame;
                        this.welcomeWidget.domNode = this.welcomeWidget.$container[0];

                    } else {
                        var widget = utils.addWidget(_Widget, {
                            templateString: _Welcome,
                            resizeToParent: true
                        }, null, this.layoutCenter, true);
                        this.layoutCenter.add(widget, null, false);
                    }
                    this.layoutCenter.resize();
                    //make maqetta happy til we updated xideve
                    if (has('xideve') && this.welcomeWidget) {
                        this.welcomeWidget.id = 'editorsStackContainer';
                        registry.add(this.welcomeWidget);
                    }
                }
            }
            if (this.hasAction(ACTION.STATUSBAR)) {
                this.createBottom();
                this.subscribe(types.EVENTS.ON_STATUS_MESSAGE);
            }
            docker.resize();
        }
    });

    var permissions = [
        //ACTION.BREADCRUMB,
        //ACTION.RIBBON,
        ACTION.MAIN_MENU,
        ACTION.NAVIGATION,
        ACTION.STATUSBAR,
        ACTION.WELCOME,
        ACTION.TOOLBAR
    ];

    if (has('phone')) {
        permissions = [
            ACTION.NAVIGATION
        ];
    }
    var DockerView = dcl([_Widget, _LayoutMixin.dcl, ActionProvider.dcl, BorderLayoutClass], {
        templateString: '<div style="height: 100%;width: 100%;"></div>',
        _statusMessageTimer: null,
        permissions: permissions,
        createStatusbar: function (where) {
            if (!this.layoutBottom) {
                return null;
            }
            where = this.layoutBottom.containerNode;
            var statusbar = this.statusbar,
                self = this;

            if (!statusbar) {
                var root = $('<div class="statusbar widget" style="width:inherit;padding: 0;margin:0;padding-left: 4px;min-height: 10px;height:100%"></div>')[0];
                where.appendChild(root);
                statusbar = $('<div class="status-bar-text ellipsis" style="display: inline-block;">0 items selected</div>')[0];
                root.appendChild(statusbar);
                var $collapser = $('<div class="status-bar-collapser" style="" ></div>');
                $collapser.click(function (e) {
                    self.onStatusbarCollapse($collapser);
                });
                var collapser = $collapser[0];
                root.appendChild(collapser);
                this.statusbar = statusbar;
                //this.statusbarCollapse = collapser;
                this.statusbarRoot = root;
                this._emit('createStatusbar', {
                    root: root,
                    statusbar: statusbar,
                    collapser: collapser
                });
            }
            return statusbar;
        },
        onStatusMessage: function (evt) {
            if (this._statusMessageTimer) {
                clearTimeout(this._statusMessageTimer);
            }
            var statusbar = this.getStatusbar();
            var pane = this.layoutBottom;
            if (!pane) {
                return;
            }
            var text = evt.text;
            if (evt.type) {
                if (evt.type === 'error') {
                    text = '<span class="text-danger">' + text + '</span>';
                }
                if (evt.type === 'warning') {
                    text = '<span class="text-warning">' + text + '</span>';
                }
                if (evt.type === 'info') {
                    text = '<span class="text-info">' + text + '</span>';
                }
            }
            statusbar.innerHTML = text;

            this._statusMessageTimer = setTimeout(function () {
                statusbar.innerHTML = "";
            }, evt.delay || 5000);

        },
        getStatusbar: function () {
            if (this.statusbar) {
                return this.statusbar;
            } else {
                return this.createStatusbar();
            }
        },
        getMainMenu: function () {
            return this.mainMenu;
        },
        getBreadcrumb: function () {
            return this.breadcrumb;
        },
        initWithConfig: function () {
        },
        getLayoutMain: function () {
            return this.layoutLeft;
        },
        getLayoutLeft: function () {
            return this.layoutLeft;
        },
        getLayoutCenter: function () {
            return this.layoutCenter;
        },
        getToolbar: function () {
            return this.toolbar;
        },
        onLastPanelClosed: function () {
            var main = this.getLayoutMain();
            if (main.option('autoHideTabBar')) {
                main.title(main.option('title'));
                main.getFrame().showTitlebar(false);
            }
            this.getDocker().resize();
        },
        onPanelClosed: function () {
            var self = this,
                main = self.getLayoutMain(),
                docker = self.getDocker();
            setTimeout(function () {
                var panels = docker.allPanels().filter(function (panel) {
                    return panel.option('canAdd') !== false;
                });
                if (panels.length == 1 && panels[0] == main) {
                    self.onLastPanelClosed();
                }
            }, 1);
            this.getDocker().resize();
        },
        _resizeToWindow: function () {
            var target = $('#root')[0];
            var staticTop = $('#staticTopContainer');
            var staticTopH = 0;
            if (staticTop && staticTop) {
                staticTopH = staticTop.height();
            }
            utils.resizeTo(target, window, true, true, null, {
                h: -staticTopH
            });
            if (this.layoutMain) {
                utils.resizeTo(this.layoutMain, target, true, true);
                this.layoutMain.resize();
                var _total = $('#root').height();
                _total -= this.extraBottomHeight;
                _toolbar -= staticTopH;
                var _toolbar = $(this.layoutTop.domNode).height();
                $(this.layoutCenter.domNode).css('height', _total - _toolbar);
            }
            this.getDocker().resize();
        },
        _resize: function () {
            this._resizeToWindow();
            this.publish(types.EVENTS.RESIZE, {}, this);
            $('window').trigger('resize');
            this.getDocker().resize();
        },
        startup: function () {
            var docker = Docker.createDefault(this.domNode);
            this.add(docker, null, false);
            this._docker = docker;
            var self = this;
            docker._on(dTypes.EVENT.CLOSED, function (panel) {
                self.onPanelClosed(panel);
            });
            this.createLayout(docker, this.permissions);
            this.createWidgets();
            function _resize() {
                self._resize();
            }

            $(window).resize(function () {
                return self.debounce('resize', _resize.bind(self), 1000, null);
            });
            setTimeout(function(){
                self._resizeToWindow();
            },1000);
        }
    });
    dcl.chainAfter(DockerView, 'startup');
    dcl.chainAfter(DockerView, 'resize');
    dcl.chainAfter(DockerView, 'createLayout');
    dcl.chainAfter(DockerView, 'createWidgets');
    return DockerView;
});