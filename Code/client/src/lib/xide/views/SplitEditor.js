define([
    "dojo/_base/declare",
    'xide/types',
    'xide/utils',
    'xaction/Action'
], function (declare,types,utils,ReloadMixin,Action) {
    return declare("xide.views.SplitEditor", [ReloadMixin], {
        _bc:null,
        _srcCP:null,
        _designCP:null,
        _displayMode:'splitHorizontal',
        _activeEditor:null,
        syncOnSave:true,
        setActiveEditor:function(editor){
            this._activeEditor = editor;
            this._emit('setActiveEditor',editor);
        },
        getActiveEditor:function(){
            return this._activeEditor;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        //
        //          Actions
        //
        /////////////////////////////////////////////////////////////////////////////////////////
        /**
         * Minimum bean protocol interface implementation:
         */
        getActiveItem: function () {
            return null;
        },
        hasItemActions: function () {
            return true;
        },
        getItem: function () {
            return {};
        },
        getItemActions: function () {

            var actions = [],
                VISIBILITY = types.ACTION_VISIBILITY,
                thiz = this;

            if(this.getLeftEditor() && this.getLeftEditor().getItemActions){
                actions = actions.concat(this.getLeftEditor().getItemActions());
            }

            if(this.getRightEditor() && this.getRightEditor().getItemActions){
                actions = actions.concat(this.getRightEditor().getItemActions());
            }

            actions.push(this.getSplitViewAction({
                style:'float:right'
            }));

            actions.push(Action.create('To Source', 'fa-angle-down', 'Edit/To Source', false, null, types.ITEM_TYPE.TEXT, 'editorAction', null,false,function () {
                thiz.setRightValue(thiz.getLeftValue());
            },{}).setVisibility(VISIBILITY.ACTION_TOOLBAR, {
                label: '',
                widgetArgs:{
                    style:'float:right'
                }
            }));
            actions.push(Action.create('To Visual Editor', 'fa-angle-up', 'Edit/To Visual Editor', false, null, types.ITEM_TYPE.TEXT, 'editorAction', null,false,function () {
                thiz.setLeftValue(thiz.getRightValue());
            },{}).setVisibility(VISIBILITY.ACTION_TOOLBAR, {
                label: '',
                widgetArgs:{
                    style:'float:right'
                }
            }));



            return actions;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        //
        //          Default Content Exchange methods
        //
        /////////////////////////////////////////////////////////////////////////////////////////
        getLeftEditor:function(){
            return this._designCP;
        },
        getRightEditor:function(){
            return this._srcCP;
        },
        getLeftValue:function(){
            return this.getLeftEditor().getValue();
        },
        getRightValue:function(){
            return this.getRightEditor().getValue();
        },
        setRightValue:function(value){
            return this.getRightEditor().setValue(value);
        },
        setLeftValue:function(value){
            return this.getLeftEditor().setValue(value);
        },
        openItem:function(item){

        },
        createLeftView:function(where,who){},
        createRightView:function(where,who){},
        _updateView:function(view,side){

            if(!view){
                console.error('weird, editor invalid');
                return;
            }

            var thiz = this;
            view.on('click',function(){
                thiz.setActiveEditor(view);
            });

            view._on('addAction',function(action){

                if(action.command === 'File/Save'){

                    var _originalHandler = action.handler,
                        activeEditor = null,
                        value = null;

                    if(!action._newHandler) {
                        var newHandler = function () {

                            activeEditor = thiz.getActiveEditor();
                            value = activeEditor.getValue();

                            if (thiz.syncOnSave) {
                                var otherEditor = activeEditor == thiz.getLeftEditor() ? thiz.getRightEditor() : thiz.getLeftEditor();
                                if (activeEditor && otherEditor && activeEditor != otherEditor) {
                                    otherEditor.setValue(value);
                                }
                            }

                            thiz._emit('onSave', {
                                value: value,
                                editor: activeEditor
                            });
                            _originalHandler.apply();
                        };

                        action.handler = newHandler;
                        action._newHandler = newHandler;
                    }
                }
                return thiz._emit('addAction',action);
            });


            this._emit('createEditor',{
                side:side,
                editor:view
            });

        },
        createWidgets:function(){

            this._bc = utils.addWidget(BorderContainer,{
                /*_splitterClass: null,*/
                liveSplitters:true
            },this,this.containerNode,true);

            //this.item = fileItem;
            /*
            this._designCP = new ContentPane({'class': 'designCP', region: 'center', style: 'padding:0px;'});
            this._bc.addChild(this._designCP);*/

            if(this.item) {
                this._designCP = this.createLeftView(this._bc, this,this.item);
                this._updateView(this._designCP,'left');
                this._srcCP = this.createRightView(this._bc, this,this.item);
                this._updateView(this._srcCP,'right');
            }

            this.switchDisplayMode(this._displayMode);
        },
        destroyWidgets:function(){
            utils.destroy([this._bc,this._designCP,this._srcCP]);
        },
        onReloaded:function(){
            this.destroyWidgets();
            this.createWidgets();
        },
        startup:function(){

            this.inherited(arguments);

            this.createWidgets();



            var thiz = this;

            this.on('click', function () {

                //click on our dom node will trigger item selection. this is a fake event and
                //needed to force the applications main view to re-build the toolbar
                this.publish(types.EVENTS.ON_ITEM_SELECTED, {
                        item: this.item,
                        owner: this
                    }
                );
                if (thiz.onItemClear) {
                    thiz.onItemClear();
                }
                if (thiz.onItemClick) {
                    thiz.onItemClick(null);
                }
            });

        },
        switchDisplayMode: function (newMode) {

            if (this._displayMode != "design") {
                this._bc.removeChild(this._srcCP);
                //this.htmlEditor.setVisible(false);
            }

            // reset any settings we have used
            this._designCP.set("region", "center");
            delete this._designCP.domNode.style.width;
            delete this._srcCP.domNode.style.width;

            switch (newMode) {
                case "design":
                    this.setActiveEditor(this.getLeftEditor());
                    break;
                case "source":

                    // we want to hide the design mode.  So we set the region to left
                    // and manually set the width to 0.
                    this._designCP.set("region", "left");
                    this._designCP.domNode.style.width = 0;
                    this._srcCP.set("region", "center");

                    this.setActiveEditor(this.getRightEditor());
                    break;
                case "splitVertical":
                    this._designCP.domNode.style.width = "50%";
                    this._srcCP.set("region", "right");
                    this._srcCP.domNode.style.width = "50%";
                    this._bc.set("design", "sidebar");
                    this.setActiveEditor(this.getLeftEditor());
                    break;
                case "splitHorizontal":
                    this._designCP.domNode.style.height = "50%";

                    this._srcCP.set("region", "bottom");
                    this._srcCP.domNode.style.height = "50%";

                    this._bc.set("design", "headline");
                    this.setActiveEditor(this.getLeftEditor());
            }

            if (newMode != "design") {
                this._bc.addChild(this._srcCP);
                //this.htmlEditor.setVisible(true);
            }

            this._displayMode = newMode;

            // now lets relayout the bordercontainer
            this._bc.layout();
        },
        buildRendering:function(){

            this.inherited(arguments);
        },
        doSplit: function (mode) {

            var newMode = 'design';
                switch (mode) {

                    case types.VIEW_SPLIT_MODE.DESIGN:
                    {
                        newMode = 'design';
                        break;
                    }
                    case types.VIEW_SPLIT_MODE.SOURCE:
                    {
                        newMode = 'source';
                        break;
                    }
                    case types.VIEW_SPLIT_MODE.SPLIT_VERTICAL:
                    {
                        newMode = 'splitVertical';
                        break;
                    }
                    case types.VIEW_SPLIT_MODE.SPLIT_HORIZONTAL:
                    {
                        newMode = 'splitHorizontal';
                        break;
                    }
                }
                this.switchDisplayMode(newMode);
                this._bc.resize();
        }
    });
});