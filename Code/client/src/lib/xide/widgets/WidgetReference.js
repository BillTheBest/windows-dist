define([
    'dcl/dcl',
    "dojo/_base/declare",
    "xide/widgets/Reference",
    "xide/widgets/_WidgetPickerMixin",
    'xide/utils',
    'xide/types',
    'xide/registry'
], function (dcl, declare, Reference, _WidgetPickerMixin, utils, types, registry) {

    return dcl([Reference, _WidgetPickerMixin], {
        declaredClass: "xide.widgets.WidgetReference",
        allowHTMLNodes: false,
        allowWidgets: true,
        lastPickedNode: null,
        lastPickedWidget: null,
        getValue: function () {
            return 'asdfasdf';
        },
        skipWidgetClasses: [
            'dijit.layout._TabButton',
            'xfile.views.ToggleSplitter'
        ],
        skipWidgetCSSClasses: [
            'dijitButtonHover',
            'dijitHover',
            'dijit',
            'dijitInline',
            'dijitReset',
            'dijitCheckBoxChecked',
            'dijitChecked',
            'dijitLeft'
        ],
        toReference: function (node) {


        },
        widgetToReference: function (widget) {

            console.log('determine reference widget by widget, use mode ' + this.mode, widget);

            switch (this.mode) {

                case types.WIDGET_REFERENCE_MODE.BY_ID:
                {
                    return widget.id;
                }
                case types.WIDGET_REFERENCE_MODE.BY_CLASS:
                {
                    return widget.declaredClass || '';
                }
                case types.WIDGET_REFERENCE_MODE.BY_CSS:
                {
                    var _node = widget.domNode ? widget.domNode : widget;
                    var _classes = _node.className;
                    var els = _classes.split(' ');
                    var result = '';
                    for (var i = 0; i < els.length; i++) {

                        if (utils.contains(this.skipWidgetCSSClasses, els[i]) > -1 ||
                            els[i].toLowerCase().indexOf('hover') > -1) {
                            continue;
                        }
                        result += ' ' + els[i];
                    }
                    return result.trim();
                }
                default:
                {

                }
            }

            return null;

        },
        onModeChanged: function (mode) {
            this.mode = mode;
            if (this.lastPickedNode) {
                this.updateReferenceNode(this.lastPickedNode);
            }

        },
        updateReferenceNode: function (node) {
            var widget = registry.getEnclosingWidget(node);
            var reference = null;
            if (!widget && node.render) {
                widget = node;
            }
            if (widget) {

                this.lastPickedWidget = widget;

                if (this.allowWidgets) {
                    reference = this.widgetToReference(widget);
                } else if (this.allowHTMLNodes) {
                    reference = this.widgetToReference(node);
                }
            }

            console.log('widget reference = ' + reference);

            if (reference) {
                this.editBox.set('value', reference);

            }
        },
        isPickable: function (node) {

            if (this.allowWidgets) {
                var widget = registry.getEnclosingWidget(node);
                if (widget) {
                    if (this.skipWidgetClasses.indexOf(widget.declaredClass) > -1) {
                        return false;
                    }
                    if (node.id && node.id == widget.id) {
                        return true;
                    } else {
                    }
                } else {
                    return false;
                }

            } else if (this.allowHTMLNodes) {
                return true;
            }

            return false;

        },
        onNodePicked: function (node) {

            this.lastPickedNode = node;
            this.updateReferenceNode(node);

        },
        onPick: function () {

            console.error('pick');
            var data = this.userData;
            var thiz = this;
            if (data.window) {
                var w = data.window;
                if (w.appContext) {
                    var ctx = w.appContext;
                    ctx.allowWidgets = data.allowWidgets;
                    ctx.allowHTMLNodes = data.allowHTMLNodes;
                    ctx.onNodePicked = function (node) {
                        thiz.lastPickedNode = node;
                        thiz.updateReferenceNode(node);
                    };
                    ctx._pick();
                    return;
                }
            }
            this._pick();
        }
    });
});