define([
    'dcl/dcl',
    'dojo/on',
    'xide/widgets/WidgetBase',
    //'xide/views/TextEditor',
    "dojo/keys",
    "dojo/dom-style",
    "xide/utils"
], function (dcl, on, WidgetBase, keys, domStyle, utils) {
    return dcl(WidgetBase, {
        declaredClass: "xide.widgets.RichTextWidget",
        didLoad: false,
        minHeight: "300px",
        editorHeight: "470px",
        jsonEditorHeight: "270px",
        aceEditorHeight: "200px",
        aceEditorOptions: null,
        aceEditor: null,
        aceNode: null,
        useACE: false,
        templateString: "<div class='jsonEditorWidgetContainer' style='width: 100%;height:300px'>" +
        "<div attachTo='textArea' class='textarea' placeholder='Enter text ...' style='width: 100%; min-height: 100px; font-size: 14px; line-height: 18px;'></div>"+
        "<div attachTo='toolbar' style='display: none;'>" +

        "</div>"+
        "</div>",
        editor: null,
        getValue: function () {
            //"<div valign='middle' class='aceEditorWidget' attachTo='aceNode' style='height:100%;padding: 0px;'></div>";
            if (this.aceEditor) {
                return this.aceEditor.get('value');
            }
            return this.inherited(arguments);
        },
        resize: function () {

            this.inherited(arguments);
            if (this.aceEditor) {
                this.aceEditor.resize();
            }

        },
        ctlrKeyDown: false,
        onKeyUp: function (evt) {

            switch (evt.keyCode) {
                case keys.ALT:
                case keys.CTRL:
                {
                    this.ctlrKeyDown = false;
                    break;
                }
            }
        },
        onKey: function (evt) {

            switch (evt.keyCode) {


                case keys.META:
                case keys.ALT:
                case keys.SHIFT:
                case keys.CTRL:
                {
                    this.ctlrKeyDown = true;
                    setTimeout(function () {
                        thiz.ctlrKeyDown = false
                    }, 2000);
                    break;
                }
            }
            var thiz = this;
            if (evt.type && evt.type == 'keyup') {
                return this.onKeyUp(evt);
            }
            var charOrCode = evt.charCode || evt.keyCode;

            if (this.ctlrKeyDown && charOrCode === 83) {
                evt.preventDefault();

                if (this.delegate && this.delegate.onSave) {
                    this.delegate.onSave(this.userData, this.getValue());
                }
            }
        },
        setupEventHandlers: function () {
            var thiz = this;

            on(this.aceNode, "keydown", function (event) {
                thiz.onKey(event);
            });

        },
        _lastContent: null,
        _onACEUpdate: function () {
            var _newValue = this.getValue();
            this.setValue(_newValue);
            this.changed = true;
            if (this.userData) {
                this.userData.changed = true;
            }
        },
        _createACEEditor: function (parentNode) {

            var _options = {
                region: "center",
                value: this.getValue(),
                style: "margin: 0; padding: 0; position:relative;overflow: auto;height:inherit;width:inherit;",
                mode: 'text',
                readOnly: false,
                tabSize: 2,
                softTabs: true,
                wordWrap: true,
                showPrintMargin: false,
                highlightActiveLine: false,
                fontSize: '13px',
                showGutter: false,
                className: 'editor-ace ace_editor ace-codebox-dark ace_dark',
                autoFocus: false
            };

            if (_options.value == -1) {
                _options.value = '';
            }
            var editorPane = new TextEditor(_options, dojo.doc.createElement('div'));


            this.aceNode.appendChild(editorPane.domNode);
            editorPane.startup();
            this.aceEditor = editorPane;
            this.aceEditor.setOptions();

            var editor = this.aceEditor.getEditor();
            var thiz = this;

            editor.on('change', function () {
                //thiz._onACEUpdate();
                var _newValue = thiz.getValue();
                thiz.userData = utils.setCIValueByField(thiz.userData, "value", _newValue);
                thiz.changed = true;
                if (thiz.userData) {
                    thiz.userData.changed = true;
                }

            });

            editor.on('blur', function () {
                thiz.setActive(false);
                var cVal = thiz.getValue();
                if (thiz._lastContent != cVal) {
                    thiz.setValue(cVal);
                }
            });
            editor.on('focus', function () {
                thiz.setActive(true);
            });

        },
        startup: function () {

            var value = this.userData ? this.userData['value'] : '';
            var thiz = this;
            try {


                var wysihtml5ParserRules = {
                    tags: {
                        strong: {},
                        b:      {},
                        i:      {},
                        em:     {},
                        br:     {},
                        p:      {},
                        div:    {},
                        span:   {},
                        ul:     {},
                        ol:     {},
                        li:     {},
                        a:      {
                            set_attributes: {
                                target: "_blank",
                                rel:    "nofollow"
                            },
                            check_attributes: {
                                href:   "url" // important to avoid XSS
                            }
                        }
                    }
                };

                var text = this.$textArea;

                this.$textArea.html(value);
                var editor = new wysihtml5.Editor(this.$textArea[0], {
                    toolbar: this.$toolbar[0],
                    parserRules:  wysihtml5ParserRules
                });

                this.$textArea.on('change',function(e){
                    console.log('changed ' + text.val());
                });

                editor.on('change',function(e){
                    //var text = e.target.textContent;
                    console.log('new text ' + text.html());
                    thiz.setValue(text.html());
                });


                this.add(editor,null,false);


                /*
                var _editor = this.$textArea.wysihtml5({
                    contentEditableMode:true
                });
                */


                /*
                if (this.useACE && !this.aceEditor) {
                    this._createACEEditor(this.aceNode);
                } else {
                    if (value) {
                        this.aceNode.innerHTML = value;
                        domStyle.set(this.domNode, {
                            height: 'auto',
                            width: 'auto'
                        })
                    }
                }
                */

            } catch (e) {
                console.error('constructing json editor widget failed : ' + e.message);
                logError(e);
            }
            this.setupEventHandlers();
        }
    });
});