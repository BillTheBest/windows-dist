define([
    "dojo/_base/array",
    "xdojo/declare",
    "dijit/layout/utils",
    "xide/widgets/_Widget",
    "xide/mixins/EventedMixin"
], function (array, declare, layoutUtils,_Widget,EventedMixin) {

    return declare("xide.layout.BorderContainer", [EventedMixin,_Widget], {

        splitter: false,
        persist: false,
        _splitterClass: 'xide.views.ToggleSplitter',
        cookieName: null,
        liveSplitters: true,
        onChangeToggleSplitterState: function (splitter, state) {

        },
        setupToggleSplitterListeners: function () {
            if (this.layoutLeft && this.layoutLeft._splitterWidget) {
                this.layoutLeft._splitterWidget.delegate = this;
            }
            if (this.layoutRight && this.layoutRight._splitterWidget) {
                this.layoutRight._splitterWidget.delegate = this;
            }
            if (this.layoutBottom && this.layoutBottom._splitterWidget) {
                this.layoutBottom._splitterWidget.delegate = this;
            }
        },
        _layoutChildren: function (/*String?*/ changedChildId, /*Number?*/ changedChildSize) {
            // summary:
            //		This is the main routine for setting size/position of each child.
            // description:
            //		With no arguments, measures the height of top/bottom panes, the width
            //		of left/right panes, and then sizes all panes accordingly.
            //
            //		With changedRegion specified (as "left", "top", "bottom", or "right"),
            //		it changes that region's width/height to changedRegionSize and
            //		then resizes other regions that were affected.
            // changedChildId:
            //		Id of the child which should be resized because splitter was dragged.
            // changedChildSize:
            //		The new width/height (in pixels) to make specified child

            if (!this._borderBox || !this._borderBox.h) {
                // We are currently hidden, or we haven't been sized by our parent yet.
                // Abort.   Someone will resize us later.
                return;
            }

            // Combining the externally specified children with splitters and gutters
            var childrenAndSplitters = [];
            array.forEach(this._getOrderedChildren(), function (pane) {
                childrenAndSplitters.push(pane);
                if (pane._splitterWidget) {
                    childrenAndSplitters.push(pane._splitterWidget);
                }
            });

            //dojo upgrade: they switched from
            var _pe = this.editor || this.pe;
            if (_pe) {
                if (_pe.l == 5) {
                    _pe.l = 0;
                }
                if (_pe.t == 5) {
                    _pe.t = 0;
                }
                if (_pe.w == 10) {
                    _pe.w = 0;
                }
            }
            // Compute the box in which to lay out my children
            var dim = {
                l: _pe.l,
                t: _pe.t,
                w: this._borderBox.w - _pe.w,
                h: this._borderBox.h - _pe.h
            };


            var editor = _pe;
            var region = editor.region;
            // Layout the children, possibly changing size due to a splitter drag
            layoutUtils.layoutChildren(this.domNode, dim, childrenAndSplitters,
                changedChildId, changedChildSize);
        }
    });
});