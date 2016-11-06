/** @module xide/widgets/_MenuMixin **/
define([
    'dcl/dcl',
    'xide/types',
    'xide/utils',
    'xide/registry',
    'xaction/Action',
    'xaction/DefaultActions'
], function (dcl, types, utils, registry, Action, DefaultActions) {

    var createCallback = function (func, menu, item) {
        return function (event) {
            func(event, menu, item);
        };
    };

    var ACTION = types.ACTION;
    var _debug = false;
    var _debugWidgets = false;
    /**
     * Mixin which provides utils for menu & action related render tasks.
     * @mixin module:xide/widgets/_MenuMixin
     */
    var Module = dcl(null, {
        actionStores: null,
        correctSubMenu: false,
        _didInit: null,
        actionFilter: null,
        hideSubsFirst: false,
        collapseSmallGroups: 0,
        containerClass: '',
        onActionAdded: function (actions) {
            this.setActionStore(this.getActionStore(), actions.owner || this, false, true, actions);
        },
        onActionRemoved: function (evt) {
            this.clearAction(evt.target);
        },
        clearAction: function (action) {
            var self = this;
            if (action) {
                var actionVisibility = action.getVisibility !== null ? action.getVisibility(self.visibility) : {};
                if (actionVisibility) {
                    var widget = actionVisibility.widget;
                    widget && action.removeReference && action.removeReference(widget);
                    if (widget && widget.destroy) {
                        widget.destroy();
                    }
                    delete actionVisibility.widget;
                    actionVisibility.widget = null;
                }
            }
        },
        removeCustomActions: function () {
            var oldStore = this.store;
            var oldActions = oldStore.query({
                    custom: true
                }),
                menuData = this.menuData;

            _.each(oldActions, function (action) {
                oldStore.removeSync(action.command);
                var oldMenuItem = _.find(menuData, {
                    command: action.command
                });
                oldMenuItem && menuData.remove(oldMenuItem);
            });
        },
        /**
         * Return a field from the object's given visibility store
         * @param action
         * @param field
         * @param _default
         * @returns {*}
         */
        getVisibilityField: function (action, field, _default) {
            var actionVisibility = action.getVisibility !== null ? action.getVisibility(this.visibility) : {};
            return actionVisibility[field] !== null ? actionVisibility[field] : action[field] || _default;
        },
        /**
         * Sets a field in the object's given visibility store
         * @param action
         * @param field
         * @param value
         * @returns {*}
         */
        setVisibilityField: function (action, field, value) {
            var _default = {};
            if (action.getVisibility) {
                var actionVisibility = action.getVisibility(this.visibility) || _default;
                actionVisibility[field] = value;
            }
            return actionVisibility;
        },
        shouldShowAction: function (action) {
            if (this.getVisibilityField(action, 'show') === false) {
                return false;
            } else if (action.getVisibility && action.getVisibility(this.visibility) == null) {
                return false;
            }
            return true;
        },
        addActionStore: function (store) {
            if (!this.actionStores) {
                this.actionStores = [];
            }
            if (this.actionStores.indexOf(store) == -1) {
                this.actionStores.push(store);
            }
        },
        /**

         tree structure :

         {
            root: {
                Block:{
                    grouped:{
                        Step:[action,action]
                    }
                }
            },
            rootActions: string['File','Edit',...],

            allActionPaths: string[command],

            allActions:[action]
         }

         * @param store
         * @param owner
         * @returns {{root: {}, rootActions: Array, allActionPaths: *, allActions: *}}
         */
        constructor: function (options, node) {
            this.target = node;
            utils.mixin(this, options);
        },
        onClose: function (e) {
            this._rootMenu && this._rootMenu.parent().removeClass('open');
        },
        onOpen: function () {
            this._rootMenu && this._rootMenu.parent().addClass('open');
        },
        isLeftToRight: function () {
            return false;
        },
        init: function (opts) {
            if (this._didInit) {
                return;
            }
            this._didInit = true;
            var options = this.getDefaultOptions();
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
            this.__on(root, 'mouseenter', '.dropdown-submenu', function (e) {
                try {
                    var _root = $(e.currentTarget);
                    var $sub = _root.find('.dropdown-context-sub:first');
                    var didPopup = false;
                    if ($sub.length === 0) {
                        $sub = _root.data('sub');
                        if ($sub) {
                            didPopup = true;
                        } else {
                            return;
                        }
                    }
                    var data = $sub.data('data');
                    var level = data ? data[0].level : 0;
                    var isFirst = level === 1;
                    if (self.menu) {
                        if (!$.contains(self.menu[0], _root[0])) {
                            return;
                        }
                    }

                    var _disabled = _root.hasClass('disabled');
                    if (_disabled) {
                        $sub.css('display', 'none');
                        return;
                    } else {
                        $sub.css('display', 'block');
                    }

                    if (isFirst) {
                        $sub.css('display', 'initial');
                        $sub.css('position', 'initial');
                        function close() {
                            var _wrapper = $sub.data('_popupWrapper');
                            window.popup.close({
                                domNode: $sub[0],
                                _popupWrapper: _wrapper
                            });
                        }

                        if (!didPopup) {
                            _root.data('sub', $sub);
                            $sub.data('owner', self);
                            $sub.on('mouseleave', function () {
                                close();
                            });
                            _root.on('mouseleave', function () {
                            });
                        }

                        window.popup.open({
                            //parent: self,
                            popup: $sub[0],
                            around: _root[0],
                            orient: ['below', 'above'],
                            maxHeight: -1,
                            owner: self,
                            onExecute: function () {
                                self.closeDropDown(true);
                            },
                            onCancel: function () {
                                close();
                            },
                            onClose: function () {
                                //console.log('close');
                                //domAttr.set(self._popupStateNode, "popupActive", false);
                                //domClass.remove(self._popupStateNode, "dijitHasDropDownOpen");
                                //self._set("_opened", false);	// use set() because _CssStateMixin is watching
                            }
                        });
                        return;
                    } else {

                        console.log('do as usual', _root);
                        if (!$sub.data('didSetup')) {
                            $sub.data('didSetup', true);
                            _root.on('mouseleave', function () {
                                $sub.css('display', '');
                            });
                        }
                    }


                    //reset top
                    $sub.css({
                        top: 0
                    });

                    var autoH = $sub.height() + 0;
                    var totalH = $('html').height();
                    var pos = $sub.offset();
                    var overlapYDown = totalH - (pos.top + autoH);
                    if ((pos.top + autoH) > totalH) {
                        $sub.css({
                            top: overlapYDown - 30
                        }).fadeIn(options.fadeSpeed);
                    }
                    ////////////////////////////////////////////////////////////
                    var subWidth = $sub.width(),
                        subLeft = $sub.offset().left,
                        collision = (subWidth + subLeft) > window.innerWidth;

                    if (collision) {
                        $sub.addClass('drop-left');
                    }
                } catch (e) {
                    logError(e);
                }
            });
        },
        getDefaultOptions: function () {
            return {
                fadeSpeed: 0,
                above: 'auto',
                left: 'auto',
                preventDoubleContext: false,
                compress: true
            };
        },
        buildMenuItems: function ($menu, data, id, subMenu, addDynamicTag) {
            //this._debugMenu && console.log('build - menu items ', arguments);
            var linkTarget = '',
                self = this,
                visibility = this.visibility;

            for (var i = 0; i < data.length; i++) {
                var item = data[i],
                    $sub,
                    widget = item.widget;

                if (typeof item.divider !== 'undefined' && !item.widget) {
                    var divider = '<li class="divider';
                    divider += (addDynamicTag) ? ' dynamic-menu-item' : '';
                    divider += '"></li>';
                    item.widget = divider;
                    $menu.append(divider);
                } else if (typeof item.header !== 'undefined' && !item.widget) {
                    var header = item.vertical ? '<li class="divider-vertical' : '<li class="nav-header';
                    header += (addDynamicTag) ? ' dynamic-menu-item' : '';
                    header += '">' + item.header + '</li>';
                    item.widget = header;
                    $menu.append(header);
                } else if (typeof item.menu_item_src !== 'undefined') {

                } else {
                    if (!widget && typeof item.target !== 'undefined') {
                        linkTarget = ' target="' + item.target + '"';
                    }
                    if (typeof item.subMenu !== 'undefined' && !widget) {
                        var sub_menu = '<li class="dropdown-submenu ' + this.containerClass;
                        sub_menu += (addDynamicTag) ? ' dynamic-menu-item' : '';
                        sub_menu += '"><a>';

                        if (typeof item.icon !== 'undefined') {
                            sub_menu += '<span class="icon ' + item.icon + '"></span> ';
                        }
                        sub_menu += item.text + '';
                        sub_menu += '</a></li>';
                        $sub = $(sub_menu);

                    } else {
                        if (!widget) {
                            if (item.render) {
                                $sub = item.render(item, $menu);
                            } else {
                                var element = '<li tabindex="2" class="" ';
                                element += (addDynamicTag) ? ' class="dynamic-menu-item"' : '';
                                element += '><a >';
                                if (typeof data[i].icon !== 'undefined') {
                                    element += '<span class="' + item.icon + '"></span> ';
                                }
                                element += item.text + '</a></li>';
                                $sub = $(element);
                                if (item.postRender) {
                                    item.postRender($sub);
                                }
                            }
                        }
                    }

                    if (typeof item.action !== 'undefined' && !item.widget) {
                        if (item.addClickHandler && item.addClickHandler() === false) {
                        } else {
                            var $action = item.action;
                            if ($sub && $sub.find) {
                                $sub.find('a')
                                    .addClass('context-event')
                                    .on('click', createCallback($action, item, $sub));
                            }
                        }
                    }

                    if ($sub && !widget) {

                        item.widget = $sub;
                        $sub.menu = $menu;
                        $sub.data('item', item);

                        item.$menu = $menu;
                        item.$sub = $sub;

                        item._render = function () {
                            if (item.index === 0) {
                                this.$menu.prepend(this.$sub);
                            } else {
                                this.$menu.append(this.$sub);
                            }
                        };
                        if (!item.lazy) {
                            item._render();
                        }
                    }

                    if ($sub) {
                        $sub.attr('level', item.level);
                    }

                    if (typeof item.subMenu != 'undefined' && !item.subMenuData) {
                        var subMenuData = self.buildMenu(item.subMenu, id, true);
                        $menu.subMenuData = subMenuData;
                        item.subMenuData = subMenuData;
                        $menu.find('li:last').append(subMenuData);
                        subMenuData.attr('level', item.subMenu.level);
                        if (self.hideSubsFirst) {
                            subMenuData.css('display', 'none');
                        }

                        var labelLocalized = self.localize(item.text);
                        var title = labelLocalized;
                        $menu.data('item', item);
                        //subMenuData.attr("title",labelLocalized);

                    } else {
                        if (item.subMenu && item.subMenuData) {
                            this.buildMenuItems(item.subMenuData, item.subMenu, id, true);
                        }
                    }
                }

                if (!$menu._didOnClick) {
                    $menu.on('click', '.dropdown-menu > li > input[type="checkbox"] ~ label, .dropdown-menu > li > input[type="checkbox"], .dropdown-menu.noclose > li', function (e) {
                        e.stopPropagation();
                    });
                    $menu._didOnClick = true;
                }

            }
            return $menu;
        },
        buildMenu: function (data, id, subMenu) {
            var subClass = (subMenu) ? (' dropdown-context-sub ' + this.containerClass ) : ' scrollable-menu ';
            var $menu = $('<ul tabindex="-1" aria-expanded="true" role="menu" class="dropdown-menu dropdown-context' + subClass + '" id="dropdown-' + id + '"></ul>');
            if (!subMenu) {
                this._rootMenu = $menu;
            }
            var result = this.buildMenuItems($menu, data, id, subMenu);
            $menu.data('data', data);
            return result;
        },
        createNewAction: function (command) {
            var segments = command.split('/');
            var lastSegment = segments[segments.length - 1];
            var action = new Action({
                command: command,
                label: lastSegment,
                group: lastSegment,
                dynamic: true
            });
            return action;
        },
        findAction: function (command) {
            var stores = this.actionStores,
                action = null;
            _.each(stores, function (store) {
                var _action = store ? store.getSync(command) : null;
                if (_action) {
                    action = _action;
                }
            });

            return action;
        },
        getAction: function (command, store) {
            store = store || this.store;
            var action = null;
            if (store) {
                action = this.findAction(command);
                if (!action) {
                    action = this.createNewAction(command);
                }
            }
            return action;
        },
        getActions: function (query) {
            var result = [];
            var stores = this.actionStores,
                visibility = this.visibility;
            query = query || this.actionFilter;

            _.each(stores, function (store) {
                if (store) {//tmpFix
                    result = result.concat(store.query(query));
                }
            });
            result = result.filter(function (action) {
                var actionVisibility = action.getVisibility != null ? action.getVisibility(visibility) : {};
                if (action.show === false || actionVisibility === false || actionVisibility.show === false) {
                    return false;
                }
                return true;
            });
            return result;
        },
        toActions: function (commands, store) {
            var result = [],
                self = this;
            _.each(commands, function (path) {
                var _action = self.getAction(path, store);
                _action && result.push(_action);
            });
            return result;
        },
        onRunAction: function (action, owner, e) {
            var command = action.command;
            action = this.findAction(command);
            return DefaultActions.defaultHandler.apply(action.owner || owner, [action, e]);
        },
        getActionProperty: function (action, visibility, prop) {
            var value = prop in action ? action[prop] : null;
            if (visibility && prop in visibility) {
                value = visibility[prop];
            }
            return value;
        },
        toMenuItem: function (action, owner, label, icon, visibility, showKeyCombo, lazy) {
            var self = this,
                labelLocalized = self.localize(label),
                actionType = visibility.actionType || action.actionType;

            var item = {
                text: labelLocalized,
                icon: icon,
                data: action,
                owner: owner,
                command: action.command,
                lazy: lazy,
                addClickHandler: function () {
                    if (actionType === types.ACTION_TYPE.MULTI_TOGGLE) {
                        return false;
                    }
                    return true;
                },
                render: function (data, $menu) {
                    if (self.renderItem) {
                        return self.renderItem(this, data, $menu, this.data, owner, label, icon, visibility, showKeyCombo, lazy);
                    }
                    var action = this.data;
                    var parentAction = action.getParent ? action.getParent() : null;
                    var closeOnClick = self.getActionProperty(action, visibility, 'closeOnClick');
                    var keyComboString = ' \n';
                    var element = null;
                    if (action.keyboardMappings && showKeyCombo !== false) {
                        var mappings = action.keyboardMappings;
                        var keyCombos = mappings[0].keys;
                        if (keyCombos && keyCombos.length) {
                            keyComboString += '' + keyCombos.join(' | ').toUpperCase() + '';
                        }
                    }

                    if (actionType === types.ACTION_TYPE.MULTI_TOGGLE) {
                        element = '<li class="" >';
                        var id = action._store.id + '_' + action.command + '_' + self.id;
                        var checked = action.get('value');
                        //checkbox-circle
                        element += '<div class="action-checkbox checkbox checkbox-success ">';
                        element += '<input id="' + id + '" type="checkbox" ' + (checked === true ? 'checked' : '') + '>';
                        element += '<label for="' + id + '">';
                        element += self.localize(data.text);
                        element += '</label>';
                        element += '<span style="max-width:100px;margin-right:20px" class="text-muted pull-right ellipsis keyboardShortCut">' + keyComboString + '</span>';
                        element += '</div>';

                        $menu.addClass('noclose');
                        var result = $(element);
                        var checkBox = result.find('INPUT');
                        checkBox.on('change', function (e) {
                            action._originReference = data;
                            action._originEvent = e;
                            action.set('value', checkBox[0].checked);
                            action._originReference = null;
                        });
                        self.setVisibilityField(action, 'widget', data);
                        return result;
                    }
                    closeOnClick === false && $menu.addClass('noclose');
                    if (actionType === types.ACTION_TYPE.SINGLE_TOGGLE && parentAction) {
                        var value = action.value || action.get('value');
                        var parentValue = parentAction.get('value');
                        if (value == parentValue) {
                            icon = 'fa fa-check';
                        }
                    }

                    var title = data.text || labelLocalized || self.localize(action.title);


                    //default:
                    element = '<li><a title="' + title + ' ' + keyComboString + '">';
                    var _icon = data.icon || icon;

                    //icon
                    if (typeof _icon !== 'undefined') {
                        //already html string
                        if (/<[a-z][\s\S]*>/i.test(_icon)) {
                            element += _icon;
                        } else {
                            element += '<span class="icon ' + _icon + '"/> ';
                        }
                    }
                    element += data.text;
                    element += '<span style="max-width:100px" class="text-muted pull-right ellipsis keyboardShortCut">' + (showKeyCombo ? keyComboString : "") + '</span></a></li>';
                    self.setVisibilityField(action, 'widget', data);
                    return $(element);
                },
                get: function (key) {
                },
                set: function (key, value) {
                    //_debugWidgets && _.isString(value) && console.log('set ' + key + ' ' + value);
                    var widget = this.widget;

                    function updateCheckbox(widget, checked) {
                        var what = widget.find("input[type=checkbox]");
                        if (what) {
                            if (checked) {
                                what.prop("checked", true);
                            } else {
                                what.removeAttr('checked');
                            }
                        }
                    }

                    if (widget) {
                        if (key === 'disabled') {
                            if (widget.toggleClass) {
                                widget.toggleClass('disabled', value);
                            }
                        }
                        if (key === 'icon') {
                            var _iconNode = widget.find('.icon');
                            if (_iconNode) {
                                _iconNode.attr('class', 'icon');
                                this._lastIcon = this.icon;
                                this.icon = value;
                                _iconNode.addClass(value);
                            }
                        }
                        if (key === 'value') {
                            if (actionType === types.ACTION_TYPE.MULTI_TOGGLE ||
                                actionType === types.ACTION_TYPE.SINGLE_TOGGLE) {
                                updateCheckbox(widget, value);
                            }
                        }
                    }
                },
                action: function (e, data, menu) {
                    _debug && console.log('menu action', data);
                    return self.onRunAction(data.data, owner, e);
                },
                destroy: function () {
                    if (this.widget) {
                        this.widget.remove();
                    }
                }
            };
            return item;
        },
        attach: function (selector, data) {
            this.target = selector;
            this.menu = this.addContext(selector, data);
            this.domNode = this.menu[0];
            this.id = this.domNode.id;
            registry.add(this);
            return this.menu;
        },
        addReference: function (action, item) {
            if (action.addReference) {
                action.addReference(item, {
                    properties: {
                        "value": true,
                        "disabled": true,
                        "enabled": true
                    }
                }, true);
            }
        },
        onDidRenderActions: function (store, owner) {
            if (owner && owner.refreshActions) {
                owner.refreshActions();
            }
        },
        getActionData: function (action) {
            var actionVisibility = action.getVisibility != null ? action.getVisibility(this.visibility) : {};
            return {
                label: actionVisibility.label != null ? actionVisibility.label : action.label,
                icon: actionVisibility.icon != null ? actionVisibility.icon : action.icon,
                command: actionVisibility.command != null ? actionVisibility.command : action.command,
                visibility: actionVisibility,
                group: actionVisibility.group != null ? actionVisibility.group : action.group,
                tab: actionVisibility.tab != null ? actionVisibility.tab : action.tab,
                expand: actionVisibility.expand != null ? actionVisibility.expand : false,
                widget: actionVisibility.widget
            };
        },
        _clearAction: function (action) {

        },
        _findParentData: function (oldMenuData, parentCommand) {
            var parent = _.find(oldMenuData, {
                command: parentCommand
            });
            if (parent) {
                return parent;
            }
            for (var i = 0; i < oldMenuData.length; i++) {
                var data = oldMenuData[i];
                if (data.subMenu) {
                    var found = this._findParentData(data.subMenu, parentCommand);
                    if (found) {
                        return found;
                    }
                }
            }
            return null;
        },
        _clear: function () {
            var actions = this.getActions();
            var store = this.store;
            if (store) {
                this.actionStores.remove(store);
            }
            var self = this;
            actions = actions.concat(this._tmpActions);
            _.each(actions, function (action) {
                if (action) {
                    var actionVisibility = action.getVisibility != null ? action.getVisibility(self.visibility) : {};
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
            });
            this.$navBar && this.$navBar.empty();
        },
        buildActionTree: function (store, owner) {
            var self = this,
                allActions = self.getActions(),
                visibility = self.visibility;

            self.wireStore(store, function (evt) {
                if (evt.type === 'update') {
                    var action = evt.target;
                    if (action.refreshReferences) {
                        action.refreshReferences(evt.property, evt.value);
                    }
                }
            });

            //return all actions with non-empty tab field
            var tabbedActions = allActions.filter(function (action) {
                    var _vis = (action.visibility_ || {})[visibility + '_val'] || {};
                    if (action) {
                        return _vis.tab || action.tab;
                    }
                }),

                //group all tabbed actions : { Home[actions], View[actions] }
                groupedTabs = _.groupBy(tabbedActions, function (action) {
                    var _vis = (action.visibility_ || {})[visibility + '_val'] || {};
                    if (action) {
                        return _vis.tab || action.tab;
                    }
                }),
                //now flatten them
                _actionsFlattened = [];


            _.each(groupedTabs, function (items) {
                _actionsFlattened = _actionsFlattened.concat(items);
            });

            var rootActions = [];
            _.each(tabbedActions, function (action) {
                var rootCommand = action.getRoot();
                rootActions.indexOf(rootCommand) == -1 && rootActions.push(rootCommand);
            });

            //owner sort of top level
            store.menuOrder && (rootActions = owner.sortGroups(rootActions, store.menuOrder));

            var tree = {};
            //stats to count groups per tab
            var biggestTab = rootActions[0];
            var nbGroupsBiggest = 0;

            _.each(rootActions, function (level) {
                // collect all actions at level (File/View/...)
                var menuActions = owner.getItemsAtBranch(allActions, level);
                // convert action command strings to Action references
                var grouped = self.toActions(menuActions, store);

                // expand filter -------------------
                var addedExpanded = [];
                var toRemove = [];
                _.each(grouped, function (action) {
                    var actionData = self.getActionData(action);
                    if (actionData.expand) {
                        var children = action.getChildren();
                        children && children.length && (addedExpanded = addedExpanded.concat(children));
                        toRemove.push(action);
                    }
                });
                grouped = grouped.concat(addedExpanded);
                grouped = grouped.filter(function (action) {
                    return toRemove.indexOf(action) == -1;
                });
                // expand filter ---------------    end

                // group all actions by group
                var groupedActions = _.groupBy(grouped, function (action) {
                    var _vis = (action.visibility_ || {})[visibility + '_val'] || {};
                    if (action) {
                        return _vis.group || action.group;
                    }
                });

                var _actions = [];
                _.each(groupedActions, function (items, level) {
                    if (level !== 'undefined') {
                        _actions = _actions.concat(items);
                    }
                });

                //flatten out again
                menuActions = _.pluck(_actions, 'command');
                menuActions.grouped = groupedActions;
                tree[level] = menuActions;

                //update stats
                if (self.collapseSmallGroups) {
                    var nbGroups = _.keys(menuActions.grouped).length;
                    if (nbGroups > nbGroupsBiggest) {
                        nbGroupsBiggest = nbGroups;
                        biggestTab = level;
                    }
                }
            });

            //now move over any tab with less than 2 groups to the next bigger tab
            this.collapseSmallGroups && _.each(tree, function (actions, level) {
                if (_.keys(actions.grouped).length < self.collapseSmallGroups) {
                    //append tab groups of the biggest tab
                    tree[biggestTab] && _.each(actions.grouped, function (group, name) {
                        tree[biggestTab].grouped[name] = group;
                    });
                    //copy manually commands to that tab
                    tree[biggestTab] && _.each(actions, function (action) {
                        tree[biggestTab].push(action);
                    });
                    tree[biggestTab] && delete tree[level];
                }
            });
            var result = {
                root: tree,
                rootActions: rootActions,
                allActionPaths: _.pluck(allActions, 'command'),
                allActions: allActions
            };

            this.lastTree = result;
            return result;
        }
    });
    dcl.chainAfter(Module, 'destroy');
    return Module;
});


