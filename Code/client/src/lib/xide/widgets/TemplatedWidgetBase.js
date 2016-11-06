define([
    'dcl/dcl',
    'xide/utils',
    'xide/_base/_Widget'
], function (dcl,utils,_XWidget2) {

    var Implementation = {
        declaredClass: 'xide.widgets.TemplatedWidgetBase',
        data: null,
        delegate: null,
        didLoad: false,
        templateString: null,
        getParent: function () {
            return this._parent;
        },
        debounce: function (methodName, _function, delay, options, now) {
            return utils.debounce(this, methodName, _function, delay, options, now);
        },
        translate: function (value) {
            return this.localize(value);
        },
        _setupTranslations: function () {
            this._messages = [];
        },
        updateTitleNode: function (value) {}
    }

    //var Module = declare("xide.widgets.TemplatedWidgetBase", [_Widget, _XWidget,_TemplatedMixin, _WidgetsInTemplateMixin, EventedMixin],Implementation);
    var Module = dcl([_XWidget2],Implementation);
    dcl.chainAfter(Module,'startup');
    dcl.chainAfter(Module,'destroy');
    return Module;
});