/** @module xgrid/Base **/
define([
    "xdojo/declare",
    "dcl/dcl",
    'xide/types',
    'xide/utils',
    "xide/tests/TestUtils",
    "xide/widgets/_Widget",
    "module",
    'xide/registry',
    'xide/_base/_Widget',
    "xide/mixins/ActionMixin",
    'xide/action/ActionContext',
    'xide/action/ActionStore',
    'xide/action/DefaultActions',
    "xaction/ActionProvider",
    "xgrid/Clipboard",
    "xide/model/Path",
    'xide/action/Action',
    'xfile/tests/TestUtils',
    'xlang/i18',
    'xide/mixins/EventedMixin',
    "xide/widgets/_MenuMixin2",
    "xide/widgets/_MenuMixin4",
    "xblox/tests/TestUtils",
    "xide/layout/_TabContainer",
    "dojo/dom", // dom.isDescendant
    "dojo/dom-construct", // domConstruct.create domConstruct.destroy
    "dojo/dom-geometry", // domGeometry.isBodyLtr
    "dojo/dom-style", // domStyle.set
    "dojo/_base/lang", // lang.hitch
    "dojo/keys",
    "dojo/on",
    "dijit/place",
    "xide/$",
    'xide/popup'
], function (declare,dcl,types,utils,TestUtils,_Widget,module,registry,
             _XWidget,ActionMixin,ActionContext,
             ActionStore,DefaultActions,ActionProvider,Clipboard,Path,
             Action,FTestUtils,i18,EventedMixin,MenuMixinClass,_MenuMixin4,_TestBlockUtils,
             _TabContainer,
             dom, domConstruct, domGeometry, domStyle,lang,keys,on,place,$,popup
){


    //http://localhost/projects/x4mm/Code/xapp/xcf/?debug=true&run=run-release-debug&protocols=false&drivers=false&plugins=false&xblox=debug&files=false&dijit=debug&xdocker=debug&xfile=debug&davinci=debug&dgrid=debug&xgrid=debug&xace=debug&xaction=debug&xfile=debug&xideve=debug&davinci=debug&dijit=debug&app=xide&xideve=false&devices=false

    var ACTION = types.ACTION;
    var _debug = false;
    var _debugWidgets = false;
    console.clear();
    var createCallback = function(func,menu,item) {

        return function(event) {
            func(event, menu,item);
        };
    };

    ////////////////////////////////////////////////////////
    //
    //
    //
    //
    // module:
    //		dijit/popup

    /*=====
     var __OpenArgs = {
     // popup: Widget
     //		widget to display
     // parent: Widget
     //		the button etc. that is displaying this popup
     // around: DomNode
     //		DOM node (typically a button); place popup relative to this node.  (Specify this *or* "x" and "y" parameters.)
     // x: Integer
     //		Absolute horizontal position (in pixels) to place node at.  (Specify this *or* "around" parameter.)
     // y: Integer
     //		Absolute vertical position (in pixels) to place node at.  (Specify this *or* "around" parameter.)
     // orient: Object|String
     //		When the around parameter is specified, orient should be a list of positions to try, ex:
     //	|	[ "below", "above" ]
     //		For backwards compatibility it can also be an (ordered) hash of tuples of the form
     //		(around-node-corner, popup-node-corner), ex:
     //	|	{ "BL": "TL", "TL": "BL" }
     //		where BL means "bottom left" and "TL" means "top left", etc.
     //
     //		dijit/popup.open() tries to position the popup according to each specified position, in order,
     //		until the popup appears fully within the viewport.
     //
     //		The default value is ["below", "above"]
     //
     //		When an (x,y) position is specified rather than an around node, orient is either
     //		"R" or "L".  R (for right) means that it tries to put the popup to the right of the mouse,
     //		specifically positioning the popup's top-right corner at the mouse position, and if that doesn't
     //		fit in the viewport, then it tries, in order, the bottom-right corner, the top left corner,
     //		and the top-right corner.
     // onCancel: Function
     //		callback when user has canceled the popup by:
     //
     //		1. hitting ESC or
     //		2. by using the popup widget's proprietary cancel mechanism (like a cancel button in a dialog);
     //		   i.e. whenever popupWidget.onCancel() is called, args.onCancel is called
     // onClose: Function
     //		callback whenever this popup is closed
     // onExecute: Function
     //		callback when user "executed" on the popup/sub-popup by selecting a menu choice, etc. (top menu only)
     // padding: place.__Position
     //		adding a buffer around the opening position. This is only useful when around is not set.
     // maxHeight: Integer
     //		The max height for the popup.  Any popup taller than this will have scrollbars.
     //		Set to Infinity for no max height.  Default is to limit height to available space in viewport,
     //		above or below the aroundNode or specified x/y position.
     };
     =====*/

    /**
     * summary:
     *  Used to show drop downs (ex: the select list of a ComboBox)
     *  or popups (ex: right-click context menus).
     * @class module:xide.popup
     *
     */
    var PopupManager = declare(null, {
        // _stack: dijit/_WidgetBase[]
        //		Stack of currently popped up widgets.
        //		(someone opened _stack[0], and then it opened _stack[1], etc.)
        _stack: [],
        // _beginZIndex: Number
        //		Z-index of the first popup.   (If first popup opens other
        //		popups they get a higher z-index.)
        _beginZIndex: 1000,
        _idGen: 1,
        _repositionAll: function(){
            // summary:
            //		If screen has been scrolled, reposition all the popups in the stack.
            //		Then set timer to check again later.

            if(this._firstAroundNode){	// guard for when clearTimeout() on IE doesn't work
                var oldPos = this._firstAroundPosition,
                    newPos = domGeometry.position(this._firstAroundNode, true),
                    dx = newPos.x - oldPos.x,
                    dy = newPos.y - oldPos.y;

                if(dx || dy){
                    this._firstAroundPosition = newPos;
                    for(var i = 0; i < this._stack.length; i++){
                        var style = this._stack[i].wrapper.style;
                        style.top = (parseFloat(style.top) + dy) + "px";
                        if(style.right == "auto"){
                            style.left = (parseFloat(style.left) + dx) + "px";
                        }else{
                            style.right = (parseFloat(style.right) - dx) + "px";
                        }
                    }
                }

                this._aroundMoveListener = setTimeout(lang.hitch(this, "_repositionAll"), dx || dy ? 10 : 50);
            }
        },
        /**
         * Initialization for widgets that will be used as popups.
         * Puts widget inside a wrapper DIV (if not already in one),and returns pointer to that wrapper DIV.
         * @param node
         * @returns {HTMLElement}
         * @private
         */
        _createWrapper: function(node){
            var wrapper = $(node).data('_popupWrapper');
            var owner = $(node).data('owner');
            if(!wrapper){
                // Create wrapper <div> for when this widget [in the future] will be used as a popup.
                // This is done early because of IE bugs where creating/moving DOM nodes causes focus
                // to go wonky, see tests/robot/Toolbar.html to reproduce
                var $wrapper = $("<div class='xPopup' style='display:none' role='region'></div>" );
                $('body').append(wrapper);
                $wrapper.append($(node));
                wrapper = $wrapper[0];
                var s = node.style;
                s.display = "";
                s.visibility = "";
                s.position = "";
                s.top = "0px";
                if(owner){
                    if(owner._on){
                        owner._on('destroy',function(e){
                            $wrapper.remove();
                        });
                    }
                }
                $(node).data('_popupWrapper',wrapper);
            }
            return wrapper;
        },
        /**
         * Moves the popup widget off-screen.
         * Do not use this method to hide popups when not in use, because
         * that will create an accessibility issue: the offscreen popup is
         * still in the tabbing order.
         * @param node {HTMLElement}
         * @returns {*}
         */
        moveOffScreen: function(node){
            // Create wrapper if not already there
            var wrapper = this._createWrapper(node);
            // Besides setting visibility:hidden, move it out of the viewport, see #5776, #10111, #13604
            // domGeometry.isBodyLtr(widget.ownerDocument)
            var ltr = true,
                style = {
                    visibility: "hidden",
                    top: "-9999px",
                    display: ""
                };
            style[ltr ? "left" : "right"] = "-9999px";
            style[ltr ? "right" : "left"] = "auto";
            $(wrapper).css(style);
            return wrapper;
        },
        /**
         * Hide this popup widget (until it is ready to be shown).
         * Initialization for widgets that will be used as popups.
         * Also puts widget inside a wrapper DIV (if not already in one)
         * If popup widget needs to layout it should
         * do so when it is made visible, and popup._onShow() is called.
         * @param widget {HTMLElement}
         */
        hide: function(widget){
            // Create wrapper if not already there
            var wrapper = this._createWrapper(widget);
            $(wrapper).css({
                display: "none",
                height: "auto",			// Open() may have limited the height to fit in the viewport,
                overflowY: "visible",	// and set overflowY to "auto".
                border: ""			// Open() may have moved border from popup to wrapper.
            });
            // Open() may have moved border from popup to wrapper.  Move it back.
            var node = widget.domNode;
            if("_originalStyle" in node){
                node.style.cssText = node._originalStyle;
            }
        },
        getTopPopup: function(){
            // summary:
            //		Compute the closest ancestor popup that's *not* a child of another popup.
            //		Ex: For a TooltipDialog with a button that spawns a tree of menus, find the popup of the button.
            var stack = this._stack;
            for(var pi = stack.length - 1; pi > 0 && stack[pi].parent === stack[pi - 1].widget; pi--){
                /* do nothing, just trying to get right value for pi */
            }
            return stack[pi];
        },
        /**
         * Popup the widget at the specified position
         * example:
         *   opening at the mouse position
         *      popup.open({popup: menuWidget, x: evt.pageX, y: evt.pageY});
         *
         * example:
         *  opening the widget as a dropdown
         *      popup.open({parent: this, popup: menuWidget, around: this.domNode, onClose: function(){...}});
         *
         *  Note that whatever widget called dijit/popup.open() should also listen to its own _onBlur callback
         *  (fired from _base/focus.js) to know that focus has moved somewhere else and thus the popup should be closed.
         * @param args
         * @returns {*}
         */
        open: function(args){
            // summary:
            //		Popup the widget at the specified position
            //

            var isLTR = true;
            var self = this,
                stack = this._stack,
                widget = args.popup,
                node = args.popup,
                orient = args.orient || ["below", "below-alt", "above", "above-alt"],
                ltr = args.parent ? args.parent.isLeftToRight() : isLTR,
                around = args.around,
                owner = $(node).data('owner'),
                id = (args.around && args.around.id) ? (args.around.id + "_dropdown") : ("popup_" + this._idGen++);

            // If we are opening a new popup that isn't a child of a currently opened popup, then
            // close currently opened popup(s).   This should happen automatically when the old popups
            // gets the _onBlur() event, except that the _onBlur() event isn't reliable on IE, see [22198].
            while(stack.length && (!args.parent || $.contains(args.parent.domNode,stack[stack.length - 1].widget.domNode))){
                this.close(stack[stack.length - 1].widget);
            }

            // Get pointer to popup wrapper, and create wrapper if it doesn't exist.  Remove display:none (but keep
            // off screen) so we can do sizing calculations.
            var wrapper = this.moveOffScreen(widget);
            var $wrapper = $(wrapper);

            // Limit height to space available in viewport either above or below aroundNode (whichever side has more
            // room), adding scrollbar if necessary. Can't add scrollbar to widget because it may be a <table> (ex:
            // dijit/Menu), so add to wrapper, and then move popup's border to wrapper so scroll bar inside border.
            var maxHeight, popupSize = domGeometry.position(node);
            if("maxHeight" in args && args.maxHeight != -1){
                maxHeight = args.maxHeight || Infinity;	// map 0 --> infinity for back-compat of _HasDropDown.maxHeight
            }else{
                var viewport = {
                    t:0,
                    l:0,
                    h:$(window).height(),
                    w:$(window).width()
                };
                var aroundPos = around ? domGeometry.position(around, false) : {y: args.y - (args.padding||0), h: (args.padding||0) * 2};
                maxHeight = Math.floor(Math.max(aroundPos.y, viewport.h - (aroundPos.y + aroundPos.h)));
            }
            if(popupSize.h > maxHeight){
                // Get style of popup's border.  Unfortunately domStyle.get(node, "border") doesn't work on FF or IE,
                // and domStyle.get(node, "borderColor") etc. doesn't work on FF, so need to use fully qualified names.
                var cs = domStyle.getComputedStyle(node),
                    borderStyle = cs.borderLeftWidth + " " + cs.borderLeftStyle + " " + cs.borderLeftColor;

                $wrapper.css({
                    overflowY: "scroll",
                    height: maxHeight + "px",
                    border: borderStyle	// so scrollbar is inside border
                });
                node._originalStyle = node.style.cssText;
                node.style.border = "none";
            }

            $wrapper.attr({
                id: id,
                style: {
                    zIndex: this._beginZIndex + stack.length
                },
                "class": "xPopup " + (widget.baseClass || widget["class"] || "").split(" ")[0] + "Popup",
                dijitPopupParent: args.parent ? args.parent.id : ""
            });


            if(stack.length === 0 && around){
                // First element on stack. Save position of aroundNode and setup listener for changes to that position.
                this._firstAroundNode = around;
                //this._firstAroundPosition = domGeometry.position(around, true);
                var offset = $(around).offset()
                this._firstAroundPosition = {
                    w:$(around).width(),
                    h:$(around).height(),
                    x:offset.left,
                    y:offset.top
                }
                //this._aroundMoveListener = setTimeout(lang.hitch(this, "_repositionAll"), 50);
                this._aroundMoveListener = setTimeout(function(){
                    self._repositionAll();
                }, 50);
            }

            // position the wrapper node and make it visible
            var layoutFunc = null ; //widget.orient ? lang.hitch(widget, "orient") : null;
            var best = around ?
                    place.around(wrapper, around, orient, ltr, layoutFunc) :
                    place.at(wrapper, args, orient == 'R' ? ['TR', 'BR', 'TL', 'BL'] : ['TL', 'BL', 'TR', 'BR'], args.padding,
                        layoutFunc);

            wrapper.style.visibility = "visible";
            node.style.visibility = "visible";	// counteract effects from _HasDropDown


            var handlers = [];
            $(wrapper).on('keydown',function(evt){
                if(evt.keyCode == 27 && args.onCancel){//esape
                    evt.stopPropagation();
                    evt.preventDefault();
                    args.onCancel();
                }else if(evt.keyCode == 9){//tab
                    evt.stopPropagation();
                    evt.preventDefault();
                    var topPopup = self.getTopPopup();
                    if(topPopup && topPopup.onCancel){
                        topPopup.onCancel();
                    }
                }
            });
            // watch for cancel/execute events on the popup and notify the caller
            // (for a menu, "execute" means clicking an item)
            if(widget.onCancel && args.onCancel){
                handlers.push(widget.on("cancel", args.onCancel));
            }

            $(node).css('display','block');
/*
            handlers.push(widget.on(widget.onExecute ? "execute" : "change", lang.hitch(this, function(){
                var topPopup = this.getTopPopup();
                if(topPopup && topPopup.onExecute){
                    topPopup.onExecute();
                }
            })));
            */

            stack.push({
                widget: widget,
                wrapper: wrapper,
                parent: args.parent,
                onExecute: args.onExecute,
                onCancel: args.onCancel,
                onClose: args.onClose,
                handlers: handlers
            });

            if(widget.onOpen){
                // TODO: in 2.0 standardize onShow() (used by StackContainer) and onOpen() (used here)
                widget.onOpen(best);
            }

            return best;
        },

        close: function(/*Widget?*/ popup){
            // summary:
            //		Close specified popup and any popups that it parented.
            //		If no popup is specified, closes all popups.


            var stack = this._stack;


            // Basically work backwards from the top of the stack closing popups
            // until we hit the specified popup, but IIRC there was some issue where closing
            // a popup would cause others to close too.  Thus if we are trying to close B in [A,B,C]
            // closing C might close B indirectly and then the while() condition will run where stack==[A]...
            // so the while condition is constructed defensively.
            while((popup && _.some(stack, function(elem){
                return elem.widget == popup;
            })) ||

            (!popup && stack.length)){
                var top = stack.pop(),
                    widget = top.widget,
                    onClose = top.onClose;

                if(widget.onClose){
                    widget.onClose();
                }

                var h;
                while(h = top.handlers.pop()){
                    h.remove();
                }

                // Hide the widget and it's wrapper unless it has already been destroyed in above onClose() etc.
                if(widget && widget.domNode){
                    this.hide(widget);
                }
                if(onClose){
                    onClose();
                }
            }

            $(popup.domNode).css('display','none');
            if(stack.length === 0 && this._aroundMoveListener){
                clearTimeout(this._aroundMoveListener);
                this._firstAroundNode = this._firstAroundPosition = this._aroundMoveListener = null;
            }
        }
    });

    window.popup = new PopupManager();






    /*
    var dropDown = this.dropDown,
        ddNode = dropDown.domNode,
        aroundNode = this._aroundNode || this.domNode,
        self = this;

    var retVal = popup.open({
        parent: this,
        popup: dropDown,
        around: aroundNode,
        orient: this.dropDownPosition,
        maxHeight: this.maxHeight,
        onExecute: function(){
            self.closeDropDown(true);
        },
        onCancel: function(){
            self.closeDropDown(true);
        },
        onClose: function(){
            domAttr.set(self._popupStateNode, "popupActive", false);
            domClass.remove(self._popupStateNode, "dijitHasDropDownOpen");
            self._set("_opened", false);	// use set() because _CssStateMixin is watching
        }
    });


    // Set width of drop down if necessary, so that dropdown width + width of scrollbar (from popup wrapper)
    // matches width of aroundNode
    if(this.forceWidth || (this.autoWidth && aroundNode.offsetWidth > dropDown._popupWrapper.offsetWidth)){
        var widthAdjust = aroundNode.offsetWidth - dropDown._popupWrapper.offsetWidth;
        var resizeArgs = {
            w: dropDown.domNode.offsetWidth + widthAdjust
        };
        if(lang.isFunction(dropDown.resize)){
            dropDown.resize(resizeArgs);
        }else{
            domGeometry.setMarginBox(ddNode, resizeArgs);
        }

        // If dropdown is right-aligned then compensate for width change by changing horizontal position
        if(retVal.corner[1] == "R"){
            dropDown._popupWrapper.style.left =
                (dropDown._popupWrapper.style.left.replace("px", "") - widthAdjust) + "px";
        }
    }

    domAttr.set(this._popupStateNode, "popupActive", "true");
    domClass.add(this._popupStateNode, "dijitHasDropDownOpen");
    this._set("_opened", true);	// use set() because _CssStateMixin is watching

    this._popupStateNode.setAttribute("aria-expanded", "true");
    this._popupStateNode.setAttribute("aria-owns", dropDown.id);

    // Set aria-labelledby on dropdown if it's not already set to something more meaningful
    if(ddNode.getAttribute("role") !== "presentation" && !ddNode.getAttribute("aria-labelledby")){
        ddNode.setAttribute("aria-labelledby", this.id);
    }
    */

    //
    //
    //
    //
    ////////////////////////////////////////////////////////


    //action renderer class
    var ContainerClass = dcl([_XWidget,ActionContext.dcl,ActionMixin.dcl],{
        templateString:'<div class="mainMenu ribbonToolbar dhtmlxribbon_material" style="min-height: 160px"></div>',
        /**
         * @type {module:xide/layout/_TabContainer}
         */
        tabContainer:null,
        startup:function(){
            this.tabContainer = this.add(utils.addWidget(_TabContainer,{},this,this,true));
        },
        /**
         * @returns {module:xide/layout/_TabContainer}
         */
        getRootContainer:function(){
            return this.tabContainer;
        }
    });
    MenuMixinClass = dcl(null, {

        actionStores: null,
        correctSubMenu: false,
        _didInit: null,
        actionFilter: null,
        hideSubsFirst: false,
        containerClass:'dhxrb_3rows_button',
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
        isLeftToRight:function(){
            return false;
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
                        var sub_menu = '<li class="dhxrb_3rows_button dropdown-submenu';
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
            var subClass = (subMenu) ? ' dropdown-context-sub' : ' scrollable-menu ';
            var $menu = $('<ul tabindex="1" aria-expanded="true" role="menu" class="dropdown-menu dropdown-context' + subClass + '" id="dropdown-' + id + '"></ul>');
            if (!subMenu) {
                this._rootMenu = $menu;
            }
            var result = this.buildMenuItems($menu, data, id, subMenu);
            $menu.data('data',data);
            return result;
        },
        createNewAction: function (command) {
            var segments = command.split('/');
            var lastSegment = segments[segments.length - 1];
            var action = new Action({
                command: command,
                label: lastSegment,
                group: lastSegment,
                dynamic:true
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
                    if(self.renderItem){
                        return self.renderItem(this,data,$menu,this.data, owner, label, icon, visibility, showKeyCombo, lazy);
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

            if (!store) {
                console.error('buildActionTree : invalid store');
                return null;
            }

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



            var collapseSmallGroups = 2;
            var tree = {};
            //stats to count groups per tab
            var biggestTab = rootActions[0];
            var nbGroupsBiggest=0;

            _.each(rootActions, function (level) {
                // collect all actions at level (File/View/...)
                var menuActions = owner.getItemsAtBranch(allActions, level);
                // convert action command strings to Action references
                var grouped = self.toActions(menuActions, store);

                // expand filter -------------------
                var addedExpanded = [];
                var toRemove = [];
                _.each(grouped,function(action){
                    var actionData = self.getActionData(action);
                    if(actionData.expand){
                        var children = action.getChildren();
                        children && children.length && (addedExpanded = addedExpanded.concat(children));
                        toRemove.push(action);
                    }
                });
                grouped = grouped.concat(addedExpanded);
                grouped = grouped.filter(function(action){
                    return toRemove.indexOf(action) ==-1;
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
                if(collapseSmallGroups) {
                    var nbGroups = _.keys(menuActions.grouped).length;
                    if (nbGroups > nbGroupsBiggest) {
                        nbGroupsBiggest = nbGroups;
                        biggestTab = level;
                    }
                }
            });






            //now move over any tab with less than 2 groups to the next bigger tab
            collapseSmallGroups && _.each(tree,function(actions,level){
                if(_.keys(actions.grouped).length<collapseSmallGroups){
                    //append tab groups of the biggest tab
                    tree[biggestTab] && _.each(actions.grouped,function(group,name){
                        tree[biggestTab].grouped[name] = group;
                    });
                    //copy manually commands to that tab
                    tree[biggestTab] && _.each(actions,function(action){
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

    var ActionRendererClass = dcl(null,{
        renderTopLevel:function(name,where){
            var root = this.getRootContainer();
            var tab= root.getTab('name');
            var node = null;
            if(!tab){
                tab = root.createTab(name);
                node = $(utils.getNode(tab));
                node.addClass('nav navbar-nav dhx_cell_tabbar');
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
            element = '<li class="dhxrb_3rows_button" title="' + title + ' ' + keyComboString + '">';
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

                    if(isFirst) {
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
                                $sub.css('display','');
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
        setActionStore:function(store,owner){
            this._clear();
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
                var block = $('<div class="dhxrb_block_base">');
                where.append(block);
                var blockItems = $('<div class="dhxrb_block_items"/>');
                block.append(blockItems);
                var blockLabel = $('<div class="dhxrb_block_label_fixed">' + name +  '</div>');
                block.append(blockLabel);
                var result = {
                    root:block,
                    items:blockItems,
                    label:blockLabel
                };
                groupBlocks.push(result);
                return result;
            }

            var lastGroup = '';
            var lastTarget = root;

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

                //temp group string of the last rendered action's group
                for (var i = 0; i < menuActions.length; i++) {
                    var command = menuActions[i];
                    var action = self.getAction(command,store);
                    var isDynamicAction = false;
                    var lastHeader = null;
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
                                var groupContainer = createGroupContainer(root,group);
                                lastTarget = groupContainer.items;
                            }
                        }

                        var item = self.toMenuItem(action, owner, label, icon, visibility || {},false);
                        item.level = 0;
                        data.push(item);
                        visibility.widget = item;
                        self.addReference(action,item);
                        var childPaths = new Path(command).getChildren(allActionPaths,false),
                            isContainer = childPaths.length> 0,
                            childActions = isContainer ? self.toActions(childPaths,store) : null ;


                        //var parseChildren = false;

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

                        /*
                        if(childActions && parseChildren){
                            var subs = [];
                            _.each(childActions,function(child){
                                var _renderData = self.getActionData(child);
                                var _item = self.toMenuItem(child, owner, _renderData.label, _renderData.icon, _renderData.visibility,false);
                                self.addReference(child,_item);
                                subs.push(_item);
                            });
                            item.subMenu = subs;
                        }
                        */


                        self.buildMenuItems(lastTarget, [item], "-" + new Date().getTime());
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
    var actions = [],
        thiz = this,
        ACTION_ICON = types.ACTION_ICON,
        grid,
        ribbon,
        CIS;


    var ctx = window.sctx,
        root;
    function doTests(tab){

        var grid = FTestUtils.createFileGrid('root',{},{
            _permissions:[
                ACTION.SOURCE,
                //ACTION.CLIPBOARD,
                ACTION.SELECTION
            ]
        },'TestGrid',module.id,false,tab);
        var menuNode = grid.header;
        grid.showToolbar(true,MainMenu,menuNode,true);
        return;
        var menuNode = grid.header;
        var mainMenu = utils.addWidget(MainMenu,{
            attachToGlobal:false
        },null,menuNode,true);
        grid.resize();
        //////////////////////////////////////////////////
        mainMenu._registerActionEmitter(grid);
        tab.add(mainMenu);
        setTimeout(function(){
            mainMenu.currentActionEmitter = null;
            mainMenu.setActionEmitter(grid);
        },2000);
    }
    function doBlockTests(tab){

        grid = _TestBlockUtils.createBlockGrid(ctx,tab);
        var menuNode = grid.header;

        grid.showToolbar(true,MainMenu,menuNode,true);
        /*
        var mainMenu = utils.addWidget(MainMenu,{
            attachToGlobal:false
        },null,menuNode,true);
        //////////////////////////////////////////////////
        mainMenu._registerActionEmitter(grid);
        tab.add(mainMenu);
        setTimeout(function(){
            mainMenu.currentActionEmitter = null;
            mainMenu.setActionEmitter(grid);
        },2000);
        */
    }
    if (ctx) {
        var parent = TestUtils.createTab(null,null,module.id);
        //doTests(parent);
        doBlockTests(parent);
        return declare('a',null,{});

    }
    return _Widget;

});

