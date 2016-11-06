define([
    "dojo/_base/declare",
    "xide/mixins/EventedMixin",
    "xide/factory",
    "dojo/dom-class", // domClass.add domClass.contains
    "dojo/dom-geometry", // domGeometry.position
    "dojo/dom-style", // domStyle.set
    "dojo/window"
], function (declare, EventedMixin, factory,domClass, domGeometry, domStyle,winUtils) {

    //was based from dijit/Dialog
    return declare("xide.views.Dialog", [EventedMixin],{
            cssClass: "Dialog",
            maxRatio: 0.9,
            _messages: null,
            minimizable: false,
            _minimizeButton: null,
            resizeable: true,
            _resizeHandle:null,
            getCSSNode: function () {
                return this.containerNode;
            },
            _buildRendering: function () {
                this.inherited(arguments);
            },
            minimize: function () {},

            _position: function () {
                // summary:
                //		Position the dialog in the viewport.  If no relative offset
                //		in the viewport has been determined (by dragging, for instance),
                //		center the dialog.  Otherwise, use the Dialog's stored relative offset,
                //		adjusted by the viewport's scroll.
                if (!domClass.contains(this.ownerDocumentBody, "dojoMove")) {    // don't do anything if called during auto-scroll
                    var node = this.domNode,
                        viewport = winUtils.getBox(this.ownerDocument),
                        p = this._relativePosition,
                        bb = domGeometry.position(node),
                        l = Math.floor(viewport.l + (p ? Math.min(p.x, viewport.w - bb.w) : (viewport.w - bb.w) / 2)),
                        t = Math.floor(viewport.t + (p ? Math.min(p.y, viewport.h - bb.h) : (viewport.h - bb.h) / 2));

                    domStyle.set(node, {
                        left: l + "px",
                        top: t + "px"
                    });
                }
            },
            _fitContent:function(){
                var thiz = this;
                var contentBox = domGeometry.getContentBox(thiz.containerNode);
                var titleBox = domGeometry.getContentBox(thiz.titleBar);
                var box = domGeometry.getContentBox(thiz.domNode);
                var newHeight = box.h - titleBox.h;
                domStyle.set(thiz.containerNode, {
                    height: newHeight + 'px'
                });
            },
            show: function () {
                var def = this.inherited(arguments),
                    thiz=this;
                this.set('title',this.translate(this.title));
                return def.then(function(){
                    if(thiz.fitContent){
                        thiz._fitContent();
                    }
                    setTimeout(function(){
                        thiz.resize();
                    },10);
                });
            }
        });
});