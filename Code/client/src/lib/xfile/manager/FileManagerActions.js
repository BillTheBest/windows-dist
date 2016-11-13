define([
    'dcl/dcl',
    'xide/types',
    'xide/utils'
], function (dcl, types, utils) {
    /**
     * @class xfile.manager.FileManager
     * @augments module:xfile.manager.FileManager
     */
    return dcl(null, {
        declaredClass: "xfile/manager/FileManagerActions",
        /**
         * Publish a file's operations progress event
         * @param event
         * @param terminator
         * @param items
         * @param failed
         * @param extra
         * @private
         */
        _publishProgress: function (event, terminator, items, failed, extra) {
            var _args = {
                terminatorItem: terminator,
                failed: failed,
                items: items || terminator
            };
            utils.mixin(_args, extra);
            this.publish(event, _args, this);
        },
        /**
         *
         * @param operation
         * @param args
         * @param terminator
         * @param items
         * @returns {*}
         */
        doOperation: function (operation, args, terminator, items, extra, dfdOptions) {
            var thiz = this,
                operationCapitalized = operation.substring(0, 1).toUpperCase() + operation.substring(1),
                beginEvent = 'on' + operationCapitalized + 'Begin', //will evaluate for operation 'delete' to 'onDeleteBegin'
                endEvent = 'on' + operationCapitalized + 'End';

            thiz._publishProgress(beginEvent, terminator, items, false, extra);

            var rpcPromise = this.runDeferred(null, operation, args, dfdOptions).then(function () {
                thiz._publishProgress(endEvent, terminator, items, false, extra);
            }, function (err) {
                thiz._publishProgress(endEvent, terminator, items, true, extra);
            });
            return rpcPromise;
        },
        deleteItems: function (selection, options, dfdOptions) {
            return this.doOperation(types.OPERATION.DELETE, [selection, options, true], selection, selection, null, dfdOptions);
        },
        copyItem: function (selection, dst, options, dfdOptions) {
            return this.doOperation(types.OPERATION.COPY, [selection, dst, options, false], selection, selection, {dst: dst}, dfdOptions);
        },
        mkdir: function (mount, path, dfdOptions) {
            return this.doOperation(types.OPERATION.NEW_DIRECTORY, [mount, path], path, null, null, dfdOptions);
        },
        mkfile: function (mount, path, content) {
            return this.doOperation(types.OPERATION.NEW_FILE, [mount, path], path);
        },
        rename: function (mount, src, dst) {
            return this.doOperation(types.OPERATION.RENAME, [mount, src, dst], src);
        },
        moveItem: function (src, dst, include, exclude, mode, dfdOptions) {
            return this.doOperation(types.OPERATION.MOVE, [src, dst, include, exclude, mode], src, null, null, dfdOptions);
        },
        compressItem: function (mount, src, type, readyCB) {
            return this.doOperation(types.OPERATION.COMPRESS, [mount, src, type], src);
        },
        extractItem: function (mount, src, type) {
            return this.doOperation(types.OPERATION.EXTRACT, [mount, src], src);
        }
    });
});