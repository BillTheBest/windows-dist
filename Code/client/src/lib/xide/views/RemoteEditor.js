define([
    "dojo/_base/declare",
    "dojo/dom-style",
    "dojo/dom-geometry",
    "xide/widgets/TemplatedWidgetBase",
    'xide/types',
    'xide/factory',
    'xide/utils'
],
function (declare, domStyle, domGeometry, TemplatedWidgetBase, types, factory, utils) {
    return declare("xide.views.RemoteEditor", [TemplatedWidgetBase], {
        title: null,
        wFloatingPane: null,
        scriptFrame: null,
        scriptRoot: null,
        frameUrl: null,
        scriptFrameParent: null,
        editorWaitingTime: 4000,
        isLoading: false,
        parentContainer: null,
        saveUrl: null,
        itemPath: null,
        extraPadding: 5,
        templateString: "<div class='scriptEditor' title='${!title}' data-dojo-attach-point='wFloatingPane' style=''>" +
        "<div id='scriptFrameParent' class='scriptFrameParent' data-dojo-attach-point='scriptFrameParent'></div></div>",
        focus: function () {},
        sendMessage: function (message) {
            this.scriptFrame.postMessage(JSON.stringify(message));
        },
        onMessage: function (message) {
            var result = JSON.parse(message);
            if (result && result.command && result.command === 'save') {
            }
        },
        looseFocus: function () {
            this.domNode.blur();
            if (this.scriptFrameParent) {
                this.scriptFrameParent.blur();
                this.domNode.tabindex = -1;
                this.scriptFrameParent.tabindex = -1;
                this.scriptFrameParent.blur();
            }
        },
        onEditorReady: function (url) {

            var scriptStandBy = dijit.registry.byId('scriptStandBy');
            if (scriptStandBy) {
                scriptStandBy.hide();
            }

            this.frameUrl = url;
            if (!url) {
                return null;
            }
            var thiz = this;
            var xdmTarget = this.scriptFrameParent;

            this._focusEditor();
            this.isLoading = false;

            var bindStr = '?';
            if (url.indexOf('?') != -1) {
                bindStr = '&';
            }
            url += bindStr + 'xdmTarget=' + encodeURIComponent('' + window.location.href);

            var dstNode = this.parentContainer.containerNode || this.parentContainer.domNode;
            var box = domGeometry.getMarginBox(dstNode);

            box.w -= this.extraPadding;
            box.h -= this.extraPadding;

            this.scriptFrame = new easyXDM.Socket({
                remote: url,
                container: this.scriptFrameParent,
                props: {
                    style: {
                        width: box.w + 'px',
                        height: box.h + 'px'
                    }
                },
                onload: function () {

                },
                onReady: function () {
                    thiz.looseFocus();
                    thiz.sendMessage({
                        command: 'edit',
                        height: box.h,
                        width: box.w,
                        url: thiz.editUrl,
                        saveUrl: thiz.saveUrl,
                        title: thiz.title,
                        format: utils.getFileExtension(thiz.item.getPath())
                    });
                },
                onMessage: function (message, origin) {
                    thiz.onMessage(message);
                }
            });

            setTimeout(function () {
                factory.publish(types.EVENTS.RESIZE, {}, thiz);
            }, 100);
        },
        _focusEditor: function () {

            setTimeout(function () {
                var l = dojo.query('[id*=\"easyXDM_\"]');
                if (l != null && l.length > 0) {
                    for (var i = 0; i < l.length; i++) {
                        if (l[i].contentWindow) {
                            l[i].contentWindow.focus();
                        }
                    }
                }
            }, 200);
        },
        onHide: function () {
        },
        destroy: function () {
        },
        onResize: function () {

            if (this.parentContainer && this.scriptFrameParent && this.scriptFrameParent.children.length > 0) {

                var box = domGeometry.getMarginBox(this.parentContainer.containerNode);
                box.w -= this.extraPadding;
                box.h -= this.extraPadding;
                var dst = this.scriptFrameParent.children[0];
                domStyle.set(dst, {
                    width: box.w + 'px',
                    height: box.h + 'px'
                });
            }
        },
        reload: function (scope) {
            dojo.empty(this.scriptFrameParent);
            this.scriptFrame = null;

            if (this.frameUrl) {
                this.onEditorReady(this.frameUrl);
            }
            if (this.scriptFrameParent) {
                this.domNode.tabindex = -1;
                this.scriptFrameParent.tabindex = -1;
                this.scriptFrameParent.blur();
            }
        },
        startup: function () {
            this.inherited(arguments);

            if (this.frameUrl) {
                try {
                    this.onEditorReady(this.frameUrl);
                } catch (e) {

                }
            }
            var thiz = this;
            var resizeCB = function () {
                thiz.onResize();
            };
            dojo.connect(window, (dojo.global.onorientationchange !== undefined) ? "onorientationchange" : "onresize", this, function () {
                setTimeout(function () {
                    resizeCB();
                }, 500);
            });

        }
    });
});