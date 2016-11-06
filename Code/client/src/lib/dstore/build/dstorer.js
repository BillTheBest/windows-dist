define('dstore/QueryMethod',[], function () {
	/*=====
	var __QueryMethodArgs = {
		// type: String
		//		The type of the query. This identifies the query's type in the query log
		//		and the name of the corresponding query engine method.
		// normalizeArguments: Function?
		//		A function that normalizes arguments for consumption by a query engine
		// applyQuery: Function?
		//		A function that takes the query's new subcollection and the query's log entry
		//		and applies it to the new subcollection. This is useful for collections that need
		//		to both declare and implement new query methods.
		// querierFactory: Function?
		//		A factory function that provides a default querier implementation to use when
		//		a collection does not define its own querier factory method for this query type.
	};
	=====*/
	return function QueryMethod(/*__QueryMethodArgs*/ kwArgs) {
		// summary:
		//		The constructor for a dstore collection query method
		// description:
		//		This is the constructor for a collection query method. It encapsulates the following:
		//		* Creating a new subcollection for the query results
		//		* Logging the query in the collection's `queryLog`
		//		* Normalizing query arguments
		//		* Applying the query engine
		// kwArgs:
		//		The properties that define the query method
		// returns: Function
		//		Returns a function that takes query arguments and returns a new collection with
		//		the query associated with it.

		var type = kwArgs.type,
			normalizeArguments = kwArgs.normalizeArguments,
			applyQuery = kwArgs.applyQuery,
			defaultQuerierFactory = kwArgs.querierFactory;

		return function () {
			// summary:
			//		A query method whose arguments are determined by the query type
			// returns: dstore/Collection
			//		A collection representing the query results

			var originalArguments = Array.prototype.slice.call(arguments),
				normalizedArguments = normalizeArguments
					? normalizeArguments.apply(this, originalArguments)
					: originalArguments,
				logEntry = {
					type: type,
					arguments: originalArguments,
					normalizedArguments: normalizedArguments
				},
				querierFactory = this._getQuerierFactory(type) || defaultQuerierFactory;

			if (querierFactory) {
				// Call the query factory in store context to support things like
				// mapping a filter query's string argument to a custom filter method on the collection
				logEntry.querier = querierFactory.apply(this, normalizedArguments);
			}

			var newCollection = this._createSubCollection({
				queryLog: this.queryLog.concat(logEntry)
			});

			return applyQuery ? applyQuery.call(this, newCollection, logEntry) : newCollection;
		};
	};
});

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
define("xdojo/declare", function(){});

define('dstore/Filter',['xdojo/declare'], function (declare) {
	// a Filter builder
	function filterCreator(type) {
		// constructs a new filter based on type, used to create each method
		return function newFilter() {
			var Filter = this.constructor;
			var filter = new Filter();
			filter.type = type;
			filter.args = arguments;
			if (this.type) {
				// we are chaining, so combine with an and operator
				return filterCreator('and').call(Filter.prototype, this, filter);
			}
			return filter;
		};
	}
	var Filter = declare(null, {
		constructor: function (filterArg) {
			var argType = typeof filterArg;
			switch (argType) {
				case 'object':
					var filter = this;
					// construct a filter based on the query object
					for (var key in filterArg){
						var value = filterArg[key];
						if (value instanceof this.constructor) {
							// fully construct the filter from the single arg
							filter = filter[value.type](key, value.args[0]);
						} else if (value && value.test) {
							// support regex
							filter = filter.match(key, value);
						} else {
							filter = filter.eq(key, value);
						}
					}
					this.type = filter.type;
					this.args = filter.args;
					break;
				case 'function': case 'string':
					// allow string and function args as well
					this.type = argType;
					this.args = [filterArg];
			}
		},
		// define our operators
		and: filterCreator('and'),
		or: filterCreator('or'),
		eq: filterCreator('eq'),
		ne: filterCreator('ne'),
		lt: filterCreator('lt'),
		lte: filterCreator('lte'),
		gt: filterCreator('gt'),
		gte: filterCreator('gte'),
		contains: filterCreator('contains'),
		'in': filterCreator('in'),
		match: filterCreator('match')
	});
	Filter.filterCreator = filterCreator;
	return Filter;
});
define('dstore/Store',[
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/aspect',
	'dojo/has',
	'dojo/when',
	'dojo/Deferred',
	'dojo/_base/declare',
	'./QueryMethod',
	'./Filter',
	'dojo/Evented'
], function (lang, arrayUtil, aspect, has, when, Deferred, declare, QueryMethod, Filter, Evented) {

	// module:
	//		dstore/Store
	/* jshint proto: true */
	// detect __proto__, and avoid using it on Firefox, as they warn about
	// deoptimizations. The watch method is a clear indicator of the Firefox
	// JS engine.
	has.add('object-proto', !!{}.__proto__ && !({}).watch);
	var hasProto = has('object-proto');

	function emitUpdateEvent(type) {
		return function (result, args) {
			var self = this;
			when(result, function (result) {
				var event = { target: result },
					options = args[1] || {};
				if ('beforeId' in options) {
					event.beforeId = options.beforeId;
				}
				self.emit(type, event);
			});

			return result;
		};
	}

	var base = Evented;
	/*=====
	base = [ Evented, Collection ];
	=====*/

	return /*==== Store= ====*/declare(base, {
		constructor: function (options) {
			// perform the mixin
			options && declare.safeMixin(this, options);

			if (this.Model && this.Model.createSubclass) {
				// we need a distinct model for each store, so we can
				// save the reference back to this store on it.
				// we always create a new model to be safe.
				this.Model = this.Model.createSubclass([]).extend({
					// give a reference back to the store for saving, etc.
					_store: this
				});
			}

			// the object the store can use for holding any local data or events
			this.storage = new Evented();
			var store = this;
			if (this.autoEmitEvents) {
				// emit events when modification operations are called
				aspect.after(this, 'add', emitUpdateEvent('add'));
				aspect.after(this, 'put', emitUpdateEvent('update'));
				aspect.after(this, 'remove', function (result, args) {
					when(result, function () {
						store.emit('delete', {id: args[0]});
					});
					return result;
				});
			}
		},

		// autoEmitEvents: Boolean
		//		Indicates if the events should automatically be fired for put, add, remove
		//		method calls. Stores may wish to explicitly fire events, to control when
		//		and which event is fired.
		autoEmitEvents: true,

		// idProperty: String
		//		Indicates the property to use as the identity property. The values of this
		//		property should be unique.
		idProperty: 'id',

		// queryAccessors: Boolean
		//		Indicates if client-side query engine filtering should (if the store property is true)
		//		access object properties through the get() function (enabling querying by
		//		computed properties), or if it should (by setting this to false) use direct/raw
		// 		property access (which may more closely follow database querying style).
		queryAccessors: true,

		getIdentity: function (object) {
			// summary:
			//		Returns an object's identity
			// object: Object
			//		The object to get the identity from
			// returns: String|Number

			return object.get ? object.get(this.idProperty) : object[this.idProperty];
		},

		_setIdentity: function (object, identityArg) {
			// summary:
			//		Sets an object's identity
			// description:
			//		This method sets an object's identity and is useful to override to support
			//		multi-key identities and object's whose properties are not stored directly on the object.
			// object: Object
			//		The target object
			// identityArg:
			//		The argument used to set the identity

			if (object.set) {
				object.set(this.idProperty, identityArg);
			} else {
				object[this.idProperty] = identityArg;
			}
		},

		forEach: function (callback, thisObject) {
			var collection = this;
			return when(this.fetch(), function (data) {
				for (var i = 0, item; (item = data[i]) !== undefined; i++) {
					callback.call(thisObject, item, i, collection);
				}
				return data;
			});
		},
		on: function (type, listener) {
			return this.storage.on(type, listener);
		},
		emit: function (type, event) {
			event = event || {};
			event.type = type;
			try {
				return this.storage.emit(type, event);
			} finally {
				// Return the initial value of event.cancelable because a listener error makes it impossible
				// to know whether the event was actually canceled
				return event.cancelable;
			}
		},

		// parse: Function
		//		One can provide a parsing function that will permit the parsing of the data. By
		//		default we assume the provide data is a simple JavaScript array that requires
		//		no parsing (subclass stores may provide their own default parse function)
		parse: null,

		// stringify: Function
		//		For stores that serialize data (to send to a server, for example) the stringify
		//		function can be specified to control how objects are serialized to strings
		stringify: null,

		// Model: Function
		//		This should be a entity (like a class/constructor) with a 'prototype' property that will be
		//		used as the prototype for all objects returned from this store. One can set
		//		this to the Model from dmodel/Model to return Model objects, or leave this
		//		to null if you don't want any methods to decorate the returned
		//		objects (this can improve performance by avoiding prototype setting),
		Model: null,

		_restore: function (object, mutateAllowed) {
			// summary:
			//		Restores a plain raw object, making an instance of the store's model.
			//		This is called when an object had been persisted into the underlying
			//		medium, and is now being restored. Typically restored objects will come
			//		through a phase of deserialization (through JSON.parse, DB retrieval, etc.)
			//		in which their __proto__ will be set to Object.prototype. To provide
			//		data model support, the returned object needs to be an instance of the model.
			//		This can be accomplished by setting __proto__ to the model's prototype
			//		or by creating a new instance of the model, and copying the properties to it.
			//		Also, model's can provide their own restore method that will allow for
			//		custom model-defined behavior. However, one should be aware that copying
			//		properties is a slower operation than prototype assignment.
			//		The restore process is designed to be distinct from the create process
			//		so their is a clear delineation between new objects and restored objects.
			// object: Object
			//		The raw object with the properties that need to be defined on the new
			//		model instance
			// mutateAllowed: boolean
			//		This indicates if restore is allowed to mutate the original object
			//		(by setting its __proto__). If this isn't true, than the restore should
			//		copy the object to a new object with the correct type.
			// returns: Object
			//		An instance of the store model, with all the properties that were defined
			//		on object. This may or may not be the same object that was passed in.
			var Model = this.Model;
			if (Model && object) {
				var prototype = Model.prototype;
				var restore = prototype._restore;
				if (restore) {
					// the prototype provides its own restore method
					object = restore.call(object, Model, mutateAllowed);
				} else if (hasProto && mutateAllowed) {
					// the fast easy way
					// http://jsperf.com/setting-the-prototype
					object.__proto__ = prototype;
				} else {
					// create a new object with the correct prototype
					object = lang.delegate(prototype, object);
				}
			}
			return object;
		},

		create: function (properties) {
			// summary:
			//		This creates a new instance from the store's model.
			//	properties:
			//		The properties that are passed to the model constructor to
			//		be copied onto the new instance. Note, that should only be called
			//		when new objects are being created, not when existing objects
			//		are being restored from storage.
			return new this.Model(properties);
		},

		_createSubCollection: function (kwArgs) {
			var newCollection = lang.delegate(this.constructor.prototype);

			for (var i in this) {
				if (this._includePropertyInSubCollection(i, newCollection)) {
					newCollection[i] = this[i];
				}
			}

			return declare.safeMixin(newCollection, kwArgs);
		},

		_includePropertyInSubCollection: function (name, subCollection) {
			return !(name in subCollection) || subCollection[name] !== this[name];
		},

		// queryLog: __QueryLogEntry[]
		//		The query operations represented by this collection
		queryLog: [],	// NOTE: It's ok to define this on the prototype because the array instance is never modified

		filter: new QueryMethod({
			type: 'filter',
			normalizeArguments: function (filter) {
				var Filter = this.Filter;
				if (filter instanceof Filter) {
					return [filter];
				}
				return [new Filter(filter)];
			}
		}),

		Filter: Filter,

		sort: new QueryMethod({
			type: 'sort',
			normalizeArguments: function (property, descending) {
				var sorted;
				if (typeof property === 'function') {
					sorted = [ property ];
				} else {
					if (property instanceof Array) {
						sorted = property.slice();
					} else if (typeof property === 'object') {
						sorted = [].slice.call(arguments);
					} else {
						sorted = [{ property: property, descending: descending }];
					}

					sorted = arrayUtil.map(sorted, function (sort) {
						// copy the sort object to avoid mutating the original arguments
						sort = lang.mixin({}, sort);
						sort.descending = !!sort.descending;
						return sort;
					});
					// wrap in array because sort objects are a single array argument
					sorted = [ sorted ];
				}
				return sorted;
			}
		}),

		select: new QueryMethod({
			type: 'select'
		}),

		_getQuerierFactory: function (type) {
			var uppercaseType = type[0].toUpperCase() + type.substr(1);
			return this['_create' + uppercaseType + 'Querier'];
		}

/*====,
		get: function (id) {
			// summary:
			//		Retrieves an object by its identity
			// id: Number
			//		The identity to use to lookup the object
			// returns: Object
			//		The object in the store that matches the given id.
		},
		put: function (object, directives) {
			// summary:
			//		Stores an object
			// object: Object
			//		The object to store.
			// directives: dstore/Store.PutDirectives?
			//		Additional directives for storing objects.
			// returns: Object
			//		The object that was stored, with any changes that were made by
			//		the storage system (like generated id)
		},
		add: function (object, directives) {
			// summary:
			//		Creates an object, throws an error if the object already exists
			// object: Object
			//		The object to store.
			// directives: dstore/Store.PutDirectives?
			//		Additional directives for creating objects.
			// returns: Object
			//		The object that was stored, with any changes that were made by
			//		the storage system (like generated id)
		},
		remove: function (id) {
			// summary:
			//		Deletes an object by its identity
			// id: Number
			//		The identity to use to delete the object
		},
		transaction: function () {
			// summary:
			//		Starts a new transaction.
			//		Note that a store user might not call transaction() prior to using put,
			//		delete, etc. in which case these operations effectively could be thought of
			//		as "auto-commit" style actions.
			// returns: dstore/Store.Transaction
			//		This represents the new current transaction.
		},
		getChildren: function (parent) {
			// summary:
			//		Retrieves the children of an object.
			// parent: Object
			//		The object to find the children of.
			// returns: dstore/Store.Collection
			//		A result set of the children of the parent object.
		}
====*/
	});
});


/*====
	var Collection = declare(null, {
		// summary:
		//		This is an abstract API for a collection of objects, which can be filtered,
		//		sorted, and sliced to create new collections. This is considered to be base
		//		interface for all stores and  query results in dstore. Note that the objects in the
		//		collection may not be immediately retrieved from the underlying data
		//		storage until they are actually accessed through forEach() or fetch().

		filter: function (query) {
			// summary:
			//		Filters the collection, returning a new subset collection
			// query: String|Object|Function
			//		The query to use for retrieving objects from the store.
			// returns: Collection
		},
		sort: function (property, descending) {
			// summary:
			//		Sorts the current collection into a new collection, reordering the objects by the provided sort order.
			// property: String|Function
			//		The property to sort on. Alternately a function can be provided to sort with
			// descending?: Boolean
			//		Indicate if the sort order should be descending (defaults to ascending)
			// returns: Collection
		},
		fetchRange: function (kwArgs) {
			// summary:
			//		Retrieves a range of objects from the collection, returning a promise to an array.
			// kwArgs.start: Number
			//		The starting index of objects to return (0-indexed)
			// kwArgs.end: Number
			//		The exclusive end of objects to return
			// returns: Collection
		},
		forEach: function (callback, thisObject) {
			// summary:
			//		Iterates over the query results, based on
			//		https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/forEach.
			//		Note that this may executed asynchronously (in which case it will return a promise),
			//		and the callback may be called after this function returns.
			// callback:
			//		Function that is called for each object in the query results
			// thisObject:
			//		The object to use as |this| in the callback.
			// returns:
			//		undefined|Promise
		},
		fetch: function () {
			// summary:
			//		This can be called to materialize and request the data behind this collection.
			//		Often collections may be lazy, and won't retrieve their underlying data until
			//		forEach or fetch is called. This returns an array, or for asynchronous stores,
			//		this will return a promise, resolving to an array of objects, once the
			//		operation is complete.
			//	returns Array|Promise
		},
		on: function (type, listener) {
			// summary:
			//		This registers a callback for notification of when data is modified in the query results.
			// type: String
			//		There are four types of events defined in this API:
			//		- add - A new object was added
			//		- update - An object was updated
			//		- delete - An object was deleted
			// listener: Function
			//		The listener function is called when objects in the query results are modified
			//		to affect the query result. The listener function is called with a single event object argument:
			//		| listener(event);
			//
			//		- The event object as the following properties:
			//		- type - The event type (of the four above)
			//		- target - This indicates the object that was create or modified.
			//		- id - If an object was removed, this indicates the object that was removed.
			//		The next two properties will only be available if array tracking is employed,
			//		which is usually provided by dstore/Trackable
			//		- previousIndex - The previousIndex parameter indicates the index in the result array where
			//		the object used to be. If the value is -1, then the object is an addition to
			//		this result set (due to a new object being created, or changed such that it
			//		is a part of the result set).
			//		- index - The inex parameter indicates the index in the result array where
			//		the object should be now. If the value is -1, then the object is a removal
			//		from this result set (due to an object being deleted, or changed such that it
			//		is not a part of the result set).

		}
	});

	Collection.SortInformation = declare(null, {
		// summary:
		//		An object describing what property to sort on, and the direction of the sort.
		// property: String
		//		The name of the property to sort on.
		// descending: Boolean
		//		The direction of the sort.  Default is false.
	});
	Store.Collection = Collection;

	Store.PutDirectives = declare(null, {
		// summary:
		//		Directives passed to put() and add() handlers for guiding the update and
		//		creation of stored objects.
		// id: String|Number?
		//		Indicates the identity of the object if a new object is created
		// beforeId: String?
		//		If the collection of objects in the store has a natural ordering,
		//		this indicates that the created or updated object should be placed before the
		//		object whose identity is specified as the value of this property. A value of null indicates that the
		//		object should be last.
		// parent: Object?,
		//		If the store is hierarchical (with single parenting) this property indicates the
		//		new parent of the created or updated object.
		// overwrite: Boolean?
		//		If this is provided as a boolean it indicates that the object should or should not
		//		overwrite an existing object. A value of true indicates that a new object
		//		should not be created, the operation should update an existing object. A
		//		value of false indicates that an existing object should not be updated, a new
		//		object should be created (which is the same as an add() operation). When
		//		this property is not provided, either an update or creation is acceptable.
	});

	Store.Transaction = declare(null, {
		// summary:
		//		This is an object returned from transaction() calls that represents the current
		//		transaction.

		commit: function () {
			// summary:
			//		Commits the transaction. This may throw an error if it fails. Of if the operation
			//		is asynchronous, it may return a promise that represents the eventual success
			//		or failure of the commit.
		},
		abort: function (callback, thisObject) {
			// summary:
			//		Aborts the transaction. This may throw an error if it fails. Of if the operation
			//		is asynchronous, it may return a promise that represents the eventual success
			//		or failure of the abort.
		}
	});

	var __QueryLogEntry = {
		type: String
			The query type
		arguments: Array
			The original query arguments
		normalizedArguments: Array
			The normalized query arguments
		querier: Function?
			A client-side implementation of the query that takes an item array and returns an item array
	};
====*/
;
define('dstore/QueryResults',['dojo/_base/lang', 'dojo/when'], function (lang, when) {
	function forEach(callback, instance) {
		return when(this, function(data) {
			for (var i = 0, l = data.length; i < l; i++){
				callback.call(instance, data[i], i, data);
			}
		});
	}
	return function (data, options) {
		var hasTotalLength = options && 'totalLength' in options;
		if(data.then) {
			data = lang.delegate(data);
			// a promise for the eventual realization of the totalLength, in
			// case it comes from the resolved data
			var totalLengthPromise = data.then(function (data) {
				// calculate total length, now that we have access to the resolved data
				var totalLength = hasTotalLength ? options.totalLength :
						data.totalLength || data.length;
				// make it available on the resolved data
				data.totalLength = totalLength;
				// don't return the totalLength promise unless we need to, to avoid
				// triggering a lazy promise
				return !hasTotalLength && totalLength;
			});
			// make the totalLength available on the promise (whether through the options or the enventual
			// access to the resolved data)
			data.totalLength = hasTotalLength ? options.totalLength : totalLengthPromise;
			// make the response available as well
			data.response = options && options.response;
		} else {
			data.totalLength = hasTotalLength ? options.totalLength : data.length;
		}

		data.forEach = forEach;

		return data;
	};
});

define('dstore/Promised',[
	'dojo/_base/declare',
	'dojo/Deferred',
	'./QueryResults',
	'dojo/when'
], function (declare, Deferred, QueryResults, when) {
	// module:
	//		this is a mixin that can be used to provide async methods,
	// 		by implementing their sync counterparts
	function promised(method, query) {
		return function() {
			var deferred = new Deferred();
			try {
				deferred.resolve(this[method].apply(this, arguments));
			} catch (error) {
				deferred.reject(error);
			}
			if (query) {
				// need to create a QueryResults and ensure the totalLength is
				// a promise.
				var queryResults = new QueryResults(deferred.promise);
				queryResults.totalLength = when(queryResults.totalLength);
				return queryResults;
			}
			return deferred.promise;
		};
	}
	return declare(null, {
		get: promised('getSync'),
		put: promised('putSync'),
		add: promised('addSync'),
		remove: promised('removeSync'),
		fetch: promised('fetchSync', true),
		fetchRange: promised('fetchRangeSync', true)
	});
});

define('dstore/SimpleQuery',[
	'dojo/_base/declare',
	'dojo/_base/array'
], function (declare, arrayUtil) {

	// module:
	//		dstore/SimpleQuery

	function makeGetter(property, queryAccessors) {
		if (property.indexOf('.') > -1) {
			var propertyPath = property.split('.');
			var pathLength = propertyPath.length;
			return function (object) {
				for (var i = 0; i < pathLength; i++) {
					object = object && (queryAccessors && object.get ? object.get(propertyPath[i]) : object[propertyPath[i]]);
				}
				return object;
			};
		}
		// else
		return function (object) {
			return object.get ? object.get(property) : object[property];
		};
	}

	var comparators = {
		eq: function (value, required) {
			return value === required;
		},
		'in': function(value, required) {
			// allow for a collection of data
			return arrayUtil.indexOf(required.data || required, value) > -1;
		},
		ne: function (value, required) {
			return value !== required;
		},
		lt: function (value, required) {
			return value < required;
		},
		lte: function (value, required) {
			return value <= required;
		},
		gt: function (value, required) {
			return value > required;
		},
		gte: function (value, required) {
			return value >= required;
		},
		match: function (value, required, object) {
			return required.test(value, object);
		},
		contains: function (value, required, object, key) {
			var collection = this;
			return arrayUtil.every(required.data || required, function (requiredValue) {
				if (typeof requiredValue === 'object' && requiredValue.type) {
					var comparator = collection._getFilterComparator(requiredValue.type);
					return arrayUtil.some(value, function (item) {
						return comparator.call(collection, item, requiredValue.args[1], object, key);
					});
				}
				return arrayUtil.indexOf(value, requiredValue) > -1;
			});
		}
	};

	return declare(null, {
		// summary:
		//		Mixin providing querier factories for core query types

		_createFilterQuerier: function (filter) {
			// create our matching filter function
			var queryAccessors = this.queryAccessors;
			var collection = this;
			var querier = getQuerier(filter);

			function getQuerier(filter) {
				var type = filter.type;
				var args = filter.args;
				var comparator = collection._getFilterComparator(type);
				if (comparator) {
					// it is a comparator
					var firstArg = args[0];
					var getProperty = makeGetter(firstArg, queryAccessors);
					var secondArg = args[1];
					if (secondArg && secondArg.fetchSync) {
						// if it is a collection, fetch the contents (for `in` and `contains` operators)
						secondArg = secondArg.fetchSync();
					}
					return function (object) {
						// get the value for the property and compare to expected value
						return comparator.call(collection, getProperty(object), secondArg, object, firstArg);
					};
				}
				switch (type) {
					case 'and': case 'or':
						for (var i = 0, l = args.length; i < l; i++) {
							// combine filters, using and or or
							var nextQuerier = getQuerier(args[i]);
							if (querier) {
								// combine the last querier with a new one
								querier = (function(a, b) {
									return type === 'and' ?
										function(object) {
											return a(object) && b(object);
										} :
										function(object) {
											return a(object) || b(object);

										};
								})(querier, nextQuerier);
							} else {
								querier = nextQuerier;
							}
						}
						return querier;
					case 'function':
						return args[0];
					case 'string':
						// named filter
						var filterFunction = collection[args[0]];
						if (!filterFunction) {
							throw new Error('No filter function ' + args[0] + ' was found in the collection');
						}
						return filterFunction;
					case undefined:
						return function () {
							return true;
						};
					default:
						throw new Error('Unknown filter operation "' + type + '"');
				}
			}
			return function (data) {
				return arrayUtil.filter(data, querier);
			};
		},

		_getFilterComparator: function (type) {
			// summary:
			//		Get the comparator for the specified type
			// returns: Function?

			return comparators[type] || this.inherited(arguments);
		},

		_createSelectQuerier: function (properties) {
			return function (data) {
				var l = properties.length;
				return arrayUtil.map(data, properties instanceof Array ?
					// array of properties
					function (object) {
						var selectedObject = {};
						for (var i = 0; i < l; i++) {
							var property = properties[i];
							selectedObject[property] = object[property];
						}
						return selectedObject;
					} :
					// single property
					function (object) {
						return object[properties];
					});
			};
		},

		_createSortQuerier: function (sorted) {
			var queryAccessors = this.queryAccessors;
			return function (data) {
				data = data.slice();
				data.sort(typeof sorted == 'function' ? sorted : function (a, b) {
					for (var i = 0; i < sorted.length; i++) {
						var comparison;
						var sorter = sorted[i];
						if (typeof sorter == 'function') {
							comparison = sorter(a, b);
						} else {
							var getProperty = sorter.get || (sorter.get = makeGetter(sorter.property, queryAccessors));
							var descending = sorter.descending;
							var aValue = getProperty(a);
							var bValue = getProperty(b);

							aValue != null && (aValue = aValue.valueOf());
							bValue != null && (bValue = bValue.valueOf());

							comparison = aValue === bValue
								? 0
								: (!!descending === (aValue === null || aValue > bValue && bValue !== null) ? -1 : 1);
						}

						if (comparison !== 0) {
							return comparison;
						}
					}
					return 0;
				});
				return data;
			};
		}
	});
});

define('dstore/Memory',[
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/_base/array',
	'./Store',
	'./Promised',
	'./SimpleQuery',
	'./QueryResults'
], function (declare, lang, arrayUtil, Store, Promised, SimpleQuery, QueryResults) {

	// module:
	//		dstore/Memory
	return declare([Store, Promised, SimpleQuery ], {
		constructor: function () {
			// summary:
			//		Creates a memory object store.
			// options: dstore/Memory
			//		This provides any configuration information that will be mixed into the store.
			//		This should generally include the data property to provide the starting set of data.

			// Add a version property so subcollections can detect when they're using stale data
			this.storage.version = 0;
		},

		postscript: function () {
			this.inherited(arguments);

			// Set the data in `postscript` so subclasses can override `data` in their constructors
			// (e.g., a LocalStorage store that retrieves its data from localStorage)
			this.setData(this.data || []);
		},

		// data: Array
		//		The array of all the objects in the memory store
		data: null,

		autoEmitEvents: false, // this is handled by the methods themselves

		getSync: function (id) {
			// summary:
			//		Retrieves an object by its identity
			// id: Number
			//		The identity to use to lookup the object
			// returns: Object
			//		The object in the store that matches the given id.
			return this.storage.fullData[this.storage.index[id]];
		},
		putSync: function (object, options) {
			// summary:
			//		Stores an object
			// object: Object
			//		The object to store.
			// options: dstore/Store.PutDirectives?
			//		Additional metadata for storing the data.  Includes an 'id'
			//		property if a specific id is to be used.
			// returns: Number

			options = options || {};

			var storage = this.storage,
				index = storage.index,
				data = storage.fullData;

			var Model = this.Model;
			if (Model && !(object instanceof Model)) {
				// if it is not the correct type, restore a
				// properly typed version of the object. Note that we do not allow
				// mutation here
				object = this._restore(object);
			}
			var id = this.getIdentity(object);
			if (id == null) {
				this._setIdentity(object, ('id' in options) ? options.id : Math.random());
				id = this.getIdentity(object);
			}
			storage.version++;

			var eventType = id in index ? 'update' : 'add',
				event = { target: object },
				previousIndex,
				defaultDestination;
			if (eventType === 'update') {
				if (options.overwrite === false) {
					throw new Error('Object already exists');
				} else {
					data.splice(previousIndex = index[id], 1);
					defaultDestination = previousIndex;
				}
			} else {
				defaultDestination = this.defaultNewToStart ? 0 : data.length;
			}

			var destination;
			if ('beforeId' in options) {
				var beforeId = options.beforeId;

				if (beforeId === null) {
					destination = data.length;
				} else {
					destination = index[beforeId];

					// Account for the removed item
					if (previousIndex < destination) {
						--destination;
					}
				}

				if (destination !== undefined) {
					event.beforeId = beforeId;
				} else {
					console.error('options.beforeId was specified but no corresponding index was found');
					destination = defaultDestination;
				}
			} else {
				destination = defaultDestination;
			}
			data.splice(destination, 0, object);

			// the fullData has been changed, so the index needs updated
			var i = isFinite(previousIndex) ? Math.min(previousIndex, destination) : destination;
			for (var l = data.length; i < l; ++i) {
				index[this.getIdentity(data[i])] = i;
			}

			this.emit(eventType, event);

			return object;
		},
		addSync: function (object, options) {
			// summary:
			//		Creates an object, throws an error if the object already exists
			// object: Object
			//		The object to store.
			// options: dstore/Store.PutDirectives?
			//		Additional metadata for storing the data.  Includes an 'id'
			//		property if a specific id is to be used.
			// returns: Number
			(options = options || {}).overwrite = false;
			// call put with overwrite being false
			return this.putSync(object, options);
		},
		removeSync: function (id) {
			// summary:
			//		Deletes an object by its identity
			// id: Number
			//		The identity to use to delete the object
			// returns: Boolean
			//		Returns true if an object was removed, falsy (undefined) if no object matched the id
			var storage = this.storage;
			var index = storage.index;
			var data = storage.fullData;
			if (id in index) {
				var removed = data.splice(index[id], 1)[0];
				// now we have to reindex
				this._reindex();
				this.emit('delete', {id: id, target: removed});
				return true;
			}
		},
		setData: function (data) {
			// summary:
			//		Sets the given data as the source for this store, and indexes it
			// data: Object[]
			//		An array of objects to use as the source of data. Note that this
			//		array will not be copied, it is used directly and mutated as
			//		data changes.

			if (this.parse) {
				data = this.parse(data);
			}
			if (data.items) {
				// just for convenience with the data format ItemFileReadStore expects
				this.idProperty = data.identifier || this.idProperty;
				data = data.items;
			}
			var storage = this.storage;
			storage.fullData = this.data = data;
			this._reindex();
		},

		_reindex: function () {
			var storage = this.storage;
			var index = storage.index = {};
			var data = storage.fullData;
			var Model = this.Model;
			var ObjectPrototype = Object.prototype;
			for (var i = 0, l = data.length; i < l; i++) {
				var object = data[i];
				if (Model && !(object instanceof Model)) {
					var restoredObject = this._restore(object,
							// only allow mutation if it is a plain object
							// (which is generally the expected input),
							// if "typed" objects are actually passed in, we will
							// respect that, and leave the original alone
							object.__proto__ === ObjectPrototype);
					if (object !== restoredObject) {
						// a new object was generated in the restoration process,
						// so we have to update the item in the data array.
						data[i] = object = restoredObject;
					}
				}
				index[this.getIdentity(object)] = i;
			}
			storage.version++;
		},

		fetchSync: function () {
			var data = this.data;
			if (!data || data._version !== this.storage.version) {
				// our data is absent or out-of-date, so we requery from the root
				// start with the root data
				data = this.storage.fullData;
				var queryLog = this.queryLog;
				// iterate through the query log, applying each querier
				for (var i = 0, l = queryLog.length; i < l; i++) {
					data = queryLog[i].querier(data);
				}
				// store it, with the storage version stamp
				data._version = this.storage.version;
				this.data = data;
			}
			return new QueryResults(data);
		},

		fetchRangeSync: function (kwArgs) {
			var data = this.fetchSync(),
				start = kwArgs.start,
				end = kwArgs.end;
			return new QueryResults(data.slice(start, end), {
				totalLength: data.length
			});
		},

		_includePropertyInSubCollection: function (name) {
			return name !== 'data' && this.inherited(arguments);
		}
	});
});

define('dstore/Tree',[
	'dojo/_base/declare'
	/*=====, 'dstore/Store'=====*/
], function (declare /*=====, Store=====*/) {
	return declare(null, {
		constructor: function () {
			this.root = this;
		},

		mayHaveChildren: function (object) {
			// summary:
			//		Check if an object may have children
			// description:
			//		This method is useful for eliminating the possibility that an object may have children,
			//		allowing collection consumers to determine things like whether to render UI for child-expansion
			//		and whether a query is necessary to retrieve an object's children.
			// object:
			//		The potential parent
			// returns: boolean

			return 'hasChildren' in object ? object.hasChildren : true;
		},

		getRootCollection: function () {
			// summary:
			//		Get the collection of objects with no parents
			// returns: dstore/Store.Collection

			return this.root.filter({ parent: null });
		},

		getChildren: function (object) {
			// summary:
			//		Get a collection of the children of the provided parent object
			// object:
			//		The parent object
			// returns: dstore/Store.Collection

			return this.root.filter({ parent: this.getIdentity(object) });
		}
	});
});

define('dstore/Trackable',[
	'dojo/_base/lang',
	'dojo/_base/declare',
	'dojo/aspect',
	'dojo/when',
	'dojo/promise/all',
	'dojo/_base/array',
	'dojo/on'
	/*=====, './api/Store' =====*/
], function (lang, declare, aspect, when, whenAll, arrayUtil, on /*=====, Store =====*/) {

	// module:
	//		dstore/Trackable
	var revision = 0;

	function createRange(newStart, newEnd) {
		return {
			start: newStart,
			count: newEnd - newStart
		};
	}

	function registerRange(ranges, newStart, newEnd) {
		for (var i = ranges.length - 1; i >= 0; --i) {
			var existingRange = ranges[i],
				existingStart = existingRange.start,
				existingEnd = existingStart + existingRange.count;

			if (newStart > existingEnd) {
				// existing range completely precedes new range. we are done.
				ranges.splice(i + 1, 0, createRange(newStart, newEnd));
				return;
			} else if (newEnd >= existingStart) {
				// the ranges overlap and must be merged into a single range
				newStart = Math.min(newStart, existingStart);
				newEnd = Math.max(newEnd, existingEnd);
				ranges.splice(i, 1);
			}
		}

		ranges.unshift(createRange(newStart, newEnd));
	}

	function unregisterRange(ranges, start, end) {
		for (var i = 0, range; (range = ranges[i]); ++i) {
			var existingStart = range.start,
				existingEnd = existingStart + range.count;

			if (start <= existingStart) {
				if (end >= existingEnd) {
					// The existing range is within the forgotten range
					ranges.splice(i, 1);
				} else {
					// The forgotten range overlaps the beginning of the existing range
					range.start = end;
					range.count = existingEnd - range.start;

					// Since the forgotten range ends before the existing range,
					// there are no more ranges to update, and we are done
					return;
				}
			} else if (start < existingEnd) {
				if (end > existingStart) {
					// The forgotten range is within the existing range
					ranges.splice(i, 1, createRange(existingStart, start), createRange(end, existingEnd));

					// We are done because the existing range bounded the forgotten range
					return;
				} else {
					// The forgotten range overlaps the end of the existing range
					range.count = start - range.start;
				}
			}
		}
	}

	var trackablePrototype = {
		track: function () {
			var store = this.store || this;

			// monitor for updates by listening to these methods
			var handles = [];
			var eventTypes = {add: 1, update: 1, 'delete': 1};
			// register to listen for updates
			for (var type in eventTypes) {
				handles.push(
					this.on(type, (function (type) {
						return function (event) {
							notify(type, event);
						};
					})(type))
				);
			}

			function makeFetch() {
				return function () {
					var self = this;
					var fetchResults = this.inherited(arguments);
					when(fetchResults, function (results) {
						results = self._results = results.slice();
						if (self._partialResults) {
							// clean this up, as we don't need this anymore
							self._partialResults = null;
						}
						self._ranges = [];
						registerRange(self._ranges, 0, results.length);
					});
					return fetchResults;
				};
			}
			function makeFetchRange() {
				return function (kwArgs) {
					var self = this,
						start = kwArgs.start,
						end = kwArgs.end,
						fetchResults = this.inherited(arguments);
					// only use this if we don't have all the data
					if (!this._results) {
						when(fetchResults, function (results) {
							return when(results.totalLength, function (totalLength) {
								var partialResults = self._partialResults || (self._partialResults = []);
								end = Math.min(end, start + results.length);

								partialResults.length = totalLength;

								// copy the new ranged data into the parent partial data set
								var spliceArgs = [ start, end - start ].concat(results);
								partialResults.splice.apply(partialResults, spliceArgs);
								registerRange(self._ranges, start, end);

								return results;
							});
						});
					}
					return fetchResults;
				};
			}

			// delegate rather than call _createSubCollection because we are not ultimately creating
			// a new collection, just decorating an existing collection with item index tracking.
			// If we use _createSubCollection, it will return a new collection that may exclude
			// important, defining properties from the tracked collection.
			var observed = declare.safeMixin(lang.delegate(this), {
				_ranges: [],

				fetch: makeFetch(),
				fetchRange: makeFetchRange(),

				releaseRange: function (start, end) {
					if (this._partialResults) {
						unregisterRange(this._ranges, start, end);

						for (var i = start; i < end; ++i) {
							delete this._partialResults[i];
						}
					}
				},

				on: function (type, listener) {
					var self = this,
						inheritedOn = this.getInherited(arguments);
					return on.parse(observed, type, listener, function (target, type) {
						return type in eventTypes ?
							aspect.after(observed, 'on_tracked' + type, listener, true) :
							inheritedOn.call(self, type, listener);
					});
				},

				tracking: {
					remove: function () {
						while (handles.length > 0) {
							handles.pop().remove();
						}

						this.remove = function () {};
					}
				},
				// make sure track isn't called twice
				track: null
			});
			if (this.fetchSync) {
				// only add these if we extending a sync-capable store
				declare.safeMixin(observed, {
					fetchSync: makeFetch(),
					fetchRangeSync: makeFetchRange()
				});

				// we take the presence of fetchSync to indicate that the results can be
				// retrieved cheaply, and then we can just automatically fetch and start
				// tracking results
				observed.fetchSync();
			}

			// Create a function that applies all queriers in the query log
			// in order to determine whether a new or updated item belongs
			// in the results and at what position.
			var queryExecutor;
			arrayUtil.forEach(this.queryLog, function (entry) {
				var existingQuerier = queryExecutor,
					querier = entry.querier;

				if (querier) {
					queryExecutor = existingQuerier
						? function (data) { return querier(existingQuerier(data)); }
						: querier;
				}
			});

			var defaultEventProps = {
					'add': { index: undefined },
					'update': { previousIndex: undefined, index: undefined },
					'delete': { previousIndex: undefined }
				},
				findObject = function (data, id, start, end) {
					start = start !== undefined ? start : 0;
					end = end !== undefined ? end : data.length;
					for (var i = start; i < end; ++i) {
						if (store.getIdentity(data[i]) === id) {
							return i;
						}
					}
					return -1;
				};

			function notify(type, event) {

				revision++;
				var target = event.target;
				event = lang.delegate(event, defaultEventProps[type]);

				when(observed._results || observed._partialResults, function (resultsArray) {
					/* jshint maxcomplexity: 32 */

					function emitEvent() {
						// TODO: Eventually we will want to aggregate all the listener events
						// in an event turn, but we will wait until we have a reliable, performant queueing
						// mechanism for this (besides setTimeout)
						var method = observed['on_tracked' + type];
						method && method.call(observed, event);
					}

					if (!resultsArray) {
						// without data, we have no way to determine the indices effected by the change,
						// so just pass along the event and return.
						emitEvent();
						return;
					}

					var i, j, l, ranges = observed._ranges, range;
					/*if(++queryRevision != revision){
						throw new Error('Query is out of date, you must observe() the' +
						' query prior to any data modifications');
					}*/

					var targetId = 'id' in event ? event.id : store.getIdentity(target);
					var removedFrom = -1,
						removalRangeIndex = -1,
						insertedInto = -1,
						insertionRangeIndex = -1;
					if (type === 'delete' || type === 'update') {
						// remove the old one
						for (i = 0; removedFrom === -1 && i < ranges.length; ++i) {
							range = ranges[i];
							for (j = range.start, l = j + range.count; j < l; ++j) {
								var object = resultsArray[j];
								// often ids can be converted strings (if they are used as keys in objects),
								// so we do a coercive equality check
								/* jshint eqeqeq: false */
								if (store.getIdentity(object) == targetId) {
									removedFrom = event.previousIndex = j;
									removalRangeIndex = i;
									resultsArray.splice(removedFrom, 1);

									range.count--;
									for (j = i + 1; j < ranges.length; ++j) {
										ranges[j].start--;
									}

									break;
								}
							}
						}
					}

					if (type === 'add' || type === 'update') {
						if (queryExecutor) {
							// with a queryExecutor, we can determine the correct sorted index for the change

							if (queryExecutor([target]).length) {
								var begin = 0,
									end = ranges.length - 1,
									sampleArray,
									candidateIndex = -1,
									sortedIndex,
									adjustedIndex;
								while (begin <= end && insertedInto === -1) {
									// doing a binary search for the containing range
									i = begin + Math.round((end - begin) / 2);
									range = ranges[i];

									sampleArray = resultsArray.slice(range.start, range.start + range.count);

									if ('beforeId' in event) {
										candidateIndex = event.beforeId === null
											? sampleArray.length
											: findObject(sampleArray, event.beforeId);
									}

									if (candidateIndex === -1) {
										// If the original index came from this range, put back in the original slot
										// so it doesn't move unless it needs to (relying on a stable sort below)
										if (removedFrom >= Math.max(0, range.start - 1)
											&& removedFrom <= (range.start + range.count)) {
											candidateIndex = removedFrom;
										} else {
											candidateIndex = store.defaultNewToStart ? 0 : sampleArray.length;
										}
									}
									sampleArray.splice(candidateIndex, 0, target);

									sortedIndex = arrayUtil.indexOf(queryExecutor(sampleArray), target);
									adjustedIndex = range.start + sortedIndex;

									if (sortedIndex === 0 && range.start !== 0) {
										end = i - 1;
									} else if (sortedIndex >= (sampleArray.length - 1) &&
											adjustedIndex < resultsArray.length) {
										begin = i + 1;
									} else {
										insertedInto = adjustedIndex;
										insertionRangeIndex = i;
									}
								}
								if (insertedInto === -1 && begin > 0 && begin < ranges.length) {
									var betweenRanges = true;
								}
							}
						} else {
							// we don't have a queryExecutor, so we can't provide any information
							// about where it was inserted or moved to. If it is an update, we leave
							// its position alone. otherwise, we at least indicate a new object

							var range,
								possibleRangeIndex = -1;
							if ('beforeId' in event) {
								if (event.beforeId === null) {
									insertedInto = resultsArray.length;
									possibleRangeIndex = ranges.length - 1;
								} else {
									for (i = 0, l = ranges.length; insertionRangeIndex === -1 && i < l; ++i) {
										range = ranges[i];

										insertedInto = findObject(
											resultsArray,
											event.beforeId,
											range.start,
											range.start + range.count
										);

										if (insertedInto !== -1) {
											insertionRangeIndex = i;
										}
									}
								}
							} else {
								if (type === 'update') {
									insertedInto = removedFrom;
									insertionRangeIndex = removalRangeIndex;
								} else {
									if (store.defaultNewToStart) {
										insertedInto = 0;
										possibleRangeIndex = 0;
									} else {
										// default to the bottom
										insertedInto = resultsArray.length;
										possibleRangeIndex = ranges.length - 1;
									}
								}
							}

							if (possibleRangeIndex !== -1 && insertionRangeIndex === -1) {
								range = ranges[possibleRangeIndex];
								if (range && range.start <= insertedInto
									&& insertedInto <= (range.start + range.count)) {
									insertionRangeIndex = possibleRangeIndex;
								}
							}
						}

						// an item only truly has a known index if it is in a known range
						if (insertedInto > -1 && insertionRangeIndex > -1) {
							event.index = insertedInto;
							resultsArray.splice(insertedInto, 0, target);

							// update the count and start of the appropriate ranges
							ranges[insertionRangeIndex].count++;
							for (i = insertionRangeIndex + 1; i < ranges.length; ++i) {
								ranges[i].start++;
							}
						} else if (betweenRanges) {
							// the begin index will be after the inserted item, and is
							// where we can begin incrementing start values
							event.beforeIndex = ranges[begin].start;
							for (i = begin; i < ranges.length; ++i) {
								ranges[i].start++;
							}
						}
					}
					// update the total
					event.totalLength = resultsArray.length;

					emitEvent();
				});
			}

			return observed;
		}
	};

	var Trackable =  declare(null, trackablePrototype);

	Trackable.create = function (target, properties) {
		// create a delegate of an existing store with trackability functionality mixed in
		target = declare.safeMixin(lang.delegate(target), trackablePrototype);
		declare.safeMixin(target, properties);
		return target;
	};
	return Trackable;
});

define('dstore/legacy/DstoreAdapter',[
	'dojo/_base/declare',
	'dojo/_base/array',
	'dojo/store/util/QueryResults'
	/*=====, "dstore/api/Store" =====*/
], function (declare, arrayUtil, QueryResults /*=====, Store =====*/) {
// module:
//		An adapter mixin that makes a dstore store object look like a legacy Dojo object store.

	function passthrough(data) {
		return data;
	}

	// No base class, but for purposes of documentation, the base class is dstore/api/Store
	var base = null;
	/*===== base = Store; =====*/

	var adapterPrototype = {

		// store:
		//		The dstore store that is wrapped as a Dojo object store
		store: null,

		constructor: function (store) {
			this.store = store;

			if (store._getQuerierFactory('filter') || store._getQuerierFactory('sort')) {
				this.queryEngine = function (query, options) {
					options = options || {};

					var filterQuerierFactory = store._getQuerierFactory('filter');
					var filter = filterQuerierFactory ? filterQuerierFactory(query) : passthrough;

					var sortQuerierFactory = store._getQuerierFactory('sort');
					var sort = passthrough;
					if (sortQuerierFactory) {
						sort = sortQuerierFactory(arrayUtil.map(options.sort, function (criteria) {
							return {
								property: criteria.attribute,
								descending: criteria.descending
							};
						}));
					}

					var range = passthrough;
					if (!isNaN(options.start) || !isNaN(options.count)) {
						range = function (data) {
							var start = options.start || 0,
								count = options.count || Infinity;

							var results = data.slice(start, start + count);
							results.total = data.length;
							return results;
						};
					}

					return function (data) {
						return range(sort(filter(data)));
					};
				};
			}
			var objectStore = this;
			// we call notify on events to mimic the old dojo/store/Trackable
			store.on('add,update,delete', function (event) {
				var type = event.type;
				var target = event.target;
				objectStore.notify(
					(type === 'add' || type === 'update') ? target : undefined,
					(type === 'delete' || type === 'update') ?
						('id' in event ? event.id : store.getIdentity(target)) : undefined);
			});
		},
		labelAttr:'title',
		getLabel:function(item){
			return this.store.getLabel(item);
		},
		query: function (query, options) {
			// summary:
			//		Queries the store for objects. This does not alter the store, but returns a
			//		set of data from the store.
			// query: String|Object|Function
			//		The query to use for retrieving objects from the store.
			// options: dstore/api/Store.QueryOptions
			//		The optional arguments to apply to the resultset.
			// returns: dstore/api/Store.QueryResults
			//		The results of the query, extended with iterative methods.
			//
			// example:
			//		Given the following store:
			//
			//	...find all items where "prime" is true:
			//
			//	|	store.query({ prime: true }).forEach(function(object){
			//	|		// handle each object
			//	|	});
			options = options || {};

			var results = this.store.filter(query);
			var queryResults;
			var tracked;
			var total;

			// Apply sorting
			var sort = options.sort;
			if (sort) {
				if (Object.prototype.toString.call(sort) === '[object Array]') {
					var sortOptions;
					while ((sortOptions = sort.pop())) {
						results = results.sort(sortOptions.attribute, sortOptions.descending);
					}
				} else {
					results = results.sort(sort);
				}
			}

			if (results.track && !results.tracking) {
				// if it is trackable, always track, so that observe can
				// work properly.
				results = results.track();
				tracked = true;
			}
			if ('start' in options) {
				// Apply a range
				var start = options.start || 0;
				// object stores support sync results, so try that if available
				queryResults = results[results.fetchRangeSync ? 'fetchRangeSync' : 'fetchRange']({
					start: start,
					end: options.count ? (start + options.count) : Infinity
				});
			}
			queryResults = queryResults || results[results.fetchSync ? 'fetchSync' : 'fetch']();
			total = queryResults.totalLength;
			queryResults = new QueryResults(queryResults);
			queryResults.total = total;
			queryResults.observe = function (callback, includeObjectUpdates) {
				// translate observe to event listeners
				function convertUndefined(value) {
					if (value === undefined && tracked) {
						return -1;
					}
					return value;
				}
				var addHandle = results.on('add', function (event) {
					callback(event.target, -1, convertUndefined(event.index));
				});
				var updateHandle = results.on('update', function (event) {
					if (includeObjectUpdates || event.previousIndex !== event.index || !isFinite(event.index)) {
						callback(event.target, convertUndefined(event.previousIndex), convertUndefined(event.index));
					}
				});
				var removeHandle = results.on('delete', function (event) {
					callback(event.target, convertUndefined(event.previousIndex), -1);
				});
				var handle = {
					remove: function () {
						addHandle.remove();
						updateHandle.remove();
						removeHandle.remove();
					}
				};
				handle.cancel = handle.remove;
				return handle;
			};
			return queryResults;
		},
		notify: function () {

		}
	};

	var delegatedMethods = [ 'get', 'put', 'add', 'remove', 'getIdentity' ];
	arrayUtil.forEach(delegatedMethods, function (methodName) {
		adapterPrototype[methodName] = function () {
			var store = this.store;
			// try sync first, since dojo object stores support that directly
			return (store[methodName + 'Sync'] || store[methodName]).apply(store, arguments);
		};
	});

	return declare(base, adapterPrototype);
});

define('dstore/mainr.js',[
    "dstore/Memory",
    "dstore/Promised",
    "dstore/QueryMethod",
    "dstore/QueryResults",
    "dstore/SimpleQuery",
    "dstore/Store",
    "dstore/Tree",
    "dstore/Filter",
    "dstore/Trackable",
    "dstore/legacy/DstoreAdapter"
], function () {

});
