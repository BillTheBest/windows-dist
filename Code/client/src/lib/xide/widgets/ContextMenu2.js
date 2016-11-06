define([
    'dcl/dcl',
    'dojo/_base/declare',
    'dojo/Stateful',
    'xide/types',
    'xide/utils',
    './_MenuMixin',

    "../mixins/EventedMixin",
    'dijit/Menu',
    'dijit/MenuItem',
    'xide/data/Reference',
    'dijit/PopupMenuItem',
    'xlang/i18',
    "xide/mixins/ActionMixin",
    'xaction/ActionContext',
    'xaction/ActionStore',
    'xaction/DefaultActions',
    "xaction/ActionProvider",


    "xide/widgets/_MenuMixin2"
], function (dcl,declare, Stateful, types,
             utils,
             _MenuMixin,
             EventedMixin,Menu,MenuItem,Reference,PopupMenuItem,i18,
             ActionMixin, ActionContext, ActionStore, DefaultActions, ActionProvider) {

    var ContextMenu = dcl([_Widget.dcl, ActionContext.dcl, ActionMixin.dcl, ActionRendererClass,MenuMixinClass,_XWidget.StoreMixin], {
        target: null,
        openTarget:null,
        addContext: function (selector, data) {

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



            var root = $(document);
            /*
             this.__on(root, 'keydown', null, function (e) {

             var $this = $(this);
             console.log('dropdown key');

             return;
             switch(evt.keyCode) {
             case 13: // Enter key
             case 32: // Space bar
             case 38: // Up arrow
             case 40: // Down arrow
             $this.addClass("open");
             $this.find('.dropdown-menu a:first').focus();
             break;
             case 27: // Escape key
             $this.removeClass("open");
             $this.focus();
             break;
             }
             });
             */

            this.__on(target, 'contextmenu', null, function (e) {

                self.isOpen = true;
                self.onOpen(e);
                e.preventDefault();
                e.stopPropagation();
                var currentContextSelector = $(this);
                $('.dropdown-context:not(.dropdown-context-sub)').hide();

                var $dd = $('#dropdown-' + id);

                $dd.focus();

                /*
                 $('.dropdown-menu').bind('keydown', function (evt) {
                 var $this = $(this);
                 console.log('dropdown key');
                 switch(evt.keyCode) {
                 case 13: // Enter key
                 case 32: // Space bar
                 case 38: // Up arrow
                 case 40: // Down arrow
                 $this.addClass("open");
                 $this.find('.dropdown-menu a:first').focus();
                 break;
                 case 27: // Escape key
                 $this.removeClass("open");
                 $this.focus();
                 break;
                 }
                 });

                 $('.dropdown-menu a').bind('keydown', function (evt) {
                 console.log('key');
                 var $this = $(this);

                 function select_previous () {
                 $this.parent('li').prev().find('a').focus();
                 evt.stopPropagation();
                 }

                 function select_next () {
                 $this.parent('li').next().find('a').focus();
                 evt.stopPropagation();
                 }

                 switch(evt.keyCode) {
                 case 13: // Enter key
                 case 32: // Space bar
                 $this.click();
                 $this.closest('.dropdown').removeClass('open');
                 evt.stopPropagation();
                 break;
                 case 9: // Tab key
                 if (evt.shiftKey) {
                 select_previous();
                 }
                 else {
                 select_next();
                 }
                 evt.preventDefault();
                 break;
                 case 38: // Up arrow
                 select_previous();
                 break;
                 case 40: // Down arrow
                 select_next();
                 break;
                 }
                 });

                 var first =$dd.find('.dropdown-menu a:first');
                 console.log('focus: ',first);
                 first.focus();
                 */

                //$dd.find('.dynamic-menu-item').remove(); // Destroy any old dynamic menu items

                /*
                 $dd.find('.dynamic-menu-src').each(function (idx, element) {
                 var menuItems = window[$(element).data('src')]($(selector));
                 $parentMenu = $(element).closest('.dropdown-menu.dropdown-context');
                 console.log('----');
                 $parentMenu = self.buildMenuItems($parentMenu, menuItems, id, undefined, true);
                 });
                 */


                if (typeof options.above == 'boolean' && options.above) {
                    //$dd.addClass('dropdown-context-up').css({

                    $dd.css({
                        top: e.pageY - 20 - $('#dropdown-' + id).height(),
                        left: e.pageX - 13
                    }).fadeIn(options.fadeSpeed);

                } else if (typeof options.above == 'string' && options.above == 'auto') {

                    $dd.removeClass('dropdown-context-up');

                    var autoH = $dd.height() + 0;

                    var totalH = $('html').height();

                    //console.log('height ' + autoH + ' | total ' + totalH + ' rel ' + e.pageY,$dd);



                    var preferUp = true;
                    if ((e.pageY + autoH) > $('html').height()) {

                        //console.log('place up ' + (e.pageY - 20 - autoH));

                        var top = e.pageY - 20 - autoH;
                        if(top < 0){
                            top = 20;
                        }

                        $dd.css({
                            top: top,
                            left: e.pageX - 13
                        }).fadeIn(options.fadeSpeed);

                    } else {
                        console.log('place down' + (e.pageY + 10));
                        $dd.css({
                            top: e.pageY + 10,
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
            });

            return $menu;
        },
        onRootAction:function(level,container){
            return null;
        },
        setActionStore: function (store, owner) {


            this.addActionStore(store);


            var self = this,
                visibility = self.visibility,
                rootContainer = $(self.getRootContainer()),
                tree = self.buildActionTree(store,owner),
                allActions = tree.allActions,
                rootActions = tree.rootActions,
                allActionPaths = tree.allActionPaths;

            this.store = store;

            var data = [];

            _.each(tree.root, function (menuActions,level) {

                var root = self.onRootAction(level,rootContainer),
                    lastGroup = '',
                    lastHeader = {
                        header:''
                    },
                    groupedActions = menuActions.grouped;


                _.each(menuActions, function (command) {

                    var action = self.getAction(command,store),
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

                        if (!isDynamicAction && group && groupedActions[group] && groupedActions[group].length >= 2) {
                            if (lastGroup !== group) {
                                lastHeader = {header: i18.localize(group)};
                                data.push(lastHeader);
                                lastGroup = group;
                            }
                        }



                        var item = self.toMenuItem(action, owner, label, icon, visibility || {});

                        data.push(item);

                        visibility.widget = item;

                        self.addReference(action,item);

                        var childPaths = new Path(command).getChildren(allActionPaths, false),
                            isContainer = childPaths.length > 0,
                            childActions = isContainer ? self.toActions(childPaths,store) : null;

                        if (childActions) {
                            var subs = [];
                            _.each(childActions, function (child) {
                                var _renderData = self.getActionData(child);
                                var _item = self.toMenuItem(child, owner, _renderData.label, _renderData.icon, _renderData.visibility);
                                self.addReference(child,_item);
                                subs.push(_item);
                            });
                            item.subMenu = subs;
                        }
                    }
                });
            });

            var menu = self.attach($('body'), data);

            self.onDidRenderActions(store,owner);

        }//method end
    });//class end

    return ContextMenu;
});