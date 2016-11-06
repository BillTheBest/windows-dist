define([
    "dcl/dcl",
    "xdojo/declare",
    "dojo/Stateful",
    'xide/utils',
    'xide/factory',
    'xide/mixins/EventedMixin',
    'xide/layout/_TabContainer',
    'xide/widgets/_Widget',
    'dojo/Deferred',
    "dojo/promise/all",
    'dojo/when'
], function (dcl,declare, Stateful, utils, factory, EventedMixin,_TabContainer,_Widget,Deferred,all,when) {
    var _debug = false;
    var Implementation = {
        declaredClass:'xide.views.CIViewMixin',
        widgets: null,
        delegate: null,
        helpNodes: null,
        store: null,
        groups: null,
        groupContainer: null,
        cssClass: 'CIView',
        ciSort:true,
        options: {
        },
        tabContainer: null,
        viewStyle: '',
        tabs: null,
        tabContainerClass:_TabContainer,
        _didRenderCIS:false,
        typeMap:null,
        getWidgetByType: function (type) {
            for (var i = 0; i < this.widgets.length; i++) {
                var widget = this.widgets[i];
                if (widget.userData.type == type) {
                    return widget;

                }
            }
            return null;
        },
        constructor:function(args){
            utils.mixin(this,args);
        },
        onValueChanged:function(evt){
            this._emit('valueChanged',evt);
        },
        createGroupContainer: function () {

            if (this.tabContainer) {
                return this.tabContainer;
            }
            var tabContainer = utils.addWidget(this.tabContainerClass || _TabContainer,{
                direction:'left',
                style: "min-width:450px;",
                _parent:this,
                resizeToParent:true
            },null,this,true);
            this.tabContainer = tabContainer;
            this.add(tabContainer,null,false);
            return tabContainer;
        },
        getGroupContainer: function () {
            if (this.groupContainer) {
                return this.groupContainer;
            }
            this.groupContainer = this.createGroupContainer();
            return this.groupContainer;
        },
        createGroupView: function (groupContainer, group,icon,selected) {
            return groupContainer.createTab(group,icon,selected,this.tabContainerClass.tabClass ||  _TabContainer.tabClass);
        },
        attachWidgets: function (data, dstNode,view) {
            var thiz = this;
            this.helpNodes = [];
            this.widgets = [];

            dstNode = dstNode || this.domNode;

            var isSingle = !dstNode;

            if(!dstNode && this.tabContainer){
                dstNode = this.tabContainer.containerNode;
            }
            if (!dstNode) {
                console.error('have no parent dstNode!');
                return;
            }
            data = data.reverse();

            for (var i = 0; i < data.length; i++) {
                var widget = data[i];
                widget.delegate = this.owner || this;
                dstNode.appendChild(widget.domNode);
                _debug && console.log('attach widget ',widget);
                if(view && view.lazy===true) {
                    widget._startOnShow = true;
                }else{
                    try {
                        widget.startup();
                    }catch(e){
                        logError(e,'Error starting widget');
                    }
                }
                widget._on('valueChanged',function(evt){
                    evt.view = view;
                    thiz.onValueChanged(evt);
                });
                this._emit('widget',{
                    widget:widget,
                    ci:widget.userData
                });

                this.widgets.push(widget);
                widget.userData.view=view;
                widget.onAttached && widget.onAttached(view);
                if(view && view.add && view.add(widget,null,false)){

                }else{
                    _debug && console.error('view has no add',view);
                    this.add(widget,null,false);
                }
            }
        },
        empty: function (destroyHandles) {
            if (this.helpNodes) {
                for (var i = 0; i < this.helpNodes.length; i++) {
                    utils.destroy(this.helpNodes[i]);
                }
            }
            if (this.widgets) {
                for (var i = 0; i < this.widgets.length; i++) {
                    utils.destroy(this.widgets[i],true)
                }
            }
            destroyHandles !==false && this._destroyHandles();
            this.tabs = [];

        },
        toArray: function (obj) {
            var result = [];
            for (var c in obj) {
                result.push({
                    name: c,
                    value: obj[c]
                });
            }
            return result;
        },
        onRendered:function(){
            var container = this.getGroupContainer();
            if(this.options.select) {
                container.selectChild(this.options.select);
            }else{
                container.selectChild(0);
            }
            container.resize();
        },
        getTypeMap:function(){
        },
        renderGroup:function(container,title,data){
            var view = this.createGroupView(container, title);
            this.tabs.push(view);
            if(this.ciSort) {
                data = data.sort(function (left, right) {
                    var a = left.order || 0;
                    var b = right.order || 0;
                    return a > b ? -1 : 1;
                });
            }
            var groupDfd = factory.createWidgetsFromArray(data, this, null, false,this.getTypeMap(),!this.ciSort),
                thiz  = this;

            when(groupDfd,function(widgets){
                if (widgets) {
                    _debug && console.log('render group : ' + title,[data,widgets]);
                    thiz.attachWidgets(widgets,view.containerNode,view);
                }
            });

            return groupDfd;
        },
        renderGroups: function (groups) {
            var groupContainer = this.getGroupContainer(),
                _array = groups,
                thiz = this,
                dfd = new Deferred(),
                promises = [];

            for (var i = 0; i < _array.length; i++) {
                try {
                    var groupDfd = this.renderGroup(groupContainer,_array[i].name,_array[i].value);
                    promises.push(groupDfd);
                } catch (e) {
                    console.error('ciview::renderGroups failed ' +e);
                    logError(e);
                }
            }
            all(promises).then(function(){
                groupContainer.resize();
                thiz.onRendered();
                dfd.resolve();
            });
            return dfd;
        },
        getCIS: function () {
            return this.data;
        },
        initWithCIS: function (data) {
            if(this._didRenderCIS){
                _debug && console.warn('CIS already renderers');
                return null;
            }

            this._didRenderCIS = true;
            this.empty(false);
            data = data || this.cis;
            data = utils.flattenCIS(data);
            _debug && console.log('---- init with CIS', _.pluck(data,'title'));
            this.data = data;
            var head = null,
                thiz = this,
                groups = _.groupBy(data,function(obj){
                    return obj.group;
                }),
                groupOrder = this.options.groupOrder || {};

            var groupsToRender = [];

            groups = this.toArray(groups);

            //filter groups for visible CIs
            _.each(groups,function(group){
                _.find(group.value,{visible:true}) && groupsToRender.push(group);
            });
            groups = groupsToRender;

            var grouped = _.sortByOrder(groups, function(obj){
                return groupOrder[obj.name] || 100;
            });

            if (grouped != null && grouped.length > 1) {
                head = this.renderGroups(grouped);
            } else {
                head = factory.createWidgetsFromArray(data, thiz, null, false,this.getTypeMap(),!this.ciSort);
                when(head,function(widgets){
                    thiz.widgets = widgets;
                    _debug && console.log('attach widgets',widgets);
                    if (widgets) {
                        thiz.attachWidgets(widgets);
                    }
                });
            }

            head.then(function(){
                _.invoke(thiz.widgets,'onDidRenderWidgets',thiz,thiz.widgets);
            });

            return head;
        }
    };

    var Module = declare("xide.views.CIViewMixin", [_Widget,EventedMixin],Implementation);
    Module.dcl = dcl([_Widget.dcl,EventedMixin.dcl],Implementation);
    return Module;


});