/** @module xide/layout/_TabContainer **/
define([
    "xdojo/has",
    "dcl/dcl",
    'xide/utils',
    "xide/_base/_Widget",
    "xide/container/_PaneBase"
], function (has,dcl,utils,_Widget,_PaneBase) {


    var TabPaneClass = dcl(_PaneBase,{
        declaredClass:'xide/layout/_TabPane',
        postMixInProperties:function(){
            var active = this.selected ? 'active' : '';
            this.templateString = '<div attachTo="containerNode" style="height:inherit;width:inherit;position:relative;" class="tab-pane ' + active + '"></div>';
        },
        __init:function(){
            var panel = this.$toggleNode;
            this.__addHandler(panel,'hidden.bs.tab','_onHided');
            this.__addHandler(panel,'hide.bs.tab','_onHide');
            this.__addHandler(panel,'shown.bs.tab','_onShown');
            this.__addHandler(panel,'show.bs.tab','_onShow');
        }
    });

    var TabContainer = dcl(_Widget,{
        declaredClass:'xide/layout/_TabContainer',
        tabClass:TabPaneClass,
        tabs:null,
        tabBar:null,
        tabContentNode:null,
        padding:'0px',
        containerCSSClass:'',
        direction:'above',
        navBarClass:'',
        startup:function(){
            if(this._started){
                return;
            }
        },
        templateString:'<div class="${!containerCSSClass} tabbable tabs-${!direction}" style="height: inherit;" attachTo="containerNode">' +
        '<ul attachTo="tabBar" class="nav nav-tabs" role="tablist" />' +
        '<div attachTo="tabContentNode" style="width: inherit; height: 100%;" class="tab-content"/>' +
        '</div>',
        getTab:function(name){
            return _.find(this._widgets,{
                title:name
            });
        },
        _unselectAll:function(){
            _.each(this._widgets,function(tab){
                tab.unselect();
            });
        },
        onShowTab:function(tab){
            if(this._parent && this._parent.resize){
                //this._parent.resize();
            }
            //this.resize();
            this._emit('selectChild',tab);
        },
        getSelected:function(){
            for (var i = 0; i < this.tabs.length; i++) {
                var obj = this.tabs[i];
                if(obj.pane.selected){
                    return obj.pane;
                }
            }
        },
        selectChild:function(mixed){
            var tab = mixed;
            if(mixed!==null) {
                if (_.isString(mixed)) {
                    tab = this.getTab(mixed);
                }else if(_.isNumber(mixed)){
                    tab = this._widgets[0];
                }
                if (tab && tab.select) {
                    this._unselectAll();
                    tab.select();
                }
            }
            return tab;
        },
        addWidget:function(widgetProto, ctrArgsIn, delegate, parent, startup, cssClass,baseClasses,select,classExtension){
            var target = parent;
            if(widgetProto.isContainer){
            }else{
                target = this._createTab(this.tabClass,{
                    title:ctrArgsIn.title,
                    icon:ctrArgsIn.icon,
                    selected:ctrArgsIn.selected,
                    ignoreAddChild:true
                });
            }
            return target;
        },
        resize:function(){
            if(this.tabBar){
                switch (this.direction){
                    case 'left':
                    case 'right':{
                        this.$tabContentNode.css('width', '');
                        break;
                    }
                    case 'above':
                    case 'below':{
                        if(this.$containerNode && this.resizeContainer!==false) {
                            var _total = this.$containerNode.height();
                            var _toolbar = this.$tabBar.height();
                            this.$tabContentNode.css('height', _total - _toolbar);
                        }
                        break;
                    }
                }
            }

            _.each(this._widgets,function(w){
               w.resize();
            });
        },
        _createTab:function(tabClass,options){
            !this.tabs && (this.tabs = []);
            var active = this.tabs.length == 0 ? 'active' : '',
                icon = options.icon || '',
                title = options.title || '',
                selected = options.selected!=null ? options.selected : this.tabs.length ==0;

            var pane = utils.addWidget(tabClass || this.tabClass,{
                title:title,
                icon:icon,
                selected:selected,
                owner:this
            },null,this.tabContentNode,true);

            var tabId = pane.id,
                iconStr = icon ? ' ' +icon : '',
                toggleNodeStr =
                    '<li class="' +active + '">' +
                    '<a href="#'+tabId +'" data-toggle="tab"><span class="' +iconStr  +'"/> ' + title +'</a></li>',
                tabButton = $(toggleNodeStr);

            $(this.tabBar).append(tabButton);


            pane.$toggleNode  = tabButton.find('a[data-toggle="tab"]');
            pane.$selectorNode  = tabButton.find('li');
            pane.$toggleButton  = tabButton;
            pane.__init();
            this.tabs.push({
                id:tabId,
                pane: pane,
                button:tabButton[0]
            });
            this.add(pane,null,false);
            return pane;
        },
        removeChild:function(tab,selectNew){
            tab = _.isString(tab) ? this.getTab(tab) : tab;
            if(!tab){
                console.error('invalid child !');
                return;
            }
            //@TODO: no no no:
            tab.destroy();
            if(!this._widgets){
                this._widgets=[];
            }
            this._widgets.remove(tab);
            if(selectNew!==false) {
                var newTab = this._widgets[this._widgets.length - 1];
                if (newTab) {
                    this.resize();
                    this.selectChild(newTab);
                }
            }
        },
        empty:function(){
            while(this._widgets.length){
                this.removeChild(this._widgets[0],false);
            }
        },
        postMixInProperties:function(){
            if(this.direction==='below'){
                this.templateString = '<div class="${!containerCSSClass} tabbable tabs-${!direction}" style="height: inherit;" attachTo="containerNode">' +
                    '<div attachTo="tabContentNode" style="width: inherit; padding:${!padding}; height: 100%;" class="tab-content"/>' +
                    '<ul attachTo="tabBar" class="nav nav-tabs" role="tablist" />' +
                    '</div>';
            }
        },

        createTab:function(title,icon,selected,tabClass,mixin){
            return this._createTab(tabClass,utils.mixin({
                icon:icon,
                selected:selected,
                title:title
            },mixin));
        }
    });

    TabContainer.tabClass = TabPaneClass;
    dcl.chainAfter(TabContainer, "postMixInProperties");
    dcl.chainAfter(TabContainer, "resize");

    dcl.chainAfter(TabContainer, "destroy");

    return TabContainer;

});