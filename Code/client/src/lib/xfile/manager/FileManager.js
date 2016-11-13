/** @module xfile/manager/FileManager */
define([
    'dcl/dcl',
    'dojo/_base/kernel',
    'xide/manager/ServerActionBase',
    'xide/types',
    'xfile/types',
    'xide/utils',
    'xide/encoding/SHA1',
    'xide/manager/RPCService',
    'dojo/Deferred',
    'xdojo/has',
    'xfile/manager/FileManagerActions',
    'require',
    'xfile/factory/Store',
    "xide/lodash",
    'xdojo/has!electron?xfile/manager/Electron'
], function (dcl,dojo,ServerActionBase, types, fTypes, utils, SHA1, RPCService, Deferred,has,FileManagerActions,require,StoreFactory,_,Electron) {
    var bases = [ServerActionBase, FileManagerActions];
    if(has('electronx') && Electron){
        bases.push(Electron);
    }
    var debug = false;
    /**
     * @class module:xfile.manager.FileManager
     * @extends {module:xide/manager/ServerActionBase}
     * @extends {module:xide/manager/ManagerBase}
     * @augments {module:xide/mixins/EventedMixin}
     */
    return dcl(bases, {
        declaredClass:"xfile.manager.FileManager",
        /**
         * Returns a new name 
         * @param item
         * @param others
         * @returns {*}
         */
        getNewName:function(item,others){
            var name = item.name.replace('.meta.json','');
            var found = false;
            var i = 1;
            var newName = null;
            while (!found){
                newName = name + '-' + i + '.meta.json';
                var colliding = _.find(others,{
                    name:newName
                });

                if(!colliding){
                    found = true;
                }else{
                    i++;
                }
            }
            return newName;
        },
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        //  Variables
        //
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        _uploadXHR: null,
        store: null,
        config: null,
        filesToUpload: null,
        serviceUrl: "index.php",
        serviceClass: 'XCOM_Directory_Service',
        settingsStore: null,
        stores:[],
        getStore:function(mount,cache){
            var store =  _.find(this.stores,{
                mount:mount
            });
            if(store){
                return store;
            }
            return StoreFactory.createFileStore(mount,null,this.config,null,this.ctx);
        },
        addStore:function(store){
            this.stores.push(store);
            store._on('destroy',this.removeStore.bind(this));
        },
        removeStore:function(store){
            var index = this.stores.indexOf(store);
            if(index) {
                this.stores.remove(store);
            }
        },
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        //  Standard manager interface implementation
        //
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        download: function (src) {
            var selection = [];
            selection.push(src.path);
            var thiz = this;
            var downloadUrl = decodeURIComponent(this.serviceUrl);
            downloadUrl = downloadUrl.replace('view=rpc', 'view=smdCall');
            if (downloadUrl.indexOf('?') != -1) {
                downloadUrl += '&';
            } else {
                downloadUrl += '?';
            }
            var serviceClass = this.serviceClass || 'XCOM_Directory_Service';
            var path = utils.buildPath(src.mount, src.path, true);
            path = this.serviceObject.base64_encode(path);
            downloadUrl += 'service=' + serviceClass + '.get&path=' + path + '&callback=asdf';
            if (this.config.DOWNLOAD_URL) {
                downloadUrl = '' + this.config.DOWNLOAD_URL;
                downloadUrl += '&path=' + path + '&callback=asdf';
            }
            downloadUrl += '&raw=html';
            downloadUrl += '&attachment=1';
            var aParams = utils.getUrlArgs(location.href);
            utils.mixin(aParams, {
                "service": serviceClass + ".get",
                "path": path,
                "callback": "asdf",
                "raw": "html",
                "attachment": "1",
                "send": "1"
            });
            delete  aParams['theme'];
            delete  aParams['debug'];
            delete  aParams['width'];
            delete  aParams['attachment'];
            delete  aParams['send'];
            var pStr = dojo.toJson(JSON.string(aParams));
            var signature = SHA1._hmac(pStr, this.config.RPC_PARAMS.rpcSignatureToken, 1);
            downloadUrl += '&' + this.config.RPC_PARAMS.rpcUserField + '=' + this.config.RPC_PARAMS.rpcUserValue;
            downloadUrl += '&' + this.config.RPC_PARAMS.rpcSignatureField + '=' + signature;
            window.open(downloadUrl);
        },
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        //  File manager only related
        //
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        getImageUrl: function (src, preventCache, extraParams) {
            preventCache = location.href.indexOf('noImageCache') != -1 || preventCache === true || src.dirty === true;
            var downloadUrl = decodeURIComponent(this.serviceUrl);
            downloadUrl = downloadUrl.replace('view=rpc', 'view=smdCall');
            var path = utils.buildPath(src.mount, src.path, true);
            path = this.serviceObject.base64_encode(path);

            var serviceClass = this.ctx.getFileManager().serviceClass || 'XCOM_Directory_Service';
            if (downloadUrl.indexOf('?') != -1) {
                downloadUrl += '&';
            } else {
                downloadUrl += '?';
            }
            downloadUrl += 'service=' + serviceClass + '.get&path=' + path + '&callback=asdf';
            if (this.config.DOWNLOAD_URL) {
                downloadUrl = '' + this.config.DOWNLOAD_URL;
                downloadUrl += '&path=' + path + '&callback=asdf';
            }
            downloadUrl += '&raw=html';
            downloadUrl += '&attachment=0';
            downloadUrl += '&send=1';
            var aParams = utils.getUrlArgs(location.href);
            utils.mixin(aParams, {
                "service": serviceClass + ".get",
                "path": path,
                "callback": "asdf",
                "raw": "html"
            });
            utils.mixin(aParams, extraParams);
            delete  aParams['theme'];
            delete  aParams['debug'];
            delete  aParams['width'];
            var pStr = dojo.toJson(aParams);
            var signature = SHA1._hmac(pStr, this.config.RPC_PARAMS.rpcSignatureToken, 1);
            downloadUrl += '&' + this.config.RPC_PARAMS.rpcUserField + '=' + this.config.RPC_PARAMS.rpcUserValue;
            downloadUrl += '&' + this.config.RPC_PARAMS.rpcSignatureField + '=' + signature;
            if (preventCache) {
                downloadUrl += '&time=' + new Date().getTime();
            }
            if (extraParams) {
                for (var p in extraParams) {
                    downloadUrl += '&' + p + '=' + extraParams[p];
                }
            }
            return downloadUrl;
        },
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        //  Upload related
        //
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        onFileUploadFailed: function (item) {
            var thiz = this,
                eventKeys = types.EVENTS;
            if (item.dfd) {
                item.dfd.reject(item);
            }
            thiz.filesToUpload.remove(item);
            thiz.publish(eventKeys.ON_UPLOAD_FAILED, {item: item}, thiz);
        },
        onFileUploaded: function (item) {
            var thiz = this,
                eventKeys = types.EVENTS;

            setTimeout(function () {
                var struct1 = {
                    message: '' + item.file.name + ' uploaded to ' + item.dstDir,
                    messageArgs: {}
                };
                thiz.publish(eventKeys.STATUS, struct1, thiz);
                if (item.dfd) {
                    item.dfd.resolve(item);
                }
                thiz.filesToUpload.remove(item);
                thiz.publish(eventKeys.ON_UPLOAD_FINISH, {item: item});
            }, 500);
        },
        getUploadUrl: function () {
            var url = '' + decodeURIComponent(this.serviceUrl);
            url = url.replace('view=rpc', 'view=upload');
            url = url.replace('../../../../', './');
            url += '&service=';
            url += this.serviceClass;
            url += '.put&callback=nada';
            return url;
        },
        initXHRUpload: function (item, autoRename, dstDir, mount) {
            var xhr = new XMLHttpRequest();
            var uploadUrl = this.getUploadUrl();
            var uri = '' + uploadUrl;
            uri += '&mount=' + encodeURIComponent(mount);
            uri += '&dstDir=' + encodeURIComponent(dstDir);
            var thiz = this;
            var upload = xhr.upload;
            upload.addEventListener("progress", function (e) {
                if (!e.lengthComputable) {
                    thiz.onFileUploaded(item);
                } else {
                    var struct = {
                        item: item,
                        progress: e
                    };
                    item.isLoading = true;
                    item.dfd.progress(struct);
                }
            }.bind(this), false);

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.responseText && xhr.responseText != 'OK') {
                        var error = utils.getJson(xhr.responseText);
                        if (!error && xhr.responseText.indexOf('Fata Error')) {
                            error = {
                                result: [xhr.responseText],
                                code: 1
                            };
                        }
                        if (error && error.result && _.isArray(error.result) && error.result.length > 0) {
                            var _message = null;
                            for (var i = 0; i < error.result.length; i++) {
                                thiz.publish(types.EVENTS.ERROR, 'Error uploading : ' + item.name + ' ' + error.result[i], thiz);
                                _message = error.result[i];
                            }
                            if (_message) {
                                item.error = _message;
                            }
                            thiz.onFileUploadFailed(item);
                            thiz.submitNext();
                            return;
                        }
                        if (error && error.error) {
                            thiz.publish(types.EVENTS.ERROR, 'Error uploading : ' + item.name + ' ' + error.error.message, thiz);
                            thiz.onFileUploadFailed(item);
                        }
                    }
                    thiz.onFileUploaded(item);
                    thiz.submitNext();
                }
            }.bind(this);
            upload.onerror = function () {
                thiz.publish(types.EVENTS.ERROR, 'Error uploading : ' + item.name, thiz);
            };
            xhr.open("POST", uri, true);
            return xhr;
        },
        hasLoadingItem: function () {
            for (var i = 0; i < this.filesToUpload.length; i++) {
                if (this.filesToUpload[i].status == 'loading') {
                    return this.filesToUpload[i];
                }
            }
            return false;
        },
        /**
         *
         * @param files
         * @param mount
         * @param path
         * @param callee
         * @param view
         * @returns {Deferred[]}
         */
        upload: function (files, mount, path, callee, view) {
            var dfds = [];
            for (var i = 0; i < files.length; i++) {
                var uploadStruct = {
                    file: files[i],
                    dstDir: '' + path,
                    mount: '' + mount,
                    callee: callee,
                    view: callee,
                    dfd: new Deferred()
                };
                dfds.push(uploadStruct['dfd']);
                this.filesToUpload.push(uploadStruct);
            }
            this.submitNext();
            return dfds;
        },
        sendFileUsingFormData: function (xhr, file) {
            var formData = new FormData();
            formData.append("userfile_0", file.file);
            xhr.send(formData);
        },
        sendFileMultipart: function (item) {
            var auto_rename = false;
            item.status = 'loading';
            var xhr = this.initXHRUpload(item, (auto_rename ? "auto_rename=true" : ""), item['dstDir'], item['mount']);
            this.publish(types.EVENTS.ON_UPLOAD_BEGIN,{
                item: item,
                name: item.name
            }, this);
            if (window.FormData) {
                this.sendFileUsingFormData(xhr, item);
            }
        },
        submitNext: function () {
            var item = this.getNextUploadItem();
            if (item) {
                this.sendFileMultipart(item);
            }
        },
        getNextUploadItem: function () {
            for (var i = 0; i < this.filesToUpload.length; i++) {
                if (!this.filesToUpload[i].status) {
                    return this.filesToUpload[i];
                }
            }
            return false;
        },
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        //  Error handling
        //
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        onError: function (err) {
            if (err) {
                if (err.code === 1) {
                    if (err.message && _.isArray(err.message)) {
                        this.publish(types.EVENTS.ERROR, err.message.join('<br/>'), this);
                        return;
                    }
                } else if (err.code === 0) {
                    this.publish(types.EVENTS.STATUS, 'Ok', this);
                }
            }
            this.publish(types.EVENTS.ERROR, {
                error: err
            }, this);
        },
        addError: function (def) {
            var thiz = this;
            var _cb = function () {
                thiz.onError();
            };
            def.addCallback(_cb);
        },
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        //  pre RPC roundup
        //
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        downloadItem: function (src, readyCB) {
            return this.callMethod(types.OPERATION.DOWNLOAD, [src], readyCB, true);
        },
        downloadTo: function (url, mount, dst, readyCB, dstItem) {
            if (dstItem) {
                var thiz = this;
                var _cb = function (result) {
                    var _failed = false;
                    if (result && result.error && result.error.code == 1) {
                        _failed = true;
                    }
                    thiz.publish(types.EVENTS.ON_DOWNLOAD_TO_END, {
                        terminatorItem: dstItem,
                        failed: _failed
                    }, this);

                    readyCB(arguments);
                };
                thiz.publish(types.EVENTS.ON_DOWNLOAD_TO_BEGIN, {
                    dst: dstItem,
                    url: url,
                    items: [dstItem]
                }, this);
            } else {
                console.log('download from remote url have no dest item');
            }
            return this.callMethod(types.OPERATION.DOWNLOAD_TO, [url, mount, dst], _cb, true);
        },
        find: function (mount, conf, readyCB) {
            try {
                return this.callMethod(types.OPERATION.FIND, [mount, conf], readyCB, true);
            } catch (e) {
                logError(e,'find');
            }
        },
        getContent: function (mount, path, readyCB, emit) {
            if(this.getContentE){
                var res = this.getContentE.apply(this,arguments);
                if(res){
                    return res;
                }
            }
            if(has('php')) {
                var _path = this.serviceObject.base64_encode(utils.buildPath(mount, path, true));
                return this.callMethod(types.OPERATION.GET_CONTENT, [_path, false, false], readyCB, false);
            }else{
                return this._getText(require.toUrl(mount).replace('main.js','') + '/' + path,{
                    sync: false,
                    handleAs: 'text'
                }).then(function(res){
                    try {
                        if (readyCB) {
                            readyCB(res);
                        }
                    } catch (e) {
                        logError(e, 'error running RPC');
                    }
                });
            }
        },
        setContent: function (mount, path, content, readyCB) {
            this.publish(types.EVENTS.ON_CHANGED_CONTENT, {
                'mount': mount,
                'path': path,
                'content': content
            });
            this.publish(types.EVENTS.ON_STATUS_MESSAGE, {
                text: "Did save file : " + mount + '://' + path
            });
            if(this.setContentE){
                var res = this.setContentE.apply(this,arguments);
                if(res){
                    return res;
                }
            }
            return this.callMethod(types.OPERATION.SET_CONTENT, [mount, path, content], readyCB, true);
        },
        onMessages: function (res) {
            var events = utils.getJson(res.events);
            if (events && _.isArray(events)) {
                for (var i = 0; i < events.length; i++) {
                    var struct = {
                        path: events[i].relPath
                    };
                    utils.mixin(struct, events[i]);
                    this.publish(events[i].clientEvent, struct, this);
                }
            }
        },
        onErrors: function (res) {},
        init:function(){
            this.stores = [];
        },
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        //  RPC helpers
        //
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        callMethodEx: function (serverClassIn, method, args, readyCB, omitError) {
            /***
             * Check we the RPC method is in the SMD
             */
            var serviceClass = serverClassIn || this.serviceClass;
            var thiz = this;
            if (!this.serviceObject[serviceClass][method]) {
                if (omitError === true) {
                    this.onError({
                        code: 1,
                        message: ['Sorry, server doesnt know ' + method]
                    });
                }
                return null;
            }
            /***
             * Build signature
             */
            var params = {};
            params = utils.mixin(params, this.config.RPC_PARAMS.rpcFixedParams);
            /**
             * Mixin mandatory fields
             */
            params[this.config.RPC_PARAMS.rpcUserField] = this.config.RPC_PARAMS.rpcUserValue;
            this.serviceObject.extraArgs = params;
            this.serviceObject.signatureField = this.config.RPC_PARAMS.rpcSignatureField;
            this.serviceObject.signatureToken = this.config.RPC_PARAMS.rpcSignatureToken;
            this.serviceObject[serviceClass][method](args).then(function (res) {
                try {
                    if (readyCB) {
                        readyCB(res);
                    }
                } catch (e) {
                    console.error('bad news : callback for method ' + method + ' caused a crash in service class ' + serviceClass);
                }
                if (res && res.error && res.error.code == 3) {
                    setTimeout(function () {
                        thiz.onMessages(res.error);
                    }, 50);
                }

                if (res && res.error && res.error && res.error.code !== 0) {
                    thiz.onError(res.error);
                    return;
                }

                thiz.publish(types.EVENTS.STATUS, {
                    message: 'Ok!'
                }, this);

            }, function (err) {
                thiz.onError(err);
            });


        },
        callMethod: function (method, args, readyCB, omitError) {
            var thiz = this;
            /***
             * Check we the RPC method is in the SMD
             */
            var serviceClass = this.serviceClass;
            try {
                if (!this.serviceObject[serviceClass][method]) {
                    if (omitError === true) {
                        this.onError({
                            code: 1,
                            message: ['Sorry, server doesnt know ' + method]
                        });
                    }
                    return null;
                }
                /***
                 * Build signature
                 */
                var params = {};
                params = utils.mixin(params, this.config.RPC_PARAMS.rpcFixedParams);
                /**
                 * Mixin mandatory fields
                 */
                params[this.config.RPC_PARAMS.rpcUserField] = this.config.RPC_PARAMS.rpcUserValue;
                this.serviceObject.extraArgs = params;
                this.serviceObject.signatureField = this.config.RPC_PARAMS.rpcSignatureField;
                this.serviceObject.signatureToken = this.config.RPC_PARAMS.rpcSignatureToken;
                var dfd = this.serviceObject[this.serviceClass][method](args);
                dfd.then(function (res) {
                    try {
                        if (readyCB) {
                            readyCB(res);
                        }
                    } catch (e) {
                        console.error('crashed in ' + method);
                        logError(e, 'error running RPC');

                    }
                    //@TODO: batch, still needed?
                    if (res && res.error && res.error.code == 3) {
                        setTimeout(function () {
                            thiz.onMessages(res.error);
                        }, 50);
                    }

                    if (res && res.error && res.error && res.error.code == 1) {
                        thiz.onError(res.error);
                        return;
                    }
                    if (omitError !== false) {
                        var struct = {
                            message: 'Ok!'
                        };
                        thiz.publish(types.EVENTS.STATUS, struct, this);
                    }
                }, function (err) {
                    thiz.onError(err);
                });
                return dfd;
            } catch (e) {
                console.error('crash calling method' + e,arguments);
                thiz.onError(e);
                logError(e,'error ');
            }
        },
        _initService: function () {
            this.filesToUpload = [];
            if (!this.serviceObject) {
                if(this.serviceUrl) {
                    this.serviceObject = new RPCService(decodeURIComponent(this.serviceUrl));
                    this.serviceObject.config = this.config;
                }
            }
        }
    });
});