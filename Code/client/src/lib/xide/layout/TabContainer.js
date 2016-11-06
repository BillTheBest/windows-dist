define([
    'dojo/_base/declare',
    "dojo/_base/array", // array.forEach array.indexOf array.some
    'dojo/_base/connect',
    "xide/registry",
    'dijit/layout/TabContainer',
    'xide/factory',
    'xide/types',
    "dojo/dom-class", // domClass.add domClass.contains
    "xide/layout/LayoutContainer",
    'xide/mixins/EventedMixin',
    "dojo/dom-geometry" // domGeometry.position
], function (declare, array, connect, registry, TabContainer, factory, types, domClass, LayoutContainer, EventedMixin, domGeometry) {

    return declare("xide.layout.TabContainer", [TabContainer, LayoutContainer, EventedMixin], {
        allowSplit: false,
        didSplit: false,
        selectedChildWidget: null,
        dndType: 'TabContainer',
        splitColumns: 2,
        gridContainer: null,
        activeTabContainer: null,
        destroyOnEmpty: true,
        otherTabContainer: null,
        sizeTarget: null,
        destroyDescendants: function (/*Boolean*/ preserveDom) {
            this._descendantsBeingDestroyed = true;
            this.selectedChildWidget = undefined;
            array.forEach(this.getChildren(), function (child) {
                var didRemoved = false;
                if (child.onDestroy) {
                    didRemoved = child.onDestroy(this);
                }
                if (!preserveDom && !didRemoved) {
                    this.removeChild(child);
                }
                if (!didRemoved) {
                    child.destroyRecursive(preserveDom);
                }
            }, this);
            this._descendantsBeingDestroyed = false;
        },
        isSplitted: function () {
            return this.gridContainer != null;
        },
        isEmpty: function () {
            return this.getChildren().length == 0;
        },
        _restoreSingle: function () {

            /*
             //determine the full container
             var fullContainer = this.isEmpty() ===true ? this.otherTabContainer : this;
             if(!fullContainer){
             return;
             }
             //move it to a temp location
             var tmpPos = dojo.doc.createElement('div');
             dojo.place(fullContainer.domNode,tmpPos);

             //cleanup
             utils.destroy(this.gridContainer.containerNode);
             this.otherTabContainer=null;
             fullContainer.otherTabContainer=null;
             fullContainer.gridContainer=null;

             fullContainer.addSplitMenu();

             //move the filled tab container back to its parent container
             this.parentContainer.containerNode.appendChild(fullContainer.domNode);

             var thiz=this;
             setTimeout(function(){
             factory.publish(types.EVENTS.RESIZE,{},this);
             fullContainer.selectedChildWidget.onResize();
             fullContainer.resize();

             },800);
             fullContainer.resize();


             utils.destroy(this);
             */

        },
        _checkEmpty: function () {
            var child = this.getChildren();

        },
        removeChild: function (page, checkEmpty, destroy) {
            this.inherited(arguments);
            /*
             if(destroy!==false && page.destroy){//unwires events
             page.destroy();
             }
             */
            var child = this.getChildren();
            if (this.onOneTabLeft && child.length === 1) {
                this.onOneTabLeft(this);
            }
        },
        _createGridContainer: function () {

            /*var gc= new GridContainer({
             acceptTypes: [],
             hasResizableColumns:true,
             nbZones:2,
             style:{
             height: '100%'
             },
             splitter:true
             });
             this.gridContainer=gc;
             return gc;
             */
            //ep.containerNode.appendChild(gc1.domNode);
        },
        updateSize: function (tabContainer, target) {

            var children = tabContainer.getChildren();
            for (var i = 0; i < children.length; i++) {
                var pane = children[i];
                this.resizeToNode(this.sizeTarget, pane);
            }

        },
        resizeToNode: function (parent, what, offset) {
            if (parent && what && what.containerNode) {
                var size = domGeometry.getMarginBox(parent);
                var dstHeight = size.h;
                if (offset != null) {
                    dstHeight -= offset
                } else {
                    dstHeight -= 100
                }
                what.containerNode.style.height = dstHeight + "px";
            }
        },
        resizeToNodeEx: function (parent, what, offset) {
            if (parent && what) {
                var size = domGeometry.getMarginBox(parent);
                var dstHeight = size.h;
                if (offset != null) {
                    dstHeight -= offset
                } else {
                    dstHeight -= 100
                }
                what.style.height = dstHeight + "px";
            }
        },
        onResize: function () {

            return;
            /*
             if(!this.sizeTarget || !this.gridContainer){
             return;
             }

             if(this.gridContainer.paneLeft){
             this.resizeToNode(this.gridContainer.paneLeft,this.sizeTarget);
             }
             if(!this.isEmpty()){
             this.updateSize(this,this.sizeTarget);
             }
             if(this.gridContainer.paneRight){
             this.resizeToNode(this.gridContainer.paneRight,this.sizeTarget);
             }


             if(this.otherTabContainer){

             this.updateSize(this.otherTabContainer,this.sizeTarget);
             }
             */

        },
        splitVertical: function (w) {

            /*
             try{

             //1. move us to a temporary location
             var tmpPos = dojo.doc.createElement('div');
             dojo.place(this.domNode,tmpPos);

             //2. create a grid container with 2 columns
             var gridContainer = this._createGridContainer();


             //3. place the grid container on our parentContainer
             utils.addChild(this.parentContainer,gridContainer);

             //4. create another content pane to make the grid-container happy
             var paneLeft = new ContentPane({
             cssClass:'gridZoneWrapper'
             });//parent for tabContainer Left
             var paneRight = new ContentPane({
             cssClass:'gridZoneWrapper'
             });//parent for tabContainer Right
             gridContainer.addChild(paneLeft,0);
             gridContainer.addChild(paneRight,1);
             gridContainer.paneLeft=paneLeft;
             gridContainer.paneRight=paneRight;


             //4. place us back into the gridcontainer's left pane
             paneLeft.containerNode.appendChild(this.domNode);

             //this.resize();
             //this.selectedChildWidget.onResize();

             gridContainer.disableDnd();
             //create the other tab container
             }catch(e){
             debugger;
             }
             //call resize everywhere
             factory.publish(types.EVENTS.RESIZE,{},this);

             var thiz=this;

             this.removeSplitMenu();


             //right tab container
             var newTabContainer = new xide.layout.TabContainer({
             delegate:thiz.delegate,
             tabStrip:true,
             tabPosition:"top",
             splitter:true,
             region:'center',
             style:"width:inherit;height:inherit;",
             parentContainer:thiz.parentContainer,
             allowSplit:true,
             selfAccept:true,
             gridContainer:gridContainer,
             otherTabContainer:thiz

             },dojo.doc.createElement('div'));

             thiz.otherTabContainer=newTabContainer;

             //setTimeout(function(){

             factory.publish(types.EVENTS.RESIZE,{},this);

             thiz.selectedChildWidget.onResize();
             var ori = thiz.selectedChildWidget;
             //preserve our showing child to a temp location
             //var ori = thiz.selectedChildWidget;
             //var tmpPos = dojo.doc.createElement('div');
             //dojo.place(ori.domNode,tmpPos);

             //now remove the showing child
             thiz.removeChild(thiz.selectedChildWidget,false);

             //place the right tab container into the right grid-zone
             paneRight.containerNode.appendChild(newTabContainer.domNode);
             newTabContainer.startup();

             newTabContainer.addChild(ori);
             newTabContainer.selectedChildWidget=ori;


             thiz.makeDNDTarget(newTabContainer);
             thiz.makeDNDTarget(thiz);

             domClass.add(newTabContainer.domNode,'dojoDndItem');
             domClass.add(thiz.domNode,'dojoDndItem');


             //},500);

             this.publish(types.EVENTS.RESIZE,{});

             this.onContainerSplitted(this,newTabContainer);
             */
        },
        makeDNDTarget: function (tabContainer) {
            /*
             var thiz=this;
             dojo.dnd.Source(tabContainer.domNode,{
             className:'container',
             copyOnly:false,
             selfAccept:false,
             allowNested:false,
             occupied:false,
             sourceContainer:tabContainer,
             checkAcceptance:function(sources,nodes){
             return true;
             },
             onDropExternal:function(source, nodes, copy) {
             thiz.onDrop(source.sourceContainer,this.sourceContainer);
             return;
             }
             });
             */
        },
        patchTabButton: function (child) {

            /*
             var _id = this.id + '_tablist_' + child.id;
             var btn = dijit.registry.byId(_id);
             if(btn){

             btn.targetContainer=child;
             var dndTarget = Source(btn.domNode,{
             className:'container',
             copyOnly:false,
             selfAccept:false,
             allowNested:true,
             occupied:false,
             sourceContainer:this,
             checkAcceptance:function(sources,nodes){
             return true;//this.occupied==false;
             }
             });
             }
             */
        },
        removeSplitMenu: function () {
            /*
             var menu = dijit.registry.byId(this.id + "_tablist_Menu");
             if(menu){
             if(menu['splitVerticalMenuItem']){
             menu.removeChild(menu['splitVerticalMenuItem']);
             menu['splitVerticalMenuItem']=null;
             }
             }
             */
        },
        addSplitMenu: function (child) {

            var menu = registry.byId(this.id + "_tablist_Menu");
            if (menu) {
                var thiz = this;
                if (!menu['splitVerticalMenuItem']) {
                    menu['splitVerticalMenuItem'] = new MenuItem({
                        label: 'Split Vertical',
                        onClick: function (evt) {
                            thiz.splitVertical(registry.byNode(this.getParent().currentTarget));
                        }
                    });
                    menu.addChild(menu['splitVerticalMenuItem']);
                }
            }


        },
        _extendChild: function (child) {

            var _id = this.id + '_tablist_' + child.id;
            var btn = registry.byId(_id);
            if (btn) {
                child.getTabButton = function () {
                    return btn;
                }
            }
        },
        addChild: function (child, index, select) {

            child.parentContainer = this;//trace us

            this.inherited(arguments);

            this._extendChild(child);

            if (this.delegate && this.delegate.onChildAdded) {
                this.delegate.onChildAdded(this, child);
            }


            if (select === true) {
                this.selectChild(child);
                this.onShowChild(child);
            }


            /*
             if(this.allowSplit){
             if(this.otherTabContainer==null)
             this.addSplitMenu();
             this.patchTabButton(child);
             }else{

             }
             */

        },
        onDrop: function (sourceTabContainer, dstTabContainer) {
            /*
             var child = sourceTabContainer.selectedChildWidget;
             if(!child){
             return;
             }
             try{
             sourceTabContainer.removeChild(child);
             }catch(e){
             console.error('error with removing child');
             }
             dstTabContainer.addChild(child);
             dstTabContainer.selectChild(child);

             factory.publish(types.EVENTS.RESIZE,{},this);
             */

        },
        startup: function () {
            this.inherited(arguments);
            var thiz = this;


            /*
             if(this.allowSplit){
             var dst = dojo.byId(this.id + '_tablist');
             if(dst){
             var dndTarget = dojo.dnd.Source(dst,{
             className:'container',
             copyOnly:false,
             selfAccept:false,
             allowNested:false,
             occupied:false,
             sourceContainer:this,
             checkAcceptance:function(sources,nodes){
             return true;//this.occupied==false;
             },
             onDropExternal:function(source, nodes, copy) {
             thiz.onDrop(source.sourceContainer,this.sourceContainer);
             return;
             }
             });
             }
             }
             */


            domClass.add(this.containerNode, 'ui-widget-content');
            //domClass.add(this.containerNode,'widget');


            this.subscribe(types.EVENTS.RESIZE, this.onResize);
            this.addHandle('removeChild', connect.connect(this, "removeChild", this, function (view) {
                factory.publish(types.EVENTS.ON_VIEW_REMOVED, {
                    container: thiz,
                    view: view,
                    owner: thiz.delegate
                });
            }));

            this.addHandle('onclick', connect.connect(this.containerNode, "onclick", this, function (view) {
                thiz.activeTabContainer = this;
            }));

            this.addHandle('addChild', connect.connect(this, "addChild", this, function (view) {

                factory.publish(types.EVENTS.ON_VIEW_ADDED, {
                    container: thiz,
                    view: view,
                    owner: thiz.delegate
                });
            }));

            /*
             this._events.push(dojo.connect(null, (dojo.global.onorientationchange !== undefined) ? "onorientationchange" : "onresize", this, function () {

             if(thiz.gridContainer){
             thiz.gridContainer.resize();
             }
             }));
             */
        }
    });
});