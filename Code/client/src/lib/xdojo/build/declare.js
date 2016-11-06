define([
    'dcl/dcl',
    'module',
    'xide/utils',
    'dojo/_base/declare'
], function (_dcl,module,utils,dDeclare) {


    ////////////////////////////////////////////////////////////////////
    //
    // Extras
    //
    ///////////////////////////////////////////////////////////////////

    function addExtras(handler) {

        /**
         *
         * @param name
         * @param bases {object}
         * @param extraClasses {object[]}
         * @param implmentation
         * @param defaults
         * @returns {*}
         */
        function classFactory(name, bases, extraClasses, implmentation, defaults) {


            var baseClasses = bases != null ? bases : utils.cloneKeys(defaults || {}),
                extras = extraClasses || [],
                _name = name || 'xgrid.Base',
                _implmentation = implmentation || {};

            if (bases) {
                utils.mixin(baseClasses, bases);
            }

            var classes = [];
            for (var _class in baseClasses) {
                var _classProto = baseClasses[_class];
                if (_classProto) {
                    classes.push(baseClasses[_class]);
                }
            }

            classes = classes.concat(extras);

            return handler(_name, classes, _implmentation);
        }

        handler.classFactory = classFactory;

    }


    //now make Dcl working like declare, supporting declaredClass.
    //This could be done via define('module') and then module.id but i don't trust it.
    addExtras(dDeclare);
    return dDeclare;
});