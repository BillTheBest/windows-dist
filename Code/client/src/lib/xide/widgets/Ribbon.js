/** @module xgrid/Base **/
define([
    "dcl/dcl",
    'xide/types',
    'xide/utils',
    'xide/_base/_Widget',
    "xide/mixins/ActionMixin",
    'xide/action/ActionContext',
    "xide/model/Path",
    'xlang/i18',
    "xide/widgets/_MenuMixin4",
    "xide/layout/_TabContainer",
    "xide/$",
    'xide/popup'
], function (dcl,types,utils,_XWidget,ActionMixin,ActionContext,
             Path,
             i18,_MenuMixin4,_TabContainer,$,popup
){



    //http://localhost/projects/x4mm/Code/xapp/xcf/?debug=true&run=run-release-debug&protocols=false&drivers=false&plugins=false&xblox=debug&files=false&dijit=debug&xdocker=debug&xfile=debug&davinci=debug&dgrid=debug&xgrid=debug&xace=debug&xaction=debug&xfile=debug&xideve=debug&davinci=debug&dijit=debug&app=xide&xideve=false&devices=false
    var ACTION = types.ACTION;

    //action renderer class
    var ContainerClass = dcl([_XWidget,ActionContext.dcl,ActionMixin.dcl],{
        templateString:'<div class="mainMenu ribbonToolbar" style="min-height: 160px"></div>',
        /**
         * @type {module:xide/layout/_TabContainer}
         */
        tabContainer:null,
        startup:function(){
            //this.tabContainer = this.add(utils.addWidget(_TabContainer,{},this,this,true));
        },
        /**
         * @returns {module:xide/layout/_TabContainer}
         */
        getRootContainer:function(){
            if(!this.tabContainer){
                this.tabContainer = this.add(utils.addWidget(_TabContainer,{},this,this,true));
            }
            return this.tabContainer;
        }
    });
    var ActionRendererClass = dcl(null,{
        renderTopLevel:function(name,where){
            var root = this.getRootContainer();
            var tab= root.getTab('name');
            var node = null;
            if(name==='window'){
                console.error('--xxx');
            }
            if(!tab){
                tab = root.createTab(name);
                node = $(utils.getNode(tab));
                node.addClass('nav navbar-nav ribbon_tabbar');
            }
            return node;
        },
        /**
         *
         * @param item
         * @param data
         * @param $menu
         * @param action
         * @param owner
         * @param label
         * @param icon
         * @param visibility
         * @param showKeyCombo
         * @param lazy
         */
        renderItem:function(item,data,$menu,action, owner, label, icon, visibility, showKeyCombo, lazy){
            var self = this;
            var labelLocalized = self.localize(label);
            var actionType = visibility.actionType || action.actionType;
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
            //element = '<li><a title="' + title + ' ' + keyComboString + '">';
            element = '<li class="ribbon_3rows_button" title="' + title + ' ' + keyComboString + '">';
            var _icon = data.icon || icon;
            //icon
            if (typeof _icon !== 'undefined') {
                //already html string
                if (/<[a-z][\s\S]*>/i.test(_icon)) {
                    element += _icon;
                } else {
                    element += '<span style="" class="icon ' + _icon + '"/> ';
                }
            }
            element +='<a class="">';
            element += data.text;
            //element += '<span style="max-width:100px" class="text-muted pull-right ellipsis keyboardShortCut">' + (showKeyCombo ? keyComboString : "") + '</span></a></li>';
            element += '</a></li>';
            self.setVisibilityField(action, 'widget', data);
            return $(element);
        },
        onRootAction:function(level,container){
            return this.renderTopLevel(level,container);
        }
    });

    var MainMenu = dcl([ContainerClass,ActionRendererClass,_MenuMixin4,_XWidget.StoreMixin],{
        target:null,
        visibility: types.ACTION_VISIBILITY.RIBBON,
        attachToGlobal:false,
        _tmpActions:null,
        collapseSmallGroups:3,
        containerClass: 'ribbon_dropdown',
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
                        if($sub){
                            didPopup = true;
                        }else {
                            return;
                        }
                    }
                    var data = $sub.data('data');
                    var level = data ? data[0].level : 0;
                    var isFirst = level ===1;
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


                    var doClose = true;
                    if(isFirst) {
                        $sub.css('display', 'initial');
                        $sub.css('position', 'initial');
                        function close() {
                            var _wrapper = $sub.data('_popupWrapper');
                            popup.close({
                                domNode: $sub[0],
                                _popupWrapper: _wrapper
                            });
                        }

                        if (!didPopup) {
                            _root.data('sub', $sub);
                            $sub.data('owner', self);
                            $sub.on('mouseleave', function () {
                                doClose && close();
                            });
                            _root.on('mouseleave', function () {
                            });
                        }

                        popup.open({
                            popup: $sub[0],
                            around: _root[0],
                            orient: ['below', 'above'],
                            maxHeight: -1,
                            owner: self,
                            extraClass: 'ActionRibbonToolbar',
                            onExecute: function () {
                                self.closeDropDown(true);
                            },
                            onCancel: function () {
                                doClose && close();
                            },
                            onClose: function () {
                                //console.log('close');
                                //domAttr.set(self._popupStateNode, "popupActive", false);
                                //domClass.remove(self._popupStateNode, "dijitHasDropDownOpen");
                                //self._set("_opened", false);	// use set() because _CssStateMixin is watching
                            }
                        });
                        return;
                    }else{
                        if(!$sub.data('didSetup')){
                            $sub.data('didSetup',true);
                            _root.on('mouseleave',function(){
                                doClose && $sub.css('display','');
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
        addContext:function(selector,data){
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
        _did:false,
        setActionStore:function(store,owner){
            this._clear();
            if(this.tabContainer){
                utils.destroy(this.tabContainer,true,this);
                this.getRootContainer();
            }
            this._tmpActions = [];
            this.store = store;
            this.addActionStore(store);
            var self = this,
                visibility = self.visibility,
                rootContainer = $(self.getRootContainer()),
                tree = self.buildActionTree(store,owner),
                allActions = tree.allActions,
                rootActions = tree.rootActions,
                allActionPaths = tree.allActionPaths;

            var groupBlocks = [];

            function createGroupContainer(where,name){
                var block = $('<div class="ribbon_block_base">');
                where.append(block);
                var blockItems = $('<div class="ribbon_block_items"/>');
                block.append(blockItems);
                var blockLabel = $('<div class="ribbon_block_label_fixed">' + name +  '</div>');
                block.append(blockLabel);
                var result = {
                    root:block,
                    items:blockItems,
                    label:blockLabel,
                    count:0
                };
                groupBlocks.push(result);
                return result;
            }

            var lastGroup = '';
            var lastTarget = root;
            var last3BlockRows = null;
            var blockTarget = null;

            var lastGroupContainer = null;

            //track all actions per level
            var stats = [];
            _.each(tree.root, function (menuActions,level) {
                stats.push({
                    name:level,
                    size:menuActions.length
                });
            });

            _.each(tree.root, function (menuActions,level) {

                var root = self.onRootAction(level,rootContainer);
                lastGroup = null;
                lastTarget = root;

                // final menu data
                var data = [];
                var groupedActions = menuActions.grouped;

                var isNewBlock = false;
                var blockCounter = 0;

                //temp group string of the last rendered action's group
                for (var i = 0; i < menuActions.length; i++) {
                    var command = menuActions[i];
                    var action = self.getAction(command,store);
                    var isDynamicAction = false;
                    var lastHeader = null;
                    isNewBlock = false;
                    if (!action) {
                        isDynamicAction = true;
                        action = self.createAction(command);
                        self._tmpActions.push(action);
                        self.setVisibilityField(action,'widget',{
                            widget:root,
                            destroy:function(){
                                this.widget.remove();
                            }
                        });
                    }
                    if(action){
                        var renderData = self.getActionData(action);
                        var icon = renderData.icon,
                            label = renderData.label,
                            visibility = renderData.visibility,
                            group = renderData.group;

                        if (!isDynamicAction && group && groupedActions[group]) {// && groupedActions[group].length >= 2
                            if(lastGroup!==group){
                                lastHeader = {header: i18.localize(group)};
                                lastGroup = group;
                                lastGroupContainer = createGroupContainer(root,group);
                                lastTarget = lastGroupContainer.items;
                            }
                        }

                        if(lastGroupContainer.count > 4){
                            lastGroupContainer.target = null;
                            lastGroupContainer.count = 0;
                        }


                        var target = lastGroupContainer.target;

                        if(!target){
                            target = $('<div class="dhxrb_3rows_block"/>');
                            lastTarget.append(target);
                            lastGroupContainer.target = target;
                        }

                        lastGroupContainer.count++;

                        var item = self.toMenuItem(action, owner, label, icon, visibility || {},false);
                        item.level = 0;
                        data.push(item);
                        visibility.widget = item;
                        self.addReference(action,item);

                        //blockCounter++;


                        var childPaths = new Path(command).getChildren(allActionPaths,false),
                            isContainer = childPaths.length> 0;

                        function parseChildren(_command, parent) {
                            var childPaths = new Path(_command).getChildren(allActionPaths, false),
                                isContainer = childPaths.length > 0,
                                childActions = isContainer ? self.toActions(childPaths, store) : null;
                            if (childActions) {
                                var subs = [];
                                _.each(childActions, function (child) {
                                    var _renderData = self.getActionData(child);
                                    var _item = self.toMenuItem(child, owner, _renderData.label, _renderData.icon, _renderData.visibility,false);
                                    var parentLevel = parent.level || 0;
                                    _item.level = parentLevel + 1;
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
                        self.buildMenuItems(target, [item], "-" + new Date().getTime());
                    }
                }
            });
            self.onDidRenderActions(store,owner);

            //size all tab groups to the last know largest height
            var largest = 0;
            _.each(groupBlocks,function(group){
                var height = group.root.height();
                if(height > largest){
                    largest = height;
                }
            });
            largest = largest + 'px';
            _.each(groupBlocks,function(group){
                group.root.css('height',largest);
            });

        },
        startup:function(){
            this.init({preventDoubleContext: false});
        }
    });
    return MainMenu;

});

