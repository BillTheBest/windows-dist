(function () {

    //bloody boiler code
    var __isAMD = !!(typeof define === 'function' && define.amd),
        __isNode = (typeof exports === 'object'),
        __isWeb = !__isNode,
    //is that enough at some point?
        __isDojoRequire = !!(typeof require === 'function' && require.packs),
        __isRequireJS = !__isDojoRequire,
        __deliteHas = !!(typeof has === 'function' && has.addModule),
        __hasDcl = !!(typeof dcl === 'function'),//false if dcl has not been required yet
        __preferDcl = false;//!__isDojoRequire && __hasDcl;

    /**
     * @TODO
     *
     * - convert dojo base classes recursive, currently it only accepts simple dojo classes, not with multiple
     * base classes but you can use as many dcl base classes as you want.
     * - deal with un-tested cases: nodejs, cjs
     *
     * @example  tested cases:

     1. var fooBar = dDeclare('foo.bar',null,{}); // works with dcl or dojo

     2. var myFooBarKid = dDeclare('my.foo.bar',[fooBar],{}); // works with dcl or dojo

     3. using a Dojo declared class together with a dcl declared class:

     var _myDojoClass = declare('dojoClass',null,{});
     var _classD2 = dDeclare('my mixed class',[myFooBarKid,_myDojoClass],{});

     *
     */
    var _define = define;

    _define([
        //needed?
        'exports',
        'module',
        'xide/utils',
        'dojo/_base/declare',
        (typeof __isDojoRequire !='undefined' && __isDojoRequire ) ? __preferDcl ? 'dcl/dcl' :  'dojo/_base/declare' : 'dcl/dcl'

    ], function (exports, module,utils,dDeclare) {

        /*
        console.log('xdojo/declare:\n\t  _isAMD:' +__isAMD +
            "\n\t isNode:" + __isNode +
            "\n\t isDojoRequire:" + __isDojoRequire +
            "\n\t isRequireJS:" + __isRequireJS +
            "\n\t __deliteHas:" + __deliteHas +
            "\n\t __hasDcl:" + __hasDcl +
            "\n\t __preferDcl:" + __preferDcl
        );
        */


        if(!__isDojoRequire && __preferDcl) {
            var _dcl = null;//
            try {

                _dcl = require('dcl/dcl');
                if (_dcl) {
                    dDeclare = _dcl;
                }
            } catch (e) {

            }
        }

        ////////////////////////////////////////////////////////////////////
        //
        // Extras
        //
        ///////////////////////////////////////////////////////////////////

        function addExtras(handler){

            /**
             *
             * @param name
             * @param bases {object}
             * @param extraClasses {object[]}
             * @param implmentation
             * @param defaults
             * @returns {*}
             */
            function classFactory(name, bases, extraClasses, implmentation,defaults) {


                var baseClasses = bases!=null ? bases : utils.cloneKeys(defaults || {}),
                    extras = extraClasses || [],
                    _name = name || 'xgrid.Base',
                    _implmentation = implmentation || {};

                if (bases) {
                    utils.mixin(baseClasses, bases);
                }

                var classes = [];
                for (var _class in baseClasses) {
                    var _classProto = baseClasses[_class];
                    if ( _classProto) {
                        classes.push(baseClasses[_class]);
                    }
                }

                classes = classes.concat(extras);

                return handler(_name, classes, _implmentation);
            }

            handler.classFactory=classFactory;

        }


        if (dDeclare) {

            //node.js
            if (typeof exports !== "undefined") {
                exports.declare = dDeclare;
            }

            if (__isNode) {
                return module.exports;
            } else if (__isWeb && __isAMD) {

                //todo: where to place this?
                var _patchDCL = true,     //patch DCL for Dojo declare signature
                    _convertToDCL = true, //if a dojo/declared class is passed, convert it to DCL
                    handler = dDeclare;

                //now make Dcl working like declare, supporting declaredClass.
                //This could be done via define('module') and then module.id but i don't trust it.
                if (handler && __preferDcl && !dDeclare.safeMixin) {

                    if(_patchDCL) {

                        //the Dojo to Dcl converter, see TODO's
                        function makeClass(name,_class,_declare){
                            return _declare(null,_class,_class.prototype);
                        }

                        //in-place base class check & convert from dojo declared base class to dcl base class
                        //@TODO: recursive and cache !! There is probably more..
                        function checkClasses(classes,_declare){

                            for (var i = 0, j = classes.length; i < j ; i++) {

                                var o = classes[i];
                                //convert dojo base class
                                if(o.createSubclass){
                                    var declaredClass =  o.declaredClass || o.prototype.declaredClass;
                                    var out = makeClass(declaredClass,o,handler);
                                    classes[i] = o = out;
                                }
                            }
                            return classes;
                        }

                        var _declareFunction = function () {

                            var _declaredClass = null,
                                args = arguments,
                                context = arguments.callee;//no need actually



                            //eat declared string arg
                            if (typeof arguments[0] == 'string') {
                                _declaredClass = arguments[0];
                                args = Array.prototype.slice.call(arguments, 1);
                            }

                            //patch props for declaredClass, @TODO: not sure dcl() has really only 2 args
                            if(_declaredClass) {

                                //this will add declared class into the new class's prototype
                                args[args.length-1]['declaredClass'] = _declaredClass;

                            }

                            switch (args.length) {
                                case 1:
                                    //fast and legit dcl case, no base classes given
                                    return handler.call(context,null,args[0]);
                                case 2:{

                                    //base classes given and prototype given, convert to Dojo if desired

                                    //straight forward
                                    if(!_convertToDCL) {
                                        return handler.call(context, args[0], args[1]);
                                    }

                                    //convert base classes if given
                                    /*
                                    if(handler.Advice && args[0] == null) {
                                        return handler.call(args[0] != null ? checkClasses(args[0]) : args[0], args[1]);
                                    }*/
                                    var bases = args[0] != null ? checkClasses(args[0]) : args[0];
                                    var proto = args[1];
                                    /*
                                    if(handler.Advice && bases) {
                                        return handler.call(bases, proto);
                                    }*/
                                    return handler.call(context, bases, proto);
                                }
                                // fall through
                                default:
                                    return handler.call(context,args);
                            }
                        };
                        addExtras(_declareFunction);
                        return _declareFunction;
                    }
                }
                addExtras(dDeclare);
                return dDeclare;
            }
            addExtras(dDeclare);
            return dDeclare;

        } else {

            //@TODO, add fallback version?
            //we shouldn't be here anyways, dcl or dojo/declare has not been loaded yet!
            return resultingDeclare;
        }
    });
}).call(this);