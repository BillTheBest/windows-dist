define([
    "dojo/_base/declare",
    "dojo/_base/lang", // lang.hitch
    "dijit/_Widget",
    "dojo/dom-construct", // domConstruct.create domConstruct.place
    "dojo/dom-style",
    "dojo/has",
    'xide/types',
    'xide/factory'
], function (declare, lang, _Widget, domConstruct, domStyle, has, types, factory) {

    var _splitProto = null;
    var getSplitProto = function() {

        if(_splitProto){
            return _splitProto;
        }

            "use strict";

            var require = ace.require;
            var oop = require("ace/lib/oop");
            var lang = require("ace/lib/lang");
            var EventEmitter = require("ace/lib/event_emitter").EventEmitter;

            var Editor = require("ace/editor").Editor;
            var Renderer = require("ace/virtual_renderer").VirtualRenderer;
            var EditSession = require("ace/edit_session").EditSession;
            var UndoManager = require("ace/undomanager").UndoManager;
            var HashHandler = require("ace/keyboard/hash_handler").HashHandler;

            var Split = function (container, theme, splits) {
                this.BELOW = 1;
                this.BESIDE = 0;

                this.$container = container;
                this.$theme = theme;
                this.$splits = 0;
                this.$editorCSS = "";
                this.$editors = [];
                this.$orientation = this.BESIDE;

                this.setSplits(splits || 1);
                this.$cEditor = this.$editors[0];


                this.on("focus", function (editor) {
                    this.$cEditor = editor;
                }.bind(this));
            };

            (function () {

                oop.implement(this, EventEmitter);

                this.$createEditor = function () {
                    var el = document.createElement("div");
                    el.className = this.$editorCSS;
                    el.style.cssText = "position: absolute; top:0px; bottom:0px";
                    this.$container.appendChild(el);
                    var editor = new Editor(new Renderer(el, this.$theme));


                    editor.on("focus", function () {
                        this._emit("focus", editor);
                    }.bind(this));

                    this.$editors.push(editor);

                    //var undoManager = editor.session.getUndoManager();
                    editor.session.setUndoManager(new UndoManager());

                    editor.setFontSize(this.$fontSize);
                    return editor;
                };

                this.setSplits = function (splits) {
                    var editor;
                    if (splits < 1) {
                        throw "The number of splits have to be > 0!";
                    }

                    if(splits==1){

                    }

                    if (splits == this.$splits) {
                        return;
                    } else if (splits > this.$splits) {
                        while (this.$splits < this.$editors.length && this.$splits < splits) {
                            editor = this.$editors[this.$splits];
                            this.$container.appendChild(editor.container);
                            editor.setFontSize(this.$fontSize);
                            this.$splits++;
                        }
                        while (this.$splits < splits) {
                            this.$createEditor();
                            this.$splits++;
                        }
                    } else {
                        while (this.$splits > splits) {
                            editor = this.$editors[this.$splits - 1];
                            this.$container.removeChild(editor.container);
                            this.$splits--;
                        }
                    }
                    this.resize();
                };

                /**
                 *
                 * Returns the number of splits.
                 * @returns {Number}
                 **/
                this.getSplits = function () {
                    return this.$splits;
                };

                /**
                 * @param {Number} idx The index of the editor you want
                 *
                 * Returns the editor identified by the index `idx`.
                 *
                 **/
                this.getEditor = function (idx) {
                    return this.$editors[idx];
                };

                /**
                 *
                 * Returns the current editor.
                 * @returns {Editor}
                 **/
                this.getCurrentEditor = function () {
                    return this.$cEditor;
                };

                /**
                 * Focuses the current editor.
                 * @related Editor.focus
                 **/
                this.focus = function () {
                    this.$cEditor.focus();
                };

                /**
                 * Blurs the current editor.
                 * @related Editor.blur
                 **/
                this.blur = function () {
                    this.$cEditor.blur();
                };

                this.setSessionOption= function(what,value){
                    this.$editors.forEach(function (editor) {

                        var session  =  editor.session;
                        if(what=='mode'){
                            session.setMode(value);
                        }

                    });
                };
                /**
                 *
                 * @param {String} theme The name of the theme to set
                 *
                 * Sets a theme for each of the available editors.
                 * @related Editor.setTheme
                 **/
                this.setTheme = function (theme) {
                    this.$editors.forEach(function (editor) {
                        editor.setTheme(theme);
                    });
                };

                /**
                 *
                 * @param {String} keybinding
                 *
                 * Sets the keyboard handler for the editor.
                 * @related editor.setKeyboardHandler
                 **/
                this.setKeyboardHandler = function (keybinding) {
                    this.$editors.forEach(function (editor) {
                        editor.setKeyboardHandler(keybinding);
                    });
                };

                /**
                 *
                 * @param {Function} callback A callback function to execute
                 * @param {String} scope The default scope for the callback
                 *
                 * Executes `callback` on all of the available editors.
                 *
                 **/
                this.forEach = function (callback, scope) {
                    this.$editors.forEach(callback, scope);
                };


                this.$fontSize = "";
                /**
                 * @param {Number} size The new font size
                 *
                 * Sets the font size, in pixels, for all the available editors.
                 *
                 **/
                this.setFontSize = function (size) {
                    this.$fontSize = size;
                    this.forEach(function (editor) {
                        editor.setFontSize(size);
                    });
                };

                this.$cloneSession = function (session) {
                    var s = new EditSession(session.getDocument(), session.getMode());

                    var undoManager = session.getUndoManager();
                    if (undoManager) {
                        var undoManagerProxy = new UndoManagerProxy(undoManager, s);
                        s.setUndoManager(undoManagerProxy);
                    }

                    // Overwrite the default $informUndoManager function such that new delas
                    // aren't added to the undo manager from the new and the old session.
                    s.$informUndoManager = lang.delayedCall(function () {
                        s.$deltas = [];
                    });

                    // Copy over 'settings' from the session.
                    s.setTabSize(session.getTabSize());
                    s.setUseSoftTabs(session.getUseSoftTabs());
                    s.setOverwrite(session.getOverwrite());
                    s.setBreakpoints(session.getBreakpoints());
                    s.setUseWrapMode(session.getUseWrapMode());
                    s.setUseWorker(session.getUseWorker());
                    s.setWrapLimitRange(session.$wrapLimitRange.min,
                        session.$wrapLimitRange.max);
                    s.$foldData = session.$cloneFoldData();

                    return s;
                };

                /**
                 *
                 * @param {EditSession} session The new edit session
                 * @param {Number} idx The editor's index you're interested in
                 *
                 * Sets a new [[EditSession `EditSession`]] for the indicated editor.
                 * @related Editor.setSession
                 **/
                this.setSession = function (session, idx) {
                    var editor;
                    if (idx == null) {
                        editor = this.$cEditor;
                    } else {
                        editor = this.$editors[idx];
                    }

                    // Check if the session is used already by any of the editors in the
                    // split. If it is, we have to clone the session as two editors using
                    // the same session can cause terrible side effects (e.g. UndoQueue goes
                    // wrong). This also gives the user of Split the possibility to treat
                    // each session on each split editor different.
                    var isUsed = this.$editors.some(function (editor) {
                        return editor.session === session;
                    });

                    if (isUsed) {
                        session = this.$cloneSession(session);
                    }
                    editor.setSession(session);

                    // Return the session set on the editor. This might be a cloned one.
                    return session;
                };

                /**
                 *
                 * Returns the orientation.
                 * @returns {Number}
                 **/
                this.getOrientation = function () {
                    return this.$orientation;
                };

                /**
                 *
                 * Sets the orientation.
                 * @param {Number} orientation The new orientation value
                 *
                 *
                 **/
                this.setOrientation = function (orientation) {
                    if (this.$orientation == orientation) {
                        return;
                    }
                    this.$orientation = orientation;
                    this.resize();
                };

                /**
                 * Resizes the editor.
                 **/
                this.resize = function () {
                    var width = this.$container.clientWidth;
                    var height = this.$container.clientHeight;
                    var editor;

                    if (this.$orientation == this.BESIDE) {
                        var editorWidth = width / this.$splits;
                        if(this.diffGutter){
                            editorWidth -=60/this.$splits;
                        }


                        for (var i = 0; i < this.$splits; i++) {
                            editor = this.$editors[i];
                            editor.container.style.width = editorWidth + "px";
                            editor.container.style.top = "0px";
                            editor.container.style.left = i * editorWidth + "px";
                            if(i==1 && this.diffGutter){
                                editor.container.style.left = 60 +  (i * editorWidth) + "px";
                                this.diffGutter.style.left = i * editorWidth + "px";
                                /*this.diffGutter.style.height = height + "px";*/
                            }
                            editor.container.style.height = height + "px";
                            editor.resize();
                        }
                    } else {
                        var editorHeight = height / this.$splits;
                        for (var i = 0; i < this.$splits; i++) {
                            editor = this.$editors[i];
                            editor.container.style.width = width + "px";
                            editor.container.style.top = i * editorHeight + "px";
                            editor.container.style.left = "0px";
                            editor.container.style.height = editorHeight + "px";
                            editor.resize();
                        }
                    }
                };

            }).call(Split.prototype);


            function UndoManagerProxy(undoManager, session) {
                this.$u = undoManager;
                this.$doc = session;
            }

            (function () {
                this.execute = function (options) {
                    this.$u.execute(options);
                };

                this.undo = function () {
                    var selectionRange = this.$u.undo(true);
                    if (selectionRange) {
                        this.$doc.selection.setSelectionRange(selectionRange);
                    }
                };

                this.redo = function () {
                    var selectionRange = this.$u.redo(true);
                    if (selectionRange) {
                        this.$doc.selection.setSelectionRange(selectionRange);
                    }
                };

                this.reset = function () {
                    this.$u.reset();
                };

                this.hasUndo = function () {
                    return this.$u.hasUndo();
                };

                this.hasRedo = function () {
                    return this.$u.hasRedo();
                };
            }).call(UndoManagerProxy.prototype);

            _splitProto = Split;
        /*});*/
        return _splitProto;
    };

    return declare("xide.views.TextEditor", [_Widget], {
        _aceConfig: null,
        _loadedModes: {},
        focus: function () {
            if (this.autoFocus === false) {
                return;
            }
            if (this.editor) {
                this.editor.resize();
                this.editor.renderer.updateFull();
                this.editor.focus();
            }
        },
        addAutoCompleter: function (list) {
            var editor = this.getEditor();
            var langTools = ace.require("ace/ext/language_tools");
            var rhymeCompleter = {
                getCompletions: function (editor, session, pos, prefix, callback) {

                    if (prefix.length === 0) {
                        callback(null, []);
                        return;
                    }

                    if (!list) {
                        callback(null, []);
                        return;
                    }

                    callback(null, list.map(function (ea) {
                        return {name: ea.value, value: ea.word, meta:ea.meta}
                    }));
                }
            };
            langTools.addCompleter(rhymeCompleter);
        },
        onEditorReady: function () {

            var editor = this.getEditor(),
                config = this._aceConfig,
                thiz = this;

            editor.commands.addCommands([
                {
                    name: "gotoline",
                    bindKey: {win: "Ctrl-L", mac: "Command-L"},
                    exec: function (editor, line) {
                        if (typeof line == "object") {
                            var arg = this.name + " " + editor.getCursorPosition().row;
                            editor.cmdLine.setValue(arg, 1);
                            editor.cmdLine.focus();
                            return;
                        }
                        line = parseInt(line, 10);
                        if (!isNaN(line))
                            editor.gotoLine(line);
                    },
                    readOnly: true
                },
                {
                    name: "snippet",
                    bindKey: {win: "Alt-C", mac: "Command-Alt-C"},
                    exec: function (editor, needle) {
                        if (typeof needle == "object") {
                            editor.cmdLine.setValue("snippet ", 1);
                            editor.cmdLine.focus();
                            return;
                        }
                        var s = snippetManager.getSnippetByName(needle, editor);
                        if (s)
                            snippetManager.insertSnippet(editor, s.content);
                    },
                    readOnly: true
                },
                {
                    name: "increaseFontSize",
                    bindKey: "Ctrl-+",
                    exec: function (editor) {
                        editor.setFontSize(editor.getFontSize() + 1);
                        thiz.onPrefsChanged();
                    }
                }, {
                    name: "decreaseFontSize",
                    bindKey: "Ctrl+-",
                    exec: function (editor) {
                        editor.setFontSize(editor.getFontSize() - 1);
                        thiz.onPrefsChanged();
                    }
                }, {
                    name: "resetFontSize",
                    bindKey: "Ctrl+0",
                    exec: function (editor) {
                        editor.setFontSize(12);
                    }
                }
            ]);
            this.focus();
        },
        onDidChange: function () {

        },
        setOptions: function (opts) {

            var editor = this.getEditor(), thiz = this;

            this.editor.session.setUseWorker(true);

            editor.setOptions({

                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true
            });


            editor.getSelectedText = function () {
                return this.session.getTextRange(this.getSelectionRange());
            };
            editor.on('change', function () {
                thiz.onDidChange(arguments);
            });

            this.onEditorReady();

        },
        getEditor: function () {
            return this.editor;
        },
        split:null,
        buildRendering: function () {

            this.inherited("buildRendering", arguments);
            var node = domConstruct.create('div');
            domStyle.set(node, {
                padding: "0",
                margin: "0",
                "className": "editor-ace ace_editor ace-codebox-dark ace_dark"
            });
            var editor = this.getEditor();
            var config = ace.require("ace/config");
            try {
                var Split = getSplitProto();
                var split = new Split(node, null, 1);
                this.split = split;
                this._aceConfig = config;
                config.init();
                ace.require('ace/ext/language_tools');
                this.editor = /*ace.edit(node);*/ split.getEditor(0);
                this.editorSession = this.editor.getSession();
                this.domNode = node;
            }catch(e){
                debugger;
            }
        },
        set: function (key, value) {
            // TODO document, and wire up the rest of the ace api that makes sense
            var self = this;
            if (key == "value") {

                this.editorSession.setValue(value);


                var thiz = this;
                var _s = function () {
                    setTimeout(function () {
                        factory.publish(types.EVENTS.RESIZE, {}, thiz);
                    }, 100);
                };

            }
            else if (key == "theme") {
                if (typeof value == "string") {
                    value = "ace/theme/" + value;
                }
                this.editor.setTheme(value);
                if(this.split){
                    this.split.setTheme(value);
                }
            }
            else if (key == "mode") {
                try {
                    if (has('host-browser')) {
                        ace.require(["ace/mode/" + value], function (modeModule) {
                            if (modeModule && modeModule.Mode) {

                                self.split.$editors.forEach(function (editor) {
                                    editor.session.setMode(new modeModule.Mode());
                                });
                                /*
                                self.editorSession.setMode(new modeModule.Mode());
                                if(self.split){

                                    //self.split.setMode(value);
                                }
                                */
                            }
                        });
                    }

                } catch (e) {
                    console.error('ace mode failed : ' + value);
                }


            }
            else if (key == "readOnly") {
                this.editor.setReadOnly(value);
            }
            else if (key == "tabSize") {
                this.editorSession.setTabSize(value);
            }
            else if (key == "softTabs") {
                this.editorSession.setUseSoftTabs(value);
            }
            else if (key == "wordWrap") {
                // TODO this is buggy, file github issue
                this.editorSession.setUseWrapMode(value);
            }
            else if (key == "printMargin") {
                this.editor.renderer.setPrintMarginColumn(value);
            }
            else if (key == "showPrintMargin") {
                this.editor.setShowPrintMargin(value);
            }
            else if (key == "highlightActiveLine") {
                this.editor.setHighlightActiveLine(value);
            }
            else if (key == "fontSize") {
                domStyle.set(this.domNode, key, value);
            }
            else if (key == "showIntentGuides") {
                this.editor.setDisplayIndentGuides(value);
            }
            else if (key == "elasticTabstops") {
                this.editor.setOption("useElasticTabstops", value);
            }
            else if (key == "useIncrementalSearch") {
                this.editor.setOption("useIncrementalSearch", value);
            }
            else if (key == "showGutter") {
                this.editor.renderer.setShowGutter(value);
            }
            return this.inherited("set", arguments);
        },
        get: function (key) {
            try {
                if (key == "value") {
                    if (this.split) {
                        return this.split.$cEditor.session.getValue();
                    }
                    return this.editorSession.getValue();
                }
                else if (key == "readOnly") {
                    return this.editor.getReadOnly();
                }
                else if (key == "tabSize") {
                    //return this.editor.getTabSize();
                }
                else if (key == "softTabs") {
                    //return this.editor.getUseSoftTabs();
                }
                else if (key == "wordWrap") {
                    // TODO this is buggy, file github issue
                    //return this.editor.getUseWrapMode();
                }
                else if (key == "printMargin") {
                    //return this.editor.getPrintMarginColumn();
                }
                else if (key == "showPrintMargin") {
                    //return this.editor.getShowPrintMargin();
                }
                else if (key == "highlightActiveLine") {
                    ///return this.editor.getHighlightActiveLine();
                }
                else if (key == "showIntentGuides") {
                    //return this.editor.getDisplayIndentGuides();
                }
                else if (key == "elasticTabstops") {
                    //return this.editor.getOption("useElasticTabstops");
                }
                else if (key == "useIncrementalSearch") {
                    //return this.editor.getOption("useIncrementalSearch");
                }
                else if (key == "showGutter") {
                    //return this.editor.getShowGutter();
                }
                return this.inherited("get", arguments);
            }catch(e){
                console.error(e);
            }
        },
        startup: function () {

        },
        resize: function (size) {
            // summary:
            //      Resize the editor to the specified size, see `dijit.layout._LayoutWidget.resize`
            if (size) {
                // we've been given a height/width for the entire editor (toolbar + contents), calls layout()
                // to split the allocated size between the toolbar and the contents
                //_LayoutWidget.prototype.resize.apply(this, arguments);
            }
            var self = this;
            if(self.split){
                self.split.resize();
            }
            this._resizer = setTimeout(lang.hitch(self, function () {
                delete self._resizer;
                if(self.split){
                    self.split.resize();
                }
                self.editor.resize();
            }), 10);

        },
        layout: function () {
            // summary:
            //      Called from `dijit.layout._LayoutWidget.resize`.  This shouldn't be called directly
            // tags:
            //      protected
            this._layoutMode = true;
        },
        destroy: function () {
            if (this._resizer) {
                clearTimeout(this._resizer);
                delete this._resizer;
            }
            return this.inherited("destroy", arguments);
        }
    });
});
