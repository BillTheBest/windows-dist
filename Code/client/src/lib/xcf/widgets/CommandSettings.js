define([
    'dcl/dcl',
    "dojo/_base/declare",
    'dojo/dom-class',
    "xide/widgets/WidgetBase",
    'xide/factory',
    'xide/types',
    'xide/utils',
    'xcf/model/Command',
    'xide/views/_LayoutMixin',
    'xcf/model/Variable',
    'xide/widgets/ToggleButton',
    'xide/widgets/_ActionValueWidgetMixin',
    "dijit/form/TextBox",
    'xdocker/Docker2',
    'xblox/views/BlockGrid',
    'xide/widgets/TemplatedWidgetBase',
    'dojo/promise/all',
    "dojo/Deferred",
    "xlog/views/LogGrid"

], function (dcl,declare,domClass,WidgetBase, factory, types,utils, Command,_LayoutMixin,Variable,
             ToggleButton,_ActionValueWidgetMixin,TextBox, Docker,BlockGrid,TemplatedWidgetBase,all,Deferred,LogGrid) {

    return dcl([WidgetBase,_LayoutMixin.dcl], {
        declaredClass:"xcf.widgets.CommandSettings",
        templateString:'<div class="commandSettings" style="width: 100%;height: 100%;position:relative"></div>',
        cssClass: 'commandSettings',
        settingsPane: null,
        basicCommandsPane: null,
        conditionalCommandsPane: null,
        blockScope: null,
        lazy: true,
        settingsTemplate:null,
        getDocker:function(){
            if(!this._docker){
                this._docker = Docker.createDefault(this.domNode,{});
                this._docker.$container.css('top',0);
                this._docker.uuid ='cmd settings';
                this.add(this._docker);
            }
            return this._docker;
        },
        getGridClass:function(){

            var propertyStruct = {
                currentCIView:null,
                targetTop:null,
                _lastItem:null
            };

            var gridClass = declare('driverGrid', BlockGrid,{
                toolbarInitiallyHidden:true,
                highlightDelay:1000,
                propertyStruct : propertyStruct,
                /**
                 * Step/Run action
                 * @param block {block[]}
                 * @returns {boolean}
                 */
                _execute: function (blocks) {

                    var thiz = this;


                    function _clear(element){

                        if(element) {
                            setTimeout(function () {
                                element.removeClass('failedBlock successBlock activeBlock');
                            }, thiz.highlightDelay);
                        }
                    }

                    function _node(block){
                        if(block) {
                            var row = thiz.row(block);
                            if (row) {
                                var element = row.element;
                                if (element) {
                                    return $(element);
                                }
                            }
                        }
                        return null;
                    };

                    function mark(element,cssClass){

                        if(element) {
                            element.removeClass('failedBlock successBlock activeBlock');
                            element.addClass(cssClass);
                        }
                    }

                    var dfds = [],
                        EVENTS = types.EVENTS;

                    var _runHandle = this._on(EVENTS.ON_RUN_BLOCK,function(evt){
                        mark(_node(evt),'activeBlock');

                    });
                    var _successHandle = this._on(EVENTS.ON_RUN_BLOCK_SUCCESS,function(evt){
                        //console.log('mark success');
                        mark(_node(evt),'successBlock');
                        _clear(_node(evt));
                    });

                    var _errHandle = this._on(EVENTS.ON_RUN_BLOCK_FAILED,function(evt){
                        mark(_node(evt),'failedBlock');
                        _clear(_node(evt));

                    });




                    function run(block) {

                        if (!block || !block.scope) {
                            console.error('have no scope');
                            return;
                        }
                        try {

                            var blockDfd = block.scope.solveBlock(block, {
                                highlight: true,
                                force: true,
                                listener:thiz
                            });

                            dfds.push(blockDfd);

                            /*
                             blockDfd.then(function(result){
                             console.log('did run! : ' + result);
                             });
                             */
                            //console.log('run block result:',result);


                        } catch (e)
                        {

                            console.error(' excecuting block -  ' + block.name + ' failed! : ' + e);
                            //console.error(printStackTrace().join('\n\n'));
                        }
                        return true;
                    }

                    blocks  = _.isArray(blocks) ? blocks : [blocks];


                    function _patch(block){


                        block.runFrom=function(_blocks, index, settings)
                        {

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

                                    console.log('run child \n'+block.method);



                                    /*
                                     _patch(block);
                                     var blockDfd = block.solve(this.scope, settings);
                                     allDfds.push(blockDfd);
                                     */
                                    _patch(block);

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
                        };

                        block.solve=function(scope,settings,run,error){

                            this._currentIndex = 0;
                            this._return=[];

                            var _script = '' + this._get('method');
                            var thiz=this,
                                ctx = this.getContext(),
                                items = this[this._getContainer()],

                            //outer,head dfd
                                dfd = new Deferred,

                                listener = settings.listener,

                                isDfd = thiz.deferred;



                            if(listener) {
                                listener._emit(types.EVENTS.ON_RUN_BLOCK, thiz);
                            }

                            function _finish(result){

                                if(listener) {
                                    listener._emit(types.EVENTS.ON_RUN_BLOCK_SUCCESS, thiz);
                                }

                                dfd.resolve(result);


                            }

                            function _error(result){
                                dfd.reject(result);
                                if(listener) {
                                    listener._emit(types.EVENTS.ON_RUN_BLOCK_FAILED, thiz);
                                }
                            }


                            function _headDone(result){
                                //console.log('_headDone : ',result);
                                //more blocks?
                                if(items.length) {
                                    var subDfds = thiz.runFrom(items,0,settings);
                                    all(subDfds).then(function(what){
                                        console.log('all solved!',what);
                                        _finish(result);
                                    },function(err){

                                        console.error('error in chain',err);
                                        if(listener) {
                                            listener._emit(types.EVENTS.ON_RUN_BLOCK_SUCCESS, thiz);
                                        }
                                        dfd.resolve(err);
                                    });

                                }else{
                                    if(listener) {
                                        listener._emit(types.EVENTS.ON_RUN_BLOCK_SUCCESS, thiz);
                                    }
                                    dfd.resolve(result);
                                }
                            }




                            if(_script && _script.length){
                                var runScript = function() {


                                    var _function = new Function("{" + _script + "}");
                                    var _args = thiz.getArgs() || [];
                                    try {

                                        if(isDfd){

                                            ctx.resolve=function(result){
                                                console.log('def block done');
                                                if(thiz._deferredObject) {
                                                    thiz._deferredObject.resolve();
                                                }
                                                _headDone(result);
                                            }
                                        }
                                        var _parsed = _function.apply(ctx, _args || {});
                                        thiz._lastResult = _parsed;
                                        if (run) {
                                            run('Expression ' + _script + ' evaluates to ' + _parsed);
                                        }

                                        if(!isDfd) {
                                            _headDone(_parsed);
                                        }

                                        if (_parsed !== 'false' && _parsed !== false) {

                                        } else {
                                            //thiz.onFailed(thiz, settings);
                                            //return [];
                                        }
                                    } catch (e) {

                                        e=e ||{};

                                        _error(e);

                                        if (error) {
                                            error('invalid expression : \n' + _script + ': ' + e);
                                        }
                                        //thiz.onFailed(thiz, settings);
                                        //return [];
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
                                    runScript();
                                }

                            }else{
                                console.error('have no script');
                            }

                            return dfd;
                        }

                    }

                    _.each(blocks,_patch);

                    _.each(blocks,run);

                    all(dfds).then(function(){
                        console.log('did run all selected blocks!',thiz);
                        _runHandle.remove();
                        _successHandle.remove();
                        _errHandle.remove();
                    });

/*
                    function run(block) {
                        if (!block || !block.scope) {
                            console.error('have no scope');
                            return;
                        }
                        try {
                            var result = block.scope.solveBlock(block, {
                                highlight: true,
                                force: true
                            });
                        } catch (e) {
                            console.error(' excecuting block -  ' + block.name + ' failed! : ' + e);
                            console.error(printStackTrace().join('\n\n'));
                        }
                        return true;
                    }

                    blocks  = _.isArray(blocks) ? blocks : [blocks];


                    _.each(blocks,run);
                    */

                },
                execute: function (_blocks) {



                    console.clear();

                    var thiz = this;



                    ////////////////////////////////////////////////////////////////////////
                    //
                    //  Visual helpers to indicate run status:
                    //
                    function _clear(element){
                        if(element) {
                            setTimeout(function () {
                                element.removeClass('failedBlock successBlock activeBlock');
                            }, thiz.highlightDelay);
                        }
                    }

                    function _node(block){
                        if(block) {
                            var row = thiz.row(block);
                            if (row) {
                                var element = row.element;
                                if (element) {
                                    return $(element);
                                }
                            }
                        }
                        return null;
                    };

                    function mark(element,cssClass){

                        if(element) {
                            element.removeClass('failedBlock successBlock activeBlock');
                            element.addClass(cssClass);
                        }
                    }

                    var dfds = [],  //all Deferreds of selected blocks to run

                    //shortcut
                        EVENTS = types.EVENTS,

                    //normalize selection to array
                        blocks  = _.isArray(_blocks) ? _blocks : [_blocks],

                    //event handle "Run"
                        _runHandle = this._on(EVENTS.ON_RUN_BLOCK,function(evt){
                            mark(_node(evt),'activeBlock');
                        }),

                    //event handle "Success"
                        _successHandle = this._on(EVENTS.ON_RUN_BLOCK_SUCCESS,function(evt){
                            //console.log('marke success',evt);
                            mark(_node(evt),'successBlock');
                            _clear(_node(evt));
                        }),

                    //event handle "Error"
                        _errHandle = this._on(EVENTS.ON_RUN_BLOCK_FAILED,function(evt){
                            mark(_node(evt),'failedBlock');
                            _clear(_node(evt));
                        });






                    function run(block) {

                        if (!block || !block.scope) {
                            console.error('have no scope');
                            return;
                        }
                        try {

                            var blockDfd = block.scope.solveBlock(block, {
                                highlight: true,
                                force: true,
                                listener:thiz
                            });


                            dfds.push(blockDfd);

                            /*
                             blockDfd.then(function(result){
                             console.log('did run! : ' + result);
                             });
                             */
                            //console.log('run block result:',result);


                        } catch (e)
                        {
                            console.error(' excecuting block -  ' + block.name + ' failed! : ' + e);

                            logError(e,'excecuting block -  ' + block.name + ' failed! : ');

                            //console.error(printStackTrace().join('\n\n'));

                        }
                        return true;
                    }



                    function _patch(block){


                        block.runFrom=function(_blocks, index, settings){

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

                                    console.log('run child \n'+block.method);

                                    _patch(block);

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
                        };

                        block.solve=function(scope,settings,run,error){

                            this._currentIndex = 0;
                            this._return=[];

                            var _script = '' + this._get('method');

                            var thiz=this,
                                ctx = this.getContext(),
                                items = this[this._getContainer()],

                            //outer,head dfd
                                dfd = new Deferred,

                                listener = settings.listener,

                                isDfd = thiz.deferred;



                            //moved to Contains#onRunThis
                            if(listener) {
                                listener._emit(types.EVENTS.ON_RUN_BLOCK, thiz);
                            }

                            //function when a block did run successfully,
                            // moved to Contains#onDidRunItem
                            function _finish(dfd,result,event){

                                if(listener) {
                                    listener._emit(event || types.EVENTS.ON_RUN_BLOCK_SUCCESS, thiz);
                                }
                                dfd.resolve(result);


                            }

                            //function when a block did run successfully
                            function _error(result){
                                dfd.reject(result);
                                if(listener) {
                                    listener._emit(types.EVENTS.ON_RUN_BLOCK_FAILED, thiz);
                                }
                            }


                            //moved to Contains#onDidRunThis
                            function _headDone(result){


                                //more blocks?
                                if(items.length) {
                                    var subDfds = thiz.runFrom(items,0,settings);

                                    all(subDfds).then(function(what){
                                        console.log('all solved!',what);
                                        _finish(dfd,result);
                                    },function(err){
                                        console.error('error in chain',err);
                                        _finish(dfd,err);
                                    });

                                }else{
                                    _finish(dfd,result);
                                }
                            }


                            if(_script && _script.length){

                                var runScript = function() {

                                    var _function = new Function("{" + _script + "}");
                                    var _args = thiz.getArgs() || [];
                                    try {

                                        if(isDfd){

                                            ctx.resolve=function(result){
                                                console.log('def block done');
                                                if(thiz._deferredObject) {
                                                    thiz._deferredObject.resolve();
                                                }
                                                _headDone(result);
                                            }
                                        }
                                        var _parsed = _function.apply(ctx, _args || {});
                                        thiz._lastResult = _parsed;
                                        if (run) {
                                            run('Expression ' + _script + ' evaluates to ' + _parsed);
                                        }


                                        if(!isDfd) {
                                            console.log('root block done');
                                            //_headDone(_parsed);
                                            thiz.onDidRunThis(dfd,_parsed,items,settings);
                                        }

                                        if (_parsed !== 'false' && _parsed !== false) {

                                        } else {
                                            //thiz.onFailed(thiz, settings);
                                            //return [];
                                        }
                                    } catch (e) {

                                        e=e ||{};

                                        _error(e);

                                        if (error) {
                                            error('invalid expression : \n' + _script + ': ' + e);
                                        }
                                        //thiz.onFailed(thiz, settings);
                                        //return [];
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
                                    runScript();
                                }

                            }else{
                                console.error('have no script');
                            }
                            return dfd;
                        }


                    }

                    //_.each(blocks,_patch);

                    _.each(blocks,run);

                    all(dfds).then(function(){
                        console.log('did run all selected blocks!',thiz);
                        _runHandle.remove();
                        _successHandle.remove();
                        _errHandle.remove();
                    });



                },
                onCIChanged: function (ci, block, oldValue, newValue, field) {

                    console.log('on ci changed', arguments);

                    var _col= this.collection;
                    block = this.collection.getSync(block.id);
                    block.set(field, newValue);
                    block[field]=newValue;
                    _col.refreshItem(block);
                },
                _itemChanged: function (type, item, store) {

                    store = store || this.getStore(item);

                    var thiz = this;

                    function _refreshParent(item, silent) {

                        var parent = item.getParent();
                        if (parent) {
                            var args = {
                                target: parent
                            };
                            if (silent) {
                                this._muteSelectionEvents = true;
                            }
                            store.emit('update', args);
                            if (silent) {
                                this._muteSelectionEvents = false;
                            }
                        } else {
                            thiz.refresh();
                        }
                    }

                    function select(item) {

                        thiz.select(item, null, true, {
                            focus: true,
                            delay: 20,
                            append: false
                        });
                    }

                    switch (type) {

                        case 'added':
                        {
                            //_refreshParent(item);
                            //this.deselectAll();
                            this.refresh();
                            select(item);
                            break;
                        }

                        case 'changed':
                        {
                            this.refresh();
                            select(item);
                            break;
                        }


                        case 'moved':
                        {
                            //_refreshParent(item,true);
                            //this.refresh();
                            //select(item);
                            break;
                        }

                        case 'deleted':
                        {

                            var parent = item.getParent();
                            //var _prev = item.getPreviousBlock() || item.getNextBlock() || parent;
                            var _prev = item.next(null, -1) || item.next(null, 1) || parent;
                            if (parent) {
                                var _container = parent.getContainer();
                                if (_container) {
                                    _.each(_container, function (child) {
                                        if (child.id == item.id) {
                                            _container.remove(child);
                                        }
                                    });
                                }
                            }

                            this.refresh();
                            /*
                             if (_prev) {
                             select(_prev);
                             }
                             */
                            break;
                        }

                    }


                },
                _onFocusChanged:function(focused,type){
                    this.inherited(arguments);
                    if(!focused){
                        this._lastSelection = [];
                    }

                },
                save:function(){



                    var thiz = this,
                        driver = thiz.userData.driver,
                        ctx = thiz.userData.ctx,
                        fileManager = ctx.getFileManager(),

                        //instance scope
                        scope = thiz.blockScope,
                        instance = scope.instance,

                        //original driver scope
                        originalScope = driver.blockScope,
                        path = driver.path.replace('.meta.json','.xblox'),
                        scopeToSave = originalScope || scope,
                        mount = driver.scope;



                    if(originalScope && scopeToSave!=originalScope){
                        originalScope.fromScope(scope);
                    }

                    if (scope) {

                        var all = {
                            blocks: null,
                            variables: null
                        };

                        var blocks = scope.blocksToJson();
                        try {
                            //test integrity
                            dojo.fromJson(JSON.stringify(blocks));
                        } catch (e) {
                            console.error('invalid data');
                            return;
                        }

                        var _onSaved = function () {};

                        all.blocks = blocks;

                        console.log('saving driver ' + mount + '/'+path,driver);


                        fileManager.setContent(mount,path,JSON.stringify(all, null, 2),_onSaved);
                        //this.saveContent(JSON.stringify(all, null, 2), this._item, _onSaved);
                    }
                },
                runAction: function (action) {

                    var thiz = this;
                    var sel = this.getSelection();

                    //console.log('run action: ', this.blockGroup);

                    function addItem(_class,group){

                        var cmd = factory.createBlock(_class, {
                            name: "No Title",
                            send: "nada",
                            scope: thiz.blockScope,
                            group: group
                        });


                        thiz.deselectAll();
                        _.each(thiz.grids,function(grid){
                            if(grid) {
                                grid.refresh();
                            }
                        });
                        setTimeout(function () {
                            thiz.select([cmd],null,true,{
                                focus:true
                            });
                        }, 200);

                    }
                    if (action.command == 'New/Command') {

                        addItem(Command,this.blockGroup);


                    }

                    if (action.command == 'New/Variable') {
                        addItem(Variable,'basicVariables');
                    }

                    if (action.command == 'File/Save') {
                        this.save();
                    }
                    return this.inherited(arguments);
                },
                startup:function(){

                    var thiz = this;

                    function _node(evt){
                        var item = evt.target;
                        if(item) {
                            var row = thiz.row(item);
                            if (row) {
                                var element = row.element;
                                if (element) {
                                    return $(element);
                                }
                            }
                        }
                        return null;
                    };




                    function mark(element,cssClass){
                        if(element) {
                            element.removeClass('failedBlock successBlock activeBlock');
                            element.addClass(cssClass);
                            setTimeout(function () {
                                element.removeClass(cssClass);
                                thiz._isHighLighting = false;
                            }, thiz.highlightDelay);
                        }
                    };

                    this.subscribe(types.EVENTS.ON_RUN_BLOCK,function(evt){
                        mark(_node(evt),'activeBlock');
                    });
                    this.subscribe(types.EVENTS.ON_RUN_BLOCK_FAILED,function(evt){
                        mark(_node(evt),'failedBlock');
                    });
                    this.subscribe(types.EVENTS.ON_RUN_BLOCK_SUCCESS,function(evt){
                        mark(_node(evt),'successBlock');
                    });


                    this.collection.on('update',function(evt){

                        var item = evt.target,
                            node = _node(evt),
                            type = evt.type;

                        if(type==='update' && evt.property ==='value'){
                            mark(node,'successBlock');
                        }

                        //console.warn('on store updated ', args);
                    });


                }
            });

            return gridClass;
        },
        completeGrid:function(grid){

            grid.userData = this.userData;

            var widget = this;

            function completeGrid(_grid) {
                _grid._on('onAddActions', function (evt) {


                    var addAction = evt.addAction,
                        cmdAction = 'New/Command',
                        varAction = 'New/Variable',
                        permissions = evt.permissions,
                        VISIBILITY = types.ACTION_VISIBILITY,
                        thiz = this;

                    if(!addAction){
                        return;
                    }

                    addAction('Command', cmdAction, 'el-icon-plus-sign', ['ctrl n'], 'Home', 'Insert', 'item|view', null, null,{
                        dummy: true,
                        addPermission: true
                    },null, null);

                    addAction('Variable', varAction, 'fa-code', ['ctrl n'], 'Home', 'Insert', 'item|view', null, null,{
                        dummy: true,
                        addPermission: true
                    },null, null);



                    addAction('Properties', 'Step/Properties', 'fa-gears', ['alt enter'], 'Home', 'Step', 'item|view', null, null,
                        {
                            addPermission: true,
                            onCreate: function (action) {
                                action.handle=false;
                                action.setVisibility(types.ACTION_VISIBILITY.RIBBON, {
                                    widgetClass: declare.classFactory('_Checked', [ToggleButton, _ActionValueWidgetMixin], null, {}, null),
                                    widgetArgs: {
                                        icon1: 'fa-toggle-on',
                                        icon2: 'fa-toggle-off',
                                        delegate: thiz,
                                        checked: false,
                                        iconClass: 'fa-toggle-off'
                                    }
                                });
                            }
                        }, null, function () {
                            return thiz.getSelection().length == 0;
                        });



                    var settingsWidget = declare('commandSettings', TemplatedWidgetBase,{
                        templateString:'<div></div>',
                        _getText: function (url) {
                            var result;
                            var def = dojo.xhrGet({
                                url: url,
                                sync: true,
                                handleAs: 'text',
                                load: function (text) {
                                    result = text;
                                }
                            });
                            return '' + result + '';
                        },
                        startup:function(){
                            if(this._started){
                                return;
                            }

                            this.inherited(arguments);

                            if(!_grid.userData){
                                return;
                            }

                            var settings = utils.getJson(_grid.userData['params']) || {
                                    constants: {
                                        start: '',
                                        end: ''
                                    },
                                    send: {
                                        mode: false,
                                        interval: 500,
                                        timeout: 500,
                                        onReply: ''
                                    }
                                };

                            if(!widget.settingsTemplate){
                                widget.settingsTemplate = this._getText(require.toUrl('xcf/widgets/templates/commandSettingsNew.html'));
                            }


                            var settingsPane = utils.templatify(
                                null,
                                widget.settingsTemplate,
                                this.domNode,
                                {
                                    baseClass: 'settings',
                                    start: settings.constants.start,
                                    end: settings.constants.end,
                                    interval: settings.send.interval,
                                    timeout: settings.send.timeout,
                                    sendMode: settings.send.mode,
                                    onReply: settings.send.onReply,
                                    settings: settings
                                }, null
                            );


                            if (settings.send.mode) {
                                $(settingsPane.rReply).prop('checked', true);
                            } else {
                                $(settingsPane.rInterval).prop('checked', true);
                            }



                            var _onSettingsChanged = function () {
                                //update params field of our ci
                                thiz.userData['params'] = JSON.stringify(settingsPane.settings);
                                widget.setValue('{}');
                            };

                            //start
                            $(settingsPane.start).on('change',function(e){
                                settingsPane.settings.constants.start = e.target.value;
                                _onSettingsChanged();
                            });

                            //end
                            $(settingsPane.end).on('change',function(e){
                                settingsPane.settings.constants.end = e.target.value;
                                _onSettingsChanged();
                            });






                            //mode
                            $(settingsPane.rReply).on("change", function (e) {
                                var value = e.target.value=='on' ? 1:0
                                settingsPane.settings.send.mode = value;
                                _onSettingsChanged();
                            });

                            $(settingsPane.rInterval).on("change", function (e) {
                                var value = e.target.value=='on' ? 0:1;
                                settingsPane.settings.send.mode = value;
                                _onSettingsChanged();
                            });


                            //interval time
                            $(settingsPane.wInterval).on('change',function(e){
                                settingsPane.settings.send.interval = e.target.value;
                                _onSettingsChanged();
                            });






                            //on reply value
                            $(settingsPane.wOnReply).on('change',function(e){

                                settingsPane.settings.send.onReply = e.target.value;
                                _onSettingsChanged();
                            });

                            //onReply - timeout
                            $(settingsPane.wTimeout).on('change',function (e) {
                                settingsPane.settings.send.timeout = e.target.value;
                                _onSettingsChanged();
                            });

                        }
                    });


                    addAction('Settings', 'File/Settings', 'fa-gears', null, 'Settings', 'Settings', 'item|view', null, null,
                        {
                            addPermission: true,
                            handle:false,
                            onCreate: function (action) {

                                handle:false,

                                action.setVisibility(types.ACTION_VISIBILITY.MAIN_MENU, null);

                                action.setVisibility(types.ACTION_VISIBILITY.CONTEXT_MENU, null);

                                action.setVisibility(types.ACTION_VISIBILITY.ACTION_TOOLBAR, null);

                                action.setVisibility(types.ACTION_VISIBILITY.RIBBON,{
                                    widgetClass:settingsWidget
                                });
                            }
                        }, null, function () {
                            return thiz.getSelection().length == 0;
                        });



                });
                _grid._on('selectionChanged', function (evt) {
                    //console.log('selection ',evt);
                    //since we can only add blocks to command and not
                    //at root level, disable the 'Block/Insert' root action and
                    //its widget //references
                    var thiz = this,
                        selection = evt.selection,
                        item = selection[0],
                        blockInsert = thiz.getAction('Block/Insert'),
                        blockEnable = thiz.getAction('Step/Enable'),
                        newCommand = thiz.getAction('New/Command');


                    disable = function (disable) {

                        blockInsert.set('disabled', disable);

                        setTimeout(function () {
                            blockInsert.getReferences().forEach(function (ref) {
                                ref.set('disabled', disable);
                            });
                        }, 100);

                    }

                    var _disable = item ? false : true;
                    if(_grid.blockGroup === 'conditionalProcess'){
                        _disable=false;
                        newCommand.set('disabled', true);
                        setTimeout(function () {
                            newCommand.getReferences().forEach(function (ref) {
                                ref.set('disabled', true);
                            });
                        }, 100);
                    }

                    disable(_disable);


                    if (item) {
                        blockEnable.getReferences().forEach(function (ref) {
                            ref.set('checked', item.enabled);
                        });
                    }else{
                        /*
                         var props = _grid.getPropertyStruct();
                         props._lastItem = null;
                         _grid.setPropertyStruct(props);*/
                    }
                });
                _grid.startup();
            }
            completeGrid(grid);

            this.add(grid);


        },
        resize:function(){

            if(this._docker){
                this._docker.resize();
            }
            this.inherited(arguments);

        },
        onShow:function(){

            if(this._docker){
                this._docker.resize();
            }
            this.publish(types.EVENTS.RESIZE);

        },
        __createWidgets:function(){

        },
        createWidgets:function(){

            $(this.domNode.parentNode).css('height','100%');
            $(this.domNode.parentNode).css('width','100%');

            $(this.domNode).css('height','100%');

            var docker = this.getDocker(this.domNode),

                ci = this.userData,

                device = ci.device,

                ctx = ci.ctx,

                driver = ci.driver,

                //original or device instance
                scope = device ? device.blockScope : driver.blockScope,

                store = scope.blockStore,

                instance = driver.instance,

                widget = this,

                grids = [],

                gridClass = this.getGridClass(),

                defaultTabArgs = {
                    icon:false,
                    closeable:false,
                    movable:false,
                    moveable:true,
                    tabOrientation:types.DOCKER.TAB.TOP,
                    location:types.DOCKER.DOCK.STACKED
                },


                // 'Basic' commands tab
                basicCommandsTab = docker.addTab('DefaultFixed',
                    utils.mixin(defaultTabArgs,{
                        title: 'Basic Commands',
                        h:'90%'
                    })),

                // 'Conditional' commands tab
                condCommandsTab = docker.addTab('DefaultFixed',
                    utils.mixin(defaultTabArgs,{
                        title: 'Conditional Commands',
                        target:basicCommandsTab,
                        select:false,
                        h:'90%',
                        tabOrientation:types.DOCKER.TAB.TOP
                    }));

            docker.uuid = ' cmd';



            // 'Variables' tab
            var variablesTab = docker.addTab(null,
                utils.mixin(defaultTabArgs,{
                    title: 'Variables',
                    target:condCommandsTab,
                    select:false,
                    h:100,
                    tabOrientation:types.DOCKER.TAB.BOTTOM,
                    location:types.DOCKER.TAB.BOTTOM
                }));

            var logsTab, consoleTab = null;







            // 'Response' tab
            var responsesTab = docker.addTab(null,
                utils.mixin(defaultTabArgs,{
                    title: 'Responses',
                    target:variablesTab,
                    select:false,
                    h:100,
                    icon:null,
                    tabOrientation: types.DOCKER.TAB.BOTTOM,
                    location: types.DOCKER.DOCK.STACKED
                }));


            if(device){

                logsTab = docker.addTab(null,
                    utils.mixin(defaultTabArgs, {
                        title: 'Log',
                        target: responsesTab,
                        select: false,
                        icon:'fa-calendar',
                        tabOrientation: types.DOCKER.TAB.BOTTOM,
                        location: types.DOCKER.DOCK.STACKED
                    }));

            }

            // prepare right property panel but leave it closed

            this.getRightPanel(null,1);


            var basicArgs = {
                _getRight:function(){
                    return widget.__right;
                },
                ctx:ctx,
                blockScope: scope,
                toolbarInitiallyHidden:true,
                blockGroup: 'basic',
                attachDirect:true,
                collection: store.filter({
                    group: 'basic'
                }),
                //dndConstructor: SharedDndGridSource,
                //dndConstructor:Dnd.GridSource,
                __right:this.__right,
                _docker:docker,
                setPanelSplitPosition:widget.setPanelSplitPosition,
                getPanelSplitPosition:widget.getPanelSplitPosition
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////
            //basic commands

            try {
                var basicGrid = utils.addWidget(gridClass, basicArgs, null, basicCommandsTab, false);
                this.completeGrid(basicGrid, 'Command');
                grids.push(basicGrid);
            }catch(e){
                logError(e);
            }


            docker._on(types.DOCKER.EVENT.SPLITTER_POS_CHANGED,function(evt){

                var position = evt.position,
                    splitter = evt.splitter,
                    right = widget.__right;

                if(right && splitter == right.getSplitter()){
                    if(position<1){
                        basicGrid.showProperties(basicGrid.getSelection()[0],true);
                    }
                }
            });


            ////////////////////////////////////////////////////////////////////////////////////////////////////////
            //conditional commands
            var condArgs = {
                ctx:ctx,
                toolbarInitiallyHidden:true,
                _getRight:function(){
                    return widget.__right;
                },
                blockScope: scope,
                blockGroup: 'conditional',
                attachDirect:true,
                collection: store.filter({
                    group: 'conditional'
                }),
                //dndConstructor: SharedDndGridSource,
                //dndConstructor:Dnd.GridSource,
                __right:this.__right,
                _docker:docker,
                setPanelSplitPosition:widget.setPanelSplitPosition,
                getPanelSplitPosition:widget.getPanelSplitPosition
            }

            var condGrid = utils.addWidget(gridClass,condArgs,null,condCommandsTab,false);
            this.completeGrid(condGrid,'Command');
            grids.push(condGrid);


            ////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            //  Variables
            //
            var varArgs= {
                _getRight:function(){
                    return widget.__right;
                },
                ctx:ctx,
                blockScope: scope,
                blockGroup: 'basicVariables',
                attachDirect:true,
                collection: store.filter({
                    group: 'basicVariables'
                }),
                //dndConstructor: SharedDndGridSource,
                //dndConstructor:Dnd.GridSource,
                _docker:docker,
                setPanelSplitPosition:widget.setPanelSplitPosition,
                getPanelSplitPosition:widget.getPanelSplitPosition,
                showHeader:true,
                __right:this.__right,
                columns:[
                    {
                        label: "Name",
                        field: "name",
                        sortable: true,
                        width:'20%',
                        editorArgs: {
                            required: true,
                            promptMessage: "Enter a unique variable name",
                            //validator: thiz.variableNameValidator,
                            //delegate: thiz.delegate,
                            intermediateChanges: false
                        }
                        //editor: TextBox,
                        //editOn:'click',
                        //_editor: ValidationTextBox
                    },
                    {
                        label: "Initialize",
                        field: "initial",
                        sortable: false,
                        _editor: TextBox,
                        editOn:'click'
                    },
                    {
                        label: "Value",
                        field: "value",
                        sortable: false,
                        _editor: TextBox,
                        editOn:'click',
                        formatter:function(value,object){
                            //console.log('format var ' + value,object);
                            return value;
                        },
                        editorArgs: {
                            autocomplete:'on',
                            templateString:'<div class="dijit dijitReset dijitInline dijitLeft" id="widget_${id}" role="presentation"'+
                            '><div class="dijitReset dijitInputField dijitInputContainer"'+
                            '><input class="dijitReset dijitInputInner" data-dojo-attach-point="textbox,focusNode" autocomplete="on"'+
                            '${!nameAttrSetting} type="${type}"'+
                            '/></div'+
                            '></div>'
                        }
                    }
                ]
            };
            var varGrid = utils.addWidget(gridClass,varArgs,null,variablesTab,false);

            this.completeGrid(varGrid,'Variable');

            varGrid.resize();


            grids.push(varGrid);


            domClass.add(varGrid.domNode,'variableSettings');

            varGrid.on("dgrid-datachange", function (evt) {

                var cell = evt.cell;

                //normalize data
                var item = null;
                if (cell && cell.row && cell.row.data) {
                    item = cell.row.data;
                }
                var id = evt.rowId;
                var oldValue = evt.oldValue;
                var newValue = evt.value;

                var data = {
                    item: item,
                    id: id,
                    oldValue: oldValue,
                    newValue: newValue,
                    grid: varGrid,
                    field: cell.column.field
                };

                if (item) {
                    item[data.field] = data.newValue;
                }

            });

            /////////////////////////////////////////////////////////////////
            //
            //  Reponse Blocks
            //
            /////////////////////////////////////////////////////////////////
            //conditionalProcess
            //conditional commands
            var processArgs = {
                ctx:ctx,
                toolbarInitiallyHidden:true,
                _getRight:function(){
                    return widget.__right;
                },
                blockScope: scope,
                blockGroup: 'conditionalProcess',
                attachDirect:true,
                collection: store.filter({
                    group: 'conditionalProcess'
                }),
                __right:this.__right,
                _docker:docker,
                setPanelSplitPosition:widget.setPanelSplitPosition,
                getPanelSplitPosition:widget.getPanelSplitPosition
            }

            var processGrid = utils.addWidget(gridClass,processArgs,null,responsesTab,false);
            this.completeGrid(processGrid,'Process');
            grids.push(processGrid);

            /////////////////////////////////////////////////////////////////
            //
            //  LogGrid
            //
            /////////////////////////////////////////////////////////////////

            var doLog = true;
            var doConsole = true;

            var logManager = ctx.getLogManager(),
                logStore = logManager.store,
                logGridClass = declare("xcf.views.LogView", LogGrid, {}),
                logGrid = null;



            if(doLog && device && logsTab) {

                var info = device.info;

                var storeId = info.host + '_' + info.port + '_' + info.protocol;
                logManager.getStore(storeId).then(function(_store){

                    var logGridArgs = {
                        ctx: ctx,
                        attachDirect: true,
                        storeId:storeId,
                        delegate:logManager,
                        getRootFilter:function(){
                            return {
                                show:true,
                                host:info.host + ':' + info.port
                            }
                        },
                        collection: _store.filter({
                            show:true,
                            host:info.host + ':' + info.port
                        }).sort([{property: 'time', descending: true}])
                    };
                    logGrid = utils.addWidget(logGridClass, logGridArgs, null, logsTab, false, 'logGridView');
                    logGrid.startup();

                });

            }

            //////////////////////////////////////////////////////////
            //
            //
            //  Post work
            //
            //////////////////////////////////////////////////////////



            basicCommandsTab.select();

            var _grids = {
                basic:basicGrid,
                variables:varGrid,
                cond:condGrid,
                log:logGrid,
                process:processGrid
            };

            basicGrid.grids=_grids;
            condGrid.grids=_grids;
            varGrid.grids=_grids;
            processGrid.grids=_grids;


            if(ci.registerView){
                _.each(grids,function(grid){
                    //ci.actionTarget.addActionEmitter(grid);
                    ci.registerView(grid);
                });
            }

            this.grids = grids;

            docker.resize();


            setTimeout(function(){
                variablesTab.getFrame().showTitlebar(false);
                variablesTab.getSplitter().pos(0.6);
                variablesTab.select();


                if(device) {
                    consoleTab = docker.addTab(null,
                        utils.mixin(defaultTabArgs, {
                            title: 'Console',
                            target: logsTab,
                            select: false,
                            tabOrientation: types.DOCKER.TAB.RIGHT,
                            location: types.DOCKER.DOCK.RIGHT,
                            icon: "fa-terminal"
                        }));

                    if (doConsole && device) {
                        ctx.getDeviceManager().openConsole(device, consoleTab);
                    }
                }


                //onWidgetCreated(basicCommandsTab,condCommandsTab,variablesTab,logsTab);
            },500);

        },
        /**
         * Triggered when this source file has been reloaded
         */
        onReloaded: function () {
            if (this.containerNode) {
                dojo.empty(this.containerNode);
            }
            //this.createWidgets();
        },
        /***
         * Main entry
         */
        startup: function () {

            this.onReady();
            this.createWidgets();
        },
        _save: function () {
            var blocks = this.blockScope.blocksToJson();
            try {
                var _testData = dojo.fromJson(JSON.stringify(blocks));
            } catch (e) {
                console.error('invalid data');
                return;
            }
            this.setValue(JSON.stringify(blocks));
        },
        _onGridDataChanged: function (evt) {

            var item = this.store.get(evt.id);
            if (item) {
                item[evt.field] = evt.newValue;

                //@TODO
                //weird grid editor sh*
                if (evt.field == 'auto') {
                    if (item.auto > 100) {
                        this.blockScope.loopBlock(item);
                    }
                }
                if (evt.field == 'startup') {
                    if (evt.newValue == 'on') {
                        item[evt.field] = true;
                    }
                    if (evt.newValue == 'off') {
                        item[evt.field] = false;
                    }
                }
            }
            this.save();

        },
        //////////////////////////////////////////////////////////////////////
        //
        //  Utils
        //
        //////////////////////////////////////////////////////////////////////
        _getText: function (url) {
            var result;
            var def = dojo.xhrGet({
                url: url,
                sync: true,
                handleAs: 'text',
                load: function (text) {
                    result = text;
                }
            });
            return '' + result + '';
        }
    });
});

