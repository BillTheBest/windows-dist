define([
    'dcl/dcl',
    'xide/widgets/WidgetBase',
    'xide/types',
    'xide/utils',
    'xide/factory',
    'xaction/ActionProvider',
    'xide/views/_LayoutMixin',
    'xide/widgets/ActionToolbar',
    'dojo/promise/all'
], function (dcl,WidgetBase, types,utils,factory,ActionProvider,_LayoutMixin,ActionToolbar,all) {
    var Module = dcl([WidgetBase,_LayoutMixin.dcl,ActionProvider.dcl], {
        declaredClass: "xide.widgets.JSONDualEditorWidget",
        minHeight: "400px;",
        value: "",
        options: null,
        templateString: "<div attachTo='domNode' class='widgetContainer widgetBorder widgetTable' style=''></div>",
        jsonEditorWidget:null,
        editorWidget:null,
        jsonOptions:{},
        setActiveEditor:function(editor){
            this._activeEditor = editor;
            this._emit('setActiveEditor',editor);
        },
        fillTemplate: function () {
            var thiz = this;
            var value = utils.toString(this.userData['value']) || '{}';

            var area = $('<textarea rows="3" class="form-control input-transparent" ></textarea>');
            area.val(value);
            this.editBox = area;
            $(this.previewNode).append(area);
            this.editBox.on("change", function (e) {
                var value2 = e.target.value;
                thiz.userData.changed = true;
                thiz.userData.active = true;
                utils.setCIValueByField(thiz.userData, "value", value2);
                var _args = {
                    owner: thiz.delegate || thiz.owner,
                    ci: thiz.userData,
                    newValue: value2
                };
                thiz.publish(types.EVENTS.ON_CI_UPDATE, _args);
                thiz._emit('valueChanged', _args);
            });

            var btn = factory.createSimpleButton('', 'fa-magic', 'btn-default', {
                style: ''
            });

            $(btn).click(function () {
                thiz.onSelect();
            });

            $(this.button0).append(btn);
        },
        /**
         *
         * @param bottom
         * @param _top
         * @param center
         * @returns {*}
         */
        createWidgets:function(bottom,_top,center){
            var data = this.userData,
                thiz = this;
            var CIS_TOP = [
                utils.createCI('Arguments', types.ECIType.JSON_DATA, utils.getJson(data.value), utils.mixin({
                    options:{
                        readOnlyNodes:{
                            "commands":true,
                            "variables":true,
                            "meta":true
                        },
                        renderTemplates : [
                            {
                                //
                                //  This segment is used to replace something in the node's dom structure
                                //

                                /**
                                 * @type {string} the path within the dom structure
                                 */
                                nodeValuePath: 'field.innerHTML',
                                /**
                                 * @type {RegExp|string|function|RegExp[]|string[]|function[]}
                                 */
                                match: [/^variables[\s]?\.(\d+)$/,/^commands[\s]?\.(\d+)$/],
                                /**
                                 * @type {string} the new value for the field specified in nodeValuePath
                                 */
                                replaceWith: '{nodeValue} - {name}',
                                /**
                                 * @type {object} additional variables
                                 */
                                variables: null,

                                /**
                                 * @type {function} a function to transform the node's dom value into something else
                                 */
                                nodeValueTransform:function(value){
                                    return utils.capitalize(value);
                                },
                                //
                                //  This segment is about dom manipulation, todo!
                                //

                                /**
                                 * @type (object)
                                 */
                                insertIfMatch:{}
                            }
                        ],
                        insertTemplates:[
                            {
                                label: 'New Command',
                                path: 'commands',
                                value: '{name:"No Title",value:""}',
                                newNodeTemplate: '[]',
                                collapse:true,
                                select:true
                            },
                            {
                                label: 'New Variable',
                                path: 'variables',
                                value: '{name:"No Title",value:""}',
                                newNodeTemplate: '[]',
                                collapse:true,
                                select:true
                            }
                        ]
                    },
                    widget:{
                        templateString:"<div class='widgetContainer widgetBorder widgetTable widget' style='height: 100%'>" +
                        "<div class='widget jsonEditorWidget' attachTo='valueNode' style='overflow: auto;height: 100%'></div>" +
                        "</div>",
                        resizeToParent:true
                    }
                },this.jsonOptions))
            ];

            var renderTop =factory.renderCIS(CIS_TOP, _top.containerNode, this);
            renderTop.then(function (widgets) {
                thiz.jsonEditorWidget = widgets[0];
                if(thiz.jsonOptions.noActions!==true) {
                    var toolbar = utils.addWidget(ActionToolbar, {
                        attachToGlobal: false,
                        resizeToParent: false
                    }, null, center, true);

                    thiz.add(toolbar, null, true);
                    var actionStore = thiz.getActionStore();
                    var actions = thiz.jsonEditorWidget.editor.getItemActions();
                    _.each(actions, function (action) {
                        action.mixin = {
                            addPermission: true
                        };
                        action.tab = "Home";
                    });
                    thiz.addActions(actions);
                    toolbar.setActionStore(actionStore, thiz);
                    $(toolbar.domNode).css({
                        width: 'auto',
                        'float': 'left'
                    });
                    $(toolbar.domNode).removeClass('actionToolbar');
                }

                $(widgets[0].domNode).on('click',function(){
                    thiz.setActiveEditor(widgets[0]);
                });
                thiz.setActiveEditor(widgets[0]);
            });

            var CIS_BOTTOM = [

                utils.createCI('Arguments', types.ECIType.SCRIPT,data.value,{
                    vertical:true,
                    widget:{
                        templateString: "<div class='' style='width: 100%;height:inherit'>",
                        height:'100%',
                        editorArgs:{
                            showGutter:true,
                            mode:'json',
                            options:{
                                showGutter:true,
                                mode:'json'
                            }
                        }
                        //resizeToParent:true
                    }
                })
            ];
            var renderBottom = factory.renderCIS(CIS_BOTTOM, bottom.containerNode, this);
            renderBottom.then(function (widgets) {
                thiz.editorWidget = widgets[0];
                $(widgets[0].domNode).on('click',function(){
                    thiz.setActiveEditor(widgets[0]);
                });
            });

            var btn = factory.createSimpleButton('', 'fa-caret-up', 'btn-default', {
                style: 'margin-right:12px'
            },this.domNode);
            var btnDown = factory.createSimpleButton('', 'fa-caret-down', 'btn-default', {
                style: ''
            },this.domNode);

            $(btn).click(function () {
                thiz.onUp();
            });
            $(btnDown).click(function () {
                thiz.onDown();
            });
            return all([renderBottom,renderTop]);
        },
        onUp:function(){
            var valueDown = this.editorWidget.getValue();
            try{
                var newData = utils.fromJson(valueDown);
                this.jsonEditorWidget.setData(newData)
            }catch(e){
                console.error('mal formed '+e);
            }
        },
        onDown:function(){
            this.editorWidget.aceEditor.set('value',this.jsonEditorWidget.getValue());
        },
        onValueChanged:function(){
        },
        startup: function () {
            var title = false,
                docker = this.getDocker(),
                toolbar = this._addPanel(utils.mixin({
                    h: '80',
                    title: title || '  '
                },{}), types.DOCKER.DOCK.TOP,title,0.5,'DefaultFixed'),
                bottom = this.getBottomPanel(false,null,null,null,null),
                panels = docker.getPanels(),
                _top = panels[1],
                _center = panels[0],
                _bottom = panels[2],
                result = this.createWidgets(_bottom,_top,_center),
                self = this;

            setTimeout(function(){
                _top.getSplitter().pos(0.5);
            },100);

            if(this.dfd){
                result.then(function(w){
                    self.dfd.resolve(w);
                })
            }
            _center.maxSize(null,38);
            _bottom.getSplitter().pos(0.5);
            $(this.domNode).css({
                "textAlign":"center"
            });
            this.add(docker,null,false);
            return result;
        },
        getValue:function(){
            return this._activeEditor.getValue();
        }
    });
    return Module;
});