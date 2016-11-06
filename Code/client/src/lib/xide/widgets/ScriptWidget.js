define([
    'dcl/dcl',
    'xide/widgets/WidgetBase',
    "xide/utils",
    'dojo/has!xace?xace/views/Editor'
], function (dcl,WidgetBase, utils,Editor) {
    return dcl(WidgetBase, {
        declaredClass:"xide.widgets.ScriptWidget",
        aceEditor: null,
        editorArgs:{},
        editorOptions:{
            showGutter:false,
            mode:'javascript'
        },
        height:'200px',
        templateString: "<div class='' style='width: 100%;height:auto'>" +
        "<div valign='middle' class='aceEditorWidget' attachTo='aceNode' style='height:${!height}'></div>" +
        "</div>",
        getValue: function () {
            if (this.aceEditor) {
                return this.aceEditor.get('value');
            }
            return this.inherited(arguments);
        },
        setValue: function (value) {
            this.userData = utils.setCIValueByField(this.userData, "value", value);
        },
        _onACEUpdate: function () {
            var _newValue = this.getValue();
            this.setValue(_newValue);
            this.changed = true;
            if (this.userData) {
                this.userData.changed = true;
            }
        },
        createWidgets: function () {

            var args = utils.mixin({
                    style:'padding:0px;',
                    iconClass:'fa-code',
                    value: this.getValue(),
                    options:this.userData.options || this.editorOptions || {
                        showGutter:false
                    }
                },this.editorArgs),

                self = this,

                editor = this.add(Editor,args,this.aceNode,true,true),

                ace = editor.getAce();


            ace.on('change', function () {
                self._onACEUpdate();
            });

            ace.on('blur', function () {
                self.setActive(false);
            });

            ace.on('focus', function () {
                self.setActive(true);
            });

            this.height && $(editor.domNode).css('max-height',this.height);



            return editor;
        },
        startup: function () {
            this.aceEditor = this.createWidgets(this.aceNode);
        }
    });
});