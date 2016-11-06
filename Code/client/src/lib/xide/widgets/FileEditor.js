define([
    'dcl/dcl',
    "xide/widgets/WidgetBase",
    'xide/utils',
    'xide/editor/Registry'
], function (dcl,WidgetBase, utils, Registry) {

    return dcl(WidgetBase, {
        declaredClass:"xide.widgets.FileEditor",
        templateString: "<div style='height: inherit;'></div>",
        instance: null,
        resize: function () {
            if (this.instance) {
                utils.resizeTo(this.domNode, this.domNode.parentNode, true, true);
                utils.resizeTo(this.instance.domNode, this.domNode, true, true);
                this.instance.resize();
            }
        },
        createWidgets: function (userData) {

            var editorName = userData.editor,
                editorArgs = userData.editorArgs,
                editorItem = userData.editorItem,
                editorOverrides = userData.editorOverrides,
                editor = Registry.getEditor(editorName),
                thiz = this;

            if (!editor) {
                console.error('no such editor! ' + editorName);
                return;
            }
            try {
                editor.onEdit(editorItem, editorArgs, editorOverrides, this.domNode).then(function (instance) {
                    thiz.instance = instance;
                });
            } catch (e) {
                debugger;
            }
        },
        startup: function () {
            this.createWidgets(this.userData);
            this.onReady();
        }
    });
});