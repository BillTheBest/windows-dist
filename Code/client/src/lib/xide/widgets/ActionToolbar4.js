/** @module xide/widgets/ActionToolbar4 **/
define([
    "dcl/dcl",
    'xide/types',
    'xide/utils',
    'xide/_base/_Widget',
    "xide/mixins/ActionMixin",
    'xaction/ActionContext',
    "xide/model/Path",
    'xlang/i18',
    "xide/widgets/_MenuMixin4",
    "xide/popup"
], function (dcl,types,utils,_XWidget,
             ActionMixin,ActionContext,Path,i18,
             _MenuMixin4,popup){

    var OPEN_DELAY = 200;
    var ContainerClass =  dcl([_XWidget,ActionContext.dcl,ActionMixin.dcl],{
        templateString:'<div attachTo="navigation" class="actionToolbar">'+
        '<nav attachTo="navigationRoot" class="" role="navigation">'+
        '<ul attachTo="navBar" class="nav navbar-nav"/>'+
        '</nav>'+
        '</div>'
    });
    /**
     * @class module:xide/widgets/ActionToolbar4
     */
    var ActionRendererClass = dcl(null,{
        renderTopLevel:function(name,where){
            where = where || $(this.getRootContainer());
            var item =$('<li class="dropdown">' +
                '<a href="#" class="dropdown-toggle" data-toggle="dropdown">' + i18.localize(name) +'<b class="caret"></b></a>'+
                '</li>');

            where.append(item);
            return item;
        },
        getRootContainer:function(){
            return this.navBar;
        }
    });
    var Module = dcl([ContainerClass,_MenuMixin4,ActionRendererClass,_XWidget.StoreMixin],{
        declaredClass:'xide.widgets.Actiontoolbar',
        target:null,
        attachToGlobal:true,
        _isFollowing:false,
        _followTimer:null,
        _zIndex:1,
        hideSubsFirst:true,
        visibility: types.ACTION_VISIBILITY.ACTION_TOOLBAR,
        _renderItem:function(item,data,$menu,action, owner, label, icon, visibility, showKeyCombo, lazy){
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
            element = '<li class="" title="' + title + ' ' + keyComboString + '">';
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
        init2: function(opts){
            var options = this.getDefaultOptions();
            options = $.extend({}, options, opts);
            var self = this;
            var root = $(document);
            this.__on(root,'click',null,function(e){
                if(!self.isOpen){
                    return;
                }
                self.isOpen=false;
                self.onClose(e)
                $('.dropdown-context').css({
                    display:''
                }).find('.drop-left').removeClass('drop-left');
            });
            if(options.preventDoubleContext){
                this.__on(root,'contextmenu', '.dropdown-context', function (e) {
                    e.preventDefault();
                });
            }
            function mouseEnterHandler(e){
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
                //if (self.menu) {
                //if (!$.contains(self.menu[0], _root[0])) {
                //console.error('not me');
                //return;
                //}
                //}
                $sub.css('display', 'none');
                $sub.data('left',false);
                _root.data('left',false);
                if(isFirst) {
                    $sub.css('display', 'initial');
                    $sub.css('position', 'initial');
                    function close() {
                        var _wrapper = $sub.data('_popupWrapper');
                        popup.close($sub[0]);
                        /*
                         popup.close({
                         domNode: $sub[0],
                         _popupWrapper: _wrapper
                         });
                         */
                    }
                    if(_root.data('didSetup')!==true){
                        _root.data('didSetup',true);
                        _root.data('sub',$sub);
                        _root.on('mouseleave', function (e) {
                            var _thisSub = _root.data('sub');
                            var next = e.toElement;
                            if(next==_thisSub[0] || $.contains(_thisSub[0],next)){
                                return;
                            }
                            close();
                        });
                    }

                    if (!didPopup) {
                        _root.data('sub', $sub);
                        $sub.data('owner', self);
                        if(!$sub.data('didSetup')){
                            $sub.data('root',_root);
                            $sub.on('mouseleave', function () {
                                $sub.data('left',true);
                                close();

                            });
                            $sub.data('didSetup',true);
                            $sub.on('mouseenter', function(e){
                                $sub.data('entered',true);
                            });
                        }
                    }
                    function open() {
                        popup.open({
                            popup: $sub[0],
                            around: _root[0],
                            orient: ['below', 'above'],
                            maxHeight: -1,
                            owner: self,
                            extraClass: 'ActionToolbar',
                            onExecute: function () {
                                self.closeDropDown(true);
                            },
                            onCancel: function () {
                                close();
                            },
                            onClose: function () {
                                _root.data('left',true);
                                close();
                            }
                        });
                    }
                    open();
                    clearTimeout($sub.data('openTimer'));
                    $sub.data('openTimer',setTimeout(function(){
                        if($sub.data('left')!==true) {
                            //$sub.css('display', 'block');
                            //open();
                            //console.log('left sub main');
                        }else{
                            $sub.css('display', 'none');
                        }
                    },OPEN_DELAY));

                    return;
                }else{
                    $sub.css('display','block');
                    if(!$sub.data('didSetup')){
                        $sub.data('didSetup',true);
                        $sub.on('mouseleave',function(){
                            $sub.css('display','');
                            $sub.data('left',true);

                        });
                    }
                    if(!_root.data('didSetup')){
                        _root.data('didSetup',true);
                        _root.on('mouseleave',function(){
                            _root.data('left',true);
                            $sub.css('display','');

                        });
                    }
                }
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
            }
            this.__on(root,'mouseenter', '.dropdown-submenu', mouseEnterHandler.bind(this));
        },
        resize:function(){
            this._height = this.$navBar.height();
            this.$navigation.css('height',this._height);
        },
        destroy:function(){
            utils.destroy(this.$navBar[0]);
            utils.destroy(this.$navigation[0]);
        },
        buildMenu:function (data, id, subMenu,update) {
            var subClass = (subMenu) ? ' dropdown-context-sub' : ' scrollable-menu ',
                menuString = '<ul aria-expanded="true" role="menu" class="dropdown-menu dropdown-context' + subClass + '" id="dropdown-' + id + '"></ul>',
                $menu = update ? (this._rootMenu || this.$navBar || $(menuString)) : $(menuString);

            if(!subMenu){
                this._rootMenu = $menu;
            }
            $menu.data('data',data);
            return this.buildMenuItems($menu, data, id, subMenu);
        },
        setActionStore: function (store, owner,subscribe,update,itemActions) {
            if(!update && store && this.store && store!=this.store){
                this.removeCustomActions();
            }

            if(!update){
                this._clear();
                this.addActionStore(store);
            }

            if(!store){
                return;
            }

            this.store = store;

            var self = this,
                visibility = self.visibility,
                rootContainer = $(self.getRootContainer());

            var tree = update ? self.lastTree : self.buildActionTree(store,owner);

            var allActions = tree.allActions,
                rootActions = tree.rootActions,
                allActionPaths = tree.allActionPaths,
                oldMenuData = self.menuData;

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

            // final menu data
            var data = [];
            if(!update) {
                _.each(tree.root, function (menuActions, level) {
                    var lastGroup = '';
                    _.each(menuActions, function (command) {
                        var action = self.getAction(command, store);
                        var isDynamicAction = false;
                        if (!action) {
                            isDynamicAction = true;
                            action = self.createAction(command);
                        }
                        if (action) {

                            var renderData = self.getActionData(action),
                                icon = renderData.icon,
                                label = renderData.label,
                                visibility = renderData.visibility,
                                group = renderData.group,
                                lastHeader = {
                                    header: ''
                                };


                            if (visibility === false) {
                                return;
                            }

                            /*
                             if (!isDynamicAction && group && groupedActions[group] && groupedActions[group].length >= 1) {
                             //if (lastGroup !== group) {
                             var name = groupedActions[group].length >= 2 ? i18.localize(group) : "";
                             lastHeader = {divider: name,vertial:true};
                             data.push(lastHeader);
                             lastGroup = group;
                             //}
                             }
                             */

                            var item = self.toMenuItem(action, owner, '', icon, visibility || {}, false);
                            data.push(item);
                            item.level = 0;
                            visibility.widget = item;

                            self.addReference(action, item);

                            var childPaths = new Path(command).getChildren(allActionPaths, false),
                                isContainer = childPaths.length > 0;

                            function parseChildren(command, parent) {
                                var childPaths = new Path(command).getChildren(allActionPaths, false),
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
                            self.buildMenuItems(rootContainer, [item], "-" + new Date().getTime());

                        }
                    });
                });
                self.onDidRenderActions(store, owner);
                this.menuData = data;
            }else{
                if(itemActions || !_.isEmpty(itemActions)) {

                    _.each(itemActions, function (newAction) {
                        if (newAction) {
                            var action = self.getAction(newAction.command);
                            if (action){


                                var renderData = self.getActionData(action),
                                    icon = renderData.icon,
                                    label = renderData.label,
                                    aVisibility = renderData.visibility,
                                    group = renderData.group,
                                    item = self.toMenuItem(action, owner, label, icon, aVisibility || {},null,false);

                                if(aVisibility.widget){
                                    return;
                                }

                                aVisibility.widget = item;

                                self.addReference(newAction, item);

                                if(!action.getParentCommand){
                                    return;
                                }
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
            this.resize();
        },
        startup:function(){
            this.correctSubMenu = true;
            this.init2({
                preventDoubleContext: false
            });
            this.menu = this.$navigation;
        }
    });
    dcl.chainAfter(Module,'destroy');
    return Module;
});

