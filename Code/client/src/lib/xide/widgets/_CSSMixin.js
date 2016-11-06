define([
    'dojo/_base/declare'
], function (declare) {
    return declare("xide.widgets._CSSMixin", null, {

        /*
        getCSSNode: function (node) {
            return node || this.containerNode || this.domNode;
        },
        doCSSClass: function (node) {
            if (this.cssClass) {
                if (this.cssClass.indexOf(' ') == -1) {
                    domClass.add(this.getCSSNode(node), this.cssClass);
                } else {
                    var _cssNames = this.cssClass.split(' ');
                    for (var i = 0; i < _cssNames.length; i++) {
                        domClass.add(this.getCSSNode(node), _cssNames[i]);
                    }
                }
            }
        },
        buildRendering: function () {
            this.inherited(arguments);
            this.doCSSClass();
        },
        doCSSOperations: function (cssOperations, startSearchNode) {
            if (cssOperations) {
                for (var i = 0; i < cssOperations.length; i++) {

                    var cssItem = cssOperations[i];
                    var cssOp = cssItem['op'] || 'add';
                    var cssClasses = cssItem.cssClass;
                    var nodes = utils.find(cssItem.selector, startSearchNode || this.domNode, false);
                    if (nodes && nodes.length > 0) {
                        for (var j = 0; j < nodes.length; j++) {
                            //handle single css class or an array of css classes
                            if (cssClasses.indexOf(' ') == -1) {
                                domClass[cssOp](nodes[j], cssClasses);
                            } else {
                                var _cssNames = cssClasses.split(' ');
                                for (var k = 0; k < _cssNames.length; k++) {
                                    domClass[cssOp](nodes[j], _cssNames[k]);
                                }
                            }
                        }
                    }
                }
            }
        }
        */
    });
});