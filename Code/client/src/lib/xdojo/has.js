(function () {

    var __isAMD = !!(typeof define === 'function' && define.amd),
        __isNode = (typeof exports === 'object'),
        __isWeb = !__isNode,
    //is that enough at some point?
        __isDojoRequire = !!(typeof require === 'function' && require.packs),
        __isRequireJS = !__isDojoRequire,
        __deliteHas = !!(typeof has === 'function' && has.addModule);

    define([
        //needed?
        'require',
        'exports',
        //should be extended for the missing .config() method when in delite
        'module',
        __isDojoRequire ? 'dojo/has' : 'requirejs-dplugins/has'
    ], function (require, exports, module, dHas) {

        if (dHas) {
            if (typeof exports !== "undefined") {
                exports.has = dHas;
            }
            if (__isNode) {
                return module.exports;
            } else if (__isWeb && __isAMD) {
                return dHas;
            }
        } else {
            //@TODO, add simple version?
            //we shouldn't be here
            debugger;
        }
    });
}).call(this);