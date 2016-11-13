(function () {

    var __isAMD = !!(typeof define === 'function' && define.amd),
        __isNode = (typeof exports === 'object'),
        __isWeb = !__isNode,
    //is that enough at some point?
        __isDojoRequire = !!(typeof require === 'function' && require.packs),
        __isRequireJS = !__isDojoRequire,
        __deliteHas = !!(typeof has === 'function' && has.addModule);

    define('xdojo/has',[
        //needed?
        'require',
        'exports',
        //should be extended for the missing .config() method when in delite
        'module',
        __isDojoRequire ? 'dojo/has' : 'requirejs-dplugins/has'
    ], function (require, exports, module, dHas) {

        if (dHas) {
            if (typeof exports !== "undefined") {
                exports.has = dHas;
            }
            if (__isNode) {
                return module.exports;
            } else if (__isWeb && __isAMD) {
                return dHas;
            }
        } else {
            //@TODO, add simple version?
            //we shouldn't be here
            debugger;
        }
    });
}).call(this);
define('xblox/component',[
    "dojo/_base/declare",
    "xdojo/has",
    "xide/model/Component"
], function (declare,has,Component) {
    /**
     * @class xblox.component
     * @inheritDoc
     */
    return declare([Component], {
        /**
         * @inheritDoc
         */
        beanType:'BLOCK',
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        //  Implement base interface
        //
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        _load:function(){
        },
        hasEditors:function(){
            return ['xblox'];
        },
        getDependencies:function(){

            if(has('xblox-ui')) {

                return [
                    'xide/xide',
                    'xblox/types/Types',
                    'xblox/manager/BlockManager',
                    'xblox/manager/BlockManagerUI',
                    'xblox/embedded_ui',
                    'xide/widgets/ExpressionJavaScript',
                    'xide/widgets/Expression',
                    'xide/widgets/RichTextWidget',
                    'xide/widgets/ExpressionEditor',
                    'xide/widgets/WidgetReference'
                    //'xide/widgets/DomStyleProperties',
                    //'xblox/views/BlocksFileEditor'
                    //'xide/widgets/BlockPickerWidget',
                    //'xide/widgets/BlockSettingsWidget'
                ];
            }else{
                return [
                    'xide/xide',
                    'xblox/types/Types',
                    'xblox/manager/BlockManager',
                    'xblox/embedded'
                ];
            }
        },
        /**
         * @inheritDoc
         */
        getLabel: function () {
            return 'xblox';
        },
        /**
         * @inheritDoc
         */
        getBeanType:function(){
            return this.beanType;
        }
    });
});


define('xblox/types/Types',[
    'xide/types/Types',
    'xide/utils'
], function (types, utils) {
    types.BLOCK_MODE = {
        NORMAL: 0,
        UPDATE_WIDGET_PROPERTY: 1
    };
    types.BLOCK_OUTLET = {
        NONE: 0x00000000,
        PROGRESS: 0x00000001,
        ERROR: 0x00000002,
        PAUSED: 0x00000004,
        FINISH: 0x00000008,
        STOPPED: 0x00000010
    };
    utils.mixin(types.EVENTS, {
        ON_RUN_BLOCK: 'onRunBlock',
        ON_RUN_BLOCK_FAILED: 'onRunBlockFailed',
        ON_RUN_BLOCK_SUCCESS: 'onRunBlockSuccess',
        ON_BLOCK_SELECTED: 'onItemSelected',
        ON_BLOCK_UNSELECTED: 'onBlockUnSelected',
        ON_BLOCK_EXPRESSION_FAILED: 'onExpressionFailed',
        ON_BUILD_BLOCK_INFO_LIST: 'onBuildBlockInfoList',
        ON_BUILD_BLOCK_INFO_LIST_END: 'onBuildBlockInfoListEnd',
        ON_BLOCK_PROPERTY_CHANGED: 'onBlockPropertyChanged',
        ON_SCOPE_CREATED: 'onScopeCreated',
        ON_VARIABLE_CHANGED: 'onVariableChanged',
        ON_CREATE_VARIABLE_CI: 'onCreateVariableCI'
    });
    types.BlockType = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
    };
    return types;
});
/** @module xblox/model/ModelBase
 *  @description The base for block related classes, this must be kept small and light as possible
 */
define('xblox/model/ModelBase',[
    'dcl/dcl',
    "xide/utils",
    "xide/types",
    "xide/mixins/EventedMixin"
], function(dcl,utils,types,EventedMixin){

    /**
     * The model mixin for a block
     * @class module:xblox.model.ModelBase
     */
    var Module = dcl(EventedMixin.dcl,{
        declaredClass:'xblox.model.ModelBase',
        id:null,
        description:'',
        parent:null,
        parentId:null,
        group:null,
        order:0,
        _store:null,
        ////////////////////////////////////////////////////////////
        //
        //  Functions to expose out & in - lets
        //
        ////////////////////////////////////////////////////////////
        /**
         *
         * Implmented by the subclass. Each block must provide an output signature.
         * The format is currently the same as Dojo SMD
         *
         * @returns {Array}
         */
        outputs:function(){
           return [];
        },
        /**
         *
         * Implmented by the subclass. Each block must provide an input signature.
         * The format is currently the same as Dojo SMD
         *
         * @returns {Array}
         */
        takes:function(){
            return [];
        },
        /**
         *
         * Implmented by the subclass. Each block must provide an needed input signature.
         * The format is currently the same as Dojo SMD. This is a filtered version of
         * 'takes'
         *
         * @returns {Array}
         */
        needs:function(){
            return [];
        },
        ////////////////////////////////////////////////////////////
        //
        //  Functions to expose outlets
        //
        ////////////////////////////////////////////////////////////
        /***
         * Standard constructor for all subclassing blocks
         * @param {array} arguments
         */
        constructor: function(args){


            //simple mixin of constructor arguments
            for (var prop in args) {
                if (args.hasOwnProperty(prop)) {
                    this[prop] = args[prop];
                }
            }

            if(!this.id){
                this.id = this.createUUID();
            }

            //short cuts
            this.utils=utils;
            this.types=types;


        },
        ////////////////////////////////////////////////////////////
        //
        //  Standard tools
        //
        ////////////////////////////////////////////////////////////
        keys: function (a) {
            var b = [];
            for (var c in a) {
                b.push(c);
            }
            return b;
        },
        values: function (b) {
            var a = [];
            for (var c in b) {
                a.push(b[c]);
            }
            return a;
        },
        toArray: function () {
            return this.map();
        },
        size: function () {
            return this.toArray().length;
        },
        createUUID:function(){
            // summary:
            //		Create a basic UUID
            // description:
            //		The UUID is created with Math.Random
            var S4 = function() {
                return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            };
            return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()); //String
        },
        canEdit:function(){
            return true;
        },
        getFields:function(){
            return null;
        },
        isString: function (a) {
            return typeof a == "string"
        },
        isNumber: function (a) {
            return typeof a == "number"
        },
        isBoolean: function (a) {
            return typeof a == "boolean"
        },
        isObject:function(a){
            return typeof a === 'object';
        },
        isArray:function(a){
            if (Array.isArray){
                return Array.isArray(a);
            }
            return false;
        },
        getValue:function(val){

            var _float = parseFloat(val);

            if(!isNaN(_float)){
               return _float;
            }
            if(val==='true' || val===true){
                return true;
            }
            if(val==='false' || val===false){
                return false;
            }
            return val;

        },
        isScript:function(val){
            return this.isString(val) &&(
                    val.indexOf('return')!=-1||
                    val.indexOf(';')!=-1||
                    val.indexOf('(')!=-1||
                    val.indexOf('+')!=-1||
                    val.indexOf('-')!=-1||
                    val.indexOf('<')!=-1||
                    val.indexOf('*')!=-1||
                    val.indexOf('/')!=-1||
                    val.indexOf('%')!=-1||
                    val.indexOf('=')!=-1||
                    val.indexOf('==')!=-1||
                    val.indexOf('>')!=-1||
                    val.indexOf('[')!=-1||
                    val.indexOf('{')!=-1||
                    val.indexOf('}')!=-1
                );
        },
        replaceAll:function(find, replace, str) {
            if(this.isString(str)){
                return str.split(find).join(replace);//faster!
            }
            return str;
        },
        isInValidState:function(){
            return true;
        },
        destroy:function(){}
    });

    dcl.chainAfter(Module,'destroy');
    return Module;
});
define('requirejs-dplugins/has',["module"], function (module) {
	var cache = (module.config && module.config()) || {};
	var tokensRE = /[\?:]|[^:\?]+/g;

	function resolve(resource, has, isBuild) {
		var tokens = resource.match(tokensRE);
		var i = 0;
		var get = function (skip) {
			var term = tokens[i++];
			if (term === ":") {
				// empty string module name; therefore, no dependency
				return "";
			} else {
				// postfixed with a ? means it is a feature to branch on, the term is the name of the feature
				if (tokens[i++] === "?") {
					var hasResult = has(term);
					if (hasResult === undefined && isBuild) {
						return undefined;
					} else if (!skip && hasResult) {
						// matched the feature, get the first value from the options
						return get();
					} else {
						// did not match, get the second value, passing over the first
						get(true);
						return get(skip);
					}
				}
				// A module or empty string.
				// This allows to tell apart "undefined flag at build time" and "no module required" cases.
				return term || "";
			}
		};
		return get();
	}

	function forEachModule(tokens, callback) {
		for (var i = 0; i < tokens.length; i++) {
			if (tokens[i] !== ":" && tokens[i] !== "?" && tokens[i + 1] !== "?") {
				callback(tokens[i], i);
			}
		}
	}

	var has = function (name) {
		var global = (function () {
			return this;
		})();

		return typeof cache[name] === "function" ? (cache[name] = cache[name](global)) : cache[name]; // Boolean
	};

	has.cache = cache;

	has.add = function (name, test, now, force) {
		if (!has("builder")) {
			(typeof cache[name] === "undefined" || force) && (cache[name] = test);
			return now && has(name);
		}
	};

	has.normalize = function (resource, normalize) {
		var tokens = resource.match(tokensRE);

		forEachModule(tokens, function (module, index) {
			tokens[index] = normalize(module);
		});

		return tokens.join("");
	};

	has.load = function (resource, req, onLoad, config) {
		config = config || {};

		if (!resource) {
			onLoad();
			return;
		}

		var mid = resolve(resource, has, config.isBuild);

		if (mid) {
			req([mid], onLoad);
		} else {
			onLoad();
		}
	};

	has.addModules = function (pluginName, resource, addModules) {
		var modulesToInclude = [];

		var mid = resolve(resource, has, true);
		if (mid) {
			modulesToInclude.push(mid);
		} else if (typeof mid === "undefined") {
			// has expression cannot be resolved at build time so include all the modules just in case.
			var tokens = resource.match(tokensRE);
			forEachModule(tokens, function (module) {
				modulesToInclude.push(module);
			});
		}

		addModules(modulesToInclude);
	};

	return has;
});


/** @module xblox/model/Block **/
define('xblox/model/Block',[
    'dcl/dcl',
    "dojo/Deferred",
    "dojo/_base/lang",
    "dojo/has",
    "xblox/model/ModelBase",
    "xide/factory",
    "xide/utils",
    "xide/types",
    "xide/utils/ObjectUtils",
    "xdojo/has!xblox-ui?xblox/model/Block_UI"
], function (dcl,Deferred, lang, has, ModelBase, factory, utils, types,ObjectUtils,Block_UI) {

    var bases = [ModelBase];

    function index(what,items) {
        for (var j = 0; j < items.length; j++) {
            if (what.id === items[j].id) {
                return j;
            }
        }
    }

    function compare(left, right) {
        return index(left) - index(right);
    }

    if(!has('host-browser')){
        bases.push(dcl(null,{
            getStatusIcon:function(){},
            getStatusClass:function(){},
            setStatusClass:function(){},
            onActivity:function(){},
            onRun:function(){},
            onFailed:function(){},
            onSuccess:function(){},
            getIconClass:function(){}
        }));
    }

    /***
     * First things first, extend the core types for block flags:
     */
    utils.mixin(types, {
        /**
         * Flags to describe flags of the inner state of a block which might change upon the optimization. It also
         * contains some other settings which might be static, default or changed by the UI(debugger, etc...)
         *
         * @enum module:xide/types/BLOCK_FLAGS
         * @memberOf module:xide/types
         */
        BLOCK_FLAGS: {

            NONE: 0x00000000,	// Reserved for future use
            ACTIVE: 0x00000001,	// This behavior is active
            SCRIPT: 0x00000002,	// This behavior is a script
            RESERVED1: 0x00000004,	// Reserved for internal use
            USEFUNCTION: 0x00000008,	// Block uses a function and not a graph
            RESERVED2: 0x00000010,	// Reserved for internal use
            SINGLE: 0x00000020,	// Only this block will excecuted, child blocks not.
            WAITSFORMESSAGE: 0x00000040,	// Block is waiting for a message to activate one of its outputs
            VARIABLEINPUTS: 0x00000080,	// Block may have its inputs changed by editing them
            VARIABLEOUTPUTS: 0x00000100,	// Block may have its outputs changed by editing them
            VARIABLEPARAMETERINPUTS: 0x00000200,	// Block may have its number of input parameters changed by editing them
            VARIABLEPARAMETEROUTPUTS: 0x00000400,	// Block may have its number of output parameters changed by editing them
            TOPMOST: 0x00004000,	// No other Block includes this one
            BUILDINGBLOCK: 0x00008000,	// This Block is a building block (eg: not a transformer of parameter operation)
            MESSAGESENDER: 0x00010000,	// Block may send messages during its execution
            MESSAGERECEIVER: 0x00020000,	// Block may check messages during its execution
            TARGETABLE: 0x00040000,	// Block may be owned by a different object that the one to which its execution will apply
            CUSTOMEDITDIALOG: 0x00080000,	// This Block have a custom Dialog Box for parameters edition .
            RESERVED0: 0x00100000,	// Reserved for internal use.
            EXECUTEDLASTFRAME: 0x00200000,	// This behavior has been executed during last process. (Available only in profile mode )
            DEACTIVATENEXTFRAME: 0x00400000,	// Block will be deactivated next frame
            RESETNEXTFRAME: 0x00800000,	// Block will be reseted next frame

            INTERNALLYCREATEDINPUTS: 0x01000000,	// Block execution may create/delete inputs
            INTERNALLYCREATEDOUTPUTS: 0x02000000,	// Block execution may create/delete outputs
            INTERNALLYCREATEDINPUTPARAMS: 0x04000000,	// Block execution may create/delete input parameters or change their type
            INTERNALLYCREATEDOUTPUTPARAMS: 0x08000000,	// Block execution may create/delete output parameters or change their type
            INTERNALLYCREATEDLOCALPARAMS: 0x40000000,	// Block execution may create/delete local parameters or change their type

            ACTIVATENEXTFRAME: 0x10000000,	// Block will be activated next frame
            LOCKED: 0x20000000,	// Block is locked for utilisation in xblox
            LAUNCHEDONCE: 0x80000000	// Block has not yet been launched...
        },

        /**
         *  Mask for the messages the callback function of a block should be aware of. This goes directly in
         *  the EventedMixin as part of the 'emits' chain (@TODO)
         *
         * @enum module:xide/types/BLOCK_CALLBACKMASK
         * @memberOf module:xide/types
         */
        BLOCK_CALLBACKMASK: {
            PRESAVE: 0x00000001,	// Emits PRESAVE messages
            DELETE: 0x00000002,	// Emits DELETE messages
            ATTACH: 0x00000004,	// Emits ATTACH messages
            DETACH: 0x00000008,	// Emits DETACH messages
            PAUSE: 0x00000010,	// Emits PAUSE messages
            RESUME: 0x00000020,	// Emits RESUME messages
            CREATE: 0x00000040,	// Emits CREATE messages
            RESET: 0x00001000,	// Emits RESET messages
            POSTSAVE: 0x00000100,	// Emits POSTSAVE messages
            LOAD: 0x00000200,	// Emits LOAD messages
            EDITED: 0x00000400,	// Emits EDITED messages
            SETTINGSEDITED: 0x00000800,	// Emits SETTINGSEDITED messages
            READSTATE: 0x00001000,	// Emits READSTATE messages
            NEWSCENE: 0x00002000,	// Emits NEWSCENE messages
            ACTIVATESCRIPT: 0x00004000,	// Emits ACTIVATESCRIPT messages
            DEACTIVATESCRIPT: 0x00008000,	// Emits DEACTIVATESCRIPT messages
            RESETINBREAKPOINT: 0x00010000,	// Emits RESETINBREAKPOINT messages
            RENAME: 0x00020000,	// Emits RENAME messages
            BASE: 0x0000000E,	// Base flags :attach /detach /delete
            SAVELOAD: 0x00000301,	// Base flags for load and save
            PPR: 0x00000130,	// Base flags for play/pause/reset
            EDITIONS: 0x00000C00,	// Base flags for editions of settings or parameters
            ALL: 0xFFFFFFFF	// All flags
        }

    });
    /**
     * Base block class.
     *
     * @class module:xblox/model/Block
     * @extends module:xblox/model/ModelBase
     * @extends module:xblox/model/Block_UI
     */
    var Block = dcl(bases, {
        declaredClass:"xblox.model.Block",
        scopeId: null,
        isCommand:false,
        outlet:0,
        _destroyed:false,
        /**
         * Switch to include the block for execution.
         * @todo, move to block flags
         * @type {boolean}
         * @default true
         */
        enabled: true,
        /**
         * Switch to include the block for serialization.
         * @todo, move to block flags
         * @type {boolean}
         * @default true
         */
        serializeMe: true,
        /**
         * Name is used for the interface, mostly as prefix within
         * this.toText() which includes also the 'icon' (as icon font).
         * This should be unique and expressive.
         *
         * This field can be changed by the user. Examples
         * 'Run Script' will result in result 'Run Script + this.script'
         *
         * @todo: move that in user space, combine that with a template system, so any block ui parts gets off from here!
         * @type {string}
         * @default null
         * @required false
         */
        name: null,
        /**
         * @todo: same as name, move that in user space, combine that with a template system, so any block ui parts gets off from here!
         * @type {string}
         * @default 'No Description'
         * @required true
         */
        shareTitle: '',
        /**
         * The blocks internal user description
         * Description is used for the interface. This should be short and expressive and supports plain and html text.
         *
         * @todo: same as name, move that in user space, combine that with a template system, so any block ui parts gets off from here!
         * @type {boolean}
         * @default 'No Description'
         * @required true
         */
        sharable: false,
        /**
         * Container holding a 'child' blocks. Subclassing block might hold that somewhere else.
         * @type {Block[]}
         * @default null
         * @required false
         */
        items: null,
        /**
         * Parent up-link
         * @type {string|Block}
         * @default null
         * @required false
         */
        parent: null,
        /**
         * @var temporary variable to hold remainin blocks to run
         */
        _return: null,
        /**
         * @var temporary variable to store the last result
         */
        _lastResult: null,

        _deferredObject: null,

        _currentIndex: 0,

        _lastRunSettings: null,

        _onLoaded: false,

        beanType: 'BLOCK',

        override: {},
        /**
         * ignore these due to serialization
         */
        ignoreSerialize: [
            '_didSubscribe',
            '_currentIndex',
            '_deferredObject',
            '_destroyed',
            '_return',
            'parent',
            '__started',
            'ignoreSerialize',
            '_lastRunSettings',
            '_onLoaded',
            'beanType',
            'sharable',
            'override',
            'virtual',
            '_scenario',
            '_didRegisterSubscribers',
            'additionalProperties',
            'renderBlockIcon',
            'serializeMe',
            '_statusIcon',
            '_statusClass',
            'hasInlineEdits',
            '_loop',
            'help',
            'owner',
            '_lastCommand',
            'allowActionOverride',
            'canDelete',
            'isCommand',
            'lastCommand',
            'autoCreateElse',
            '_postCreated',
            '_counter'
        ],
        _parseString: function (string,settings,block,flags) {
            try {
                settings = settings || this._lastSettings || {};
                block = block || this;
                flags = flags || settings.flags || types.CIFLAG.EXPRESSION;
                var scope = this.scope;
                var value = string;
                var parse = !(flags & types.CIFLAG.DONT_PARSE);
                var isExpression = (flags & types.CIFLAG.EXPRESSION);
                var wait = (flags & types.CIFLAG.WAIT) ? true : false;

                if (flags & types.CIFLAG.TO_HEX) {
                    value = utils.to_hex(value);
                }

                if (parse !== false) {
                    value = utils.convertAllEscapes(value, "none");
                }

                var override = settings.override || this.override || {};
                var _overrides = (override && override.variables) ? override.variables : null;
                var res = "";
                if (isExpression && parse !== false) {

                    res = scope.parseExpression(value, null, _overrides, null, null, null, override.args,flags);
                } else {
                    res = '' + value;
                }
            }catch(e){
                console.error(e);
            }
            return res;
        },
        postCreate:function(){},
        /**
         * 
         * @param clz
         * @returns {Array}
         */
        childrenByClass:function(clz){            
            var all = this.getChildren();
            var out = [];
            for (var i = 0; i < all.length; i++) {
                var obj = all[i];
                if(obj.isInstanceOf(clz)){
                    out.push(obj);
                }
            }            
            return out;
        },
        /**
         *
         * @param clz
         * @returns {Array}
         */
        childrenByNotClass:function(clz){
            var all = this.getChildren();
            var out = [];
            for (var i = 0; i < all.length; i++) {
                var obj = all[i];
                if(!obj.isInstanceOf(clz)){
                    out.push(obj);
                }
            }
            return out;
        },
        /**
         *
         * @returns {null}
         */
        getInstance:function(){
            var instance = this.scope.instance;
            if(instance) {
                return instance;
            }
            return null;
        },
        pause:function(){
        },
        mergeNewModule: function (source) {
            for (var i in source) {
                var o = source[i];
                if (o && _.isFunction(o) /*&& lang.isFunction(target[i])*/) {
                    this[i] = o;//swap
                }
            }
        },
        __onReloaded:function(newModule){
            this.mergeNewModule(newModule.prototype);
            var _class = this.declaredClass;
            var _module = lang.getObject(utils.replaceAll('/', '.', _class)) || lang.getObject(_class);
            if(_module){
                if(_module.prototype && _module.prototype.solve){
                    this.mergeNewModule(_module.prototype);
                }
            }
        },
        reparent:function(){
            var item = this;
            if (!item) {
                return false;
            }
            var parent = item.getParent();
            if(parent){
            }else{
                var _next = item.next(null,1) || item.next(null,-1);
                if(_next){
                    item.group=null;
                    _next._add(item);
                }
            }
        },
        unparent:function(blockgroup,move){
            var item = this;
            if (!item) {
                return false;
            }
            var parent = item.getParent();
            if (parent && parent.removeBlock) {
                parent.removeBlock(item,false);
            }

            item.group = blockgroup;
            item.parentId = null;
            item.parent = null;
            if(move!==false) {
                item._place(null, -1, null);
                item._place(null, -1, null);
            }
        },
        move: function (dir) {
            var item = this;
            if (!item) {
                return false;
            }
            var parent = item.getParent();
            var items = null;
            var store = item._store;
            if (parent) {
                items = parent[parent._getContainer(item)];
                if (!items || items.length < 2 || !this.containsItem(items, item)) {
                    return false;
                }
                var cIndex = this.indexOf(items, item);
                if (cIndex + (dir) < 0) {
                    return false;
                }
                var upperItem = items[cIndex + (dir)];
                if (!upperItem) {
                    return false;
                }
                items[cIndex + (dir)] = item;
                items[cIndex] = upperItem;
                return true;
            } else {
                if (store && item.group) {
                    items = store.storage.fullData;
                }
                item._place(null, dir);
                return true;
            }
        },
        _place: function (ref, direction, items) {
            var store = this._store,
                dst = this;

            ref = ref || dst.next(null, direction);
            if (!ref) {
                console.error('have no next', this);
                return;
            }
            ref = _.isString(ref) ? store.getSync(ref) : ref;
            dst = _.isString(dst) ? store.getSync(dst) : dst;
            items = items || store.storage.fullData;
            direction = direction == -1 ? 0 : 1;
            items.remove(dst);

            if (direction == -1) {
                direction = 0;
            }

            items.splice(Math.max(index(ref,items) + direction, 0), 0, dst);
            store._reindex();
        },
        index:function(){
            var item = this,
                parent = item.getParent(),
                items = null,
                group = item.group,
                store = this._store;

            if (parent) {

                items = parent[parent._getContainer(item)] || [];

                items = items.filter(function(item){
                    return item.group ===group;
                });

                if (!items || items.length < 2 || !this.containsItem(items, item)) {
                    return false;
                }
                return this.indexOf(items, item);

            }else{
                items = store.storage.fullData;
                items = items.filter(function(item){
                    return item.group ===group;
                });
                return this.indexOf(items, item);
            }
        },
        numberOfParents:function(){
            var result = 0;
            var parent = this.getParent();
            if(parent){
                result++;
                result+=parent.numberOfParents();
            }
            return result;
        },
        getTopRoot:function(){
            var last = this.getParent();
            if(last){
                var next = last.getParent();
                if(next){
                    last = next;
                }
            }
            return last;
        },
        next: function (items, dir) {
            var _dstIndex = 0;
            var step = 1;
            items = items || this._store.storage.fullData;
            function _next(item, items, dir) {
                var cIndex = item.indexOf(items, item);
                var _nIndex = cIndex + (dir * step);

                var upperItem = items[cIndex + (dir * step)];

                if (upperItem) {
                    if (!upperItem.parentId && upperItem.group && upperItem.group === item.group) {
                        _dstIndex = cIndex + (dir * step);
                        return upperItem;
                    } else {
                        step++;
                        return _next(item, items, dir);
                    }
                }
                return null;
            };
            return _next(this, items, dir);
        },
        getParent: function () {
            if (this.parentId) {
                return this.scope.getBlockById(this.parentId);
            }
            return null;
        },
        getScope: function () {
            var scope = this.scope;
            if (this.scopeId && this.scopeId.length > 0) {
                var owner = scope.owner;
                if (owner && owner.hasScope) {
                    if (owner.hasScope(this.scopeId)) {
                        scope = owner.getScope(this.scopeId);
                    } else {
                        console.error('have scope id but cant resolve it', this);
                    }
                }
            }
            return scope;
        },
        //  standard call from interface
        canAdd: function () {
            return null;
        },
        getTarget: function () {
            var _res = this._targetReference;
            if (_res) {
                return _res;
            }
            var _parent = this.getParent();
            if (_parent && _parent.getTarget) {
                _res = _parent.getTarget();
            }
            return _res;
        },

        // adds array2 at the end of array1 => useful for returned "solve" commands
        addToEnd: function (array1, array2) {
            if (array2 && array1.length != null && array2.length != null) {
                array1.push.apply(array1, array2);
            } else {
                //console.error('add to end failed : invalid args in' + this.name);
            }
            return array1;
        },
        /**
         *
         * @param what
         * @param del delete block
         */
        removeBlock: function (what, del) {
            if (what) {
                if (del !== false && what.empty) {
                    what.empty();
                }

                if (del !== false) {
                    delete what.items;
                }
                what.parent = null;

                if (this.items) {
                    this.items.remove(what);
                }
            }
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Accessors
        //
        /////////////////////////////////////////////////////////////////////////////////////
        _getContainer: function (item) {
            return 'items';
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Utils
        //
        /////////////////////////////////////////////////////////////////////////////////////
        empty: function (what) {
            try {
                this._empty(what)
            } catch (e) {

                debugger;
            }
        },
        /*
         * Empty : removes all child blocks, recursivly
         * @param proto : prototype|instance
         * @param ctrArgs
         * @returns {*}
         */
        _empty: function (what) {

            var data = what || this.items;
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    var subBlock = data[i];

                    if (subBlock && subBlock.empty) {
                        subBlock.empty();
                    }
                    if (subBlock && this.scope && this.scope.blockStore) {
                        this.scope.blockStore.remove(subBlock.id);
                    }
                }
            }
        },
        /**
         * This was needed. FF bug.
         * @param data
         * @param obj
         * @returns {boolean}
         */
        containsItem: function (data, obj) {
            var i = data.length;
            while (i--) {
                if (data[i].id === obj.id) {
                    return true;
                }
            }
            return false;
        },
        /**
         * This was needed. FF bug
         * @param data
         * @param obj
         * @returns {*}
         */
        indexOf: function (data, obj) {
            var i = data.length;
            while (i--) {
                if (data[i].id === obj.id) {
                    return i;
                }
            }
            return -1;
        },
        _getBlock: function (dir) {
            try {
                var item = this;
                if (!item || !item.parentId) {
                    return false;
                }
                //get parent
                var parent = this.scope.getBlockById(item.parentId);
                if (!parent) {
                    return null;
                }
                var items = parent[parent._getContainer(item)];
                if (!items || items.length < 2 || !this.containsItem(items, item)) {
                    return null;
                }
                var cIndex = this.indexOf(items, item);
                if (cIndex + (dir) < 0) {
                    return false;
                }
                var upperItem = items[cIndex + (dir)];
                if (upperItem) {
                    return upperItem;
                }
            } catch (e) {
                debugger;
            }
            return null;
        },
        getPreviousBlock: function () {
            return this._getBlock(-1);
        },
        getNextBlock: function () {
            return this._getBlock(1);
        },
        _getPreviousResult: function () {

            var parent = this.getPreviousBlock() || this.getParent();
            if (parent && parent._lastResult != null) {

                if (this.isArray(parent._lastResult)) {
                    return parent._lastResult;
                } else {
                    return [parent._lastResult];
                }
            }
            return null;
        },
        getPreviousResult: function () {
            var parent = null;
            var prev = this.getPreviousBlock();
            if(!prev || !prev._lastResult || !prev.enabled){
                parent = this.getParent();
            }else{
                parent = prev;
            }

            if (parent && !parent._lastResult) {
                var _newParent = parent.getParent();
                if(_newParent){
                    parent = _newParent;
                }
            }

            if (parent && parent._lastResult != null) {
                if (this.isArray(parent._lastResult)) {
                    return parent._lastResult;
                } else {
                    return parent._lastResult;
                }
            }
            return null;
        },
        _getArg: function (val,escape) {
            //try auto convert to number
            var _float = parseFloat(val);
            if (!isNaN(_float)) {
                return _float;
            } else {

                if (val === 'true' || val === 'false') {
                    return val==='true' ? true : false;
                }else if(val && escape && _.isString(val)){
                    return '\'' + val + '\'';
                }
                return val;
            }
        },
        /**
         *
         * @returns {Array}
         */
        getArgs: function (settings) {

            var result = [];

            settings = settings || {};

            var _inArgs = settings.args || this._get('args');

            if(settings.override && settings.override.args){
                _inArgs = settings.override.args;
            }

            if (_inArgs) {//direct json
                result = utils.getJson(_inArgs,null,false);
                //if (result != null && _.isArray(result)) {
                    //return result;
                //}
            }


            //try comma separated list
            if (result && result.length == 0 && _inArgs && _inArgs.length && _.isString(_inArgs)) {

                if (_inArgs.indexOf(',') !== -1) {
                    var _splitted = _inArgs.split(',');
                    for (var i = 0; i < _splitted.length; i++) {

                        //try auto convert to number
                        var _float = parseFloat(_splitted[i]);
                        if (!isNaN(_float)) {
                            result.push(_float);
                        } else {

                            if (_splitted[i] === 'true' || _splitted[i] === 'false') {
                                result.push(utils.toBoolean(_splitted[i]));
                            } else {
                                result.push(_splitted[i]);//whatever
                            }
                        }
                    }
                    return result;
                } else {
                    result = [this._getArg(_inArgs)];//single argument
                }
            }

            !_.isArray(result) && (result=[]);

            //add previous result
            var previousResult = this.getPreviousResult();
            if (previousResult != null) {
                if (_.isArray(previousResult) && previousResult.length == 1) {
                    result.push(previousResult[0]);
                } else {
                    result.push(previousResult);
                }
            }

            return result || [_inArgs];
        },
        /*
         * Remove : as expected, removes a block
         * @param proto : prototype|instance
         * @param ctrArgs
         * @returns {*}
         */
        remove: function (what) {
            this._destroyed = true;
            if (this.parentId != null && this.parent == null) {
                this.parent = this.scope.getBlockById(this.parentId);
            }
            if (this.parent && this.parent.removeBlock) {
                this.parent.removeBlock(this);
                return;
            }
            what = what || this;
            if (what) {
                if (what.empty) {
                    what.empty();
                }
                delete what.items;
                what.parent = null;
                if (this.items) {
                    this.items.remove(what);
                }
            }

        },
        prepareBlockContructorArgs: function (ctorArgs) {
            if (!ctorArgs) {
                ctorArgs = {};
            }
            //prepare items
            if (!ctorArgs['id']) {
                ctorArgs['id'] = this.createUUID();
            }
            if (!ctorArgs['items']) {
                ctorArgs['items'] = [];
            }
        },
        /**
         * Private add-block function
         * @param proto
         * @param ctrArgs
         * @param where
         * @param publish
         * @returns {*}
         * @private
         */
        _add: function (proto, ctrArgs, where,publish) {

            var _block = null;
            try {
                //create or set
                if (ctrArgs) {

                    //use case : normal object construction
                    this.prepareBlockContructorArgs(ctrArgs);
                    _block = factory.createBlock(proto, ctrArgs,null,publish);
                } else {
                    //use case : object has been created so we only do the leg work
                    if (ctrArgs == null) {
                        _block = proto;
                    }
                    //@TODO : allow use case to use ctrArgs as mixin for overriding
                }
                ///////////////////////
                //  post work

                //inherit scope
                _block.scope = this.scope;

                //add to scope
                if (this.scope) {
                    _block = this.scope.registerBlock(_block,publish);
                }
                if (_block.id === this.id) {
                    var sameInstance = _block == this;
                    console.error('adding new block to our self');
                    debugger;
                }

                //pass parent
                _block.parent = this;
                //pass parent id
                _block.parentId = this.id;

                var container = where || this._getContainer();
                if (container) {
                    if (!this[container]) {
                        this[container] = [];
                    }
                    var index = this.indexOf(this[container], _block);
                    if (index != -1) {
                        console.error(' have already ' + _block.id + ' in ' + container);
                    } else {
                        if (this.id == _block.id) {
                            console.error('tried to add our self to ' + container);
                            return;
                        }
                        this[container].push(_block);
                    }
                }
                return _block;
            } catch (e) {
                logError(e,'_add');
            }
            return null;

        },
        getStore:function(){
            return this.getScope().getStore();
        },
        /**
         * Public add block function
         * @param proto
         * @param ctrArgs
         * @param where
         * @returns {*}
         */
        add: function (proto, ctrArgs, where) {
            var block = this._add(proto, ctrArgs, where);
            return block.getStore().getSync(block.id);
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Run 
        //
        /////////////////////////////////////////////////////////////////////////////////////
        getContext: function () {
            if (this.scope.instance && this.scope.instance) {
                return this.scope.instance;
            }
            return null;
        },
        resolved: function () {
            if (this._deferredObject) {
                this._deferredObject.resolve();
                delete this._deferredObject;
            }
        },
        /***
         * Solves all the commands into items[]
         *
         * @param manager   =>  BlockManager
         * @return  list of commands to send
         */
        _solve: function (scope, settings) {
            settings = settings || { highlight: false};
            var ret = [];
            for (var n = 0; n < this.items.length; n++) {
                var block = this.items[n];
                this.addToEnd(ret, block.solve(scope, settings));
            }
            return ret;
        },
        /***
         * Solves all the commands into items[]
         *
         * @param manager   =>  BlockManager
         * @return  list of commands to send
         */
        solve: function (scope, settings) {
            settings = settings || {highlight: false};
            var ret = [];
            for (var n = 0; n < this.items.length; n++) {
                var block = this.items[n];
                this.addToEnd(ret, block.solve(scope, settings));
            }
            return ret;
        },
        /***
         * Solves all the commands into items[]
         *
         * @param manager   =>  BlockManager
         * @return  list of commands to send
         */
        solveMany: function (scope, settings) {
            if (!this._lastRunSettings && settings) {
                this._lastRunSettings = settings;
            }
            settings = this._lastRunSettings || settings;

            this._currentIndex = 0;
            this._return = [];
            var ret = [], items = this[this._getContainer()];
            if (items.length) {
                var res = this.runFrom(items, 0, settings);
                this.onSuccess(this, settings);
                return res;
            } else {
                this.onSuccess(this, settings);
            }
            return ret;
        },
        runFrom: function (blocks, index, settings) {

            var thiz = this;

            blocks = blocks || this.items;
            var onFinishBlock = function (block, results) {
                block._lastResult = block._lastResult || results;
                
                thiz._currentIndex++;
                thiz.runFrom(blocks, thiz._currentIndex, settings);
            };
            var wireBlock = function (block) {
                block._deferredObject.then(function (results) {
                    onFinishBlock(block, results);
                });
            };

            if (blocks.length) {
                for (var n = index; n < blocks.length; n++) {
                    var block = blocks[n];
                    if (block.deferred === true) {
                        block._deferredObject = new Deferred();
                        this._currentIndex = n;
                        wireBlock(block);
                        this.addToEnd(this._return, block.solve(this.scope, settings));
                        break;
                    } else {
                        this.addToEnd(this._return, block.solve(this.scope, settings));
                    }
                }

            } else {
                this.onSuccess(this, settings);
            }
            return this._return;
        },
        serializeField: function (name) {
            return this.ignoreSerialize.indexOf(name) == -1;//is not in our array
        },
        onLoad: function () {
        },
        activate: function () {
        },
        deactivate: function () {
        },
        _get: function (what) {
            if(this.override) {
                return (what in this.override ? this.override[what] : this[what]);
            }
        },
        onDidRun: function () {
            if(this.override){
                this.override.args && delete this.override.args;
                delete this.override;
            }
            //this.override = {}
        },
        destroy:function(){
            this.stop(true);
            this.reset();
            this._destroyed = true;
        },
        reset:function(){
            this._lastSettings = {};
            if(this._loop){
                clearTimeout(this._loop);
                this._loop = null;
            }
            delete this.override;
            this.override = {};
        },
        stop:function(){
            this.reset();
        }

    });

    //global short-cuts
    Block.FLAGS = types.BLOCK_FLAGS;
    Block.EMITS = types.BLOCK_CALLBACKMASK;

    //that's really weird: using dynamic base classes nor Block.extend doesnt work.
    //however, move dojo complete out of blox
    if (has('xblox-ui')) {
        lang.mixin(Block.prototype, Block_UI.prototype);
    }

    if (!Block.prototype.onSuccess) {
        Block.prototype.onSuccess = function () {};
        Block.prototype.onRun = function () {}
        Block.prototype.onFailed = function () {}
    }
    dcl.chainAfter(Block,'stop');
    dcl.chainAfter(Block,'destroy');
    dcl.chainAfter(Block,'onDidRun');
    return Block;
});
define('xblox/model/logic/BreakBlock',[
    'dcl/dcl',
    'xide/utils',
    'xide/types',
    'xblox/model/Block'
], function(dcl,utils,types,Block){

    // summary:
    //		The Case Block model. Each case block contains a comparation and a commands block.
    //      If the comparation result is true, the block is executed
    //
    //      This block should have an "SwitchBlock" parent

    // module:
    //		xblox.model.logic.CaseBlock
    return dcl(Block,{
        declaredClass:"xblox.model.logic.BreakBlock",
        name:'Break',
        icon:'fa-stop',
        hasInlineEdits:false,
        canAdd:false,
        toText:function(){
            return '&nbsp;<span class="fa-stop text-warning"></span>&nbsp;&nbsp;<span>' + this.name + '</span>';
        },
        /***
         * Solves the case block
         * @param scope
         * @param switchBlock   => parent SwitchCommand block
         */
        solve:function(scope,settings) {
            this.onSuccess(this, settings);
        },
        //  standard call for editing
        getFields:function(){

            var fields = this.inherited(arguments) || this.getDefaultFields();
            return fields;
        }
    });
});
define('xblox/model/logic/CaseBlock',[
    'dcl/dcl',
    'xide/utils',
    'xide/types',
    'xblox/model/Block',
    'dojo/Deferred',
    "xblox/model/logic/BreakBlock"
], function(dcl,utils,types,Block,Deferred,BreakBlock){

    // summary:
    //		The Case Block model. Each case block contains a comparation and a commands block.
    //      If the comparation result is true, the block is executed
    //
    //      This block should have an "SwitchBlock" parent

    // module:
    //		xblox.model.logic.CaseBlock
    return dcl(Block,{
        declaredClass:"xblox.model.logic.CaseBlock",
        //comparator: xblox.model.Comparator
        // Comparison to be applied -> compare <switch variable> width <expression>
        comparator:null,
        //expression: xblox.model.Expression
        // expression to be compared
        expression:null,
        //items: Array (xblox.model.Block)
        //  block to be executed if the comparison result is true
        items:null,
        name:'Case',
        icon:'',
        hasInlineEdits:true,
        toText:function(){
            var _comparator = '' + this.comparator;
            if(_comparator=='=='){
                //_comparator =''
            }
            return '<span style="text-indent: 1em;">&nbsp;&nbsp;&nbsp;' +this.getBlockIcon('I') + this.name + ' ' + this.makeEditable('comparator','right','text','Enter a comparison','inline') + (this.expression !=null ?  ' ' + this.makeEditable('expression','right','text','Enter a value to compare') : '') + '</span>';
        },
        canAdd:function(){
            return [];
        },
        /***
         * Solves all the commands into items[]
         *
         * @param manager   =>  BlockManager
         * @return  list of commands to send
         */
        _solve: function (scope, settings,switchblock) {

            settings = settings || {
                    highlight: false
                };
            var ret = [];
            for (var n = 0; n < this.items.length; n++) {
                var block = this.items[n];
                if(block.declaredClass.indexOf('BreakBlock')!==-1){
                    switchblock.stop();
                }
                this.addToEnd(ret, block.solve(scope, settings));
            }

            return ret;
        },
        /***
         * Solves the case block
         * @param scope
         * @param switchBlock   => parent SwitchCommand block
         */
        solve:function(scope,switchBlock,settings) {
            try {
                var _var = scope.getVariableById(switchBlock.variable);
                if(!_var && settings.args && settings.args[0]){
                    _var = {value:settings.args[0]};
                }
                //console.log('case block: ' + this.comparator + this.expression,_var);
                // Get the variable to evaluate
                var switchVarValue = '';
                if (_var) {
                    switchVarValue = this._getArg(_var.value, true);
                } else {
                    this.onFailed(this, settings);
                    // Comparation is false
                    return false;
                }


                //var compResult = scope.parseExpression("'" + switchVarValue+ "'" + this.comparator + this.expression);
                var compResult = scope.parseExpression("" + switchVarValue + "" + this.comparator + this._getArg(this.expression, true));

                if (compResult === true) {
                    this.onSuccess(this, settings);
                    // Comparation is true. Return block.solve();
                    this._solve(scope, settings,switchBlock);
                    return true;
                } else {
                    this.onFailed(this, settings);
                    // Comparation is false
                    return false;
                }
            }catch (e){
                console.error('case block crashed! ',e.stack);
                console.trace();
            }
        },
        /**
         * Store function override
         * @param parent
         * @returns {Array}
         */
        getChildren:function(parent){
            return this.items;
        },
        //  standard call for editing
        getFields:function(){

            var fields = this.inherited(arguments) || this.getDefaultFields();

            fields.push(utils.createCI('Expression',13,this.expression,{
                    group:'General',
                    title:'Expression',
                    dst:'expression'
                }));

            function makeOption(value,label){
                return {
                    label:label || value,
                    value:value
                }
            }

            fields.push(utils.createCI('Comparator',3,this.comparator,{
                    group:'General',
                    title:'Comparator',
                    dst:'comparator',
                    widget:{
                        options:[
                            /*makeOption('==',"Equals"),
                            makeOption('<=',"Smaller or equal"),
                            makeOption('=>',"Greater or equal"),
                            makeOption('!=',"Not equal"),
                            makeOption('<',"Smaller than"),
                            makeOption('>',"Greater than")*/
                            makeOption('=='),
                             makeOption('<='),
                             makeOption('=>'),
                             makeOption('!='),
                             makeOption('<'),
                             makeOption('>')
                        ],
                        editable:true
                    }
            }));
            return fields;
        },
        runAction:function(action){

            if(action.command==='New/Break'){
                var dfd = new Deferred();
                var newBlock = this.add(BreakBlock,{
                    group:null
                });

                var defaultDfdArgs = {
                    select: [newBlock],
                    focus: true,
                    append: false
                };
                dfd.resolve(defaultDfdArgs);
                newBlock.refresh();
                return dfd;
            }
        },
        getActions:function(){

            return [this.createAction({
                    label: 'Break',
                    command: 'New/Break',
                    tab: 'Home',
                    icon:'fa-stop',
                    group: 'File',
                    mixin: {
                        addPermission: true,
                        custom:true,
                        quick:false
                    }
                })
            ]
        }
    });
});
define('xblox/model/functions/CallBlock',[
    'dcl/dcl',
    'xide/utils',
    'xide/types',
    'dojo/Deferred',
    "xblox/model/Block",
    "xcf/model/Command"
], function(dcl,utils,types,Deferred,Block,Command){

    // summary:
    //		The Call Block model.
    //      This block makes calls to another blocks in the same scope by action name

    // module:
    //		xblox.model.functions.CallBlock
    /**
     * @augments module:xide/mixins/EventedMixin
     * @extends module:xblox/model/Block_UI
     * @extends module:xblox/model/Block
     * @extends module:xblox/model/ModelBase
     */
    return dcl(Command,{
        declaredClass:"xblox.model.functions.CallBlock",
        //command: (String)
        //  block action name
        command:'Select command please',

        icon:'',

        args:null,

        _timeout:100,

        isCommand:true,


        _commandHandles:null,
        /**
         * onCommandFinish will be excecuted which a driver did run a command
         * @param msg {object}
         * @param msg.id {string} the command job id
         * @param msg.src {string} the source id, which is this block id
         * @param msg.cmd {string} the command string being sent
         */
        onCommandProgress:function(msg){

            var scope = this.getScope();
            var context = scope.getContext();//driver instance
            var result = {};
            var params = msg.params;

            if(params && params.id){
                this._emit('cmd:'+msg.cmd + '_' + params.id,{
                    msg:msg
                });
                msg.lastResponse && this.storeResult(msg.lastResponse);
                this._emit('progress',{
                    msg:msg,
                    id:params.id
                });
            }

            var command = this._lastCommand;

            this._lastResult = null;


            this._lastResult = msg ? msg.result : null;

            var items = this.getItems(types.BLOCK_OUTLET.PROGRESS);
            if(!this._lastSettings){
                this._lastSettings = {}
            }
            this._lastSettings.override = {};
            if(items.length) {
                this.runFrom(items,0,this._lastSettings);
            }
        },
        stop:function(){
            this._lastCommand && this._lastCommand.stop();
        },
        pause:function(){
            this._lastCommand && this._lastCommand.pause();
        },
        destroy:function(){
            _.invoke(this._commandHandles,'remove');
            delete this._commandHandles;
            delete this._lastCommand;
        },
        /***
         * Returns the block run result
         * @param scope
         */
        solve:function(scope,settings) {
            if(!this._commandHandles){
                this._commandHandles=[];
            }else{
                _.invoke(this._commandHandles,'remove');
                this._commandHandles = [];
            }

            var timeout = this._timeout || 50;
            if(_.isString(timeout)){
                timeout = parseInt(timeout);
            }

            var dfd = new Deferred();

            var handles = this._commandHandles;

            settings = settings || {}

            setTimeout(function(){
                if (this.command){

                    var _args = null;
                    if(this.args){

                        settings.override = settings.override || {};
                        var args = scope.expressionModel.replaceVariables(scope,this.args,false,false,null,null,{
                            begin:"%%",
                            end:"%%"
                        });
                        try {
                            _args = utils.fromJson(args);
                        }catch(e){
                            _args = args;
                        }
                        settings.override['args']= _.isArray(_args) ? _args : [args];
                        settings.override['mixin']=_args;
                    }
                    this._lastCommand = scope.resolveBlock(this.command);
                    
                    if(this._lastCommand){
                        handles.push(this._lastCommand._on('paused',this.onCommandPaused,this));
                        handles.push(this._lastCommand._on('finished',this.onCommandFinish,this));
                        handles.push(this._lastCommand._on('stopped',this.onCommandStopped,this));
                        handles.push(this._lastCommand._on('error',this.onCommandError,this));
                        handles.push(this._lastCommand._on('progress',this.onCommandProgress,this));                    
                    }
                    
                    var res = scope.solveBlock(this.command,settings);
                    if(res){
                        this.onSuccess(this,settings);
                    }else{
                        this.onFailed(this,settings);
                    }
                    dfd.resolve(res);
                    return res;
                }
            }.bind(this),timeout);
            return dfd;
        },
        hasInlineEdits:true,
        /**
         *
         * @param field
         * @param pos
         * @param type
         * @param title
         * @param mode: inline | popup
         * @returns {string}
         */
        makeEditable:function(field,pos,type,title,mode,options,value){
            var optionsString = "";
            return "<a " + optionsString + "  tabIndex=\"-1\" pos='" + pos +"' display-mode='" + (mode||'popup') + "' display-type='" + (type || 'text') +"' data-prop='" + field + "' data-title='" + title + "' class='editable editable-click'  href='#'>" + this[field] +"</a>";
        },
        getFieldOptions:function(field){
            if(field ==="command"){
                return this.scope.getCommandsAsOptions("text");
            }
        },
        toText:function(){
            var text = 'Unknown';
            var block = this.scope.getBlock(this.command);
            if(block){
                text = block.name;
            }
            if(this.command.indexOf('://')!==-1) {
                text = '<span class="text-info">' +this.scope.toFriendlyName(this,this.command) + '</span>';
            }
            var _out = this.getBlockIcon('D') + 'Call Command : ' + text;
            return _out;
        },
        //  standard call for editing
        getFields:function(){

            var fields = this.getDefaultFields();
            var thiz=this;

            var title = 'Command';

            if(this.command.indexOf('://')){
                title = this.scope.toFriendlyName(this,this.command);
            }

            fields.push(utils.createCI('value','xcf.widgets.CommandPicker',this.command,{
                    group:'General',
                    title:'Command',
                    dst:'command',
                    options:this.scope.getCommandsAsOptions(),
                    block:this,
                    pickerType:'command',
                    value:this.command
            }));

            fields.push(utils.createCI('arguments',27,this.args,{
                group:'Arguments',
                title:'Arguments',
                dst:'args'
            }));

            fields.push(utils.createCI('timeout',13,this._timeout,{
                group:'General',
                title:'Delay',
                dst:'_timeout'
            }));

            return fields;
        }
    });
});
define('xblox/model/code/CallMethod',[
    'dcl/dcl',
    "xblox/model/Block",
    'xide/utils'
], function(dcl,Block,utils){

    // summary:
    //		The Call Block model.
    //      This block makes calls to another blocks in the same scope by action name

    // module:
    //		xblox.model.code.CallMethod
    return dcl(Block,{
        declaredClass:"xblox.model.code.CallMethod",
        //method: (String)
        //  block action name
        name:'Call Method',
        //method: (String)
        //  block action name
        method:'',
        args:'',

        sharable:true,
        /***
         * Returns the block run result
         * @param scope
         */
        solve:function(scope,settings) {
            var context = this.getContext();
            if (context && context[this.method]!=null)
            {


                var res = [];
                var _fn = context[this.method];
                try{
                    var _args = this.getArgs(settings);
                    console.log('args',_args);
                    var _res = _fn.apply(context,_args||[]);
                    res = _res;
                    this.onSuccess(this,settings);
                    return res;
                }catch(e){
                    console.error('call method ' + this.method + ' failed: '+e);
                    logError(e);
                    this.onFailed(this,settings);
                }
            }else{
                this.onFailed(this,settings);
                return [];
            }
            return [];
        },
        toText:function(){

            var result = this.getBlockIcon() + ' ' + this.name + ' ';
            if(this.method){
                result+= this.makeEditable('method','bottom','text','Enter a driver method','inline');
            }
            return result;
        },

        //  standard call for editing
        getFields:function(){

            var fields = this.getDefaultFields();

            var context = this.getContext();
/*
            console.log('call method ', this.getScope().getContext());
            console.log('call method ', context);*/


            fields.push(utils.createCI('value',13,this.method,{
                    group:'General',
                    title:'Method',
                    dst:'method'
                }));

            fields.push(utils.createCI('value',27,this.args,{
                    group:'Arguments',
                    dst:'args',
                    widget:{
                        title:''
                    }
                }));

            return fields;
        },
        getBlockIcon:function(){
            return '<span class="fa-caret-square-o-right"></span>';
        }
    });
});
define('xblox/model/Contains',[
    'dcl/dcl',
    "dojo/promise/all",
    "xide/types"
], function(dcl,all,types){
    /**
     * Contains provides implements functions to deal with sub blocks.
     *
     */
    return dcl(null,{

        declaredClass:'xblox.model.Contains',
        runByType:function(outletType,settings){
            var items = this.getItemsByType(outletType);
            if(items.length) {
                this.runFrom(items,0,settings);
            }
        },
        getItemsByType:function(outletType){
            var items = this.items;
            if(!outletType){
                return items;
            }
            var result = [];
            _.each(items,function(item){
                if(item.outlet & outletType){
                    result.push(item);
                }
            });
            return result;
        },
        getContainer:function(){
            return this[this._getContainer()];
        },
        /**
         * Store is asking this!
         * @param parent
         * @returns {boolean}
         */
        mayHaveChildren:function(parent){
            var items = this[this._getContainer()];
            return items!=null && items.length>0;
        },
        /**
         * Store function
         * @param parent
         * @returns {Array}
         */
        getChildren:function(parent){
            return this[this._getContainer()];
        },
        //  standard call from interface
        canAdd:function(){
            return [];
        },
        runFrom: function (_blocks, index, settings) {

            var thiz = this,
                blocks = _blocks || this.items,
                allDfds = [];

            var onFinishBlock = function (block, results) {
                block._lastResult = block._lastResult || results;
                thiz._currentIndex++;
                thiz.runFrom(blocks, thiz._currentIndex, settings);
            };

            var wireBlock = function (block) {
                block._deferredObject.then(function (results) {
                    console.log('----def block finish');
                    onFinishBlock(block, results);
                });
            };

            if (blocks.length) {

                for (var n = index; n < blocks.length; n++) {
                    var block = blocks[n];
                    if (block.deferred === true && block.enabled) {
                        block._deferredObject = new Deferred();
                        this._currentIndex = n;
                        wireBlock(block);
                        //this.addToEnd(this._return, block.solve(this.scope, settings));
                        var blockDfd = block.solve(this.scope, settings);
                        allDfds.push(blockDfd);
                        break;
                    } else {
                        //this.addToEnd(this._return, block.solve(this.scope, settings));
                        if(block.enabled) {
                            var blockDfd = block.solve(this.scope, settings);
                            allDfds.push(blockDfd);
                            block.onDidRun();
                        }
                    }

                }

            } else {
                this.onSuccess(this, settings);
            }

            //console.log('last settings ',this._lastSettings);

            this._lastSettings && delete this._lastSettings.override;

            return allDfds;
        },
        /***
         * Generic: run sub blocks
         * @param scope
         * @param settings
         * @param run
         * @param error
         * @returns {Array}
         */
        _solve:function(scope,settings,run,error) {

            if(!this._lastRunSettings && settings){
                this._lastRunSettings= settings;
            }

            settings = this._lastRunSettings || settings;


            this._currentIndex=0;
            this._return=[];

            var ret=[], items = this[this._getContainer()];
            if(items.length) {
                var res = this.runFrom(items,0,settings);
                this.onSuccess(this, settings);
                return res;
            }else{
                this.onSuccess(this, settings);
            }
            return ret;
        },
        onDidRunItem:function(dfd,result,settings){

            settings = settings || {};

            var listener = settings.listener,
                thiz = this;
            this._emit(types.EVENTS.ON_RUN_BLOCK_SUCCESS, thiz);
            dfd.resolve(result);
        },
        onDidRunItemError:function(dfd,result,settings){

            settings = settings || {};

            var listener = settings.listener,
                thiz = this;

            dfd.reject(result);
        },
        onRunThis:function(settings){

            settings = settings || {};

            var listener = settings.listener,
                thiz = this;

            if(listener) {
                //listener._emit(types.EVENTS.ON_RUN_BLOCK, thiz);
            }
            this._emit(types.EVENTS.ON_RUN_BLOCK, thiz);
        },
        onDidRunThis:function(dfd,result,items,settings){

            var thiz = this;

            //more blocks?
            if(items && items.length) {

                var subDfds = thiz.runFrom(items,0,settings);

                all(subDfds).then(function(what){
                    thiz.onDidRunItem(dfd,result,settings);
                },function(err){
                    console.error('error in chain',err);
                    thiz.onDidRunItem(dfd,err,settings);
                });

            }else{
                thiz.onDidRunItem(dfd,result,settings);
            }
        },
        ___solve:function(scope,settings,run,error) {


            /*
            if(!this._lastRunSettings && settings){
                this._lastRunSettings= settings;
            }

            settings = this._lastRunSettings || settings;


            this._currentIndex=0;
            this._return=[];

            var ret=[], items = this[this._getContainer()];
            if(items.length) {

                var res = this.runFrom(items,0,settings);

                this.onSuccess(this, settings);

                return res;

            }else{

                this.onSuccess(this, settings);
            }
            return ret;
            */
        }
    });
});
/** @module xblox/model/code/RunScript **/
define('xblox/model/code/RunScript',[
    'dcl/dcl',
    'xdojo/has',
    "dojo/Deferred",
    "xblox/model/Block",
    'xide/utils',
    'xblox/model/Contains',
    'dojo/promise/all',
    'xide/types',
    'module'
    //'xdojo/has!host-node?dojo/node!tracer',
    //'xdojo/has!host-node?nxapp/utils/_console'
    //"xdojo/has!xblox-ui?dojo/text!./RunScript.html"
    //"xdojo/has!xblox-ui?dojo/text!xblox/docs/code/RunScript.md"
], function(dcl,has,Deferred,Block,utils,Contains,all,types,module,tracer,_console,Description,Help){

    
    var isServer = has('host-node');
    var console = typeof window !== 'undefined' ? window.console : global.console;
    if(isServer && tracer && console && console.error){
        console = _console;
    }
    /**
     *
     * @class module:xblox/model/code/RunScript
     * @extends module:xblox/model/Block
     */
    return dcl([Block,Contains],{
        declaredClass:"xblox.model.code.RunScript",
        name:'Run Script',
        method:'',
        args:'',
        deferred:false,
        sharable:true,
        context:null,
        icon:'fa-code',
        observed:[
            'method'
        ],
        getContext:function(){
            return this.context || (this.scope.getContext ?  this.scope.getContext() : this);
            return this.context || this;
        },
        /***
         * Returns the block run result
         * @param scope
         * @param settings
         * @param run
         * @param error
         * @returns {Array}
         */
        solve2:function(scope,settings,run,error) {
            this._currentIndex = 0;
            this._return=[];
            var _script = '' + this._get('method');
            var thiz=this,
                ctx = this.getContext();
            if(_script && _script.length) {

                var runScript = function() {
                    var _function = new Function("{" + _script + "}");
                    var _args = thiz.getArgs() || [];
                    try {
                        var _parsed = _function.apply(ctx, _args || {});
                        thiz._lastResult = _parsed;
                        if (run) {
                            run('Expression ' + _script + ' evaluates to ' + _parsed);
                        }
                        if (_parsed !== 'false' && _parsed !== false) {
                            thiz.onSuccess(thiz, settings,{
                                result:_parsed
                            });
                        } else {
                            thiz.onFailed(thiz, settings);
                            return [];
                        }
                    } catch (e) {
                        if (error) {
                            error('invalid expression : \n' + _script + ': ' + e);
                        }
                        thiz.onFailed(thiz, settings);
                        return [];
                    }
                };

                if(scope.global){
                    (function() {
                        window = scope.global;
                        var _args = thiz.getArgs() || [];
                        try {
                            var _parsed = null;
                            if(!ctx.runExpression) {
                                var _function = new Function("{" + _script + "}").bind(this);
                                _parsed = _function.apply(ctx, _args || {});
                            }else{
                                _parsed = ctx.runExpression(_script,null,_args);
                            }

                            thiz._lastResult = _parsed;

                            if (run) {
                                run('Expression ' + _script + ' evaluates to ' + _parsed);
                            }
                            if (_parsed !== 'false' && _parsed !== false) {
                                thiz.onSuccess(thiz, settings);
                            } else {
                                thiz.onFailed(thiz, settings);
                                return [];
                            }
                        } catch (e) {
                            thiz._lastResult = null;
                            if (error) {
                                error('invalid expression : \n' + _script + ': ' + e);
                            }
                            thiz.onFailed(thiz, settings);
                            return [];
                        }

                    }).call(scope.global);

                }else{
                    return runScript();
                }
            }else{
                console.error('have no script');
            }
            var ret=[], items = this[this._getContainer()];
            if(items.length) {
                this.runFrom(items,0,settings);
            }else{
                this.onSuccess(this, settings);
            }
            this.onDidRun();
            return ret;
        },
        /**
         *
         * @param scope
         * @param settings
         * @param run
         * @param error
         */
        solve:function(scope,settings,isInterface,send,run,error){

            this._currentIndex = 0;
            this._return=[];


            settings = settings || {};
            var _script = send || (this._get('method') ? this._get('method') : this.method);

            var thiz=this,
                ctx = this.getContext(),
                items = this[this._getContainer()],

                //outer
                dfd = new Deferred,
                listener = settings.listener,
                isDfd = thiz.deferred;

            this.onRunThis(settings);

            function globalEval(text) {
                var ret;
                // Properly escape \, " and ' in the input, normalize \r\n to an escaped \n
                text = text.replace(/["'\\]/g, "\\$&").replace(/\r\n/g, "\\n");

                // You have to use eval() because not every expression can be used with an assignment operator
                var where = typeof window!=='undefined' ? window : global;

                where.execScript("globalEval.____lastInputResult____ = eval('" + text + "');} }");

                // Store the result and delete the property
                ret = globalEval.____lastInputResult____;
                delete globalEval.____lastInputResult____;

                return ret;
            }
            var expression = scope.expressionModel.replaceVariables(scope,_script,null,null);
            var _function = scope.expressionModel.expressionCache[expression];
            if(!_function){
                _function = scope.expressionModel.expressionCache[expression] = new Function("{" + expression + "}");
            }
            var _args = thiz.getArgs(settings) || [];
            try {
                if(isDfd){
                    ctx.resolve=function(result){
                        if(thiz._deferredObject) {
                            thiz._deferredObject.resolve();
                        }
                        thiz.onDidRunThis(dfd,result,items,settings);
                    }
                }
                var _parsed = _function.apply(ctx, _args || {});
                thiz._lastResult = _parsed;
                if (run) {
                    run('Expression ' + _script + ' evaluates to ' + _parsed);
                }
                if(!isDfd) {
                    thiz.onDidRunThis(dfd,_parsed,items,settings);
                }
                if (_parsed !== 'false' && _parsed !== false) {
                    thiz.onSuccess(thiz, settings);
                } else {
                    thiz.onFailed(thiz, settings);
                }
            } catch (e) {
                e=e ||{};
                thiz.onDidRunItemError(dfd,e,settings);
                thiz.onFailed(thiz,settings);
                if (error) {
                    error('invalid expression : \n' + _script + ': ' + e);
                }
            }
            return dfd;
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  UI
        //
        /////////////////////////////////////////////////////////////////////////////////////
        toText:function(){

            var result = '<span style="">' + this.getBlockIcon() + ' ' + this.name + ' :: '+'</span>';
            if(this.method){
                result+= this.method.substr(0,50);
            }
            return result;
        },
        canAdd:function(){
            return [];
        },
        getFields:function(){
            if(this.description === 'No Description'){
                this.description = Description;
            }
            var fields = this.inherited(arguments) || this.getDefaultFields();
            var thiz=this;
            fields.push(
                utils.createCI('name',13,this.name,{
                    group:'General',
                    title:'Name',
                    dst:'name'
                })
            );
            fields.push(
                utils.createCI('deferred',0,this.deferred,{
                    group:'General',
                    title:'Deferred',
                    dst:'deferred'
                })
            );
            fields.push(utils.createCI('arguments',27,this.args,{
                    group:'Arguments',
                    title:'Arguments',
                    dst:'args'
                }));

            fields.push(
                utils.createCI('value',types.ECIType.EXPRESSION_EDITOR,this.method,{
                    group:'Script',
                    title:'Script',
                    dst:'method',
                    select:true,
                    widget:{
                        allowACECache:true,
                        showBrowser:false,
                        showSaveButton:true,
                        editorOptions:{
                            showGutter:true,
                            autoFocus:false
                        },
                        item:this
                    },
                    delegate:{
                        runExpression:function(val,run,error){
                            var old = thiz.method;
                            thiz.method=val;
                            var _res = thiz.solve(thiz.scope,null,run,error);
                        }
                    }
                }));
            return fields;
        }
    });
});
define('xblox/model/code/RunBlock',[
    'dcl/dcl',
    "xblox/model/Block",
    'xide/types',
    'xide/utils'
], function(dcl,Block,types,utils){

    // summary:
    //		The Call Block model.
    //      This block makes calls to another blocks in the same scope by action name

    // module:
    //		xblox.model.code.CallMethod


    return dcl(Block,{
        declaredClass:"xblox.model.code.RunBlock",
        //method: (String)
        //  block action name
        name:'Run Block',

        file:'',
        //method: (String)
        //  block action name
        method:'',

        args:'',

        sharable:true,

        block:'',

        description:"Runs another Block",
        /***
         * Returns the block run result
         * @param scope
         */
        solve:function(scope,settings) {

            var context = this.getContext();
            if (context && context[this.method]!=null)
            {
                var res = [];
                var _fn = context[this.method];
                try{
                    var _args = this._getArgs();
                    var _res = _fn.apply(context,_args||[]);
                    res = _res;
                    this.onSuccess(this,settings);
                    return res;
                }catch(e){
                    console.error('call method failed');
                    this.onFailed(this,settings);
                }
            }else{
                this.onFailed(this,settings);
                return [];
            }
            return [];
        },
        toText:function(){

            var result = this.getBlockIcon() + ' ' + this.name + ' ';
            if(this.method){
                result+= this.method.substr(0,20);
            }
            return result;
        },

        //  standard call for editing
        getFields:function(){


            var fields = this.getDefaultFields();


            fields.push(utils.createCI('Block', types.ECIType.BLOCK_REFERENCE, this.block, {
                toolTip:'Enter  block, you can use also the block\'s share title',
                group: 'General',
                dst: 'block',
                value: this.block,
                title:'Block',
                scope:this.scope
            }));

            fields.push(utils.createCI('File', types.ECIType.FILE, this.file, {
                toolTip:'Leave empty to auto-select this file',
                group: 'General',
                dst: 'file',
                value: this.file,
                intermediateChanges: false,
                acceptFolders: false,
                acceptFiles: true,
                encodeFilePath: false,
                buildFullPath: true,
                filePickerOptions: {
                    dialogTitle: 'Select Block File',
                    filePickerMixin: {
                        beanContextName: this.id,
                        persistent: false,
                        globalPanelMixin: {
                            allowLayoutCookies: false
                        }
                    },
                    configMixin: {
                        beanContextName: this.id,
                        LAYOUT_PRESET: types.LAYOUT_PRESET.SINGLE,
                        PANEL_OPTIONS:{
                            ALLOW_MAIN_MENU:false,
                            ALLOW_NEW_TABS:true,
                            ALLOW_MULTI_TAB:false,
                            ALLOW_INFO_VIEW:true,
                            ALLOW_LOG_VIEW:false,
                            ALLOW_CONTEXT_MENU:true,
                            ALLOW_LAYOUT_SELECTOR:true,
                            ALLOW_SOURCE_SELECTOR:true,
                            ALLOW_COLUMN_RESIZE:true,
                            ALLOW_COLUMN_REORDER:true,
                            ALLOW_COLUMN_HIDE:true,
                            ALLOW_ACTION_TOOLBAR:true,
                            ALLOW_BREADCRUMBS:false
                        }
                    },
                    defaultStoreOptions: {
                        "fields": 1663,
                        "includeList": "xblox",
                        "excludeList": "*"
                    },
                    startPath: this.file
                }
            }));

            return fields;

            /*
            fields.push(utils.createCI('value',27,this.args,{
                    group:'General',
                    title:'Arguments',
                    dst:'args'
                }));

            return fields;
            */
        },
        getBlockIcon:function(){
            return '<span class="el-icon-share-alt"></span>';
        }


    });
});
/** @module xblox/model/variables/Variable */
define('xblox/model/variables/Variable',[
    'dcl/dcl',
    'xide/types',
    "xblox/model/Block"
], function(dcl,types,Block){
    /**
     *  The command model. A 'command' consists out of a few parameters and a series of
     *  expressions. Those expressions need to be evaluated before send them to the device
     *
     * @class module:xblox.model.variables.Variable
     * @augments module:xide/mixins/EventedMixin
     * @extends module:xblox/model/Block_UI
     * @extends module:xblox/model/Block
     */
    return dcl(Block,{
        declaredClass:"xblox.model.variables.Variable",
        //name: String
        //  the variable's name, it should be unique within a scope
        name:null,

        //value: Current variable value
        value:null,

        register:true,

        readOnly:false,

        initial:null,
        
        isVariable:true,
        flags: 0x000001000,
        getValue:function(){
            return this.value;
        },
        canDisable:function(){
            return false;
        },
        canMove:function(){
            return false;
        },
        getIconClass:function(){
            return 'el-icon-quotes-alt';
        },
        getBlockIcon:function(){
            return '<span class="'+this.icon+'"></span> ';
        },
        toText:function(){
            return "<span class='text-primary'>" + this.getBlockIcon() +  this.makeEditable('name','right','text','Enter a unique name','inline') +"</span>";
        },
        solve:function(){

            var _result = this.scope.parseExpression(this.getValue(),true);
            //console.log('resolved variable ' + this.title + ' to ' + _result);
            return [];

        },
        getFields:function(){
            var fields = this.getDefaultFields();
            var thiz=this,
                defaultArgs = {
                    allowACECache:true,
                    showBrowser:false,
                    showSaveButton:true,
                    editorOptions:{
                        showGutter:false,
                        autoFocus:false,
                        hasConsole:false
                    },
                    aceOptions:{
                        hasEmmet:false,
                        hasLinking:false,
                        hasMultiDocs:false
                    },
                    item:this
                };

            fields.push(this.utils.createCI('title',types.ECIType.STRING,this.name,{
                group:'General',
                title:'Name',
                dst:'name'
            }));

            fields.push(this.utils.createCI('value',types.ECIType.EXPRESSION,this.value,{
                group:'General',
                title:'Value',
                dst:'value',
                delegate:{
                    runExpression:function(val,run,error){
                        return thiz.scope.expressionModel.parse(thiz.scope,val,false,run,error);
                    }
                }
            }));

            


            //this.types.ECIType.EXPRESSION_EDITOR
            /*
            fields.push(this.utils.createCI('initial',this.types.ECIType.EXPRESSION,this.initial,{
                group:'General',
                title:'Initial',
                dst:'initial',
                widget:defaultArgs,
                delegate:{
                    runExpression:function(val,run,error){
                        if(thiz.group=='processVariables'){
                            var _val = thiz.scope.getVariable("value");
                            var extra = "";
                            if(_val) {
                                _val = _val.value;
                                if(!thiz.isNumber(_val)){
                                    _val = ''+_val;
                                    _val = "'" + _val + "'";
                                }
                                extra = "var value = " + _val +";\n";
                            }
                        }
                        return thiz.scope.expressionModel.parse(thiz.scope,extra + val,false,run,error);
                    }
                }
            }));
            */
            return fields;
        }
    });
});
define('xblox/model/loops/ForBlock',[
    "dcl/dcl",
    "xblox/model/Block",
    "xblox/model/variables/Variable",
    'xblox/model/Contains',
    "dojo/promise/all",
    "dojo/Deferred"
], function(dcl,Block,Variable,Contains,all,Deferred){

    // summary:
    //		The for block model. It repeats a block a number of times, while the condition is true.
    //

    // module:
    //		xblox.model.loops.ForBlock
    return dcl([Block,Contains],{
        declaredClass:"xblox.model.loops.ForBlock",
        // initial: xcf.model.Expression
        // the initial value
        initial: null,

        // final: xcf.model.Expression
        // the final value to be compared with the counter. Once the final value equals to the counter, the loop stops
        "final": null,
        //comparator: xblox.model.Comparator
        // Comparison to be applied -> compare <counter variable> width <final>
        comparator: null,
        // modifier: xcf.model.Expression
        // expression to be applied to the counter on every step. Expression: "<counter><modifier>"
        modifier: null,

        //items: Array (xblox.model.Block)
        //  block to be executed while the condition compare <counter variable> width <final> is false
        items: null,

        //counterName: String
        // the counter variable name
        counterName: null,

        // (private) counter: xblox.model.Variable
        // counter to be compared and updated on every step
        _counter: null,
        name:'For',
        sharable:true,
        icon:'',
        ignoreErrors:false,
        deferred:true,
        _forState:false,
        _currentForIndex:0,
        runFrom: function (_blocks, index, settings) {

            var thiz = this,
                blocks = _blocks || this.items,
                allDfds = [];

            var onFinishBlock = function (block, results) {
                block._lastResult = block._lastResult || results;
                thiz._currentIndex++;
                thiz.runFrom(blocks, thiz._currentIndex, settings);
            };

            var wireBlock = function (block) {
                block._deferredObject.then(function (results) {
                    console.log('----def block finish');
                    onFinishBlock(block, results);
                });
            };

            if (blocks.length) {
                for (var n = index; n < blocks.length; n++) {
                    var block = blocks[n];
                    if(block.enabled===false){
                        continue;
                    }
                    if (block.deferred === true) {
                        block._deferredObject = new Deferred();
                        this._currentIndex = n;
                        wireBlock(block);
                        //this.addToEnd(this._return, block.solve(this.scope, settings));
                        var blockDfd = block.solve(this.scope, settings);
                        allDfds.push(blockDfd);
                        break;
                    } else {

                        //this.addToEnd(this._return, block.solve(this.scope, settings));

                        var blockDfd = block.solve(this.scope, settings);
                        allDfds.push(blockDfd);
                    }

                }

            } else {
                this.onSuccess(this, settings);
            }

            return allDfds;
        },
        runFromDirect: function (_blocks, index, settings) {

            var thiz = this,
                blocks = _blocks || this.items,
                allDfds = [];

            var onFinishBlock = function (block, results) {
                block._lastResult = block._lastResult || results;
                thiz._currentIndex++;
                thiz.runFrom(blocks, thiz._currentIndex, settings);
            };

            var wireBlock = function (block) {
                block._deferredObject.then(function (results) {
                    onFinishBlock(block, results);
                });
            };
            if (blocks.length) {
                for (var n = index; n < blocks.length; n++) {
                    var block = blocks[n];
                    if (block.enabled === false) {
                        continue;
                    }
                    if (block.deferred === true) {
                        block._deferredObject = new Deferred();
                        this._currentIndex = n;
                        wireBlock(block);
                        //this.addToEnd(this._return, block.solve(this.scope, settings));
                        var blockDfd = block.solve(this.scope, settings);
                        allDfds.push(blockDfd);
                        break;
                    } else {
                        //this.addToEnd(this._return, block.solve(this.scope, settings));
                        var blockDfd = block.solve(this.scope, settings);
                        allDfds.push(blockDfd);

                    }
                }
            } else {
                this.onSuccess(this, settings);
            }

            return allDfds;
        },
        solveSubs:function(dfd,result,items,settings){
            var thiz = this;
            settings.override = settings.override || {};
            settings.override['args']=[this._currentForIndex];
            //more blocks?
            if(items.length) {
                var subDfds = thiz.runFrom(items,0,settings);
                all(subDfds).then(function(what){
                },function(err){
                    console.error('error in chain',err);
                    thiz.onDidRunItem(dfd,err,settings);
                });
                return subDfds;

            }else{
                thiz.onDidRunItem(dfd,result,settings);
            }
        },
        solveSubsDirect:function(dfd,result,items,settings){
            var thiz = this;
            settings.override = settings.override || {};
            settings.override['args']=[this._currentForIndex];
            //more blocks?
            if(items.length) {
                return thiz.runFromDirect(items,0,settings);
            }
        },
        _solve:function(scope,settings){
            var ret=[];
            var dfd = new Deferred(),
                self = this;

            var result = this.solveSubs(dfd,null,this.items,settings);
            if(result) {
                all(result).then(function (res) {
                    var falsy = res.indexOf(false);
                    if (self.ignoreErrors !== true && falsy !== -1) {
                        dfd.resolve(false);
                    } else {
                        dfd.resolve(true);
                    }
                });
            }else{
                dfd.resolve(true);
            }

            return dfd;
        },
        step:function(scope,settings){
            var state = this._checkCondition(scope,settings);
            var dfd = new Deferred(),
                self = this;
            if(state){
                //run blocks
                var subs = this._solve(scope,settings);
                subs.then(function(result){
                    //console.log('sub step result ' + result);
                    if(result==true){
                        //console.log('continue');
                        dfd.resolve(true);
                    }else{
                        //console.log('break');
                        dfd.resolve(false);

                    }
                });
            }
            return dfd;

        },
        loop:function(scope,settings){
            var stepResult = this.step(scope,settings),
                self = this;
            stepResult.then(function(proceed){
                self._updateCounter(scope);
                self._currentForIndex = self._counter.value;
                if(proceed==true){
                    self.loop(scope,settings);
                }else{
                    self.onFailed(self,settings);
                }
            });
        },
        _solveDirect:function(scope,settings){
            return this.solveSubsDirect(null,null,this.items,settings);
        },
        stepDirect:function(scope,settings){
            return this._solveDirect(scope,settings);
        },
        loopDirect:function(scope,settings) {
            var stepResult = this.stepDirect(scope, settings),
                self = this;
            for (var index = parseInt(this.initial); index < parseInt(this['final']); index++) {
                self.stepDirect(scope, settings);
            }
        },

        // solves the for block (runs the loop)
        solve:function(scope,settings) {
            var ret = [];
            var noInfinite = true;
            // 1. Create and initialize counter variable
            this._counter = new Variable({
                title : this.counterName,
                value : this.initial,
                scope : scope,
                register:false
            });
            var cond = null;
            //prepare
            this._forState = true;
            this._currentForIndex = this.initial;
            this.deferred ? this.loop(scope,settings) : this.loopDirect(scope,settings);
            return ret;
        },

        // checks the loop condition
        _checkCondition:function(scope,settings) {
            var expression = '' + this._counter.value + this.comparator + this['final'];
            var result = scope.parseExpression(expression);
            if(result==false){
                //this.onFailed(this,settings);
            }else{
                this.onSuccess(this,settings);
            }
            this._forState=result;
            return result;
        },
        // updates the counter
        _updateCounter:function(scope) {
            var value = this._counter.value;
            var expression = '' + value + this.modifier;
            value = scope.parseExpression(expression);
            // Detect infinite loops
            if (value == this._counter.value) {
                return false;
            } else {
                this._counter.value = value;
                return true;
            }
        },
        /**
         * Store function override
         * @param parent
         * @returns {boolean}
         */
        mayHaveChildren:function(parent){
            return this.items!=null && this.items.length>0;
        },
        /**
         * Store function override
         * @param parent
         * @returns {Array}
         */
        getChildren:function(parent){
            var result=[];
            if(this.items){
                result=result.concat(this.items);
            }
            return result;
        },
        /**
         * @TODO
         * should return a number of valid classes
         * @returns {Array}
         */
        canAdd:function(){
            return [];
        },
        /**
         * UI, Block row editor, returns the entire text for this block
         * @returns {string}
         */
        toText:function(){
            return this.getBlockIcon('F') + this.name + ' ' + this.initial + ' ' + this.comparator + ' ' + this['final']  + ' with ' + this.modifier;
        },
        /**
         * UI
         * @returns {*[]}
         */
        getFields:function(){
            var fields = this.inherited(arguments) || this.getDefaultFields();
            fields = fields.concat([
                this.utils.createCI('initial',13,this.initial,{
                    group:'General',
                    title:'Initial',
                    dst:'initial'
                }),
                this.utils.createCI('Final',13,this['final'],{
                    group:'General',
                    title:'Final',
                    dst:'final'
                }),
                this.utils.createCI('comparator',13,this.comparator,{
                    group:'General',
                    title:'Comparision',
                    dst:'comparator'
                }),
                this.utils.createCI('modifier',13,this.modifier,{
                    group:'General',
                    title:'Modifier',
                    dst:'modifier'
                }),
                this.utils.createCI('Abort on Error',0,this.ignoreErrors,{
                    group:'General',
                    title:'Ignore Errors',
                    dst:'ignoreErrors'
                }),
                this.utils.createCI('Deferred',0,this.deferred,{
                    group:'General',
                    title:'Use Deferred',
                    dst:'deferred'
                })
            ]);
            return fields;
        }
    });
});
define('xblox/model/loops/WhileBlock',[
    "dcl/dcl",
    "xblox/model/Block",
    "xblox/model/variables/Variable"
], function(dcl,Block,Variable){

    // summary:
    //		The while block model. It repeats a block a number of times, while the condition is true.
    //

    // module:
    //		xblox.model.loops.WhileBlock
    return dcl(Block,{

        declaredClass:"xblox.model.loops.WhileBlock",
        // condition: (String) expression to be evaluated every step
        condition: null,
        /**
         * Blocks to be executed while the condition is true
         * @type {xblox.model.Block[]}
         * @inheritDoc
         */
        items: null,

        loopLimit: 1500,

        name:'While',

        wait:0,

        _currentIndex:0,

        sharable:true,

        icon:"",

        _timer:null,

        //  standard call from interface
        canAdd:function(){
            return [];
        },
        _solve:function(scope,settings){
            var ret=[];
            for(var n = 0; n < this.items.length ; n++)
            {
                this.items[n].solve(scope,settings);
            }
            return ret;
        },

        doStep:function(settings){

            if(this._currentIndex < this.loopLimit){

                var ret = [];

                var _cond = this._checkCondition(this.scope);
                if(_cond) {
                    this.onSuccess(this,settings);
                    this.addToEnd( ret , this._solve(this.scope,settings));
                    this._currentIndex++;
                }else{
                    if(this._timer){
                        clearInterval(this._timer);
                    }


                    this.onFailed(this,settings);
                }
            }else{
                console.error('--while block : reached loop limit');
                this.reset();
            }
        },
        reset:function(){
            if(this._timer){
                clearTimeout(this._timer);
                this._timer = null;
            }
            this._currentIndex=0;


        },
        // solves the while block (runs the loop)
        solve:function(scope,settings) {

            //console.log('solve while ');
            this.loopLimit = 1500;
            settings = settings || { };

            var iterations = 0;

            var ret = [],
                thiz = this;

            var delay = this._getArg(this.wait);

            this.reset();

            // has delay
            if(delay>0){

                this._timer = setInterval(function(){
                    thiz.doStep(settings);
                },delay);

                return [];
            }

            // Evaluate condition
            while ((this._checkCondition(scope)) && (iterations < this.loopLimit)) {
                this._solve(scope,settings);
                iterations++;
            }
            //cleanup

            this.reset();

            return ret;

        },

        /**
         * Block row editor, returns the entire text for this block
         * @returns {string}
         */
        toText:function(){
            return this.getBlockIcon('G') + this.name + ' ' + this.condition;
        },

        // checks the loop condition
        _checkCondition:function(scope) {
            return scope.parseExpression(this.condition);
        },
        /**
         * Store function override
         * @param parent
         * @returns {boolean}
         */
        mayHaveChildren:function(parent){
            return this.items!=null && this.items.length>0;
        },

        /**
         * Store function override
         * @param parent
         * @returns {Array}
         */
        getChildren:function(parent){
            var result=[];

            if(this.items){
                result=result.concat(this.items);
            }
            return result;
        },
        getFields:function(){


            var thiz=this;

            var fields = this.inherited(arguments) || this.getDefaultFields();

            fields.push(

                this.utils.createCI('condition',25,this.condition,{
                    group:'General',
                    title:'Expression',
                    dst:'condition',
                    delegate:{
                        runExpression:function(val,run,error){
                            return thiz.scope.expressionModel.parse(thiz.scope,val,false,run,error);
                        }
                    }
                })
            );

            fields.push(this.utils.createCI('wait',13,this.wait,{
                    group:'General',
                    title:'Wait',
                    dst:'wait'
            }));
            return fields;
        }


    });
});
/** @module xblox/model/variables/VariableAssignmentBlock **/
define('xblox/model/variables/VariableAssignmentBlock',[
    'dcl/dcl',
    "xblox/model/Block",
    "xide/utils",
    "xide/types",
    'dstore/legacy/DstoreAdapter',
    "xide/factory",
    'xdojo/has'
], function(dcl,Block,utils,types,DstoreAdapter,factory,has){

    var isServer = has('host-node');
    var BLOCK_INSERT_ROOT_COMMAND = 'Step/Insert';
    


    /**
     *
     * @class module:xblox/model/variables/VariableAssignmentBlock
     * @extends xblox/model/Block
     */
    var Module = dcl(Block,{
        declaredClass: "xblox.model.variables.VariableAssignmentBlock",

        //variable: (String)
        //  variable title
        variable:null,

        //value: (String)
        // Expression to be asigned
        value:null,
        name:'Set Variable',
        icon:'',
        hasInlineEdits:true,
        flags:0x00000004,
        toText:function(){
            var _variable = this.scope.getVariableById(this.variable);
            var _text = _variable ? _variable.name : '';
            if(this.variable && this.variable.indexOf('://')!==-1) {
                _text = '<span class="text-info">' +this.scope.toFriendlyName(this, this.variable)+'</span>';
            }
            return this.getBlockIcon('C') + this.name + ' ' + _text  + "<span class='text-muted small'> to <kbd class='text-warning'>" + this.makeEditable("value",'bottom','text','Enter the string to send','inline') + "</kbd></span>";
        },
        _getPreviousResult: function () {
            var parent = null;
            var prev = this.getPreviousBlock();
            if(!prev || !prev._lastResult || !prev.enabled){
                parent = this.getParent();
            }else{
                parent = prev;
            }

            if (parent && parent._lastResult != null) {
                if (this.isArray(parent._lastResult)) {
                    return parent._lastResult;
                } else {
                    return parent._lastResult;
                }
            }
            return null;
        },
        /***
         * Makes the assignation
         * @param scope
         */

        solve:function(scope,settings) {
            var value = this.value;
            var changed = false;
            if(!value){
                var _value = this.getArgs();
                if(_value.length>0){
                    value = _value[0];
                }
            }
            if (this.variable && value!==null){

                this.onRun(this,settings);
                //var _variable = scope.getVariable(this.variable).value = scope.parseExpression(this.value);
                var _variable = this.variable.indexOf('://')!==-1 ? this.scope.resolveBlock(this.variable) : scope.getVariableById(this.variable);
                //console.log('assign variable',settings);
                var _value = this._getArg(value);

                var _args = this.getArgs(settings) || [];
                //console.log('run with args ' , _args);

                if(!_variable){
                    //console.error('     no such variable : ' + this.variable);
                    return [];
                }
                var _parsed = null;
                if(this.isScript(_value)){
                    var override = this.override || {};
                    _parsed = scope.parseExpression(value,null,null,null,null,null,_args || override.args);
                    //_parsed = scope.parseExpression(_value);
                    _parsed = this.replaceAll("'",'',_parsed);
                    //_variable.value = scope.parseExpression(_value);
                    //_variable.value = this.replaceAll("'",'',_variable.value);

                    if(_variable.value!==_parsed){
                        changed = true;
                    }

                }else{

                    if(_args && _args.length==1){
                        _value = _args[0];
                    }

                    if(_variable.value!==_value){
                        changed = true;
                    }

                    _variable.value = _value;
                    _parsed = _value;
                }


                _variable.set('value',_parsed);

                var publish = false;


                var context = this.getContext();
                if(context) {
                    var device = context.device;
                    if(device && device.info && isServer && device.info.serverSide) {
                        if (this.flags & types.VARIABLE_FLAGS.PUBLISH_IF_SERVER) {
                            publish = true;
                        }else{
                            publish=false;
                        }
                    }
                }

                if(this.flags & types.VARIABLE_FLAGS.PUBLISH && changed){
                    publish = true;
                }

                changed && factory.publish(types.EVENTS.ON_DRIVER_VARIABLE_CHANGED,{
                    item:_variable,
                    scope:this.scope,
                    save:false,
                    block:this,
                    name:_variable.name,
                    value:_value,
                    publish:publish,
                    result:_parsed
                });
                this.onSuccess(this,settings);
                return [];
            }
        },
        canAdd:function(){
            return null;
        },
        getFields:function(){

            var fields = this.inherited(arguments) || this.getDefaultFields(false);
            var thiz=this;

            /*
            fields.push(this.utils.createCI('Variable',3,this.variable,{
                    group:'General',
                    dst:'variable',
                    widget:{
                        store:new DstoreAdapter(this.scope.blockStore),
                        query:{
                            group:'basicVariables'
                        }
                    }
            }));
            */




            fields.push(this.utils.createCI('value',29,this.value,{
                    group:'General',
                    title:'Value',
                    dst:'value',
                    widget:{
                        allowACECache:true,
                        showBrowser:false,
                        showSaveButton:true,
                        editorOptions:{
                            showGutter:false,
                            autoSelect: false,
                            autoFocus: false,
                            hasConsole:false,
                            hasItemActions:function(){
                                return false
                            }
                        },
                        item:this
                    },
                    delegate:{
                        runExpression:function(val,run,error){
                            return thiz.scope.expressionModel.parse(thiz.scope,val,false,run,error);
                        }
                    }
            }));




            fields.push(utils.createCI('value','xcf.widgets.CommandPicker',this.variable,{
                group:'Variable',
                title:'Variable',
                dst:'variable',
                //options:this.scope.getVariablesAsOptions(),
                block:this,
                pickerType:'variable',
                value:this.variable,
                widget:{
                    store:this.scope.blockStore,
                    labelField:'name',
                    valueField:'id',
                    value:this.variable,
                    query:[
                        {
                            group:'basicVariables'
                        },
                        {
                            group:'processVariables'
                        }
                    ]

                }
            }));

            fields.push(this.utils.createCI('flags',5,this.flags,{
                group:'Variable',
                title:'Flags',
                dst:'flags',
                data:[
                    {
                        value: 0x00000002,
                        label: 'Publish to network',
                        title:"Publish to network in order to make a network variable"
                    },
                    {
                        value: 0x00000004,//2048
                        label: 'Publish if server',
                        title: 'Publish only on network if this is running server side'
                    }
                ],
                widget:{
                    hex:true
                }

            }));

            return fields;
        }
    });

    return Module;

});
define('xblox/model/Statement',[
    "dcl/dcl",
    "xblox/model/Block"
], function(dcl,Block){

    // summary:
    //		The statement block is only a wrapper for items like in 'else'

    // module:
    //		xblox.model.Statement
    return dcl(Block,{
        declaredClass:"xblox.model.Statement",
        /**
         * Return block name
         * @returns {name|*}
         */
        toText:function(){
            return this.name;
        },
        /**
         *
         * @returns {items|*}
         */
        getChildren:function(){
            return this.items;
        }
    });
});
define('xblox/model/logic/ElseIfBlock',[
    "dcl/dcl",
    "xblox/model/Block",
    "xblox/model/Contains"
], function(dcl,Block,Contains){

    // summary:
    //		The ElseIf Block model. Each ElseIf block contains a condition and a consequent to be run if the condition
    //          is true
    //
    //      This block should have an "IfBlock" parent

    // module:
    //		xblox.model.logic.ElseIfBlock
    return dcl([Block,Contains],{
        declaredClass:"xblox.model.logic.ElseIfBlock",
        //  condition: (String) expression to be evaluated
        condition: "",
        //  consequent: (Block) block to be run if the condition is true
        consequent:null,
        name:'else if',
        icon:'',
        solve:function(scope,settings) {
            if(this._checkCondition(scope)) {
                return this._solve(scope, settings)
            }
            return false;
        },
        toText:function(){
            return "<span class='text-primary'>" + this.getBlockIcon('E') + this.name + " </span>" +  "<span class='text-warning small'>" + (this.condition || "") +"<span>";
        },
        // checks the ElseIf condition
        _checkCondition:function(scope) {
            if(this.condition!==null) {
                var res = scope.parseExpression(this.condition);
                return res;
            }
            return false;
        },
        getFields:function(){

            var thiz=this;
            var fields = this.inherited(arguments) || this.getDefaultFields();
            fields.push(
                this.utils.createCI('condition',this.types.ECIType.EXPRESSION_EDITOR,this.condition,{
                    group:'General',
                    title:'Expression',
                    dst:'condition',
                    delegate:{
                        runExpression:function(val,run,error){
                            return thiz.scope.expressionModel.parse(thiz.scope,val,false,run,error);
                        }
                    }
                })
            );
            return fields;
        }
    });
});
/** @module xblox/model/logic/IfBlock **/
define('xblox/model/logic/IfBlock',[
    "dcl/dcl",
    "xblox/model/Block",
    "xblox/model/Statement",
    "xblox/model/logic/ElseIfBlock",
    "dojo/Deferred",
    "xide/utils"
], function(dcl,Block,Statement,ElseIfBlock,Deferred,utils){
    
    /**
     * Base block class.
     *
     * @class module:xblox/model/logic/IfBlock
     * @augments module:xblox/model/ModelBase
     * @extends module:xblox/model/Block
     */
    return dcl(Block,{
        declaredClass:"xblox.model.logic.IfBlock",
        // condition: (String) expression to be evaluated
        condition: 'Invalid Expression',

        // consequent: (Block) block to be run if the condition is true
        consequent:null,

        // elseIfBlocks: (optional) Array[ElseIfBlock] -> blocks to be run if the condition is false. If any of these blocks condition is
        //          true, the elseIf/else sequence stops
        elseIfBlocks:null,

        // alternate: (optional) (Block) -> block to be run if the condition is false and none of the "elseIf" blocks is true
        alternate: null,

        //  standard call from interface
        canAdd:function(){
            return [];
        },

        //  autoCreateElse : does auto creates the else part
        autoCreateElse:true,

        //  name : this name is displayed in the block row editor
        name:'if',

        icon:'',
        //  add
        //
        // @param proto {mixed : Prototype|Object} : the new block's call prototype or simply a ready to use block
        // @param ctrArgs {Array} : constructor arguments for the new block
        // @param where {String} : consequent or alternate or elseif
        // @returns {Block}
        //
        add:function(proto,ctrArgs,where){
            if(where==null){
                where = 'consequent';
            }
            return this._add(proto,ctrArgs,where,false);
        },

        //  overrides default store integration
        __addToStore:function(store){
            //add our self to the store
            store.put(this);
        },

        /**
         * Store function override
         * @param parent
         * @returns {boolean}
         */
        mayHaveChildren:function(parent){
            return (this.items !==null && this.items.length) ||
                (this.elseIfBlocks !==null && this.elseIfBlocks.length) ||
                (this.consequent!=null && this.consequent.length) ||
                (this.alternate!=null && this.alternate.length);

        },

        /**
         * Store function override
         * @param parent
         * @returns {Array}
         */
        getChildren:function(parent){
            var result=[];
            if(this.consequent){
                result=result.concat(this.consequent);
            }
            if(this.elseIfBlocks){
                result=result.concat(this.elseIfBlocks);
            }
            if(this.alternate){
                result=result.concat(this.alternate);
            }
            return result;
        },

        /**
         * Block row editor, returns the entire text for this block
         * @returns {string}
         */
        toText:function(){
            return "<span class='text-primary'>" + this.getBlockIcon('E') + this.name + " </span>" +  "<span class='text-warning small'>" + this.condition +"<span>";
        },
        _checkCondition:function(scope) {
            return scope.parseExpression(this.condition,null,null);
        },
        /***
         * Solves the if block
         * @param scope
         */
        solve:function(scope,settings) {
            // 1. Check the condition
            var solvedCondition = this._checkCondition(scope);
            var elseIfBlocks = this.getElseIfBlocks();
            var others = this.childrenByNotClass(ElseIfBlock);
            var result = null;

            others = others.filter(function(block){
               return !block.isInstanceOf(Statement);
            });

            // 2. TRUE? => run consequent
            if (solvedCondition==true || solvedCondition > 0) {
                this.onSuccess(this,settings);
                if(others && others.length ){
                    for(var i = 0;i <others.length ; i++){
                        result = others[i].solve(scope,settings);
                    }
                }
                return result;
            } else {
                // 3. FALSE?
                var anyElseIf = false;
                this.onFailed(this,settings);
                if (elseIfBlocks)
                {
                    // 4. ---- check all elseIf blocks. If any of the elseIf conditions is true, run the elseIf consequent and
                    //           stop the process
                    for( var n = 0;  ( n < elseIfBlocks.length ) && (!anyElseIf) ; n++){
                        var _elseIfBlock = elseIfBlocks[n];
                        if (_elseIfBlock._checkCondition(scope)){
                            _elseIfBlock.onSuccess(_elseIfBlock,settings);
                            anyElseIf = true;
                            return _elseIfBlock.solve(scope,settings);
                        }else{
                            _elseIfBlock.onFailed(_elseIfBlock,settings);
                        }
                    }
                }

                var alternate = this.childrenByClass(Statement);
                // 5. ---- If none of the ElseIf blocks has been run, run the alternate
                if (alternate.length > 0 && (!anyElseIf)){
                    result = null;
                    for(var i = 0;i <alternate.length ; i++){
                        result = alternate[i].solve(scope,settings);
                    }
                    return result;
                }
            }
            return [];
        },
        /**
         * Default override empty. We have 3 arrays to clean : items, alternate and consequent
         * @param what
         */
        empty:function(what){
            this._empty(this.alternate);
            this._empty(this.consequent);
            this._empty(this.elseIfBlocks);
        },
        /**
         * Deletes us or children block in alternate or consequent
         * @param what
         */
        removeBlock:function(what){
            if(what){
                if(what && what.empty){
                    what.empty();
                }
                delete what.items;
                what.parent=null;
                this.alternate.remove(what);
                this.consequent.remove(what);
                this.elseIfBlocks.remove(what);
            }
        },
        // evaluate the if condition
        _getContainer:function(item){
            if(this.consequent.indexOf(item)!=-1){
                return 'consequent';
            }else if(this.alternate.indexOf(item)!=-1){
                return 'alternate';
            }else if(this.elseIfBlocks.indexOf(item)!=-1){
                return 'elseIfBlocks';
            }
            return '_';
        },
        /**
         * Default override, prepare all variables
         */
        init:function(){
            this.alternate = this.alternate||[];
            this.consequent = this.consequent||[];
            this.elseIfBlocks = this.elseIfBlocks||[];

            for(var i = 0;i <this.alternate.length ; i++){
                this.alternate[i].parentId=this.id;
                this.alternate[i].parent=this;
            }
            for(var i = 0;i <this.elseIfBlocks.length ; i++){
                this.elseIfBlocks[i].parentId=this.id;
                this.elseIfBlocks[i].parent=this;
            }
            for(var i = 0;i <this.consequent.length ; i++){
                this.consequent[i].parentId=this.id;
                this.consequent[i].parent=this;
            }
            //var store = this.scope.blockStore;
        },
        getFields:function(){
            var thiz=this;
            var fields = this.inherited(arguments) || this.getDefaultFields();
            fields.push(
                this.utils.createCI('condition',this.types.ECIType.EXPRESSION_EDITOR,this.condition,{
                    group:'General',
                    title:'Expression',
                    dst:'condition',
                    delegate:{
                        runExpression:function(val,run,error){
                            return thiz.scope.expressionModel.parse(thiz.scope,val,false,run,error);
                        }
                    }
                })
            );
            return fields;
        },
        postCreate:function(){
            if(this._postCreated){
                return;
            }
            this._postCreated = true;
            var store = this.scope.blockStore;
        },
        toCode:function(lang,params){},
        getElseIfBlocks:function(){
            return this.childrenByClass(ElseIfBlock);
        },
        runAction:function(action){
            var store = this.scope.blockStore;
            var command = action.command;
            if(command==='New/Else' || command ==='New/Else If'){
                var newBlockClass = command ==='New/Else If' ? ElseIfBlock : Statement;
                var args = utils.mixin({
                    name:'else',
                    items:[],
                    dstField:'alternate',
                    parentId:this.id,
                    parent:this,
                    scope:this.scope,
                    canAdd:function(){
                        return [];
                    },
                    canEdit:function(){
                        return false;
                    }
                }, newBlockClass == ElseIfBlock ? { name:'else if', dstField:'elseIfBlocks' } : {
                    name:'else', dstField:'alternate'}
                );

                var newBlock = this.add(newBlockClass,args, newBlockClass == Statement ? 'alternate' : 'elseIfBlocks');
                var defaultDfdArgs = {
                    select: [newBlock],
                    focus: true,
                    append: false,
                    expand:true,
                    delay:10
                };
                var dfd = new Deferred();
                store._emit('added',{
                    target:newBlock
                });
                dfd.resolve(defaultDfdArgs);
                newBlock.refresh();
                return dfd;
            }
        },
        getActions:function(){
            var result = [];
            if(this.alternate.length==0) {
                result.push(this.createAction({
                    label: 'Else',
                    command: 'New/Else',
                    icon: this.getBlockIcon('I'),
                    tab: 'Home',
                    group: 'File',
                    mixin: {
                        addPermission: true,
                        custom: true
                    }
                }));
            }
            result.push(this.createAction({
                label: 'Else If',
                command: 'New/Else If',
                icon: this.getBlockIcon('I'),
                tab: 'Home',
                group: 'File',
                mixin: {
                    addPermission: true,
                    custom: true
                }
            }));
            return result;
        }
    });
});
define('xblox/model/logic/DefaultBlock',[
    'dcl/dcl',
    'xide/utils',
    'xide/types',
    'xblox/model/Block'
], function(dcl,utils,types,Block){

    // summary:
    //		The Case Block model. Each case block contains a comparation and a commands block.
    //      If the comparation result is true, the block is executed
    //
    //      This block should have an "SwitchBlock" parent

    // module:
    //		xblox.model.logic.CaseBlock
    return dcl(Block,{
        declaredClass:"xblox.model.logic.DefaultBlock",
        name:'Default',
        icon:'',
        hasInlineEdits:false,
        toText:function(){
            return '&nbsp;<span class="fa-eject text-info"></span>&nbsp;&nbsp;<span>' + this.name + '</span>';
        },
        solve:function(scope,settings) {
            this.onSuccess(this, settings);
            return this._solve(scope, settings);
        },
        //  standard call for editing
        getFields:function(){
            var fields = this.inherited(arguments) || this.getDefaultFields();
            return fields;
        }
    });
});
/** @module xblox/model/logic/SwitchBlock **/
define('xblox/model/logic/SwitchBlock',[
    'dcl/dcl',
    "xblox/model/Block",
    "xblox/model/logic/CaseBlock",
    "xblox/model/logic/DefaultBlock",
    "dojo/Deferred"
], function(dcl,Block,CaseBlock,DefaultBlock,Deferred){
    /**
     *
     * @class module:xblox/model/logic/SwitchBlock
     * @extends module:xblox/model/Block
     */
    return dcl(Block,{
        declaredClass:"xblox.model.logic.SwitchBlock",
        items:null,
        name:'Switch',
        icon:null,
        toText:function(){
            return this.getBlockIcon('H')  + this.name + ' ';
        },
        canAdd:function(){
            return [];
        },
        getFields:function() {
            return this.getDefaultFields(false,false);
        },
        /***
         * Solve the switchblock
         *
         * @param scope
         * @returns {string} execution result
         */
        solve:function(scope,settings) {
            this._stopped = false;
            var anyCase = false;    // check if any case is reached
            var ret = [];
            this.onSuccess(this,settings);
            // iterate all case blocks
            for(var n = 0; n < this.items.length ; n++)
            {
                var block = this.items[n];

                if (block.declaredClass==='xblox.model.logic.CaseBlock'/* instanceof CaseBlock*/)
                {
                    var caseret;
                    // solve each case block. If the comparison result is false, the block returns "false"
                    caseret = block.solve(scope,this,settings);
                    if (caseret != false)
                    {

                        // If the case block return is not false, don't run "else" block
                        anyCase = true;
                        this.addToEnd( ret , caseret);
                        break;
                    }
                }
                if(this._stopped){
                    break;
                }
            }
            // iterate all "else" blocks if none of the cases occurs
            if (!anyCase) {
                for(var n = 0; n < this.items.length ; n++)
                {
                    var block = this.items[n];
                    if ( !(block.declaredClass=='xblox.model.logic.CaseBlock') ){
                        this.addToEnd( ret , block.solve(scope,settings) );
                    }
                }
            }
            return ret;
        },
        init:function(){

        },
        /**
         * Store function override
         * @param parent
         * @returns {Array}
         */
        getChildren:function(parent){
            return this.items;
        },
        stop:function(){
            this._stopped = true;
        },
        runAction:function(action){
            var command = action.command;
            if(command==='New/Case' || action.command==='New/Default'){
                var store = this.scope.blockStore;
                var dfd = new Deferred();
                var newBlock = null;

                switch (command){
                    case 'New/Case':{
                        newBlock = this.add(CaseBlock,{
                            comparator : "==",
                            expression : "on",
                            group:null
                        });
                        break;
                    }
                    case 'New/Default':{
                        newBlock = this.add(DefaultBlock,{
                            group:null
                        });
                        break;
                    }
                }

                dfd.resolve({
                    select: [newBlock],
                    focus: true,
                    append: false
                });
                newBlock.refresh();
                store._emit('added',{
                    target:newBlock
                });
            }
        },
        getActions:function(permissions,owner){
            var result = [this.createAction({
                label: 'New Case',
                command: 'New/Case',
                icon: this.getBlockIcon('I'),
                tab: 'Home',
                group: 'File',
                mixin: {
                    addPermission: true,
                    custom:true,
                    quick:false
                }
            })];

            if(!_.find(this.items,{ declaredClass:'xblox.model.logic.DefaultBlock'})){
                result.push(this.createAction({
                    label: 'Default',
                    command: 'New/Default',
                    icon: 'fa-eject',
                    tab: 'Home',
                    group: 'File',
                    mixin: {
                        addPermission: true,
                        custom:true,
                        quick:false
                    }
                }));
            }
            return result;
        }
    });
});
/** @module xblox/model/variables/VariableSwitch **/
define('xblox/model/variables/VariableSwitch',[
    'dcl/dcl',
    "xblox/model/logic/SwitchBlock",
    'xide/types',
    "xblox/model/logic/CaseBlock",
    "xblox/model/logic/DefaultBlock",
    "dojo/Deferred"
], function(dcl,SwitchBlock,types,CaseBlock,DefaultBlock,Deferred){
    /**
     *
     * The switch command model. These kind of commands takes a existing variable and applies some comparison.
     * Depending on the comparison results, the code into each case block is executed or not.
     * @class module:xblox/model/variables/VariableSwitch
     * @extends module:xblox/model/Block
     */
    return dcl(SwitchBlock,{
        declaredClass:"xblox.model.variables.VariableSwitch",
        name:'Switch on Variable',
        icon:'',
        variable:"PowerState",
        toText:function(){
            var _variable = this.scope.getVariableById(this.variable);
            var _text = _variable ? _variable.name : '';
            return this.getBlockIcon('H')  + this.name + ' ' + _text;
        },
        //  standard call for editing
        getFields:function(){
            //options:this.scope.getVariablesAsOptions(),
            var fields = this.getDefaultFields(false,false);
            fields = fields.concat([
                this.utils.createCI('Variable',3,this.variable,
                    {
                        group:'General',
                        widget:{
                            store:this.scope.blockStore,
                            labelField:'name',
                            valueField:'id',
                            query:[
                                {
                                    group:'basicVariables'
                                },
                                {
                                    group:'processVariables'
                                }
                            ]

                        },
                        dst:'variable'
                    }
                )
            ]);
            return fields;
        }
    });
});
define('xblox/model/Referenced',[
    'dcl/dcl',
    "dojo/_base/declare",
    "xide/mixins/ReferenceMixin",
    "xide/utils"
], function (dcl,declare, ReferenceMixin,utils) {
    var Implementation = {
        /**
         * JSON String in that format : reference(string) | mode (string)
         */
        reference: null,
        /**
         * 'reference' is a JSON structure
         * @param value
         * @returns {*}
         */
        deserialize: function (value) {
            if (!value || value.length == 0) {
                return {};
            }
            try {
                return utils.fromJson(value);
            } catch (e) {
                return {};
            }
        }
    };
    /**
     * Holds information to locate an object by string or direct reference.
     * This must be used as mixin rather as base class!
     */
    var Module = declare('xblox.model.Referenced', [ReferenceMixin],Implementation);
    Module.dcl = dcl(ReferenceMixin.dcl,Implementation);
    return Module;
});
define('xblox/model/events/OnEvent',[
    'dcl/dcl',
    "dojo/_base/lang",
    "dojo/Deferred",
    "xblox/model/Block",
    'xide/utils',
    'xide/types',
    'xide/mixins/EventedMixin',
    'xblox/model/Referenced',
    'xide/registry',
    'dojo/on',
    'xwire/_Base'
], function(dcl,lang,Deferred,Block,utils,types,EventedMixin,Referenced,registry,on,_Base){




    // summary:
    //		The Call Block model.
    //      This block makes calls to another blocks in the same scope by action name

    // module:
    //		xblox.model.code.CallMethod
    return dcl([Block,EventedMixin.dcl,Referenced.dcl,_Base],{
        declaredClass:"xblox.model.events.OnEvent",
        //method: (String)
        //  block action name
        name:'On Event',
        event:'',
        reference:'',
        references:null,
        sharable:true,
        _didSubscribe:false,
        filterPath:"item.name",
        filterValue:"",
        valuePath:"item.value",
        _nativeEvents:[
            "onclick",
            "ondblclick",
            "onmousedown",
            "onmouseup",
            "onmouseover",
            "onmousemove",
            "onmouseout",
            "onkeypress",
            "onkeydown",
            "onkeyup",
            "onfocus",
            "onblur",
            "onchange"
        ],

        stop:function(){

            this._destroy();

        },
        /***
         * Returns the block run result
         * @param scope
         * @param settings
         * @param run
         * @param error
         * @returns {Array}
         */
        solve:function(scope,settings,isInterface,error) {

            if(isInterface){
                this._destroy();
            }

            settings = this._lastSettings = settings || this._lastSettings;

            if(!this._didSubscribe){
                this._registerEvent(this.event);
                this.onSuccess(this, settings);
                return false;
            }

            this.onSuccess(this, settings);

            this._currentIndex=0;
            this._return=[];

            var ret=[], items = this[this._getContainer()];
            if(items.length) {
                //console.log('solve ',settings);
                var res = this.runFrom(items,0,settings);
                this.onSuccess(this, settings);
                return res;
            }else{
                this.onSuccess(this, settings);
            }
            return ret;
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  UI
        //
        /////////////////////////////////////////////////////////////////////////////////////
        toText:function(){
            var result = this.getBlockIcon() + ' ' + this.name + ' :: ';
            if(this.event){
                result+= this.event;
            }
            return result;
        },

        //  standard call from interface
        canAdd:function(){
            return [];
        },

        //  standard call for editing
        getFields:function(){
            var fields = this.inherited(arguments) || this.getDefaultFields();
            var thiz=this;

            var _ref = this.deserialize(this.reference);
            var isNative = utils.contains(this._nativeEvents,this.event)>-1;
            var options = null;
            if(!isNative){
                options = this.scope.getEventsAsOptions(this.event);
            }else{

                options = [
                    {label:"onclick", value:"onclick"},
                    {label:"ondblclick",value:"ondblclick"},
                    {label:"onmousedown",value:"onmousedown"},
                    {label:"onmouseup",value:"onmouseup"},
                    {label:"onmouseover",value:"onmouseover"},
                    {label:"onmousemove",value:"onmousemove"},
                    {label:"onmouseout",value:"onmouseout"},
                    {label:"onkeypress",value:"onkeypress"},
                    {label:"onkeydown",value:"onkeydown"},
                    {label:"onkeyup",  value:"onkeyup"},
                    {label:"onfocus",  value:"onfocus"},
                    {label:"onblur",  value:"onblur"},
                    {label:"onchange",  value:"onchange"}
                ];

                //select the event we are listening to
                for (var i = 0; i < options.length; i++) {
                    var obj = options[i];
                    if(obj.value===this.event){
                        obj.selected=true;
                        break;
                    }
                }
            }


            fields.push(utils.createCI('Event',types.ECIType.ENUMERATION,this.event,{
                group:'General',
                options:options,
                dst:'event',
                widget:{
                    search:true
                }
            }));

            fields.push(utils.createCI('Filter Path',13,this.filterPath,{
                group:'General',
                dst:'filterPath'
            }));

            fields.push(utils.createCI('Filter Value',13,this.filterValue,{
                group:'General',
                dst:'filterValue'
            }));

            fields.push(utils.createCI('Value Path',13,this.valuePath,{
                group:'General',
                dst:'valuePath'
            }));


            fields.push(utils.createCI('Object/Widget',types.ECIType.WIDGET_REFERENCE,this.reference,{
                group:'Widget',
                dst:'reference',
                value:this.reference
            }));
            return fields;
        },

        getBlockIcon:function(){
            return '<span class="fa-bell"></span>';
        },
        onEvent:function(evt){

            this._lastResult=evt;

            /*
            if(this.scope && evt.scope && evt.scope!==this.scope){
                return;
            }*/

            if(this.filterPath && this.filterValue){
                var value = this.getValue(evt,this.filterPath);
                if(value && this.filterValue !==value){
                    return;
                }
            }

            var eventValue = null;
            if(this.valuePath){

                if(!this._lastSettings){
                    this._lastSettings = {};
                }
                eventValue = this.getValue(evt,this.valuePath);
                if(eventValue!==null){
                    !this._lastSettings.override && (this._lastSettings.override = {});
                    this._lastSettings.override.args = [eventValue];
                }
            }

            //console.log('on event ',this._lastSettings);
            this.solve(this.scope,this._lastSettings);
        },
        _subscribe:function(evt,handler,obj){

            if(!evt){
                return;
            }
            var isNative = utils.contains(this._nativeEvents,evt);
            if(isNative==-1){

                if(this.__events && this.__events[evt]) {
                    var _handles = this.__events[evt];

                    _.each(_handles, function (e) {
                        this.unsubscribe(e.type, e.handler);
                        e.remove();
                    }, this);

                    _.each(_handles, function (e) {
                        this.__events[evt].remove(e);
                    }, this);
                }

                this.subscribe(evt, this.onEvent);
            }else{

                if(obj) {
                    var _event = evt.replace('on', ''),
                        thiz = this;

                    var handle = on(obj, _event, function (e) {
                        thiz.onEvent(e)
                    });
                    console.log('wire native event : ' + _event);
                    this._events.push(handle);
                }

            }

        },
        _registerEvent:function(evt){

            try {
                if (!evt || !evt.length) {
                    return;
                }
                console.log('register event : ' + evt + ' for ' + this.reference);
                var objects = this.resolveReference(this.deserialize(this.reference));
                var thiz = this;
                if (objects && objects.length) {
                    for (var i = 0; i < objects.length; i++) {
                        var obj = objects[i];

                        //try widget
                        if (obj && obj.id) {
                            var _widget = registry.byId(obj.id);
                            if (_widget && _widget.on) {
                                var _event = this.event.replace('on', '');
                                console.log('found widget : ' + obj.id + ' will register event ' + _event);
                                var _handle = _widget.on(_event, lang.hitch(this, function (e) {
                                    console.log('event triggered : ' + thiz.event);
                                    thiz.onEvent(e);
                                }));
                                this._events.push(_handle);
                            } else {

                                this._subscribe(evt, this.onEvent, obj);
                            }
                        } else {

                            this._subscribe(evt, this.onEvent, obj);
                        }
                    }
                    console.log('objects found : ', objects);
                } else {
                    this._subscribe(evt, this.onEvent);
                }
            }catch(e){
                logError(e,'registering event failed');
            }
            this._didSubscribe=evt;
        },
        onLoad:function(){
            this._onLoaded=true;
            if(this.event && this.event.length && this.enabled){
                this._registerEvent(this.event);
            }
        },
        updateEventSelector:function(objects,cis){

            var options = [];

            if(!objects || !objects.length){
                options= this.scope.getEventsAsOptions(this.event);
            }else{

                options = [{label:"onclick", value:"onclick"},
                    {label:"ondblclick",value:"ondblclick"},
                    {label:"onmousedown",value:"onmousedown"},
                    {label:"onmouseup",value:"onmouseup"},
                    {label:"onmouseover",value:"onmouseover"},
                    {label:"onmousemove",value:"onmousemove"},
                    {label:"onmouseout",value:"onmouseout"},
                    {label:"onkeypress",value:"onkeypress"},
                    {label:"onkeydown",value:"onkeydown"},
                    {label:"onkeyup",  value:"onkeyup"},
                    {label:"onfocus",  value:"onfocus"},
                    {label:"onblur",  value:"onblur"},
                    {label:"onchange",  value:"onchange"}];

                //select the event we are listening to
                for (var i = 0; i < options.length; i++) {
                    var obj = options[i];
                    if(obj.value===this.event){
                        obj.selected=true;
                        break;
                    }
                }
            }

            for (var i = 0; i < cis.length; i++) {
                var ci = cis[i];
                if(ci['widget'] && ci['widget'].title==='Event'){
                    //console.log('event!');
                    var widget = ci['_widget'];
                    widget.nativeWidget.set('options',options);
                    widget.nativeWidget.reset();
                    widget.nativeWidget.set('value',this.event);
                    this.publish(types.EVENTS.RESIZE,{});
                    break;
                }
            }
        },
        onReferenceChanged:function(newValue,cis){

            this._destroy();//unregister previous event(s)

            this.reference = newValue;
            var objects = this.resolveReference(this.deserialize(newValue));
            this.updateEventSelector(objects,cis);
            this._registerEvent(this.event);

        },
        onChangeField:function(field,newValue,cis){

            if(field=='event'){
                this._destroy();    //unregister previous event
                if(this._onLoaded){ // we've have been activated at load time, so re-register our event
                    this.event = newValue;
                    this._registerEvent(newValue);
                }
            }
            if(field=='reference'){
                this.onReferenceChanged(newValue,cis);
            }

            this.inherited(arguments);
        },
        activate:function(){
            this._destroy();//you never know
            this._registerEvent(this.event);
        },
        deactivate:function(){
            this._destroy();
        },
        _destroy:function(){

            if(!this._events){this._events=[];}
            _.each(this._events, dojo.unsubscribe);
            this.unsubscribe(this.event,this.onEvent);
            this._lastResult=null;
            this._didSubscribe = false;
        }
    });
});
define('xblox/model/events/OnKey',[
    'dcl/dcl',
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/Deferred",
    "xblox/model/Block",
    'xide/utils',
    'xide/types',
    'xide/mixins/EventedMixin',
    'xblox/model/Referenced',
    'xblox/model/Contains',
    'xblox/model/events/OnEvent',
    'xide/registry',
    'dojo/on'
], function(dcl,lang,array,Deferred,Block,utils,types,EventedMixin,Referenced,Contains,OnEvent,registry,on){

    // summary:
    //		The Call Block model.
    //      This block makes calls to another blocks in the same scope by action name

    // module:
    //		xblox.model.code.CallMethod
    return dcl([Block,EventedMixin.dcl,Referenced.dcl,Contains],{
        declaredClass:"xblox.model.events.OnKey",
        //method: (String)
        //  block action name
        name:'On Key',

        event:'',

        reference:'',

        references:null,

        description:'Triggers when a keyboard sequence ' + this.event +' has been entered',

        listeners:null,

        sharable:true,
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  UI
        //
        /////////////////////////////////////////////////////////////////////////////////////
        toText:function(){

            var result = this.getBlockIcon() + ' ' + this.name + ' :: ';
            if(this.event){
                result+= this.event;
            }
            return result;
        },

        //  standard call from interface
        canAdd:function(){
            return [];
        },

        //  standard call for editing
        getFields:function(){
            var fields = this.inherited(arguments) || this.getDefaultFields();

            fields.push(utils.createCI('Keyboard Sequence',types.ECIType.STRING,this.event,{
                group:'General',
                dst:'event',
                value:this.event,
                intermediateChanges:false
            }));

            fields.push(utils.createCI('Object/Widget',types.ECIType.WIDGET_REFERENCE,this.reference,{
                group:'General',
                dst:'reference',
                value:this.reference
            }));
            return fields;
        },
        getBlockIcon:function(){
            return '<span class="fa-keyboard-o"></span>';
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Store
        //
        /////////////////////////////////////////////////////////////////////////////////////
        onEvent:function(evt){
            this._lastResult=evt;
            this.solve(this.scope,this._lastRunSettings);

        },
        _addListerner:function(keys,handler,obj){
            if(this.listeners==null){
                this.listeners=[];
            }

            var my_defaults = {
                is_unordered    : true,
                prevent_repeat  : false,
                prevent_default : false,
                on_keyup:function(e){
                    console.log('up');
                },
                on_keydown:function(e){
                    console.log('down');
                },
                on_release:function(e){
                    console.log('release');
                }
            };
            var listener =null;
            listener = new window.keypress.Listener(obj, my_defaults);
            listener.simple_combo(keys, function(e) {
                if(handler){
                    handler(arguments);
                }
            });

            this.listeners.push(listener);
        },
        _subscribe:function(keys,handler,obj){

            if(!keys){
                return;
            }

            if(obj && obj.domNode){
                obj = obj.domNode;
            }

            this._addListerner(keys,handler,obj);

        },
        _registerEvent:function(evt){

            if(!evt || !evt.length){
                return;
            }
            var objects = this.resolveReference(this.deserialize(this.reference));
            var thiz=this;
            if (objects && objects.length) {
                for (var i = 0; i < objects.length; i++) {
                    var obj = objects[i];
                    //try widget
                    if (obj && obj.id) {
                        var _widget = registry.byId(obj.id);
                        _widget=null;
                        if (_widget && _widget.on) {
                            var _event = this.event.replace('on','');
                            var _handle = _widget.on(_event,lang.hitch(this,function(e){
                                thiz.onEvent(e);
                            }));
                            this._events.push( _handle);
                        }else{

                            this._subscribe(evt, function(){thiz.onEvent(arguments)},obj);
                        }
                    }else{

                        this._subscribe(evt, function(){thiz.onEvent(arguments)},obj);
                    }
                }
            }else{
                this._subscribe(evt, function(){thiz.onEvent(arguments)});
            }
        },
        onLoad:function(){

            this._onLoaded=true;

            if(this.event && this.event.length && this.enabled){

                this._registerEvent(this.event);
            }
        },
        destroy:function(){
            this.inherited(arguments);
        },
        updateEventSelector:function(objects,cis){

            var options = [];

            if(!objects || !objects.length){
                options= this.scope.getEventsAsOptions(this.event);
            }else{

                options = [{label:"onclick", value:"onclick"},
                    {label:"ondblclick",value:"ondblclick"},
                    {label:"onmousedown",value:"onmousedown"},
                    {label:"onmouseup",value:"onmouseup"},
                    {label:"onmouseover",value:"onmouseover"},
                    {label:"onmousemove",value:"onmousemove"},
                    {label:"onmouseout",value:"onmouseout"},
                    {label:"onkeypress",value:"onkeypress"},
                    {label:"onkeydown",value:"onkeydown"},
                    {label:"onkeyup",  value:"onkeyup"},
                    {label:"onfocus",  value:"onfocus"},
                    {label:"onblur",  value:"onblur"},
                    {label:"onchange",  value:"onchange"}];

                //select the event we are listening to
                for (var i = 0; i < options.length; i++) {
                    var obj = options[i];
                    if(obj.value===this.event){
                        obj.selected=true;
                        break;
                    }
                }
            }

            for (var i = 0; i < cis.length; i++) {
                var ci = cis[i];
                if(ci['widget'] && ci['widget'].title==='Event'){
                    //console.log('event!');
                    var widget = ci['_widget'];
                    widget.nativeWidget.set('options',options);
                    widget.nativeWidget.reset();
                    widget.nativeWidget.set('value',this.event);
                    this.publish(types.EVENTS.RESIZE,{});
                    break;
                }
            }
        },
        onReferenceChanged:function(newValue,cis){

            this._destroy();//unregister previous event(s)

            this.reference = newValue;
            var objects = this.resolveReference(this.deserialize(newValue));
            this._registerEvent(this.event);

        },
        onChangeField:function(field,newValue,cis){

            if(field=='event'){
                this._destroy();    //unregister previous event
                if(this._onLoaded){ // we've have been activated at load time, so re-register our event
                    this.event = newValue;
                    this._registerEvent(newValue);
                }
            }
            if(field=='reference'){
                this.onReferenceChanged(newValue,cis);
            }

            this.inherited(arguments);
        },
        activate:function(){
            this._destroy();//you never know
            this._registerEvent(this.event);
        },
        deactivate:function(){
            this._destroy();
        },
        _destroy:function(){

            if(this.listeners){

                for (var i = 0; i < this.listeners.length; i++) {
                    var obj = this.listeners[i];
                    obj.stop_listening();
                    var combos = obj.get_registered_combos();
                    if(combos){
                        obj.unregister_many(combos);
                    }
                    obj.reset();

                    console.log('did destroy listener');

                }
            }
            this.listeners=[];
        },
        onFieldsRendered:function(block,cis){}


    });
});
define('xblox/model/logging/Log',[
    'dcl/dcl',
    "dojo/Deferred",
    "xblox/model/Block",
    'xide/utils',
    'xide/types',
    'xide/mixins/EventedMixin'
], function(dcl,Deferred,Block,utils,types,EventedMixin){

    // summary:
    //		The Call Block model.
    //      This block makes calls to another blocks in the same scope by action name

    // module:
    //		xblox.model.code.CallMethod
    return dcl([Block,EventedMixin.dcl],{
        declaredClass:"xblox.model.logging.Log",
        //method: (String)
        //  block action name
        name:'Log Message',
        level:'info',
        message:'return "Message: " + arguments[0];',
        _type:'XBlox',
        host:'this host',
        sharable:true,
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  UI
        //
        /////////////////////////////////////////////////////////////////////////////////////
        toText:function(){

            var _cls = 'text-primary';
            switch (this.level){
                case 'info':{
                    _cls = 'text-info';
                    break;
                }
                case 'warn':{
                    _cls = 'text-warning';
                    break;
                }
                case 'error':{
                    _cls = 'text-danger';
                    break;
                }

            }

            var result = this.getBlockIcon() + " " + this.name + " : " + "<span class='" + _cls + " small'> " + ' :: ';
            if(this.message){
                result+= this.message;
            }
            return result +"</span>";
        },
        /***
         * Returns the block run result
         * @param expression
         * @param scope
         * @param settings
         * @param run
         * @param error
         * @returns {string}
         */
        _solveExpression:function(expression,scope,settings,run,error) {

            var _script = '' + expression;
            var thiz=this;

            if(_script && _script.length) {


                //var _function = new Function("{" + _script + "}");
                _script = utils.convertAllEscapes(_script,"none");
                var _args = this.getArgs();
                try {
                    //var _parsed = _function.apply(this, _args || {});
                    var _parsed =  scope.parseExpression(_script,null,null,null,null,this,_args);
                    if(run){
                        run('Expression ' + _script + ' evaluates to ' + _parsed);
                    }
                    return _parsed;
                } catch (e) {
                    if(error){
                        error('invalid expression : \n' + _script + ': ' + e);
                    }
                    this.onFailed(this, settings);
                    return _script;
                }
            }else{
                console.error('have no script');
            }
            return _script;
        },
        /**
         *
         * @param scope
         * @param settings
         * @param run
         * @param error
         */
        solve:function(scope,settings,run,error) {

            console.log('-log');

            var dfd = new Deferred();
            var device = scope.device;
            var _message=this._solveExpression(this.message,scope,settings,run,error);
            var message={
                message:_message,
                level:this.level,
                type:this._type,
                details:this.getArgs(),
                time:new Date().getTime(),
                data:{
                    device : device ? device.info : null
                },
                write:true
            };

            this.onSuccess(this,settings);

            dfd.resolve(_message);

            try {
                this.publish(types.EVENTS.ON_SERVER_LOG_MESSAGE, message);
            }catch(e){
                this.onFailed(this,settings);
            }

            return dfd;

        },
        //  standard call from interface
        canAdd:function(){
            return null;
        },
        //  standard call for editing
        getFields:function(){
            var fields = this.inherited(arguments) || this.getDefaultFields();
            var thiz=this;

            var options = [
                {
                    value:'info',
                    label:'Info'
                },
                {
                    value:'warn',
                    label:'Warning'
                },
                {
                    value:'error',
                    label:'Error'
                },
                {
                    value:'debug',
                    label:'Debug'
                },
                {
                    value:'help',
                    label:'Help'
                },
                {
                    value:'verbose',
                    label:'verbose'
                },
                {
                    value:'silly',
                    label:'Silly'
                }
            ];

            fields.push(utils.createCI('Level',3,this.level,{
                group:'General',
                options:options,
                dst:'level'
            }));

            fields.push(
                utils.createCI('message',25,this.message,{
                    group:'General',
                    title:'Message',
                    dst:'message',
                    delegate:{
                        runExpression:function(val,run,error){
                            var _res = thiz._solveExpression(val,thiz.scope,null,run,error);
                        }
                    }
                }));

            fields.push(

                utils.createCI('message',13,this._type,{
                    group:'General',
                    title:'Type',
                    dst:'_type'
                }));

            return fields;
        },
        getBlockIcon:function(){
            return '<span class="fa-bug"></span>';
        }
    });
});
/** @module xblox/model/html/SetStyle **/
define('xblox/model/html/SetStyle',[
    "dcl/dcl",
    "xblox/model/Block",
    'xide/utils',
    'xide/types',
    'xide/mixins/EventedMixin',
    'xblox/model/Referenced',
    "dojo/dom-attr",
    "dojo/dom-style",
    "dojo/_base/Color",
    "xide/registry"
], function(dcl,Block,utils,types,EventedMixin,Referenced,domAttr,domStyle,Color,registry){

    var debug = false;
    /**
     *
     * @class module:xblox/model/html/SetStyle
     * @extends module:xblox/model/Block
     */
    var Impl = {
        declaredClass:"xblox.model.html.SetStyle",
        name:'Set Style',
        reference:'',
        references:null,
        description:'Sets HTML Node Style Attribute',
        value:'',
        mode:1,
        sharable:true,
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  UI
        //
        /////////////////////////////////////////////////////////////////////////////////////
        /**
         *
         * @param params (object in that format : reference(string) | mode (string))
         */
        /**
         * Run this block
         * @param scope
         * @param settings
         */
        solve:function(scope,settings) {
            debug && console.log('-set style solve');
            var value = this.value;
            settings = settings || {};
            var override = settings.override || this.override || {};

            if(override.variables){
                value = utils.replace(value,null,override.variables,{
                    begin:'{',
                    end:'}'
                });
            }

            if(override.args && override.args[0]!==null){
                value = utils.replace(value,null,{value:override.args[0]},{
                    begin:'{',
                    end:'}'
                });
            }
            this.updateObjects(null,value,this.mode,settings);
            this.onSuccess(this,settings);
            this.onDidRun();
        },
        /**
         * Get human readable string for the UI
         * @returns {string}
         */
        toText:function(){
            var _ref = this.deserialize(this.reference);
            var result = this.getBlockIcon() + ' ' + this.name + ' :: on ' + _ref.reference + ' to' || ' ' + ' to ';
            if(this.value){
                result+= ' ' + this.value;
            }
            return result;
        },
        /**
         * Standard call when editing this block
         * @returns {*}
         */
        getFields:function(){
            var fields = this.inherited(arguments) || this.getDefaultFields();

            fields.push(utils.createCI('Value',types.ECIType.DOM_PROPERTIES,this.value,{
                group:'General',
                dst:'value',
                value:this.value,
                intermediateChanges:false
            }));

            fields.push(utils.createCI('Mode',types.ECIType.ENUMERATION,this.mode,{
                group:'General',
                options:[
                    utils.createOption('Set',1),
                    utils.createOption('Add',2),
                    utils.createOption('Remove',3),
                    utils.createOption('Increase',4),
                    utils.createOption('Decrease',5)
                ],
                dst:'mode'
            }));


            var referenceArgs = {
                group:'General',
                dst:'reference',
                value:this.reference
            };

            if(this.scope){
                if(this.scope.global) {

                    referenceArgs.window = this.scope.global;
                    referenceArgs.allowHTMLNodes = true;
                    referenceArgs.allowWidgets = false;

                }
                if(this.scope.document) {
                    referenceArgs.document = this.scope.document;
                }
            }

            fields.push(utils.createCI('Target',types.ECIType.WIDGET_REFERENCE,this.reference,referenceArgs));

            return fields;
        },
        getBlockIcon:function(){
            return '<span class="fa-paint-brush"></span>';
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Lifecycle
        //
        /////////////////////////////////////////////////////////////////////////////////////
        updateEventSelector:function(objects,cis){
            var options = [];
            if(!objects || !objects.length){
                options= this.scope.getEventsAsOptions(this.event);
            }else{
                options = [{label:"onclick", value:"onclick"},
                    {label:"ondblclick",value:"ondblclick"},
                    {label:"onmousedown",value:"onmousedown"},
                    {label:"onmouseup",value:"onmouseup"},
                    {label:"onmouseover",value:"onmouseover"},
                    {label:"onmousemove",value:"onmousemove"},
                    {label:"onmouseout",value:"onmouseout"},
                    {label:"onkeypress",value:"onkeypress"},
                    {label:"onkeydown",value:"onkeydown"},
                    {label:"onkeyup",  value:"onkeyup"},
                    {label:"onfocus",  value:"onfocus"},
                    {label:"onblur",  value:"onblur"},
                    {label:"onchange",  value:"onchange"}];

                //select the event we are listening to
                for (var i = 0; i < options.length; i++) {
                    var obj = options[i];
                    if(obj.value===this.event){
                        obj.selected=true;
                        break;
                    }
                }
            }

            for (var i = 0; i < cis.length; i++) {
                var ci = cis[i];
                if(ci['widget'] && ci['widget'].title==='Event'){
                    var widget = ci['_widget'];
                    widget.nativeWidget.set('options',options);
                    widget.nativeWidget.reset();
                    widget.nativeWidget.set('value',this.event);
                    this.publish(types.EVENTS.RESIZE,{});
                    break;
                }
            }
        },
        onReferenceChanged:function(newValue,cis,settings){
            this.reference = newValue;
            this.references = this.resolveReference(this.deserialize(newValue),settings);
            this.updateObjects(this.references,this.value,null,settings);
        },
        getPropValue:function(stylesObject,prop){
            for (var _prop in stylesObject) {
                if(_prop === prop){
                    return stylesObject[_prop];
                }
            }
            return null;
        },
        _getStyle:function(name,obj,jObj){
            switch (name){
                case "height":{
                    return jObj.outerHeight();
                }
                case "width":{
                    return jObj.outerWidth();
                }
                case "color":{
                    return jObj.css("color");
                }
                case "border-color":{
                    return jObj.css("border-color") || "rgba(0,0,0,0)";
                }
            }

            return null;
        },
        updateObject:function(obj,style,mode,settings){
            if(!obj){
                return false;
            }
            mode = mode || 1;

            var _obj = obj.id ? registry.byId(obj.id) : null;
            if(_obj){
                obj = _obj;
            }

            if(obj.domNode!=null){
                obj = obj.domNode;
            }
            var currentStyle = domAttr.get(obj,'style');
            if(currentStyle===";"){
                currentStyle="";
            }
            if(currentStyle===""){
                if(obj['lastStyle']!=null){
                    currentStyle = obj['lastStyle'];
                }else {
                    currentStyle = style;
                }
            }

            if(currentStyle===";"){
                currentStyle=style;
            }
            switch (mode){
                //set
                case 1:{

                    var currentStyleMap = this._toObject(currentStyle);
                    var props = style.split(';');
                    var css={};
                    for (var i = 0; i < props.length; i++) {
                        var _style = props[i].split(':');
                        if(_style.length==2){
                            currentStyleMap[_style[0]]=_style[1];
                        }
                    }
                    var styles=[];
                    for (var p in currentStyleMap){
                        styles.push(p + ':' +currentStyleMap[p]);
                    }
                    $(obj).attr('style',styles.join(';'));
                    break;
                }
                //add
                case 2:{

                    var _newStyle = currentStyle + ';' + style,
                        _newStyleT = _.uniq(_newStyle.split(';')).join(';');

                    domAttr.set(obj,'style',_newStyleT);
                    break;
                }
                //remove
                case 3:{
                    domAttr.set(obj,'style',utils.replaceAll(style,'',currentStyle));
                    break;
                }
                //increase
                case 4:
                //decrease
                case 5:{

                    var	numbersOnlyRegExp = new RegExp(/(\D*)(-?)(\d+)(\D*)/);

                    /**
                     * compute current style values of the object
                     * @type {{}}
                     */
                    var stylesRequested = this._toObject(style);
                    var stylesComputed = {};
                    var jInstance = $(obj);
                    ///determine from node it self
                    if(stylesRequested) {
                        for (var prop in stylesRequested) {
                            var currentStyle = this._getStyle(prop,obj,jInstance);
                            stylesComputed[prop] = currentStyle;
                            //console.log('style value for ' + prop + ' is now  at ' + currentStyle + ' ' + obj.id);
                        }
                    }

                    var _newStyleObject = {};
                    /**
                     * compute the new style
                     * @type {number}
                     */
                    for (var prop in stylesRequested){

                        var _prop = '' + prop.trim();
                        var multiplicator = 1;
                        if(stylesComputed[_prop]!=null){

                            var _valueRequested = stylesRequested[prop];
                            var _valueComputed = stylesComputed[prop];

                            var _isHex = _valueRequested.indexOf('#')!=-1;
                            var _isRGB = _valueRequested.indexOf('rgb')!=-1;
                            var _isRGBA = _valueRequested.indexOf('rgba')!=-1;

                            if( _isHex || _isRGB || _isRGBA){

                                var dColorMultiplicator = dojo.colorFromString(_valueRequested);
                                //var dColorNow = dojo.colorFromString('rgba(0.1,0.1,0.1,0.1)');
                                var dColorNow = dojo.colorFromString(_valueRequested);
                                var dColorComputed = dojo.colorFromString(_valueComputed);
                                var dColorNew = new Color();

                                _.each(["r", "g", "b", "a"], function(x){
                                    dColorNew[x] = Math.min(dColorComputed[x] + dColorMultiplicator[x], x=="a" ? 1 : 255);
                                });

                                console.log('color computed ' + dColorComputed.toRgba() + ' color requested: ' + dColorNow.toRgba() +   ' | multiplicator color = ' + dColorMultiplicator.toRgba() +  ' is then = ' + dColorNew.toRgba());

                                var _valueOut = '';
                                if(_isHex){
                                    _valueOut = dColorNew.toHex();
                                }else if(_isRGB){
                                    _valueOut = dColorNew.toCss(false);
                                }else if(_isRGBA){
                                    _valueOut = dColorNew.toCss(true);
                                }
                                //var _newValue = this._changeValue(styles[prop],delta * multiplicator);
                                _newStyleObject[prop]=_valueOut;
                                domStyle.set(obj,prop, _valueOut);//update
                                //var dColorNow = dojo.colorFromString(st);
                                //var dColorMultiplicatorRGBA = dColorMultiplicator.toRgba();
                                //console.log('color ' + dColorMultiplicatorRGBA  , dColorMultiplicator);


                            }else{
                                //extract actual number :
                                var numberOnly = numbersOnlyRegExp.exec(stylesComputed[_prop]);
                                if(numberOnly && numberOnly.length>=3){
                                    var _int = parseInt(numberOnly[3]);
                                    if(_int && _int>0){
                                        multiplicator  = _int;
                                    }
                                }
                            }
                        }
                    }
                    var delta = mode == 4 ? 1 : -1;
                    //now get an object array of the styles we'd like to alter
                    var styles = this._toObject(currentStyle);
                    var inStyles = this._toObject(style);
                    if(!styles){
                        return false;
                    }
                    var _skipped = [];
                    for(var prop in styles){
                        var _prop = '' + prop.trim();
                    }

                    var newStyleString = this._toStyleString(_newStyleObject);
                    break;
                }
            }
        },
        onDomStyleChanged:function(objects,newStyle,mode,settings){
            objects = objects || this.resolveReference(this.deserialize(this.reference),settings);
            if(!objects){
                debug && console.warn('have no objects');
                return;
            }
            debug && console.log('change dom style to ' + newStyle + ' on ' + objects.length + ' objects');
            for (var i = 0; i < objects.length; i++) {
                var obj = objects[i];
                if(obj && obj.id && obj.id.indexOf('davinci')!=-1) {
                    continue;
                }
                this.updateObject(obj, newStyle, mode,settings);
            }
        },
        /**
         *
         * @param objects
         * @param domStyleString
         * @param mode
         * @param settings
         */
        updateObjects:function(objects,domStyleString,mode,settings){
            objects = objects || this.resolveReference(this.deserialize(this.reference),settings);
            this.onDomStyleChanged(objects,domStyleString,mode,settings);
        },
        onChangeField:function(field,newValue,cis){
            this._destroy();
            if(field=='mode' && newValue!==this.mode){
                this.mode = newValue;
            }
            if(field=='value' && newValue!==this.value){
                this.onDomStyleChanged(null,newValue,this.mode);
                this.value = newValue;
            }
            if(field=='reference'){
                this.onReferenceChanged(newValue,cis);
            }
            this.inherited(arguments);
        },
        activate:function(){
            this._destroy();//you never know
        },
        deactivate:function(){
            this._destroy();
        },
        _destroy:function(){

        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Utils
        //
        /////////////////////////////////////////////////////////////////////////////////////
        _changeValue: function(value, delta){
            if(!value){
                return "";
            }
            var split = value.split(" ");
            var result="";
            for(var i=0;i<split.length;i++){
                if(i>0)
                    result+=" ";
                var bits = split[i].match(/([-\d\.]+)([a-zA-Z%]*)/);
                if(!bits){
                    result+=split[i];
                }else{
                    if(bits.length == 1){
                        result+=bits[0];
                    }else{
                        for(var z=1;z<bits.length;z++){
                            if(!isNaN(bits[z]) && bits[z]!=""){
                                result+= parseFloat(bits[z]) + delta;
                            }else{
                                result +=bits[z];
                            }
                        }
                    }
                }
            }
            return result;
        },
        /**
         * Convert Style String to an object array, eg: { color:value,.... }
         * @param styleString
         * @returns {{}}
         * @private
         */
        _toObject:function(styleString){
            if(!styleString){
                return {};
            }
            var _result = {};
            var _values = styleString.split(';');
            for (var i = 0; i < _values.length; i++) {
                var obj = _values[i];
                if(!obj || obj.length==0 || !obj.split){
                    continue;
                }
                var keyVal = obj.split(':');
                if(!keyVal || !keyVal.length){
                    continue;
                }
                var key = obj.substring(0,obj.indexOf(':'));
                var value = obj.substring(obj.indexOf(':')+1,obj.length);

                _result[key]=value;
            }
            return _result;
        },
        _toStyleString:function(values){
            var _values = [];
            for(var prop in values){
                _values.push( prop + ':' + values[prop]);
            }
            return _values.join(';') + ';';
        }

    };

    //package via declare
    var _class = dcl([Block,Referenced.dcl],Impl);
    //static access to Impl.
    _class.Impl = Impl;
    return _class;

});
define('xblox/model/Targeted',[
    "dojo/_base/declare",
    "./Referenced"
], function(declare,Referenced){

    /**
     * Targeted provides functions to get an object through various ways
     */
    return declare('xblox.model.Targeted',[Referenced],{

    });
});
define('xblox/model/html/SetCSS',[
    "dojo/_base/declare",
    "dojo/_base/lang",
    "xblox/model/Block",
    'xide/utils',
    'xide/types',
    'xide/mixins/EventedMixin',
    'xblox/model/Targeted',
    'xide/registry'
], function(declare,lang,Block,utils,types,EventedMixin,Targeted,registry){

    // summary:
    //		The Call Block model.
    //      This block makes calls to another blocks in the same scope by action name

    // module:
    //		xblox.model.code.CallMethod
    return declare("xblox.model.html.SetCSS",[Block,EventedMixin,Targeted],{

        //method: (String)
        //  block name
        name:'Set CSS',

        file:'',

        reference:'',

        references:null,

        description:'Sets HTML Node CSS',
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  UI
        //
        /////////////////////////////////////////////////////////////////////////////////////
        solve:function(scope,settings) {
            this.onSuccess(this,settings);
        },
        toText:function(){

            var result = this.getBlockIcon() + ' ' + this.name + ' :: ';
            if(this.event){
                result+= this.event;
            }
            return result;
        },

        //  standard call for editing
        getFields:function(){
            try {
                var fields = this.inherited(arguments) || this.getDefaultFields();
                //var _ref = this.deserialize(this.reference);


                fields.push(utils.createCI('File', types.ECIType.FILE, this.file, {
                    group: 'General',
                    dst: 'file',
                    value: this.file,
                    intermediateChanges: false,
                    acceptFolders: false,
                    acceptFiles: true,
                    encodeFilePath: false,
                    buildFullPath: true,
                    filePickerOptions: {
                        dialogTitle: 'Select CSS File',
                        filePickerMixin: {
                            beanContextName: 'CSSFilePicker',
                            persistent: false,
                            globalPanelMixin: {
                                allowLayoutCookies: false
                            }
                        },
                        configMixin: {
                            beanContextName: 'CSSFilePicker',
                            LAYOUT_PRESET: types.LAYOUT_PRESET.SINGLE,
                            PANEL_OPTIONS:{
                                ALLOW_MAIN_MENU:false
                            }
                        },
                        defaultStoreOptions: {
                            "fields": 1663,
                            "includeList": "css",
                            "excludeList": "*"
                        },
                        startPath: this.file
                    }
                }));

                /*
                 fields.push(utils.createCI('Value',types.ECIType.DOM_PROPERTIES,this.value,{
                 group:'General',
                 dst:'value',
                 value:this.value,
                 intermediateChanges:false
                 }));
                 */

                fields.push(utils.createCI('Target', types.ECIType.WIDGET_REFERENCE, this.reference, {
                    group: 'General',
                    dst: 'reference',
                    value: this.reference
                }));

            }catch(e){

            }
            return fields;
        },
        getBlockIcon:function(){
            return '<span class="fa-paint-brush"></span>';
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Store
        //
        /////////////////////////////////////////////////////////////////////////////////////

        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Lifecycle
        //
        /////////////////////////////////////////////////////////////////////////////////////
        onReferenceChanged:function(newValue,cis){
            this._destroy();//unregister previous event(s)
            this.reference = newValue;
            var objects = this.resolveReference(this.deserialize(newValue));
            //this._registerEvent(this.event);

        },
        onChangeField:function(field,newValue,cis){
            if(field=='file'){
            }

            if(field=='reference'){
                this.onReferenceChanged(newValue,cis);
            }

            this.inherited(arguments);
        },
        activate:function(){
            this._destroy();//you never know
            //this._registerEvent(this.event);
        },
        deactivate:function(){
            this._destroy();
        },
        _destroy:function(){

        }



    });
});
(function () {

    //bloody boiler code
    var __isAMD = !!(typeof define === 'function' && define.amd),
        __isNode = (typeof exports === 'object'),
        __isWeb = !__isNode,
    //is that enough at some point?
        __isDojoRequire = !!(typeof require === 'function' && require.packs),
        __isRequireJS = !__isDojoRequire,
        __deliteHas = !!(typeof has === 'function' && has.addModule),
        __hasDcl = !!(typeof dcl === 'function'),//false if dcl has not been required yet
        __preferDcl = false;//!__isDojoRequire && __hasDcl;

    /**
     * @TODO
     *
     * - convert dojo base classes recursive, currently it only accepts simple dojo classes, not with multiple
     * base classes but you can use as many dcl base classes as you want.
     * - deal with un-tested cases: nodejs, cjs
     *
     * @example  tested cases:

     1. var fooBar = dDeclare('foo.bar',null,{}); // works with dcl or dojo

     2. var myFooBarKid = dDeclare('my.foo.bar',[fooBar],{}); // works with dcl or dojo

     3. using a Dojo declared class together with a dcl declared class:

     var _myDojoClass = declare('dojoClass',null,{});
     var _classD2 = dDeclare('my mixed class',[myFooBarKid,_myDojoClass],{});

     *
     */
    var _define = define;

    _define([
        //needed?
        'exports',
        'module',
        'xide/utils',
        'dojo/_base/declare',
        (typeof __isDojoRequire !='undefined' && __isDojoRequire ) ? __preferDcl ? 'dcl/dcl' :  'dojo/_base/declare' : 'dcl/dcl'

    ], function (exports, module,utils,dDeclare) {

        /*
        console.log('xdojo/declare:\n\t  _isAMD:' +__isAMD +
            "\n\t isNode:" + __isNode +
            "\n\t isDojoRequire:" + __isDojoRequire +
            "\n\t isRequireJS:" + __isRequireJS +
            "\n\t __deliteHas:" + __deliteHas +
            "\n\t __hasDcl:" + __hasDcl +
            "\n\t __preferDcl:" + __preferDcl
        );
        */


        if(!__isDojoRequire && __preferDcl) {
            var _dcl = null;//
            try {

                _dcl = require('dcl/dcl');
                if (_dcl) {
                    dDeclare = _dcl;
                }
            } catch (e) {

            }
        }

        ////////////////////////////////////////////////////////////////////
        //
        // Extras
        //
        ///////////////////////////////////////////////////////////////////

        function addExtras(handler){

            /**
             *
             * @param name
             * @param bases {object}
             * @param extraClasses {object[]}
             * @param implmentation
             * @param defaults
             * @returns {*}
             */
            function classFactory(name, bases, extraClasses, implmentation,defaults) {


                var baseClasses = bases!=null ? bases : utils.cloneKeys(defaults || {}),
                    extras = extraClasses || [],
                    _name = name || 'xgrid.Base',
                    _implmentation = implmentation || {};

                if (bases) {
                    utils.mixin(baseClasses, bases);
                }

                var classes = [];
                for (var _class in baseClasses) {
                    var _classProto = baseClasses[_class];
                    if ( _classProto) {
                        classes.push(baseClasses[_class]);
                    }
                }

                classes = classes.concat(extras);

                return handler(_name, classes, _implmentation);
            }

            handler.classFactory=classFactory;

        }


        if (dDeclare) {

            //node.js
            if (typeof exports !== "undefined") {
                exports.declare = dDeclare;
            }

            if (__isNode) {
                return module.exports;
            } else if (__isWeb && __isAMD) {

                //todo: where to place this?
                var _patchDCL = true,     //patch DCL for Dojo declare signature
                    _convertToDCL = true, //if a dojo/declared class is passed, convert it to DCL
                    handler = dDeclare;

                //now make Dcl working like declare, supporting declaredClass.
                //This could be done via define('module') and then module.id but i don't trust it.
                if (handler && __preferDcl && !dDeclare.safeMixin) {

                    if(_patchDCL) {

                        //the Dojo to Dcl converter, see TODO's
                        function makeClass(name,_class,_declare){
                            return _declare(null,_class,_class.prototype);
                        }

                        //in-place base class check & convert from dojo declared base class to dcl base class
                        //@TODO: recursive and cache !! There is probably more..
                        function checkClasses(classes,_declare){

                            for (var i = 0, j = classes.length; i < j ; i++) {

                                var o = classes[i];
                                //convert dojo base class
                                if(o.createSubclass){
                                    var declaredClass =  o.declaredClass || o.prototype.declaredClass;
                                    var out = makeClass(declaredClass,o,handler);
                                    classes[i] = o = out;
                                }
                            }
                            return classes;
                        }

                        var _declareFunction = function () {

                            var _declaredClass = null,
                                args = arguments,
                                context = arguments.callee;//no need actually



                            //eat declared string arg
                            if (typeof arguments[0] == 'string') {
                                _declaredClass = arguments[0];
                                args = Array.prototype.slice.call(arguments, 1);
                            }

                            //patch props for declaredClass, @TODO: not sure dcl() has really only 2 args
                            if(_declaredClass) {

                                //this will add declared class into the new class's prototype
                                args[args.length-1]['declaredClass'] = _declaredClass;

                            }

                            switch (args.length) {
                                case 1:
                                    //fast and legit dcl case, no base classes given
                                    return handler.call(context,null,args[0]);
                                case 2:{

                                    //base classes given and prototype given, convert to Dojo if desired

                                    //straight forward
                                    if(!_convertToDCL) {
                                        return handler.call(context, args[0], args[1]);
                                    }

                                    //convert base classes if given
                                    /*
                                    if(handler.Advice && args[0] == null) {
                                        return handler.call(args[0] != null ? checkClasses(args[0]) : args[0], args[1]);
                                    }*/
                                    var bases = args[0] != null ? checkClasses(args[0]) : args[0];
                                    var proto = args[1];
                                    /*
                                    if(handler.Advice && bases) {
                                        return handler.call(bases, proto);
                                    }*/
                                    return handler.call(context, bases, proto);
                                }
                                // fall through
                                default:
                                    return handler.call(context,args);
                            }
                        };
                        addExtras(_declareFunction);
                        return _declareFunction;
                    }
                }
                addExtras(dDeclare);
                return dDeclare;
            }
            addExtras(dDeclare);
            return dDeclare;

        } else {

            //@TODO, add fallback version?
            //we shouldn't be here anyways, dcl or dojo/declare has not been loaded yet!
            return resultingDeclare;
        }
    });
}).call(this);
define("xdojo/declare", function(){});

/** @module xblox/model/Expression */
define('xblox/model/Expression',[
    "xdojo/declare",
    "xdojo/has",
    "xide/utils",
    "xide/types",
    "xblox/model/ModelBase"
], function(declare,has,utils,types,ModelBase,tracer,_console){

    'use strict';
    var isServer = has('host-node');
    var console = typeof window !== 'undefined' ? window.console : global.console;
    if(isServer && tracer && console && console.error){
        console = _console;
    }
    var _debug = false;
    /**
     * The expression
     * @class module:xblox.model.Expression
     * @extends module:xblox/model/ModelBase
     */
    return declare("xblox.model.Expression",[ModelBase], {
        id:null,
        context:null,
        // Constants
        variableDelimiters : {
            begin : "[",
            end : "]"
        },
        blockCallDelimiters: {
            begin : "{",
            end : "}"
        },
        expressionCache:null,
        variableFuncCache:null,
        constructor:function(){
            this.reset();
        },
        reset:function(){
            this.expressionCache={};
            this.variableFuncCache={};
        },
        /**
         * Replace variable calls width variable values
         * @param scope
         * @param expression
         * @param _evaluate
         * @param _escape
         * @param variableOverrides
         * @returns {*}
         */
        replaceVariables:function(scope,expression,_evaluate,_escape,variableOverrides,useVariableGetter,variableDelimiters,flags) {
            variableDelimiters = variableDelimiters || this.variableDelimiters;
            flags = flags || types.CIFLAG.NONE;
            if(flags & types.CIFLAG.DONT_ESCAPE){
                _escape = false;
            }
            if(flags & types.CIFLAG.DONT_PARSE){
                _evaluate = false;
            }

            var ocurr = this._findOcurrences( expression , variableDelimiters );
            if (ocurr) {
                for(var n = 0; n < ocurr.length; n++ )
                {
                    // Replace each variable call width the variable value
                    var oc = ocurr[n];
                    oc = oc.replace(variableDelimiters.begin,'');
                    oc = oc.replace(variableDelimiters.end,'');
                    var _var = this._getVar(scope,oc);

                    if(_var && _var.flags & types.CIFLAG.DONT_PARSE){
                        _evaluate = false;
                    }

                    var value = null;
                    if(_var){

                        if(useVariableGetter){

                            expression = expression.replace(ocurr[n],'this.getVariable(\'' +_var.name + '\')');
                            continue;
                        }

                        value = this.getValue(_var.value);

                        if(variableOverrides && _var.name in variableOverrides){
                            value = variableOverrides[_var.name];
                        }

                        if(this.isScript(value) && _evaluate!==false){

                            try{

                                //put other variables on the stack: should be avoided
                                var _otherVariables = scope.variablesToJavascript(_var,true);
                                if(_otherVariables){
                                    value = _otherVariables + value;
                                }

                                var _parsed = (new Function("{\n" + value+ "\n}")).call(scope.context||{});


                                //wasnt a script
                                if(_parsed==='undefined' || typeof _parsed ==='undefined'){
                                    //console.log(' parsed variable to undefined : ' + _var.title + ' with value : ' + value);
                                    value = '' + _var.value;
                                }else{
                                    value = _parsed;
                                    !(flags & types.CIFLAG.DONT_ESCAPE) && (value = "'" + value + "'");
                                }
                            }catch(e){
                                console.log(' parsed variable expression failed \n' + value,e);
                            }
                        }else{
                            if(!this.isNumber(value)){
                                if(_escape!==false) {
                                    value = "'" + value + "'";
                                }
                            }
                        }
                    }else{
                        _debug && console.log('   expression failed, no such variable :' + ocurr[n] + ' ! setting to default ' + '');
                        value = ocurr[n];
                    }

                    expression = expression.replace(ocurr[n],value);
                }
            }

            return expression;
        },
        /**
         *
         * @param scope
         * @param expression
         * @param addVariables
         * @param runCallback
         * @param errorCallback
         * @param context
         * @param variableOverrides
         * @param args {[*]}
         * @param args {CIFLAGS}
         * @returns {*}
         */
        parse:function(scope,expression,addVariables,runCallback,errorCallback,context,variableOverrides,args,flags) {
            expression = this.replaceAll("''","'",expression);//weird!
            //expression = this.replaceBlockCalls(scope,expression);
            var expressionContext = context || scope.context || scope.getContext() ||{};
            var useVariableGetter  = expressionContext['getVariable'] !=null;
            //expression = utils.replaceHex(expression);
            expression = this.replaceVariables(scope,expression,null,null,variableOverrides,useVariableGetter,null,flags);
            var isExpression = this.isScript(expression);
            if(!isExpression && (this.isString(expression) || this.isNumber(expression))){

                if(runCallback){
                    runCallback('Expression ' + expression + ' evaluates to ' + expression);
                }
                return expression;
            }
            if(expression.indexOf('return')==-1 && isExpression){
                expression = 'return ' + expression;
            }
            addVariables=false;
            if(addVariables===true){
                var _otherVariables = scope.variablesToJavascript(null,expression);
                if(_otherVariables){
                    expression = _otherVariables + expression;
                    expression = this.replaceAll("''","'",expression);//weird!
                }
            }
            var parsed = this;
            try{
                expression = this.replaceAll("''","'",expression);
                var _function = this.expressionCache[expression];
                if(!_function){
                    _debug && console.log('create function ' + expression);
                    _function = new Function("{" +expression+"; }");
                    this.expressionCache[expression] = _function;
                }else{

                }
                //parsed = (new Function("{" +expression+"; }")).call(this.context||{});
                parsed = _function.apply(expressionContext,args);
            }catch(e){
                console.error('     invalid expression : \n' + expression, e);
                if(errorCallback){
                    errorCallback('invalid expression : \n' + expression + ': ' + e,e);
                }
                parsed='' + expression;
                return parsed;
            }

            if(parsed===true){
                _debug &&  console.log('        expression return true! : ' + expression);
            }

            if(runCallback){
                runCallback('Expression ' + expression + ' evaluates to ' + parsed);
            }
            //console.log(parsed);
            return parsed;
        },
        parseVariableO:function(scope,_var){

            var value = ''+ _var.value;
            if(_var.title==='None'){
                return '';
            }
            try{
                //put other variables on the stack;
                var _otherVariables = scope.variablesToJavascript(_var,false);
                if(_otherVariables){
                    value = _otherVariables + value;
                }
                var _function = new Function("{" + value+ "}");

                var _parsed = _function.call(this.context||{});
                if(_parsed==='undefined' || typeof _parsed ==='undefined'){
                    value = '' + _var.value;
                }else{
                    if(!this.isNumber(_parsed)){
                        value = ''+_parsed;
                        value = "'" + value + "'";
                    }else{
                        value = _parsed;
                    }

                }
            }catch(e){
                console.error('parse variable failed : ' + _var.title + "\n" + value);
            }
            return value;
        },
        parseVariable:function(scope,_var,_prefix,escape,allowCache,context,args){
            var value = ''+ _var.value;
            _prefix = _prefix || '';

                if(allowCache!==false) {
                    var _function = this.variableFuncCache[scope.id + '|' + _var.title];
                    if(!_function){
                        _function = new Function("{" + _prefix + value + "}");
                        this.variableFuncCache[scope.id + '|' + _var.title] = _function;
                    }
                }else{
                    _function = new Function("{" + _prefix + value + "}");
                }
                var _parsed = _function.apply(context || scope.context||{}, args || []);
                if(_parsed==='undefined' || typeof _parsed ==='undefined'){
                    value = '' + _var.value;
                }else{
                    if(!this.isNumber(_parsed) && escape!==false){
                        value = ''+_parsed;
                        value = "'" + value + "'";
                    }else{
                        value = _parsed;
                    }

                }
            return value;
        },
        // Replace block call with block result
        replaceBlockCalls:function(scope,expression) {
            var ocurr = this._findOcurrences( expression, this.blockCallDelimiters );
            if (ocurr) {
                for(var n = 0; n < ocurr.length; n++ ){
                    // Replace each block call with block result
                    var blockName = this._removeDelimiters( ocurr[n],this.blockCallDelimiters );
                    var blockResult = scope.solveBlock(blockName).join("\n");
                    expression = expression.replace(ocurr[n],blockResult);
                }
            }
            return expression;
        },
        // gets a variable from the scope using text [variableName]
        _getVar:function(scope,vartext) {
            return scope.getVariable(this._getVarName(vartext));
        },
        _getVarName:function(vartext) {
            return this._removeDelimiters(vartext,this.variableDelimiters);
        },
        _removeDelimiters:function(text,delimiters) {
            return text.replace(delimiters.begin,'').replace(delimiters.end,'');
        },
        // escape regular expressions special chars
        _escapeRegExp:function(string) {
            var special = [ "[" ,"]" , "(" , ")" , "{", "}" , "*" , "+" , "." ];
            for (var n = 0; n < special.length ; n++ ){
                string = string.replace(special[n],"\\"+special[n]);
            }
            return string;
        },
        /**
         * Finds a term in an expression by start and end delimiters
         * @param expression
         * @param delimiters
         * @returns {*|Boolean|Array|Route|Collection|SchemaType}
         * @private
         */
        _findOcurrences:function(expression,delimiters) {
            // prepare delimiters for the regular expression
            var d = {
                begin: this._escapeRegExp(delimiters.begin),
                end:   this._escapeRegExp(delimiters.end)
            };
            // regular expression for [<content>]
            var allExceptEnd = "[^" + d.end + "]*";

            // final regular expression = find all [variables]
            var patt = d.begin + "(" + allExceptEnd + ")" + d.end;

            return expression.match( new RegExp(patt,'g') );
        }
    });
});
/** @module xblox/model/Scope **/
define('xblox/model/Scope',[
    'dcl/dcl',
    "./ModelBase",
    "./Expression",
    "xide/factory",
    "xide/utils",
    "xide/types",
    "xide/mixins/EventedMixin",
    'dojo/_base/lang',
    'dojo/has',
    'xide/encoding/MD5',
    "xcf/model/Variable"
], function(dcl,ModelBase,Expression,factory,utils,types,EventedMixin,lang,has,MD5,Variable,tracer,_console){

    /*
    var console = typeof window !== 'undefined' ? window.console : console;
    if(tracer && tracer.error && console && console.error){
        console = _console;
    }
    */

    function mergeNewModule(block,source) {
        for (var i in source) {
            var o = source[i];
            if (o && _.isFunction(o) /*&& lang.isFunction(target[i])*/) {
                block[i] = o;//swap
            }
        }
    }

    var debug = false;
    var isIDE = has('xcf-ui');
    /**
     * The scope acts as a real scope as usual. All registered variables and blocks are excecuted in this scope only.
     * @class module:xblox/model/Scope
     */
    var Module = dcl([ModelBase,EventedMixin.dcl],{
        declaredClass: "xblox.model.Scope",
        variableStore:null,
        serviceObject:null,
        context:null,
        blockStore:null,
        /**
         *  @type {module:xblox/model/Expression}
         */
        expressionModel: null,
        start:function(){
            if(this.__didStartBlocks ===true){
                console.error('already started blocks');
                return;
            }
            this.__didStartBlocks = true;
            var responseVariable = this.getVariable('value');
            if (!responseVariable) {
                responseVariable = new Variable({
                    id: utils.createUUID(),
                    name: 'value',
                    value: '',
                    scope: this,
                    type: 13,
                    group: 'processVariables',
                    gui: false,
                    cmd: false
                });

                this.blockStore.putSync(responseVariable);
            }
            var autoBlocks = [];
            var initBlocks = this.getBlocks({
                group: types.COMMAND_TYPES.INIT_COMMAND
            });

            try {
                _.each(initBlocks, function (block) {
                    if (block.enabled !== false && block.__started!== true) {
                        block.solve(scope);
                        block.__started = true;
                    }

                });
            }catch(e){
                console.error("starting init blocks failed",e);
            }
            autoBlocks = autoBlocks.concat(this.getBlocks({
                group: types.COMMAND_TYPES.BASIC_COMMAND
            }));

            //console.error('auto blocks : '+autoBlocks.length + ' ' + this.id);
            for (var i = 0; i < autoBlocks.length; i++) {
                var block = autoBlocks[i];
                if(block.__started){
                    //console.error('block already started');
                }
                if(block.enabled && block.start && block.startup && block.__started!==true){
                    block.start();
                    block.__started=true;
                }
            }
        },
        /**
         *
         * @returns {module:xblox/model/Expression}
         */
        getExpressionModel:function(){
            if(!this.expressionModel){
                this.expressionModel  = new Expression();
            }
            return this.expressionModel;
        },
        /**
         *
         * @param block
         * @param url
         * @returns {*}
         */
        toFriendlyName:function(block,url){
            if(!url || !block){
                return null;
            }
            var blockScope = this,
                ctx = this.ctx,
                driver = this.driver,
                device = this.device,
                deviceManager = ctx.getDeviceManager(),
                driverManager = ctx.getDriverManager();

            if(url.indexOf('://')==-1){
                var _block = blockScope.getBlockById(url);
                if(_block){
                    return _block.name;
                }
                return url;
            }
            var parts = utils.parse_url(url);//strip scheme

            parts = utils.urlArgs(parts.host);//go on with query string
            var _device = deviceManager.getItemById(parts.device.value);
            if(_device){
                var info=deviceManager.toDeviceControlInfo(_device);
                driver = driverManager.getDriverById(info.driverId);
                var driverInstance = _device.driverInstance;
                if(driverInstance || driver) {
                    blockScope = driver.blockScope ? driver.blockScope : driverInstance ? driverInstance.blockScope : blockScope;
                    block = blockScope.getStore().getSync(parts.block.value);
                    if(block){
                        return info.title + '/' + block.name;
                    }else if(driverInstance && driverInstance.blockScope){
                        block = driverInstance.blockScope.getBlock(parts.block.value);
                        if(block){
                            return info.title + '/' + block.name;
                        }
                    }
                }
            }
            return url;
        },
        getContext:function(){
            return this.instance;
        },
        toString:function(){
            var all = {
                blocks: null,
                variables: null
            };
            var blocks = this.blocksToJson();
            try {
                //test integrity
                utils.fromJson(JSON.stringify(blocks));
            } catch (e) {
                debug && console.error('scope::toString : invalid data in scope');
                return;
            }
            all.blocks = blocks;
            return JSON.stringify(all, null, 2);
        },
        /**
         * @param data
         * @param errorCB {function}
         */
        initWithData:function(data,errorCB){
            data && this.blocksFromJson(data,null,errorCB);
            this.clearCache();
        },
        /////////////////////////////////////////////////////////
        //
        //  Service uplink related
        //
        /////////////////////////////////////////////////////////
        /** @member {Object} */
        getService:function(){
            return this.serviceObject;
        },
        /////////////////////////////////////////////////////////
        //
        //  Store related
        //
        /////////////////////////////////////////////////////////
        getStore:function(){
            return this.blockStore;
        },
        reset:function(){
            this.getExpressionModel().reset();
        },
        /**
         *
         */
        empty:function(){
            this.clearCache();
            var store = this.blockStore;
            var allBlocks = this.getBlocks();
            store.silent(true);
            _.each(allBlocks,function(block){
                if(block) {
                    store.removeSync(block.id);
                }else{
                    debug && console.error('have no block');
                }

            });
            store.setData([]);
            store.silent(false);
        },
        fromScope:function(source){
            var store = this.blockStore;
            store.silent(true);
            this.empty();
            var _t = source.blocksToJson();
            this.blocksFromJson(_t);
            store.silent(false);
        },
        /**
         *
         */
        clearCache:function(){
            this.getExpressionModel().reset();
        },
        /**
         * @returns {dojo/store/Memory}
         */
        getVariableStore:function(){
            return this.blockStore;
        },
        getBlockStore:function(){
            return this.blockStore;
        },
        getVariables:function(query){
            if(!this.blockStore){
                return [];
            }
            var all = this.blockStore.data;
            var out = [];
            if(query && query.group==='processVariables'){
                for (var i = 0; i < all.length; i++) {
                    if(all[i].group ==='processVariables'){
                        out.push(all[i]);
                    }
                }
                return out;
            }
            //query = query || {id:/\S+/};//all variables
            if(!query){
                for (var i = 0; i < all.length; i++) {
                    var block = all[i],
                        cls = block.declaredClass;
                    if(cls =='xblox.model.variables.Variable'||cls == 'xcf.model.Variable'){
                        out.push(block);
                    }
                }
                return out;
            }
            return this.blockStore.query(query);
        },
        loopBlock:function(block,settings){
            if(block._destroyed==true){
                console.error('block destroyed');
            }
            var interval = block.getInterval ? block.getInterval() : 0;
            if (block && interval > 0 && block.enabled && block._destroyed !== true) {
                var thiz = this;
                if (block._loop) {
                    clearInterval(block._loop);
                }
                block._loop = setInterval(function () {
                    if (!block.enabled || block._destroyed) {
                        clearInterval(block._loop);
                        block._loop = null;
                        return;
                    }
                    block.solve(thiz, settings || block._lastSettings);
                }, interval);
            }
        },
        getEventsAsOptions:function(selected){
            var result = [];
            for(var e in types.EVENTS){
                var label = types.EVENTS[e];

                var item = {
                    label:label,
                    value:types.EVENTS[e]
                };
                result.push(item);
            }
            result = result.concat([{label:"onclick", value:"onclick"},
                {label:"ondblclick",value:"ondblclick"},
                {label:"onmousedown",value:"onmousedown"},
                {label:"onmouseup",value:"onmouseup"},
                {label:"onmouseover",value:"onmouseover"},
                {label:"onmousemove",value:"onmousemove"},
                {label:"onmouseout",value:"onmouseout"},
                {label:"onkeypress",value:"onkeypress"},
                {label:"onkeydown",value:"onkeydown"},
                {label:"onkeyup",  value:"onkeyup"},
                {label:"onfocus",  value:"onfocus"},
                {label:"onblur",  value:"onblur"},
                {label:"onchange",  value:"onchange"}]);

            //select the event we are listening to
            for (var i = 0; i < result.length; i++) {
                var obj = result[i];
                if(obj.value===selected){
                    obj.selected=true;
                    break;
                }
            }
            return result;
        },
        /**
         *
         * @returns {{}}
         */
        getVariablesAsObject:function() {
            var variables = this.getVariables();
            var result = {};
            for(var i=0; i<variables.length;i++){
                result[variables[i].title] = variables[i].value;
            }
            return result;
        },
        getVariablesAsOptions:function(){
            var variables = this.getVariables();
            var result = [];
            if(variables){
                for(var i=0; i<variables.length;i++){
                    result.push({
                        label:variables[i].label,
                        value:variables[i].variable
                    })
                }
            }
            return result;
        },
        getCommandsAsOptions:function(labelField){
            var items = this.getBlocks({
                declaredClass:'xcf.model.Command'
            });
            var result = [];
            if(items){
                for(var i=0; i<items.length;i++){
                    var item  = {};
                    item[labelField||"label"] =items[i].name;
                    item["value"] =items[i].name;
                    result.push(item);
                }
            }
            return result;
        },
        _cached:null,
        getBlocks:function(query,allowCache){
            if(!isIDE && allowCache!==false){
                if(!this._cached){
                    this._cached = {};
                }
                if(query){
                    var hash = MD5(JSON.stringify(query), 1);
                    var cached = this._cached[hash];
                    if(cached){
                        return cached;
                    }
                }
            }
            //no store,
            if(!this.blockStore){
                return [];
            }
            query = query||{id:/\S+/};//all blocks
            var result = this.blockStore.query(query,null,allowCache);
            if(!isIDE && allowCache!==false){
                var hash = MD5(JSON.stringify(query), 1);
                this._cached[hash] = result;
            }
            return result;
        },
        /***
         * Register a variable into the scope
         *
         * The variable title is unique within the scope
         *
         * @param variable  =>  xblox.model.Variable
         */
        registerVariable:function(variable) {
            this.variables[variable.title] = variable;
            if(this.blockStore){
                this.blockStore.putSync(variable);
            }
        },
        /***
         * Returns a variable from the scope
         *
         * @param title => variable title
         * @return variable
         */
        getVariable:function(title) {
            var _variables = this.getVariables();
            var _var = null;
            for (var i = 0; i < _variables.length; i++) {
                var obj = _variables[i];
                if(obj.name === title ){
                    return obj;
                }
            }
            return null;
        },
        /***
         * Returns a variable from the scope
         *
         * @param title => variable title
         * @return variable
         */
        getVariableById:function(id) {
            if(!id){
                return null;
            }
            var parts = id.split('/');
            var scope = this;
            if(parts.length==2){
                var owner = scope.owner;
                if(owner && owner.hasScope){
                    if(owner.hasScope(parts[0])){
                        scope = owner.getScope(parts[0]);
                    }else{
                        console.error('have scope id but cant resolve it',this);
                    }
                }
                id = parts[1];
            }
            var _var = scope.blockStore.getSync(id);
            if(_var){
                return _var;
            }
            return null;
        },
        /***
         * Register a block into the scope
         *
         * The block name is unique within the scope
         *
         * @param block   =>    xblox.model.Block
         */
        registerBlock:function(block,publish) {
            var store = this.blockStore;
            if(store){
                var added = store.getSync(block.id);
                if(added){
                    debug && console.warn('block already in store! '+block.id,block);
                    return added;
                }
                var result = null;
                //custom add block to store function
                if(block.addToStore){
                    result = block.addToStore(store);
                }else{
                    result = store.putSync(block,publish);
                }
                return result;
            }
        },
        /***
         * Return all blocks
         *
         * @returns {xblox.model.Block[]}
         */
        allBlocks:function(query,allowCache) {
            return this.getBlocks({},allowCache);
        },
        /**
         * Returns whether there is any block belongs to a given group
         * @param group {String}
         * @returns {boolean}
         */
        hasGroup:function(group){
            var all = this.allGroups({},false);
            for (var i = 0; i < all.length; i++) {
                var obj = all[i];
                if (obj === group) {
                    return true;
                }
            }
            return false;
        },
        /**
         * Return all block groups
         * @returns {String[]}
         */
        allGroups:function(){
            var result = [];
            var all = this.allBlocks({},false);
            var _has = function(what){
                for (var i = 0; i < result.length; i++) {
                    if(result[i]===what){
                        return true;
                    }
                }
                return false;
            };
            for (var i = 0; i < all.length; i++) {
                var obj = all[i];
                if(obj.parentId){
                    continue;
                }
                if(obj.group){
                    if(!_has(obj.group)){
                        result.push(obj.group);
                    }
                }else{
                    if(!_has('No Group')){
                        result.push('No Group');
                    }
                }
            }
            return result;
        },
        /**
         * Serializes all variables
         * @returns {Array}
         */
        variablesToJson:function(){
            var result = [];
            var data = this.variableStore ? this.getVariables() : this.variables;
            for(var e in data){
                var variable = data[e];
                if(variable.serializeMe===false){
                    continue;
                }
                if(variable.keys==null){
                    continue;
                }
                var varOut={};
                for(var prop in variable){
                    //copy all serializables over
                    if(
                        this.isString(variable[prop])||
                        this.isNumber(variable[prop])||
                        this.isBoolean(variable[prop])
                        )
                    {
                        varOut[prop]=variable[prop];
                    }
                }

                result.push(varOut);
            }
            return result;
        },
        isScript:function(val){
            return this.isString(val) && (
                    val.indexOf('return')!=-1||
                    val.indexOf(';')!=-1||
                    val.indexOf('[')!=-1||
                    val.indexOf('{')!=-1||
                    val.indexOf('}')!=-1
                );
        },
        /**
         * Serializes all variables
         * @returns {Array}
         */
        variablesToJavascriptEx:function(skipVariable,expression){

            var result=[];
            var data = this.variableStore ? this.getVariables() : this.variables;
            for(var i = 0 ; i  < data.length ; i++){
                var _var = data[i];
                if(_var == skipVariable){
                    continue;
                }
                var _varVal = ''+_var.value;

                //optimization
                if(skipVariable && skipVariable.value && skipVariable.value.indexOf(_var.title)==-1){
                    continue;
                }
                if(expression && expression.indexOf(_var.title)==-1){
                    continue;
                }

                if(_varVal.length==0){
                    continue;
                }
                if(!this.isScript(_varVal) && _varVal.indexOf("'")==-1){
                    _varVal = "'" + _varVal + "'";
                }
                else if(this.isScript(_varVal)){
                    _varVal = this.expressionModel.parseVariable(this,_var);
                }
                if(_varVal==="''"){
                    _varVal="'0'";
                }
                result.push(_varVal);
            }

            return result;
        },
        variablesToJavascript:function(skipVariable,expression){
            var result='';
            var data = this.variableStore ? this.getVariables() : this.variables || [];
            for(var i = 0 ; i  < data.length ; i++){
                var _var = data[i];
                if(_var == skipVariable){
                    continue;
                }
                var _varVal = ''+_var.value;

                //optimization
                if(skipVariable && skipVariable.value && skipVariable.value.indexOf(_var.title)==-1){
                    continue;
                }
                if(expression && expression.indexOf(_var.title)==-1){
                    continue;
                }

                if(_varVal.length==0){
                    continue;
                }
                if(!this.isScript(_varVal)  && _varVal.indexOf("'")==-1){
                    _varVal = "'" + _varVal + "'";
                }
                else if(this.isScript(_varVal)){
                    //_varVal = "''";
                    _varVal = this.expressionModel.parseVariable(this,_var);
                }

                if(_varVal==="''"){
                    _varVal="'0'";
                }
                result+="var " + _var.title + " = " + _varVal + ";";
                result+="\n";
            }

            return result;
        },
        /**
         * Convert from JSON data. Creates all Variables in this scope
         * @param data
         * @returns {Array}
         */
        variablesFromJson:function(data){
            var result = [];
            for(var i = 0; i < data.length ; i++){
                var variable = data[i];
                variable['scope']  = this;
                if(!variable.declaredClass){
                    console.log('   variable has no class ');
                    continue;
                }
                var _class = utils.replaceAll('.','/',variable.declaredClass);
                var variableClassProto = require(_class);
                if(!variableClassProto){
                    console.log('couldnt resolve ' + _class);
                    continue;
                }
                result.push(new variableClassProto(variable));//looks like a leak but the instance is tracked and destroyed in this scope
            }
            return result;
        },
        regenerateIDs:function(blocks){
            var thiz=this;
            var updateChildren=function(block){
                var newId = utils.createUUID();
                var children = thiz.getBlocks({
                    parentId:block.id
                });
                if(children && children.length>0){
                    for(var i = 0 ; i < children.length ; i ++) {
                        var child = children[i];
                        child.parentId=newId;
                        updateChildren(child);
                    }
                }
                block.id=newId;
            };
            for(var i = 0 ; i < blocks.length ; i ++){
                var block=blocks[i];
                updateChildren(block);
            }
        },
        /**
         * Clone blocks
         * @param blocks
         * @returns {module:xblox/model/Block[]}
         */
        cloneBlocks2:function(blocks,forceGroup){
            var blocksJSON = this.blocksToJson(blocks);
            var tmpScope = this.owner.getScope(utils.createUUID(),null,false);
            var newBlocks = tmpScope.blocksFromJson(blocksJSON,false);
            var store = this.blockStore;
            newBlocks = tmpScope.allBlocks();

            tmpScope.regenerateIDs(newBlocks);
            blocksJSON = tmpScope.blocksToJson(newBlocks);

            if(forceGroup) {
                for (var i = 0; i < blocksJSON.length; i++) {
                    var block = blocksJSON[i];
                    if(block.parentId==null) {//groups are only needed for top level blocks
                        block.group = forceGroup;
                    }
                }
            }
            var result = [];
            newBlocks = this.blocksFromJson(blocksJSON);//add it to our scope
            _.each(newBlocks,function(block){
                result.push(store.getSync(block.id));
            });
            return result;

        },
        /**
         * Clone blocks
         * @param blocks
         */
        cloneBlocks:function(blocks){
            var blocksJSON = this.blocksToJson(blocks);
            var tmpScope = this.owner.getScope(utils.createUUID(),null,false);
            var newBlocks = tmpScope.blocksFromJson(blocksJSON,false);
            newBlocks = tmpScope.allBlocks();
            for(var i = 0 ; i < newBlocks.length ; i ++){
                var block=newBlocks[i];
                block.id = utils.createUUID();
                block.parentId=null;
            }

            blocksJSON = this.blocksToJson(newBlocks);
            this.blocksFromJson(newBlocks);//add it us
            return newBlocks;
        },
        /**
         * 
         * @param block
         * @returns {Object}
         */
        blockToJson:function(block){
                var blockOut={
                    // this property is used to recreate the child blocks in the JSON -> blocks process
                    _containsChildrenIds: []
                };
                for(var prop in block){

                    if (prop == 'ctrArgs') {
                        continue;
                    }

                    if( typeof block[prop] !=='function' && !block.serializeField(prop)){
                        continue;
                    }

                    //copy all strings over
                    if( this.isString(block[prop])||
                        this.isNumber(block[prop])||
                        this.isBoolean(block[prop]))
                    {
                        blockOut[prop]=block[prop];
                    }
                    //flatten children to ids. Skip "parent" field
                    if (prop != 'parent') {

                        if ( this.isBlock(block[prop]) )
                        {
                            // if the field is a single block container, store the child block's id
                            blockOut[prop] = block[prop].id;

                            // register this field name as children ID container
                            blockOut._containsChildrenIds.push(prop);

                        } else if ( this.areBlocks(block[prop]))
                        {
                            // if the field is a multiple blocks container, store all the children blocks' id
                            blockOut[prop] = [];

                            for(var i = 0; i < block[prop].length ; i++){
                                blockOut[prop].push(block[prop][i].id);
                            }

                            // register this field name as children IDs container
                            blockOut._containsChildrenIds.push(prop);
                        }
                    }

                }

            return blockOut;
        },
        /**
         * Serializes all blocks to JSON data.
         * It needs a custom conversation because we're having cyclic
         * object dependencies.
         * @returns {Array}
         */
        blocksToJson:function(data){
            try{
                var result = [];
                data = (data && data.length) ? data :  (this.blockStore ? this.getBlocks() : this.blocks);

                for(var b in data){
                    var block = data[b];
                    if(block.keys==null){
                        continue;
                    }
                    if(block.serializeMe===false){
                        continue;
                    }
                    var blockOut={
                        // this property is used to recreate the child blocks in the JSON -> blocks process
                        _containsChildrenIds: []
                    };

                    for(var prop in block){

                        if (prop == 'ctrArgs') {
                            continue;
                        }

                        if( typeof block[prop] !=='function' && !block.serializeField(prop)){
                            continue;
                        }

                        //copy all strings over
                        if( this.isString(block[prop])||
                            this.isNumber(block[prop])||
                            this.isBoolean(block[prop]))
                        {
                            blockOut[prop]=block[prop];
                        }

                        if( _.isObject(block[prop]) && block.serializeObject){
                            if(block.serializeObject(prop)===true){
                                blockOut[prop]=JSON.stringify(block[prop],null,2);
                            }
                        }


                        //flatten children to ids. Skip "parent" field

                        if (prop != 'parent') {
                            if ( this.isBlock(block[prop]) ){
                                // if the field is a single block container, store the child block's id
                                blockOut[prop] = block[prop].id;

                                // register this field name as children ID container
                                blockOut._containsChildrenIds.push(prop);

                            } else if ( this.areBlocks(block[prop])){
                                // if the field is a multiple blocks container, store all the children blocks' id
                                blockOut[prop] = [];

                                for(var i = 0; i < block[prop].length ; i++){
                                    blockOut[prop].push(block[prop][i].id);
                                }

                                // register this field name as children IDs container
                                blockOut._containsChildrenIds.push(prop);
                            }
                        }
                    }
                    result.push(blockOut);
                }
            }catch(e){
                console.error('from json failed : ' +e);
            }
            return result;
        },
        _createBlockStore:function(){
        },
        blockFromJson:function(block){
            block['scope']  = this;
            if(block._containsChildrenIds==null){
                block._containsChildrenIds=[];
            }

            // Store all children references into "children"
            var children = {};
            for(var cf = 0 ; cf < block._containsChildrenIds.length ; cf ++)
            {
                var propName = block._containsChildrenIds[cf];
                children[propName] = block[propName];
                block[propName] = null;
            }
            delete block._containsChildrenIds;

            // Create the block
            if(!block.declaredClass){
                console.log('   not a class ');
                return null;
            }
            var blockClassProto=null;
            var _class=null;
            try{
                _class = utils.replaceAll('.','/',block.declaredClass);
                blockClassProto = require(_class);
            }catch(e){

                try {
                    _class = utils.replaceAll('/','.',block.declaredClass);
                    blockClassProto = require(_class);
                }catch(e) {
                    debug && console.error('couldnt resolve class ' + _class);
                }
                debug && console.error('couldnt resolve class ' + _class);

            }
            if(!blockClassProto){
                blockClassProto = dcl.getObject(block.declaredClass);
            }
            if(!blockClassProto){
                debug && console.log('couldn`t resolve ' + _class);
                return null;
            }

            var blockOut = null;
            try{
                blockOut = factory.createBlock(blockClassProto,block);
            }catch(e){
                debug && console.error('error in block creation ' , e);
                logError(e);
                return null;
            }

            // assign the children references into block._children
            blockOut._children=children;

            return blockOut;
        },
        /**
         * Convert from JSON data. Creates all blocks in this scope
         * @param data
         * @returns {Array}
         */
        blocksFromJson:function(data,check,errorCB) {
            var resultSelected = [];
            var childMap = {};
            for(var i = 0; i < data.length ; i++){
                var block = data[i];
                block['scope']  = this;

                if(block._containsChildrenIds==null){
                    block._containsChildrenIds=[];
                }

                // Store all children references into "children"
                var children = {};
                for(var cf = 0 ; cf < block._containsChildrenIds.length ; cf ++)
                {
                    var propName = block._containsChildrenIds[cf];
                    children[propName] = block[propName];
                    block[propName] = null;
                }
                delete block._containsChildrenIds;


                // Create the block
                if(!block.declaredClass){
                    console.log('   not a class ');
                    continue;
                }
                var blockClassProto=null;
                var _class=null;
                try{
                    _class = utils.replaceAll('.','/',block.declaredClass);
                    blockClassProto = require(_class);
                }catch(e){
                    console.error('couldnt resolve class '+_class);

                }
                if(!blockClassProto){
                    blockClassProto = dcl.getObject(block.declaredClass);
                }
                if(!blockClassProto){
                    console.log('couldnt resolve ' + _class);
                    continue;
                }

                var blockOut = null;
                try{
                    blockOut = factory.createBlock(blockClassProto,block,null,false);
                }catch(e){
                    console.error('error in block creation ' , e + ' ' + block.declaredClass);
                    logError(e);
                    continue;
                }

                // assign the children references into block._children
                blockOut._children=children;
                childMap[blockOut.id] = children;
                resultSelected.push(blockOut);
            }


            //2nd pass, update child blocks
            var allBlocks = this.allBlocks(null,false);
            for(var i = 0; i < allBlocks.length ; i++){
                var block = allBlocks[i];
                block._children = childMap[block.id];
                if(block._children) {
                    // get all the block container fields
                    for (var propName in block._children){
                        if (typeof block._children[propName] == "string"){
                            // single block
                            var child = this.getBlockById( block._children[propName] );
                            if (!child) {
                                this.blockStore.removeSync(block._children[propName]);
                                if(errorCB){
                                    errorCB('   couldnt resolve child: ' + block._children[propName] + '@' + block.name+ ':'+block.declaredClass)
                                }
                                console.log('   couldnt resolve child: ' + block._children[propName]+ '@' + block.name+ ':'+block.declaredClass);
                                continue;
                            }
                            block[propName] = child;
                            child.parent=block;
                            if(child.postCreate){
                                child.postCreate();
                            }
                        }
                        else if (typeof block._children[propName] == "object"){
                            // multiple blocks
                            block[propName] = [];
                            for(var j = 0; j < block._children[propName].length ; j++){
                                var child = this.getBlockById(block._children[propName][j]);
                                if (!child) {
                                    if(errorCB){
                                        errorCB('   couldnt resolve child: ' + block._children[propName]+ '@' + block.name + ':'+block.declaredClass)
                                    }
                                    console.log('   couldnt resolve child: ' + block._children[propName][j]+ '@' + block.name+ ':'+block.declaredClass);
                                    continue;
                                }
                                block[propName].push(child);
                                var _parent = this.getBlockById(child.parentId);
                                if(_parent){
                                    child.parent = _parent;
                                }else{
                                    console.error('child has no parent');
                                }
                            }

                        }
                    }
                    delete block._children;
                }

                if(check!==false && block.parentId!=null){
                    var parent = this.getBlockById(block.parentId);
                    if(parent==null){
                        debug && console.error('have orphan block!',block);
                        block.parentId = null;
                    }
                }                                  
                block.postCreate();
            }
            var result = this.allBlocks();
            return resultSelected;
        },
        /**
         * 
         * @param url {String}
         * @returns {module:xblox/model/Block[]}
         */
        resolveBlock:function(url){
            var blockScope = this,
                ctx = this.ctx,
                driver = this.driver,
                device = this.device,
                deviceManager = ctx.getDeviceManager(),
                driverManager = ctx.getDriverManager();

            if(url.indexOf('://')==-1){
                var _block = this.getBlockById(url);
                if(_block){
                    return _block;
                }
                return url;
            }
            var parts = utils.parse_url(url);//strip scheme

            parts = utils.urlArgs(parts.host);//go on with query string
            var _device = deviceManager.getItemById(parts.device.value);
            //support device by name
            if(!_device){
                var _instance = deviceManager.getInstanceByName(parts.device.value)
                if(_instance){
                    _device = _instance.device;
                }
            }
            if(_device){
                var info=deviceManager.toDeviceControlInfo(_device);
                driver = driverManager.getDriverById(info.driverId);
                var driverInstance = _device.driverInstance;
                if(driverInstance || driver) {
                    blockScope = driverInstance ? driverInstance.blockScope : driver.blockScope;
                    var block = blockScope ? blockScope.getStore().getSync(parts.block.value) : null;
                    if(block){
                        return block;
                    }
                }
            }
        },
        getBlock:function(id){
            return this.getBlockById(id);
        },
        /***
         * Returns a block from the scope
         * @param name {String}
         * @return block {module:xblox/model/Block[]}
         */
        getBlockByName:function(name) {
            if(name.indexOf('://')!==-1){
                var block = this.resolveBlock(name);
                if(block){
                    return block;
                }
            }
            var allBlocks = this.getBlocks();
            for (var i = 0; i < allBlocks.length; i++) {
                var block = allBlocks[i];
                if(block.name===name){
                    return block;
                }

            }
            var blocks = this.blockStore.query({
                name:name
            });
            return blocks && blocks.length>0? blocks[0] : null;
        },
        /***
         * Returns a block from the scope
         *
         * @param name  =>  block name
         * @return block
         */
        getBlockById:function(id) {
            return this.blockStore.getSync(id) /*|| this.variableStore.getSync(id)*/;
        },
        /**
         * Returns an array of blocks
         * @param blocks {module:xblox/model/Block[]
         * @returns {module:xblox/model/Block[]}
         */
        _flatten:function(blocks){
            var result = [];
            for(var b in blocks){
                var block = blocks[b];
                if(block.keys==null){
                    continue;
                }
                result.push(block);
                for(var prop in block){
                    if (prop == 'ctrArgs') {
                        continue;
                    }
                    //flatten children to ids. Skip "parent" field
                    if (prop !== 'parent') {
                        if (this.isBlock(block[prop])){
                            // if the field is a single block container, store the child block's id
                            result.push(block[prop]);
                        } else if (this.areBlocks(block[prop])){
                            for(var i = 0; i < block[prop].length ; i++){
                                result.push(block[prop][i]);
                            }
                        }
                    }
                }
            }
            return result;
        },
        /**
         * 
         * @param blocks {module:xblox/model/Block[]}
         * @returns {module:xblox/model/Block[]}
         */
        flatten:function(blocks){
            var result = [];
            for(var b in blocks){

                var block = blocks[b];

                if(block.keys==null){
                    continue;
                }
                var found = _.find(result,{
                    id:block.id
                })

                if(found){
                    //console.error('already in array  : ' +found.name);
                }else {
                    result.push(block);
                }

                for(var prop in block){
                    if (prop == 'ctrArgs') {
                        continue;
                    }
                    //flatten children to ids. Skip "parent" field
                    if (prop !== 'parent') {

                        var value = block[prop];
                        if (this.isBlock(value)){
                            // if the field is a single block container, store the child block's id
                            found = _.find(result,{
                                id:value.id
                            })
                            if(found){
                                
                            }else {
                                result.push(value);
                            }
                        } else if (this.areBlocks(value)){
                            for(var i = 0; i < value.length ; i++){
                                var sBlock = value[i];
                                found = _.find(result,{
                                    id:sBlock.id
                                })
                                if(found){                                  
                                }else {
                                    result.push(sBlock);
                                }
                                result = result.concat(this.flatten([sBlock]));
                            }
                        }
                    }
                }
            }
            result = _.uniq(result,false,function(item){
                return item.id;
            });
            return result;
        },
        _getSolve:function(block){
            return block.prototype ? block.prototype.solve : block.__proto__.solve;
        },
        /***
         * Runs the block
         *
         * @param mixed
         * @returns result
         */
        solveBlock:function(mixed,settings,force,isInterface) {
            settings = settings || {
                highlight:false
            };
            var block = null;
            if(this.isString(mixed)){
                block = this.getBlockByName(mixed);
                if(!block){
                    block = this.getBlockById(mixed);
                }
            }else if(this.isObject(mixed)){
                block = mixed;
            }
            var result = null;
            if(block){
                if(settings.force !==true && block.enabled==false){
                    return null;
                }
                if(settings.force===true){
                    settings.force=false;
                }
                var _class = block.declaredClass;
                var _module = lang.getObject(utils.replaceAll('/', '.', _class)) || lang.getObject(_class);
                if(_module){
                    if(_module.prototype && _module.prototype.solve){
                        result = _module.prototype.solve.apply(block,[this,settings]);
                    }
                }else {
                    result  = block.solve(block.getScope(), settings,force,isInterface);
                    delete block.override;
                    block.override = {};
                }

            }else{
                debug && console.error('solving block failed, have no block! ' , mixed);
            }
            return result;
        },
        /***
         * Solves all the commands into [items]
         *
         * @param manager   =>  BlockManager
         * @return  list of commands to send
         */
        solve:function(scope,settings) {
            var ret='';
            for(var n = 0; n < this.items.length ; n++){
                ret += this.items[n].solve(scope,settings);
            }
            return ret;
        },
        /***
         * Parses an expression
         *
         * @param expression
         * @returns {String} parsed expression
         */
        /**
         * 
         * @param expression
         * @param addVariables
         * @param variableOverrides
         * @param runCallback
         * @param errorCallback
         * @param context
         * @param args
         * @returns {*}
         */
        parseExpression:function(expression,addVariables,variableOverrides,runCallback,errorCallback,context,args,flags) {
            return this.getExpressionModel().parse(this,expression,addVariables,runCallback,errorCallback,context,variableOverrides,args,flags);
        },
        isString: function (a) {
            return typeof a == "string"
        },
        isNumber: function (a) {
            return typeof a == "number"
        },
        isBoolean: function (a) {
            return typeof a == "boolean"
        },
        isObject:function(a){
            return typeof a === 'object';
        },
        isBlock:function (a) {
            var ret = false;

            if ( ( typeof a == "object" ) && ( a!=null ) && (a.length == undefined) )
            {
                if ( a.serializeMe )
                {
                    ret = true;
                }
            }
            return ret;
        },
        areBlocks:function(a) {
            var ret = false;

            if ( ( typeof a == "object" ) && ( a!=null ) && (a.length > 0) )
            {
                if ( this.isBlock( a[0] )) {
                    ret = true;
                }
            }
            return ret;
        },
        /**
         *
         * @private
         */
        _onVariableChanged:function(evt){
            if(evt.item && this.getExpressionModel().variableFuncCache[evt.item.title]){
                delete this.expressionModel.variableFuncCache[evt.item.title];
            }
        },

        init:function(){
            this.getExpressionModel();//create
            this.subscribe(types.EVENTS.ON_DRIVER_VARIABLE_CHANGED,this._onVariableChanged);
            var thiz = this;
            
            this.subscribe(types.EVENTS.ON_MODULE_RELOADED, function(evt){
                var mid = evt.module,
                    newModule = evt.newModule,
                    blocks = thiz.getBlocks(),
                    instances = blocks.filter(function(block){
                        if(block.declaredClass == mid || block.declaredClass == utils.replaceAll('/', '.', mid)){
                            return block
                        }
                        return null;
                    });

                instances && _.each(instances,function(block){
                    mergeNewModule(block,newModule.prototype);
                });
            });            
        },
        /**
         *
         */
        _destroy:function(){
            var allblocks = this.allBlocks();
            for (var i = 0; i < allblocks.length; i++) {

                var obj = allblocks[i];
                if(!obj){
                    continue;
                }
                try {

                    if (obj && obj.stop) {
                        obj.stop(true);
                    }

                    if (obj && obj.reset) {
                        obj.reset();
                    }
                    if (obj && obj._destroy) {
                        obj._destroy();
                    }
                    if (obj && obj.destroy) {
                        obj.destroy();
                    }

                    if(obj._emit) {
                        obj._emit(types.EVENTS.ON_ITEM_REMOVED, {
                            item: obj
                        });
                    }

                }catch(e){
                    debug && console.error('Scope::_destroy: error destroying block '+e.message, obj ? (obj.id +' ' + obj.name) :'empty');
                    debug && console.trace();
                }
            }

        },
        destroy:function(){
            this._destroy();
            this.reset();
            this._destroyed=true;
            delete this.expressionModel;
        },
        /**
         *
         * @param source
         * @param target
         * @param before
         * @param add
         * @returns {boolean}
         */
        moveTo:function(source,target,before,add){
            /**
             * treat first the special case of adding an item
             */
            if(add){

                //remove it from the source parent and re-parent the source
                if(target.canAdd && target.canAdd()){

                    var sourceParent = this.getBlockById(source.parentId);
                    if(sourceParent){
                        sourceParent.removeBlock(source,false);
                    }
                    target.add(source,null,null);
                    return;
                }else{
                    console.error('cant reparent');
                    return false;
                }
            }


            //for root level move
            if(!target.parentId && add==false){
                //if source is part of something, we remove it
                var sourceParent = this.getBlockById(source.parentId);
                if(sourceParent && sourceParent.removeBlock){
                    sourceParent.removeBlock(source,false);
                    source.parentId=null;
                    source.group=target.group;
                }

                var itemsToBeMoved=[];
                var groupItems = this.getBlocks({
                    group:target.group
                });

                var rootLevelIndex=[];
                var store = this.getBlockStore();

                var sourceIndex = store.storage.index[source.id];
                var targetIndex = store.storage.index[target.id];
                for(var i = 0; i<groupItems.length;i++){

                    var item = groupItems[i];
                    //keep all root-level items

                    if( groupItems[i].parentId==null && //must be root
                        groupItems[i]!=source// cant be source
                        ){

                        var itemIndex = store.storage.index[item.id];
                        var add = before ? itemIndex >= targetIndex : itemIndex <= targetIndex;
                        if(add){
                            itemsToBeMoved.push(groupItems[i]);
                            rootLevelIndex.push(store.storage.index[groupItems[i].id]);
                        }
                    }
                }

                //remove them the store
                for(var j = 0; j<itemsToBeMoved.length;j++){
                    store.remove(itemsToBeMoved[j].id);
                }

                //remove source
                this.getBlockStore().remove(source.id);

                //if before, put source first
                if(before){
                    this.getBlockStore().putSync(source);
                }

                //now place all back
                for(var j = 0; j<itemsToBeMoved.length;j++){
                    store.put(itemsToBeMoved[j]);
                }

                //if after, place source back
                if(!before){
                    this.getBlockStore().putSync(source);
                }
                return true;
            //we move from root to lower item
            }else if( !source.parentId && target.parentId && add==false){
                source.group = target.group;

            //we move from root to into root item
            }else if( !source.parentId && !target.parentId && add){

                if(target.canAdd && target.canAdd()){
                    source.group=null;
                    target.add(source,null,null);
                }
                return true;

            // we move within the same parent
            }else if( source.parentId && target.parentId && add==false && source.parentId === target.parentId){
                var parent = this.getBlockById(source.parentId);
                if(!parent){
                    return false;
                }

                var maxSteps = 20;
                var items = parent[parent._getContainer(source)];
                var cIndexSource = source.indexOf(items,source);
                var cIndexTarget = source.indexOf(items,target);
                var direction = cIndexSource > cIndexTarget ? -1 : 1;
                var distance = Math.abs(cIndexSource - ( cIndexTarget + (before ==true ? -1 : 1)));
                for(var i = 0 ; i < distance -1;  i++){
                    parent.move(source,direction);
                }
                return true;

                // we move within the different parents
            }else if( source.parentId && target.parentId && add==false && source.parentId !== target.parentId){                console.log('same parent!');

                var sourceParent = this.getBlockById(source.parentId);
                if(!sourceParent){
                    return false;
                }

                var targetParent = this.getBlockById(target.parentId);
                if(!targetParent){
                    return false;
                }


                //remove it from the source parent and re-parent the source
                if(sourceParent && sourceParent.removeBlock && targetParent.canAdd && targetParent.canAdd()){
                    sourceParent.removeBlock(source,false);
                    targetParent.add(source,null,null);
                }else{
                    return false;
                }

                //now proceed as in the case above : same parents
                var items = targetParent[targetParent._getContainer(source)];
                if(items==null){
                    console.error('weird : target parent has no item container');
                }
                var cIndexSource = targetParent.indexOf(items,source);
                var cIndexTarget = targetParent.indexOf(items,target);
                if(!cIndexSource || !cIndexTarget){
                    console.error(' weird : invalid drop processing state, have no valid item indicies');
                    return;
                }
                var direction = cIndexSource > cIndexTarget ? -1 : 1;
                var distance = Math.abs(cIndexSource - ( cIndexTarget + (before ==true ? -1 : 1)));
                for(var i = 0 ; i < distance -1;  i++){
                    targetParent.move(source,direction);
                }
                return true;
            }

            return false;
        }

    });
    dcl.chainAfter(Module,'destroy');
    return Module;
});
define('xblox/model/BlockModel',[
    'dcl/dcl',
    'xdojo/declare',
    'xide/data/Model',
    'xide/data/Source'
], function(dcl,declare,Model,Source){
    /**
     * Contains provides implements functions to deal with sub blocks.
     */
    return declare('xblox.model.BlockModel',[Model,Source],{
        declaredClass:'xblox.model.BlockModel',
        icon:'fa-play',
        /**
         * Store function override
         * @param parent
         * @returns {boolean}
         */
        mayHaveChildren: function (parent) {
            return this.items != null && this.items.length > 0;
        },

        /**
         * Store function override
         * @param parent
         * @returns {Array}
         */
        getChildren: function (parent) {
            return this.items;
        },
        getBlockIcon:function(){
            return '<span class="' +this.icon + '"></span>';
        }

    });
});
/** @module xblox/data/Store **/
define('xblox/data/Store',[
    "dojo/_base/declare",
    'xide/data/TreeMemory',
    'xide/data/ObservableStore',
    'dstore/Trackable',
    'dojo/Deferred'
], function (declare, TreeMemory, ObservableStore, Trackable, Deferred) {
    return declare("xblox.data.Store", [TreeMemory, Trackable, ObservableStore], {
        idProperty: 'id',
        parentField: 'parentId',
        filter: function (data) {
            var _res = this.inherited(arguments);
            delete this._state.filter;
            this._state.filter = data;
            return _res;
        },
        getChildren: function (object) {
            return this.root.filter({parentId: this.getIdentity(object)});
        },
        _fetchRange: function (kwArgs) {
            var deferred = new Deferred();
            var _res = this.fetchRangeSync(kwArgs);
            var _items;
            if (this._state.filter) {
                //the parent query
                if (this._state && this._state.filter && this._state.filter['parentId']) {
                    var _item = this.getSync(this._state.filter.parentId);
                    if (_item) {
                        this.reset();
                        _items = _item.items;
                        if (_item.getChildren) {
                            _items = _item.getChildren();
                        }
                        deferred.resolve(_items);
                        _res = _items;
                    }
                }

                //the group query
                if (this._state && this._state.filter && this._state.filter['group']) {
                    _items = this.getSync(this._state.filter.parent);
                    if (_item) {
                        this.reset();
                        _res = _item.items;
                    }
                }
            }
            deferred.resolve(_res);
            return deferred;
        },
        mayHaveChildren: function (parent) {
            if (parent.mayHaveChildren) {
                return parent.mayHaveChildren(parent);
            }
            return parent.items != null && parent.items.length > 0;
        }
    });
});



define('xblox/manager/BlockManager',[
    'dcl/dcl',
    'dojo/has',
    'dojo/Deferred',
    'dojo/promise/all',
    'xide/types',
    'xide/utils',
    'xide/factory',
    'xblox/model/ModelBase',
    'xblox/model/Scope',
    'xblox/model/BlockModel',
    'xide/mixins/ReloadMixin',
    'xide/manager/ManagerBase',
    'xblox/data/Store',
    "xdojo/has!xblox-ui?xblox/manager/BlockManagerUI",
    "xide/lodash"
],function (dcl,has,Deferred,all,types,utils,factory,ModelBase,Scope,BlockModel,ReloadMixin,ManagerBase,Store,BlockManagerUI,_){
    var bases = has('host-browser') && has("xblox-ui") ? [BlockManagerUI,ManagerBase,ReloadMixin.dcl] : [ManagerBase,ReloadMixin.dcl];
    var debug = false;
    return dcl(bases,{
        declaredClass:"xblox/manager/BlockManager",
        serviceObject:null,
        loaded:{},
        /***
         *  scope: storage for all registered variables / commands
         */
        scope:null,
        scopes:null,
        //track original create block function
        _createBlock:null,
        _registerActions:function(){},
        toScope:function(data){
            try {
                data = utils.getJson(data);
            } catch (e) {
                console.error('BlockManager::toScope: failed,err='+e);
                return null;
            }

            if(!data){
                console.error('correct data');
                data = {
                    "blocks": [
                    ],
                    "variables": []
                };
            }
            var scopeId = utils.createUUID();
            var blockInData = data;
            //check structure
            if (_.isArray(data)) {// a flat list of blocks

            } else if (_.isObject(data)) {
                scopeId = data.scopeId || scopeId;
                blockInData = data.blocks || [];
            }
            var scopeUserData = {
                owner:this
            };
            var blockScope = this.getScope(scopeId, scopeUserData, true);
            var allBlocks = blockScope.blocksFromJson(blockInData);
            for (var i = 0; i < allBlocks.length; i++) {
                var obj = allBlocks[i];
                obj._lastRunSettings = {
                    force: false,
                    highlight: true
                };
            }
            blockScope.serviceObject = this.serviceObject;
            return blockScope;
        },
        /**
         *
         * @param files{Object[]} array of items to load in this format
         * @example:
         * @returns {Deferred.promise}
         */
        loadFiles:function(files){

            var thiz=this,
                _createDfd = function(mount,path,force,publish)
                {
                    return thiz.load(mount,path,force);
                },
                _promises = [],
                dfd = new Deferred();

            //build promise chain for 'all'
            for (var i = 0; i < files.length; i++) {
                var item = files[i];
                _promises.push(_createDfd(item.mount, item.path, item.force, item.publish));
            }

            //run and resolve head
            all(_promises).then(function(results){
                debug && console.log('got all block files ',results);
                dfd.resolve(results);
            });

            return dfd.promise;
        },
        load:function(mount,path,forceReload){
            var dfd = new Deferred(),
                thiz = this,
                _mount = utils.replaceAll('/','',mount),
                _path = utils.replaceAll('./','',path);

            var full = _mount + _path;
            full = full.trim();

            if(this.loaded[full] && forceReload===true){
                this.removeScope(this.loaded[full].id);
                this.loaded[full]=null;
            }

            if(forceReload !==true && this.loaded[full]){
                dfd.resolve(this.loaded[full]);
                return dfd.promise;
            }
            var _ready = function(data){
                var scope = thiz.toScope(data);
                if(scope){
                    thiz.loaded[full] = scope;

                    scope.mount = mount;//track file info
                    scope.path = path;
                }
                dfd.resolve(scope);
            };
            this.ctx.getFileManager().getContent(_mount,_path,_ready,false);
            return dfd.promise;
        },
        onBlocksReady:function(scope){
            var blocks = scope.allBlocks();
            for (var i = 0; i < blocks.length; i++) {
                var obj = blocks[i];
                this.setScriptFunctions(obj,scope,this);
            }
            /**
             * pick 'On Load' blocks
             */

            var loadBlocks = scope.getBlocks({
                group:'On Load'
            });
            if(loadBlocks && loadBlocks.length>0){
                for (var i = 0; i < loadBlocks.length; i++) {
                    var loadBlock  = loadBlocks[i];
                    if(loadBlock.onLoad){
                        loadBlock.onLoad();
                    }
                }
            }
        },
        getBlock:function(){

        },
        setScriptFunctions:function(obj,scope,owner){

            var thiz=owner;
            //scope.context = obj;//set the context of the blox scope
            if(!obj.blockScope) {
                obj.blockScope = scope;
            }
            debug && console.log('set script functions ' + scope.id,obj);
            scope.serviceObject = this.serviceObject;
            ///////////////////////////////////////////////////////////////////////////////
            //
            //  Variables
            //
            ///////////////////////////////////////////////////////////////////////////////
            /**
             * Add 'setVariable'
             * @param title
             * @param value
             */
            if(!obj.setVariable) {
                obj.setVariable = function (title, value, save, publish, source) {
                    var _scope = this.blockScope;
                    var _variable = _scope.getVariable(title);
                    if (_variable) {
                        _variable.value = value;
                        debug && console.log('setting variable '+title + ' to ' + value);
                    } else {
                        debug && console.log('no such variable : ' + title);
                        return;
                    }
                    if (publish !== false) {

                        thiz.publish(types.EVENTS.ON_VARIABLE_CHANGED, {
                            item: _variable,
                            scope: scope,
                            driver: obj,
                            owner: thiz,
                            save: save === true,
                            source: source || types.MESSAGE_SOURCE.BLOX  //for prioritizing
                        });
                    }
                };
            }
            /**
             * Add getVariable
             * @param title
             */
            if(!obj.getVariable) {
                obj.getVariable = function (title) {
                    var _scope = this.blockScope;
                    var _variable = _scope.getVariable(title);
                    if (_variable) {
                        return _variable.value;
                    }
                    return '';
                };
            }

        },
        hasScope:function(id) {
            if (!this.scopes) {
                this.scopes = {};
            }
            if (this.scopes[id]) {
                return this.scopes[id];
            }
            return null;
        },
        getScope:function(id,userData,publish){
            if(!this.scopes){
              this.scopes={};
            }
            if(!this.scopes[id]){
                this.scopes[id]=this.createScope({
                    id:id,
                    ctx:this.ctx
                });
                this.scopes[id].userData=userData;
                if(publish!==false){
                    try{
                        factory.publish(types.EVENTS.ON_SCOPE_CREATED,this.scopes[id]);
                    }catch(e){
                        console.error('bad, scope creation failed ' +e ,e);
                    }
                }
            }
            return this.scopes[id];
        },
        /**
         *
         * @param id
         * @returns {null}
         */
        removeScope:function(id){
            if(!this.scopes){
                this.scopes={};
            }
            for (var scopeId in this.loaded){
                if(this.loaded[scopeId].id==id){
                    delete this.loaded[scopeId];
                }
            }
            if (this.scopes[id]) {
                this.scopes[id]._destroy();
                delete this.scopes[id];
            }
            return null;
        },
        /**
         *
         * @param mixed
         * @param data
         * @returns {*}
         */
        createScope:function(mixed,data,errorCB){
            data = data || [];
            var blockStore = new Store({
                data: [],
                Model:BlockModel,
                id:utils.createUUID(),
                __events:{

                },
                observedProperties:[
                    "name",
                    "enabled",
                    "value"
                ],
                getLabel:function(item){
                    return item.name;
                },
                labelAttr:'name'
            });
            blockStore.reset();
            blockStore.setData([]);
            var args = {
                owner:this,
                blockStore:blockStore,
                serviceObject:this.serviceObject,
                config:this.config
            };
            utils.mixin(args,mixed);
            try {
                var scope = new Scope(args);
                data && scope.initWithData(data,errorCB);
                scope.init();
            }catch(e){
                logError(e,'error creating scope, data:',mixed);
            }

            return scope;
        },
        onReloaded:function(){
            debug && console.log('on reloaded');
        },
        init:function() {
            this.scope = {
                variables:[],
                blocks: []
            };
            ModelBase.prototype.types=types;
            ModelBase.prototype.factory=factory;
            if(this.onReady){
                this.onReady();
            }
        }
    });
});
/** @module xblox/model/functions/StopBlock **/
define('xblox/model/functions/StopBlock',[
    'dcl/dcl',
    'xide/utils',
    'xide/types',
    'dojo/Deferred',
    "xblox/model/Block"
], function(dcl,utils,types,Deferred,Block){
    /**
     * @augments module:xide/mixins/EventedMixin
     * @extends module:xblox/model/Block_UI
     * @extends module:xblox/model/Block
     * @extends module:xblox/model/ModelBase
     */
    return dcl(Block,{
        declaredClass:"xblox.model.functions.StopBlock",
        command:'Select command please',
        icon:'',
        args:null,
        _timeout:100,
        /***
         * Returns the block run result
         * @param scope
         */
        solve:function(scope,settings) {
            if (this.command){
                var _args = null;
                var block = scope.resolveBlock(this.command);
                if(block && block.stop){
                    var res = block.stop();
                    this.onSuccess(this,settings);
                }else{
                    this.onFailed(this,settings);
                }
                return res;
            }
        },
        hasInlineEdits:true,
        /**
         *
         * @param field
         * @param pos
         * @param type
         * @param title
         * @param mode: inline | popup
         * @returns {string}
         */
        makeEditable:function(field,pos,type,title,mode,options,value){
            var optionsString = "";
            return "<a " + optionsString + "  tabIndex=\"-1\" pos='" + pos +"' display-mode='" + (mode||'popup') + "' display-type='" + (type || 'text') +"' data-prop='" + field + "' data-title='" + title + "' class='editable editable-click'  href='#'>" + this[field] +"</a>";
        },
        getFieldOptions:function(field){
            if(field ==="command"){
                return this.scope.getCommandsAsOptions("text");
            }
        },
        toText:function(){
            var text = 'Unknown';
            var block = this.scope.getBlock(this.command);
            if(block){
                text = block.name;
            }
            if(this.command.indexOf('://')!==-1) {
                text = '<span class="text-info">' +this.scope.toFriendlyName(this,this.command) + '</span>';
            }
            var _out = this.getBlockIcon('D') + 'Stop Command : ' + text;
            return _out;
        },
        onChangeField:function(what,value){
        },
        //  standard call for editing
        getFields:function(){
            var fields = this.inherited(arguments) || this.getDefaultFields();
            var thiz=this;
            var title = 'Command';
            if(this.command.indexOf('://')){
                title = this.scope.toFriendlyName(this,this.command);
            }
            fields.push(utils.createCI('value','xcf.widgets.CommandPicker',this.command,{
                    group:'General',
                    title:'Command',
                    dst:'command',
                    options:this.scope.getCommandsAsOptions(),
                    block:this,
                    pickerType:'command',
                    value:this.command
            }));
            return fields;
        }
    });
});
/** @module xblox/model/functions/PauseBlock **/
define('xblox/model/functions/PauseBlock',[
    'dcl/dcl',
    'xide/utils',
    'xide/types',
    'dojo/Deferred',
    "xblox/model/Block"
], function(dcl,utils,types,Deferred,Block){
    /**
     * @augments module:xide/mixins/EventedMixin
     * @extends module:xblox/model/Block_UI
     * @extends module:xblox/model/Block
     * @extends module:xblox/model/ModelBase
     */
    return dcl(Block,{
        declaredClass:"xblox.model.functions.PauseBlock",
        command:'Select command please',
        icon:'',
        args:null,
        _timeout:100,
        /***
         * Returns the block run result
         * @param scope
         */
        solve:function(scope,settings) {
            if (this.command){
                var _args = null;
                var block = scope.resolveBlock(this.command);
                if(block && block.pause){
                    var res = block.pause();
                    this.onSuccess(this,settings);
                }else{
                    this.onFailed(this,settings);
                }
                return res;
            }
        },
        hasInlineEdits:true,
        /**
         *
         * @param field
         * @param pos
         * @param type
         * @param title
         * @param mode: inline | popup
         * @returns {string}
         */
        makeEditable:function(field,pos,type,title,mode,options,value){
            var optionsString = "";
            return "<a " + optionsString + "  tabIndex=\"-1\" pos='" + pos +"' display-mode='" + (mode||'popup') + "' display-type='" + (type || 'text') +"' data-prop='" + field + "' data-title='" + title + "' class='editable editable-click'  href='#'>" + this[field] +"</a>";
        },
        getFieldOptions:function(field){
            if(field ==="command"){
                return this.scope.getCommandsAsOptions("text");
            }
        },
        toText:function(){
            var text = 'Unknown';
            var block = this.scope.getBlock(this.command);
            if(block){
                text = block.name;
            }
            if(this.command.indexOf('://')!==-1) {
                text = '<span class="text-info">' +this.scope.toFriendlyName(this,this.command) + '</span>';
            }
            var _out = this.getBlockIcon('D') + 'Pause Command : ' + text;
            return _out;
        },
        onChangeField:function(what,value){
        },
        //  standard call for editing
        getFields:function(){
            var fields = this.inherited(arguments) || this.getDefaultFields();
            var thiz=this;
            var title = 'Command';
            if(this.command.indexOf('://')){
                title = this.scope.toFriendlyName(this,this.command);
            }
            fields.push(utils.createCI('value','xcf.widgets.CommandPicker',this.command,{
                    group:'General',
                    title:'Command',
                    dst:'command',
                    options:this.scope.getCommandsAsOptions(),
                    block:this,
                    pickerType:'command',
                    value:this.command
            }));
            return fields;
        }
    });
});
define('xblox/model/functions/SetProperties',[
    'dcl/dcl',
    'xide/utils',
    'xide/types',
    'dojo/Deferred',
    "xblox/model/Block"
], function(dcl,utils,types,Deferred,Block){

    // summary:
    //		The Call Block model.
    //      This block makes calls to another blocks in the same scope by action name

    // module:
    //		xblox.model.functions.CallBlock
    /**
     * @augments module:xide/mixins/EventedMixin
     * @extends module:xblox/model/Block_UI
     * @extends module:xblox/model/Block
     * @extends module:xblox/model/ModelBase
     */
    return dcl(Block,{
        declaredClass:"xblox.model.functions.SetProperties",
        //command: (String)
        //  block action name
        command:'Select block',
        icon:'',
        args:null,
        _timeout:100,
        /***
         * Returns the block run result
         * @param scope
         */
        solve:function(scope,settings) {
            var dfd = new Deferred();
            if (this.command){
                var block = scope.resolveBlock(this.command);
                if(block && this.props){

                    for(var prop in this.props){

                        block.set(prop,this.props[prop]);
                        block[prop] = this.props[prop];
                        block.onChangeField && block.onChangeField(prop,this.props[prop]);
                    }

                    this.onSuccess(this,settings);
                }else{
                    this.onFailed(this,settings);
                }

                dfd.resolve([]);
                return dfd;
            }
            return dfd;
        },
        hasInlineEdits:false,
        /**
         *
         * @param field
         * @param pos
         * @param type
         * @param title
         * @param mode: inline | popup
         * @returns {string}
         */
        makeEditable:function(field,pos,type,title,mode,options,value){

            var optionsString = "";
            if(options){

            }

            return "<a " + optionsString + "  tabIndex=\"-1\" pos='" + pos +"' display-mode='" + (mode||'popup') + "' display-type='" + (type || 'text') +"' data-prop='" + field + "' data-title='" + title + "' class='editable editable-click'  href='#'>" + this[field] +"</a>";
        },
        getFieldOptions:function(field){

            if(field ==="command"){
                return this.scope.getCommandsAsOptions("text");
            }
        },
        toText:function(){

            var text = 'Unknown';
            var block = this.scope.getBlock(this.command);
            if(block){
                text = block.name;
            }
            if(this.command.indexOf('://')!==-1) {
                text = '<span class="text-info">' +this.scope.toFriendlyName(this,this.command) + '</span>';
            }
            //var _out = this.getBlockIcon('D') + 'Call Command : ' + this.makeEditable('command','bottom','select','Enter a unique name','inline');
            var _out = this.getBlockIcon('D') + 'Set Properties : ' + text;
            return _out;
        },
        serializeObject:function(field){

            if(field ==='props'){
                return true;
            }
            return false;
        },
        onChangeField:function(field,newValue,cis){

            if(field==='command'){
                delete this.props;
                this.props = {};
            }
        },
        init:function(){
            if(this.props && _.isString(this.props)){
                this.props = utils.fromJson(this.props);
            }

        },
        //  standard call for editing
        getFields:function(){

            var fields = this.inherited(arguments) || this.getDefaultFields();
            var thiz=this;

            var title = 'Command';
            if(this.command.indexOf('://')){
                title = this.scope.toFriendlyName(this,this.command);
            }

            fields.push(utils.createCI('value','xcf.widgets.CommandPicker',this.command,{
                    group:'General',
                    title:'Command',
                    dst:'command',
                    options:this.scope.getCommandsAsOptions(),
                    block:this,
                    pickerType:'command',
                    value:this.command
            }));

            var block = this.scope.resolveBlock(this.command);
            if(block && block.getFields){
                if(!this.props){
                    this.props = {};
                }
                var _fields = block.getFields();
                var descr = _.find(_fields,{
                    dst:"description"
                });
                _fields.remove(descr);
                _.each(_fields,function(_field){
                    _field.group = "Properties";
                    _field.value = utils.getAt(this.props,_field.dst,_field.value);
                    _field.dst = "props." + _field.dst;

                },this);
                fields = fields.concat(_fields);
            }
            return fields;
        }
    });
});
define('xblox/model/server/ServerBlock',[
    'dcl/dcl',
    "xblox/model/Block",
    "xide/utils"
], function (dcl,Block,utils) {
    /**
     * Runs a JSON-RPC-2.0 method on the server. This assumes that this block's scope has
     * a 'service object'
     */
    return dcl(Block, {
        
        declaredClass:"xblox.model.server.ServerBlock",
        /**
         * The name of the block, used in the UI
         * @member {string}
         */
        name: 'Run Server Block',
        /**
         * The full string of the service class method, ie: MyPHPServerClass::method
         * @member {string}
         */
        method: 'XShell::run',
        /**
         * Arguments for the server call
         * @member {string}
         */
        args: '',
        /**
         * Override in super class, this block runs async by default
         * @member {boolean}
         */
        deferred: true,
        /**
         * The default for the server RPC class
         * @member {string}
         */
        defaultServiceClass: 'XShell',
        /**
         * The default for the server RPC class method
         * @member {string}
         */
        defaultServiceMethod: 'run',
        /**
         * Debugging
         * @member {function}
         */
        sharable:true,

        onReloaded: function () {


            console.log('1');


            return;


            /*console.log('is valid  ' + this.isInValidState());
             console.log('current service class ' + this.getServiceClass());
             console.log('current service class method ' + this.getServiceMethod());*/
            var service = this.getService();
            //var params = this.utils.byString(service,'_smd.services.'+ this.method.replace('::','.'));

            var params = service.getParameterMap(this.getServiceClass(), this.getServiceMethod());
            console.log('params', params);
            var cwd = 'root://test';
            var cmd = 'ls';
            var fun = this.getServerFunction(),
                thiz = this;

            if (fun) {
                var _cb = function (response) {
                    console.log('hello from server', response);
                };
                var _value = service.base64_encode(cmd);
                service.callMethodEx(this.getServiceClass(), 'run', ['sh', _value, cwd], _cb);
            }


        },
        /***
         * Returns the block run result
         * @param scope
         * @param settings
         * @param run
         * @param error
         * @returns {Array}
         */
        solve: function (scope, settings, run, error) {

            this._currentIndex = 0;
            this._return = [];

            var _script = '' + this.method;
            var thiz = this;

            if (_script && _script.length) {

                var _function = new Function("{" + _script + "}");
                var _args = this.getArgs();
                try {
                    var _parsed = _function.apply(this, _args || {});
                    this._lastResult = _parsed;

                    if (run) {
                        run('Expression ' + _script + ' evaluates to ' + _parsed);
                    }
                    if (_parsed !== 'false' && _parsed !== false) {
                        this.onSuccess(this, settings);
                    } else {
                        this.onFailed(this, settings);
                        return [];
                    }
                } catch (e) {
                    if (error) {
                        error('invalid expression : \n' + _script + ': ' + e);
                    }
                    this.onFailed(this, settings);
                    return [];
                }
            } else {
                console.error('have no script');
            }
            var ret = [], items = this[this._getContainer()];
            if (items.length) {
                this.runFrom(items, 0, settings);
            } else {
                this.onSuccess(this, settings);
            }

            return ret;
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  UI
        //
        /////////////////////////////////////////////////////////////////////////////////////
        toText: function () {

            var result = this.getBlockIcon() + ' ' + this.name + ' :: ';
            if (this.method) {
                result += this.method.substr(0, 50);
            }
            return result;
        },

        //  standard call from interface
        canAdd: function () {
            return [];
        },
        getServerDefaultFields:function(target){

            var fields = target || [];

            fields.push(utils.createCI('args', 27, this.args, {
                group: 'General',
                title: 'Arguments',
                dst: 'args'
            }));

            return fields;
        },
        //  standard call for editing
        getFields: function () {
            var fields = this.inherited(arguments) || this.getDefaultFields();
            var thiz = this;
/*
            fields.push(this.utils.createCI('args', 27, this.args, {
                group: 'General',
                title: 'Arguments',
                dst: 'args'
            }));
            */

            return fields;
        },
        getBlockIcon: function () {
            return '<span class="fa-plug"></span>';
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Store
        //
        /////////////////////////////////////////////////////////////////////////////////////
        /**
         * Store function override
         * @param parent
         * @returns {boolean}
         */
        mayHaveChildren: function (parent) {
            return this.items != null && this.items.length > 0;
        },

        /**
         * Store function override
         * @param parent
         * @returns {Array}
         */
        getChildren: function (parent) {
            return this.items;
        },

        /**
         * Check our scope has a service object
         * @returns {boolean}
         */
        isInValidState: function () {
            return this.getService() != null;
        },
        getService: function () {
            return this.scope.getService();
        },
        getServiceClass: function () {
            return this.method.split('::')[0] || this.defaultServiceClass;
        },
        getServiceMethod: function () {
            return this.method.split('::')[1] || this.defaultServiceMethod;
        },
        hasMethod: function (method) {
            return this.isInValidState() &&
            this.getService()[this.getServiceClass()] != null &&
            this.getService()[this.getServiceClass()][this.getServiceMethod()] != null
        },
        hasServerClass: function (_class) {
            return this.isInValidState() &&
            this.getService()[this.getServiceClass()] != null;
        },
        getServerFunction: function () {
            if (this.isInValidState() && this.getServiceClass() && this.getServiceMethod()) {
                return this.getService()[this.getServiceClass()][this.getServiceMethod()];
            }
            return null;
        }
    });
});
define('xblox/model/server/RunServerMethod',[
    "dcl/dcl",
    "xblox/model/server/ServerBlock",
    'xide/utils'
], function (dcl, ServerBlock, utils) {
    /**
     * Runs a JSON-RPC-2.0 method on the server. This assumes that this block's scope has
     * a 'service object'
     */
    return dcl(ServerBlock, {

        declaredClass:"xblox.model.server.RunServerMethod",

        description: 'Runs a JSON-RPC-2.0 method on the server',

        /**
         * The name of the block, used in the UI
         * @member {string}
         */
        name: 'Run Server Method',

        /**
         * The full string of the service class method, ie: MyPHPServerClass::method
         * @member {string}
         */
        method: 'XShell::run',
        /**
         * Arguments for the server call
         * @member {string}
         */
        args: '',
        /**
         * Override in super class, this block runs async by default
         * @member {boolean}
         */
        deferred: true,
        /**
         * The default for the server RPC class
         * @member {string}
         */
        defaultServiceClass: 'XShell',
        /**
         * The default for the server RPC class method
         * @member {string}
         */
        defaultServiceMethod: 'run',

        sharable:true,
        /**
         * Callback when user edited the 'method' field. This will pre-populate the arguments field when empty
         * with the known SMD parameters : if possible.
         * @param newMethod
         * @param cis
         */
        onMethodChanged: function (newMethod, cis) {
            
            this.method = newMethod;

            //we auto populate the arguments field
            if (!utils.isValidString(this.args)) {

                var newServerParams = this.getServerParams();
                if (newServerParams) {
                    this._updateArgs(newServerParams, cis);
                }

            }
        },
        _getArgs: function () {


            /*
            var test = [
                {
                    "name": "shellType",
                    "default": "sh", "optional": false, "value": "notset"
                },
                {
                    "name": "cmd",
                    "optional": false,
                    "value": "[CurrentDirectory]"
                },
                {
                    "name": "cwd",
                    "default": null,
                    "optional": true,
                    "value": "[CurrentDirectory]"
                }
            ];*/


            var _args = utils.getJson(this.args || '[]');
            var result = [];
            if (_args) {
                var isSMD = false;
                //now check this is still in 'SMD' format
                if (_args && _args[0] && _args[0]['optional'] != null) {
                    isSMD = true;
                }
                //if SMD true, evaluate the value field
                if (isSMD) {
                    for (var i = 0; i < _args.length; i++) {
                        var _arg = _args[i];
                        var _variableValue = _arg.value;
                        var isBase64 = _arg.name.indexOf('Base64') != -1;
                        if(isBase64){
                            _variableValue = this.getService().base64_encode(_variableValue);
                        }

                        if (_arg.value !== 'notset') {
                            if (_arg.value.indexOf('[') != -1 && _arg.value.indexOf(']') != -1) {
                                _variableValue = this.scope.expressionModel.replaceVariables(this.scope, _arg.value, false, false);
                                if (_arg.name.indexOf('Base64') != -1) {
                                    _variableValue = this.getService().base64_encode(_variableValue);
                                }
                                result.push(_variableValue);
                            } else {
                                result.push(_variableValue || _arg['default']);
                            }

                        } else {
                            result.push(_arg['default'] || _variableValue);
                        }
                    }
                } else {

                }
            } else {
                return [this.args];
            }

            return result;

        },
        /**
         * Update this.args (string) with a SMD parameter set
         * @param params
         * @param cis
         * @private
         */
        _updateArgs: function (params, cis) {

            var argumentWidget = this.utils.getCIWidgetByName(cis, 'args');
            if (argumentWidget) {
                var _string = JSON.stringify(params);
                argumentWidget.editBox.set('value', _string);
                this.args = _string;

            }
        },
        /**
         * Find SMD for the current method
         * @returns {*}
         */
        getServerParams: function () {
            var service = this.getService();
            var params = service.getParameterMap(this.getServiceClass(), this.getServiceMethod());
            if (params) {
                for (var i = 0; i < params.length; i++) {
                    var param = params[i];
                    param.value = 'notset';
                }
            }
            return params;
        },
        onReloaded: function (evt) {

            console.log('sdfsd');
            this._solve()
        },
        _solve:function(scope,settings,run,error){

            console.log('solve223');

        },
        /***
         * Returns the block run result
         * @param scope
         * @param settings
         * @param run
         * @param error
         * @returns {Array}
         */
        solve: function (scope, settings, run, error) {



            this._return = [];
            this._lastResult=null;
            var thiz = this;
            var ret = [];

            //this._solve();



            //console.dir(this.scope);


            if(!this.isInValidState()){
                this.onFailed(this, settings);
                return ret;
            }

            var _args = this._getArgs();//returns SMD ready array of values
            var _cbSuccess = function (response) {
                thiz._lastResult = thiz.utils.getJson(response) || [response];
                thiz.resolved(thiz._lastResult);
                thiz.onSuccess(thiz, settings);
            };
            var _cbError = function (response) {
                //console.error('   server method ' + thiz.method + ' with params ' + JSON.stringify(_args)  + 'failed ' + response);
                thiz._lastResult = thiz.utils.getJson(response) || [response];
                thiz.resolved(thiz._lastResult);
                thiz.onFailed(thiz, settings);
            };

            this.onRun(this, settings);

            var service = this.getService();
            var serviceObject = this.scope.serviceObject;
            //service.callMethodEx(this.getServiceClass(), this.getServiceMethod(), _args, _cbSuccess,_cbError);

            console.error('run deferred');

            var dfd = serviceObject.runDeferred(this.getServiceClass(),this.getServiceMethod(),_args);
            if(dfd){
                dfd.then(function(data){
                    console.error('returned ',data);
                });
            }

            return dfd;
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  UI
        //
        /////////////////////////////////////////////////////////////////////////////////////
        toText: function () {

            var result = this.getBlockIcon() + ' ' + this.name + ' :: ';
            if (this.method) {
                result += this.method.substr(0, 50);
            }
            return result;
        },

        //  standard call from interface
        canAdd: function () {
            return [];
        },
        //  standard call for editing
        getFields: function () {
            var fields = this.inherited(arguments) || this.getDefaultFields();
            var thiz = this;

            fields.push(utils.createCI('value', 25, this.method, {
                group: 'General',
                title: 'Method',
                dst: 'method',
                description: 'This should be in the format : MyServerClass::myMethod',
                delegate: {
                    runExpression: function (val, run, error) {
                        var old = thiz.method;
                        thiz.method = val;
                        var _res = thiz.solve(thiz.scope, null, run, error);
                    }
                }
            }));
            fields = fields.concat(this.getServerDefaultFields());
            return fields;
        },
        getBlockIcon: function () {
            return '<span class="fa-plug"></span>';
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Store
        //
        /////////////////////////////////////////////////////////////////////////////////////
        /**
         * Store function override
         * @param parent
         * @returns {boolean}
         */
        mayHaveChildren: function (parent) {
            return this.items != null && this.items.length > 0;
        },

        /**
         * Store function override
         * @param parent
         * @returns {Array}
         */
        getChildren: function (parent) {
            return this.items;
        },

        onChangeField: function (field, newValue, cis) {
            if (field === 'method') {
                this.onMethodChanged(newValue, cis);
            }
        },

        /**
         * Check our scope has a service object
         * @returns {boolean}
         */
        isInValidState: function () {

            return this.getService() != null;
        },
        getService: function () {

            var service = this.scope.getService();

            if(!service){
                console.error('have no service object');
            }
            return service;
        },
        getServiceClass: function () {
            return this.method.split('::')[0] || this.defaultServiceClass;
        },
        getServiceMethod: function () {
            return this.method.split('::')[1] || this.defaultServiceMethod;
        },
        hasMethod: function (method) {
            return this.isInValidState() &&
            this.getService()[this.getServiceClass()] != null &&
            this.getService()[this.getServiceClass()][this.getServiceMethod()] != null
        },
        hasServerClass: function (_class) {
            return this.isInValidState() &&
            this.getService()[this.getServiceClass()] != null;
        },
        getServerFunction: function () {
            if (this.isInValidState() && this.getServiceClass() && this.getServiceMethod()) {
                return this.getService()[this.getServiceClass()][this.getServiceMethod()];
            }
            return null;
        }


    });
});
define('xblox/model/server/Shell',[
    "dcl/dcl",
    "xblox/model/server/ServerBlock",
    'xide/utils',
    'xcf/model/Command'
], function (dcl, ServerBlock, utils,Command) {
    /**
     * Runs a JSON-RPC-2.0 method on the server. This assumes that this block's scope has
     * a 'service object'
     */
    return dcl([Command,ServerBlock], {
        declaredClass:"xblox.model.server.Shell",
        description: 'Runs a JSON-RPC-2.0 method on the server',
        /**
         * The name of the block, used in the UI
         * @member {string}
         */
        name: 'Run Shell',

        /**
         * The full string of the service class method, ie: MyPHPServerClass::method
         * @member {string}
         */
        method: '',
        /**
         * Arguments for the server call
         * @member {string}
         */
        args: '',
        /**
         * Override in super class, this block runs async by default
         * @member {boolean}
         */
        deferred: true,
        /**
         * The default for the server RPC class
         * @member {string}
         */
        defaultServiceClass: 'XShell',
        /**
         * The default for the server RPC class method
         * @member {string}
         */
        defaultServiceMethod: 'run',

        sharable:true,
        /**
         * Callback when user edited the 'method' field. This will pre-populate the arguments field when empty
         * with the known SMD parameters : if possible.
         * @param newMethod
         * @param cis
         */
        onMethodChanged: function (newMethod, cis) {
            this.method = newMethod;
            //we auto populate the arguments field
            if (!utils.isValidString(this.args)) {

                var newServerParams = this.getServerParams();
                if (newServerParams) {
                    this._updateArgs(newServerParams, cis);
                }

            }
        },
        _getArgs: function () {


            /*
            var test = [
                {
                    "name": "shellType",
                    "default": "sh", "optional": false, "value": "notset"
                },
                {
                    "name": "cmd",
                    "optional": false,
                    "value": "[CurrentDirectory]"
                },
                {
                    "name": "cwd",
                    "default": null,
                    "optional": true,
                    "value": "[CurrentDirectory]"
                }
            ];*/


            var _args = utils.getJson(this.args || '[]');
            var result = [];
            if (_args) {
                var isSMD = false;
                //now check this is still in 'SMD' format
                if (_args && _args[0] && _args[0]['optional'] != null) {
                    isSMD = true;
                }
                //if SMD true, evaluate the value field
                if (isSMD) {
                    for (var i = 0; i < _args.length; i++) {
                        var _arg = _args[i];
                        var _variableValue = _arg.value;
                        var isBase64 = _arg.name.indexOf('Base64') != -1;
                        if(isBase64){
                            _variableValue = this.getService().base64_encode(_variableValue);
                        }

                        if (_arg.value !== 'notset') {
                            if (_arg.value.indexOf('[') != -1 && _arg.value.indexOf(']') != -1) {
                                _variableValue = this.scope.expressionModel.replaceVariables(this.scope, _arg.value, false, false);
                                if (_arg.name.indexOf('Base64') != -1) {
                                    _variableValue = this.getService().base64_encode(_variableValue);
                                }
                                result.push(_variableValue);
                            } else {
                                result.push(_variableValue || _arg['default']);
                            }

                        } else {
                            result.push(_arg['default'] || _variableValue);
                        }
                    }
                } else {

                }
            } else {
                return [this.args];
            }

            return result;

        },
        /**
         * Update this.args (string) with a SMD parameter set
         * @param params
         * @param cis
         * @private
         */
        _updateArgs: function (params, cis) {

            var argumentWidget = this.utils.getCIWidgetByName(cis, 'args');
            if (argumentWidget) {
                var _string = JSON.stringify(params);
                argumentWidget.editBox.set('value', _string);
                this.args = _string;

            }
        },
        /**
         * Find SMD for the current method
         * @returns {*}
         */
        getServerParams: function () {
            var service = this.getService();
            var params = service.getParameterMap(this.getServiceClass(), this.getServiceMethod());
            if (params) {
                for (var i = 0; i < params.length; i++) {
                    var param = params[i];
                    param.value = 'notset';
                }
            }
            return params;
        },
        onReloaded: function (evt) {
            console.log('sdfsd');
            this._solve()
        },
        _solve:function(scope,settings,run,error){

            console.log('solve223');

        },
        /***
         * Returns the block run result
         * @param scope
         * @param settings
         * @param run
         * @param error
         * @returns {Array}
         */
        solve: function (scope, settings, isInterface,send,run,error) {
            this._return = [];
            this._lastResult=null;
            var thiz = this;
            var ret = [];

            settings = this._lastSettings = settings || this._lastSettings;
            var instance = this.getInstance();
            console.log('run');
            /*
            var value =utils.getJson(args,true,false);
            if(value === null || value === 0 || value === true || value === false || !_.isObject(value)){
                value = {
                    payload:this.args
                }
            }*/

            var code = scope.expressionModel.replaceVariables(scope,this.method,false,false);
            instance.runShell(code,utils.mixin({
            },{}),this.id,this.id,this);


            return;

            if(!this.isInValidState()){
                this.onFailed(this, settings);
                return ret;
            }

            var _args = this._getArgs();//returns SMD ready array of values
            var _cbSuccess = function (response) {
                thiz._lastResult = thiz.utils.getJson(response) || [response];
                thiz.resolved(thiz._lastResult);
                thiz.onSuccess(thiz, settings);
            };
            var _cbError = function (response) {
                //console.error('   server method ' + thiz.method + ' with params ' + JSON.stringify(_args)  + 'failed ' + response);
                thiz._lastResult = thiz.utils.getJson(response) || [response];
                thiz.resolved(thiz._lastResult);
                thiz.onFailed(thiz, settings);
            };

            this.onRun(this, settings);

            var service = this.getService();
            var serviceObject = this.scope.serviceObject;
            //service.callMethodEx(this.getServiceClass(), this.getServiceMethod(), _args, _cbSuccess,_cbError);
            var dfd = serviceObject.runDeferred(this.getServiceClass(),this.getServiceMethod(),_args);
            if(dfd){
                dfd.then(function(data){
                    console.error('returned ',data);
                });
            }

            return dfd;
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  UI
        //
        /////////////////////////////////////////////////////////////////////////////////////
        toText: function () {

            var result = this.getBlockIcon() + ' ' + this.name + ' :: ';
            if (this.method) {
                result += this.method.substr(0, 50);
            }
            return result;
        },

        //  standard call from interface
        canAdd: function () {
            return [];
        },
        //  standard call for editing
        getFields: function () {
            var fields = this.inherited(arguments) || this.getDefaultFields();
            var thiz = this;

            fields.push(utils.createCI('value', 25, this.method, {
                group: 'General',
                title: 'Cmd',
                dst: 'method',
                delegate: {
                    runExpression: function (val, run, error) {
                        var old = thiz.method;
                        thiz.method = val;
                        var _res = thiz.solve(thiz.scope, null, run, error);
                    }
                }
            }));
            //fields = fields.concat(this.getServerDefaultFields());
            return fields;
        },
        getBlockIcon: function () {
            return '<span class="fa-plug"></span>';
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Store
        //
        /////////////////////////////////////////////////////////////////////////////////////
        /**
         * Store function override
         * @param parent
         * @returns {boolean}
         */
        mayHaveChildren: function (parent) {
            return this.items != null && this.items.length > 0;
        },

        /**
         * Store function override
         * @param parent
         * @returns {Array}
         */
        getChildren: function (parent) {
            return this.items;
        },

        onChangeField: function (field, newValue, cis) {
            if (field === 'method') {
                this.onMethodChanged(newValue, cis);
            }
        },

        /**
         * Check our scope has a service object
         * @returns {boolean}
         */
        isInValidState: function () {

            return this.getService() != null;
        },
        getService: function () {
            var service = this.scope.getService();
            if(!service){
                console.error('have no service object');
            }
            return service;
        },
        getServiceClass: function () {
            return this.method.split('::')[0] || this.defaultServiceClass;
        },
        getServiceMethod: function () {
            return this.method.split('::')[1] || this.defaultServiceMethod;
        },
        hasMethod: function (method) {
            return this.isInValidState() &&
            this.getService()[this.getServiceClass()] != null &&
            this.getService()[this.getServiceClass()][this.getServiceMethod()] != null
        },
        hasServerClass: function (_class) {
            return this.isInValidState() &&
            this.getService()[this.getServiceClass()] != null;
        },
        getServerFunction: function () {
            if (this.isInValidState() && this.getServiceClass() && this.getServiceMethod()) {
                return this.getService()[this.getServiceClass()][this.getServiceMethod()];
            }
            return null;
        }


    });
});
/** @module xblox/model/mqtt/Subscribe **/
define('xblox/model/mqtt/Subscribe',[
    'dcl/dcl',
    'xdojo/has',
    "dojo/Deferred",
    "xblox/model/Block",
    'xide/utils',
    'xblox/model/Contains',
    'xide/types'
    //'dojo/has!host-node?dojo/node!tracer',
    //'dojo/has!host-node?nxapp/utils/_console'
], function(dcl,has,Deferred,Block,utils,Contains,types,tracer,_console){


    var isServer = has('host-node');

    var console = typeof window !== 'undefined' ? window.console : global.console;
    if(isServer && tracer && console && console.error){
        console = _console;
    }else{
        //console.error('have no tracer ' + (tracer!=null && tracer.error!=null ? 'tracer ok ' : 'no ') + ' | ' + (console.error!=null ? 'errir ok ' : 'no error') );
        //console.dir(tracer);
    }

    // summary:
    //		The Call Block model.
    //      This block makes calls to another blocks in the same scope by action name

    // module:
    //		xblox.model.code.CallMethod
    /**
     * Base block class.
     *
     * @class module:xblox/model/mqtt/Subscribe
     * @extends module:xblox/model/Block
     */
    return dcl([Block,Contains],{
        declaredClass:"xblox.model.mqtt.Subscribe",
        //method: (String)
        //  block action name
        name:'Subscribe',
        //method: (String)
        //  block action name
        topic:'Topic',
        args:'',
        deferred:false,
        sharable:true,
        context:null,
        icon:'fa-bell',
        /**
         * @type {string|null}
         */
        path:'',
        qos:0,
        stop:function(){
            var instance = this.getInstance();
            if(instance){
                instance.callMethod('unSubscribeTopic',utils.mixin({
                    topic:this.topic
                },utils.getJson(this.args)),this.id,this.id);
            }
        },
        onData:function(message){

            //console.error('-data ' + message.topic,message);
            if(message && message.topic && message.topic==this.topic){

                delete message['src'];
                delete message['id'];


                var thiz=this,
                    ctx = this.getContext(),
                    items = this[this._getContainer()];

                var settings = this._lastSettings;
                var ret=[];
                if(items.length>0){
                    var value = message;
                    var path = this.path && this.path.length ? this.path : (message.payload!==null) ? 'payload' : null;
                    if(path && _.isObject(message)){
                        value = utils.getAt(message,path,message);
                    }

                    //console.error('path=' + path + ' @ ' + message.topic,value);


                    for(var n = 0; n < this.items.length ; n++)
                    {
                        var block = this.items[n];
                        if(block.enabled) {



                            block.override ={
                                args: [value]
                            };
                            ret.push(block.solve(this.scope,settings));
                            //console.log('run block '+block.name);
                        }
                    }
                }
                this.onSuccess(this, this._lastSettings);
                return ret;
            }
        },
        observed:[
            'topic'
        ],
        getContext:function(){
            return this.context || (this.scope.getContext ?  this.scope.getContext() : this);
        },
        /**
         *
         * @param scope
         * @param settings
         * @param run
         * @param error
         */
        solve:function(scope,settings,isInterface,send,run,error){

            this._currentIndex = 0;
            this._return=[];
            this._lastSettings = settings;
            var instance = this.getInstance();

            if(instance){
                instance.callMethod('subscribeTopic',utils.mixin({
                    topic:this.topic,
                    qos:this.qos
                },utils.getJson(this.args ||"{}")),this.id,this.id);
            }
            settings = settings || {};
            this.onRunThis(settings);
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  UI
        //
        /////////////////////////////////////////////////////////////////////////////////////
        toText:function(){

            var result = '<span style="">' +
                this.getBlockIcon() + '' + this.makeEditable('topic','bottom','text','Enter a topic','inline') + ' :: '+'</span>';

            if(this.topic){
                result+= this.topic.substr(0,30);
            }
            return result;
        },
        //  standard call from interface
        canAdd:function(){
            return [];
        },
        //  standard call for editing
        getFields:function(){

            var fields = this.inherited(arguments) || this.getDefaultFields();
            var thiz=this;

            fields.push(
                utils.createCI('name',13,this.name,{
                    group:'General',
                    title:'Name',
                    dst:'name'
                })
            );

            fields.push(utils.createCI('arguments',27,this.args,{
                    group:'Arguments',
                    title:'Arguments',
                    dst:'args'
                }));

            fields.push(utils.createCI('topic',types.ECIType.STRING,this.topic,{
                    group:'General',
                    title:'Topic',
                    dst:'topic',
                    select:true
                }));

            fields.push(utils.createCI('name',types.ECIType.ENUMERATION,this.qos,{
                    group:'General',
                    title:'QOS',
                    dst:'qos',
                    widget: {
                        options: [
                            {
                                label:"0 - at most once",
                                value:0
                            },
                            {
                                label:"1 - at least once",
                                value:1
                            },
                            {
                                label:"2 - exactly once",
                                value:2
                            }
                        ]
                    }
                })
            );

            fields.push(utils.createCI('path',types.ECIType.STRING,this.path,{
                group:'General',
                title:'Value Path',
                dst:'path'
            }));
            return fields;
        }
    });
});
/** @module xblox/model/mqtt/Publish **/
define('xblox/model/mqtt/Publish',[
    'dcl/dcl',
    'xdojo/has',
    "dojo/Deferred",
    "xblox/model/Block",
    'xide/utils',
    'xblox/model/Contains',
    'xide/types',
    'xcf/model/Command'
    //'xdojo/has!host-node?dojo/node!tracer',
    //'xdojo/has!host-node?nxapp/utils/_console'
], function(dcl,has,Deferred,Block,utils,Contains,types,Command,tracer,_console){
    var isServer = has('host-node');
    var console = typeof window !== 'undefined' ? window.console : global.console;
    if(isServer && tracer && console && console.error){
        console = _console;
    }else{
        //console.error('have no tracer ' + (tracer!=null && tracer.error!=null ? 'tracer ok ' : 'no ') + ' | ' + (console.error!=null ? 'errir ok ' : 'no error') );
        //console.dir(tracer);
    }

    // summary:
    //		The Call Block model.
    //      This block makes calls to another blocks in the same scope by action name

    // module:
    //		xblox.model.code.CallMethod
    /**
     * Base block class.
     *
     * @class module:xblox/model/mqtt/Publish
     * @extends module:xblox/model/Block
     */
    return dcl(Command,{
        declaredClass:"xblox.model.mqtt.Publish",
        //method: (String)
        //  block action name
        name:'Publish',
        //method: (String)
        //  block action name
        topic:'',
        args:'',
        deferred:false,
        sharable:true,
        context:null,
        icon:'fa-send',
        isCommand:true,
        qos:0,
        retain:false,
        /**
         * @type {string|null}
         */
        path:null,
        onData:function(message){
            if(message && message.topic && message.topic==this.topic){
                var thiz=this,
                    ctx = this.getContext(),
                    items = this[this._getContainer()];

                var settings = this._lastSettings;
                var ret=[];
                if(items.length>0){

                    var value = message;
                    this.path = 'value';
                    if(this.path && _.isObject(message)){
                        value = utils.getAt(message,this.path,message);
                    }

                    for(var n = 0; n < this.items.length ; n++)
                    {
                        var block = this.items[n];
                        if(block.enabled) {
                            block.override ={
                                args: [value]
                            };
                            ret.push(block.solve(this.scope,settings));
                        }
                    }
                }
                this.onSuccess(this, this._lastSettings);
                return ret;
            }
        },
        observed:[
            'topic'
        ],
        getContext:function(){
            return this.context || (this.scope.getContext ?  this.scope.getContext() : this);
        },
        /**
         *
         * @param scope
         * @param settings
         * @param isInterface
         * @param send
         * @param run
         * @param error
         */
        solve:function(scope,settings,isInterface,send,run,error){

            this._currentIndex = 0;
            this._return=[];

            settings = this._lastSettings = settings || this._lastSettings;

            var instance = this.getInstance();
            if(isInterface ==true && this._loop){
                this.reset();
            }

            var args = this.args;
            var inArgs = this.getArgs(settings);
            if(inArgs[0]){
                args = inArgs[0];
            }

            if(instance){
                var value =utils.getJson(args,true,false);
                if(value === null || value === 0 || value === true || value === false || !_.isObject(value)){
                    value = {
                        payload:this.args
                    }
                }
                var topic = scope.expressionModel.replaceVariables(scope,this.topic,false,false);

                instance.callMethod('publishTopic',utils.mixin({
                    topic:topic,
                    qos:this.qos,
                    retain:this.retain
                },value),this.id,this.id);
            }

            settings = settings || {};

            this.onDidRun();

            this.onSuccess(this, settings);
            return true;
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  UI
        //
        /////////////////////////////////////////////////////////////////////////////////////
        toText:function(icon,label,detail,breakDetail){
            var out = '<span style="">' + this.getBlockIcon() + ' ' + this.makeEditable('name','top','text','Enter a name','inline') + ' :: '+'</span>';
            if(this.topic){
                out+= this.makeEditable('topic','bottom','text','Enter a topic','inline');
                this.startup && (out +=this.getIcon('fa-bell inline-icon text-warning','text-align:right;float:right;',''));
                this.interval > 0 && (out +=this.getIcon('fa-clock-o inline-icon text-warning','text-align:right;float:right',''));
            }
            return out;
        },
        //  standard call from interface
        canAdd:function(){
            return [];
        },
        //  standard call for editing
        getFields:function(){

            var fields = this.inherited(arguments) || this.getDefaultFields();

            fields.push(utils.createCI('qos',types.ECIType.ENUMERATION,this.qos,{
                    group:'General',
                    title:'QOS',
                    dst:'qos',
                    widget: {
                        options: [
                            {
                                label:"0 - at most once",
                                value:0
                            },
                            {
                                label:"1 - at least once",
                                value:1
                            },
                            {
                                label:"2 - exactly once",
                                value:2
                            }
                        ]
                    }
                })
            );



            //
            //var type = 'xide/widgets/JSONDualEditorWidget';//27
            fields.push(utils.createCI('arguments',27,this.args,{
                    group:'Arguments',
                    title:'Arguments',
                    dst:'args'
                }));

            fields.push(utils.createCI('topic',types.ECIType.STRING,this.topic,{
                group:'General',
                title:'Topic',
                dst:'topic',
                select:true
            }));

            fields.push(utils.createCI('retain',types.ECIType.BOOL,this.retain,{
                group:'General',
                title:'Retain',
                dst:'retain'
            }));

            fields.remove(_.find(fields,{
                name:"send"
            }));

            fields.remove(_.find(fields,{
                name:"waitForResponse"
            }));

            return fields;
        }
    });
});


/** @module xblox/model/File/ReadJSON **/
define('xblox/model/File/ReadJSON',[
    'dcl/dcl',
    'xdojo/has',
    "dojo/Deferred",
    "xblox/model/Block",
    'xide/utils',
    'xblox/model/Contains',
    'dojo/promise/all',
    'xide/types',
    'module',
    "xdojo/has!xblox-ui?xfile/data/DriverStore",
    'xdojo/has!xblox-ui?xfile/views/FileGridLight'
], function(dcl,has,Deferred,Block,utils,Contains,all,types,module,DriverStore,FileGridLight){

    var isServer = has('host-node');
    var isElectron = has('electronx');
    var isIDE = has('xcf-ui');
    var hasPHP = has('php');
    /**
     *
     * @class module:xblox/model/code/RunScript
     * @extends module:xblox/model/Block
     */
    return dcl([Block,Contains],{
        declaredClass:"xblox.model.File.ReadJSON",
        name:'Read JSON',
        deferred:false,
        sharable:false,
        context:null,
        icon:'fa-file',
        observed:[
            'path'
        ],
        getContext:function(){
            return this.context || (this.scope.getContext ?  this.scope.getContext() : this);
            return this.context || this;
        },
        getFileContent:function(path){
            
            var head = new Deferred();
            var scope = this.getScope();
            var ctx = scope.ctx;
            var fileManager = ctx.getFileManager();
            //use file manager
            if(isIDE){
            }
            
            var deviceManager = ctx.getDeviceManager();
            var fileServer = deviceManager.getInstanceByName('File-Server');
            if(!fileServer){
                console.error('ReadJSON : have no file server driver');
            }

            var dfd = fileServer.callCommand('GetProg', {
                override: {
                    args: [path]
                }
            });


            return dfd;
            
        },
        processJSON:function(data,settings){
            var path = this.jsonPath;
            if(path){
                var at = utils.getAt(data,path);
                this._lastResult = at;
            }else{
                this._lastResult = data;
            }
            this.onSuccess(this, settings);
            this.runByType(types.BLOCK_OUTLET.FINISH,settings);
        },
        /**
         *
         * @param scope
         * @param settings
         * @param isInterface
         * @param send
         * @param run
         * @param error
         * @returns {*}
         */
        solve:function(scope,settings,isInterface,run,error){

            this._currentIndex = 0;
            this._return=[];

            settings = this._lastSettings = settings || this._lastSettings || {};
            
            var _script = ('' + this._get('path'));

            var thiz=this,
                ctx = this.getContext(),
                items = this[this._getContainer()],

                //outer head dfd
                dfd = new Deferred,
                self = this;

            this.onRunThis(settings);

            var expression = scope.expressionModel.replaceVariables(scope,_script,null,null);

            console.log('path '+expression);

            var getDfd = this.getFileContent(expression);

            getDfd.then(function(data){
                var content = data.content;
                if(content){
                    content = utils.getJson(content,true);
                    if(content){
                        self.processJSON(content,settings);
                    }
                }
            });

            /*

            var _function = scope.expressionModel.expressionCache[expression];
            if(!_function){
                _function = scope.expressionModel.expressionCache[expression] = new Function("{" + expression + "}");
            }
            */



            var _args = thiz.getArgs(settings) || [];

            try {

                //console.log('parsed _ '+_parsed);
                //thiz._lastResult = _parsed;
                if (run) {
                    run('Expression ' + _script + ' evaluates to ' + expression);
                }

/*
                if (_parsed !== 'false' && _parsed !== false) {
                    thiz.onSuccess(thiz, settings);
                } else {
                    thiz.onFailed(thiz, settings);
                }
                */
            } catch (e) {
                e=e ||{};
                thiz.onDidRunItemError(dfd,e,settings);
                thiz.onFailed(thiz,settings);
                if (error) {
                    error('invalid expression : \n' + _script + ': ' + e);
                }
            }
            return dfd;
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  UI
        //
        /////////////////////////////////////////////////////////////////////////////////////
        toText:function(){
            var result = '<span style="">' + this.getBlockIcon() + ' ' + this.name + ' :: '+'</span>';
            if(this.path){
                result+= this.path.substr(0,50);
            }
            return result;
        },
        //  standard call from interface
        canAdd:function(){
            return [];
        },
        //  standard call for editing
        getFields:function(){

            var fields = this.inherited(arguments) || this.getDefaultFields();
            var thiz=this;


            var store = null;
            var scope = this.getScope();
            var ctx = scope.ctx;

            var deviceManager = ctx.getDeviceManager();
            var fileServer = deviceManager.getInstanceByName('File-Server');
            var permissions = utils.clone(types.DEFAULT_FILE_GRID_PERMISSIONS);


            var FilePickerOptions = {
                ctx: ctx,
                owner: this,
                selection: '/',
                resizeToParent: true,
                Module: FileGridLight,
                permissions: permissions
            }

            if(fileServer && DriverStore){

                    var config = {};
                    var options = {
                        fields: types.FIELDS.SHOW_ISDIR | types.FIELDS.SHOW_OWNER | types.FIELDS.SHOW_SIZE |
                        types.FIELDS.SHOW_FOLDER_SIZE |
                        types.FIELDS.SHOW_MIME |
                        types.FIELDS.SHOW_PERMISSIONS |
                        types.FIELDS.SHOW_TIME |
                        types.FIELDS.SHOW_MEDIA_INFO
                    };

                function createStore(ext) {

                    return new DriverStore({
                        data: [],
                        config: config,
                        mount: 'none',
                        options: options,
                        driver: fileServer,
                        micromatch: "(*.json)|!(*.*)", // Only folders and json files
                        //micromatch: "(*.mp3)|(*.wav)|(*.webm)|!(*.*)", // Only folders and json files
                        glob:ext
                    });
                }


                FilePickerOptions.leftStore =createStore("/*");
                FilePickerOptions.rightStore=createStore("/*");

            }

            fields.push(utils.createCI('path',4,this.path,{
                    group:'General',
                    title:'Path',
                    dst:'path',
                    filePickerOptions:FilePickerOptions,
                    widget:{
                        item:this
                    }
            }));

            fields.push(utils.createCI('jsonPath',13,this.jsonPath,{
                group:'General',
                title:'Select',
                dst:'jsonPath'
            }));

            return fields;

/*
            fields.push(
                utils.createCI('value',types.ECIType.EXPRESSION_EDITOR,this.method,{
                    group:'Script',
                    title:'Script',
                    dst:'method',
                    select:true,
                    widget:{
                        allowACECache:true,
                        showBrowser:false,
                        showSaveButton:true,
                        editorOptions:{
                            showGutter:true,
                            autoFocus:false
                        },
                        item:this
                    },
                    delegate:{
                        runExpression:function(val,run,error){
                            var old = thiz.method;
                            thiz.method=val;
                            var _res = thiz.solve(thiz.scope,null,run,error);
                        }
                    }
                }));
            return fields;
            */
        }
    });
});
define('xblox/factory/Blocks',[
    'xide/factory',
    'xide/utils',
    'xide/types',
    'xide/mixins/ReloadMixin',
    'xide/mixins/EventedMixin',
    "xblox/model/logic/CaseBlock",
    "xblox/model/Block",
    "xblox/model/functions/CallBlock",
    "xblox/model/functions/StopBlock",
    "xblox/model/functions/PauseBlock",
    "xblox/model/functions/SetProperties",
    "xblox/model/code/CallMethod",
    "xblox/model/code/RunScript",
    "xblox/model/loops/ForBlock",
    "xblox/model/loops/WhileBlock",
    "xblox/model/variables/VariableAssignmentBlock",
    "xblox/model/logic/IfBlock",
    "xblox/model/logic/ElseIfBlock",
    "xblox/model/logic/SwitchBlock",
    "xblox/model/variables/VariableSwitch",
    "xblox/model/logging/Log",
    "xblox/model/server/RunServerMethod",
    "xblox/model/server/Shell",
    "xblox/model/code/RunBlock",
    "xblox/model/events/OnEvent",
    "xblox/model/events/OnKey",
    "xblox/model/mqtt/Subscribe",
    "xblox/model/mqtt/Publish",
    "xblox/model/File/ReadJSON",
    "xcf/factory/Blocks"
], function (factory,
             utils,
             types,
             ReloadMixin,EventedMixin,
             CaseBlock,
             Block,
             CallBlock,
             StopBlock,
             PauseBlock,
             SetProperties,
             CallMethod,
             RunScript,
             ForBlock,
             WhileBlock,
             VariableAssignmentBlock,
             IfBlock,
             ElseIfBlock,
             SwitchBlock,
             VariableSwitch,
             Log,
             RunServerMethod,
             Shell,
             RunBlock,
             OnEvent,
             OnKey,
             Subscribe,
             Publish,
             ReadJSON){

    var cachedAll = null;

    factory.prepareBlockContructorArgs=function(ctorArgs){
        if(!ctorArgs){
            ctorArgs={};
        }

        //prepare items
        if(!ctorArgs['id']){
            ctorArgs['id']=utils.createUUID();
        }
        if(!ctorArgs['items']){
            ctorArgs['items']=[];
        }
    };
    /***
     *
     * @param mixed String|Prototype
     * @param ctorArgs
     * @param baseClasses
     * @param publish
     */
    factory.createBlock=function(mixed,ctorArgs,baseClasses,publish){
        //complete missing arguments:
        factory.prepareBlockContructorArgs(ctorArgs);
        var block= factory.createInstance(mixed,ctorArgs,baseClasses);
        block.ctrArgs=null;
        var newBlock;
        try{
            if(block && block.init){
                block.init();
            }
            //add to scope
            if (block.scope) {
                newBlock = block.scope.registerBlock(block,publish);
            }

            if(block.initReload){
                block.initReload();
            }
        }catch(e){
            logError(e,'create block');
        }
        return newBlock || block;
    };
    factory.clearVariables=function(){};
    factory.getAllBlocks=function(scope,owner,target,group,allowCache){
        if(allowCache!==false && cachedAll !=null){
            /**
             * remove dynamic blocks like 'Set Variable'
             */
            for (var i = 0; i < cachedAll.length; i++) {
                var obj = cachedAll[i];
                if(obj.name==='Set Variable'){
                    cachedAll.remove(obj);
                    break;
                }
            }
            return cachedAll;
        }else if(allowCache==false){
            cachedAll=null;
        }
        var items = factory._getFlowBlocks(scope,owner,target,group);
        items = items.concat(factory._getLoopBlocks(scope,owner,target,group));
        items = items.concat(factory._getCommandBlocks(scope,owner,target,group));
        items = items.concat(factory._getCodeBlocks(scope,owner,target,group));
        items = items.concat(factory._getEventBlocks(scope,owner,target,group));
        items = items.concat(factory._getLoggingBlocks(scope,owner,target,group));
        items = items.concat(factory._getServerBlocks(scope,owner,target,group));
        items = items.concat(factory._getMQTTBlocks(scope,owner,target,group));
        items = items.concat(factory._getFileBlocks(scope,owner,target,group));
        cachedAll = items;
        return items;
    };
    factory._getMQTTBlocks=function(scope,owner,target,group){
        var items = [];
        items.push({
            name:'MQTT',
            iconClass: 'fa-cloud',
            items:[
                {
                    name:'Subscribe',
                    owner:owner,
                    iconClass:'fa-bell',
                    proto:Subscribe,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                },
                {
                    name:'Publish',
                    owner:owner,
                    iconClass:'fa-send',
                    proto:Publish,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                }
            ]
        });
        //tell everyone
        factory.publish(types.EVENTS.ON_BUILD_BLOCK_INFO_LIST,{
            items:items,
            group:'MQTT'
        });
        return items;

    };

    factory._getFileBlocks=function(scope,owner,target,group){
        var items = [];
        items.push({
            name:'File',
            iconClass: 'fa-file',
            items:[
                {
                    name:'%%Read JSON',
                    owner:owner,
                    iconClass:'fa-file',
                    proto:ReadJSON,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                }
            ]
        });

        //tell everyone
        factory.publish(types.EVENTS.ON_BUILD_BLOCK_INFO_LIST,{
            items:items,
            group:'File'
        });
        return items;

    };
    
    factory._getServerBlocks=function(scope,owner,target,group){
        var items = [];
        items.push({
            name:'Server',
            iconClass: 'el-icon-repeat',
            items:[
                {
                    name:'Run Server Method',
                    owner:owner,
                    iconClass:'fa-plug',
                    proto:RunServerMethod,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                },
                {
                    name:'Shell',
                    owner:owner,
                    iconClass:'fa-code',
                    proto:Shell,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                }
            ]
        });

        //tell everyone
        factory.publish(types.EVENTS.ON_BUILD_BLOCK_INFO_LIST,{
            items:items,
            group:'Server'
        });
        return items;
    };
    factory._getVariableBlocks=function(scope,owner,target,group){
        var items = [];
        items.push({
            name:'Flow',
            iconClass:'el-icon-random',
            items:[
                {
                    name:'If...Else',
                    owner:owner,
                    iconClass:'el-icon-fork',
                    proto:IfBlock,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group,
                        condition:"[value]=='PW'"
                    }
                }/*,
                {
                    name:'Switch',
                    owner:owner,
                    iconClass:'el-icon-fork',
                    proto:SwitchBlock,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                }
                */
            ]
        });

        return items;
    };
    factory._getEventBlocks=function(scope,owner,target,group){
        var items = [];
        items.push({
            name:'Events',
            iconClass:'fa-bell',
            items:[
                {
                    name:'On Event',
                    owner:owner,
                    iconClass:'fa-bell',
                    proto:OnEvent,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                },
                {
                    name:'On Key',
                    owner:owner,
                    iconClass:'fa-keyboard-o',
                    proto:OnKey,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                }
            ]
        });
        //tell everyone
        factory.publish(types.EVENTS.ON_BUILD_BLOCK_INFO_LIST,{
            items:items,
            group:'Events'
        });

        return items;
    };
    factory._getLoggingBlocks=function(scope,owner,target,group){
        var items = [];
        items.push({
            name:'Logging',
            iconClass:'fa-bug',
            items:[
                {
                    name:'Log',
                    owner:owner,
                    iconClass:'fa-bug',
                    proto:Log,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                }
            ]
        });

        //tell everyone
        factory.publish(types.EVENTS.ON_BUILD_BLOCK_INFO_LIST,{
            items:items,
            group:'Logging'
        });

        return items;
    };
    factory._getCodeBlocks=function(scope,owner,target,group){
        var items = [];
        items.push({
            name:'Code',
            iconClass:'fa-code',
            items:[
                {
                    name:'Call Method',
                    owner:owner,
                    iconClass:'el-icon-video',
                    proto:CallMethod,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                },
                {
                    name:'Run Script',
                    owner:owner,
                    iconClass:'fa-code',
                    proto:RunScript,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                },
                {
                    name:'Run Block',
                    owner:owner,
                    iconClass:'fa-code',
                    proto:RunBlock,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                },
                {
                    name:'Set Properties',
                    owner:owner,
                    iconClass:'fa-code',
                    proto:SetProperties,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                }
            ]
        });
        //tell everyone
        factory.publish(types.EVENTS.ON_BUILD_BLOCK_INFO_LIST,{
            items:items,
            group:'Code'
        });
        return items;
    };
    factory._getFlowBlocks=function(scope,owner,target,group){
        var items = [];
        items.push({
            name:'Flow',
            iconClass:'el-icon-random',
            items:[
                {
                    name:'If...Else',
                    owner:owner,
                    iconClass:'el-icon-fork',
                    proto:IfBlock,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group,
                        condition:"[value]=='PW'"
                    }
                },
                {
                    name:'Switch',
                    owner:owner,
                    iconClass:'el-icon-fork',
                    proto:SwitchBlock,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                },
                {
                    name:'Variable Switch',
                    owner:owner,
                    iconClass:'el-icon-fork',
                    proto:VariableSwitch,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                }
            ]
        });

        //tell everyone
        factory.publish(types.EVENTS.ON_BUILD_BLOCK_INFO_LIST,{
            items:items,
            group:'Flow'
        });
        return items;
    };
    factory._getLoopBlocks=function(scope,owner,target,group){
        var items = [];
        items.push({
            name:'Loops',
            iconClass: 'el-icon-repeat',
            items:[
                {
                    name:'While',
                    owner:owner,
                    iconClass:'el-icon-repeat',
                    proto:WhileBlock,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group,
                        condition:"[Volume]<=100"
                    }
                },
                {
                    name:'For',
                    owner:owner,
                    iconClass:'el-icon-repeat',
                    proto:ForBlock,
                    target:target,
                    ctrArgs:{
                        scope:scope,
                        group:group,
                        initial: '1',
                        comparator: "<=",
                        "final": '5',
                        modifier: '+1',
                        counterName: 'value'
                    }
                }
            ]
        });

        //tell everyone
        factory.publish(types.EVENTS.ON_BUILD_BLOCK_INFO_LIST,{
            items:items,
            group:'Loops'
        });
        return items;
    };
    factory._getMathBlocks=function(scope,owner,dstItem,group){
        var items = [];
        items.push({
            name:'Math',
            owner:this,
            iconClass:'el-icon-qrcode',
            dstItem:dstItem,
            items:[
                {
                    name:'If...Else',
                    owner:dstItem,
                    iconClass:'el-icon-compass',
                    proto:IfBlock,
                    item:dstItem,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                }
            ]
        });
        return items;
    };
    factory._getTimeBlocks=function(scope,owner,dstItem,group){
        var items = [];
        items.push({
            name:'Time',
            owner:this,
            iconClass:'el-icon-qrcode',
            dstItem:dstItem,
            items:[
                {
                    name:'If...Else',
                    owner:dstItem,
                    iconClass:'el-icon-time',
                    proto:IfBlock,
                    item:dstItem,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                }

            ]
        });
        return items;
    };
    factory._getTransformBlocks=function(scope,owner,dstItem,group){
        var items = [];
        items.push({
            name:'Time',
            owner:this,
            iconClass:'el-icon-magic',
            dstItem:dstItem,
            items:[
                {
                    name:'If...Else',
                    owner:dstItem,
                    iconClass:'el-icon-time',
                    proto:IfBlock,
                    item:dstItem,
                    ctrArgs:{
                        scope:scope,
                        group:group
                    }
                }
            ]
        });
        return items;
    };
    return factory;
});
define('xblox/embedded',[
    'dojo/_base/declare',
    'xide/types',
    'xblox/types/Types',
    'xide/factory',
    'xide/utils',
    'xide/mixins/ReloadMixin',
    'xide/mixins/EventedMixin',
    "xblox/model/logic/CaseBlock",
    "xblox/model/Block",
    "xblox/model/functions/CallBlock",
    "xblox/model/code/CallMethod",
    "xblox/model/code/RunScript",
    "xblox/model/code/RunBlock",
    "xblox/model/loops/ForBlock",
    "xblox/model/loops/WhileBlock",
    "xblox/model/variables/VariableAssignmentBlock",
    "xblox/model/logic/IfBlock",
    "xblox/model/logic/ElseIfBlock",
    "xblox/model/logic/SwitchBlock",
    "xblox/model/variables/VariableSwitch",
    "xblox/model/events/OnEvent",
    "xblox/model/events/OnKey",
    "xblox/model/logging/Log",
    "xblox/model/html/SetStyle",
    "xblox/model/html/SetCSS",
    "xblox/model/html/SetStyle",
    "xblox/manager/BlockManager",
    "xblox/factory/Blocks",
    "xdojo/has!xblox-ui?xblox/model/Block_UI"
], function () {
    if(!Array.prototype.remove){
        Array.prototype.remove= function(){
            var what, a= arguments, L= a.length, ax;
            while(L && this.length){
                what= a[--L];
                if(this.indexOf==null){
                    break;
                }
                while((ax= this.indexOf(what))!= -1){
                    this.splice(ax, 1);
                }
            }
            return this;
        };
    }
    if(!Array.prototype.swap){
        Array.prototype.swap = function (x,y) {
            var b = this[x];
            this[x] = this[y];
            this[y] = b;
            return this;
        };
    }

    if ( typeof String.prototype.startsWith != 'function' ) {
        String.prototype.startsWith = function( str ) {
            return this.substring( 0, str.length ) === str;
        };
    }

    if ( typeof String.prototype.endsWith != 'function' ) {
        String.prototype.endsWith = function( str ) {
            return this.substring( this.length - str.length, this.length ) === str;
        };
    }

    if(!Function.prototype.bind) {
        // Cheap polyfill to approximate bind(), make Safari happy
        Function.prototype.bind = Function.prototype.bind || function (that) {
            return dojo.hitch(that, this);
        };
    }
});
define('xblox/model/html/SetState',[
    "dcl/dcl",
    "xblox/model/Block",
    'xide/utils',
    'xide/types',
    'xide/mixins/EventedMixin',
    'xblox/model/Referenced',
    "dojo/dom-attr",
    "dojo/dom-style",
    "dojo/_base/Color",
    "xide/registry"
], function(dcl,Block,utils,types,EventedMixin,Referenced,domAttr,domStyle,Color,registry){

    var debug = true;
    // summary:
    //		The Call Block model.
    //      This block makes calls to another blocks in the same scope by action name

    // module:
    //		xblox.model.code.CallMethod
    //declare("xblox.model.html.SetStyle",[Block,EventedMixin,Referenced]
    var Impl = {
        declaredClass:"xblox.model.html.SetState",
        //method: (String)
        //  block name
        name:'Set State',
        reference:'',
        references:null,
        description:'Switches to a state',
        value:'',
        mode:1,
        sharable:false,
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  UI
        //
        /////////////////////////////////////////////////////////////////////////////////////
        /**
         * Run this block
         * @param scope
         * @param settings
         */
        solve:function(scope,settings) {
            var value = this.value;
            settings = settings || {};
            settings.flags = types.CIFLAG.DONT_PARSE;
            var objects = this.resolveReference(this.deserialize(this.reference),settings);
            if(this.override && this.override.variables){
                value = utils.replace(value,null,this.override.variables,{
                    begin:'{',
                    end:'}'
                });
            }
            if(objects && objects.length){
                _.each(objects,function(object){
                    var widget = object
                    var _widget = registry.byId(widget.id) || widget;
                    if(widget!=_widget){

                    }
                    if(_widget && _widget.setState){
                        _widget.setState(value);
                    }
                });
            }
            this.onSuccess(this,settings);
            this.onDidRun();//clear overrides
        },
        /**
         * Get human readable string for the UI
         * @returns {string}
         */
        toText:function(){
            var _ref = this.deserialize(this.reference);
            var result = this.getBlockIcon() + ' ' + this.name + ' :: on ' + _ref.reference + ' to' || ' ' + ' to ';
            if(this.value){
                result+= ' ' + this.value;
            }
            return result;
        },
        /**
         * Standard call when editing this block
         * @returns {*}
         */
        getFields:function(){
            var fields = this.getDefaultFields(false);

            var referenceArgs = {
                group:'General',
                dst:'reference',
                value:this.reference
            };
            fields.push(utils.createCI('State',types.ECIType.STRING,this.value,{
                group:'General',
                dst:'value',
                value:this.value,
                intermediateChanges:false
            }));


            fields.push(utils.createCI('Target',types.ECIType.WIDGET_REFERENCE,this.reference,referenceArgs));

            //fields.push(utils.createCI('Target',types.ECIType.WIDGET_REFERENCE,this.reference,referenceArgs));

            return fields;
        },
        getBlockIcon:function(){
            return '<span class="fa-paint-brush"></span>';
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Lifecycle
        //
        /////////////////////////////////////////////////////////////////////////////////////
        getPropValue:function(stylesObject,prop){
            for (var _prop in stylesObject) {
                if(_prop === prop){
                    return stylesObject[_prop];
                }
            }
            return null;
        },
        updateObject:function(obj,style,mode){
            if(!obj){
                return false;
            }
            mode = mode || 1;
            if(obj.domNode!=null){
                obj = obj.domNode;
            }
            var currentStyle = domAttr.get(obj,'style');
            if(currentStyle===";"){
                currentStyle="";
            }
            if(currentStyle===""){
                if(obj['lastStyle']!=null){
                    currentStyle = obj['lastStyle'];
                }else {
                    currentStyle = style;
                }
            }

            if(currentStyle===";"){
                currentStyle=style;
            }
            switch (mode){
                //set
                case 1:{

                    var currentStyleMap = this._toObject(currentStyle);
                    var props = style.split(';');
                    var css={};
                    for (var i = 0; i < props.length; i++) {
                        var _style = props[i].split(':');
                        if(_style.length==2){
                            currentStyleMap[_style[0]]=_style[1];
                        }
                    }
                    var styles=[];
                    for (var p in currentStyleMap){
                        styles.push(p + ':' +currentStyleMap[p]);
                    }
                    $(obj).attr('style',styles.join(';'));
                    break;
                }
                //add
                case 2:{

                    var _newStyle = currentStyle + ';' + style,
                        _newStyleT = _.uniq(_newStyle.split(';')).join(';');

                    domAttr.set(obj,'style',_newStyleT);
                    break;
                }
                //remove
                case 3:{
                    domAttr.set(obj,'style',utils.replaceAll(style,'',currentStyle));
                    break;
                }
                //increase
                case 4:
                //decrease
                case 5:{

                    var	numbersOnlyRegExp = new RegExp(/(\D*)(-?)(\d+)(\D*)/);

                    /**
                     * compute current style values of the object
                     * @type {{}}
                     */
                    var stylesRequested = this._toObject(style);
                    var stylesComputed = {};
                    var jInstance = $(obj);
                    ///determine from node it self
                    if(stylesRequested) {
                        for (var prop in stylesRequested) {
                            var currentStyle = this._getStyle(prop,obj,jInstance);
                            stylesComputed[prop] = currentStyle;
                            //console.log('style value for ' + prop + ' is now  at ' + currentStyle + ' ' + obj.id);
                        }
                    }

                    var _newStyleObject = {};
                    /**
                     * compute the new style
                     * @type {number}
                     */
                    for (var prop in stylesRequested){

                        var _prop = '' + prop.trim();
                        var multiplicator = 1;
                        if(stylesComputed[_prop]!=null){

                            var _valueRequested = stylesRequested[prop];
                            var _valueComputed = stylesComputed[prop];

                            var _isHex = _valueRequested.indexOf('#')!=-1;
                            var _isRGB = _valueRequested.indexOf('rgb')!=-1;
                            var _isRGBA = _valueRequested.indexOf('rgba')!=-1;

                            if( _isHex || _isRGB || _isRGBA){

                                var dColorMultiplicator = dojo.colorFromString(_valueRequested);
                                //var dColorNow = dojo.colorFromString('rgba(0.1,0.1,0.1,0.1)');
                                var dColorNow = dojo.colorFromString(_valueRequested);
                                var dColorComputed = dojo.colorFromString(_valueComputed);
                                var dColorNew = new Color();

                                _.each(["r", "g", "b", "a"], function(x){
                                    dColorNew[x] = Math.min(dColorComputed[x] + dColorMultiplicator[x], x=="a" ? 1 : 255);
                                });

                                console.log('color computed ' + dColorComputed.toRgba() + ' color requested: ' + dColorNow.toRgba() +   ' | multiplicator color = ' + dColorMultiplicator.toRgba() +  ' is then = ' + dColorNew.toRgba());

                                var _valueOut = '';
                                if(_isHex){
                                    _valueOut = dColorNew.toHex();
                                }else if(_isRGB){
                                    _valueOut = dColorNew.toCss(false);
                                }else if(_isRGBA){
                                    _valueOut = dColorNew.toCss(true);
                                }
                                //var _newValue = this._changeValue(styles[prop],delta * multiplicator);
                                _newStyleObject[prop]=_valueOut;
                                domStyle.set(obj,prop, _valueOut);//update
                                //var dColorNow = dojo.colorFromString(st);
                                //var dColorMultiplicatorRGBA = dColorMultiplicator.toRgba();
                                //console.log('color ' + dColorMultiplicatorRGBA  , dColorMultiplicator);


                            }else{
                                //extract actual number :
                                var numberOnly = numbersOnlyRegExp.exec(stylesComputed[_prop]);
                                if(numberOnly && numberOnly.length>=3){
                                    var _int = parseInt(numberOnly[3]);
                                    if(_int && _int>0){
                                        multiplicator  = _int;
                                    }
                                }
                            }
                        }
                    }
                    var delta = mode == 4 ? 1 : -1;
                    //now get an object array of the styles we'd like to alter
                    var styles = this._toObject(currentStyle);
                    var inStyles = this._toObject(style);
                    if(!styles){
                        return false;
                    }
                    var _skipped = [];
                    for(var prop in styles){
                        var _prop = '' + prop.trim();
                    }

                    var newStyleString = this._toStyleString(_newStyleObject);
                    break;
                }
            }
        },
        onChangeField:function(field,newValue,cis){
            
            /*
            this._destroy();
            
            if(field=='mode' && newValue!==this.mode){
                this.mode = newValue;
            }
            if(field=='value' && newValue!==this.value){
                this.onDomStyleChanged(null,newValue,this.mode);
                this.value = newValue;
            }
            if(field=='reference'){
                this.onReferenceChanged(newValue,cis);
            }
            this.inherited(arguments);
            */
        },
        activate:function(){
            this._destroy();//you never know
        },
        deactivate:function(){
            this._destroy();
        },
        _destroy:function(){

        }
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Utils
        //
        /////////////////////////////////////////////////////////////////////////////////////
        

    };

    //package via declare
    var _class = dcl([Block,EventedMixin.dcl,Referenced.dcl],Impl);
    //static access to Impl.
    _class.Impl = Impl;
    return _class;

});
define('decor/features',["requirejs-dplugins/has"], function (has) {
	/* global Platform */
	has.add("console-api", typeof console !== "undefined");
	has.add("host-browser", typeof window !== "undefined");
	has.add("object-observe-api", typeof Object.observe === "function" && typeof Array.observe === "function");
	has.add("object-is-api", !!Object.is);
	has.add("setimmediate-api", typeof setImmediate === "function");
	has.add("mutation-observer-api",
		typeof MutationObserver !== "undefined"
			&& (/\[\s*native\s+code\s*\]/i.test(MutationObserver) // Avoid polyfill version of MutationObserver
				|| !/^\s*function/.test(MutationObserver)));
	has.add("polymer-platform", typeof Platform !== "undefined");
	return has;
});

/** @module decor/schedule */
define('decor/schedule',["./features"], function (has) {
	"use strict";

	/**
	 * Calls a function at the end of microtask.
	 * @function module:decor/schedule
	 * @param {Function} callback The function to call at the end of microtask.
	 */

	/* global setImmediate */
	var inFlight,
		SCHEDULEID_PREFIX = "_schedule",
		seq = 0,
		uniqueId = Math.random() + "",
		callbacks = {},
		pseudoDiv = has("mutation-observer-api") && document.createElement("div");
	function runCallbacks() {
		for (var anyWorkDone = true; anyWorkDone;) {
			anyWorkDone = false;
			for (var id in callbacks) {
				var callback = callbacks[id];
				delete callbacks[id];
				callback();
				anyWorkDone = true;
			}
		}
		inFlight = false;
	}
	if (has("mutation-observer-api")) {
		pseudoDiv.id = 0;
		new MutationObserver(runCallbacks).observe(pseudoDiv, {attributes: true});
	} else if (!has("setimmediate-api") && has("host-browser")) {
		window.addEventListener("message", function (event) {
			if (event.data === uniqueId) {
				runCallbacks();
			}
		});
	}
	return function (callback) {
		var id = SCHEDULEID_PREFIX + seq++;
		callbacks[id] = callback;
		if (!inFlight) {
			has("mutation-observer-api") ? ++pseudoDiv.id :
				has("setimmediate-api") ? setImmediate(runCallbacks) :
				window.postMessage(uniqueId, "*");
			inFlight = true;
		}
		return {
			remove: function () {
				delete callbacks[id];
			}
		};
	};
});

/**
 * @license domReady 2.0.1 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/domReady/LICENSE
 */
/*jslint */
/*global require: false, define: false, requirejs: false,
  window: false, clearInterval: false, document: false,
  self: false, setInterval: false */


define('requirejs-domready/domReady',[],function () {
    'use strict';

    var isTop, testDiv, scrollIntervalId,
        isBrowser = typeof window !== "undefined" && window.document,
        isPageLoaded = !isBrowser,
        doc = isBrowser ? document : null,
        readyCalls = [];

    function runCallbacks(callbacks) {
        var i;
        for (i = 0; i < callbacks.length; i += 1) {
            callbacks[i](doc);
        }
    }

    function callReady() {
        var callbacks = readyCalls;

        if (isPageLoaded) {
            //Call the DOM ready callbacks
            if (callbacks.length) {
                readyCalls = [];
                runCallbacks(callbacks);
            }
        }
    }

    /**
     * Sets the page as loaded.
     */
    function pageLoaded() {
        if (!isPageLoaded) {
            isPageLoaded = true;
            if (scrollIntervalId) {
                clearInterval(scrollIntervalId);
            }

            callReady();
        }
    }

    if (isBrowser) {
        if (document.addEventListener) {
            //Standards. Hooray! Assumption here that if standards based,
            //it knows about DOMContentLoaded.
            document.addEventListener("DOMContentLoaded", pageLoaded, false);
            window.addEventListener("load", pageLoaded, false);
        } else if (window.attachEvent) {
            window.attachEvent("onload", pageLoaded);

            testDiv = document.createElement('div');
            try {
                isTop = window.frameElement === null;
            } catch (e) {}

            //DOMContentLoaded approximation that uses a doScroll, as found by
            //Diego Perini: http://javascript.nwbox.com/IEContentLoaded/,
            //but modified by other contributors, including jdalton
            if (testDiv.doScroll && isTop && window.external) {
                scrollIntervalId = setInterval(function () {
                    try {
                        testDiv.doScroll();
                        pageLoaded();
                    } catch (e) {}
                }, 30);
            }
        }

        //Check if document already complete, and if so, just trigger page load
        //listeners. Latest webkit browsers also use "interactive", and
        //will fire the onDOMContentLoaded before "interactive" but not after
        //entering "interactive" or "complete". More details:
        //http://dev.w3.org/html5/spec/the-end.html#the-end
        //http://stackoverflow.com/questions/3665561/document-readystate-of-interactive-vs-ondomcontentloaded
        //Hmm, this is more complicated on further use, see "firing too early"
        //bug: https://github.com/requirejs/domReady/issues/1
        //so removing the || document.readyState === "interactive" test.
        //There is still a window.onload binding that should get fired if
        //DOMContentLoaded is missed.
        if (document.readyState === "complete") {
            pageLoaded();
        }
    }

    /** START OF PUBLIC API **/

    /**
     * Registers a callback for DOM ready. If DOM is already ready, the
     * callback is called immediately.
     * @param {Function} callback
     */
    function domReady(callback) {
        if (isPageLoaded) {
            callback(doc);
        } else {
            readyCalls.push(callback);
        }
        return domReady;
    }

    domReady.version = '2.0.1';

    /**
     * Loader Plugin API method
     */
    domReady.load = function (name, req, onLoad, config) {
        if (config.isBuild) {
            onLoad(null);
        } else {
            domReady(onLoad);
        }
    };

    /** END OF PUBLIC API **/

    return domReady;
});

define('delite/features',["requirejs-dplugins/has"], function (has) {
	// Flag for whether to create background iframe behind popups like Menus and Dialog.
	// A background iframe is useful to prevent problems with popups appearing behind applets/pdf files.
	has.add("config-bgIframe", false);

	// Flag to enable advanced bidi support
	has.add("bidi", false);

	// Flag to enable inheritance direction from any ancestor
	has.add("inherited-dir", false);

	if (typeof window !== "undefined") {
		// Returns the name of the method to test if an element matches a CSS selector.
		has.add("dom-matches", function () {
			var node = document.body;
			if (node.matches) {
				return "matches";
			}
			if (node.webkitMatchesSelector) {
				return "webkitMatchesSelector";
			}
			if (node.mozMatchesSelector) {
				return "mozMatchesSelector";
			}
			if (node.msMatchesSelector) {
				return "msMatchesSelector";
			}
		});

		// Does platform have native support for document.registerElement() or a polyfill to simulate it?
		has.add("document-register-element", !!document.registerElement);

		// Test for how to monitor DOM nodes being inserted and removed from the document.
		// For DOMNodeInserted events, there are two variations:
		//		"root" - just notified about the root of each tree added to the document
		//		"all" - notified about all nodes added to the document
		has.add("MutationObserver", window.MutationObserver ? "MutationObserver" : window.WebKitMutationObserver ?
			"WebKitMutationObserver" : "");
		has.add("DOMNodeInserted", function () {
			var root = document.createElement("div"),
				child = document.createElement("div"),
				sawRoot, sawChild;
			root.id = "root";
			child.id = "child";
			root.appendChild(child);

			function listener(event) {
				if (event.target.id === "root") {
					sawRoot = true;
				}
				if (event.target.id === "child") {
					sawChild = true;
				}
			}

			document.body.addEventListener("DOMNodeInserted", listener);
			document.body.appendChild(root);
			document.body.removeChild(root);
			document.body.removeEventListener("DOMNodeInserted", listener);
			return sawChild ? "all" : sawRoot ? "root" : "";
		});

		// Can we use __proto__ to reset the prototype of DOMNodes?
		// It's not available on IE<11, and even on IE11 it makes the node's attributes
		// (ex: node.attributes, node.textContent) disappear, so disabling it on IE11 too.
		has.add("dom-proto-set", function () {
			var node = document.createElement("div");
			/* jshint camelcase: false */
			/* jshint proto: true */
			return !!node.__proto__;
			/* jshint camelcase: true */
			/* jshint proto: false */
		});

		// Support for <template> elements (specifically, that their content is available via templateNode.content
		// rather than templateNode.children[] etc.
		has.add("dom-template", !!document.createElement("template").content);
	}

	return has;
});
/** @module delite/register */
define('delite/register',[
	"module",
	"dcl/advise",
	"dcl/dcl",
	"decor/schedule",
	"requirejs-domready/domReady",	// loading as a function, not as a plugin
	"./features"
], function (module, advise, dcl, schedule, domReady, has) {
	"use strict";

	var doc = has("builder") ? require.nodeRequire("jsdom").jsdom("") : document;

	// Set to true after the page finishes loading and the parser runs.  Any widgets declared after initialParseComplete
	// instantiated in a separate code path.
	var initialParseComplete;

	// Workaround problem using dcl() on native DOMNodes on FF and IE,
	// see https://github.com/uhop/dcl/issues/9.
	// Fixes case where tabIndex is declared in a mixin that's passed to register().
	dcl.mix = function (a, b) {
		for (var n in b) {
			try {
				a[n] = b[n];
			} catch (e) {
				Object.defineProperty(a, n, {
					configurable: true,
					writable: true,
					enumerable: true,
					value: b[n]
				});
			}
		}
	};

	/**
	 * List of selectors that the parser needs to search for as possible upgrade targets.  Mainly contains
	 * the widget custom tags like d-accordion, but also selectors like button[is='d-button'] to find <button is="...">
	 * @type {string[]}
	 */
	var selectors = [];

	/**
	 * Internal registry of widget class metadata.
	 * Key is custom widget tag name, used as Element tag name like <d-accordion> or "is" attribute like
	 * <button is="d-accordion">).
	 * Value is metadata about the widget, including its prototype, ex: {prototype: object, extends: "button", ... }
	 * @type {Object}
	 */
	var registry = {};

	/**
	 * Create an Element.  Similar to document.createElement(), but if tag is the name of a widget defined by
	 * register(), then it upgrades the Element to be a widget.
	 * @function module:delite/register.createElement
	 * @param {string} tag
	 * @returns {Element} The DOMNode
	 */
	function createElement(tag) {
		if (/-/.test(tag) && !(tag in registry) && !has("builder")) {
			// Try to help people that have templates with custom elements but they forgot to do requires="..."
			console.warn("register.createElement(): undefined tag '" + tag +
				"', did you forget requires='...' in your template?");
		}

		var base = registry[tag] ? registry[tag].extends : null;
		if (has("document-register-element")) {
			return base ? doc.createElement(base, tag) : doc.createElement(tag);
		} else {
			var element = doc.createElement(base || tag);
			if (base) {
				element.setAttribute("is", tag);
			}
			upgrade(element);
			return element;
		}
	}

	/**
	 * Generate metadata about all the properties in proto, both direct and inherited.
	 * On IE<=10, these properties will be applied to a DOMNode via Object.defineProperties().
	 * Skips properties in the base element (HTMLElement, HTMLButtonElement, etc.)
	 * @param {Object} proto - The prototype.
	 * @returns {Object} Hash from property name to return value from `Object.getOwnPropertyDescriptor()`.
	 */
	function getPropDescriptors(proto) {
		var props = {};

		do {
			var keys = Object.getOwnPropertyNames(proto);	// better than Object.keys() because finds hidden props too
			for (var i = 0, k; (k = keys[i]); i++) {
				if (!props[k]) {
					props[k] = Object.getOwnPropertyDescriptor(proto, k);
				}
			}
			proto = Object.getPrototypeOf(proto);
		} while (!/HTML[a-zA-Z]*Element/.test(proto.constructor.toString()));

		return props;
	}

	/**
	 * Converts plain Element of custom type into "custom element", by adding the widget's custom methods, etc.
	 * Does nothing if the Element has already been converted or if it doesn't correspond to a registered custom tag.
	 * After the upgrade, calls `createdCallback()`.
	 *
	 * Usually the application will not need to call this method directly, because it's called automatically
	 * on page load and as elements are added to the document.
	 *
	 * @function module:delite/register.upgrade
	 * @param {Element} element - The DOM node.
	 * @param {boolean} [attach] - If `element`'s tag has been registered, but `attachedCallback()` hasn't yet been
	 * called [since the last call to `detachedCallback()`], then call `attachedCallback()`.  Call even if the element
	 * has already been upgraded.
	 */
	function upgrade(element, attach) {
		if (!has("document-register-element")) {
			var widget = registry[element.getAttribute("is") || element.nodeName.toLowerCase()];
			if (widget) {
				if (!element._upgraded) {
					if (has("dom-proto-set")) {
						// Redefine Element's prototype to point to widget's methods etc.
						/*jshint camelcase: false*/
						/*jshint proto: true*/
						element.__proto__ = widget.prototype;
						/*jshint camelcase: true*/
						/*jshint proto: false*/
					} else {
						// Mixin all the widget's methods etc. into Element
						Object.defineProperties(element, widget.props);
					}
					element._upgraded = true;
					if (element.createdCallback) {
						element.createdCallback();
					}
				}
				if (attach && !element._attached) {
					element.attachedCallback();
				}
			}
		}
	}

	/**
	 * Call detachedCallback() on specified Element if it's a custom element that was upgraded by us.
	 * @param {Element} node
	 */
	function detach(node) {
		if (node._upgraded) {
			node.detachedCallback();
		}
	}

	/**
	 * Mapping of tag names to HTMLElement interfaces.
	 * Doesn't include newer elements not available on all browsers.
	 * @type {Object}
	 */
	var tagMap = typeof HTMLElement !== "undefined" && {	// "typeof HTMLElement" check so module loads in NodeJS
		a: HTMLAnchorElement,
		// applet: HTMLAppletElement,
		// area: HTMLAreaElement,
		// audio: HTMLAudioElement,
		base: HTMLBaseElement,
		br: HTMLBRElement,
		button: HTMLButtonElement,
		canvas: HTMLCanvasElement,
		// data: HTMLDataElement,
		// datalist: HTMLDataListElement,
		div: HTMLDivElement,
		dl: HTMLDListElement,
		directory: HTMLDirectoryElement,
		// embed: HTMLEmbedElement,
		fieldset: HTMLFieldSetElement,
		font: HTMLFontElement,
		form: HTMLFormElement,
		head: HTMLHeadElement,
		h1: HTMLHeadingElement,
		html: HTMLHtmlElement,
		hr: HTMLHRElement,
		iframe: HTMLIFrameElement,
		img: HTMLImageElement,
		input: HTMLInputElement,
		// keygen: HTMLKeygenElement,
		label: HTMLLabelElement,
		legend: HTMLLegendElement,
		li: HTMLLIElement,
		link: HTMLLinkElement,
		map: HTMLMapElement,
		// media: HTMLMediaElement,
		menu: HTMLMenuElement,
		meta: HTMLMetaElement,
		// meter: HTMLMeterElement,
		ins: HTMLModElement,
		object: HTMLObjectElement,
		ol: HTMLOListElement,
		optgroup: HTMLOptGroupElement,
		option: HTMLOptionElement,
		// output: HTMLOutputElement,
		p: HTMLParagraphElement,
		param: HTMLParamElement,
		pre: HTMLPreElement,
		// progress: HTMLProgressElement,
		quote: HTMLQuoteElement,
		script: HTMLScriptElement,
		select: HTMLSelectElement,
		// source: HTMLSourceElement,
		// span: HTMLSpanElement,
		style: HTMLStyleElement,
		table: HTMLTableElement,
		caption: HTMLTableCaptionElement,
		// td: HTMLTableDataCellElement,
		// th: HTMLTableHeaderCellElement,
		col: HTMLTableColElement,
		tr: HTMLTableRowElement,
		tbody: HTMLTableSectionElement,
		textarea: HTMLTextAreaElement,
		// time: HTMLTimeElement,
		title: HTMLTitleElement,
		// track: HTMLTrackElement,
		ul: HTMLUListElement,
		// blink: HTMLUnknownElement,
		video: HTMLVideoElement
	};
	var tags = tagMap && Object.keys(tagMap);

	/**
	 * Registers the tag with the current document, and save tag information in registry.
	 * Handles situations where the base constructor inherits from
	 * HTMLElement but is not HTMLElement.
	 * @param  {string}   tag         The custom tag name for the element, or the "is" attribute value.
	 * @param  {string}	  _extends    The name of the tag this element extends, ex: "button" for <button is="...">
	 * @param  {string}   baseElement The native HTML*Element "class" that this custom element is extending.
	 * @param  {Function} baseCtor    The constructor function.
	 * @return {Function}             The "new" constructor function that can create instances of the custom element.
	 */
	function getTagConstructor(tag, _extends, baseElement, baseCtor) {
		var proto = baseCtor.prototype,
			config = registry[tag] = {
				constructor: baseCtor,
				prototype: proto
			};

		if (_extends) {
			config.extends = _extends;
		}

		if (has("document-register-element")) {
			doc.registerElement(tag, config);
		} else {
			if (!has("dom-proto-set")) {
				// Get descriptors for all the properties in the prototype.  This is needed on IE<=10 in upgrade().
				config.props = getPropDescriptors(proto);
			}
		}

		// Note: if we wanted to support registering new types after the parser was called, then here we should
		// scan the document for the new type (selectors[length-1]) and upgrade any nodes found.

		// Create a constructor method to return a DOMNode representing this widget.
		var tagConstructor = function (params) {
			// Create new widget node or upgrade existing node to widget
			var node = createElement(tag);

			// Set parameters on node
			for (var name in params || {}) {
				if (name === "style") {
					node.style.cssText = params.style;
				} else if ((name === "class" || name === "className") && node.setClassComponent) {
					node.setClassComponent("user", params[name]);
				} else {
					node[name] = params[name];
				}
			}
			if (node.deliver) {
				node.deliver();
			}

			return node;
		};

		// Add some flags for debugging and return the new constructor
		tagConstructor.tag = tag;
		tagConstructor._ctor = baseCtor;

		// Register the selector to find this custom element
		var selector = _extends ? _extends + "[is='" + tag + "']" : tag;
		selectors.push(selector);

		// If the document has already been parsed then do a supplementary sweep for this new custom element.
		if (initialParseComplete && !has("document-register-element")) {
			unobserve();	// pause listening for added/deleted nodes
			parse(doc, selector);
			observe();	// resume listening for added/deleted nodes
		}

		return tagConstructor;
	}

	/**
	 * Restore the "true" constructor when trying to recombine custom elements
	 * @param  {Function} extension A constructor function that might have a shadow property that contains the
	 *                              original constructor
	 * @return {Function}           The original construction function or the existing function/object
	 */
	function restore(extension) {
		return (extension && extension._ctor) || extension;
	}

	/**
	 * Declare a widget and register it as a custom element.
	 *
	 * props{} can provide custom setters/getters for widget properties, which are called automatically when
	 * the widget properties are set.
	 * For a property XXX, define methods _setXXXAttr() and/or _getXXXAttr().
	 *
	 * @param  {string}               tag             The custom element's tag name.
	 * @param  {Object[]}             superclasses    Any number of superclasses to be built into the custom element
	 *                                                constructor. But first one must be [descendant] of HTMLElement.
	 * @param  {Object}               props           Properties of this widget class.
	 * @return {Function}                             A constructor function that will create an instance of the custom
	 *                                                element.
	 * @function module:delite/register
	 */
	function register(tag, superclasses, props) {
		// Create the widget class by extending specified superclasses and adding specified properties.

		// Make sure all the bases have their proper constructors for being composited.
		// I.E. remove the wrapper added by getTagConstructor().
		var bases = (superclasses instanceof Array ? superclasses : superclasses ? [superclasses] : []).map(restore);


		// Check to see if the custom tag is already registered
		if (tag in registry) {
			throw new TypeError("A widget is already registered with tag '" + tag + "'.");
		}

		// Get root (aka native) class: HTMLElement, HTMLInputElement, etc.
		var baseElement = bases[0];
		if (baseElement.prototype && baseElement.prototype._baseElement) {
			// The first superclass is a widget created by another call to register, so get that widget's root class
			baseElement = baseElement.prototype._baseElement;
		}

		// Get name of tag that this widget extends, for example <button is="..."> --> "button"
		var _extends;
		if (baseElement !== HTMLElement) {
			_extends = tags.filter(function (tag) {
				return tagMap[tag] === baseElement;
			})[0];
			if (!_extends) {
				throw new TypeError(tag + ": must have HTMLElement in prototype chain");
			}
		}

		// Get a composited constructor
		var ctor = dcl(bases, props || {}),
			proto = ctor.prototype;
		proto._ctor = ctor;
		proto._baseElement = baseElement;
		proto._tag = tag;
		proto._extends = _extends;

		// Monkey-patch attachedCallback() and detachedCallback() to avoid double executions.
		// Generally this isn't an issue, but it could happen if the app manually called the functions
		// and then they were called automatically too.
		advise.around(proto, "attachedCallback", function (sup) {
			return function () {
				if (this._attached) { return; }
				if (sup) { sup.apply(this, arguments); }
				this._attached = true;
			};
		});
		advise.around(proto, "detachedCallback", function (sup) {
			return function () {
				if (!this._attached) { return; }
				if (sup) { sup.apply(this, arguments); }
				this._attached = false;
			};
		});

		// Run introspection to add ES5 getters/setters.
		// Doesn't happen automatically because Stateful's constructor isn't called.
		// Also, on IE this needs to happen before the getTagConstructor() call,
		// since getTagConstructor() scans all the properties on the widget prototype.
		if (proto.introspect) {
			ctor._propsToObserve = proto.getProps();
			proto.introspect(ctor._propsToObserve);
			ctor.introspected = true;
		}

		// Save widget metadata to the registry and return constructor that creates an upgraded DOMNode for the widget
		/* jshint boss:true */
		return getTagConstructor(tag, _extends, baseElement, ctor);
	}

	/**
	 * Parse the given DOM tree for any Elements that need to be upgraded to widgets.
	 * Searches all descendants of the specified node, but does not upgrade the node itself.
	 *
	 * Usually the application will not need to call this method directly, because it's called automatically
	 * on page load and as elements are added to the document.
	 *
	 * @function module:delite/register.parse
	 * @param {Element} [root] DOM node to parse from.
	 * @param {String} [selector] The selector to use to detect custom elements.  Defaults to selector
	 * for all registered custom elements.
	 */
	function parse(root, selector) {
		if (has("document-register-element")) { return; }
		selector = selector || selectors.join(", ");
		if (selector) {
			var node, idx = 0, nodes = (root || doc).querySelectorAll(selector);
			while ((node = nodes[idx++])) {
				upgrade(node, true);
			}
		}
	}

	// ------------------------
	// Code to listen for nodes being added/deleted from the document, to automatically call parse()/detachedCallback()
	var observer;

	/**
	 * Start listening for added/deleted nodes.
	 */
	function observe() {
		if (!has("document-register-element")) {
			if (!observer) {
				if (has("MutationObserver")) {
					observer = new MutationObserver(processMutations);
				} else {
					// Fallback for Android < 4.2 and IE < 11.  Partial shim of MutationObserver, except sometimes
					// addedNodes lists all nodes not just the root of each added tree.
					observer = {
						takeRecords: function () {
							var ret = this._mutations;
							this._mutations = [];
							if (this._timer) {
								this._timer.remove();
								this._timer = null;
							}
							return ret;
						},
						observe: function () {
							this._mutations = [];
							this._listener = function (event) {
								if (event.target.nodeType === 1) {
									var mutation = {};
									mutation[event.type === "DOMNodeInserted" ? "addedNodes" : "removedNodes"] =
										[event.target];
									this._mutations.push(mutation);
								}
								if (!this._timer) {
									this._timer = schedule(function () {
										this._timer = null;
										processMutations(this.takeRecords());
									}.bind(this));
								}
							}.bind(this);
							doc.body.addEventListener("DOMNodeInserted", this._listener);
							doc.body.addEventListener("DOMNodeRemoved", this._listener);
						},
						disconnect: function () {
							doc.body.removeEventListener("DOMNodeInserted", this._listener);
							doc.body.removeEventListener("DOMNodeRemoved", this._listener);
						}
					};
				}
			}
			observer.observe(doc.body, {childList: true, subtree: true});
		}
	}

	/**
	 * Stop (aka pause) listening for added/deleted nodes.
	 */
	function unobserve() {
		if (observer) {
			// TODO: This method is supposed to pause listening for DOM updates,
			// but I suspect disconnect() also throws away records
			// for any mutations that have already occurred.   Those records need to be saved or processed.
			observer.disconnect();
		}
	}

	/**
	 * Process the added/deleted nodes.  Called for incremental updates after initial parse.
	 * @param mutations
	 */
	function processMutations(mutations) {
		if (!has("document-register-element") && selectors.length) {
			unobserve();	// pause listening for added/deleted nodes
			var parseDescendants = has("MutationObserver") || has("DOMNodeInserted") === "root";
			mutations.forEach(function (mutation) {
				var added, idx1 = 0;
				while ((added = mutation.addedNodes && mutation.addedNodes[idx1++])) {
					// contains() checks avoid calling attachedCallback() on nodes not attached to document because:
					//		1. node was added then removed before processMutations() was called
					//		2. node was added and then its ancestor was removed before processMutations() was called
					if (added.nodeType === 1 && added.ownerDocument.body.contains(added)) {
						// upgrade the node itself (if it's a custom widget and it hasn't been upgraded yet),
						// and then call attachedCallback() on it
						upgrade(added, true);

						// upgrade any descendants that are custom widgets (if they aren't already upgraded),
						// and then call attachedCallback() on them
						if (parseDescendants) {
							parse(added);
						}
					}
				}

				var removedRoot, idx2 = 0;
				while ((removedRoot = mutation.removedNodes && mutation.removedNodes[idx2++])) {
					if (removedRoot.nodeType === 1) {
						detach(removedRoot);
						var removed, idx3 = 0, removedDescendants = removedRoot.querySelectorAll(selectors.join(", "));
						while ((removed = removedDescendants[idx3++])) {
							detach(removed);
						}
					}
				}
			});
			observe();	// resume listening for added/deleted nodes
		}
	}

	/**
	 * Upgrade any custom tags in the document that have not yet been upgraded.
	 * Nodes are automatically updated asynchronously, but applications can synchronously update them by calling
	 * this method.  Should not be called before domReady event.
	 */
	function deliver() {
		if (!has("document-register-element")) {
			if (!initialParseComplete) {
				parse();
				initialParseComplete = true;
				observe();
			} else {
				processMutations(observer.takeRecords());
			}
		}
	}

	// Setup initial parse of document and also listeners for future document modifications.
	if (!has("document-register-element") && doc) {
		domReady(function () {
			if (!has("dom-template")) {
				// Move <template> child nodes to .content property, so that we don't parse custom elements in
				// <template> nodes.  Could be done on dynamically created nodes too, but currently there's no need.
				var template, idx = 0, nodes = doc.querySelectorAll("template");
				while ((template = nodes[idx++])) {
					if (!template.content) {
						var child, content = template.content = doc.createDocumentFragment();
						while ((child = template.firstChild)) {
							content.appendChild(child);
						}
					}
				}
			}

			// Upgrade all custom element nodes, and setup listeners for future changes.
			deliver();
		});
	}

	// Setup return value as register() method, with other methods hung off it.
	register.upgrade = upgrade;
	register.createElement = createElement;
	register.parse = parse;
	register.deliver = deliver;

	// Add helpers from dcl for declaring classes.

	/**
	 * Convenience shortcut to [dcl()](http://www.dcljs.org/docs/mini_js/dcl/).
	 * @function module:delite/register.dcl
	 */
	register.dcl = dcl;

	/**
	 * Convenience shortcut to [dcl.after()](http://www.dcljs.org/docs/dcl_js/after/).
	 * @function module:delite/register.after
	 */
	register.after = dcl.after;

	/**
	 * Convenience shortcut to [dcl.before()](http://www.dcljs.org/docs/dcl_js/before/).
	 * @function module:delite/register.before
	 */
	register.before = dcl.before;

	/**
	 * Convenience shortcut to [dcl.around()](http://www.dcljs.org/docs/dcl_js/around/).
	 * @function module:delite/register.around
	 */
	register.around = dcl.around;

	/**
	 * Convenience shortcut to [dcl.superCall()](http://www.dcljs.org/docs/mini_js/supercall/).
	 * @function module:delite/register.superCall
	 */
	register.superCall = dcl.superCall;

	return register;
});


/** @module decor/Observable */
define('decor/Observable',[
	"./features",
	"./features!object-observe-api?:./schedule"
], function (has, schedule) {
	"use strict";

	/**
	 * An observable object, working as a shim
	 * of {@link http://wiki.ecmascript.org/doku.php?id=harmony:observe ECMAScript Harmony Object.observe()}.
	 * @class
	 * @alias module:decor/Observable
	 * @param {Object} o The object to mix-into the new Observable.
	 * @example
	 *     var observable = new Observable({foo: "Foo0"});
	 *     Observable.observe(observable, function (changeRecords) {
	 *         // Called at the end of microtask with:
	 *         //     [
	 *         //         {
	 *         //             type: "update",
	 *         //             object: observable,
	 *         //             name: "foo",
	 *         //             oldValue: "Foo0"
	 *         //         },
	 *         //         {
	 *         //             type: "add",
	 *         //             object: observable,
	 *         //             name: "bar"
	 *         //         }
	 *         //     ]
	 *     });
	 *     observable.set("foo", "Foo1");
	 *     observable.set("bar", "Bar0");
	 */
	var Observable,
		defineProperty = Object.defineProperty,
		getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	/**
	 * The default list of change record types, which is:
	 * [
	 *     "add",
	 *     "update",
	 *     "delete",
	 *     "reconfigure",
	 *     "setPrototype",
	 *     "preventExtensions"
	 * ]
	 * @constant {Array.<module:decor/Observable~ChangeType>}
	 *     module:decor/Observable~DEFAULT_CHANGETYPES
	 */
	var DEFAULT_ACCEPT_CHANGETYPES = {
		"add": 1,
		"update": 1,
		"delete": 1,
		"reconfigure": 1,
		"setPrototype": 1,
		"preventExtensions": 1
	}; // Observable#set() only supports the first two

	/**
	 * Change record type.
	 * One of:
	 * * "add"
	 * * "update"
	 * * "delete"
	 * * "reconfigure"
	 * * "setPrototype"
	 * * "preventExtensions"
	 * * "splice"
	 * @typedef {string} module:decor/Observable~ChangeType
	 */

	/**
	 * Change record seen in Observable.observe().
	 * @typedef {Object} module:decor/Observable~ChangeRecord
	 * @property {module:decor/Observable~ChangeType} type The type of change record.
	 * @property {Object} object The changed object.
	 * @property {string} [name] The changed property name. Set only for non-splice type of change records.
	 * @property {number} [index] The array index of splice. Set only for splice type of change records.
	 * @property {Array} [removed] The removed array elements. Set only for splice type of change records.
	 * @property {number} [addedCount] The count of added array elements. Set only for splice type of change records.
	 */

	/**
	 * Change callback.
	 * @callback module:decor/Observable~ChangeCallback
	 * @param {Array.<module:decor/Observable~ChangeRecord>} changeRecords The change records.
	 */

	Observable = function (o) {
		// Make Observable marker not enumerable, configurable or writable
		if (!this._observable) { // In case this constructor is called manually
			defineProperty(this, "_observable", {value: 1});
		}
		o && Observable.assign(this, o);
	};

	/**
	 * @method module:decor/Observable.test
	 * @param {Object} o The object to test.
	 * @returns {boolean} true if o is an instance of Observable.
	 */
	Observable.test = function (o) {
		return o && o._observable;
	};

	/**
	 * @method module:decor/Observable.is
	 * @returns {boolean} true if the given two values are the same, considering NaN as well as +0 vs. -0.
	 */
	Observable.is = has("object-is-api") ? Object.is : function (lhs, rhs) {
		return lhs === rhs && (lhs !== 0 || 1 / lhs === 1 / rhs) || lhs !== lhs && rhs !== rhs;
	};

	/**
	 * Copy properties of given source objects to given target object.
	 * If target object has {@link module:decor/Observable#set set()} function for the property, uses it.
	 * @function module:decor/Observable.assign
	 * @param {Object} dst The target object.
	 * @param {...Object} var_args The source objects.
	 * @returns {Object} The target object.
	 */
	Observable.assign = function (dst) {
		if (dst == null) {
			throw new TypeError("Can't convert " + dst + " to object.");
		}
		dst = Object(dst);
		for (var i = 1, l = arguments.length; i < l; ++i) {
			var src = Object(arguments[i]),
				props = Object.getOwnPropertyNames(src);
			for (var j = 0, m = props.length; j < m; ++j) {
				var prop = props[j];
				Observable.prototype.set.call(dst, prop, src[prop]);
			}
		}
		return dst;
	};

	/**
	 * @method module:decor/Observable.canObserve
	 * @param {Object} o The object to test.
	 * @returns {boolean} true if o can be observed with {@link module:decor/Observable.observe Observable.observe()}.
	 */
	if (has("object-observe-api")) {
		Observable.canObserve = function (o) {
			return typeof o === "object" && o != null;
		};
	} else {
		Observable.canObserve = Observable.test;
	}

	if (has("object-observe-api")) {
		defineProperty(Observable.prototype, "set", { // Make set() not enumerable
			value: function (name, value) {
				this[name] = value;
				return value;
			},
			configurable: true,
			writable: true
		});

		Observable.observe = function (object, callback, accept) {
			Object.observe.call(this, object, callback, accept);
			return {
				remove: function () {
					Object.unobserve(object, callback);
				}
			};
		};

		Observable.getNotifier = Object.getNotifier;
		Observable.deliverChangeRecords = Object.deliverChangeRecords;
	} else {
		defineProperty(Observable.prototype, "set", { // Make set() not enumerable
			/**
			 * Sets a value.
			 * Automatically emits change record(s)
			 * compatible with {@link http://wiki.ecmascript.org/doku.php?id=harmony:observe Object.observe()}
			 * if no ECMAScript setter is defined for the given property.
			 * If ECMAScript setter is defined for the given property, use
			 * {@link module:decor/Observable~Notifier#notify Observable.getNotifier(observable).notify(changeRecord)}
			 * to manually emit a change record.
			 * @method module:decor/Observable#set
			 * @param {string} name The property name.
			 * @param value The property value.
			 * @returns The value set.
			 */
			value: function (name, value) {
				var type = name in this ? "update" : "add",
					oldValue = this[name],
					// For defining setter, ECMAScript setter should be used
					setter = (getOwnPropertyDescriptor(this, name) || {}).set;
				this[name] = value;
				if (!Observable.is(value, oldValue) && setter === undefined) {
					// Auto-notify if there is no setter defined for the property.
					// Application should manually call Observable.getNotifier(observable).notify(changeRecord)
					// if a setter is defined.
					var changeRecord = {
						type: type,
						object: this,
						name: name + ""
					};
					if (type === "update") {
						changeRecord.oldValue = oldValue;
					}
					Observable.getNotifier(this).notify(changeRecord);
				}
				return value;
			},
			configurable: true,
			writable: true
		});

		var seq = 0,
			hotCallbacks = {},
			deliverHandle = null,
			deliverAllByTimeout = function () {
				/* global Platform */
				has("polymer-platform") && Platform.performMicrotaskCheckpoint(); // For Polymer watching for Observable
				for (var anyWorkDone = true; anyWorkDone;) {
					anyWorkDone = false;
					// Observation may stop during observer callback
					var callbacks = [];
					for (var s in hotCallbacks) {
						callbacks.push(hotCallbacks[s]);
					}
					hotCallbacks = {};
					callbacks = callbacks.sort(function (lhs, rhs) {
						return lhs._seq - rhs._seq;
					});
					for (var i = 0, l = callbacks.length; i < l; ++i) {
						if (callbacks[i]._changeRecords.length > 0) {
							Observable.deliverChangeRecords(callbacks[i]);
							anyWorkDone = true;
						}
					}
				}
				deliverHandle = null;
			},
			removeGarbageCallback = function (callback) {
				if (callback._changeRecords.length === 0 && callback._refCountOfNotifier === 0) {
					callback._seq = undefined;
				}
			};

		/**
		 * Notifier object for Observable.
		 * This is an internal function and cannot be used directly.
		 * @class module:decor/Observable~Notifier
		 */
		var Notifier = function (target) {
			this.target = target;
			this.observers = {};
			this._activeChanges = {};
		};

		Notifier.prototype = /** @lends module:decor/Observable~Notifier */ {
			/**
			 * Queue up a change record.
			 * It will be notified at the end of microtask,
			 * or when {@link module:decor/Observable.deliverChangeRecords Observable.deliverChangeRecords()}
			 * is called.
			 * @method module:decor/Observable~Notifier#notify
			 * @param {module:decor/Observable~ChangeRecord} changeRecord
			 *     The change record to queue up for notification.
			 */
			notify: function (changeRecord) {
				function shouldDeliver(activeChanges, acceptTable, changeType) {
					if (changeType in acceptTable) {
						for (var s in acceptTable) {
							if (activeChanges[s] > 0) {
								return false;
							}
						}
						return true;
					}
				}
				for (var s in this.observers) {
					if (shouldDeliver(this._activeChanges, this.observers[s].acceptTable, changeRecord.type)) {
						var callback = this.observers[s].callback;
						callback._changeRecords.push(changeRecord);
						hotCallbacks[callback._seq] = callback;
						if (!deliverHandle) {
							deliverHandle = schedule(deliverAllByTimeout);
						}
					}
				}
			},
			/**
			 * Let the series of changes made in the given callback be represented
			 * by a synthetic change of the given change type.
			 * The callback may return the synthetic change record,
			 * which will be of the `type` and automatically emitted.
			 * Otherwise, the caller can emit the synthetic record manually
			 * via {@link module:decor/Observable~Notifier#notify notify()}.
			 * @param {string} type The change type of synthetic change record.
			 * @param {Function} callback The callback function.
			 */
			performChange: function (type, callback) {
				this._activeChanges[type] = (this._activeChanges[type] || 0) + 1;
				var source = callback.call(undefined);
				--this._activeChanges[type];
				if (source) {
					var target = {
						type: type,
						object: this.target
					};
					for (var s in source) {
						if (!(s in target)) {
							target[s] = source[s];
						}
					}
					this.notify(target);
				}
			}
		};

		/**
		 * Obtains a notifier object for the given {@link module:decor/Observable Observable}.
		 * @method module:decor/Observable.getNotifier
		 * @param {Object} observable The {@link module:decor/Observable Observable} to get a notifier object of.
		 * @returns {module:decor/Observable~Notifier}
		 */
		Observable.getNotifier = function (observable) {
			if (!getOwnPropertyDescriptor(observable, "_notifier")) {
				// Make the notifier reference not enumerable, configurable or writable
				defineProperty(observable, "_notifier", {
					value: new Notifier(observable)
				});
			}
			return observable._notifier;
		};

		/**
		 * Observes an {@link module:decor/Observable Observable} for changes.
		 * @method module:decor/Observable.observe
		 * @param {Object} observable The {@link module:decor/Observable Observable} to observe.
		 * @param {module:decor/Observable~ChangeCallback} callback The change callback.
		 * @param {Array.<module:decor/Observable~ChangeType>}
		 *     [accept={@link module:decor/Observable~DEFAULT_CHANGETYPES}]
		 *     The list of change record types to observe.
		 * @returns {Handle} The handle to stop observing.
		 * @throws {TypeError} If the 1st argument is non-object or null.
		 */
		Observable.observe = function (observable, callback, accept) {
			if (Object(observable) !== observable) {
				throw new TypeError("Observable.observe() cannot be called on non-object.");
			}
			if (!("_seq" in callback)) {
				callback._seq = seq++;
				callback._changeRecords = [];
				callback._refCountOfNotifier = 0;
			}
			var acceptTable = accept ? accept.reduce(function (types, type) {
					types[type] = 1;
					return types;
				}, {}) : DEFAULT_ACCEPT_CHANGETYPES,
				notifier = Observable.getNotifier(observable);
			if (!(callback._seq in notifier.observers)) {
				notifier.observers[callback._seq] = {
					acceptTable: acceptTable,
					callback: callback
				};
				++callback._refCountOfNotifier;
			} else {
				notifier.observers[callback._seq].acceptTable = acceptTable;
			}
			return {
				remove: function () {
					if (callback._seq in notifier.observers) {
						delete notifier.observers[callback._seq];
						--callback._refCountOfNotifier;
					}
				}
			};
		};

		/**
		 * Delivers change records immediately.
		 * @method module:decor/Observable.deliverChangeRecords
		 * @param {Function} callback The change callback to deliver change records of.
		 */
		Observable.deliverChangeRecords = function (callback) {
			var length = callback._changeRecords.length;
			try {
				callback(callback._changeRecords.splice(0, length));
			} catch (e) {
				has("console-api") && console.error("Error occured in observer callback: " + (e.stack || e));
			}
			removeGarbageCallback(callback);
		};
	}

	return Observable;
});

/** @module decor/Destroyable */
define('decor/Destroyable',[
	"dcl/advise",
	"dcl/dcl"
], function (advise, dcl) {
	/**
	 * Mixin to track handles and release them when instance is destroyed.
	 *
	 * Call `this.own(...)` on list of handles (returned from dcl/advise, dojo/on,
	 * decor/Stateful#observe, or any class (including widgets) with a destroy() or remove() method.
	 * Then call `destroy()` later to destroy this instance and release the resources.
	 * @mixin module:decor/Destroyable
	 */
	var Destroyable = dcl(null, /** @lends module:decor/Destroyable# */ {
		/**
		 * Destroy this class, releasing any resources registered via `own()`.
		 * @method
		 */
		destroy: dcl.advise({
			before: function () {
				this._beingDestroyed = true;
				this._releaseHandles();
			},
			after: function () {
				this._destroyed = true;
			}
		}),

		_releaseHandles: function () {
		},

		/**
		 * Track specified handles and remove/destroy them when this instance is destroyed, unless they were
		 * already removed/destroyed manually.
		 * @returns {Object[]} The array of specified handles, so you can do for example:
		 * `var handle = this.own(on(...))[0];`
		 * @protected
		 */
		own: function () {
			var cleanupMethods = [
				"destroy",
				"remove",
				"cancel"
			];

			// transform arguments into an Array
			var ary = Array.prototype.slice.call(arguments);
			ary.forEach(function (handle) {
				// When this.destroy() is called, destroy handle.  Since I'm using advise.before(),
				// the handle will be destroyed before a subclass's destroy() method starts running, before it calls
				// this.inherited() or even if it doesn't call this.inherited() at all.  If that's an issue, make an
				// onDestroy() method and connect to that instead.
				var destroyMethodName;
				var odh = advise.after(this, "_releaseHandles", function () {
					handle[destroyMethodName]();
				});

				// Callback for when handle is manually destroyed.
				var hdhs = [];

				function onManualDestroy() {
					odh.destroy();
					hdhs.forEach(function (hdh) {
						hdh.destroy();
					});
				}

				// Setup listeners for manual destroy of handle.
				// Also compute destroyMethodName, used in listener above.
				if (handle.then) {
					// Special path for Promises.  Detect when Promise is settled.
					handle.then(onManualDestroy, onManualDestroy);
				}
				cleanupMethods.forEach(function (cleanupMethod) {
					if (typeof handle[cleanupMethod] === "function") {
						if (!destroyMethodName) {
							// Use first matching method name in above listener.
							destroyMethodName = cleanupMethod;
						}
						if (!handle.then) {
							// Path for non-promises.  Use AOP to detect when handle is manually destroyed.
							hdhs.push(advise.after(handle, cleanupMethod, onManualDestroy));
						}
					}
				});
			}, this);

			return ary;
		},

		/**
		 * Wrapper to setTimeout to avoid deferred functions executing
		 * after the originating widget has been destroyed.
		 * @param {Function} fcn - Function to be executed after specified delay (or 0ms if no delay specified).
		 * @param {number} delay - Delay in ms, defaults to 0.
		 * @returns {Object} Handle with a remove method that deschedules the callback from being called.
		 * @protected
		 */
		defer: function (fcn, delay) {
			// TODO: if delay unspecified, use schedule?
			var timer = setTimeout(
				function () {
					if (!timer) {
						return;
					}
					timer = null;
					if (!this._destroyed) {
						fcn.call(this);
					}
				}.bind(this),
					delay || 0
			);
			return {
				remove: function () {
					if (timer) {
						clearTimeout(timer);
						timer = null;
					}
					return null; // so this works well: handle = handle.remove();
				}
			};
		}
	});

	dcl.chainBefore(Destroyable, "destroy");

	return Destroyable;
});

/** @module decor/Stateful */
define('decor/Stateful',[
	"dcl/advise",
	"dcl/dcl",
	"./features",
	"./Observable"
], function (advise, dcl, has, Observable) {
	var apn = {};

	/**
	 * Helper function to map "foo" --> "_setFooAttr" with caching to avoid recomputing strings.
	 */
	function propNames(name) {
		if (apn[name]) {
			return apn[name];
		}
		var uc = name.replace(/^[a-z]|-[a-zA-Z]/g, function (c) {
			return c.charAt(c.length - 1).toUpperCase();
		});
		var ret = apn[name] = {
			p: "_shadow" + uc + "Attr",	// shadow property, since real property hidden by setter/getter
			s: "_set" + uc + "Attr",	// converts dashes to camel case, ex: accept-charset --> _setAcceptCharsetAttr
			g: "_get" + uc + "Attr"
		};
		return ret;
	}

	/**
	 * Utility function for notification.
	 */
	function notify(stateful, name, oldValue) {
		Observable.getNotifier(stateful).notify({
			// Property is never new because setting up shadow property defines the property
			type: "update",
			object: stateful,
			name: name + "",
			oldValue: oldValue
		});
	}

	var REGEXP_IGNORE_PROPS = /^constructor$|^_set$|^_get$|^deliver$|^discardChanges$|^_(.+)Attr$/;

	/**
	 * Base class for objects that provide named properties with optional getter/setter
	 * control and the ability to observe for property changes.
	 *
	 * The class also provides the functionality to auto-magically manage getters
	 * and setters for class attributes/properties.  Note though that expando properties
	 * (i.e. properties added to an instance but not in the prototype) are not supported.
	 *
	 * Getters and Setters should follow the format of `_setXxxAttr` or `_getXxxAttr` where
	 * the xxx is a name of the attribute to handle.  So an attribute of `foo`
	 * would have a custom getter of `_getFooAttr` and a custom setter of `_setFooAttr`.
	 * Setters must save and announce the new property value by calling `this._set("foo", val)`,
	 * and getters should access the property value as `this._get("foo")`.
	 *
	 * @example <caption>Example 1</caption>
	 * var MyClass = dcl(Stateful, { foo: "initial" });
	 * var obj = new MyClass();
	 * obj.observe(function(oldValues){
	 *    if ("foo" in oldValues) {
	 *      console.log("foo changed to " + this.foo);
	 *    }
	 * });
	 * obj.foo = bar;
	 * // Stateful by default interprets the first parameter passed to
	 * // the constructor as a set of properties to set on the widget 
	 * // immediately after it is created.
	 *
	 * @example <caption>Example 2</caption>
	 * var MyClass = dcl(Stateful, { foo: "initial" });
	 * var obj = new MyClass({ foo: "special"});
	 *
	 * @mixin module:decor/Stateful
	 */
	var Stateful = dcl(null, /** @lends module:decor/Stateful# */ {
		/**
		 * Returns a hash of properties that should be observed.
		 * @returns {Object} Hash of properties.
		 * @protected
		 */
		getProps: function () {
			var hash = {};
			for (var prop in this) {
				if (!REGEXP_IGNORE_PROPS.test(prop)) {
					hash[prop] = true;
				}
			}
			return hash;
		},

		/**
		 * Sets up ES5 getters/setters for each class property.
		 * Inside introspect(), "this" is a reference to the prototype rather than any individual instance.
		 * @param {Object} props - Hash of properties.
		 * @protected
		 */
		introspect: function (props) {
			Object.keys(props).forEach(function (prop) {
				var names = propNames(prop),
					shadowProp = names.p,
					getter = names.g,
					setter = names.s;

				// Setup ES5 getter and setter for this property, if not already setup.
				// For a property named foo, saves raw value in _fooAttr.
				// ES5 setter intentionally does late checking for this[names.s] in case a subclass sets up a
				// _setFooAttr method.
				if (!(shadowProp in this)) {
					this[shadowProp] = this[prop];
					delete this[prop]; // make sure custom setters fire
					Object.defineProperty(this, prop, {
						enumerable: true,
						set: function (x) {
							setter in this ? this[setter](x) : this._set(prop, x);
						},
						get: function () {
							return getter in this ? this[getter]() : this[shadowProp];
						}
					});
				}
			}, this);
		},

		constructor: dcl.advise({
			before: function () {
				// First time this class is instantiated, introspect it.
				// Use _introspected flag on constructor, rather than prototype, to avoid hits when superclass
				// was already inspected but this class wasn't.
				var ctor = this.constructor;
				if (!ctor._introspected) {
					// note: inside getProps() and introspect(), this refs prototype
					ctor._props = ctor.prototype.getProps();
					ctor.prototype.introspect(ctor._props);
					ctor._introspected = true;
				}
				Observable.call(this);
			},

			after: function (args) {
				// Automatic setting of params during construction.
				// In after() advice so that it runs after all the subclass constructor methods.
				this.processConstructorParameters(args);
			}
		}),

		/**
		 * Called after Object is created to process parameters passed to constructor.
		 * @protected
		 */
		processConstructorParameters: function (args) {
			if (args.length) {
				this.mix(args[0]);
			}
		},

		/**
		 * Set a hash of properties on a Stateful instance.
		 * @param {Object} hash - Hash of properties.
		 * @example
		 * myObj.mix({
		 *     foo: "Howdy",
		 *     bar: 3
		 * });
		 */
		mix: function (hash) {
			for (var x in hash) {
				if (hash.hasOwnProperty(x)) {
					this[x] = hash[x];
				}
			}
		},

		/**
		 * Internal helper for directly setting a property value without calling the custom setter.
		 *
		 * Directly changes the value of an attribute on an object, bypassing any
		 * accessor setter.  Also notifies callbacks registered via observe().
		 * Custom setters should call `_set` to actually record the new value.
		 * @param {string} name - The property to set.
		 * @param {*} value - Value to set the property to.
		 * @protected
		 */
		_set: function (name, value) {
			var shadowPropName = propNames(name).p,
				oldValue = this[shadowPropName];
			this[shadowPropName] = value;
			// Even if Object.observe() is natively available,
			// automatic change record emission won't happen if there is a ECMAScript setter
			!Observable.is(value, oldValue) && notify(this, name, oldValue);
		},

		/**
		 * Internal helper for directly accessing an attribute value.
		 *
		 * Directly gets the value of an attribute on an object, bypassing any accessor getter.
		 * It is designed to be used by descendant class if they want
		 * to access the value in their custom getter before returning it.
		 * @param {string} name - Name of property.
		 * @returns {*} Value of property.
		 * @protected
		 */
		_get: function (name) {
			return this[propNames(name).p];
		},

		/**
		 * Notifies current values to observers for specified property name(s).
		 * Handy to manually schedule invocation of observer callbacks when there is no change in value.
		 * @method module:decor/Stateful#notifyCurrentValue
		 * @param {...string} name The property name.
		 */
		notifyCurrentValue: function () {
			Array.prototype.forEach.call(arguments, function (name) {
				notify(this, name, this[propNames(name).p]);
			}, this);
		},

		/**
		 * Get list of properties that Stateful#observe() should observe.
		 * @returns {string[]} list of properties
		 * @protected
		 */
		getPropsToObserve: function () {
			return this.constructor._props;
		},

		/**
		 * Observes for change in properties.
		 * Callback is called at the end of micro-task of changes with a hash table of
		 * old values keyed by changed property.
		 * Multiple changes to a property in a micro-task are squashed.
		 * @method module:decor/Stateful#observe
		 * @param {function} callback The callback.
		 * @returns {module:decor/Stateful.PropertyListObserver}
		 *     The observer that can be used to stop observation
		 *     or synchronously deliver/discard pending change records.
		 * @example
		 *     var stateful = new (dcl(Stateful, {
		 *             foo: undefined,
		 *             bar: undefined,
		 *             baz: undefined
		 *         }))({
		 *             foo: 3,
		 *             bar: 5,
		 *             baz: 7
		 *         });
		 *     stateful.observe(function (oldValues) {
		 *         // oldValues is {foo: 3, bar: 5, baz: 7}
		 *     });
		 *     stateful.foo = 4;
		 *     stateful.bar = 6;
		 *     stateful.baz = 8;
		 *     stateful.foo = 6;
		 *     stateful.bar = 8;
		 *     stateful.baz = 10;
		 */
		observe: function (callback) {
			// create new listener
			var h = new Stateful.PropertyListObserver(this, this.getPropsToObserve());
			h.open(callback, this);

			// make this.deliver() and this.discardComputing() call deliver() and discardComputing() on new listener
			var a1 = advise.after(this, "deliver", h.deliver.bind(h)),
				a2 = advise.after(this, "discardChanges", h.discardChanges.bind(h));
			advise.before(h, "close", function () {
				a1.unadvise();
				a2.unadvise();
			});

			return h;
		},

		/**
		 * Synchronously deliver change records to all listeners registered via `observe()`.
		 */
		deliver: function () {
		},

		/**
		 * Discard change records for all listeners registered via `observe()`.
		 */
		discardChanges: function () {
		}
	});

	dcl.chainAfter(Stateful, "introspect");

	/**
	 * An observer to observe a set of {@link module:decor/Stateful Stateful} properties at once.
	 * This class is what {@link module:decor/Stateful#observe} returns.
	 * @class module:decor/Stateful.PropertyListObserver
	 * @param {Object} o - The {@link module:decor/Stateful Stateful} being observed.
	 * @param {Object} props - Hash of properties to observe.
	 */
	Stateful.PropertyListObserver = function (o, props) {
		this.o = o;
		this.props = props;
	};

	Stateful.PropertyListObserver.prototype = {
		/**
		 * Starts the observation.
		 * {@link module:decor/Stateful#observe `Stateful#observe()`} calls this method automatically.
		 * @method module:decor/Stateful.PropertyListObserver#open
		 * @param {function} callback The change callback.
		 * @param {Object} thisObject The object that should work as "this" object for callback.
		 */
		open: function (callback, thisObject) {
			var props = this.props;
			this._boundCallback = function (records) {
				if (!this._closed && !this._beingDiscarded) {
					var oldValues = {};
					records.forEach(function (record) {
						// for consistency with platforms w/out native Object.observe() support,
						// only notify about updates to properties in prototype (see getProps())
						if (record.name in props && !(record.name in oldValues)) {
							oldValues[record.name] = record.oldValue;
						}
					});
					/* jshint unused: false */
					for (var s in oldValues) {
						callback.call(thisObject, oldValues);
						break;
					}
				}
			}.bind(this);
			this._h = Observable.observe(this.o, this._boundCallback);
			return this.o;
		},

		/**
		 * Synchronously delivers pending change records.
		 * @method module:decor/Stateful.PropertyListObserver#deliver
		 */
		deliver: function () {
			this._boundCallback && Observable.deliverChangeRecords(this._boundCallback);
		},

		/**
		 * Discards pending change records.
		 * @method module:decor/Stateful.PropertyListObserver#discardChanges
		 */
		discardChanges: function () {
			this._beingDiscarded = true;
			this._boundCallback && Observable.deliverChangeRecords(this._boundCallback);
			this._beingDiscarded = false;
			return this.o;
		},

		/**
		 * Does nothing, just exists for API compatibility with liaison and other data binding libraries.
		 * @method module:decor/Stateful.PropertyListObserver#setValue
		 */
		setValue: function () {},

		/**
		 * Stops the observation.
		 * @method module:decor/Stateful.PropertyListObserver#close
		 */
		close: function () {
			if (this._h) {
				this._h.remove();
				this._h = null;
			}
			this._closed = true;
		}
	};

	/**
	 * Synonym for {@link module:decor/Stateful.PropertyListObserver#close `close()`}.
	 * @method module:decor/Stateful.PropertyListObserver#remove
	 */
	Stateful.PropertyListObserver.prototype.remove = Stateful.PropertyListObserver.prototype.close;

	return Stateful;
});

/** @module delite/on */
define('delite/on',[],function () {
	/**
	 * Call specified function when event occurs.
	 * @param {Element} [node] - Element to attach handler to.
	 * @param {string} type - Name of event (ex: "click").
	 * @param {Function} callback - Callback function.
	 * @returns {Object} Handle with `remove()` method to cancel the listener.
	 */
	var on = function (node, type, callback) {
		var capture = false;

		// Shim support for focusin/focusout where necessary.
		// Don't shim on IE since IE supports focusin/focusout natively, and conversely
		// focus and blur events have a problem that relatedTarget isn't set.
		var captures = "onfocusin" in node ? {} : { focusin: "focus", focusout: "blur" };
		if (type in captures) {
			type = captures[type];
			capture = true;
		}

		// Shim support for Event.key, and fix some wrong/outdated Event.key values
		if (/^key(down|press|up)$/.test(type)) {
			var origFunc = callback;
			callback = function (event) {
				var key = event.key || event.keyIdentifier || String.fromCharCode(event.charCode);

				var fixedKey = {
					// mappings for event.keyIdentifier differences from event.key for special keys
					"U+0020": "Spacebar",
					"U+0008": "Backspace",
					"U+0009": "Tab",
					"U+001B": "Escape",

					// fix for FF 34
					" ": "Spacebar",

					// fix for old key names, see https://www.w3.org/Bugs/Public/show_bug.cgi?id=22084
					"Apps": "ContextMenu",
					"Left": "ArrowLeft",
					"Down": "ArrowDown",
					"Right": "ArrowRight",
					"Up": "ArrowUp",
					"Del": "Delete",
					"Esc": "Escape",

					// fix for Android 4.2
					"U+00007F": "Backspace"
				}[key] || key.replace(/^U\+0*(.*)$/, function (all, hexString) {
					// fix event.keyIdentifier for normal printable characters, ex: "U+0041" --> "A" or "a"
					var code = parseInt(hexString, 16);
					if (code >= 65 && code <= 90 && !event.shiftKey) {
						code += 32;	// uppercase --> lowercase
					}
					return String.fromCharCode(code);
				});

				if (event.key !== fixedKey) {
					// A simple "event.key = fixedKey" doesn't work on FF31 (for " " --> "Spacebar" conversion).
					// And Object.defineProperty(event, "key", {value: fixedKey}); (for "Down" --> "ArrowDown")
					// doesn't work on IE.
					Object.defineProperty(event, "key", {get: function () { return fixedKey; }});
				}

				origFunc(event);
			};
		}

		node.addEventListener(type, callback, capture);

		return {
			remove: function () {
				node.removeEventListener(type, callback, capture);
			}
		};
	};


	/**
	 * Emits a synthetic event of specified type, based on eventObj.
	 * @param {Element} node - Element to emit event on.
	 * @param {string} type - Name of event.
	 * @param {Object} [eventObj] - Properties to mix in to emitted event.  Can also contain
	 * `bubbles` and `cancelable` properties to control how the event is emitted.
	 * @returns {boolean} True if the event was *not* canceled, false if it was canceled.
	 * @example
	 * myWidget.emit("query-success", {});
	 * @protected
	 */
	on.emit = function (node, type, eventObj) {
		eventObj = eventObj || {};
		var bubbles = "bubbles" in eventObj ? eventObj.bubbles : true;
		var cancelable = "cancelable" in eventObj ? eventObj.cancelable : true;

		// Note: can't use jQuery.trigger() because it doesn't work with addEventListener(),
		// see http://bugs.jquery.com/ticket/11047.
		var nativeEvent = node.ownerDocument.createEvent("HTMLEvents");
		nativeEvent.initEvent(type, bubbles, cancelable);
		for (var i in eventObj) {
			if (!(i in nativeEvent)) {
				nativeEvent[i] = eventObj[i];
			}
		}

		return node.dispatchEvent(nativeEvent);
	};

	return on;
});

/** @module delite/CustomElement */
define('delite/CustomElement',[
	"dcl/advise",
	"dcl/dcl",
	"decor/Observable",
	"decor/Destroyable",
	"decor/Stateful",
	"requirejs-dplugins/has",
	"./on",
	"./register"
], function (advise, dcl, Observable, Destroyable, Stateful, has, on, register) {

	/**
	 * Dispatched after the CustomElement has been attached.
	 * This is useful to be notified when an HTMLElement has been upgraded to a
	 * CustomElement and attached to the DOM, in particular on browsers supporting native Custom Element.
	 * @example
	 * element.addEventListener("customelement-attached", function (evt) {
	 *      console.log("custom element: "+evt.target.id+" has been attached");
	 * });
	 * @event module:delite/CustomElement#customelement-attached
	 */

	// Test if custom setters work for native properties like dir, or if they are ignored.
	// They don't work on some versions of webkit (Chrome, Safari 7, iOS 7), but do work on Safari 8 and iOS 8.
	// If needed, this test could probably be reduced to just use Object.defineProperty() and dcl(),
	// skipping use of register().
	has.add("setter-on-native-prop", function () {
		var works = false,
			Mixin = dcl(Stateful, {	// mixin to workaround https://github.com/uhop/dcl/issues/9
				getProps: function () { return {dir: true}; },
				dir: "",
				_setDirAttr: function () { works = true; }
			}),
			TestWidget = register("test-setter-on-native-prop", [HTMLElement, Mixin], {}),
			tw = new TestWidget();
		tw.dir = "rtl";
		return works;
	});


	/**
	 * Get a property from a dot-separated string, such as "A.B.C".
	 */
	function getObject(name) {
		try {
			return name.split(".").reduce(function (context, part) {
				return context[part];
			}, this);	// "this" is the global object (i.e. window on browsers)
		} catch (e) {
			// Return undefined to indicate that object doesn't exist.
		}
	}

	// Properties not to monitor for changes.
	var REGEXP_IGNORE_PROPS = /^constructor$|^_set$|^_get$|^deliver$|^discardChanges$|^_(.+)Attr$/;

	/**
	 * Base class for all custom elements.
	 *
	 * Use this class rather that delite/Widget for non-visual custom elements.
	 * Custom elements can provide custom setters/getters for properties, which are called automatically
	 * when the value is set.  For an attribute XXX, define methods _setXXXAttr() and/or _getXXXAttr().
	 *
	 * @mixin module:delite/CustomElement
	 * @augments module:decor/Stateful
	 * @augments module:decor/Destroyable
	 */
	var CustomElement = dcl([Stateful, Destroyable], /** @lends module:delite/CustomElement# */{
		introspect: function () {
			if (!has("setter-on-native-prop")) {
				// Generate map from native attributes of HTMLElement to custom setters for those attributes.
				// Necessary because webkit masks all custom setters for native properties on the prototype.
				// For details see:
				//		https://bugs.webkit.org/show_bug.cgi?id=36423
				//		https://bugs.webkit.org/show_bug.cgi?id=49739
				//		https://bugs.webkit.org/show_bug.cgi?id=75297
				var proto = this,
					nativeProps = document.createElement(this._extends || "div"),
					setterMap = this._nativePropSetterMap = {};

				this._nativeAttrs = [];
				do {
					Object.keys(proto).forEach(function (prop) {
						var lcProp = prop.toLowerCase();

						if (prop in nativeProps && !setterMap[lcProp]) {
							var desc = Object.getOwnPropertyDescriptor(proto, prop);
							if (desc && desc.set) {
								this._nativeAttrs.push(lcProp);
								setterMap[lcProp] = desc.set;
							}
						}
					}, this);

					proto = Object.getPrototypeOf(proto);
				} while (proto && proto !== this._baseElement.prototype);
			}
		},

		getProps: function () {
			// Override _Stateful.getProps() to ignore properties from the HTML*Element superclasses, like "style".
			// You would need to explicitly declare style: "" in your widget to get it here.
			//
			// Also sets up this._propCaseMap, a mapping from lowercase property name to actual name,
			// ex: iconclass --> iconClass, which does include the methods, but again doesn't
			// include props like "style" that are merely inherited from HTMLElement.

			var hash = {}, proto = this,
				pcm = this._propCaseMap = {};

			do {
				Object.keys(proto).forEach(function (prop) {
					if (!REGEXP_IGNORE_PROPS.test(prop)) {
						hash[prop] = true;
						pcm[prop.toLowerCase()] = prop;
					}
				});

				proto = Object.getPrototypeOf(proto);
			} while (proto && proto !== this._baseElement.prototype);

			return hash;
		},

		/**
		 * This method will detect and process any properties that the application has set, but the custom setter
		 * didn't run because `has("setter-on-native-prop") === false`.
		 * Used during initialization and also by `deliver()`.
		 * @private
		 */
		_processNativeProps: function () {
			if (!has("setter-on-native-prop")) {
				this._nativeAttrs.forEach(function (attrName) {
					if (this.hasAttribute(attrName)) { // value was specified
						var value = this.getAttribute(attrName);
						this.removeAttribute(attrName);
						if (value !== null) {
							this._nativePropSetterMap[attrName].call(this, value); // call custom setter
						}
					}
				}, this);
			}
		},

		/**
		 * Set to true when `createdCallback()` has completed.
		 * @member {boolean}
		 * @protected
		 */
		created: false,

		/**
		 * Called when the custom element is created, or when `register.parse()` parses a custom tag.
		 *
		 * This method is automatically chained, so subclasses generally do not need to use `dcl.superCall()`,
		 * `dcl.advise()`, etc.
		 * @method
		 * @protected
		 */
		createdCallback: dcl.advise({
			before: function () {
				// Mark this object as observable with Object.observe() shim
				if (!this._observable) {
					Observable.call(this);
				}

				// Get parameters that were specified declaratively on the widget DOMNode.
				this._parsedAttributes = this._mapAttributes();
			},

			after: function () {
				this.created = true;

				// Now that creation has finished, apply parameters that were specified declaratively.
				// This is consistent with the timing that parameters are applied for programmatic creation.
				this._parsedAttributes.forEach(function (pa) {
					if (pa.event) {
						this.on(pa.event, pa.callback);
					} else {
						this[pa.prop] = pa.value;
					}
				}, this);

				if (!has("setter-on-native-prop")) {
					// Call custom setters for initial values of attributes with shadow properties (dir, tabIndex, etc)
					this._processNativeProps();

					// Begin watching for changes to those DOM attributes.
					// Note that (at least on Chrome) I could use attributeChangedCallback() instead, which is
					// synchronous, so Widget#deliver() will work as expected, but OTOH gets lots of notifications
					// that I don't care about.
					// If Polymer is loaded, use MutationObserver rather than WebKitMutationObserver
					// to avoid error about "referencing a Node in a context where it does not exist".
					/* global WebKitMutationObserver */
					var MO = window.MutationObserver || WebKitMutationObserver;	// for jshint
					var observer = new MO(function (records) {
						records.forEach(function (mr) {
							var attrName = mr.attributeName,
								setter = this._nativePropSetterMap[attrName],
								newValue = this.getAttribute(attrName);
							if (newValue !== null) {
								this.removeAttribute(attrName);
								setter.call(this, newValue);
							}
						}, this);
					}.bind(this));
					observer.observe(this, {
						subtree: false,
						attributeFilter: this._nativeAttrs,
						attributes: true
					});
				}
			}
		}),

		/**
		 * Set to true when `attachedCallback()` has completed, and false when `detachedCallback()` called.
		 * @member {boolean}
		 * @protected
		 */
		attached: false,

		/**
		 * Called automatically when the element is added to the document, after `createdCallback()` completes.
		 * This method is automatically chained, so subclasses generally do not need to use `dcl.superCall()`,
		 * `dcl.advise()`, etc.
		 * @method
		 * @fires module:delite/CustomElement#customelement-attached
		 */
		attachedCallback: dcl.advise({
			before: function () {
				// Call computeProperties() and refreshRendering() for declaratively set properties.
				// Do this in attachedCallback() rather than createdCallback() to avoid calling refreshRendering() etc.
				// prematurely in the programmatic case (i.e. calling it before user parameters have been applied).
				this.deliver();
			},

			after: function () {
				this.attached = true;

				this.emit("customelement-attached", {
					bubbles: false,
					cancelable: false
				});
			}
		}),

		/**
		 * Called when the element is removed the document.
		 * This method is automatically chained, so subclasses generally do not need to use `dcl.superCall()`,
		 * `dcl.advise()`, etc.
		 */
		detachedCallback: function () {
			this.attached = false;
		},

		/**
		 * Returns value for widget property based on attribute value in markup.
		 * @param {string} name - Name of widget property.
		 * @param {string} value - Value of attribute in markup.
		 * @private
		 */
		_parsePrototypeAttr: function (name, value) {
			// inner function useful to reduce cyclomatic complexity when using jshint
			function stringToObject(value) {
				var obj;

				try {
					// TODO: remove this code if it isn't being used, so we don't scare people that are afraid of eval.
					/* jshint evil:true */
					// This will only be executed when complex parameters are used in markup
					// <my-tag constraints="max: 3, min: 2"></my-tag>
					// This can be avoided by using such complex parameters only programmatically or by not using
					// them at all.
					// This is harmless if you make sure the JavaScript code that is passed to the attribute
					// is harmless.
					obj = eval("(" + (value[0] === "{" ? "" : "{") + value + (value[0] === "{" ? "" : "}") + ")");
				}
				catch (e) {
					throw new SyntaxError("Error in attribute conversion to object: " + e.message +
						"\nAttribute Value: '" + value + "'");
				}
				return obj;
			}

			switch (typeof this[name]) {
			case "string":
				return value;
			case "number":
				return value - 0;
			case "boolean":
				return value !== "false";
			case "object":
				// Try to interpret value as global variable, ex: store="myStore", array of strings
				// ex: "1, 2, 3", or expression, ex: constraints="min: 10, max: 100"
				return getObject(value) ||
					(this[name] instanceof Array ? (value ? value.split(/\s+/) : []) : stringToObject(value));
			case "function":
				return this.parseFunctionAttribute(value, []);
			}
		},

		/**
		 * Helper to parse function attribute in markup.  Unlike `_parsePrototypeAttr()`, does not require a
		 * corresponding widget property.  Functions can be specified as global variables or as inline javascript:
		 *
		 * ```html
		 * <my-widget funcAttr="globalFunction" on-click="console.log(event.pageX);">
		 * ```
		 *
		 * @param {string} value - Value of the attribute.
		 * @param {string[]} params - When generating a function from inline javascript, give it these parameter names.
		 * @protected
		 */
		parseFunctionAttribute: function (value, params) {
			/* jshint evil:true */
			// new Function() will only be executed if you have properties that are of function type in your widget
			// and that you use them in your tag attributes as follows:
			// <my-tag whatever="console.log(param)"></my-tag>
			// This can be avoided by setting the function programmatically or by not setting it at all.
			// This is harmless if you make sure the JavaScript code that is passed to the attribute is harmless.
			// Use Function.bind to get a partial on Function constructor (trick to call it with an array
			// of args instead list of args).
			return getObject(value) ||
				new (Function.bind.apply(Function, [undefined].concat(params).concat([value])))();
		},

		/**
		 * Helper for parsing declarative widgets.  Interpret a given attribute specified in markup, returning either:
		 *
		 * - `undefined`: ignore
		 * - `{prop: prop, value: value}`: set `this[prop] = value`
		 * - `{event: event, callback: callback}`: call `this.on(event, callback)`
		 *
		 * @param {string} name - Attribute name.
		 * @param {string} value - Attribute value.
		 * @protected
		 */
		parseAttribute: function (name, value) {
			var pcm = this._propCaseMap;
			if (name in pcm) {
				name =  pcm[name]; // convert to correct case for widget
				return {
					prop: name,
					value: this._parsePrototypeAttr(name, value)
				};
			} else if (/^on-/.test(name)) {
				return {
					event: name.substring(3),
					callback: this.parseFunctionAttribute(value, ["event"])
				};
			}
		},

		/**
		 * Parse declaratively specified attributes for widget properties and connects.
		 * @returns {Array} Info about the attributes and their values as returned by `parseAttribute()`.
		 * @private
		 */
		_mapAttributes: function () {
			var attr,
				idx = 0,
				parsedAttrs = [],
				attrsToRemove = [];

			while ((attr = this.attributes[idx++])) {
				var name = attr.name.toLowerCase();	// note: will be lower case already except for IE9
				var parsedAttr = this.parseAttribute(name, attr.value);
				if (parsedAttr) {
					parsedAttrs.push(parsedAttr);
					attrsToRemove.push(attr.name);
				}
			}

			// Remove attributes that were processed, but do it in a separate loop so we don't modify this.attributes
			// while we are looping through it.   (See CustomElement-attr.html test failure on IE10.)
			attrsToRemove.forEach(this.removeAttribute, this);

			return parsedAttrs;
		},

		/**
		 * Release resources used by this custom element and its descendants.
		 * After calling this method, the element can no longer be used,
		 * and should be removed from the document.
		 */
		destroy: function () {
			// Destroy descendants
			this.findCustomElements().forEach(function (w) {
				if (w.destroy) {
					w.destroy();
				}
			});

			if (this.parentNode) {
				this.parentNode.removeChild(this);
				this.detachedCallback();
			}
		},

		/**
		 * Emits a synthetic event of specified type, based on eventObj.
		 * @param {string} type - Name of event.
		 * @param {Object} [eventObj] - Properties to mix in to emitted event.  Can also contain
		 * `bubbles` and `cancelable` properties to control how the event is emitted.
		 * @param {Element} [node] - Element to emit event on, defaults to `this`.
		 * @returns {boolean} True if the event was *not* canceled, false if it was canceled.
		 * @example
		 * myWidget.emit("query-success", {});
		 * @protected
		 */
		emit: function (type, eventObj, node) {
			on.emit(node || this, type, eventObj);
		},

		/**
		 * Call specified function when event occurs.
		 *
		 * Note that the function is not run in any particular scope, so if (for example) you want it to run
		 * in the element's scope you must do `myCustomElement.on("click", myCustomElement.func.bind(myCustomElement))`.
		 *
		 * Note that `delite/Widget` overrides `on()` so that `on("focus", ...)` and `on("blur", ...) will trigger the
		 * listener when focus moves into or out of the widget, rather than just when the widget's root node is
		 * focused/blurred.  In other words, the listener is called when the widget is conceptually focused or blurred.
		 *
		 * @param {string} type - Name of event (ex: "click").
		 * @param {Function} func - Callback function.
		 * @param {Element} [node] - Element to attach handler to, defaults to `this`.
		 * @returns {Object} Handle with `remove()` method to cancel the event.
		 */
		on: function (type, func, node) {
			return on(node || this, type, func);
		},

		// Override Stateful#getPropsToObserve() because the way to get the list of properties to watch is different
		// than for a plain Stateful.  Especially since IE doesn't support prototype swizzling.
		getPropsToObserve: function () {
			return this._ctor._propsToObserve;
		},

		// Before deliver() runs, process any native properties (tabIndex, dir) etc. that may have been
		// set without the custom setter getting called.
		deliver: dcl.before(function () {
			this._processNativeProps();
		}),

		/**
		 * Search subtree under root returning custom elements found.
		 * @param {Element} [root] - Node to search under.
		 */
		findCustomElements: function (root) {
			var outAry = [];

			function getChildrenHelper(root) {
				for (var node = root.firstChild; node; node = node.nextSibling) {
					if (node.nodeType === 1 && node.createdCallback) {
						outAry.push(node);
					} else {
						getChildrenHelper(node);
					}
				}
			}

			getChildrenHelper(root || this);
			return outAry;
		}
	});

	// Setup automatic chaining for lifecycle methods.
	// destroy() is chained in Destroyable.js.
	dcl.chainAfter(CustomElement, "createdCallback");
	dcl.chainAfter(CustomElement, "attachedCallback");
	dcl.chainBefore(CustomElement, "detachedCallback");

	return CustomElement;
});

define('xblox/RunScript',[
    "dojo/_base/lang",
    "dojo/on",
    "dcl/dcl",//make sure
    "delite/register",
    "delite/CustomElement",
    //explicit because a bootstrap might not be loaded at some point
    "xide/factory/Events",
    //explicit because a bootstrap might not be loaded at some point
    'xide/utils/StringUtils',
    'xide/types/Types',
    'xblox/model/Referenced',
    'xide/mixins/EventedMixin',
    'xide/mixins/ReloadMixin',
    /** 2way binding dependencies **/
    'xwire/Binding',
    'xwire/EventSource',
    'xwire/WidgetTarget'

], function (lang, on, dcl, register, CustomElement, Events, utils, Types, Referenced, EventedMixin, ReloadMixin, Binding, EventSource, WidgetTarget, registry) {

    var debugWidgets = false;
    var debugApp = false;
    var debugAttach = false;
    var debugCreated = false;
    var debugBinding = false;
    var debugRun = false;
    /**
     * Proxy widget to run a selected blox script on the parent widget/node.
     *
     * @class xblox/RunScript
     */
    var Impl = {
        declaredClass: 'xblox/RunScript',
        targetevent: '',
        sourceevent: "",
        sourceeventvaluepath: "",
        sourceeventnamepath: "",
        targetproperty: "",
        targetvariable: "",
        targetfilter: "",
        script: "",
        bidirectional: false,
        blockGroup: '',
        block: '',
        _targetBlock: null,
        _targetReference: null,
        _appContext: null,
        _complete: false,
        enabled: true,
        stop: false,
        _events: [],
        context: null,
        accept: '',
        transform: '',
        mode: 0,
        _2wayHandle: null,//the handle
        binding: null,//the binding
        /**
         * soft destroy
         */
        reset: function () {
            this._destroyHandles();
            if (this._2wayHandle) {
                this._2wayHandle.remove();
            }
            if (this.binding) {
                this.binding.destroy();
            }
            delete this.binding;
            this._appContext = null;
            this._targetReference = null;
        },
        /**
         *
         * @param newSettings
         */
        onSettingsChanged: function () {
            this.reset();
            if (!this.enabled) {
                return;
            }
            this.onAppReady(null);
        },
        getChildren: function () {
            return [];
        },
        /**
         * @inheritDoc
         */
        destroy: function () {
            this.onDestroy && this.onDestroy();
            this.reset();
            delete this.binding;
            delete this.context;
        },
        /**
         * The final execution when 'target event' has been triggered. This
         * will run the select block.
         * @param event
         * @param val
         */
        run: function (event, val) {
            if (!this.enabled) {
                return;
            }
            var settings = {};
            //filter, in design mode, we ain't do anything
            if (this.context && this.context.delegate) {
                if (this.context.delegate.isDesignMode && this.context.delegate.isDesignMode()) {
                    return;
                }
                if (this.context.delegate.getBlockSettings) {
                    settings = this.context.delegate.getBlockSettings();
                }
            }
            //setup variables
            var block = this._targetBlock,
                context = this._targetReference,
                result;

            if (block && context) {
                block.context = context;
                block._targetReference = context;
                if (this.targetvariable && this.targetvariable.length && val != null) {
                    block.override = {
                        variables: {}
                    };
                    block.override.variables[this.targetvariable] = val;
                }
                result = block.solve(block.scope, settings);
                debugRun && console.log('run ' + block.name + ' for even ' + event, result + ' for ' + this.id, this._targetReference);
            }
        },
        /**
         * Callback when the minimum parameters are given: targetReference & targetBlock
         */
        onReady: function () {
            if (!this._targetReference) {
                this._setupTargetReference();
            }

            //resolve 2way binding
            if (this._targetReference && this['bidirectional'] === true && this.sourceevent && this.sourceevent.length && !this.binding) {
                this._setup2WayBinding();
            }

            if (this._complete) {
                return;
            }
            if (!this._targetReference) {
                console.error('have no target reference');
            }
            if (!this._targetBlock) {
                console.error('have no target block');
            }

            if (this._targetReference && this._targetBlock) {
                //we trigger on events
                if (this.targetevent) {
                    this._complete = true;
                    //patch the target
                    utils.mixin(this._targetReference, EventedMixin.prototype);
                    var _target = this._targetReference.domNode || this._targetReference,
                        _event = this.targetevent,
                        _isWidget = this._targetReference.declaredClass || this._targetReference.startup,
                        _hasWidgetCallback = this._targetReference.on != null && this._targetReference['on' + utils.capitalize(_event)] != null,
                        _handle = null,
                        _isDelite = _target.render != null && _target.on != null,
                        thiz = this;

                    if (_isWidget && (this._targetReference.baseClass && this._targetReference.baseClass.indexOf('dijitContentPane') != -1) || this._targetReference.render != null || this._targetReference.on != null) {
                        _isWidget = false;//use on
                    }

                    if (_target) {
                        debugBinding && console.log('wire success ' + this.id + ' for ' + this.targetevent);
                        if (!_isDelite && (!_hasWidgetCallback || !_isWidget)) {
                            _handle = on(_target, this.targetevent, function (evt) {
                                this.run(this.targetevent);
                            }.bind(this));
                        } else {
                            _target = this._targetReference;
                            var useOn = true;
                            if (useOn) {
                                if (!_isDelite) {
                                    var _e = 'on' + utils.capitalize(_event);
                                    this._targetReference[_e] = function (val, nada) {
                                        if (_target.ignore !== true) {
                                            thiz.run(thiz.targetevent, val);
                                        }
                                    };
                                } else {
                                    _handle = _target.on(this.targetevent, function (evt) {
                                        if (this.stop) {
                                            evt.preventDefault();
                                            evt.stopImmediatePropagation();
                                        }
                                        this.run(this.targetevent, evt.currentTarget.value);
                                    }.bind(this));
                                }
                            } else {
                                this._targetReference['on' + utils.capitalize(_event)] = function (val) {
                                    if (_target.ignore !== true) {
                                        thiz.run(thiz.targetevent, val);
                                    }
                                };
                            }
                        }
                        _handle && this._events.push(_handle);
                    } else {
                        console.error('have no target to wire');
                    }
                }
            } else {
                console.error('invalid params, abort', this);
            }
            if (this.binding) {
                this.binding.start();
            }
        },
        resolveBlock: function (block) {
            var ctx = this._appContext;
            var deviceManager = ctx.getDeviceManager();
            if (block.indexOf('://') !== -1) {
                if (!deviceManager) {
                    return;
                }
                var _block = deviceManager.getBlock(this.block);
                if (_block) {
                    return _block;
                }
            }
        },
        /**
         *
         * @param ctx
         * @private
         */
        _setBlock: function (ctx) {
            ctx = ctx || window['appContext'];
            if (!ctx || !ctx.getBlockManager) {
                debugApp && console.warn('have no context or block manager');
                return;
            }
            this._appContext = ctx;
            var blockManager = ctx.getBlockManager(),
                deviceManager = ctx.getDeviceManager(),
                thiz = this;

            if (!blockManager) {
                return;
            }
            var _block = this.block ? this.block : this.getAttribute('block');
            if (_block && _block.length > 0) {
                var parts = utils.parse_url(_block);
                if (_block.indexOf('://') !== -1) {
                    if (!deviceManager) {
                        debugApp && console.warn('xScript::_setBlock : have no device manager');
                        return;
                    }
                    var _block2 = deviceManager.getBlock(_block);
                    if (_block2) {
                        thiz._targetBlock = _block2;
                        thiz.onReady();
                    } else {
                        debugBinding && console.warn('cant get block : ' + _block);
                    }
                } else {
                    blockManager.load(parts.scheme, parts.host).then(function (scope) {
                        var block = scope.getBlockById(thiz.blockid);
                        if (block) {
                            thiz._targetBlock = block;
                            thiz.onReady();
                        }
                    });
                }
            } else if (this.scopeid) {
                var scope = blockManager.hasScope(thiz.scopeid);
                if (scope) {
                    var block = scope.getBlockById(thiz.blockid);
                    if (block) {
                        thiz._targetBlock = block;
                        thiz.onReady();
                    } else {
                        block = scope.getVariableById(thiz.blockid);
                        if (block) {
                            thiz._targetBlock = block;
                            thiz.onReady();
                        }
                    }
                } else {
                    console.error('have no scope!');
                }
            }
        },
        initWithReference: function (ref) {
            if (ref.nodeType !== 1) {
                return;
            }
            this._targetReference = ref;
            this._setBlock(null);
        },
        resolveFilter: function (expression, value, widget) {
            if (this._targetBlock) {
                var expressionModel = this._targetBlock.scope.expressionModel;
                value = expressionModel.parseVariable(this._targetBlock.scope, {
                    value: expression
                }, '', false, false, widget, [value]);
            }
            return value;
        },
        /**
         * setup outbound wire, assumes all parameters are checked
         * @private
         */
        _setup1WayBinding: function () {
            debugBinding && console.log('setup 1 way binding');
            //destroy old handle
            if (this._2wayHandle) {
                this._2wayHandle.remove();
            }

            if (!this._targetBlock) {
                console.error('invalid params for one way binding');
                return;
            }
            var sourceVariableTitle = this._targetBlock.name;
            //wire to system event
            var bindingSource = new EventSource({
                //listen to variable changes
                trigger: this.sourceevent,
                //the path to value, ie: 'item.value'
                path: this.sourceeventvaluepath,
                //add an event filter
                filters: [{
                    // variable title must match,ie: 'item.title'
                    path: this.sourceeventnamepath,
                    // the name of the variable, ie: 'Volume'
                    value: sourceVariableTitle
                }]
            });


            //now map the event source to a widget
            var bindingTarget = new WidgetTarget({
                //the path to value
                path: this.targetproperty,
                object: this._targetReference,
                targetFilter: this.targetfilter,
                delegate: this
            });
            var accept = this._findbyTagAndName('D-SCRIPT', 'accept');
            var transform = this._findbyTagAndName('D-SCRIPT', 'transform');
            //construct the binding
            var binding = new Binding({
                source: bindingSource,
                target: bindingTarget,
                accept: this._findbyTagAndName('D-SCRIPT', 'accept'),
                transform: this._findbyTagAndName('D-SCRIPT', 'transform')
            });
            this.binding = binding;
            binding.start();
        },
        _findbyTagAndName: function (tag, name) {
            var scripts = $(this).find(tag);
            for (var i = 0; i < scripts.length; i++) {
                var script = scripts[i];
                if ($(script).attr('name') === name) {
                    return script;
                }
            }
            return null;
        },
        /**
         * setup inbound wire, assumes all parameters are checked
         * @private
         */
        _setup2WayBinding: function () {
            if (this.binding) {
                return;
            }
            debugBinding && console.log('setup 2 way binding');
            //destroy old handle
            if (this._2wayHandle) {
                this._2wayHandle.remove();
            }
            //wire to system event
            var bindingSource = new EventSource({
                //listen to variable changes
                trigger: this.sourceevent,
                //the path to value, ie: 'item.value'
                path: this.sourceeventvaluepath,
                //add an event filter
                filters: [{
                    // variable title must match,ie: 'item.title'
                    path: this.sourceeventnamepath,
                    // the name of the variable, ie: 'Volume'
                    value: this.targetvariable
                }]
            });

            //now map the event source to a widget
            var bindingTarget = new WidgetTarget({
                //the path to value
                path: 'value',
                object: this._targetReference
            });
            this.binding = new Binding({
                source: bindingSource,
                target: bindingTarget
            });
            this.binding.start();
        },
        /**
         * Returns the widget whose DOM tree contains the specified DOMNode, or null if
         * the node is not contained within the DOM tree of any widget
         * @param {Element} node
         */
        getEnclosingWidget: function (node) {
            if (node) {
                do {
                    if (node.nodeType === 1 && node.render) {
                        return node;
                    }
                } while ((node = node.parentNode));
            }
            return null;
        },
        /**
         * Function to setup the target reference
         * on the surrounding widget!
         *
         */
        _setupTargetReference: function () {
            var i = 0,
                element = this,
                widget = null;

            while (i < 2 && !widget) {
                if (element) {
                    element = element.parentNode;
                    widget = this.getEnclosingWidget(element, "widgetId");
                    if (!widget) {
                        widget = this.getEnclosingWidget(element, "widgetid");
                    }
                }
                i++;
            }
            if (widget) {
                debugWidgets && console.info('have widget reference' + '  : ', widget);
                this.initWithReference(widget);
            } else {
                if (this.domNode && this.domNode.parentNode) {
                    this.initWithReference(this.domNode.parentNode);
                    debugWidgets && console.error('cant find widget reference, using parent node', this._targetReference);
                } else {
                    if (this.parentNode) {
                        this.initWithReference(this.parentNode);
                    }
                    debugWidgets && console.error('cant find widget reference', this);
                }

            }
        },
        /**
         * Required in case of dojoConfig.parseOnLoad
         * @param evt
         */
        onAppReady: function (evt) {
            debugApp && console.log('-ready');
            //resolve target reference
            if (!this._targetReference) {
                this._setupTargetReference();
            }
            //resolve target block
            if (!this._targetBlock) {
                this._setBlock(evt ? evt.context : null);
            }

            this.mode = this['bidirectional'] === true ? 0 : 1;
            //normal mode, allows 2-way binding
            if (this.mode === 0) {
                //resolve 2way binding
                if (this._targetBlock && this._targetReference && this['bidirectional'] === true && this.sourceevent && this.sourceevent.length) {
                    this._setup2WayBinding();
                }

                //if both are valid, run the the init procedure
                if (this._targetReference && this._targetBlock) {
                    this.onReady();
                }

            } else if (this.mode === 1 && this._targetBlock) {
                if (this._targetReference && this.sourceevent && this.sourceevent.length && this.targetproperty && this.targetproperty.length) {
                    this._setup1WayBinding();
                    if (this.binding) {
                        this.binding.start();
                    }
                }
            }
            //track context {xapp/manager/Context}
            if (evt && evt.context) {
                this.context = evt.context;
            }
        },
        detachedCallback: function () {
            debugAttach && console.info('detachedCallback', this);
            if (this._appContext) {
                this.destroy();
            }
        },
        /**
         * Delite created callback
         */
        createdCallback: function () {
            debugCreated && console.info('createdCallback', this);
        },
        /**
         * Delite attached callback
         */
        attachedCallback: function () {
            debugAttach && console.info('attachedCallback', this);
            if (this._started) {
                return;
            }
            this.initReload();
            this.subscribe(Types.EVENTS.ON_APP_READY);
            this._started = true;

        },
        detachCallback: function () {
        },
        render: function () {

        },
        postRender: function () {

        },
        startup: function () {
            debugAttach && console.log('startup');
            this.inherited(arguments);
            this.onAppReady();
            this.initReload();
            this.subscribe(Types.EVENTS.ON_APP_READY);

        }
    };

    //package and declare via dcl
    var _class = dcl([EventedMixin.dcl, ReloadMixin.dcl, Referenced.dcl], Impl);
    //static access to Impl.
    _class.Impl = Impl;
    return register("d-xscript", [HTMLElement, CustomElement, _class]);
});
define('xblox/_State',[
    "dojo/_base/lang",
    "dojo/on",
    "dcl/dcl",//make sure
    "delite/register",
    "delite/CustomElement",
    //explicit because a bootstrap might not be loaded at some point
    "xide/factory/Events",
    //explicit because a bootstrap might not be loaded at some point
    'xide/utils/StringUtils',
    'xide/types/Types',
    'xblox/model/Referenced',
    'xide/mixins/EventedMixin',
    'xide/mixins/ReloadMixin',
    'xwire/Binding',
    'xwire/EventSource',
    'xwire/WidgetTarget'
], function (lang, on, dcl,register, CustomElement, Events, utils, Types, Referenced, EventedMixin, ReloadMixin, Binding, EventSource, WidgetTarget) {
    var debugWidgets = false;
    var debugApp = false;
    var debugAttach = false;
    var debugCreated = false;
    var debugBinding = false;
    var debugRun = false;
    /**
     * Proxy widget to run a selected blox script on the parent widget/node.
     *
     * @class xblox/RunScript
     */
    var Impl = {
        declaredClass: 'xblox/_State',
        script:"",
        bidirectional: false,
        _targetBlock: null,
        _targetReference: null,
        _complete: false,
        enabled: true,
        stop: false,
        _events: [],
        context: null,
        name:"Default",
        isState:true,
        _isState:function(){
            return true;
        },
        /**
         * soft destroy
         */
        reset:function(){
            
        },
        getChildren: function () {
            return [];
        },
        /**
         * @inheritDoc
         */
        destroy: function () {
            this.onDestroy && this.onDestroy();
            this.reset();
        },
        /**
         * The final execution when 'target event' has been triggered. This
         * will run the select block.
         * @param event
         * @param val
         */
        run: function (event, val) {
            if (!this.enabled) {
                return;
            }            
        },
        /**
         * Callback when the minimum parameters are given: targetReference & targetBlock
         */
        onReady: function () {            
        },
        getEnclosingWidget: function (node) {
            if(node) {
                do {
                    if (node.nodeType === 1 && node.render) {
                        return node;
                    }
                } while ((node = node.parentNode));
            }
            return null;
        },
        initWithReference: function (ref) {
            //target node or widget
            if(ref.nodeType!==1){
                return;
            }
            this._targetReference = ref;
        },
        /**
         * Function to setup the target reference
         * on the surrounding widget!
         *
         */
        _setupTargetReference: function () {
            var i = 0,
                element = this,
                widget = null;

            while (i < 2 && !widget) {

                if (element) {
                    element = element.parentNode;
                    widget = this.getEnclosingWidget(element, "widgetId");
                    if (!widget) {
                        widget = this.getEnclosingWidget(element, "widgetid");
                    }
                }
                i++;
            }
            if (widget) {
                debugWidgets && console.info('have widget reference' + '  : ', [widget,this]);
                this.initWithReference(widget);
                if(widget._attached && widget.stateReady){
                    widget.stateReady(this);
                }

            } else {
                if (this.domNode && this.domNode.parentNode) {
                    this.initWithReference(this.domNode.parentNode);
                    debugWidgets && console.error('cant find widget reference, using parent node', this._targetReference);
                } else {
                    if(this.parentNode){
                        this.initWithReference(this.parentNode);
                    }
                    debugWidgets && console.error('cant find widget reference', this);
                }
            }
        },
        onAppReady: function (evt) {
            debugApp && console.log('-ready');
            //resolve target reference
            //if (!this._targetReference) {
                this._setupTargetReference();
            //}

            //track context {xapp/manager/Context}
            if (evt && evt.context) {
                this.context = evt.context;
            }
        },
        detachedCallback:function(){
            debugAttach && console.info('detachedCallback', this);
            if(this._appContext){
                this.destroy();
            }

        },
        applyTo:function(widget){
            
        },
        /**
         * Delite created callback
         */
        createdCallback: function () {
            //console.error('createdCallback', this);
            debugCreated && console.info('createdCallback', this);
            if (!this._targetReference) {
                this._setupTargetReference();
                if(this._targetReference && this._targetReference.stateReady){
                    this._targetReference.stateReady(this);
                }
            }
        },
        attachedCallback: function () {
            debugAttach && console.info('attachedCallback', this);
            if (this._started) {
                return;
            }
            this.onAppReady();//emulates
            this.subscribe(Types.EVENTS.ON_APP_READY);
            this._started = true;
        }

    };
    //package and declare via dcl
    var _class = dcl([EventedMixin.dcl,Referenced.dcl], Impl);
    return _class; 
});
define('xblox/CSSState',[
    "dcl/dcl",
    "delite/register",
    "delite/CustomElement",
    'xblox/_State',
    'xide/utils',
    'xdojo/has'
], function (dcl,register, CustomElement,_State,utils,has) {
    var extraRules = [],
        extraSheet,
        removeMethod,
        rulesProperty,
        invalidCssChars = /([^A-Za-z0-9_\u00A0-\uFFFF-])/g;

    has.add('dom-contains', function (global, doc, element) {
        return !!element.contains; // not supported by FF < 9
    });
    function removeRule(index) {
        // Function called by the remove method on objects returned by addCssRule.
        var realIndex = extraRules[index],
            i, l;
        if (realIndex === undefined) {
            return; // already removed
        }

        // remove rule indicated in internal array at index
        extraSheet[removeMethod](realIndex);

        // Clear internal array item representing rule that was just deleted.
        // NOTE: we do NOT splice, since the point of this array is specifically
        // to negotiate the splicing that occurs in the stylesheet itself!
        extraRules[index] = undefined;

        // Then update array items as necessary to downshift remaining rule indices.
        // Can start at index + 1, since array is sparse but strictly increasing.
        for (i = index + 1, l = extraRules.length; i < l; i++) {
            if (extraRules[i] > realIndex) {
                extraRules[i]--;
            }
        }
    }
    var Impl = {
        _lastState:null,
        declaredClass: 'xblox/CSSState',
        cssClass:"",
        addCssRule: function (selector, css) {
            // summary:
            //		Dynamically adds a style rule to the document.  Returns an object
            //		with a remove method which can be called to later remove the rule.

            if (!extraSheet) {
                // First time, create an extra stylesheet for adding rules
                extraSheet = document.createElement('style');
                document.getElementsByTagName('head')[0].appendChild(extraSheet);
                // Keep reference to actual StyleSheet object (`styleSheet` for IE < 9)
                extraSheet = extraSheet.sheet || extraSheet.styleSheet;
                // Store name of method used to remove rules (`removeRule` for IE < 9)
                removeMethod = extraSheet.deleteRule ? 'deleteRule' : 'removeRule';
                // Store name of property used to access rules (`rules` for IE < 9)
                rulesProperty = extraSheet.cssRules ? 'cssRules' : 'rules';
            }

            var index = extraRules.length;
            extraRules[index] = (extraSheet.cssRules || extraSheet.rules).length;
            extraSheet.addRule ?
                extraSheet.addRule(selector, css) :
                extraSheet.insertRule(selector + '{' + css + '}', extraRules[index]);
            return {
                get: function (prop) {
                    return extraSheet[rulesProperty][extraRules[index]].style[prop];
                },
                set: function (prop, value) {
                    if (typeof extraRules[index] !== 'undefined') {
                        extraSheet[rulesProperty][extraRules[index]].style[prop] = value;
                    }
                },
                remove: function () {
                    removeRule(index);
                },
                sheet:extraSheet
            };
        },
        escapeCssIdentifier: function (id, replace) {
            return typeof id === 'string' ? id.replace(invalidCssChars, replace || '\\$1') : id;
        },
        detachedCallback:function(){
            this._styles && _.each(this._styles,function(style){
                style.remove();
            });
            delete this._styles;
        },
        applyTo:function(widget,name){
            if(this._lastState){
                this._lastState.remove();
            }
            delete this._lastStateName;
            this._lastStateName = name;
            if(!this._attached){
                return;
            }
            var cssClass = this.cssClass;
            var isCSSClass = cssClass.length > 0;
            var id = widget.id || utils.createUUID();
            var _uniqueId = widget.tagName.replace(/\./g,"_") + '_' + id;
            var css = '' + this.innerHTML;
            css = css.replace('.style','');
            css = css.replace(/<(?:.|\n)*?>/gm, '');
            css = css.replace('{','');
            css = css.replace('}','');
            css = css.replace(/(\r\n|\n|\r|\t)/gm,"");

            _uniqueId+='_state_' + name;

            $(widget).removeClass($(widget).data('_lastCSSState'));
            $(widget).removeClass($(widget).data('_lastCSSClass'));
            $(widget).removeClass(cssClass);

            if(!cssClass) {
                $(widget).addClass(_uniqueId);
                $(widget).data('_lastCSSState', _uniqueId);
                var selectorPrefix = '.' + this.escapeCssIdentifier(_uniqueId);
                if (!this._styles) {
                    this._styles = [];
                }
                var style = this.addCssRule(selectorPrefix, css);
                this._styles.push(style);
            }else{
                $(widget).addClass(cssClass);
                $(widget).data('_lastCSSClass', cssClass);
            }
        }

    };

    var _class = dcl([_State], Impl);
    //static access to Impl.
    _class.Impl = Impl;
    return register("d-xstate-css", [HTMLElement, CustomElement, _class]);
});
define('xblox/StyleState',[
    'dcl/dcl',
    'delite/register',
    'delite/CustomElement',
    'xide/factory/Events',
    'xide/utils/StringUtils',
    'xide/types/Types',
    'xblox/_State'
], function (dcl,register, CustomElement, Events, utils, Types,_State) {
    var Impl = {
        declaredClass: 'xblox/StyleState',
        _targetReference: null,        
        name:"Default",
        _widget:null,
        /**
         * Convert Style String to an object array, eg: { color:value,.... }
         * @param styleString
         * @returns {{}}
         * @private
         */
        _toObject:function(styleString){
            if(!styleString){
                return {};
            }
            var _result = {};
            var _values = styleString.split(';');
            for (var i = 0; i < _values.length; i++) {
                var obj = _values[i];
                if(!obj || obj.length==0 || !obj.split){
                    continue;
                }
                var keyVal = obj.split(':');
                if(!keyVal || !keyVal.length){
                    continue;
                }
                var key = obj.substring(0,obj.indexOf(':'));
                var value = obj.substring(obj.indexOf(':')+1,obj.length);

                _result[key]=value;
            }
            return _result;
        },
        _toStyleString:function(values){

            var _values = [];
            for(var prop in values){
                _values.push( prop + ':' + values[prop]);
            }
            return _values.join(';') + ';';
        },
        onChanged:function () {
            this.applyTo(this._widget);
        },
        applyTo:function(widget){
            $(widget).removeClass($(widget).data('_lastCSSState'));
            $(widget).removeClass($(widget).data('_lastCSSClass'));
            if(widget && widget._attached){
                this._widget = widget;
                var _cssWidget = this._toObject($(widget).attr('style'));
                var _cssThis = this._toObject($(this).attr('style'));
                var styleOut = utils.mixin(_cssWidget,_cssThis);
                $(widget).attr('style',this._toStyleString(styleOut));
            }
        }
    };
    var _class = dcl(_State, Impl);
    return register("d-xstate-style", [HTMLElement, CustomElement, _class]);
});
define('xblox/mainr.js',[
    "xblox/component",
    "xblox/embedded",
    "xblox/model/Block",
    "xblox/model/logic/CaseBlock",
    "xblox/model/functions/CallBlock",
    "xblox/model/code/CallMethod",
    "xblox/model/code/RunScript",
    "xblox/model/code/RunBlock",
    "xblox/model/loops/ForBlock",
    "xblox/model/loops/WhileBlock",
    "xblox/model/variables/VariableAssignmentBlock",
    "xblox/model/logic/IfBlock",
    "xblox/model/logic/ElseIfBlock",
    "xblox/model/logic/SwitchBlock",
    "xblox/model/variables/VariableSwitch",
    "xblox/model/events/OnEvent",
    "xblox/model/events/OnKey",
    "xblox/model/logging/Log",
    "xblox/model/html/SetStyle",
    "xblox/model/html/SetCSS",
    "xblox/model/html/SetState",
    "xblox/manager/BlockManager",
    "xblox/factory/Blocks",
    "xblox/model/Referenced",
    "xblox/types/Types",
    "xblox/RunScript",
    "xblox/CSSState",
    "xblox/StyleState"
], function(){});

