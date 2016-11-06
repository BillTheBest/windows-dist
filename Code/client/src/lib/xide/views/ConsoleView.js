/** @module xgrid/Base **/
define([
    "dcl/dcl",
    'xide/utils',
    'xide/types',
    "xide/_base/_Widget",
    'xide/views/History',
    'xace/views/Editor',
    'xide/mixins/PersistenceMixin',
    'xide/views/_LayoutMixin'
], function (dcl, utils, types,_XWidget, History, Editor,PersistenceMixin,
             _LayoutMixin) {

    function createHandlerClass() {

        var Handler =  dcl(null, {
            owner: null,
            declaredClass:"xide/views/Console_Handler",
            onServerResponse: function (theConsole, data, addTimes) {
                /*
                 if (theConsole && data && theConsole.owner && theConsole.owner.onServerResponse) {
                 return theConsole.owner.onServerResponse(data, addTimes);
                 }
                 */
            },
            runBash: function (theConsole, value, cwd,commandNode) {
                var thiz = this,
                    ctx = thiz.ctx;

                var server = ctx.fileManager;
                var _value = server.serviceObject.base64_encode(value);

                var dfd = server.runDeferred('XShell', 'run', ['sh', _value, cwd]);

                dfd.then(function (response) {
                    if(commandNode){
                        $(commandNode).find('.consoleRunningCommand').remove();
                    }
                    //debugger;
                    //thiz.onServerResponse(theConsole,response, false);
                });
                return dfd;
            },
            runPHP: function (theConsole, value, cwd) {
                var thiz = this;
                var server = this.ctx.fileManager;
                var _value = server.serviceObject.base64_encode(value);
                server.runDeferred('XShell', 'run', ['php', _value, cwd]).then(function (response) {
                    thiz.onServerResponse(theConsole, response, false);
                });
            },
            getContext:function(){
                return utils.mixin(this,this.ctx);
            },
            print:function(what){
                var template = '<div style="margin-bottom:0px" class="widget border-top-dark">${result}</div>';
                this.printCommand('',what,template,false);
            },
            runJavascript: function (theConsole, value, context, args) {

                var _function = new Function("{" + value + "; }");
                var response = _function.call(context || this.getContext(), args);
                if (response != null) {
                    return response;
                }
                return value;
            },
            toHTML:function(msg){

            },
            onConsoleCommand: function (value,theConsole) {

                var thiz = this,
                    type = this.type;
                if (type === 'sh') {
                    var template  = '<div style="margin-bottom: 6px" class="widget border-top-dark">' +
                        '<span class="consoleRunningCommand fa-spinner fa-spin"/># ${command}<br/></div><br/>';

                    var node = this.printCommand(value,'',template,false);
                    var dstPath = null;
                    if (this.owner && this.owner.getCurrentFolder) {
                        var cwd = this.owner.getCurrentFolder();
                        if (cwd) {
                            dstPath = utils.buildPath(cwd.mount, cwd.path, false);
                        }
                    }
                    var dfd = this.runBash(theConsole, value, dstPath,node);

                    dfd.then(function(msg){

                        var isHTML = false;
                        var out = '';

                        if(msg.indexOf('<body')!=-1 || /<[a-z][\s\S]*>/i.test(msg)) {
                            isHTML = true;
                            out = msg;
                        }else{
                            out += msg.replace(/\n/g, '<br/>');
                        }

                        if(isHTML) {
                            var responseNode = $('<div class="html_response">' + out + '</div>');
                            node.append(responseNode);
                            var last = $('<div class="border-bottom-dark" >&nbsp;</div>');
                            node.parent().append(last);
                            last[0].scrollIntoViewIfNeeded();
                        }
                    });

                    return dfd;
                }

                if (type === 'php') {
                    var dstPath = null
                    if (theConsole && theConsole.isLinked()) {
                        dstPath = this.getCurrentPath();
                    }
                    return this.runPHP(theConsole, value, dstPath);
                }
                if (type === 'javascript') {
                    return this.runJavascript(theConsole, value);
                }

            },
            onConsoleEnter: function (value,theConsole) {
                return this.onConsoleCommand(value,theConsole);
            }
        });

        dcl.chainAfter(Handler,'onConsoleEnter');

        return Handler;
    }
    function createConsoleWidgetClass(){
        return dcl([_XWidget, PersistenceMixin.dcl], {
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
            isExpanded: true,
            theme: 'View/Themes/idle_fingers',
            consoleEditor: null,
            jsContext: null,
            resizeToParent:true,
            EditorClass:null,
            templateString: '<div class="" style="height: 100%;width: 100%">' +
            '<div attachTo="consoleParent" class="" style="width:inherit;height:inherit;padding: 0;margin:0;"></div></div>',
            isLinked: function () {
                if (this.linkToggle) {
                    return this.linkToggle.get('checked');
                }
                return false;
            },
            getEditor: function () {
                return this.consoleEditor;
            },
            getTextEditor:function(){
                return this.aceEditorEditor;
            },
            resize: function () {
                if (this.isExpanded) {
                    var total = $(this.domNode.parentNode).height();
                    $(this.consoleParent).css({
                        height: total +'px'
                    });
                }
                this.aceEditor && this.aceEditor.resize();
            },
            onClear:function(){
                this.delegate.$logView.html('');
            },
            maximize:function(editor){
                if(this.delegate && this.delegate.maximize){
                    return this.delegate.maximize();
                }
                return false;
            },
            expandEditor: function () {
                var thiz = this,
                    editor = thiz.getEditor(),
                    aceEditor = this.aceEditor;


                utils.resizeTo(editor, thiz.consoleParent, true, true);


                return;


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
                        height: $(this.domNode.parentNode).height() + 'px'
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
                var editorArgs = this.delegate.editorArgs || {};
                var editor = createEditor.apply(this,[this.consoleParent, this.value, this,utils.mixin({
                    options: this.options,
                    ctx:this.ctx,
                    resizeToParent:true
                },editorArgs),this.delegate.EditorClass]);
                this.add(editor);
                this.delegate.onCreatedEditor && this.delegate.onCreatedEditor(editor);
                editor._on('change',function(e){
                    _thiz._emit('change',e);
                });
                return editor;
            },
            onAddEditorActions:function(evt){
                var actions = evt.actions;
                evt.owner = this.aceEditor;
                this.delegate.onAddEditorActions(evt);
            },
            createWidgets: function () {
                if(this.aceEditor){
                    return;
                }
                var self = this;
                var aceEditor = this.createEditor(this.ctx);
                this.aceEditor = aceEditor;
                aceEditor._on('onAddActions',this.onAddEditorActions,self);
                aceEditor.startup();
                this.add(aceEditor, null, false);
                var editor = aceEditor.getEditor();
                if(this.delegate && this.delegate.maximize){
                    aceEditor.maximize = function() {
                        return this.delegate.maximize();
                    }
                }
                this.aceEditorEditor = aceEditor;
                this.consoleEditor = editor;
                //editor.renderer.$maxLines = 1;
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
                var session = aceEditor.editorSession;
                editor.commands.bindKeys({
                    "Ctrl-Return": function (cmdLine) {
                        if (self.isExpanded) {
                            editor.focus();

                            var selectedText = editor.getSelectedText();
                            var value = selectedText || editor.getValue();
                            self.onEnter(value);

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
                this.createWidgets();
            },
            onEnter: function (val) {
                this.delegate.onConsoleEnter(val, this.isExpanded == false,this);
                this.history.push(val);
            }
        });
    }
    function createConsoleClass(){
        var _Console = dcl([_XWidget,_LayoutMixin.dcl,createHandlerClass()],{
            declaredClass:'xide.views.ConsoleView',
            templateString:'<div class="logView" style="height: 100%;overflow: auto" attachTo="logView" />',
            printTemplate:'<div style="margin-bottom: 6px" class="widget border-top-dark"># ${time} - ${command}<br/>\t ${result}</div><br/>',
            defaultPanelOptions:{
                w: '100%',
                title:false
            },
            defaultPanelType:'DefaultFixed',
            resizeToParent:true,
            onAddEditorActions:function(evt){

                //console.error('onAddEditorActions',evt);

                var actions = evt.actions,
                    owner  = evt.owner;

                var save = _.find(actions,{
                    command:'File/Save'
                });

                actions.remove(_.find(actions,{
                    command:'File/Save'
                }));

                actions.remove(_.find(actions,{
                    command:"File/Reload"
                }));


                var mixin = {
                    addPermission:true
                }



                actions.push(owner.createAction({
                    label: 'Send',
                    command: 'Console/Send',
                    icon: 'fa-paper-plane',
                    group: 'Console',
                    tab:'Home',
                    mixin:mixin
                }));

                actions.push(owner.createAction({
                    label: 'Clear Ouput',
                    command: 'Console/Clear',
                    icon: 'fa-remove',
                    group: 'Console',
                    tab:'Home',
                    mixin:mixin
                }));


                actions.push(owner.createAction({
                    label: 'Fullscreen',
                    command: types.ACTION.FULLSCREEN,
                    icon: types.ACTION_ICON.MAXIMIZE,
                    keycombo: 'ctrl f11',
                    group: 'View',
                    mixin:mixin
                }));

            },
            getConsoleClass:function(){ return createConsoleWidgetClass(); },
            createConsole:function(where){
                var _console = utils.addWidget(this.getConsoleClass(), {
                    style: 'width:inherit',
                    delegate: this,
                    type: this.type,
                    value: this.value,
                    ctx:this.ctx
                }, this, where, false);
                this.add(_console);
                return _console;
            },
            createWidgets:function(bottom,top){
                var _console = this.createConsole(bottom);
                _console.startup();
                this.console = _console;
            },
            getConsole:function(){
                return this.console;
            },

            getConsoleEditor:function(){
                return this.getConsole().getTextEditor();
            },

            startup:function(){
                this.createWidgets(this.getBottomPanel('Console'),this.getTop());
            },

            maxEntries:100,
            printCommand:function(command,result,template,addTime){
                var where = this.logView;

                if(!result || !result.length){
                    //return null;
                }

                var overlap = where.children.length - this.maxEntries;
                var $where = $(where);
                var self = this;
                function remove() {

                    if (overlap > 30) {
                        while (overlap > 0) {
                            where.children && where.children[0] && where.removeChild(where.children[0]);
                            overlap--;
                        }

                        overlap = where.children.length - self.maxEntries;
                        //console.log('remove overlap ' + overlap);
                        //console.log('       now' + where.children.length);
                    }
                }

                //overlap > 30 && window.requestAnimationFrame(remove);

                overlap && remove();
                

                var time = addTime!==false ? moment().format("HH:mm:ss:SSS") : "";

                var content = utils.substituteString(template || this.printTemplate,{
                    command:command,
                    result:result,
                    time:time
                });
                var node = $(content);
                where.appendChild(node[0]);
                node[0].scrollIntoViewIfNeeded();

                return node;
            },
            onConsoleEnter: dcl.superCall(function(sup){
                return function(command){
                    //grab the result from the handler
                    var res = sup.call(this, command);
                    //console.error('console - view : onConsoleEnter: ' + command,res);
                    var _console = this.getConsole(),
                        editor = this.getConsoleEditor();

                    if(res && res.then){

                    }else{
                        this.printCommand(command,res);
                    }


                };
            })
        });

        return _Console;
    }

    /***
     * Default editor persistence for peferences in cookies!
     **/
    Editor = dcl([Editor, PersistenceMixin.dcl], {
        declaredClass:'xace.views.Editor',
        defaultPrefenceTheme: 'idle_fingers',
        defaultPrefenceFontSize: 14,
        getDefaultPreferences: function () {
            return {theme: this.defaultPrefenceTheme, fontSize: this.defaultPrefenceFontSize};
        },
        runAction:function(action){
            if(action.command==='Console/Clear'){
                return this.delegate.onClear();
            }
            if(this.delegate.delegate && this.delegate.delegate.runAction){

                var _result = this.delegate.delegate.runAction(action);

                //console.log('run action ' + action.command,_result);
                if(_result){
                    return _result;
                }

            }

            if(action.command==='Console/Send'){
                var value = this.get('value');
                return this.delegate.delegate.onConsoleEnter(value);
            }
            return this.inherited(arguments);
        },
        __onAfterAction: function (action) {
            //console.log('onAfterAction ' + this.get('theme') + ' this ' + this.getEditor().getFontSize());
            this.savePreferences({
                theme: this.get('theme').replace('ace/theme/', ''),
                fontSize: this.getEditor().getFontSize()
            });
            return this.inherited(arguments);
        },
        /**
         * Override id for pref store:
         * know factors:
         *
         * - IDE theme
         * - per bean description and context
         * - by container class string
         * - app / plugins | product / package or whatever this got into
         * -
         **/
        toPreferenceId: function (prefix) {
            prefix = prefix || ($('body').hasClass('xTheme-transparent') ? 'xTheme-transparent' : 'xTheme-white' );
            var res = (prefix || this.cookiePrefix || '') + '_xace';
            return res;
        },
        getDefaultOptions: function () {
            //take our defaults, then mix with prefs from store,
            var _super = this.inherited(arguments),
                _prefs = this.loadPreferences(null);
            (_prefs && utils.mixin(_super, _prefs) ||
                //else store defaults
            this.savePreferences(this.getDefaultPreferences()));
            return _super;
        }
    });

    function createEditor(root, value, owner, mixin,EditorMixinClass) {
        var item = {
            filePath: '',
            fileName: ''
        };
        var title = "No Title";
        value = value || '...';
        var args = {
            _permissions: [

            ],
            item: item,
            value: value,
            style: 'padding:0px;top:0 !important',
            iconClass: 'fa-code',
            options: utils.mixin(mixin, {
                filePath: item.path,
                fileName: item.name
            }),
            storeDelegate: {},
            title: title
        };
        utils.mixin(args, mixin);
        var _editorClass = Editor;
        if(EditorMixinClass){
            _editorClass = EditorMixinClass;
        }
        var editor = utils.addWidget(_editorClass, args, owner, root, false, null, null, false);
        editor.resize();
        return editor;
    }

    var Module  = createConsoleClass();
    Module.Editor = Editor;
    Module.HandlerClass = createHandlerClass();
    Module.ConsoleWidget = createConsoleWidgetClass();
    return Module;

});