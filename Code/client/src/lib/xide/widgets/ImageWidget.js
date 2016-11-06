define([
    'dcl/dcl',
    "dojo/_base/lang",
    "./FileWidget",
    'xide/factory'
], function (dcl, lang, FileWidget, factory) {
    return dcl(FileWidget, {
        declaredClass: "xide.widgets.ImageWidget",
        oriPath: null,
        img: null,
        minHeight: "51px;",
        value: "",
        clearValue: function () {
            this.setValue(null);
        },
        getOptions: function () {

            var ctx = window['xFileContext'];

            var _defaultOptions = {
                title: this.dialogTitle,
                owner: ctx,
                dst: {
                    name: 'Select',
                    path: '.'
                },
                src: '.',
                ctx: ctx
            };
            var options = this.options || ctx.defaultOptions;
            if (options) {
                _defaultOptions = lang.mixin(_defaultOptions, options);
                console.dir(options);
            } else {
                console.error('have no options');
            }

            //we actually need a new store with different options
            if (_defaultOptions.store && _defaultOptions.defaultStoreName) {

                _defaultOptions.defaultStoreOptions = {
                    "fields": 1663,
                    "includeList": "jpg,png,jpeg",
                    "excludeList": "*"
                };
                //get a new store
                _defaultOptions.store = ctx.getStore(_defaultOptions.defaultStoreName, _defaultOptions.defaultStoreOptions);
            }

            return _defaultOptions;
        },
        onSelect: function () {
            var thiz = this;
            var defaultOptions = this.getOptions();
            factory.createFileSelectDialogLarge(defaultOptions, function (path) {
                thiz.onFileSelected(path);
            });
        }
    });
});