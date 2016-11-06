define([
    'dojo/_base/declare',
    'xide/types',
    'xide/registry'
], function (declare, types, registry) {
    return declare("xide.layout.LayoutContainer", null, {
        delegate: null,
        parentContainer: null,
        selectedChildWidget: null,
        getChild: function (name) {

            var pane = null;
            if (this.getChildren) {
                var containers = this.getChildren();
                _.each(containers, function (cont) {
                    if (cont.title === name) {
                        pane = cont;
                    }
                });
            }
            return pane;
        },
        selectChild: function (pane) {

            if (_.isString(pane)) {
                pane = this.getChild(pane);
            }

            if (!pane) {
                return;
            }
            if (pane.canSelect === false) {
                if (pane.onSelect) {
                    pane.onSelect();
                }
                return;
            }

            var _id,
                btn,
                thiz = this;

            if (this.selectedChildWidget) {
                _id = this.id + '_tablist_' + this.selectedChildWidget.id;
                btn = registry.byId(_id) || this.selectedChildWidget._buttonWidget;

            }
            _id = this.id + '_tablist_' + pane.id;
            btn = registry.byId(_id) || pane._buttonWidget;
            var _res = this.inherited(arguments);

            function showPane() {
                if (pane && pane.onShow) {
                    pane.onShow();
                }
                if (pane.onSelect) {
                    pane.onSelect();
                }
            }

            if (_res.then && this.domNode) {
                _res.then(function () {
                    setTimeout(function () {
                        //thiz.resize();
                        showPane();
                    }, 500);
                })
            } else {
                showPane();
            }
            return _res;
        },
        onContainerSplitted: function (srcContainer, newContainer) {
            var thiz = this;
            setTimeout(function () {

                thiz.publish(types.EVENTS.ON_CONTAINER_SPLIT, {
                    srcContainer: srcContainer,
                    newContainer: newContainer
                }, thiz);

                srcContainer.resize();
                newContainer.resize();

                thiz.publish(types.EVENTS.RESIZE, {});
                if (srcContainer.selectedChildWidget && srcContainer.selectedChildWidget.onResize) {
                    srcContainer.selectedChildWidget.onResize()
                }
                if (newContainer.selectedChildWidget && newContainer.selectedChildWidget.onResize) {
                    newContainer.selectedChildWidget.onResize()
                }
            }, 100);

        },
        removeChild: function (page, checkEmpty) {

            this.publish(types.EVENTS.ON_REMOVE_CONTAINER, {
                view: page
            });

            if (page && !page.domNode) {
                console.warn('lc:remove child: domNode null, abort');
                return;
            }
            this.inherited(arguments);
            this.publish([types.EVENTS.ON_CONTAINER_REMOVED], {
                view: page
            });
        },
        addChild2: function (child, index, select) {
            this.publish([types.EVENTS.ON_CONTAINER_ADDED, types.EVENTS.RESIZE], {
                view: child
            });
        },
        onShowChild: function (child) {

            try {
                if (child.emits[types.EVENTS.ON_VIEW_SHOW] !== false) {
                    this.publish([types.EVENTS.ON_VIEW_SHOW], {
                        container: this,
                        view: child,
                        owner: this.delegate
                    });
                }
            } catch (e) {
                console.error('error showing chhild');
            }

            if (child.onResize) {
                child.onResize();
            }
        },
        showChild: function (child) {
            var res = this.inherited(arguments);
            this.onShowChild(child);
            if (child.onResize) {
                child.onResize();
            }
            return res;
        }
    });
});