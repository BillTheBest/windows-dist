define([
    'dcl/dcl',
    'xide/types',
    'xlang/i18',
    "xide/widgets/_Widget",
    'xide/_base/_Widget',
    "xide/mixins/ActionMixin",
    'xaction/ActionContext',
    "xide/widgets/_MenuMixin4",
    "xide/model/Path",
    "xide/_Popup",
    "xide/$",
    "xide/lodash",
    "xide/widgets/_MenuKeyboard"
], function (dcl,types,i18,_Widget,_XWidget,ActionMixin, ActionContext, MenuMixinClass,Path,_Popup,$,_,_MenuKeyboard) {

    var ActionRendererClass = dcl(null, {
        renderTopLevel: function (name, where) {
            where = where || $(this.getRootContainer());
            var item = $('<li class="dropdown">' +
                '<a href="#" class="dropdown-toggle" data-toggle="dropdown">' + i18.localize(name) + '<b class="caret"></b></a>' +
                '</li>');
            where.append(item);
            return item;

        },
        getRootContainer: function () {
            return this.navBar;
        }
    });
    var _debugTree =false;
    var _debugMenuData = false;
    var _debugOldMenuData = false;

    var KeyboardControl = _MenuKeyboard;

    var ContextMenu = dcl([_Widget.dcl, ActionContext.dcl, ActionMixin.dcl, ActionRendererClass,MenuMixinClass,_XWidget.StoreMixin], {
        target: null,
        openTarget:null,
        visibility: types.ACTION_VISIBILITY.CONTEXT_MENU,
        correctSubMenu:true,
        limitTo:null,
        declaredClass:'xide.widgets.ContextMenu',
        menuData:null,
        addContext: function (selector, data) {
            this.menuData = data;
            var id,
                $menu,
                self = this,
                target = this.openTarget ? (this.openTarget) : $(self.target);

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

            var options = this.getDefaultOptions();

            this.keyboardController = new KeyboardControl();
            this.keyboardController.setup(this);

            function mouseEnterHandlerSubs(e){
                var navigationData = this.keyboardController.toNavigationData($(e.target),this.getRootContainer());
                if(!navigationData) {
                    return;
                }
                this.keyboardController.clear(navigationData.parent);
                this.menu.focus();
                navigationData.element.focus();
                this.menu.data('currentTarget',navigationData.element);

            }
            function setupContainer($container){
                self.__on($container, 'mouseenter', 'LI', mouseEnterHandlerSubs.bind(self));
            }

            function constextMenuHandler(e) {
                if(self.limitTo){
                    var $target = $(e.target);
                    $target = $target.parent();
                    if(!$target.hasClass(self.limitTo)){
                        return;
                    }
                }
                self.openEvent = e;
                self.isOpen = true;
                this.lastFocused = document.activeElement;
                self.onOpen(e);
                e.preventDefault();
                e.stopPropagation();
                $('.dropdown-context:not(.dropdown-context-sub)').hide();

                var $dd = $('#dropdown-' + id);
                $dd.css('zIndex',_Popup.nextZ(1));
                if(!$dd.data('init')){
                    $dd.data('init',true);
                    setupContainer($dd);
                    self.keyboardController.initContainer($dd);
                }

                if (typeof options.above == 'boolean' && options.above) {
                    $dd.css({
                        top: e.pageY - 20 - $('#dropdown-' + id).height(),
                        left: e.pageX - 13
                    }).fadeIn(options.fadeSpeed);

                } else if (typeof options.above == 'string' && options.above == 'auto') {
                    $dd.removeClass('dropdown-context-up');
                    var autoH = $dd.height() + 0;
                    if ((e.pageY + autoH) > $('html').height()) {
                        var top = e.pageY - 20 - autoH;
                        if(top < 0){
                            top = 20;
                        }
                        $dd.css({
                            top: top + 20,
                            left: e.pageX - 13
                        }).fadeIn(options.fadeSpeed);

                    } else {
                        $dd.css({
                            top: e.pageY - 10,
                            left: e.pageX - 13
                        }).fadeIn(options.fadeSpeed);
                    }
                }

                if (typeof options.left == 'boolean' && options.left) {
                    $dd.addClass('dropdown-context-left').css({
                        left: e.pageX - $dd.width()
                    }).fadeIn(options.fadeSpeed);
                } else if (typeof options.left == 'string' && options.left == 'auto') {
                    $dd.removeClass('dropdown-context-left');
                    var autoL = $dd.width() - 12;
                    if ((e.pageX + autoL) > $('html').width()) {
                        $dd.addClass('dropdown-context-left').css({
                            left: e.pageX - $dd.width() + 13
                        });
                    }
                }
                this.keyboardController.activate($(this.keyboardController.children($dd)[0]),$dd);
            }
            this.__on(target, 'contextmenu', null,constextMenuHandler.bind(this));

            this.__on($menu,'keydown',function(e){
                if(e.keyCode==27){
                    var navData = this.keyboardController.toNavigationData($(e.target),this.getRootContainer());
                    navData && navData.element && this.keyboardController.close(navData.element);
                    $(this.lastFocused).focus();
                }
            }.bind(this));

            return $menu;
        },
        onRootAction:function(){
            return null;
        },
        buildMenu:function (data, id, subMenu,update) {
            var subClass = (subMenu) ? ' dropdown-context-sub' : ' scrollable-menu ',
                menuString = '<ul tabindex="-1" aria-expanded="true" role="menu" class="dropdown-menu dropdown-context' + subClass + '" id="dropdown-' + id + '"></ul>',
                $menu = update ? (this._rootMenu || $(menuString)) : $(menuString);

            if(!subMenu){
                this._rootMenu = $menu;
                this._rootMenu.addClass('contextMenu')
            }
            $menu.data('data', data);
            return this.buildMenuItems($menu, data, id, subMenu);
        },
        onActionAdded:function(actions){
            this.setActionStore(this.getActionStore(), this,false,true,actions);
        },
        clearAction : function(action){
            var self = this;
            if(action) {
                var actionVisibility = action.getVisibility !== null ? action.getVisibility(self.visibility) : {};
                if (actionVisibility) {
                    var widget = actionVisibility.widget;
                    action.removeReference && action.removeReference(widget);
                    if (widget && widget.destroy) {
                        widget.destroy();
                    }
                    delete actionVisibility.widget;
                    actionVisibility.widget = null;
                }
            }
        },
        onActionRemoved:function(evt){
            this.clearAction(evt.target);
        },
        removeCustomActions:function(){
            var oldStore = this.store;
            if(!oldStore){
                console.warn('removeCustomActions : have no store');
                return;
            }
            var oldActions = oldStore.query({
                    custom:true
                }),
                menuData=this.menuData;

            _.each(oldActions,function(action){

                oldStore.removeSync(action.command);

                var oldMenuItem = _.find(menuData,{
                    command:action.command
                });
                oldMenuItem && menuData.remove(oldMenuItem);
            });
        },
        setActionStore: function (store, owner,subscribe,update,itemActions) {
            if(!update){
                this._clear();
                this.addActionStore(store);
            }

            var self = this,
                visibility = self.visibility,
                rootContainer = $(self.getRootContainer());
            var tree = update ? self.lastTree : self.buildActionTree(store,owner);

            var allActions = tree.allActions,
                rootActions = tree.rootActions,
                allActionPaths = tree.allActionPaths,
                oldMenuData = self.menuData;

            this.store = store;

            var data = [];


            if(subscribe!==false) {
                if(!this['_handleAdded_' + store.id]) {
                    this.addHandle('added', store._on('onActionsAdded', function (actions) {
                        self.onActionAdded(actions);
                    }));

                    this.addHandle('delete', store.on('delete', function (evt) {
                        self.onActionRemoved(evt);
                    }));
                    this['_handleAdded_' + store.id]=true;
                }
            }

            if(!update) {
                _.each(tree.root, function (menuActions, level) {

                    var root = self.onRootAction(level, rootContainer),
                        lastGroup = '',
                        lastHeader = {
                            header: ''
                        },
                        groupedActions = menuActions.grouped;

                    _.each(menuActions, function (command) {
                        var action = self.getAction(command, store),
                            isDynamicAction = false;

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

                            if(visibility.widget){
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
                            var item = self.toMenuItem(action, owner, label, icon, visibility || {},true);
                            data.push(item);
                            visibility.widget = item;
                            self.addReference(action, item);
                            function parseChildren(command, parent) {
                                var childPaths = new Path(command).getChildren(allActionPaths, false),
                                    isContainer = childPaths.length > 0,
                                    childActions = isContainer ? self.toActions(childPaths, store) : null;
                                if (childActions) {
                                    var subs = [];
                                    _.each(childActions, function (child) {
                                        var _renderData = self.getActionData(child);
                                        var _item = self.toMenuItem(child, owner, _renderData.label, _renderData.icon, _renderData.visibility,true);
                                        self.addReference(child, _item);
                                        subs.push(_item);

                                        var _childPaths = new Path(child.command).getChildren(allActionPaths, false),
                                            _isContainer = _childPaths.length > 0;
                                        if (_isContainer) {
                                            parseChildren(child.command, _item);
                                        }
                                    });
                                    parent.subMenu = subs;
                                }
                            }

                            parseChildren(command, item);
                        }
                    });
                });
                self.attach($('body'), data);
                self.onDidRenderActions(store, owner);
            }else{

                if(itemActions || !_.isEmpty(itemActions)) {
                    _.each(itemActions, function (newAction) {
                        if (newAction) {
                            var action = self.getAction(newAction.command);
                            if (action) {

                                var renderData = self.getActionData(action),
                                    icon = renderData.icon,
                                    label = renderData.label,
                                    aVisibility = renderData.visibility,
                                    group = renderData.group,
                                    item = self.toMenuItem(action, owner, label, icon, aVisibility || {},null,false);

                                aVisibility.widget = item;

                                self.addReference(newAction, item);

                                var parentCommand = action.getParentCommand();
                                var parent = self._findParentData(oldMenuData,parentCommand);
                                if(parent && parent.subMenu){
                                    parent.lazy = true;
                                    parent.subMenu.push(item);
                                }else{
                                    oldMenuData.splice(0, 0, item);
                                }
                            } else {
                                console.error('cant find action ' + newAction.command);
                            }
                        }
                    });

                    self.buildMenu(oldMenuData, self.id,null,update);
                }
            }
        }
    });
    return ContextMenu;
});