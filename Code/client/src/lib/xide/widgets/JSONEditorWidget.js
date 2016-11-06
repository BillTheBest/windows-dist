define([
    'dcl/dcl',
    'dojo/_base/declare',
    'dojo/_base/connect',
    'dojo/dom-class',
    'dojo/_base/lang',
    'xide/widgets/WidgetBase',
    'xide/views/TextEditor',
    'xide/utils',
    'xide/json/JSONEditor'

], function (dcl,declare, connect, domClass, lang, WidgetBase, TextEditor, utils,JSONEditor) {

    return dcl(WidgetBase, {
        declaredClass:"xide.widgets.JSONEditorWidget",
        didLoad: false,
        minHeight: "525px",
        editorHeight: "470px",
        jsonEditorHeight: "270px",
        aceEditorHeight: "200px",
        newLabel: "New Entry",
        newEntryTemplate: "",
        wNew: null,
        initialTemplate: [],
        wSaveButton: null,
        showACEEditor: true,
        aceEditorOptions: null,
        aceEditor: null,
        aceNode: null,
        wBorderContainer: null,
        wJSONPane: null,
        wACEPane: null,
        wToAceButton: null,
        wFromAceButton: null,
        hasSave: true,
        hasNew: false,
        editor: null,
        title:'Options',
        templateString: "<div class='widgetContainer widgetBorder widgetTable widget' style=''>" +
        "<table border='0' cellpadding='5px' width='100%'>" +
        "<tbody align='left'>" +
        "<tr attachTo='extensionRoot' valign='middle' style='height:90%'>" +
        "<td attachTo='titleColumn' width='15%' class='widgetTitle'><b><span attachTo='titleNode'>${!title}</span></b></td>" +
        "<td valign='middle' class='widgetValue widget jsonEditorWidget' attachTo='valueNode' width='100px'></td>" +
        "<td class='extension' attachTo='previewNode'></td>" +
        "<td class='extension' attachTo='button0'></td>" +
        "<td class='extension' attachTo='button1'></td>" +
        "</tr>" +
        "</tbody>" +
        "</table>" +
        "<div attachTo='expander' style='width:100%;'></div>" +
        "<div attachTo='last'></div>" +
        "</div>",
        getValue: function () {
            if (this.editor) {
                var json = this.editor.getData();
                var val = JSON.stringify(json,null,2);
                return val;
            }

            return this.inherited(arguments);
        },
        setData: function (data) {
            if (this.editor) {
                this.editor.setData(data);
            }
            return this.inherited(arguments);
        },
        onSave:function(what){
            this.setValue(this.getValue());
        },
        startup: function () {
            var data = utils.getJson(this.userData.value);
            var editor = utils.addWidget(JSONEditor,utils.mixin({
                options:{
                    save:true
                }
            },this.userData.options),this,this.valueNode,true);
            editor.setData(data);
            this.editor = editor;
        }
    });
});