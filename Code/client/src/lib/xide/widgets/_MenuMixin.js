/** @module xide/widgets/_MenuMixin **/
define([
    'dcl/dcl',
    'xide/types',
    'xide/utils',
    'xide/registry',
    'xaction/Action',
    'xaction/DefaultActions'
], function (dcl,types,utils,registry,Action,DefaultActions) {

    var createCallback = function (func, menu, item) {

        return function (event) {
            func(event, menu, item);
        };
    };

    var ACTION = types.ACTION;

    var _debug = false;
    /**
     * Mixin which provides utils for menu & action related render tasks.
     * This is heavily utilized by MainMenu,ActionToolbar, FilePropertyView and the ContextMenuHandler.
     * It requires that the 'ActionMixin' is part of the game too!
     *
     * @mixin module:xide/widgets/_MenuMixin
     */
    var Module = dcl(null, {
        actionStores:null,
        correctSubMenu:false,
        visibility:types.ACTION_VISIBILITY.CONTEXT_MENU,
        /**
         * Return a field from the object's given visibility store
         * @param action
         * @param field
         * @param _default
         * @returns {*}
         */
        getVisibilityField:function(action,field,_default){
            var actionVisibility = action.getVisibility !=null ? action.getVisibility(this.visibility) : {};
            return actionVisibility[field] !==null ? actionVisibility[field] : action[field] || _default;
        },
        /**
         * Sets a field in the object's given visibility store
         * @param action
         * @param field
         * @param value
         * @returns {*}
         */
        setVisibilityField:function(action,field,value){

            var _default = {};
            if(action.getVisibility) {
                var actionVisibility = action.getVisibility(this.visibility) || _default;
                actionVisibility[field] = value;
            }
            return actionVisibility;
        },
        shouldShowAction:function(action){
            if(this.getVisibilityField(action,'show')===false){
                return false;
            }else if(action.getVisibility && action.getVisibility(this.visibility)==null){
                return false;
            }
            return true;
        },
        addActionStore:function(store){
            if(!this.actionStores){
                this.actionStores = [];
            }

            if(this.actionStores.indexOf(store)==-1){
                this.actionStores.push(store);
            }
        },
        buildActionTree:function(store,owner){

            var self = this,
                allActions = self.getActions(),
                visibility = self.visibility,
                rootContainer = $(self.getRootContainer());


            self.wireStore(store,function(evt){
                if(evt.type==='update'){
                    var action = evt.target;
                    if(action.refreshReferences){
                        var refs = action.getReferences();
                        action.refreshReferences(evt.property,evt.value);
                    }
                }
            });

            //return all actions with non-empty tab field
            var tabbedActions = allActions.filter(function (action) {
                    return action.tab !== null;
                }),

            //group all tabbed actions : { Home[actions], View[actions] }
                groupedTabs = _.groupBy(tabbedActions, function (action) {
                    return action.tab;
                }),
            //now flatten them
                _actionsFlattened = [];

            _.each(groupedTabs, function (items, name) {
                _actionsFlattened = _actionsFlattened.concat(items);
            });

            var rootActions = [];
            _.each(tabbedActions, function (action) {
                var rootCommand = action.getRoot();
                rootActions.indexOf(rootCommand) == -1 && rootActions.push(rootCommand);
            });

            if (store.menuOrder) {
                rootActions = owner.sortGroups(rootActions, store.menuOrder);
            }

            //collect all existing actions as string array
            var allActionPaths = _.pluck(allActions, 'command');

            var tree = {};

            _.each(rootActions, function (level) {



                // collect all actions at level (File/View/...)
                var menuActions = owner.getItemsAtBranch(allActions, level);

                // convert action command strings to Action references
                var grouped = self.toActions(menuActions, store);
                //apt-get install automake autopoint bison build-essential ccache cmake curl cvs default-jre fp-compiler gawk gdc gettext git-core gperf libasound2-dev libass-dev libavcodec-dev libavfilter-dev libavformat-dev libavutil-dev libbluetooth-dev libbluray-dev libbluray1 libboost-dev libboost-thread-dev libbz2-dev libcap-dev libcdio-dev libcrystalhd-dev libcrystalhd3 libcurl3 libcurl4-gnutls-dev libcwiid-dev libcwiid1 libdbus-1-dev libenca-dev libflac-dev libfontconfig-dev libfreetype6-dev libfribidi-dev libglew-dev libiso9660-dev libjasper-dev libjpeg-dev libltdl-dev liblzo2-dev libmad0-dev libmicrohttpd-dev libmodplug-dev libmp3lame-dev libmpeg2-4-dev libmpeg3-dev libmysqlclient-dev libnfs-dev libogg-dev libpcre3-dev libplist-dev libpng-dev libpostproc-dev libpulse-dev libsamplerate-dev libsdl-dev libsdl-gfx1.2-dev libsdl-image1.2-dev libsdl-mixer1.2-dev libshairport-dev libsmbclient-dev libsqlite3-dev libssh-dev libssl-dev libswscale-dev libtiff-dev libtinyxml-dev libtool libudev-dev libusb-dev libva-dev libva-egl1 libva-tpi1 libvdpau-dev libvorbisenc2 libxml2-dev libxmu-dev libxrandr-dev libxrender-dev libxslt1-dev libxt-dev libyajl-dev mesa-utils nasm pmount python-dev python-imaging python-sqlite swig unzip yasm zip zlib1g-dev
                // group all actions by group
                var groupedActions = _.groupBy(grouped, function (action) {
                    var _vis = (action.visibility_ || {})[ visibility +'_val' ] || {};
                    if (action) {
                        return _vis.group || action.group;
                    }
                });

                //temp array
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
            });

            return {
                root:tree,
                rootActions:rootActions,
                allActionPaths:_.pluck(allActions, 'command'),
                allActions:allActions
            };
        },
        constructor:function(options,node){
            this.target = node;
            utils.mixin(this,options);
        },
        onClose:function(e){
            this._rootMenu && this._rootMenu.parent().removeClass('open');
        },
        onOpen:function(){

            console.log('is open',this._rootMenu);
            var thiz=this;
            thiz._rootMenu && thiz._rootMenu.parent().addClass('open');
            setTimeout(function(){
                //thiz._rootMenu.focus();
            },1000);

        },
        init: function(opts){

            var options = this.getDefaultOptions();

            options = $.extend({}, options, opts);
            var self = this;
            var root = $(document);

            this.__on(root,'click',null,function(){

                $('.dropdown-context').fadeOut(options.fadeSpeed, function(e){
                    self.isOpen=false;
                    self.onClose(e);
                    $('.dropdown-context').css({
                        display:''
                    }).find('.drop-left').removeClass('drop-left');
                });

            });


            if(options.preventDoubleContext){
                this.__on(root,'contextmenu', '.dropdown-context', function (e) {
                    e.preventDefault();
                });
            }


            this.__on(root,'mouseenter', '.dropdown-submenu', function(e){

                var _root = $(e.currentTarget);

                var $sub = _root.find('.dropdown-context-sub:first');

                if(self.correctSubMenu===false){
                    return;
                }

                //reset top
                $sub.css({
                    top:_root.position().top + _root.height()
                });
                var autoH = $sub.height() + 0;
                var totalH = $('html').height();
                var pos = $sub.offset();
                var overlapYDown = totalH - (pos.top + autoH);
                if((pos.top + autoH) > totalH){
                    $sub.css({
                        top: overlapYDown - 30
                    }).fadeIn(options.fadeSpeed);
                }

                ////////////////////////////////////////////////////////////
                var subWidth = $sub.width(),
                    subLeft = $sub.offset().left,
                    collision = (subWidth+subLeft) > window.innerWidth;
                if(collision){
                    $sub.addClass('drop-left');
                }

            });
        },
        getDefaultOptions:function(){
            return {
                fadeSpeed: 100,
                filter: function ($obj) {
                    // Modify $obj, Do not return
                },
                above: 'auto',
                left: 'auto',
                preventDoubleContext: false,
                compress: true
            };
        },
        /**
         *
         * @param $menu
         * @param data
         * @param id
         * @param subMenu
         * @param addDynamicTag
         * @returns {*}
         */
        buildMenuItems: function ($menu, data, id, subMenu, addDynamicTag) {

            var linkTarget = '',
                self = this,
                visibility = this.visibility;

            for (var i = 0; i < data.length; i++) {

                var item = data[i],
                    $sub;

                if (typeof data[i].divider !== 'undefined') {
                    var divider = '<li class="divider';
                    divider += (addDynamicTag) ? ' dynamic-menu-item' : '';
                    divider += '"></li>';
                    $menu.append(divider);
                } else if (typeof data[i].header !== 'undefined') {
                    var header = '<li class="nav-header';
                    header += (addDynamicTag) ? ' dynamic-menu-item' : '';
                    header += '">' + data[i].header + '</li>';
                    $menu.append(header);
                } else if (typeof data[i].menu_item_src !== 'undefined') {
                    var funcName;
                    if (typeof data[i].menu_item_src === 'function') {
                        if (data[i].menu_item_src.name === "") { // The function is declared like "foo = function() {}"
                            for (var globalVar in window) {
                                if (data[i].menu_item_src == window[globalVar]) {
                                    funcName = globalVar;
                                    break;
                                }
                            }
                        } else {
                            funcName = data[i].menu_item_src.name;
                        }
                    } else {
                        funcName = data[i].menu_item_src;
                    }
                    $menu.append('<li class="dynamic-menu-src" data-src="' + funcName + '"></li>');
                } else {

                    if (typeof data[i].href == 'undefined') {
                        data[i].href = '#';
                    }
                    if (typeof data[i].target !== 'undefined') {
                        linkTarget = ' target="' + data[i].target + '"';
                    }
                    if (typeof data[i].subMenu !== 'undefined') {
                        var sub_menu = '<li class="dropdown-submenu';
                        sub_menu += (addDynamicTag) ? ' dynamic-menu-item' : '';
                        sub_menu += '"><a tabindex="-1" href="' + data[i].href + '">';
                        if (typeof item.icon !== 'undefined') {
                            sub_menu += '<span class="icon ' + item.icon + '"></span> ';
                        }
                        sub_menu += data[i].text + '';
                        sub_menu += '</a></li>';
                        $sub = $(sub_menu);
                    } else {

                        if (item.render) {

                            $sub = item.render(item, $menu);

                        } else {
                            var element = '<li class="" ';
                            element += (addDynamicTag) ? ' class="dynamic-menu-item"' : '';
                            element += '><a tabindex="-1" href="' + data[i].href + '"' + linkTarget + '>';
                            if (typeof data[i].icon !== 'undefined') {
                                element += '<span class="glyphicon ' + data[i].icon + '"></span> ';

                            }
                            element += data[i].text + '</a></li>';
                            $sub = $(element);
                            if (item.postRender) {
                                item.postRender($sub);
                            }
                        }
                    }
                    if (typeof data[i].action !== 'undefined') {

                        if (item.addClickHandler && item.addClickHandler() === false){

                        } else {
                            var $action = data[i].action;
                            if ($sub && $sub.find) {
                                $sub.find('a')
                                    .addClass('context-event')
                                    .on('click', createCallback($action, item, $sub));
                            }
                        }
                    }

                    $menu.append($sub);
                    item.widget = $sub;

                    if (typeof data[i].subMenu != 'undefined') {
                        var subMenuData = self.buildMenu(data[i].subMenu, id, true);
                        $menu.find('li:last').append(subMenuData);
                    }




                }



                $menu.on('click', '.dropdown-menu > li > input[type="checkbox"] ~ label, .dropdown-menu > li > input[type="checkbox"], .dropdown-menu.noclose > li', function (e) {
                    e.stopPropagation();
                });



            }
            return $menu;
        },
        buildMenu: function (data, id, subMenu) {

            var subClass = (subMenu) ? ' dropdown-context-sub' : ' scrollable-menu ',
                $menu = $('<ul tabindex="1" aria-expanded="true" role="menu" class="dropdown-menu dropdown-context' + subClass + '" id="dropdown-' + id + '"></ul>');

            if(!subMenu){
                this._rootMenu =$menu;
            }
            return this.buildMenuItems($menu, data, id, subMenu);
        },
        createNewAction:function(command){

            var segments = command.split('/');
            var lastSegment = segments[segments.length - 1];
            var action = new Action({
                command: command,
                label: lastSegment,
                group: lastSegment
            });
            return action;
        },
        findAction:function(command){

            var stores = this.actionStores,
                action = null;



            _.each(stores,function(store){

                var _action = store.getSync(command);
                if(_action){
                    action = _action;
                }
            });

            return action;
        },
        getAction:function(command,store){

            store = store || this.store;

            var action = null;

            if(store) {
                action = this.findAction(command);
                if(!action){
                    action = this.createNewAction(command);
                }
            }

            return action;
        },
        getActions:function(query){
            var result = [];
            var stores = this.actionStores,
                self = this,
                visibility = this.visibility;

            _.each(stores,function(store){
                result = result.concat(store.query(query));
            });


            result = result.filter(function(action){
                var actionVisibility = action.getVisibility !== null ? action.getVisibility(visibility) : {};
                if(action.show===false || actionVisibility === false || actionVisibility.show === false){
                    return false;
                }

                return true;
            });


            return result;
        },
        toActions:function(commands,store){

            var result = [],
                self = this;
            _.each(commands, function (path) {
                var _action = self.getAction(path,store);
                _action && result.push(_action);
            });
            return result;
        },
        onRunAction:function(action,owner,e){

            var command = action.command;
            action = this.findAction(command);
            _debug && console.log('run action ',action.command);
            return DefaultActions.defaultHandler.apply(action.owner||owner,[action,e]);
        },
        getActionProperty:function(action,visibility,prop){

            var value = prop in action ? action[prop] : null;
            if(visibility && prop in visibility){
                value = visibility[prop];
            }
            return value;
        },
        toMenuItem:function(action, owner, label, icon, visibility,showKeyCombo) {

            var self = this,
                labelLocalized = self.localize(label),
                widgetArgs = visibility.widgetArgs,
                actionType = visibility.actionType || action.actionType;

            var item = {
                text: labelLocalized,
                icon: icon,
                data: action,
                owner:owner,
                addClickHandler: function (item) {

                    var action = this.data;
                    if (actionType === types.ACTION_TYPE.MULTI_TOGGLE) {
                        return false;
                    }

                    return true;
                },
                render: function (data, $menu) {

                    var action = this.data;


                    //console.log('render ' + action.command);




                    var parentAction = action.getParent ? action.getParent() : null;
                    var closeOnClick = self.getActionProperty(action,visibility,'closeOnClick');

                    var keyComboString = ' \n';
                    if (action.keyboardMappings && showKeyCombo!==false) {

                        var mappings = action.keyboardMappings;
                        var keyCombos = _.pluck(mappings, ['keys']);
                        if (keyCombos && keyCombos[0]) {
                            keyCombos = keyCombos[0];

                            if (keyCombos.join) {
                                var keycombo = [];
                                keyComboString += '' + keyCombos.join(' | ').toUpperCase() + '';
                            }
                        }
                    }

                    if (actionType === types.ACTION_TYPE.MULTI_TOGGLE) {

                        var element = '<li class="" >';
                        var id = action._store.id + '_' + action.command;
                        var checked = action.get('value');

                        //checkbox-circle
                        element += '<div class="checkbox checkbox-success ">';
                        element += '<input id="' + id + '" type="checkbox" ' + (checked === true ? 'checked' : '') + '>';
                        element += '<label for="' + id + '">';
                        element += self.localize(data.text) + '</label>';
                        element += '</div>';

                        $menu.addClass('noclose');
                        var result = $(element);
                        var checkBox = result.find('INPUT');
                        checkBox.on('change', function (e) {
                            //console.warn('change ' + checkBox[0].checked);
                            action.set('value', checkBox[0].checked);
                        });

                        self.setVisibilityField(action,'widget',data);

                        return result;
                    }



                    closeOnClick===false && $menu.addClass('noclose');
                    if (actionType === types.ACTION_TYPE.SINGLE_TOGGLE && parentAction) {
                        var value = action.value || action.get('value');
                        var parentValue = parentAction.get('value');
                        if (value == parentValue) {
                            icon = 'fa-check';
                        }
                    }

                    //default:
                    var element = '<li ';
                    element += '';
                    element += '><a title="' + data.text + '\n' + keyComboString + '" href="' + data.href + '"' + '#' + '>';

                    //icon
                    if (typeof data.icon !== 'undefined') {
                        element += '<span class="icon ' + icon + '"></span> ';
                    }
                    element += data.text;
                    element += '<span style="max-width: 100px" class="text-muted pull-right ellipsis keyboardShortCut">' + keyComboString + '</span>';
                    element += '</a></li>';
                    self.setVisibilityField(action,'widget',data);
                    return $(element);
                },
                get: function (key) {},
                set: function (key, value) {
                    var widget = this.widget;
                    if (widget) {
                        if (key === 'disabled') {
                            if (widget.toggleClass) {
                                widget.toggleClass('disabled', value);
                            }
                        }
                        if (key === 'icon') {
                            //console.log('set ' + key + ' ' + value + ' action ' + action.command);
                            var _iconNode = widget.find('.icon');
                            if(_iconNode) {
                                _iconNode.attr('class', 'icon');
                                this._lastIcon = this.icon;
                                this.icon = value;
                                _iconNode.addClass(value);
                            }else{
                                console.error('cant find icon node',widget);
                            }
                        }
                    }
                },
                action: function (e, data, menu) {
                    console.log('menu action', data);
                    return self.onRunAction(data.data,owner,e);
                    /*
                     console.log('menu action', data);
                     if (owner && owner.runAction && data.data) {
                     owner.runAction(data.data);
                     }
                     */
                },
                destroy: function () {
                    if(this.widget){
                        this.widget.remove();
                    }
                }
            };
            return item;
        },
        attach: function(selector,data){
            this.target = selector;
            this.menu = this.addContext(selector,data);
            this.domNode = this.menu[0];
            this.id = this.domNode.id;

            registry.add(this);

            //console.dir(this.menu);

            //this.menu.addClass('active');


            //this.menu.focus();
            return this.menu;
        },
        addReference:function(action,item){

            if (action.addReference) {
                action.addReference(item, {
                    properties: {
                        "value": true,
                        "disabled": true
                    }
                }, true);
            }
        },
        onDidRenderActions:function(store,owner){

            if(owner && owner.refreshActions){
                owner.refreshActions();
            }

        },
        getActionData: function (action) {

            var actionVisibility = action.getVisibility !== null ? action.getVisibility(this.visibility) : {};
            return {
                label: actionVisibility.label !== null ? actionVisibility.label : action.label,
                icon: actionVisibility.icon !== null ? actionVisibility.icon : action.icon,
                command:actionVisibility.command != null ? actionVisibility.command : action.command,
                visibility: actionVisibility,
                group:actionVisibility.group != null ? actionVisibility.group : action.group
            }
        },
        _clear:function(){

            var actions = this.getActions();
            var store = this.store;
            if(store){
                this.actionStores.remove(store);
            }
            var self = this;

            actions = actions.concat(this._tmpActions);
            _.each(actions,function(action){
                if(action) {
                    var actionVisibility = action.getVisibility != null ? action.getVisibility(self.visibility) : {};
                    if (actionVisibility) {
                        var widget = actionVisibility.widget;
                        action.removeReference && action.removeReference(widget);
                        if (widget && widget.destroy) {
                            widget.destroy();
                        }
                    }
                }

            });

            this.$navBar && this.$navBar.empty();
        }
    });

    dcl.chainAfter(Module,'destroy');
    return Module;
});


