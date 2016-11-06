define([
    'xdojo/declare',
    'dojo/_base/lang',
    "dojo/dom-construct",
    'xide/utils'
], function (declare, lang, domConstruct, utils) {
    return declare("xide.widgets._InsertionMixin", null, {
        data: null,
        delegate: null,
        didInserts: false,
        doInsert: function (data) {
            if (!data) {
                return;
            }

            var dstNode = utils.find(data.query, this.domNode) || data.node || this.domNode;
            if (dstNode) {

                var widgetNS = data.widgetClass || "xide.widgets.TemplatedWidgetBase";

                var widgetClz = dojo.getObject(widgetNS);

                if (widgetClz) {

                    //try to find data
                    var wData = null;
                    if (this.dataItem && data.insertDataRef != null && this.dataItem[data.insertDataRef] != null) {
                        wData = dojo.isString(this.dataItem[data.insertDataRef]) ? dojo.fromJson(this.dataItem[data.insertDataRef]) : this.dataItem[data.insertDataRef];
                    }
                    var insert = data.insert || '<div></div>';
                    insert = utils.cleanString(insert);

                    //prepare constructor
                    var ctrArgs = {
                        templateString: insert,
                        dataItem: wData,
                        title: wData ? wData.title ? wData.title : wData.title : null,
                        className: data.className || ''
                    };

                    //patch constructor args
                    if (data.mixin != null) {

                        if (dojo.isString(data.mixin)) {
                            data.mixin = utils.cleanString(data.mixin);
                        }
                        data.mixin = dojo.isString(data.mixin) ? dojo.fromJson(data.mixin) : data.mixin;
                        if (data.mixin) {

                            //put content from code node into content
                            if (widgetNS === 'xide.layout.ContentPane') {
                                if (utils.isValidString(insert) && !data.mixin.innerHTML && !data.mixin.content) {
                                    data.mixin.content = insert;
                                }
                            }
                            lang.mixin(ctrArgs, data.mixin);
                        }
                    }

                    //build the widget
                    widget = null;
                    widgetParent = null;

                    var widgetParent = domConstruct.create('div');
                    var widget = new widgetClz(ctrArgs, widgetParent);
                    if (widget._addCssClasses && widget.domNode) {
                        widget._addCssClasses(widget.cssClass, widget.domNode);
                    }
                    dojo.place(widget.domNode, dstNode, data.place || 'after');
                    widget.startup();
                    return widget;
                }

            } else {
                console.error('have no dstNode');
            }
        },
        doInserts: function (data) {

            if (this.didInserts) {
                return;
            }

            if (data) {
                for (var i = 0; i < data.length; i++) {
                    this.doInsert(data[i]);
                }
            }
            this.didInserts = true;
        }
    });
});