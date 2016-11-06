define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "xide/utils",
    "xide/types",
    //'xide/widgets/ActionSelectWidget',
    'xide/views/SplitView',
    //'dijit/MenuItem',
    'xaction/Action'
],function (declare,lang,utils, types,ActionSelectWidget,SplitView, Action) {
    /**
         * Adds this functionality to a sub-classing object
         * - extend item actions for split - combo box
         *
         */
        return declare("xide.views.SplitViewMixin", null, {

            /***
             * The current split mode. If NULL, then it was not splitted yet.
             * This value is defined in types.VIEW_SPLIT_MODE
             */
            currentSplitMode: null,

            /**
             * Instance of the combo-box menu widget
             */
            _splitMenuWidget: null,

            /**
             * Instance to the split view
             */
            _splitView: null,

            /**
             * Set the split mode
             * @param mode
             * @param widget : the menu item
             */
            setSplitMode: function (mode, widget) {

                if(widget) {
                    this._splitMenuWidget.wButton.set('iconClass', '' + widget.iconClass);
                }
                this.splitMode = mode;

                if (!this.doSplit) {

                    var isSplit = mode == types.VIEW_SPLIT_MODE.SPLIT_HORIZONTAL || mode == types.VIEW_SPLIT_MODE.SPLIT_VERTICAL;

                    if (isSplit) {


                        try {
                            //park the sub class somewhere else
                            var tmpPos = dojo.doc.createElement('div');
                            var splitContent = this.getSplitContent();

                            dojo.place(splitContent, tmpPos);

                            //create a split view if needed
                            if (!this._splitView) {

                                this.onSplit();

                                var splitView = utils.addWidget(SplitView, {
                                    delegate: this
                                }, this, dojo.doc.createElement('div'), true);

                                //now move the split view in
                                dojo.place(splitView.domNode, this.getSplitTarget(), 'first');

                                //now move the desired view into the splitview
                                dojo.place(splitContent, splitView.layoutLeft.containerNode, 'first');

                                splitView.resize();

                                //now add the split view to
                            }
                        } catch (e) {
                            console.error('');
                        }
                    }
                } else {
                    this.doSplit(mode);
                }

            },
            /**
             * Adds a sub menu widget to a menu
             * @param name
             * @param icon
             * @param mode
             * @param menuWidget
             */
            addSplitMode: function (name, icon, mode, menuWidget,actions,tab) {
                var thiz = this;
                var widget = new MenuItem({
                    label: name,
                    checked: false,
                    mode: mode,
                    iconClass: icon
                }, dojo.doc.createElement('div'));

                widget.on("click", function () {
                    thiz.setSplitMode(mode, widget);
                });
                menuWidget.menu.addChild(widget);

                if(actions){

                    var _toggle = Action.createDefault(name, icon, 'View/Layout/'+name, 'Layout', function(){
                        thiz.setSplitMode(mode, null);
                    },{
                        tab:tab || 'View'
                    });

                    actions.push(_toggle);
                }
            },
            addSplitModes: function (widget) {
                this.addSplitMode('Design', 'el-icon-eye-open', types.VIEW_SPLIT_MODE.DESIGN, widget);
                this.addSplitMode('Source', 'fa-code', types.VIEW_SPLIT_MODE.SOURCE, widget);
                this.addSplitMode('Horizontal', 'layoutIcon-horizontalSplit', types.VIEW_SPLIT_MODE.SPLIT_HORIZONTAL, widget);
                this.addSplitMode('Vertical', 'layoutIcon-verticalSplit', types.VIEW_SPLIT_MODE.SPLIT_VERTICAL, widget);
            },
            getSplitViewAction: function (mixin,actions,tab) {


                var args = {
                    item: null,
                    delegate: this,
                    style: 'float:left;',
                    iconClass: 'fa-th'
                },
                    VISIBILITY = types.ACTION_VISIBILITY;

                if(mixin){
                    lang.mixin(args,mixin);
                }
                var widget = utils.addWidget(ActionSelectWidget,args , this, dojo.doc.createElement('div'), true);

                this.addSplitModes(widget,actions);

                this._splitMenuWidget = widget;

                var _toggle = Action.createDefault('View', 'fa-laptop', 'View/Layout', 'Layout', null, {
                    tab:tab ||'View',
                    dummy:true
                }).setVisibility(VISIBILITY.CONTEXT_MENU, null).
                    setVisibility(VISIBILITY.MAIN_MENU, {show: false}).
                    setVisibility(VISIBILITY.ACTION_TOOLBAR, {
                        label: '',
                        _widget: widget
                    });



                _toggle.setVisibility(VISIBILITY.RIBBON,{
                    expand:true
                });



                return _toggle;
            }
        });
    });