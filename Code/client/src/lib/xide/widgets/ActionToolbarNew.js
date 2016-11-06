/** @module xide/widgets/ActionToolbar **/
define([
    "dojo/_base/declare",
    'dojo/dom-class',
    'dijit/form/DropDownButton',
    'xide/widgets/ActionToolbarButton',
    'dijit/Menu',
    'dijit/MenuItem',
    'dijit/Toolbar',
    'dijit/ToolbarSeparator',
    'xide/widgets/ActionToolbarMixin',
    "xide/mixins/ActionMixin",
    "xide/mixins/EventedMixin",
    "xide/widgets/_MenuMixin",
    "xide/types",
    "xide/utils",
    'dojo/aspect',
    'dijit/MenuSeparator'

], function (declare,domClass,DropDownButton,ActionToolbarButton,Menu,MenuItem,Toolbar,ToolbarSeparator,ActionToolbarMixin, ActionMixin,EventedMixin,_MenuMixin,types, utils,aspect,MenuSeparator){



    /**
     *
     * @class xide/widgets/MainMenu
     * @augments xide/mixins/ActionMixin
     * @augments xide/widgets/ActionToolbarMixin
     * @augments xide/widgets/_MenuMixin
     */
    return declare("xide/widgets/ActionToolbar", [Toolbar, ActionToolbarMixin, ActionMixin,EventedMixin,_MenuMixin], {

        /**
         * Set visibility filter
         */
        visibility: types.ACTION_VISIBILITY.ACTION_TOOLBAR,

        /**
         * Reference to the last incoming & new item actions
         */
        _newActions:null,

        /**
         * The separator class for separating actions
         */
        separatorClass:ToolbarSeparator,

        /**
         * The class being used to render an action.
         *
         * @type {dijit/_Widget}
         * @member
         */
        widgetClass:ActionToolbarButton,
        cloneActions:false,
        /**
         *
         * @param actions
         * @param newItem
         * @private
         */
        _destroyActions: function (actions,newItem) {

            "use strict";
            var thiz=this;

            if(!actions || !actions.length){
                return;
            }
            if(this.id==='undefined' || !this.id){
                return;
            }
            _.each(actions, function (action) {

                if(action) {

                    var visibility = action.getVisibility!= null ? action.getVisibility(thiz.visibility) : null;
                    var destroy = true;
                    if(visibility && visibility.permanent){
                        destroy = !(_.isFunction(visibility.permanent) ? visibility.permanent(action,thiz,thiz.lastItem) : visibility.permanent);

                    }





                    if(destroy) {

                        if(action._destroyHandles){
                            action._destroyHandles();
                        }

                        var widget = thiz.getVisibilityField(action, 'widget', null);
                        if (widget) {

                            //console.log('destroy w  ' + thiz.visibility,widget);


                            utils.destroy(widget, true);
                            thiz.setVisibilityField(action, 'widget', null);
                        }

                        /*
                         var menu = thiz.getVisibilityField(action, 'menu', null);
                         if (menu) {
                         utils.destroy(menu, true);
                         thiz.setVisibilityField(action, 'menu', null);
                         }*/

                        if (action.items) {
                            thiz._destroyActions(action.items);
                        }
                    }
                }
            });
        },
        clear:function(){
            //_destroyActions
            this._destroyActions(this._actions);
        },
        destroy:function(){

            //_destroyActions
            this._destroyActions(this._actions);

            this.inherited(arguments);
        },

        /**
         * Pre-defined top level actions
         */
        _actions: [
            {
                label: "File"
            },
            {
                label: "View"
            },
            {
                label: "Edit"
            },
            {
                label: "Help"
            },
            {
                label: "Block"
            },
            {
                label: "Clipboard"
            },
            {
                label: "Step"
            }
        ],
        renderSubActions:function(item,where){

            var thiz=this;
            if (item.items && !thiz.getVisibilityField(item,'widget')) {

                var widgetArgs = {
                    iconClass: item.icon || 'fa-magic'
                };

                var _extra = thiz.getVisibilityField(item,'widgetArgs');
                if(_extra){
                    utils.mixin(widgetArgs,_extra)
                }

                var menu = utils.addWidget(DropDownButton, widgetArgs, this, where, true);


                this.fixButton(menu);

                thiz.setVisibilityField(item, 'widget', menu);

                var pSubMenu = utils.addWidget(Menu, {
                    item:item
                }, this, null, true);
                menu.dropDown = pSubMenu;

                this._patchMenu(pSubMenu);

                if(item._emit) {

                    item._emit(this.visibility + '_WIDGET_CREATED', {
                        parent: where,
                        widget: menu,
                        action: item
                    });


                    item._emit('WIDGET_CREATED',{
                        parent:where,
                        widget:menu,
                        visibility:this.visibility
                    });

                }else{
                    console.warn('action item has no _emit!!!',item);
                }
            }
        },
        /**
         * Render actions individually as we need to 'flatten' all actions (there is no File/... Edit/... tree structure).
         */
        renderActions:function(){

            this.empty(this.rootMenu);

            var flatten = [];
            _.each(this._actions,function(level){
                flatten = flatten.concat(level.items);
            });

            this._renderActions(flatten,this.rootMenu);

        },
        check:function(){

            if(!this.domNode || this._destroyed){
                console.warn('@todo: ActionToolbar::check::orphan!');
                this.destroy();
                return false;
            }
            return true;
        },
        /**
         * Override default callback for xide/types/SET_ITEM_ACTIONS in xide/widgets/ActionToolbarMixin.
         *
         * @param item
         * @param actions
         */
        setItemActions: function (item, actions,owner) {

            if(!this.check()){
                console.warn('orphane');
                return;
            }

            if(!actions){
                actions = [];
            }


            //be nice, @TODO: there might be edge cases when using plugins
            if (this.lastItem &&  item == this.lastItem) {
                console.warn('action toolbar : setItemActions : same selection, abort!');
                return;
            }
            //remember last selection
            this.lastItem = item;

            //_destroyActions
            this._destroyActions(this._actions);

            //mark as dirty
            this.rootMenu.dirty = true;



            this.publish(types.EVENTS.ON_RENDER_ACTIONS,{
                actions:actions,
                owner:this,
                item:item
            });
            var _actions = actions;

            //remember last action set
            this._newActions = _actions;


            //empty toolbar
            //utils.empty(this.rootMenu);

            //re-populate action tree
            this._computeList(_actions);//mix items into this._actions

            //kick-off rendering
            this.renderActions(this._actions);

        },
        startup: function () {

            //make xide/widgets/_MenuMixin happy
            this.rootMenu=this;

            this._actions = dojo.clone(this._actions);

            this.inherited(arguments);
        }
    });
});