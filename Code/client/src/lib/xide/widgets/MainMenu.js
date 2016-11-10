/** @module xide/widgets/MainMenu **/
define([
    'dcl/dcl',
    'xide/types',
    'xide/_base/_Widget',
    'xlang/i18',
    "xide/mixins/ActionMixin",
    'xaction/ActionContext',
    "xide/widgets/_MenuMixin4",
    "xide/model/Path",
    "xide/$",
    "xide/lodash",
    "xide/widgets/_MenuKeyboard"
], function (dcl, types, _XWidget, i18, ActionMixin, ActionContext, MenuMixinClass, Path,$,_,_MenuKeyboard) {
    var _debug = false;
    var ContainerClass = dcl([_XWidget, ActionContext.dcl, ActionMixin.dcl], {
        templateString: '<div class="navbar navbar-default mainMenu bg-opaque">' +
        '<nav attachTo="navigation" class="" role="navigation">' +
        '<ul tabindex="-1" attachTo="navBar" class="nav navbar-nav"/>' +
        '</nav>' +
        '</div>'
    });
    var ActionRendererClass = dcl(null, {
        renderTopLevel: function (name, where) {
            var val  = i18.localize(name);
            var shortcutKey = "";
            var text;
            var ndx =0;
            if(ndx >= 0){
                shortcutKey = val.charAt(ndx);
                var prefix = val.substr(0, ndx);
                var suffix = val.substr(ndx + 1);
                val = prefix + '<span class="shortcutKey">' + shortcutKey + '</span>' + suffix;
                this.shortcuts[shortcutKey]=name;
            }
            where = where || $(this.getRootContainer());
            var item = $('<li tabindex="-1" class="dropdown">' +
                '<a href="#" data-delay="1500" class="dropdown-toggle" data-toggle="dropdown">' + val + '<b class="caret"></b></a>' +
                '</li>');
            where.append(item);
            var trigger = item.find('A');
            trigger.bootstrapDropdownHover();
            return item;
        },
        getRootContainer: function () {
            return this.navBar;
        }
    });
    var KeyboardControl = _MenuKeyboard;
    var MainMenu = dcl([ContainerClass, ActionRendererClass, MenuMixinClass, _XWidget.StoreMixin], {
        target: null,
        visibility: types.ACTION_VISIBILITY.MAIN_MENU,
        attachToGlobal: true,
        declaredClass: 'xide.widgets.MainMenu',
        shortcuts:null,
        _topLevelMenu:null,
        _altDown:false,
        _shiftDown:false,
        addContext: function (selector, data) {
            var id,
                $menu,
                self = this;
            if (typeof data.id !== 'undefined' && typeof data.data !== 'undefined') {
                id = data.id;
                $menu = $('body').find('#dropdown-' + id)[0];
                if (typeof $menu === 'undefined') {
                    $menu = self.buildMenu(data.data, id);
                    selector.append($menu);
                }
            } else {
                var d = new Date();
                id = d.getTime();
                $menu = self.buildMenu(data, id);
                selector.append($menu);
            }
            return $menu;
        },
        onRootAction: function (level, container) {
            return this.renderTopLevel(level, container);
        },
        setActionStore: function (store, owner) {
            this._clear();
            this._tmpActions = [];
            delete this._topLevelMenu;
            this._topLevelMenu={};
            this.store = store;
            if (!store) {
                return;
            }
            this.addActionStore(store);
            var self = this,
                visibility = self.visibility,
                rootContainer = $(self.getRootContainer()),
                tree = self.buildActionTree(store, owner),
                allActions = tree.allActions,
                rootActions = tree.rootActions,
                allActionPaths = tree.allActionPaths,
                delegate = this.delegate;

            /*
             var mapping = Keyboard.defaultMapping(keyCombo, handler, keyProfile || types.KEYBOARD_PROFILE.DEFAULT, keyTarget, keyScope, [action]);
             mapping = this.registerKeyboardMapping(mapping);
             keyboardMappings.push(mapping);
             */

            function registerRootKeyboardHandler(name){

                var keyboardCombo = 'alt ' + name[0];

            }

            _.each(tree.root, function (menuActions, level) {

                var root = self.onRootAction(level, rootContainer);
                self._topLevelMenu[level]=root;
                var lastHeader = {
                    header: ''
                };

                // final menu data
                var data = [];
                var groupedActions = menuActions.grouped;

                //temp group string of the last rendered action's group
                var lastGroup = '';
                _.each(menuActions, function (command) {
                    var action = self.getAction(command, store);
                    var isDynamicAction = false;
                    if (!action) {
                        isDynamicAction = true;
                        action = self.createAction(command);
                    }
                    if (action) {
                        var renderData = self.getActionData(action);
                        var icon = renderData.icon,
                            label = renderData.label,
                            visibility = renderData.visibility,
                            group = renderData.group;

                        if (visibility === false) {
                            return;
                        }
                        if (!isDynamicAction && group && groupedActions[group] && groupedActions[group].length >= 1) {
                            if (lastGroup !== group) {
                                var name = groupedActions[group].length >= 2 ? i18.localize(group) : "";
                                lastHeader = {header: name};
                                data.push(lastHeader);
                                lastGroup = group;
                            }
                        }
                        var item = self.toMenuItem(action, owner, label, icon, visibility || {}, true);
                        data.push(item);
                        visibility.widget = item;
                        self.addReference(action, item);

                        function parseChildren(command, parent) {

                            var childPaths = new Path(command).getChildren(allActionPaths, false),
                                isContainer = childPaths.length > 0,
                                childActions = isContainer ? self.toActions(childPaths, store) : null;

                            if (isContainer && childActions) {
                                var subs = [];
                                _.each(childActions, function (child) {
                                    var _renderData = self.getActionData(child);
                                    var _item = self.toMenuItem(child, owner, _renderData.label, _renderData.icon, _renderData.visibility, true);
                                    self.addReference(child, _item);
                                    subs.push(_item);
                                    var _childPaths = new Path(child.command).getChildren(allActionPaths, false);
                                    _childPaths.length > 0 && parseChildren(child.command, _item);
                                });
                                parent.subMenu = subs;
                            }
                        }

                        parseChildren(command, item);
                    }
                });
                return self.attach(root, data);
            });

            self.onDidRenderActions(store, owner);
        },
        startup: function () {
            this.init({preventDoubleContext: false});
            if (this.attachToGlobal) {
                var node = $('#staticTopContainer');
                if (!node[0]) {
                    var body = $('body');
                    node = $('<div id="staticTopContainer" class=""></div>');
                    body.prepend(node);
                }
                node.append($(this.domNode));
            }
        },
        lastFocused:null,
        setupKeyboard:function(node){
            function keyhandler(e){
                e.keyCode === 16 && (this._shiftDown = e.type==='keydown');
                if(e.keyCode==27){
                    var navData = this.keyboardController.toNavigationData($(e.target),this.getRootContainer());
                    navData && navData.element && this.keyboardController.close(navData.element);
                    $(this.lastFocused).focus();
                }
                if(this._shiftDown && e.key in this.shortcuts){
                    this.lastFocused = document.activeElement;
                    //open root
                    this.keyboardController.openRoot(null,this._topLevelMenu[this.shortcuts[e.key]]);
                }
            }
            $(node).on('keydown',keyhandler.bind(this));
        },
        init: function (opts) {
            if (this._didInit) {
                return;
            }
            this._didInit = true;
            this.shortcuts = {};

            this.setupKeyboard(this.delegate._domNode || typeof document !=='undefined' ? document : null);

            var options = this.getDefaultOptions();
            this.keyboardController = new KeyboardControl();
            this.keyboardController.setup(this);
            options = $.extend({}, options, opts);
            var self = this;
            var root = $(document);


            this.__on(root, 'click', null, function (e) {
                if (!self.isOpen) {
                    return;
                }
                self.isOpen = false;
                self.onClose(e);
                $('.dropdown-context').css({
                    display: ''
                }).find('.drop-left').removeClass('drop-left');
            });

            if (options.preventDoubleContext) {
                this.__on(root, 'contextmenu', '.dropdown-context', function (e) {
                    e.preventDefault();
                });
            }
            function mouseEnterHandlerSubs(e){
                var navigationData = this.keyboardController.toNavigationData($(e.target),self.getRootContainer());
                if(!navigationData) {
                    return;
                }
                var _parent = navigationData.parent;
                _parent.focus();
                navigationData.element.focus();
                _parent.data('currentTarget',navigationData.element);
                this.keyboardController.initContainer(_parent);
            }
            this.__on(this.getRootContainer(), 'mouseenter', '.dropdown-menu >LI', mouseEnterHandlerSubs.bind(this));
        }
    });
    return MainMenu;
});