define([
    'dcl/dcl',
    'xide/widgets/TemplatedWidgetBase',
    'xide/widgets/_CSSMixin',
    'xide/utils'
], function (dcl, TemplatedWidgetBase, utils) {
    return dcl([TemplatedWidgetBase], {
        declaredClass: "xide.widgets.ProgressItem",
        baseClass: "fileActionProgress actionMessage",
        backgroundClass: "imageBackground",
        tag: "div",
        root: null,
        templateString: "<div><span attachTo='spinner' class='fa-spinner fa-spin'></span><span class='fileActionProgressLabel'>${!message}</span><span class='fileActionProgressLabel' attachTo='endMessage'></span><div attachTo='root' class='fileActionItem'></div></div>",
        item: null,
        spinner: null,
        endMessage: null,
        message: '',
        terminatorItem: null,
        topics: null,
        autoDestroy: true,
        terminatorMessage: null,
        onFinish: function (data) {
            utils.destroy(this.spinner);
            this.endMessage.innerHTML = ': ' + this.translate('done');
            var thiz = this;
            if (this.autoDestroy) {
                setTimeout(function () {
                    utils.destroy(thiz);
                }, 5000);
            }
        },
        onEnd: function (data) {
            if (data && data && data.terminatorItem) {
                if (data.terminatorItem == this.terminatorItem) {
                    this.onFinish();
                }
            }
        },
        startup: function () {
            if (this.terminatorMessage) {
                this.subscribe(this.terminatorMessage, this.onEnd);
            }
        }
    });
});