define([
        'dojo/_base/declare'
    ],
    function (declare) {
        return declare("xide.widgets._StyleMixin", null,
            {
                /*
                doStyleMixin: function (styles) {
                    if (styles) {
                        for (var i = 0; i < styles.length; i++) {
                            var _style = styles[i];
                            var nodes = utils.find(_style.selector, this.domNode, false);
                            if (nodes && nodes.length > 0) {
                                for (var j = 0; j < nodes.length; j++) {

                                    var _styleAttr = domAttr.get(nodes[j], 'style') || '';
                                    _styleAttr += ';';
                                    _styleAttr += _style.value;
                                    domAttr.set(nodes[j], 'style', _styleAttr);
                                }
                            }
                        }
                    }
                },
                setStyleEx: function (nodes, styleMixin, op) {
                    if (nodes && styleMixin) {
                        for (var i = 0; i < nodes.length; i++) {
                            domStyle[op || 'set'](nodes[i], styleMixin);
                        }
                    }
                },
                setStyle: function (nodeQuery, cssClasses, startNode) {

                    var result = [];
                    if (lang.isArray(startNode)) {
                        for (var i = 0; i < startNode.length; i++) {
                            this.setStyle(nodeQuery, cssClasses, startNode[i]);
                            result.push(startNode[i]);
                        }
                        return result;
                    } else {
                        var nodes = utils.find(nodeQuery, startNode || this.domNode, false);
                        if (nodes && nodes.length > 0) {
                            this.setStyleEx(nodes, cssClasses);
                        }
                        return nodes;
                    }
                }
                */
            });
    });