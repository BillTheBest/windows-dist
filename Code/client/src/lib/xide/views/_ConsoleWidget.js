/** @module xgrid/Base **/
define([
    "dcl/dcl",
    'xide/utils',
    "xide/_base/_Widget",
    'xide/views/History',
    'xide/mixins/PersistenceMixin'
], function (dcl, utils, _Widget, History, PersistenceMixin) {

    var Module = dcl([_Widget, PersistenceMixin.dcl], {

        declaredClass: "xide.views._ConsoleWidget",
        delegate: null,
        value: null,
        editNode: null,
        labelTextNode: null,
        labelNode: null,
        type: null,
        linkToggle: null,
        edit: null,
        consoleParent: null,
        isExpanded: false,
        theme: 'View/Themes/idle_fingers',
        consoleEditor: null,
        jsContext: null,
        //resizeToParent:true,
        templateString: '<div class="consoleWidget">' +
        '<div class="" style="margin:0">' +
        '<div class="input-group border-top-dark">' +
        '<div attachTo="consoleParent" class="form-control input-transparent" style="height: 2em;padding: 0;margin: 0;overflow-y: auto"></div>' +
        '<div class="input-group-btn btn-toolbar">' +
        '<button attachTo="clearButton" type="button" class="btn btn-danger btn-sm"><i class="fa fa-remove"></i></button>' +
        '<button attachTo="expandButton" type="button" class="btn btn-danger btn-sm"><i class="fa fa-expand"></i></button>' +
        '<button type="button" class="btn btn-danger btn-sm" style="bottom:0"><i class="fa fa-link"></i></button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>',
        isLinked: function () {
            if (this.linkToggle) {
                return this.linkToggle.get('checked');
            }
            return false;
        },
        getEditor: function () {
            return this.consoleEditor;
        },
        resize: function () {
            this.inherited(arguments);

            if (this.isExpanded) {
                var total = $(this.domNode.parentNode).height();

                $(this.consoleParent).css({
                    height: total / 2 + 'px'
                });
            }
            this.aceEditor && this.aceEditor.resize();
        },
        onClear:function(){
            this.delegate.onButton();
        },
        maximize:function(){
            if(this.delegate && this.delegate.maximize){
                return this.delegate.maximize();
            }
        },
        expandEditor: function () {
            var thiz = this,
                editor = thiz.getEditor(),
                aceEditor = this.aceEditor;

            if (thiz.isExpanded) {
                $(thiz.consoleParent).css({
                    height: '2em'
                });

                thiz.isExpanded = false;
                editor.renderer.$maxLines = 1;
                editor.renderer.setShowGutter(false);
                editor.renderer.setHighlightGutterLine(false);
                aceEditor.showToolbar(false);
            } else {
                $(thiz.consoleParent).css({
                    height: $(this.domNode.parentNode).height() / 2 + 'px'
                });
                editor.renderer.$maxLines = Infinity;
                thiz.isExpanded = true;
                editor.renderer.setShowGutter(true);
                editor.renderer.setHighlightGutterLine(true);
                utils.resizeTo(editor.renderer.container, thiz.consoleParent, true, true);
                editor.resize();
                aceEditor.resize();
                aceEditor.showToolbar(true);
                var toolbar = aceEditor.getToolbar();
                toolbar && $(toolbar.domNode).css({
                    top: '0%',
                    position: "absolute"
                });
            }

            if (this.delegate && this.delegate.onConsoleExpanded) {
                this.delegate.onConsoleExpanded();
            }

            this.resize();
        },
        createEditor: function () {
            var _thiz = this;
            return createEditor(this.consoleParent, this.value, this, {
                options: this.options,
                ctx:this.ctx
            });
        },
        createWidgets: function () {


            var aceEditor = this.createEditor(this.ctx);


            this.add(aceEditor, null, false);
            this.aceEditor = aceEditor;
            aceEditor.showToolbar(false);

            var editor = aceEditor.getEditor(),
                self = this;


            aceEditor.maximize = function(){
                return self.maximize();
            }


            this.aceEditorEditor = aceEditor;
            this.consoleEditor = editor;

            editor.renderer.$maxLines = 1;
            editor.renderer.setShowGutter(false);
            editor.renderer.setHighlightGutterLine(false);
            editor.$mouseHandler.$focusWaitTimout = 0;
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true
            });

            aceEditor.setMode(this.delegate.type);
            aceEditor.set('value', this.value);
            aceEditor.runAction(this.theme);
            aceEditor.set('value', this.value);


            $(this.expandButton).click(function (e) {
                return self.expandEditor();
            });

            $(this.clearButton).on('click', function () {

                if (self.delegate && self.delegate.onButton) {
                    self.delegate.onButton();
                }
            });

            this.expandEditor();

            editor.commands.bindKeys({
                "Ctrl-Return": function (cmdLine) {
                    if (self.isExpanded) {
                        editor.focus();
                        self.onEnter(editor.getValue());
                    } else {
                        //editor.insert("\n");
                        editor.focus();
                        self.onEnter(editor.getValue());
                    }

                },
                "Shift-Return": function (cmdLine) {
                    self.onClear();
                },
                "Esc|Shift-Esc": function (cmdLine) {
                    editor.focus();
                },
                "Return": function (cmdLine) {
                    var command = editor.getValue().split(/\s+/);
                    if (self.isExpanded) {
                        editor.insert("\n");
                    } else {
                        editor.focus();
                        self.onEnter(editor.getValue());
                    }
                }
            });
            editor.commands.removeCommands(["find", "gotoline", "findall", "replace", "replaceall"]);
        },
        getValue: function () {
            return this.consoleEditor.getValue();
        },
        startup: function () {
            this.history = new History();
            this.inherited(arguments);
            this.createWidgets();
        },
        onEnter: function (val) {
            this.delegate.onEnter(val, this.isExpanded == false);
            this.history.push(val);
        }
    });
    return Module;

});