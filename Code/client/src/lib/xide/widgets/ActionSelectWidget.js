define([
    'dcl/dcl',
    "dojo/_base/declare",
    'dojo/_base/connect',
    'dojo/dom-class',
    "xide/widgets/TemplatedWidgetBase",
    'dijit/MenuItem',
    'dojo/aspect',
    'xide/widgets/_MenuMixin',
    'dijit/Menu'
    /*,
    'dijit/PopupMenuItem',
    'dijit/form/DropDownButton'
    */
], function (dcl,declare,connect,domClass, TemplatedWidgetBase, MenuItem, aspect,_MenuMixin,Menu,PopupMenuItem,DropDownButton) {
    return dcl([TemplatedWidgetBase,_MenuMixin],
        {
            declaredClass:"xide.widgets.ActionSelectWidget",
            wButton: null,
            wThumb: null,
            wList: null,
            wTree: null,
            layout: null,
            menu: null,
            menuItemProto:null,
            _didCreateDefaultItems: false,
            addJQueryClasses: true,
            menuItems: null,
            iconClass: 'fa-code',
            updateDropdownIcon:true,
            _lastSelectedItem:null,
            templateString: "<div>" +
            "</div>",
            createItem:function(label,icon,value,selected,handler){
                /*
                "<div class='' data-dojo-type='dijit.form.DropDownButton' data-dojo-props=\"iconClass:'${!iconClass}'\" attachTo='wButton'>" +
                "<span></span>" +
                "<div attachTo='menu' data-dojo-type='dijit.Menu' style='display: none;'></div>" +
                "</div>" +
                    */
                return {
                    label:label,
                    iconClass:icon,
                    value:value,
                    selected:value==selected,
                    handler:handler
                };
            },
            _focusMenu:function(menu){

                return;
                setTimeout(function() {
                    menu.domNode.focus();
                    var _children = menu.getChildren();
                    if (!_.isEmpty(_children)){
                        _children[0].domNode.focus();
                    }
                },10);
            },
            _patchMenu: function (widget) {
                var thiz=this;
                aspect.after(widget, 'onOpen', function () {
                    var dst = this._popupWrapper;
                    if (dst) {
                        domClass.add(dst, 'ui-widget ui-widget-content');
                    }
                    thiz._focusMenu(widget);
                });
            },
            open: function () {

                this.wButton.domNode.focus();
                this.wButton.openDropDown();
                if (this._lastSelectedItem) {
                    this._lastSelectedItem.focus();
                }
            },
            _defaultItems: function () {
                return [];
            },
            onMenuItemClick: function (menuItem) {

                if (menuItem.item.handler) {
                    menuItem.item.handler();
                    if(this.updateDropdownIcon){
                        this.wButton.set('iconClass',menuItem.item.iconClass);
                    }
                    menuItem.set('selected',true);
                    if(this._lastSelectedItem){
                        this._lastSelectedItem.set('selected',false);
                    }
                    this._lastSelectedItem = menuItem;
                    return;
                }
                try {
                    if(this.delegate && this.delegate.addItem) {
                        this.delegate.addItem(menuItem);
                    }
                } catch (e) {
                    debugger;
                }
            },
            fixButton: function (button) {

                if (button && button.iconNode) {
                    domClass.add(button.domNode, 'ui-menu-item');
                    domClass.remove(button.iconNode, 'dijitReset');
                    domClass.add(button.iconNode, 'actionToolbarButtonElusive');
                }
            },
            _addHandler: function (menuItem, item) {
                var thiz = this;
                connect.connect(menuItem, "onClick", function () {
                    thiz.onMenuItemClick(menuItem);
                });
            },
            createMenuItem: function (itemData, index) {

                var icon = itemData.icon || (itemData.iconClass) || 'fa-cloud';

                var subItems = itemData.items;
                var thiz = this;

                //has sub items : put them into own popup menu
                if (subItems && subItems.length > 0) {

                    var pSubMenu = new Menu({parentMenu: this.menu});

                    this._patchMenu(pSubMenu);

                    for (var i = 0; i < subItems.length; i++) {

                        var subItem = new MenuItem({
                            item: subItems[i],
                            iconClass: subItems[i].iconClass,
                            label: subItems[i].name,
                            owner: itemData
                        });
                        pSubMenu.addChild(subItem);
                        this._addHandler(subItem, subItems[i]);
                    }

                    this.menu.addChild(new PopupMenuItem({
                        label: itemData.label || itemData.name,
                        popup: pSubMenu,
                        iconClass: icon
                    }));

                    return pSubMenu;

                } else {//single item

                    var proto = this.menuItemProto || MenuItem;
                    var menuItem =  new proto({
                        item: itemData,
                        iconClass: icon,
                        label: itemData.label || itemData.name,
                        selected:itemData.selected===true,
                        cssClass:itemData.label || itemData.name
                    });
                    this.menu.addChild(menuItem);

                    connect.connect(menuItem, "onClick", function () {
                        thiz.onMenuItemClick(menuItem);
                    });
                    this.fixButton(menuItem);


                    return menuItem;
                }
            },
            _createDefaultItems: function (actions) {
                this.menuItems = [];
                this.firstItem = null;
                actions = this._defaultItems() || actions || [];//this.delegate.getFilters(this.item) || this._defaultItems();
                for (var i = 0; i < actions.length; i++) {

                    var menuItem = this.createMenuItem(actions[i], i + 1);

                    if (!this.firstItem) {
                        this.firstItem = menuItem;
                    }
                    this.menuItems.push(menuItem);
                    if(menuItem.selected){
                        this.wButton.set('iconClass',menuItem.item.iconClass);
                        this._lastSelectedItem = menuItem;
                    }
                }
                this._didCreateDefaultItems = true;
            },
            onOpen: function () {
                if (!this._didCreateDefaultItems) {
                    this._createDefaultItems();
                }
            },
            postMixInProperties:function(){
                this.inherited(arguments);

                //this.wButton.dropDown=this.menu;

            },
            startup: function () {
                if (this._started) {
                    return;
                }
                this.menuItems = [];
                var menu = new Menu({ });
                menu.domNode.style.display="none";
                this.menu = menu;

                var params = {
                    label: "",
                    name: "",
                    dropDown: menu,
                    iconClass:this.iconClass
                };
                this.wButton = new DropDownButton(params);
                this.domNode.appendChild(this.wButton.domNode);

                try {
                    this.inherited(arguments);
                    if (!this._didCreateDefaultItems) {
                        this._createDefaultItems();
                    }
                    if (this.addJQueryClasses) {
                        domClass.add(this.menu.containerNode, 'ui-widget ui-widget-content ui-corner-all');
                    }
                    this.fixButton(this.wButton);
                    this._patchMenu(this.menu);
                } catch (e) {
                    console.error('crash in action select widget ' + e);
                }
            }
        });
});