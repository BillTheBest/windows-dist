define('xcf/types',[
    'dojo/_base/declare'
],function(declare){

    return declare("xcf.types", null,
    {

    });
});


define('xcf/types/Types',[
    'xaction/types',
    'xide/types/Types',
    'xide/types',
    'xide/utils/ObjectUtils'
], function (aTypes,cTypes,types,utils) {

    /**
     * Variable Flags
     *
     * @enum {int} VARIABLE_FLAGS
     * @global
     */
    types.VARIABLE_FLAGS = {
        PUBLISH:0x00000002,
        PUBLISH_IF_SERVER:0x00000004
        
    };
    /**
     * Flags to define logging outputs per device or view
     *
     * @enum {int} LOGGING_FLAGS
     * @global
     */
    types.LOGGING_FLAGS = {
        /**
         * No logging
         * @constant
         * @type int
         */
        NONE: 0x00000000,
        /**
         * Log in the IDE's global console
         * @constant
         * @type int
         */
        GLOBAL_CONSOLE: 0x00000001,
        /**
         * Log in the IDE's status bar
         * @constant
         * @type int
         */
        STATUS_BAR: 0x00000002,
        /**
         * Create notification popup in the IDE
         * @constant
         * @type int
         */
        POPUP: 0x00000004,
        /**
         * Log to file
         * @constant
         * @type int
         */
        FILE: 0x00000008,
        /**
         * Log into the IDE's dev tool's console
         * @constant
         * @type int
         */
        DEV_CONSOLE: 0x00000010,
        /**
         * Log into the device's IDE console
         * @constant
         * @type int
         */
        DEVICE_CONSOLE: 0x00000020
    };

    /**
     * Help struct for jsDoc
     * @typedef {object} module:xide/types~DeviceInfo
     * @type Object
     * @property {string} host The IP address
     * @property {string} port The port
     * @property {string} scope The scope of the device
     * @property {string} driverId The id of the driver
     * @property {string} protocol The protocol, ie: tcp, serial,..
     * @property {string} devicePath The absolute path to the device's meta file
     * @property {string} id The device model id
     * @property {string} title The title of the device
     * @property {string} source Additional field to carry a source. That might be 'ide' or 'server'.
     * @property {string} deviceScope Field to store the device's scope: user_devices or system_devices
     * @property {string} driverScope Field to store the device's driver scope: user_drivers or system_drivers
     * @property {string} user_devices Absolute path to the user's devices
     * @property {string} system_devices Absolute path to the system devices
     * @property {string} user_drivers Absolute path to the user's drivers
     * @property {string} system_drivers Absolute path to the drivers drivers
     * @property {string} loggingFlags Absolute path to the user's drivers
     * @property {int} serverSide The device's driver runs server side if 1, otherwise 0
     * @property {string} hash A hash for client side. Its build of MD5(host,port,protocol,driverId,driverScope,id,devicePath,deviceScope,source,user_devices,system_devices,system_drivers,user_drivers)
     * @property {DRIVER_FLAGS} driverOptions The driver flags
     * @property {LOGGING_FLAGS} loggingFlags The device's logging flags
     * @property {object} responseSettings Contains the constants for receiving data from a device its being set at initialization time and has this structure:
     * @property {boolean} responseSettings.start 
     */
    
    
    utils.mixin(types.ITEM_TYPE, {
        DEVICE: 'Device',
        DEVICE_GROUP: 'Device Group',
        DRIVER: 'Driver',
        DRIVER_GROUP: 'Driver Group',
        PROTOCOL: 'Protocol',
        PROTOCOL_GROUP: 'Protocol Group'
    });
    
    /**
     * Possible Node-JS service status modes.
     *
     * @constant {Integer.<module:xide/types~SERVICE_STATUS>}
     *     module:xide/types~SERVICE_STATUS
     */
    types.SERVICE_STATUS = {
        OFFLINE: "offline",
        ONLINE: "online",
        TIMEOUT: "timeout"
    };

    /**
     *
     */
    types.PROTOCOL = {
        TCP: 'tcp',
        UDP: 'udp',
        SERIAL: 'serial',
        DRIVER: 'driver',
        SSH: 'ssh',
        MQTT: 'mqtt'
    };
    /**
     * Additional event keys
     * @enum {string} module:xcf/types/EVENTS
     * @extends module:xide/types/EVENTS
     */
    var Events = {
        ON_DEBUGGER_READY: 'onDebuggerReady',
        ON_DEVICE_SELECTED: 'onDeviceSelected',
        ON_DEVICE_GROUP_SELECTED: 'onDeviceGroupSelected',
        ON_PROTOCOL_SELECTED: 'onProtocolSelected',
        ON_PROTOCOL_GROUP_SELECTED: 'onProtocolGroupSelected',
        ON_PROTOCOL_CHANGED:'onProtocolChanged',
        ON_MQTT_MESSAGE:'onMQTTMessage',
        ON_DEVICE_MESSAGE: 'onDeviceMessage',
        ON_DEVICE_MESSAGE_EXT: 'onDeviceMessageExt',
        ON_COMMAND_FINISH:'onCommandFinish',
        ON_COMMAND_PROGRESS:'onCommandProgress',
        ON_COMMAND_PAUSED:'onCommandPaused',
        ON_COMMAND_STOPPED:'onCommandStopped',
        ON_COMMAND_ERROR:'onCommandError',
        ON_DEVICE_DISCONNECTED: 'onDeviceDisconnected',
        ON_DEVICE_CONNECTED:'onDeviceConnected',
        ON_DEVICE_COMMAND: 'onDeviceCommand',
        ON_DEVICE_STATE_CHANGED: 'onDeviceStateChanged',
        ON_DEVICE_DRIVER_INSTANCE_READY: 'onDeviceDriveInstanceReady',
        ON_DRIVER_SELECTED: 'onDriverSelected',
        ON_DRIVER_GROUP_SELECTED: 'onDriverGroupSelected',
        ON_DRIVER_VARIABLE_ADDED: 'onDriverVariableAdded',
        ON_DRIVER_VARIABLE_REMOVED: 'onDriverVariableRemoved',
        ON_DRIVER_VARIABLE_CHANGED: 'onDriverVariableChanged',
        ON_DRIVER_COMMAND_ADDED: 'onDriverCommandAdded',
        ON_DRIVER_COMMAND_REMOVED: 'onDriverCommandRemoved',
        ON_DRIVER_COMMAND_CHANGE: 'onDriverVariableChanged',
        ON_SCOPE_CREATED: 'onScopeCreated',
        ON_DRIVER_MODIFIED:'onDriverModified',
        SET_DEVICE_VARIABLES:'setDeviceVariables',
        ON_SERVER_LOG_MESSAGE: 'onServerLogMessage',
        ON_CLIENT_LOG_MESSAGE: 'onClientLogMessage',
        ON_DEVICE_SERVER_CONNECTED:'onDeviceServerConnected',
        ON_RUN_CLASS_EVENT: 'onRunClassEvent'
    }
    
    utils.mixin(types.EVENTS,Events);

    /**
     * Enumeration to define a source type for variable change.
     * @enum module:xide/types/MESSAGE_SOURCE
     * @memberOf module:xide/types
     */
    types.MESSAGE_SOURCE = {
        DEVICE: 'DEVICE',
        GUI: 'GUI',
        BLOX: 'BLOX',
        CODE: 'CODE'
    };

    /**
     *
     * the device state
     * typedef {Object} xide.types~STATE
     *-@memberOf module:xide/types
     * -property {Number|String} [x] - X coordinate of the rectangle. Can be a pixel position, or a string with a 'px' or '%' suffix.
     */


    /**
     * Enumeration to define a device's status
     * @enum {String} module:xide/types/DEVICE_STATE
     * @memberOf module:xide/types
     */
    types.DEVICE_STATE = {
        CONNECTING: 'DeviceIsConnecting',
        CONNECTED: 'DeviceIsConnected',
        SYNCHRONIZING: 'DeviceIsSynchronizing',
        READY: 'DeviceIsReady',
        DISCONNECTED: 'DeviceIsDisconnected',
        DISABLED: 'DeviceIsDisabled',
        LOST_DEVICE_SERVER:'LostDeviceServerConnection'
    };

    /**
     * Keys to define a driver meta property
     * @enum module:xide/types/DRIVER_PROPERTY
     * @memberOf module:xide/types
     */
    types.DRIVER_PROPERTY = {
        CF_DRIVER_NAME: 'CF_DRIVER_NAME',
        CF_DRIVER_ICON: 'CF_DRIVER_ICON',
        CF_DRIVER_CLASS: 'CF_DRIVER_CLASS',
        CF_DRIVER_ID: 'CF_DRIVER_ID',
        CF_DRIVER_COMMANDS: 'CF_DRIVER_COMMANDS',
        CF_DRIVER_VARIABLES: 'CF_DRIVER_VARIABLES',
        CF_DRIVER_RESPONSES: 'CF_DRIVER_RESPONSES'
    };

    /**
     * Keys to define protocol meta properties
     * @enum module:xide/types/PROTOCOL_PROPERTY
     * @memberOf module:xide/types
     */
    types.PROTOCOL_PROPERTY ={
        CF_PROTOCOL_TITLE: 'Title',
        CF_PROTOCOL_ICON: 'CF_PROTOCOL_ICON',
        CF_PROTOCOL_CLASS: 'CF_PROTOCOL_CLASS',
        CF_PROTOCOL_ID: 'CF_PROTOCOL_ID',
        CF_PROTOCOL_COMMANDS: 'CF_PROTOCOL_COMMANDS',
        CF_PROTOCOL_VARIABLES: 'CF_PROTOCOL_VARIABLES',
        CF_PROTOCOL_RESPONSES: 'CF_PROTOCOL_RESPONSES'
    };

    /**
     * Keys to define protocol meta properties
     * @enum module:xide/types/DEVICE_PROPERTY
     * @memberOf module:xide/types
     */
    types.DEVICE_PROPERTY = {
        CF_DEVICE_DRIVER: 'Driver',
        CF_DEVICE_HOST: 'Host',
        CF_DEVICE_PORT: 'Port',
        CF_DEVICE_PROTOCOL: 'Protocol',
        CF_DEVICE_TITLE: 'Title',
        CF_DEVICE_ID: 'Id',
        CF_DEVICE_ENABLED: 'Enabled',
        CF_DEVICE_OPTIONS: 'Options',
        CF_DEVICE_DRIVER_OPTIONS: 'DriverOptions',
        CF_DEVICE_LOGGING_FLAGS: 'Logging Flags'
    };


    /**
     * @enum {int} DEVICE_LOGGING_SOURCE
     * @global
     */
    types.LOG_OUTPUT = {        
        DEVICE_CONNECTED:'Device Connected',
        DEVICE_DISCONNECTED:'Device Disonnected',
        RESPONSE:'Response',
        SEND_COMMAND:'Send Command',
        DEVICE_ERROR:'Device Error'       
    }

    /**
     * @enum {int} DEFAULT_DEVICE_LOGGING_FLAGS
     * @global
     */
    types.DEFAULT_DEVICE_LOGGING_FLAGS = {}

    var LOGGING_FLAGS = types.LOGGING_FLAGS;
    
    types.DEFAULT_DEVICE_LOGGING_FLAGS[types.LOG_OUTPUT.DEVICE_CONNECTED]  = LOGGING_FLAGS.GLOBAL_CONSOLE | LOGGING_FLAGS.POPUP |  LOGGING_FLAGS.STATUS_BAR | LOGGING_FLAGS.DEVICE_CONSOLE;
    types.DEFAULT_DEVICE_LOGGING_FLAGS[types.LOG_OUTPUT.DEVICE_DISCONNECTED]  = LOGGING_FLAGS.GLOBAL_CONSOLE | LOGGING_FLAGS.POPUP |  LOGGING_FLAGS.STATUS_BAR | LOGGING_FLAGS.DEVICE_CONSOLE;
    types.DEFAULT_DEVICE_LOGGING_FLAGS[types.LOG_OUTPUT.RESPONSE] = LOGGING_FLAGS.DEVICE_CONSOLE | LOGGING_FLAGS.GLOBAL_CONSOLE;
    types.DEFAULT_DEVICE_LOGGING_FLAGS[types.LOG_OUTPUT.SEND_COMMAND] = LOGGING_FLAGS.DEVICE_CONSOLE | LOGGING_FLAGS.GLOBAL_CONSOLE;
    types.DEFAULT_DEVICE_LOGGING_FLAGS[types.LOG_OUTPUT.DEVICE_ERROR] = LOGGING_FLAGS.GLOBAL_CONSOLE | LOGGING_FLAGS.POPUP | LOGGING_FLAGS.STATUS_BAR | LOGGING_FLAGS.DEV_CONSOLE | LOGGING_FLAGS.DEVICE_CONSOLE;

    /**
     * Bitmask or flags for device about its driver
     * @enum {int} DRIVER_FLAGS
     * @global
     */
    types.DRIVER_FLAGS = {
        /**
         * Mark the driver for "server side"
         */
        RUNS_ON_SERVER: 2,
        /**
         * Enable protocol's debug message on console
         */
        DEBUG: 4,
        /**
         * Enable protocol's debug message on console
         */
        SERVER: 16
    };


    var ITEM_TYPES = {
        /**
         *
         * @extends module:xide/types~ITEM_TYPE
         */
        CF_DRIVER_VARIABLE: 'DriverVariable',
        CF_DRIVER_BASIC_COMMAND: 'DriverBasicCommand',
        CF_DRIVER_CONDITIONAL_COMMAND: 'DriverConditionalCommand',
        CF_DRIVER_RESPONSE_VARIABLE: 'DriverResponseVariable'
    };

    utils.mixin(types.ITEM_TYPE,ITEM_TYPES);

    types.BLOCK_GROUPS =
    {
        CF_DRIVER_VARIABLE: 'DriverVariable',
        CF_DRIVER_BASIC_COMMAND: 'DriverBasicCommand',
        CF_DRIVER_CONDITIONAL_COMMAND: 'DriverConditionalCommand',
        CF_DRIVER_RESPONSE_VARIABLE: 'DriverResponseVariable',
        CF_DRIVER_RESPONSE_BLOCKS: 'conditionalProcess',
        CF_DRIVER_RESPONSE_VARIABLES: 'processVariables',
        CF_DRIVER_BASIC_VARIABLES: 'basicVariables'
    };

    types.COMMAND_TYPES =
    {
        BASIC_COMMAND: 'basic',
        CONDITIONAL_COMMAND: 'conditional',
        INIT_COMMAND: 'init'
    };


    /**
     * Mixin new Core types
     */
    utils.mixin(types.ECIType, {
        DEVICE_NETWORK_SETTINGS: types.ECIType.END + 1,
        DRIVER_COMMAND_SETTINGS: 'CommandSettings'
    });

    types.VFS_ROOTS = {

        SYSTEM_DRIVERS: 'system_drivers',
        USER_DRIVERS: 'user_drivers'
    };

    /**
     * Device Server Socket Commands
     * @enum {string} SERVER_COMMAND
     * @global
     */
    types.SOCKET_SERVER_COMMANDS =
    {
        SIGNAL_MANAGER: 'Manager_command',
        RUN_FILE: 'Run_File',
        RUN_CLASS: 'Run_Class',
        SIGNAL_DEVICE: 'Device_command',
        SIGNAL_RESPONSE: 'WebSocket_response',
        MANAGER_TEST: 'Manager_Test',
        MANAGER_CLOSE_ALL: 'Close_All_Connections',
        MANAGER_STATUS: 'status',
        MANAGER_START_DRIVER: 'startDriver',
        START_DEVICE: 'startDevice',
        STOP_DEVICE: 'stopDevice',
        CREATE_CONNECTION: 'createConnection',
        MANAGER_STOP_DRIVER: 'stopDriver',
        DEVICE_SEND: 'Device_Send',
        CALL_METHOD: 'Call_Method',
        RUN_SHELL: 'Run_Shell',
        WATCH: 'Watch_Directory',
        MQTT_PUBLISH:'MQTT_PUBLISH',
        MQTT_SUBSCRIBE:'MQTT_SUBSCRIBE',
        GET_DEVICE_VARIABLES: 'getVariables',
        WRITE_LOG_MESSAGE:'Write_Log_Message',
        INIT_DEVICES:'INIT_DEVICES'
    };


    return types;
});

/** @module xcf/model/Command */
define('xcf/model/Command',[
    'dcl/dcl',
    "xblox/model/Block",
    "xblox/model/Contains",
    'xide/utils',
    'xide/types',
    'dojo/Deferred',
    'module',
    'require',
    'xblox/types/Types'
], function (dcl, Block, Contains, utils, types, Deferred, module, require, BTypes) {
    var debug = false;
    /**
     * The command model. A 'command' consists out of a few parameters and a series of
     *  XCF - Command - Block expresssions. Those expressions need to be evaluated before send them to the device
     * @class module:xcf/model/Command
     * @augments module:xide/mixins/EventedMixin
     * @extends module:xblox/model/Block_UI
     * @extends module:xblox/model/Block
     * @extends module:xblox/model/ModelBase
     */
    return dcl([Block, Contains], {
        declaredClass: "xcf.model.Command",
        /**
         *  3.12.10.3. The “Startup” checkbox indicates whether or not the associated command
         *  should be automatically sent at startup once communications have been established
         *  with the device.
         * @type {Boolean}
         */
        startup: false,
        /**
         * 3.12.10.3. The “Auto” field is used to set a time interval at which the command is
         * automatically continually sent when necessary for applications such as polling.
         * @type {Boolean}
         */
        auto: null,
        /**
         * 3.12.10.3. “Send” field containing the actual string or hexadecimal sequence used to communicate with the device.
         * @type {String}
         */
        send: '',
        /**
         * Name of the block
         * @type {String}
         */
        name: 'No Title',
        observed: [
            'send'
        ],
        interval: 0,
        flags: 0x00000800,
        _runningDfd: null,
        __started: false,
        isCommand: true,
        getItems: function (outletType) {
            return this.getItemsByType(outletType);
        },
        /**
         * onCommandFinish will be excecuted which a driver did run a command
         * @param msg {object}
         * @param msg.id {string} the command job id
         * @param msg.src {string} the source id, which is this block id
         * @param msg.cmd {string} the command string being sent
         */
        onCommandFinish: function (msg) {
            var scope = this.getScope();
            var context = scope.getContext();//driver instance
            var result = {};
            var dfd = null;
            if (msg.params && msg.params.id) {
                var id = msg.params.id;
                dfd = this.getDeferred(id);
                delete this._solving[id];
                msg.lastResponse && this.storeResult(msg.lastResponse);
                this._emit('finished', {
                    msg: msg,
                    result: this._lastResult
                });
            }
            var items = this.getItems(types.BLOCK_OUTLET.FINISH);
            if (items.length) {
                this.runFrom(items, 0, this._lastSettings);
            }
            this.resolve(result);
            this.onSuccess(this, this._lastSettings);
            if (dfd) {
                dfd.resolve(this._lastResult);
            }
        },
        /**
         * onCommandPaused
         * @param msg {object}
         * @param msg.id {string} the command job id
         * @param msg.src {string} the source id, which is this block id
         * @param msg.cmd {string} the command string being sent
         */
        onCommandPaused: function (msg) {
            var scope = this.getScope();
            var context = scope.getContext();//driver instance
            var result = {};
            var params = msg.params;

            if (params && params.id) {
                msg.lastResponse && this.storeResult(msg.lastResponse);
                this._emit('paused', {
                    msg: msg,
                    result: this._lastResult,
                    id: params.id
                });
            }
            var items = this.getItems(types.BLOCK_OUTLET.PAUSED);
            if (items.length) {
                this.runFrom(items, 0, this._lastSettings);
            }
        },
        /**
         * onCommandPaused
         * @param msg {object}
         * @param msg.id {string} the command job id
         * @param msg.src {string} the source id, which is this block id
         * @param msg.cmd {string} the command string being sent
         */
        onCommandStopped: function (msg) {
            var scope = this.getScope();
            var context = scope.getContext();//driver instance
            var result = {};
            var params = msg.params;

            if (params && params.id) {
                /*
                 this._emit('cmd:'+msg.cmd + '_' + params.id,{
                 msg:msg
                 });*/
                msg.lastResponse && this.storeResult(msg.lastResponse);
                this._emit('stopped', {
                    msg: msg,
                    result: this._lastResult,
                    id: params.id
                });
            }

            var items = this.getItems(types.BLOCK_OUTLET.STOPPED);
            if (items.length) {
                this.runFrom(items, 0, this._lastSettings);
            }
        },
        /**
         * onCommandFinish will be excecuted which a driver did run a command
         * @param msg {object}
         * @param msg.id {string} the command job id
         * @param msg.src {string} the source id, which is this block id
         * @param msg.cmd {string} the command string being sent
         */
        onCommandProgress: function (msg) {
            var scope = this.getScope();
            var context = scope.getContext();//driver instance
            var result = {};
            var params = msg.params;
            if (params && params.id) {
                /*
                 this._emit('cmd:'+msg.cmd + '_' + params.id,{
                 msg:msg
                 });*/
                msg.lastResponse && this.storeResult(msg.lastResponse);
                this._emit('progress', {
                    msg: msg,
                    result: this._lastResult,
                    id: params.id
                });
            }
            var items = this.getItems(types.BLOCK_OUTLET.PROGRESS);
            if (items.length) {
                this.runFrom(items, 0, this._lastSettings);
            }
        },
        storeResult: function (lastResponse) {
            var data = utils.getJson(lastResponse);
            var result = null;
            if (data && data.result && _.isString(data.result)) {
                var str = data.result;
                var isJSON = str.indexOf('{') !== -1 || str.indexOf('[') !== -1;
                var lastResult = str;
                if (isJSON) {
                    var tmp = utils.getJson(str, true, false);
                    if (tmp) {
                        lastResult = tmp;
                    }
                }
                if (lastResult !== null) {
                    this._lastResult = result = lastResult;
                } else {
                    this._lastResult = null;
                }
            }
            return result;
        },
        resolve: function (data) {
            data = data || this._lastResult;
            if (this._runningDfd) {
                this._runningDfd.resolve(data);
            }
        },
        onCommandError: function (msg) {
            var scope = this.getScope();
            var context = scope.getContext();
            var params = msg.params;
            if (params.id) {
                msg.lastResponse && this.storeResult(msg.lastResponse);
                this._emit('cmd:' + msg.cmd + '_' + params.id, msg);
                this._emit('error', {
                    msg: msg,
                    result: this._lastResult,
                    id: params.id
                });
            }
            this.onFailed(this, this._settings);
            var items = this.getItems(types.BLOCK_OUTLET.ERROR);
            if (items.length) {
                this.runFrom(items, 0, this._lastSettings);
            }
        },
        sendToDevice: function (msg, settings, stop, pause, id) {

            if(this._destroyed){
                return;
            }
            
            msg = this.replaceAll("'", '', msg);
            id = id || utils.createUUID();
            var self = this;

            var wait = (this.flags & types.CIFLAG.WAIT) ? true : false;

            this.lastCommand = '' + msg;

            if (this.scope.instance) {
                if (wait) {
                    this._on('cmd:' + msg + '_' + id, function (msg) {
                        if (msg.error) {
                            self.onFailed(self, settings);
                        } else {
                            self.onSuccess(self, settings);
                        }
                    });
                }
                this.scope.instance.sendMessage(msg, null, this.id, id, wait, stop, pause);
            } else {
                debug && console.warn('have no device!');
                this.publish(types.EVENTS.ON_STATUS_MESSAGE, {
                    text: 'Command ' + this.name + ' : have no device',
                    type: 'error',
                    delay: 1000
                });
                return false;
            }
            return id;
        },
        reset: function () {
            this._lastSettings = {};
            if (this._loop) {
                clearTimeout(this._loop);
                this._loop = null;
            }
            delete this._runningDfd;
        },
        _solving: null,
        addDeferred: function (id) {
            if (!this._solving) {
                this._solving = {};
            }
            this._solving[id] = new Deferred();
            return this._solving[id];
        },
        getDeferred: function (id) {
            if (!this._solving) {
                this._solving = {};
            }
            return this._solving[id];
        },
        _resolve: function (string, settings,useDriverModule) {
            if(_.isNumber(string) || _.isBoolean(string)){
                return string;
            }
            var scope = this.scope;
            var value = string || this._get('send');
            var settings = settings || {};
            var flags = settings.flags || this.flags;
            var parse = !(flags & types.CIFLAG.DONT_PARSE);
            var isExpression = (flags & types.CIFLAG.EXPRESSION);
            var wait = (flags & types.CIFLAG.WAIT) ? true : false;

            if (flags & types.CIFLAG.TO_HEX) {
                value = utils.to_hex(value);
            }

            if (parse !== false) {
                value = utils.convertAllEscapes(value, "none");
            }

            settings = settings || this._lastSettings || {};
            var override = settings.override || this.override || {};
            var _overrides = (override && override.variables) ? override.variables : null;
            if (_overrides) {
                for (var prop in _overrides) {
                    if (_.isNumber(_overrides[prop])) {
                        _overrides[prop] = Math.round(_overrides[prop]);
                    }
                }
            }
            var res = "";
            var DriverModule = this.getDriverModule();
            if (DriverModule && DriverModule.resolveBefore && useDriverModule!==false) {
                value = DriverModule.resolveBefore(this, value);
            }

            if (/*(this.isScript(value) && parse!==false) || */isExpression && parse !== false) {
                res = scope.parseExpression(value, null, _overrides, null, null, null, override.args);
            } else {
                res = '' + value;
            }

            if (DriverModule && DriverModule.resolveAfter && useDriverModule!==false) {
                res = DriverModule.resolveAfter(this, res);
            }

            return res;
        },
        /***
         * Solves the command
         *
         * @param scope
         * @returns formatted send string
         */
        solve: function (scope, settings, isInterface, send) {
            var dfd = null;
            scope = scope || this.scope;
            settings = this._lastSettings = settings || this._lastSettings || {};
            if (settings && settings.override && settings.override.mixin) {
                utils.mixin(this.override, settings.override.mixin);
            }
            var value = send || this._get('send') || this.send;
            var parse = !(this.flags & types.CIFLAG.DONT_PARSE);
            var isExpression = (this.flags & types.CIFLAG.EXPRESSION);
            var wait = (this.flags & types.CIFLAG.WAIT) ? true : false;
            var id = utils.createUUID();

            if (this.flags & types.CIFLAG.TO_HEX) {
                value = utils.to_hex(value);
            }

            if (parse !== false) {
                value = utils.convertAllEscapes(value, "none");
            }

            if (!this.enabled && isInterface !== true) {
                this.reset();
                return;
            }

            //we're already running
            if (isInterface == true && this._loop) {
                this.reset();
            }
            if (wait !== true) {
                this.onRun(this, settings);
            } else {
                this.onRun(this, settings, {
                    timeout: false
                });
                dfd = this.addDeferred(id);
            }
            if (this.items && this.items.length > 0) {
                if (value && value.length > 0) {
                    var res = this._resolve(this.send, settings);
                    if (res && res.length > 0) {
                        if (!this.sendToDevice(res, settings)) {
                            this.onFailed(this, settings);
                        } else {
                            this.onSuccess(this, settings);
                        }
                    }
                }
                if (wait) {
                    return dfd;
                }
                var ret = [];
                for (var n = 0; n < this.items.length; n++) {
                    var block = this.items[n];
                    if (block.enabled) {
                        ret.push(block.solve(scope, settings));
                    }
                }
                return ret;
            } else if (value.length > 0) {
                var res = this._resolve(this.send, settings);
                if (res && res.length > 0) {
                    if (!this.sendToDevice(res, settings, null, null, id)) {
                        this.onFailed(this, settings);
                    }
                }
                if (wait !== true) {
                    this.onSuccess(this, settings);

                } else {
                    this._settings = settings;
                }
                if (isInterface) {
                    if (this.auto && this.getInterval() > 0) {
                        this.scope.loopBlock(this, settings);
                    }
                }
                return !wait ? [res] : dfd;
            }
            return false;
        },
        canAdd: function () {
            return [];
        },
        /**
         * Store function override
         * @param parent
         * @returns {boolean}
         */
        mayHaveChildren: function (parent) {
            return this.items != null && this.items.length > 0;
        },

        /**
         * Store function override
         * @param parent
         * @returns {Array}
         */
        getChildren: function (parent) {
            return this.items;
        },
        hasInlineEdits: true,
        toText: function (icon, label, detail, breakDetail) {
            var out = "";
            if (icon !== false) {
                out += "<span class='text-primary inline-icon'>" + this.getBlockIcon() + "</span>";
            }
            label !== false && (out += "" + this.makeEditable('name', 'bottom', 'text', 'Enter a unique name', 'inline') + "");
            breakDetail == true && (out += "<br/>");
            detail !== false && (out += ("<span class='text-muted small'> Send:<kbd class='text-warning'>" + this.makeEditable('send', 'bottom', 'text', 'Enter the string to send', 'inline')) + "</kbd></span>");
            if (icon !== false) {
                this.startup && (out += this.getIcon('fa-bell inline-icon text-warning', 'text-align:right;float:right;', ''));
                this.auto && this.getInterval() > 0 && (out += this.getIcon('fa-clock-o inline-icon text-warning', 'text-align:right;float:right', ''));
            }
            out = this.getDriverToText(out) || out;
            return out;
        },
        getInterval: function () {
            return parseInt(this.interval);
        },
        start: function () {
            if (this.startup && !this.auto) {
                this.solve(this.scope);
            } else if (this.auto && this.getInterval() > 0) {
                this.scope.loopBlock(this);
            }
        },
        /**
         * Return the driver's code module
         * @returns {module:xcf/driver/DriverBase|null}
         */
        getDriverModule: function () {
            var DriverModule = null;
            var instance = this.getInstance();
            if (instance) {
                DriverModule = instance.Module;
            } else {
                var driver = this.getScope().driver;
                if (driver && driver.Module) {
                    DriverModule = driver.Module;
                }
            }
            return DriverModule;
        },
        getDriverToText:function(text){
            var DriverModule = this.getDriverModule();
            if(DriverModule && DriverModule.toText){
                return DriverModule.toText(this,text);
            }
        },
        getDriverFields: function (fields) {
            var DriverModule = this.getDriverModule();
            var result = [];
            if (DriverModule && DriverModule.getFields) {
                result = DriverModule.getFields(this, fields) || [];
            }
            return result;
        },
        getFields: function () {
            var fields = this.inherited(arguments) || this.getDefaultFields();
            var thiz = this;
            fields.push(this.utils.createCI('name', 13, this.name, {
                group: 'General',
                title: 'Name',
                dst: 'name',
                order: 200
            }));
            fields.push(this.utils.createCI('startup', 0, this.startup, {
                group: 'General',
                title: 'Send on Startup',
                dst: 'startup',
                order: 199
            }));
            fields.push(this.utils.createCI('auto', 0, this.auto, {
                group: 'General',
                title: 'Auto Send',
                dst: 'auto',
                order: 198
            }));
            fields.push(this.utils.createCI('interval', 13, this.interval, {
                group: 'General',
                title: 'Interval',
                dst: 'interval',
                order: 197
            }));
            fields.push(this.utils.createCI('send', types.ECIType.EXPRESSION_EDITOR, this.send, {
                group: 'Send',
                title: 'Send',
                dst: 'send',
                widget: {
                    instantChanges: false,
                    allowACECache: true,
                    showBrowser: false,
                    showSaveButton: true,
                    style: 'height:inherit;',
                    editorOptions: {
                        showGutter: false,
                        autoFocus: false
                    },
                    aceOptions: {
                        hasEmmet: false,
                        hasLinking: false,
                        hasMultiDocs: false
                    },
                    item: this
                },
                delegate: {
                    runExpression: function (val, run, error) {
                        return thiz.scope.expressionModel.parse(thiz.scope, val, false, run, error);
                    }
                }
            }));
            fields.push(this.utils.createCI('flags', 5, this.flags, {
                group: 'General',
                title: 'Flags',
                dst: 'flags',
                data: [
                    {
                        value: 0x000001000,
                        label: 'Dont parse',
                        title: "Do not parse the string and use it as is"
                    },
                    {
                        value: 0x00000800,//2048
                        label: 'Expression',
                        title: 'Parse it as Javascript'
                    },
                    {
                        value: 0x000008000,
                        label: 'Wait',
                        title: "Wait for response"
                    }
                ],
                widget: {
                    hex: true
                }
            }));
            fields = fields.concat(this.getDriverFields(fields));
            return fields;
        },
        icon: 'fa-exclamation',
        getIconClass: function () {
            return 'el-icon-play-circle';
        },
        getBlockIcon: function () {
            return '<span class="' + this.icon + '"></span> ';
        },
        canEdit: function () {
            return true;
        },
        onChangeField: function (field, newValue, cis) {
            var interval = this.getInterval();
            if (field == 'auto') {
                if (newValue == true) {
                    interval > 0 && this.scope.loopBlock(this);
                } else {
                    if (this._loop) {
                        this.reset();
                    }
                }
            }
            if (field == 'enabled') {
                if (newValue == false) {
                    this.reset();
                } else {
                    if (interval) {
                        this.scope.loopBlock(this);
                    }
                }
            }
            if (field == 'interval') {
                if (interval > 0 && this.auto) {
                    this.scope.loopBlock(this);
                } else {
                    this.reset();
                }
            }
            this.inherited(arguments);
        },
        destroy: function () {
            this.reset();
        },
        pause: function () {
            var last = this.lastCommand || this._resolve(this.send, this._lastSettings);
            if (last!==null) {
                this.sendToDevice(last, this._lastSettings, false, true);
            }
        },
        stop: function (isDestroy) {
            if(isDestroy ==true){
                return;
            }
            this.onSuccess(this, {
                highlight: true
            });
            this.resolve('');
            var last = this.lastCommand || this._resolve(this.send, this._lastSettings);
            if (!_.isEmpty(last)) {
                this.sendToDevice(last, this._lastSettings, true, false);
            }
            delete this._runningDfd;
        }
    });
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

/** @module xcf/model/Device */
define('xcf/model/Device',[
    "xdojo/declare",
    "xide/data/Model",
    'xide/data/Source',
    'xide/types',
    'xide/utils',
    'xide/mixins/EventedMixin',
    "xcf/types/Types"
], function(dcl,Model,Source,types,utils,EventedMixin){
     /**
     *
     * Model for a device. It extends the base model class
     * and acts a source.
     *
     * @module xcf/model/Device
     * @extends {module:xide/mixins/EventedMixin}
     * @augments module:xide/data/Model
     * @augments module:xide/data/Source
     */
    return dcl('xcf.model.Device',[Model,Source,EventedMixin],{
        _userStopped:false,
        /**
         * @type {module:xide/types~DEVICE_STATE}
         * @link module:xide/types/DEVICE_STATE
         * @see module:xide/types/DEVICE_STATE
         */
        state:types.DEVICE_STATE.DISCONNECTED,
        /**
         * The driver instance
         * @private
         */
        driverInstance:null,
        /**
         * The block scope of the driver instance (if the device is connected and ready)
         * @private
         */
        blockScope:null,
        getParent:function(){
            return this.getStore().getSync(this.parentId);
        },
        isServerSide:function(){
            var driverOptions = this.getMetaValue(types.DEVICE_PROPERTY.CF_DEVICE_DRIVER_OPTIONS);
            return (1 << types.DRIVER_FLAGS.RUNS_ON_SERVER & driverOptions) ? true : false;
        },
        isServer:function(){
            var driverOptions = this.getMetaValue(types.DEVICE_PROPERTY.CF_DEVICE_DRIVER_OPTIONS);
            return (1 << types.DRIVER_FLAGS.SERVER & driverOptions) ? true : false;
        },
        setServer:function(isServer){
            var driverOptions = this.getMetaValue(types.DEVICE_PROPERTY.CF_DEVICE_DRIVER_OPTIONS);
            driverOptions.value = driverOptions.value | (1 << types.DRIVER_FLAGS.SERVER);
            this.setMetaValue(types.DEVICE_PROPERTY.CF_DEVICE_DRIVER_OPTIONS,driverOptions.value);
        },
        setServerSide:function(isServer){
            var driverOptions = this.getMetaValue(types.DEVICE_PROPERTY.CF_DEVICE_DRIVER_OPTIONS);
            driverOptions= driverOptions | (1 << types.DRIVER_FLAGS.RUNS_ON_SERVER);
            this.setMetaValue(types.DEVICE_PROPERTY.CF_DEVICE_DRIVER_OPTIONS,driverOptions);
        },
        isDebug:function(){
            var driverOptions = this.getMetaValue(types.DEVICE_PROPERTY.CF_DEVICE_DRIVER_OPTIONS);
            return (1 << types.DRIVER_FLAGS.DEBUG & driverOptions) ? true : false;
        },
        check:function(){
            if(this._startDfd && this._userStopped===true){
                this.reset();
            }
        },
        getStore:function(){
            return this._store;
        },
        getScope:function(){
            var store = this.getStore();
            return store ? store.scope : this.scope;
        },
        isEnabled:function(){
            return this.getMetaValue(types.DEVICE_PROPERTY.CF_DEVICE_ENABLED) === true;
        },
        setEnabled:function(enabled){
            return this.setMetaValue(types.DEVICE_PROPERTY.CF_DEVICE_ENABLED,enabled);
        },
        shouldReconnect:function(){
            if (this._userStopped) {
                return false;
            }
            return this.isEnabled();
        },
        reset:function(){
            delete this._startDfd;
            this._startDfd = null;
            delete this['blockScope'];
            this['blockScope'] = null;
            delete this.serverVariables;
            this.serverVariables = null;
            delete this['driverInstance'];
            this['driverInstance'] = null;
            clearTimeout(this.reconnectTimer);
            delete this.lastReconnectTime;
            delete this.reconnectRetry;
            delete this.isReconnecting;
            this.setState(types.DEVICE_STATE.DISCONNECTED);
        },
        /**
         * @constructor
         * @alias module:xcf/model/Device
         */
        constructor:function(){},
        /**
         * Returns the block scope of the a driver's instance
         * @returns {module:xblox/model/Scope}
         */
        getBlockScope:function(){
            return this.blockScope;
        },
        /**
         * Returns the driver instance
         * @returns {model:xcf/driver/DriverBase}
         */
        getDriverInstance:function(){
            return this.driverInstance;
        },
        /**
         * Return the driver model item
         * @returns {module:xcf/model/Driver|null}
         */
        getDriver:function(){
            var scope = this.getBlockScope();
            if(scope){
                return scope.driver;
            }
            return null;
        },
        /**
         * Return a value by field from the meta database
         * @param title
         * @returns {string|int|boolean|null}
         */
        getMetaValue: function (title) {
            return utils.getCIInputValueByName(this.user,title);
        },
        /**
         * Set a value in the meta database
         * @param title {string} The name of the CI
         * @returns {void|null}
         */
        setMetaValue: function (what,value,publish) {
            var item = this;
            var meta = this.user;
            var ci = utils.getCIByChainAndName(meta, 0, what);
            if(!ci){
                return null;
            }
            var oldValue = this.getMetaValue(what);
            utils.setCIValueByField(ci, 'value', value);

            this[what] = value;
            if(publish!==false){
                var eventArgs = {
                    owner: this.owner,
                    ci: ci,
                    newValue: value,
                    oldValue: oldValue
                };
                return this.publish(types.EVENTS.ON_CI_UPDATE, eventArgs);
            }
        },
        /**
         * Return the internal state icon
         * @param state
         * @returns {string|null}
         */
        getStateIcon:function(state ){
            state = state || this.state;
            switch (state) {
                case types.DEVICE_STATE.DISCONNECTED:
                {
                    return 'fa-unlink iconStatusOff'
                }
                case types.DEVICE_STATE.READY:
                case types.DEVICE_STATE.CONNECTED:
                {
                    return 'fa-link iconStatusOn'
                }
                case types.DEVICE_STATE.SYNCHRONIZING:
                case types.DEVICE_STATE.CONNECTING:
                {
                    return 'fa-spinner fa-spin'
                }
                case types.DEVICE_STATE.LOST_DEVICE_SERVER:
                {
                    return 'fa-spinner fa-spin'
                }
            }
            return 'fa-unlink iconStatusOff';
        },
        /**
         * Set the state
         * @param state
         * @param silent
         */
        setState:function(state,silent){
            if(state===this.state){
                return;
            }
            var oldState = this.state,
                icon = this.getStateIcon(state);
            this.state = state;
            this.set('iconClass',icon);
            this.set('state',state);
            this._emit(types.EVENTS.ON_DEVICE_STATE_CHANGED,{
                old:oldState,
                state:state,
                icon:icon,
                "public":true
            });
            this.refresh();
        }
    });
});

/** @module xcf/model/Driver */
define('xcf/model/Driver',[
    "dojo/_base/declare",
    "xide/data/Model",
    "xide/utils"
], function(dcl,Model,utils){
    /**
     *
     * Model for a driver. It extends the base model class
     * and acts a source.
     *
     * @module xcf/model/Driver
     * @augments module:xide/mixins/EventedMixin
     * @augments module:xide/data/Model
     * @augments module:xide/data/Source
     */
    return dcl(Model,{
        itemMetaPath:'user.meta',
        getStore:function(){
            return this._store;
        },
        getScope:function(){
            var store = this.getStore();
            return store ? store.scope : this.scope;
        },
        /**
         * Return a value by field from the meta database
         * @param title
         * @returns {string|int|boolean|null}
         */
        getMetaValue: function (title) {
            return utils.getCIInputValueByName(this.user,title);
        },
        /**
         * Set a value in the meta database
         * @param title {string} The name of the CI
         * @returns {void|null}
         */
        setMetaValue: function (what,value,publish) {

            var item = this;
            var meta = this.user;
            var ci = utils.getCIByChainAndName(meta, 0, what);
            if(!ci){
                return null;
            }
            var oldValue = this.getMetaValue(what);
            utils.setCIValueByField(ci, 'value', value);
            this[what] = value;
            if(publish!==false){
                return this.publish(types.EVENTS.ON_CI_UPDATE,{
                    owner: this.owner,
                    ci: ci,
                    newValue: value,
                    oldValue: oldValue
                });
            }
        },
        /**
         * Return the parent folder
         * @returns {module:xcf/model/Driver}
         */
        getParent:function(){
            return this._store.getSync(this.parentId);
        }
    });
});

define('xcf/model/ModelBase',[
    'dcl/dcl',
    "xblox/model/ModelBase"
], function(dcl,ModelBase){
    return dcl(ModelBase,{
        declaredClass:'xcf.model.ModelBase'
    });
});
/** @module xcf/model/Variable */
define('xcf/model/Variable',[
    'dcl/dcl',
    'xide/types',
    "xblox/model/variables/Variable"
], function(dcl,types,Variable){
    /**
     *
     * Model for a variable. It extends the base model class
     * and acts a source.
     *
     * @module xcf/model/Variable
     * @extends module:xblox/model/Variables/Variable
     * @augments module:xide/mixins/EventedMixin
     * @augments module:xide/data/Model
     * @augments module:xide/data/Source
     */
    return dcl(Variable,{

        /**
         * @private
         */
        declaredClass: "xcf.model.Variable",

        /**
         * @private
         */
        hasInlineEdits:true,
        /////////////////////////////////////////////////
        //
        //  On-Change related members
        //
        // 3.12.9.4. a group of options that define a task to be performed when the variable value is changed.
        //
        /////////////////////////////////////////////////
        /**
         * 3.12.9.4.1. on a change to the variable, any object (button, text field, etc.) which references
         * the variable should be evaluated and updated accordingly. If Cmd is selected this should deselect.
         * @private
         */
        gui:"off",
        /**
         * 3.12.9.4.2. on a change to the variable, any command which references the variable
         * should be executed. If GUI is selected this should deselect.
         * @private
         */
        cmd:"off",
        /**
         * 3.12.9.4.3. selecting this checkbox signifies that the variable value automatically gets saved
         * to an xml file whenever changed for recallability.  When active,
         * the Initialize field should show “saved value” and at startup the saved
         * value should be assigned to the variable from the Saved Values File.
         * @private
         */
        save:false,
        /**
         * @private
         */
        target:'None',
        /**
         * The name of the variable
         */
        name:'No Title',
        /**
         * The value of the variable
         */
        value:-1,
        /**
         * @private
         */
        observed:[
            'value',
            'initial',
            'name'
        ],

        solve:function(){

            var extra = "";

            if(this.group=='processVariables'){

                var _val = this.scope.getVariable("value");
                if(_val) {
                    _val = _val.value;
                    if(!this.isNumber(_val)){
                        _val = ''+_val;
                        _val = "'" + _val + "'";
                    }
                    extra = "var value = " + _val +";\n";
                }
            }
            var _result = this.scope.parseExpression(extra + this.getValue(),true);
            return _result;
        },
        /**
         * @private
         * @returns {boolean}
         */
        canEdit:function(){
            return true;
        },
        /**
         * @private
         * @returns {boolean}
         */
        canDisable:function(){
            return false;
        },
        /**
         * @private
         * @returns {*}
         */
        getFields:function(){

            var fields = this.getDefaultFields();

            fields.push(this.utils.createCI('title',13,this.name,{
                group:'General',
                title:'Name',
                dst:'name'
            }));


            var thiz=this,
                defaultArgs = {
                    allowACECache:true,
                    showBrowser:false,
                    showSaveButton:true,
                    editorOptions:{
                        showGutter:false,
                        autoFocus:false,
                        hasConsole:false
                    },
                    aceOptions:{
                        hasEmmet:false,
                        hasLinking:false,
                        hasMultiDocs:false
                    },
                    item:this
                };


            //this.types.ECIType.EXPRESSION_EDITOR
            fields.push(this.utils.createCI('value',this.types.ECIType.EXPRESSION,this.value,{
                group:'General',
                title:'Value',
                dst:'value',
                widget:defaultArgs,
                delegate:{
                    runExpression:function(val,run,error){
                        if(thiz.group=='processVariables'){
                            var _val = thiz.scope.getVariable("value");
                            var extra = "";
                            if(_val) {
                                _val = _val.value;
                                if(!thiz.isNumber(_val)){
                                    _val = ''+_val;
                                    _val = "'" + _val + "'";
                                }
                                extra = "var value = " + _val +";\n";
                            }
                        }
                        return thiz.scope.expressionModel.parse(thiz.scope,extra + val,false,run,error);
                    }
                }
            }));

            fields.push(this.utils.createCI('flags', 5, this.flags, {
                group: 'General',
                title: 'Flags',
                dst: 'flags',
                data: [
                    {
                        value: 0x000001000,
                        label: 'Dont parse',
                        title: "Do not parse the string and use it as is"
                    },
                    {
                        value: 0x00000800,//2048
                        label: 'Expression',
                        title: 'Parse it as Javascript'
                    }
                ],
                widget: {
                    hex: true
                }
            }));

/*
            //this.types.ECIType.EXPRESSION_EDITOR
            fields.push(this.utils.createCI('initial',this.types.ECIType.EXPRESSION,this.initial,{
                group:'General',
                title:'Initial',
                dst:'initial',
                widget:defaultArgs,
                delegate:{
                    runExpression:function(val,run,error){
                        if(thiz.group=='processVariables'){
                            var _val = thiz.scope.getVariable("value");
                            var extra = "";
                            if(_val) {
                                _val = _val.value;
                                if(!thiz.isNumber(_val)){
                                    _val = ''+_val;
                                    _val = "'" + _val + "'";
                                }
                                extra = "var value = " + _val +";\n";
                            }
                        }
                        return thiz.scope.expressionModel.parse(thiz.scope,extra + val,false,run,error);
                    }
                }
            }));
            */

            return fields;
        },
        onChangeField:function(field,newValue,cis) {
            //console.log('-change field ' + field);
            if(field==='value'){
                this.publish(types.EVENTS.ON_DRIVER_VARIABLE_CHANGED, {
                    item: this,
                    scope: this.scope,
                    save: false,
                    source: types.MESSAGE_SOURCE.GUI  //for prioritizing
                });
            }
        }
    });
});

define('xcf/factory/Blocks',[
    'xblox/factory/Blocks',
    "xcf/model/Command",
    "xblox/model/functions/CallBlock",
    "xblox/model/functions/StopBlock",
    "xblox/model/functions/PauseBlock",
    "xide/factory"
], function (Blocks,Command,CallBlock,StopBlock,PauseBlock,factory){
    if(Blocks) {
        Blocks._getCommandBlocks = function (scope, owner, target, group) {
            var items = [];
            items.push({
                name: 'Commands',
                iconClass: 'el-icon-random',
                items: [
                    {
                        name: 'Call Command',
                        owner: owner,
                        iconClass: 'el-icon-video',
                        proto: CallBlock,
                        target: target,
                        ctrArgs: {
                            scope: scope,
                            group: group,
                            condition: ""
                        }
                    },
                    {
                        name: 'Stop Command',
                        owner: owner,
                        iconClass: 'el-icon-video',
                        proto: StopBlock,
                        target: target,
                        ctrArgs: {
                            scope: scope,
                            group: group,
                            condition: ""
                        }
                    },
                    {
                        name: 'Pause Command',
                        owner: owner,
                        iconClass: 'el-icon-video',
                        proto: PauseBlock,
                        target: target,
                        ctrArgs: {
                            scope: scope,
                            group: group,
                            condition: ""
                        }
                    },
                    {
                        name: 'New Command',
                        owner: owner,
                        iconClass: 'el-icon-video',
                        proto: Command,
                        target: target,
                        ctrArgs: {
                            scope: scope,
                            group: group,
                            condition: "",
                            name: 'No-Title'
                        }
                    }
                ]
            });
            return items;
        };
        return Blocks;
    }else{
        return factory;
    }
});
define('requirejs-dplugins/has',["module"], function (module) {
	var cache = (module.config && module.config()) || {};
	var tokensRE = /[\?:]|[^:\?]+/g;

	function resolve(resource, has, isBuild) {
		var tokens = resource.match(tokensRE);
		var i = 0;
		var get = function (skip) {
			var term = tokens[i++];
			if (term === ":") {
				// empty string module name; therefore, no dependency
				return "";
			} else {
				// postfixed with a ? means it is a feature to branch on, the term is the name of the feature
				if (tokens[i++] === "?") {
					var hasResult = has(term);
					if (hasResult === undefined && isBuild) {
						return undefined;
					} else if (!skip && hasResult) {
						// matched the feature, get the first value from the options
						return get();
					} else {
						// did not match, get the second value, passing over the first
						get(true);
						return get(skip);
					}
				}
				// A module or empty string.
				// This allows to tell apart "undefined flag at build time" and "no module required" cases.
				return term || "";
			}
		};
		return get();
	}

	function forEachModule(tokens, callback) {
		for (var i = 0; i < tokens.length; i++) {
			if (tokens[i] !== ":" && tokens[i] !== "?" && tokens[i + 1] !== "?") {
				callback(tokens[i], i);
			}
		}
	}

	var has = function (name) {
		var global = (function () {
			return this;
		})();

		return typeof cache[name] === "function" ? (cache[name] = cache[name](global)) : cache[name]; // Boolean
	};

	has.cache = cache;

	has.add = function (name, test, now, force) {
		if (!has("builder")) {
			(typeof cache[name] === "undefined" || force) && (cache[name] = test);
			return now && has(name);
		}
	};

	has.normalize = function (resource, normalize) {
		var tokens = resource.match(tokensRE);

		forEachModule(tokens, function (module, index) {
			tokens[index] = normalize(module);
		});

		return tokens.join("");
	};

	has.load = function (resource, req, onLoad, config) {
		config = config || {};

		if (!resource) {
			onLoad();
			return;
		}

		var mid = resolve(resource, has, config.isBuild);

		if (mid) {
			req([mid], onLoad);
		} else {
			onLoad();
		}
	};

	has.addModules = function (pluginName, resource, addModules) {
		var modulesToInclude = [];

		var mid = resolve(resource, has, true);
		if (mid) {
			modulesToInclude.push(mid);
		} else if (typeof mid === "undefined") {
			// has expression cannot be resolved at build time so include all the modules just in case.
			var tokens = resource.match(tokensRE);
			forEachModule(tokens, function (module) {
				modulesToInclude.push(module);
			});
		}

		addModules(modulesToInclude);
	};

	return has;
});

(function () {

    var __isAMD = !!(typeof define === 'function' && define.amd),
        __isNode = (typeof exports === 'object'),
        __isWeb = !__isNode,
    //is that enough at some point?
        __isDojoRequire = !!(typeof require === 'function' && require.packs),
        __isRequireJS = !__isDojoRequire,
        __deliteHas = !!(typeof has === 'function' && has.addModule);

    define('xdojo/has',[
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



/** @module xcf/manager/BeanManager **/
define('xcf/manager/BeanManager',[
    'dcl/dcl',
    "xdojo/declare",
    "dojo/_base/lang",
    'xide/types',
    'xide/utils',
    'xide/manager/BeanManager',
    "dojo/Deferred",
    'xdojo/has!xcf-ui?xide/views/ActionDialog',
    'xdojo/has!xcf-ui?xide/views/CIActionDialog',
    'xdojo/has!xcf-ui?xide/views/CIGroupedSettingsView'
], function (dcl,declare,lang,types, utils, BeanManager,Deferred,registry,ActionDialog, CIActionDialog, CIGroupedSettingsView){
    /**
     * @class module:xcf/manager/BeanManager
     * @extends module:xide/manager/BeanManager
     */
    return dcl(BeanManager, {
        declaredClass:"xcf.manager.BeanManager",
        setStore:function(scope,store){
            var current = this.stores[scope];
            if(current){
                current.destroy();
                delete this.stores[scope];
            }

            this.stores[scope] = store;

            return store;
        },
        /**
         * 
         * @param bean
         * @returns {*}
         */
        getFile:function(bean){
            var dfd = new Deferred();
            var ctx = this.ctx;
            var fileManager = ctx.getFileManager();
            var fileStore = fileManager.getStore(bean.scope);
            fileStore.initRoot().then(function(){
                fileStore._loadPath('.',true).then(function(){
                    fileStore.getItem(bean.path,true).then(function (item) {
                        dfd.resolve(item);
                    });
                });
            });
            return dfd;
        },
        /**
         * Url generator for device/driver/[command|block|variable]
         *
         * @param device
         * @param driver
         * @param block
         * @param prefix
         * @returns {*}
         */
        toUrl:function(device, driver, block, prefix) {

            prefix = prefix || '';
            var pattern = prefix + "deviceScope={deviceScope}&device={deviceId}&driver={driverId}&driverScope={driverScope}&block={block}";
            var url = lang.replace(
                pattern,
                {
                    deviceId: device.id,
                    deviceScope: device.scope,
                    driverId: driver.id,
                    driverScope: driver.scope,
                    block: block.id
                });
            return url;
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Bean Editing
        //
        /////////////////////////////////////////////////////////////////////////////////////
        /***
         * openItemSettings creates a new settings view for a protocol
         * @param item
         * @returns {xide.views.CIGroupedSettingsView|null}
         */
        openItemSettings: function (item,device) {

            //1. sanity check
            var userData = item.user;


            if (!userData || !userData.inputs) {
                return null;
            }

            //2. check its not open already
            var viewId = this.getViewId(item);
            var view = registry.byId(viewId);
            try {
                if (view) {
                    if (view.parentContainer) {
                        view.parentContainer.selectChild(view);
                    }
                    return null;
                }
            } catch (e) {
                utils.destroy(view);
            }

            var docker = this.ctx.mainView.getDocker(),
                title = this.getMetaValue(item, this.itemMetaTitleField),
                devinfo = device ? this.ctx.getDeviceManager().toDeviceControlInfo(device) : null;

            var parent = docker.addTab(null, {
                title: (title || item.name) + '' + (device ? ':' + device.name + ':' + devinfo.host + ':' : ''),
                icon: this.beanIconClass
            });


            //@Todo:driver, store device temporarly in Commands CI
            var commandsCI = utils.getCIByChainAndName(userData, 0, types.DRIVER_PROPERTY.CF_DRIVER_COMMANDS);
            if(commandsCI){
                commandsCI.device = device;
            }

            if(item.blockScope && !item.blockScope.serviceObject){
                item.blockScope.serviceObject = this.serviceObject;

            }
            return utils.addWidget(CIGroupedSettingsView,{
                cis: userData.inputs,
                storeItem: item,
                iconClass: this.beanIconClass,
                id: viewId,
                delegate: this,
                storeDelegate: this,
                blockManager: this.ctx.getBlockManager(),
                options:{
                    groupOrder: {
                        'General': 1,
                        'Settings': 2,
                        'Visual':3
                    }
                }
            }, this, parent, true);

        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Bean Management
        //
        /////////////////////////////////////////////////////////////////////////////////////
        /**
         * Creates new group item dialog
         */
        newGroup: function () {

            var thiz = this,
                currentItem = this.getItem(),
                parent = currentItem ? currentItem.isDir === true ? currentItem.path : '' : '';

            var actionDialog = new CIActionDialog({
                title: 'New '  + this.groupType,
                delegate: {
                    onOk: function (dlg, data) {

                        var title = utils.getCIInputValueByName(data, 'Title');
                        var scope = utils.getCIInputValueByName(data, 'Scope');
                        var _final = parent + '/' + title;

                        thiz.createGroup(scope, _final, function (response) {

                            var newItem = thiz.createNewGroupItem(title, scope, parent);
                            thiz.store.putSync(newItem);
                            thiz.publish(types.EVENTS.ON_STORE_CHANGED, {
                                owner: thiz,
                                store: thiz.store,
                                action: types.NEW_DIRECTORY,
                                item: newItem
                            });
                        });
                    }
                },
                cis: [
                    utils.createCI('Title', 13, ''),
                    utils.createCI('Scope', 3, this.defaultScope, {
                        "options": [
                            {
                                label: 'System',
                                value: this.defaultScope
                            },
                            {
                                label: 'User',
                                value: this.userScope
                            },
                            {
                                label: 'App',
                                value: this.appScope
                            }
                        ]
                    })
                ]
            });
            actionDialog.startup();
            actionDialog.show();
        },
        onDeleteItem: function (item) {

            var isDir = utils.toBoolean(item.isDir) === true;
            //pick the right service function
            var removeFn = isDir ? 'removeGroup' : 'removeItem';
            var thiz = this;
            var actionDialog = new ActionDialog({
                title: 'Remove ' + this.beanName +   (isDir ? ' Group' : '') + ' ' + "\"" + item.name + "\"  ",
                style: 'max-width:400px',
                titleBarClass: 'text-danger',
                delegate: {
                    isRemoving: false,
                    onOk: function (dlg) {
                        thiz[removeFn](
                            utils.toString(item.scope),
                            utils.toString(item.path),
                            utils.toString(item.name),
                            function () {

                                thiz.onItemDeleted(item);

                                thiz.publish(types.EVENTS.ON_STORE_CHANGED, {
                                    owner: thiz,
                                    store: thiz.store,
                                    action: types.DELETE,
                                    item: item
                                });
                            });
                    }
                }
            });
            actionDialog.show();
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Bean protocol
        //
        /////////////////////////////////////////////////////////////////////////////////////
        hasItemActions: function () {
            return true;
        },
        onItemDeleted: function (item) {

            //delete subs
            this.store.removeSync(item.path);

            if(item == this.currentItem) {
                this.currentItem = null;
            }
            if (item) {
                var view = this.getView(item);
                if (view) {
                    utils.destroyWidget(view);
                }
            }
        },
        onItemSelected: function (item) {
            this.currentItem = item;
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  UI-Callbacks
        //
        /////////////////////////////////////////////////////////////////////////////////////
        onCIUpdate: function (evt) {
            if (evt['owner'] === this) {
                this.updateCI(evt.ci, evt.newValue, evt.oldValue, evt.storeItem);
            }
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Bean utils
        //
        /////////////////////////////////////////////////////////////////////////////////////
        createNewGroupItem: function (title, scope, parent) {
            return this.createItemStruct(title, scope, parent, title, true, this.groupType);
        },
        createNewItem: function (title, scope, parent) {
            return this.createItemStruct(title, scope, parent, parent + "/" + title, false, this.itemType);
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        // main
        //
        /////////////////////////////////////////////////////////////////////////////////////
        init: function () {
            this.subscribe(types.EVENTS.ON_CI_UPDATE);
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Server methods (PHP)
        //
        /////////////////////////////////////////////////////////////////////////////////////
        createItem: function (scope, path, title, meta,code) {
            return this.runDeferred(null, 'createItem', [scope, path, title, meta, code]);
        },
        /***
         * ls is enumerating all drivers in a given scope
         * @param scope{string}
         * @returns {Deferred}
         */
        ls: function (scope) {

            return this.runDeferred(null, 'ls', [scope]).then(function (data) {
                try {
                    this.rawData = data;
                    this.initStore(data);
                    this.publish(types.EVENTS.ON_STORE_CREATED, {
                        data: data,
                        owner: this,
                        store: this.store,
                        type: this.itemType
                    });
                }catch(e){
                    logError(e,'error ls');
                }
            }.bind(this));
        }
        
    });
});

define('xcf/manager/DeviceManager_Server',["dcl/dcl"], function(dcl){
    return dcl(null,{});
});


/** @module xcf/manager/DeviceManager_DeviceServer */
define('xcf/manager/DeviceManager_DeviceServer',[
    'dcl/dcl',
    'xide/encoding/MD5',
    'xide/types',
    'xide/utils',
    'xide/factory',
    'xdojo/has',
    'dojo/Deferred',
    'xide/mixins/ReloadMixin',
    'xide/mixins/EventedMixin',
    'require',
    'xcf/model/Variable',
    'xdojo/has!host-node?nxapp/utils/_console'
], function (dcl,MD5,
             types, utils, factory, has,
             Deferred,ReloadMixin,EventedMixin,require,Variable,_console) {

    var console = typeof window !== 'undefined' ? window.console : typeof global !== 'undefined' ? global.console : _console;
    if(_console){
        console = _console;
    }
    var isServer = has('host-node'),
        isIDE = has('xcf-ui'),
        runDrivers = true;

    if(!String.prototype.setBytes) {
        String.prototype.setBytes = function (bytes) {
            this.bytes = bytes;
        };
    }
    if(!String.prototype.getString) {
        String.prototype.getString = function () {
            return this.string;
        };
    }
    if(!String.prototype.setString) {
        String.prototype.setString = function (string) {
            this.string = string;
        };
    }

    if(!String.prototype.getBytes){
        String.prototype.getBytes = function() {
            if(this.bytes){
                return this.bytes;
            }else{
                return utils.stringToBuffer(this);
            }
        };
    }

    if(!String.prototype.hexString){
        String.prototype.hexString= function() {
            var bytes = this.getBytes();
            return utils.bufferToHexString(bytes);
        };
    }
    if(!Array.prototype.shuffle){
        Array.prototype.shuffle = function(){
            var counter = this.length, temp, index;

            // While there are elements in the array
            while (counter > 0) {
                // Pick a random index
                index = (Math.random() * counter--) | 0;

                // And swap the last element with it
                temp = this[counter];
                this[counter] = this[index];
                this[index] = temp;
            }
        };
    }

    /*
    var console = typeof window !== 'undefined' ? window.console : console;
    if(_console && _console.error && _console.warn){
        //console = _console;
    }
    */

    //debug mqtt activity
    var _debugMQTT = false;
    //debug device - server messages
    var debug = false;
    // debug device server connectivity
    var debugDevice = false;
    var debugStrangers = true;
    var debugConnect = false;
    var debugServerCommands = false;
    var debugCreateInstance = false;
    var debugServerMessages = false;
    var debugByteMessages = false;

    if(typeof sctx !=='undefined' && sctx){


        var id = utils.createUUID();
        var rm = sctx.getResourceManager();


        var application = sctx.getApplication();

        return;

        console.clear();

        application.createExportWizard = function () {
            var thiz = this,
                selectView = null,
                selectItemsView = null,
                selectedItems = [],
                selectedItem = null,
                ctx = thiz.ctx,
                deviceManager = ctx.getDeviceManager(),
                driver = thiz.getSelectedItem(),
                protocolMgr = thiz.ctx.getProtocolManager(),
                store = protocolMgr.getStore();



            return;
            var wizardStruct = Wizards.createWizard('Select Protocol', false, {});

            this._lastWizard = wizardStruct;
            var wizard = wizardStruct.wizard;
            var dialog = wizardStruct.dialog;
            var done = function () {
                wizard.destroy();
                dialog.destroy();
                thiz.importProtocol(selectedItem, selectedItems, driver);
            };
            dialog.show().then(function () {

                /**
                 * First protocol view, select item
                 */
                selectView = utils.addWidget(ProtocolTreeView, {
                    title: 'Protocols',
                    store: protocolMgr.getStore(),
                    delegate: protocolMgr,
                    beanContextName: '3',// thiz.ctx.mainView.beanContextName
                    _doneFunction: function () {
                        return false;
                    },
                    passFunction: function () {
                        return true;
                    },
                    canGoBack: true,
                    gridParams: {
                        showHeader: true
                    },
                    editItem: function () {

                        if (!this.isGroup(selectedItem)) {
                            wizard._forward();
                        }
                    }

                }, protocolMgr, wizard, true, null, [WizardPaneBase]).
                _on(types.EVENTS.ON_ITEM_SELECTED, function (evt) {
                    selectedItem = evt.item;
                    wizard.adjustWizardButton('next', selectView.isGroup(evt.item));

                });


                /**
                 * Select commands/variables view
                 */
                /**
                 * First protocol view, select item
                 */
                selectItemsView = utils.addWidget(ProtocolTreeView, {
                    title: 'Protocols',
                    store: protocolMgr.getStore(),
                    delegate: protocolMgr,
                    beanContextName: '3',// thiz.ctx.mainView.beanContextName
                    doneFunction: function () {
                        done();
                        return true;
                    },
                    passFunction: function () {
                        //not used
                        return true;
                    },
                    canGoBack: true,
                    editItem: function () {

                    },
                    getRootFilter: function () {
                        if (selectedItem) {
                            return {
                                parentId: selectedItem.path
                            };
                        } else {
                            return {
                                parentId: ''
                            };
                        }
                    },
                    canSelect: function (item) {
                        if (item.virtual === true && item.isDir === false) {
                            return true;
                        }
                        return false;
                    }
                }, protocolMgr, wizard, true, null, [WizardPaneBase], null, {
                    getColumns: function () {

                        var _res = this.inherited(arguments);
                        _res.push({
                            label: "Value",
                            field: "value",
                            sortable: false,
                            _formatter: function (name, item) {

                                if (!thiz.isGroup(item) && item['user']) {
                                    var meta = item['user'].meta;
                                    var _in = meta ? utils.getCIInputValueByName(meta, types.PROTOCOL_PROPERTY.CF_PROTOCOL_TITLE) : null;
                                    if (meta) {
                                        return '<span class="grid-icon ' + 'fa-exchange' + '"></span>' + _in;
                                    } else {
                                        return item.name;
                                    }
                                    return _in;
                                } else {
                                    return item.name;
                                }
                            }
                        });
                        return _res;
                    }
                }).
                _on(types.EVENTS.ON_ITEM_SELECTED, function (evt) {
                    selectedItems = selectItemsView.getSelection();
                    wizard.adjustWizardButton('done', selectedItems.length === 0);

                });


                wizard.onNext = function () {
                    dialog.set('title', 'Select Commands & Variables');
                    selectItemsView.grid.set('collection', store.filter(selectItemsView.getRootFilter()));
                    selectItemsView.grid.refresh();
                };
            });
        };

        console.log('root : '+rm.getVariable('ROOT'));
        console.log('user : '+rm.getVariable('USER_DIRECTORY'));
        console.log('system : '+rm.getVariable('SYSTEM'));


        var ROOT = rm.getVariable('ROOT');
        var USER = rm.getVariable('USER_DIRECTORY');
        var SYSTEM = rm.getVariable('SYSTEM');
        var DIST = ROOT+'/server/nodejs/dist/';
        var TARGET = ROOT+'/claycenter/';
        var linux32 = 'false';
        var linux64 = 'true';
        var osx = 'false';
        var arm = 'false';
        var windows = 'false';

        var nginxOptions = {
            port:10002
        };

        var options = {
            linux32:linux32,
            linux64:linux64,
            osx:osx,
            arm:arm,
            windows:windows,
            root:ROOT,
            data:SYSTEM,
            user:USER + '/claycenter',
            dist:DIST,
            target:TARGET,
            nginxOptions:nginxOptions
        };

        var delegate = {
            onError:function(e){
                console.error('have error : ',e);
            },
            onProgress:function(e){
                console.error('have progress: ',e);
            },
            onFinish:function(e){
                console.error('have finish: ',e);
            }
        };
        sctx.getDeviceManager().runClass('nxapp/manager/ExportManager',{
            options:options
        },delegate);
    }

    /***
     *
     * 1. startDevice
     *      ->createDriverInstance
     *          -> sendManagerCommand(CREATE_CONNECTION, cInfo);
     *              ->onDeviceConnected
     *                  serverVariables? ->
     *                      getDeviceServerVariables ->onSetDeviceServerVariables
     *
     *
     */

    /**
     *
     * @class module:xcf.manager.DeviceManager_DeviceServer
     * @augments module:xcf/manager/DeviceManager
     * @augments module:xide/mixins/EventedMixin
     */
    return dcl(null,{
        declaredClass:"xcf.manager.DeviceManager_DeviceServer",
        running:null,
        /**
         * Callback when we are connected to a device.
         * We use this to fire all looping blocks
         * @param driverInstance {module:xcf/driver/DriverBase} the instance of the driver
         * @param deviceStoreItem {module:xcf/model/Device} the device model item
         * @param driver {module:xcf/model/Driver} the driver model item
         */
        onDeviceStarted: function (driverInstance, deviceStoreItem, driver) {
            //debugConnect = true;
            if (!driverInstance || !deviceStoreItem || !driver) {
                debugConnect && console.log('onDeviceStarted failed, invalid params');
                return;
            }

            var info = this.toDeviceControlInfo(deviceStoreItem),
                serverSide = info.serverSide,
                _isServer = info.isServer;

            debugConnect && console.log('onDeviceStarted ' + info.toString(),driverInstance.id );
            /**
             * Post work :
             * 1. Start all commands with the 'startup' flag!
             * 2. Todo : update last variables from Atomize server
             * 3. Establish long polling
             */

                //1. fire startup blocks
            var blockScope = driverInstance.blockScope;

            if(((isServer && (serverSide || _isServer)) || (!serverSide && !_isServer))) {
                blockScope.start();
            }
            //important to set this before publishing the connected event, otherwise it runs an infity loop
            driverInstance.__didStartBlocks = true;

            this.publish(types.EVENTS.ON_DEVICE_DRIVER_INSTANCE_READY, {
                device: deviceStoreItem,
                instance: driverInstance,
                driver: driver,
                blockScope: blockScope
            });
            this.publish(types.EVENTS.ON_DEVICE_CONNECTED, {
                device: info,
                instance: driverInstance,
                driver: driver,
                blockScope: blockScope
            });
            this.ctx.getDriverManager().addDeviceInstance(deviceStoreItem,driver);
        },
        /***
         *
         * @param driverInstance
         * @param data
         */
        runClass: function (_class,args,delegate) {
            this.checkDeviceServerConnection();
            if(this.deviceServerClient) {
                var id = utils.createUUID();
                args.id = id;
                var dataOut = {
                    "class":_class,
                    args: args,
                    manager_command: types.SOCKET_SERVER_COMMANDS.RUN_CLASS
                };
                !this.running && (this.running = {});
                this.running[id] = {
                    "class":_class,
                    args: args,
                    delegate:delegate
                };
                this.deviceServerClient.emit(null, dataOut, types.SOCKET_SERVER_COMMANDS.RUN_CLASS);
            }else{
                this.onHaveNoDeviceServer();
            }
        },
        /**
         * Starts a device with a device store item
         * @param device
         * @param force
         * @param conn {module:nxapp/model/ClientConnection}
         */
        startDevice: function (device,force,conn) {
            var thiz = this;
            if(!device){
                console.error('start device invalid item');
                return null;
            }
            this.checkDeviceServerConnection();
            device.check();
            debugDevice = true;
            var dfd = new Deferred();
            if(device._startDfd && !device._startDfd.isResolved()){
                if(!isServer) {
                    debugDevice && console.error('already starting ' + device.toString());
                    return device._startDfd;
                }
            }else{
                !device.driverInstance && device.reset();//fresh
            }

            force===true && device.setMetaValue(types.DEVICE_PROPERTY.CF_DEVICE_ENABLED,true,false);
            var enabled = device.getMetaValue(types.DEVICE_PROPERTY.CF_DEVICE_ENABLED);
            if(!enabled && force!==true && !isServer){
                debugDevice && console.error('---abort start device : device is not enabled!' + device.toString());
                this.publish(types.EVENTS.ON_STATUS_MESSAGE,{
                    text:'Can`t start device because its not enabled! ' + device.toString(),
                    type:'error'
                });
                setTimeout(function(){
                    dfd.reject();
                },10);
                return dfd;
            }

            var cInfo = this.toDeviceControlInfo(device);
            if(!cInfo){
                console.error('invalid client info, assuming no driver found');
                dfd.reject('invalid client info, assuming no driver found');
                return dfd;
            }

            if (!cInfo) {
                console.error('couldnt start device, invalid control info '+ cInfo.toString());
                dfd.reject();
                return dfd;
            }

            var hash = cInfo.hash;
            var state = device.state;
            var wasLost = state===types.DEVICE_STATE.LOST_DEVICE_SERVER;
            if (this.deviceInstances[hash] && wasLost!==true) {
                debugDevice && console.warn('device already started : ' + cInfo.toString());
                dfd.resolve(this.deviceInstances[hash]);
                return dfd;
            }

            function buildMQTTParams(cInfo,driverInstance,deviceItem,driverItem){
                if(!driverInstance){
                    console.warn('buildMQTTParams:have no driver instance');
                }
                return {
                    driverScopeId:driverInstance && driverInstance.blockScope ? driverInstance.blockScope.id : 'have no driver instance',
                    driverId:driverInstance ? driverInstance.driver.id : 'have no driver id',
                    deviceId:device.path
                };
            }

            if(wasLost && this.deviceInstances[hash]){
                thiz.publish(types.EVENTS.ON_STATUS_MESSAGE, {
                    text: 'Trying to re-connect to ' + cInfo.toString(),
                    type: 'info'
                });
                thiz.sendManagerCommand(types.SOCKET_SERVER_COMMANDS.CREATE_CONNECTION, cInfo);
                device.setState(types.DEVICE_STATE.CONNECTING);
                dfd.resolve(this.deviceInstances[hash]);
                return dfd;

            }

            device.setState(types.DEVICE_STATE.CONNECTING);
            device._userStopped=null;
            device._startDfd = dfd;
            var baseDriverPrefix = this.driverScopes['system_drivers'],
                baseDriverRequire = baseDriverPrefix + 'DriverBase';

            try {
                require([baseDriverRequire], function (baseDriver) {
                    baseDriver.prototype.declaredClass = baseDriverRequire;
                    var sub = thiz.createDriverInstance(cInfo, baseDriver, device).then(function (driverInstance) {
                        if(!driverInstance.id){
                            driverInstance.id = utils.createUUID();
                        }
                        debugCreateInstance && console.info('created driver instance for '+ cInfo.toString());                        
                        cInfo.mqtt = buildMQTTParams(cInfo, driverInstance, device);
                        thiz.publish(types.EVENTS.ON_STATUS_MESSAGE, {
                            text: 'Trying to connect to ' + cInfo.toString(),
                            type: 'info'
                        });

                        if(!isServer) {
                            if(!device.isServerSide() && !device.isServer()) {
                                thiz.sendManagerCommand(types.SOCKET_SERVER_COMMANDS.CREATE_CONNECTION, cInfo);
                            }else{
                                thiz.sendManagerCommand(types.SOCKET_SERVER_COMMANDS.START_DEVICE, cInfo);
                            }
                        }else{
                            //we're already starting
                            if(device._startDfd && !device._startDfd.isResolved()){
                                thiz.sendManagerCommand(types.SOCKET_SERVER_COMMANDS.CREATE_CONNECTION, cInfo);
                            }else{
                                thiz.sendManagerCommand(types.SOCKET_SERVER_COMMANDS.START_DEVICE, cInfo);
                            }
                        }
                        dfd.resolve(thiz.deviceInstances[hash]);
                        delete cInfo.mqtt;
                    });
                    sub.then(function(){

                    },function(e){
                        debugCreateInstance && console.error('DeviceManager_DeviceServer::createDriverInstance error ',e);
                        dfd.resolve(null);
                    });
                },function(e){
                    console.error(e);
                });
            }catch(e){
                logError(e,'DeviceManager::startDevice: requiring base driver at ' + baseDriverRequire + ' failed! Base Driver - Prefix : ' + baseDriverPrefix);
            }

            return dfd;
        },
        /**
         * Creates a driver instance per device
         * @param deviceInfo {module:xide/types~DeviceInfo} The device info
         * @param driverBase {module:xcf/driver/DriverBase} The driver base class
         * @param device {module:xcf/model/Device} The device model item
         */
        createDriverInstance: function (deviceInfo, driverBase, device) {
            var hash = deviceInfo.hash,
                driverPrefix = this.driverScopes[deviceInfo.driverScope],
                isRequireJS = !require.cache,
                packageUrl = require.toUrl(driverPrefix);

            packageUrl = utils.removeURLParameter(packageUrl,'bust');

            if(isRequireJS){
                packageUrl = packageUrl.replace('/.js','/');
            }

            var requirePath = decodeURIComponent(packageUrl) + deviceInfo.driver;
            requirePath = requirePath.replace('', '').trim();

            var thiz = this,
                ctx = thiz.ctx,
                meta = device['user'],
                driverId = utils.getCIInputValueByName(meta, types.DEVICE_PROPERTY.CF_DEVICE_DRIVER),
                driverManager = ctx.getDriverManager(),
                driver = driverManager.getDriverById(driverId),
                dfd = new Deferred(),
                enabled = device.getMetaValue(types.DEVICE_PROPERTY.CF_DEVICE_ENABLED),
                serverSide = deviceInfo.serverSide;

            debugCreateInstance && console.log('create driver instance : ' + device.path +":"+device.scope + ' from ' + requirePath,{
                driver:driver,
                device:device,
                deviceInfo:deviceInfo
            });

            if(device.isEnabled()===false && !isServer){
                debugConnect && console.warn('device not enabled, abort ' + deviceInfo.toString());
                setTimeout(function(){
                    dfd.reject('device not enabled, abort ' + deviceInfo.toString());
                });
                return dfd;
            }

            if(isServer && (!device.isServerSide() && !device.isServer() && !deviceInfo.isServer && !deviceInfo.serverSide)  ){
                dfd.reject('DeviceManager_DeviceServer: wont create driver instance! I am server and device isnt server side : ' + deviceInfo.title);
                return dfd;
            }


            debugCreateInstance && console.info('------create driver instance with DriverBase at '+requirePath + ' with driver prefix : ' + driverPrefix,this.driverScopes);

            try {
                driverManager.getDriverModule(driver).then(function(driverModule){
                    var baseClass = driverBase;
                    var driverProto = dcl([baseClass, EventedMixin.dcl, ReloadMixin.dcl,driverModule],{});
                    var driverInstance = new driverProto();
                    driverInstance.declaredClass = requirePath;
                    driverInstance.options = deviceInfo;
                    driverInstance.baseClass = baseClass.prototype.declaredClass;
                    driverInstance.modulePath = utils.replaceAll('//', '/', driverPrefix + deviceInfo.driver).replace('.js','');
                    driverInstance.delegate = thiz;
                    driverInstance.driver = driver;
                    driverInstance.serverSide = deviceInfo.serverSide;
                    driverInstance.utils = utils;
                    driverInstance.types = types;
                    driverInstance.device = device;
                    driverInstance.Module = driverModule;
                    driverInstance.id = utils.createUUID();
                    driverInstance.getDevice = function(){
                        return this.device;
                    };
                    driverInstance.getDeviceInfo = function(){
                        return this.getDevice().info;
                    };
                    var meta = driver['user'];
                    var commandsCI = utils.getCIByChainAndName(meta, 0, types.DRIVER_PROPERTY.CF_DRIVER_COMMANDS);
                    if (commandsCI && commandsCI['params']) {
                        driverInstance.sendSettings = utils.getJson(commandsCI['params']);
                    }

                    var responseCI = utils.getCIByChainAndName(meta, 0, types.DRIVER_PROPERTY.CF_DRIVER_RESPONSES);
                    if (responseCI && responseCI['params']) {
                        driverInstance.responseSettings = utils.getJson(responseCI['params']);
                    }
                    try {
                        driverInstance.start();
                        driverInstance.initReload();
                    } catch (e) {
                        console.error('crash in driver instance startup! ' + device.toString());
                        logError(e,'crash in driver instance startup!');
                    }

                    thiz.deviceInstances[hash] = driverInstance;

                    //console.error('created driver instance ' + hash);


                    // Build an id basing on : driver id + driver path
                    // "235eb680-cb87-11e3-9c1a-....ab5_Marantz/Marantz.20.meta.json"
                    //var scopeId = driverId + '_' + hash + '_' + device.path;
                    if (!driver.blox || !driver.blox.blocks) {
                        debugConnect && console.warn('Attention : INVALID driver, have no blocks', deviceInfo.toString());
                        driver.blox = {
                            blocks: []
                        };
                    }
                    /*
                    if (isServer && driver.blockPath) {
                        utils.getJson(utils.readFile(driver.blockPath));
                        driver.blox = utils.getJson(utils.readFile(driver.blockPath));
                    }

                    var scope = ctx.getBlockManager().createScope({
                        id: scopeId,
                        device: device,
                        driver: driver,
                        instance: driverInstance,
                        serviceObject: thiz.serviceObject,
                        ctx: ctx,
                        serverSide: serverSide,
                        getContext: function () {
                            return this.instance;
                        }
                    }, utils.clone(driver.blox.blocks),function(error){
                        if(error){
                            console.error(error  + ' : in '+driver.name + ' Resave Driver! in scope id ' +scopeId);
                        }
                    });

                    //important:
                    driverInstance.blockScope = scope;
                    device.blockScope = scope;
                    */
                    device.driverInstance = driverInstance;
                    thiz.getDriverInstance(deviceInfo, true);//triggers to resolve settings
                    //add variable && command functions:
                    //isIDE && thiz.completeDriverInstance(driver, driverInstance, device);
                    driverInstance._id= utils.createUUID();
                    dfd.resolve(driverInstance);
                    return driverInstance;

                });
            }catch(e){
                console.error('DeviceManager::createDriverInstance:: requiring base driver at ' + requirePath + ' failed ' +e.message,utils.inspect(deviceInfo));
            }
            return dfd;
        },
        createDriverInstance_bak: function (deviceInfo, driverBase, device) {
            var hash = deviceInfo.hash,
                driverPrefix = this.driverScopes[deviceInfo.driverScope],
                isRequireJS = !require.cache,
                packageUrl = require.toUrl(driverPrefix);

            packageUrl = utils.removeURLParameter(packageUrl,'bust');

            if(isRequireJS){
                packageUrl = packageUrl.replace('/.js','/');
            }

            var requirePath = decodeURIComponent(packageUrl) + deviceInfo.driver;
            requirePath = requirePath.replace('', '').trim();

            var thiz = this,
                ctx = thiz.ctx,
                meta = device['user'],
                driverId = utils.getCIInputValueByName(meta, types.DEVICE_PROPERTY.CF_DEVICE_DRIVER),
                driverManager = ctx.getDriverManager(),
                driver = driverManager.getDriverById(driverId),
                dfd = new Deferred(),
                enabled = device.getMetaValue(types.DEVICE_PROPERTY.CF_DEVICE_ENABLED),
                serverSide = deviceInfo.serverSide;

            debugCreateInstance && console.log('create driver instance : ' + device.path +":"+device.scope + ' from ' + requirePath,{
                driver:driver,
                device:device,
                deviceInfo:deviceInfo
            });

            if(device.isEnabled()===false){
                debugConnect && console.warn('device not enabled, abort ' + deviceInfo.toString());
                setTimeout(function(){
                    dfd.reject();
                });
                return dfd;
            }

            if(isServer && !device.isServerSide()){
                dfd.reject('DeviceManager_DeviceServer: wont create driver instance! I am server and device isnt server side : ' + deviceInfo.title);
                return dfd;
            }
            debugCreateInstance && console.info('------create driver instance with DriverBase at '+requirePath + ' with driver prefix : ' + driverPrefix,this.driverScopes);
            try {
                require([requirePath], function (driverProtoInstance) {

                    var baseClass = driverBase;
                    var driverProto = dcl([baseClass, EventedMixin.dcl, ReloadMixin.dcl,driverProtoInstance],{});
                    var driverInstance = new driverProto();
                    driverInstance.declaredClass = requirePath;
                    driverInstance.options = deviceInfo;
                    driverInstance.baseClass = baseClass.prototype.declaredClass;
                    //driverInstance.modulePath = utils.replaceAll('//', '/', requirePath);
                    driverInstance.modulePath = utils.replaceAll('//', '/', driverPrefix + deviceInfo.driver).replace('.js','');
                    driverInstance.delegate = thiz;
                    driverInstance.driver = driver;
                    driverInstance.serverSide = deviceInfo.serverSide;
                    driverInstance.utils = utils;
                    driverInstance.types = types;
                    driverInstance.device = device;
                    driverInstance.Module = driverProtoInstance;

                    driverInstance.getDevice = function(){
                        return this.device;
                    };
                    driverInstance.getDeviceInfo = function(){
                        return this.getDevice().info;
                    };

                    var meta = driver['user'];

                    var commandsCI = utils.getCIByChainAndName(meta, 0, types.DRIVER_PROPERTY.CF_DRIVER_COMMANDS);
                    if (commandsCI && commandsCI['params']) {
                        driverInstance.sendSettings = utils.getJson(commandsCI['params']);
                    }

                    var responseCI = utils.getCIByChainAndName(meta, 0, types.DRIVER_PROPERTY.CF_DRIVER_RESPONSES);
                    if (responseCI && responseCI['params']) {
                        driverInstance.responseSettings = utils.getJson(responseCI['params']);
                    }
                    try {
                        driverInstance.start();
                        driverInstance.initReload();
                    } catch (e) {
                        console.error('crash in driver instance startup! ' + device.toString());
                        logError(e,'crash in driver instance startup!');
                    }

                    thiz.deviceInstances[hash] = driverInstance;

                    // Build an id basing on : driver id + driver path
                    // "235eb680-cb87-11e3-9c1a-....ab5_Marantz/Marantz.20.meta.json"
                    var scopeId = driverId + '_' + hash + '_' + device.path;
                    if (!driver.blox || !driver.blox.blocks) {
                        debugConnect && console.warn('Attention : INVALID driver, have no blocks', deviceInfo.toString());
                        driver.blox = {
                            blocks: []
                        };
                    }

                    /*
                     if (isServer && driver.blockPath) {
                     utils.getJson(utils.readFile(driver.blockPath));
                     driver.blox = utils.getJson(utils.readFile(driver.blockPath));
                     }

                     var scope = ctx.getBlockManager().createScope({
                     id: scopeId,
                     device: device,
                     driver: driver,
                     instance: driverInstance,
                     serviceObject: thiz.serviceObject,
                     ctx: ctx,
                     serverSide: serverSide,
                     getContext: function () {
                     return this.instance;
                     }
                     }, utils.clone(driver.blox.blocks),function(error){
                     if(error){
                     console.error(error  + ' : in '+driver.name + ' Resave Driver! in scope id ' +scopeId);
                     }
                     });

                     //important:
                     driverInstance.blockScope = scope;
                     device.blockScope = scope;
                     */
                    device.driverInstance = driverInstance;

                    thiz.getDriverInstance(deviceInfo, true);//triggers to resolve settings
                    //add variable && command functions:
                    //isIDE && thiz.completeDriverInstance(driver, driverInstance, device);
                    driverInstance._id= utils.createUUID();
                    dfd.resolve(driverInstance);
                    return driverInstance;

                });
            }catch(e){
                console.error('DeviceManager::createDriverInstance:: requiring base driver at ' + requirePath + ' failed ' +e.message,utils.inspect(deviceInfo));
            }
            return dfd;
        },
        /**
         * Callback when server returns the variables of a device
         * @param data.device {module:xide/types~DeviceInfo}
         * @param data
         */
        onSetDeviceServerVariables:function(data){
            //utils.stack();
            //console.log('onSetDeviceServerVariables :' + _.keys(this.deviceInstances).length);
            var instance = this.getDriverInstance(data.device, true);
            var device = this.getDeviceStoreItem(data.device);
            if(!device){
                debugDevice && console.log('did set device server variables failed, have no device',data);
                return;
            }

            if(!instance.blockScope) {
                var deviceInfo = device.info;
                var hash = deviceInfo.hash;
                var driver = instance.driver;
                var driverId = deviceInfo.driverId;
                var ctx = this.getContext();
                var serverSide = deviceInfo.serverSide;
                var scopeId = driverId + '_' + hash + '_' + device.path;
                if (!driver.blox || !driver.blox.blocks) {
                    debugConnect && console.warn('Attention : INVALID driver, have no blocks', deviceInfo.toString());
                    driver.blox = {
                        blocks: []
                    };
                }
                if (isServer && driver.blockPath) {
                    utils.getJson(utils.readFile(driver.blockPath));
                    driver.blox = utils.getJson(utils.readFile(driver.blockPath));
                }

                var scope = ctx.getBlockManager().createScope({
                    id: scopeId,
                    device: device,
                    driver: driver,
                    instance: instance,
                    serviceObject: this.serviceObject,
                    ctx: ctx,
                    serverSide: serverSide,
                    getContext: function () {
                        return this.instance;
                    }
                }, utils.clone(driver.blox.blocks), function (error) {
                    if (error) {
                        console.error(error + ' : in ' + driver.name + ' Resave Driver! in scope id ' + scopeId);
                    }
                });
                //important:
                instance.blockScope = scope;
                device.blockScope = scope;
                isIDE && this.completeDriverInstance(driver, instance, device);
            }

            if(instance){
                var variables = data.variables,
                    _scope = instance.blockScope;
                device.serverVariables = data.variables;
                _.each(variables,function(variable){
                    var _var = _scope.getVariable(variable.name);
                    if(_var){
                        _var.value = variable.value;
                    }
                });
            }

            this.onDeviceConnected(data,false);
            device.setState(types.DEVICE_STATE.SYNCHRONIZING);
            device.setState(types.DEVICE_STATE.READY);
            device._startDfd && device._startDfd.resolve(device.driverInstance);
            delete device._userStopped;
            delete device.lastError;
            delete device._startDfd;
            device._startDfd = null;
        },
        /**
         *
         * @param device {module:xcf/model/Device}
         * @param driverInstance
         */
        getDeviceServerVariables:function(device,driverInstance){
            //console.log('getDeviceServerVariables' + _.keys(this.deviceInstances).length);
            var driver = driverInstance.driver;
            if (!driver.blox || !driver.blox.blocks) {
                debugConnect && console.warn('Attention : INVALID driver, have no blocks', device.toString());
                driver.blox = {
                    blocks: []
                };
            }
            var blocks = driver.blox.blocks;

            var basicVariables = [];

            _.each(blocks,function(block){
                block.group === types.BLOCK_GROUPS.CF_DRIVER_BASIC_VARIABLES && basicVariables.push(block);
            });

            /*
             var basicVariables = _.find(blocks,{
             group:types.BLOCK_GROUPS.CF_DRIVER_BASIC_VARIABLES
             }) || [];
             */

            //basicVariables = _.isObject(basicVariables) ? [basicVariables] : basicVariables;


            /*
             var scope = driverInstance.blockScope;
             if(!scope){
             console.error(' have no block scope');
             return;
             }

             console.log('variables: ');
             var basicVariables = scope.getVariables({
             group: types.BLOCK_GROUPS.CF_DRIVER_BASIC_VARIABLES
             });
             */
            var out = [];
            for (var i = 0; i < basicVariables.length; i++) {
                out.push({
                    name:basicVariables[i].name,
                    value:basicVariables[i].value,
                    initial:basicVariables[i].value
                });
            }

            device.setState(types.DEVICE_STATE.SYNCHRONIZING);/*
            if(isServer && device.isServerSide()){
                console.error('abort');
            }else {*/
                this.sendManagerCommand(types.SOCKET_SERVER_COMMANDS.GET_DEVICE_VARIABLES, {
                    device: this.toDeviceControlInfo(device),
                    variables: out
                });
  //          }
        },
        /**
         *
         * @param data {Object}
         * @param data.device {module:xide/types~DeviceInfo}
         * @returns {*}
         */
        onDeviceConnected:function(data,setReadyState){
            var deviceStoreItem = this.getDeviceStoreItem(data.device);
            if(data.isReplay && deviceStoreItem && deviceStoreItem.state ===types.DEVICE_STATE.READY){
                deviceStoreItem.setState(types.DEVICE_STATE.READY);
                return;
            }
            
            var instance = this.getDriverInstance(data.device, true) || data.instance;
            if(!instance){
                debugStrangers && !isServer && console.error('--cant find device instance',this.deviceInstances);
                deviceStoreItem && deviceStoreItem.setState(types.DEVICE_STATE.DISCONNECTED);
                return;
            }
            if(!deviceStoreItem){
                debugDevice && console.error('onDeviceConnected:: deviceStoreItem is null');
                return;
            }

            //console.error('weird '+data.device.id + ' ' + data.device.state + ' ' + deviceStoreItem.isServerSide());

            var cInfo = this.toDeviceControlInfo(deviceStoreItem);
            if(!cInfo){
                debugDevice && console.error('onDeviceConnected:: device info  is null');
                return;
            }

            if(isServer && !cInfo.serverSide){
                debugDevice && console.error('onDeviceConnected:: device info is not server side, abort');
            }

            if(instance && !deviceStoreItem.serverVariables){
                deviceStoreItem.setState(types.DEVICE_STATE.CONNECTED);
                this.getDeviceServerVariables(deviceStoreItem,instance);
                return;
            }
            if (!cInfo) {
                console.error('couldnt start device, invalid control info');
                return;
            }

            var hash = cInfo.hash;

            if (this.deviceInstances[hash]) {
                if(!instance.__didStartBlocks){
                    this.onDeviceStarted(instance,deviceStoreItem,instance.driver);
                }
                deviceStoreItem.setState(types.DEVICE_STATE.READY);
                this.publish(types.EVENTS.ON_STATUS_MESSAGE,{
                    text:'Device is Ready <span class="text-success">'+ cInfo.host+':'+cInfo.port + '</span>',
                    type:'success'
                });

                return this.deviceInstances[hash];
            }

            var thiz = this;
            var baseDriverPrefix = this.driverScopes['system_drivers'];
            var baseDriverRequire = baseDriverPrefix + 'DriverBase';
            //console.log('device conntected, load base driver with prefix : ' +baseDriverPrefix + ' and final require ' + baseDriverRequire);
            try {
                require([baseDriverRequire], function (baseDriver) {
                    baseDriver.prototype.declaredClass = baseDriverRequire;
                    thiz.createDriverInstance(cInfo, baseDriver, deviceStoreItem);
                });
            }catch(e){
                console.error('requiring base driver at ' + baseDriverRequire + ' failed',e);
            }

        },
        onDeviceDisconnected: function (data) {

            if (data && data.device) {
                var error = data.error;

                var code = error && error.code ? error.code :  error || '';
                var deviceStoreItem = this.getDeviceStoreItem(data.device);
                if(!deviceStoreItem){
                    debugDevice && isIDE && console.error('deviceStoreItem is null');
                    return;
                }
                if(data.stopped===true){
                    this.stopDevice(deviceStoreItem);
                    return;
                }

                this.publish(types.EVENTS.ON_STATUS_MESSAGE,{
                    text:'Device has been disconnected ' +'<span class="text-warning">'+ data.device.host+':'+data.device.port + '</span>' + ' :  ' + '<span class="text-danger">' + code + '</span>',
                    type:'info'
                });

                var info = this.toDeviceControlInfo(deviceStoreItem);
                if(info && isServer && !info.serverSide){
                    return;
                }

                //kill old instance
                var instance = this.getDriverInstance(data.device, true);
                if (instance) {
                    this.removeDriverInstance(data.device);
                }
                deviceStoreItem.reset();

                if (deviceStoreItem.state === types.DEVICE_STATE.DISABLED) {
                    deviceStoreItem.setState(types.DEVICE_STATE.DISCONNECTED);
                    return;
                }

                deviceStoreItem.setState(types.DEVICE_STATE.DISCONNECTED);
                deviceStoreItem.lastError = error;
                deviceStoreItem.refresh();

                function shouldRecconect(item){
                    if(item._userStopped || item.state === types.DEVICE_STATE.DISABLED){
                        return false;
                    }
                    var enabled = thiz.getMetaValue(item, types.DEVICE_PROPERTY.CF_DEVICE_ENABLED);
                    if(!enabled){
                        return false;
                    }
                    return true;
                }

                var serverSide = info.serverSide;

                if( (isServer && serverSide) || (!serverSide && !isServer)) {
                    if (deviceStoreItem) {
                        var thiz = this;
                        if (deviceStoreItem.reconnectTimer) {
                            return;
                        }
                        deviceStoreItem.isReconnecting = true;
                        if(!deviceStoreItem.lastReconnectTime){
                            deviceStoreItem.lastReconnectTime = thiz.reconnectDevice;
                        }else if(deviceStoreItem.lastReconnectTime>3600){
                            deviceStoreItem.lastReconnectTime = 3600;
                        }
                        if(!deviceStoreItem.reconnectRetry){
                            deviceStoreItem.reconnectRetry = 0;
                        }

                        deviceStoreItem.reconnectTimer = setTimeout(function () {
                            deviceStoreItem.reconnectTimer = null;
                            deviceStoreItem.lastReconnectTime *=2;
                            deviceStoreItem.reconnectRetry +=1;
                            if (deviceStoreItem.shouldReconnect()) {
                                if (info) {
                                    deviceStoreItem.setState(types.DEVICE_STATE.CONNECTING);
                                    debugConnect && console.info('trying to reconnect to ' + info.toString());
                                }
                                thiz.startDevice(deviceStoreItem);
                            }
                        }, deviceStoreItem.lastReconnectTime);
                    }
                }
            }
        },

        onCommandFinish:function(deviceData,message){
            var driverInstance = this.getDriverInstance(deviceData, true);
            if (!driverInstance) {
                return;
            }

            var params = message.params || {};
            if(params.src && params.id){
                var scope = driverInstance.blockScope;
                var block = scope.getBlockById(params.src);
                if(block && block.onCommandFinish){
                    block.onCommandFinish(message);
                }
            }
        },
        onCommandProgress:function(deviceData,message){
            var driverInstance = this.getDriverInstance(deviceData, true);
            if (!driverInstance) {
                return;
            }
            var params = message.params || {};
            if(params.src && params.id){
                var scope = driverInstance.blockScope;
                if(scope) {
                    var block = scope.getBlockById(params.src);
                    if (block && block.onCommandProgress) {
                        block.onCommandProgress(message);
                    }
                }else{
                    debugServerMessages && console.warn('onCommandProgress: have no blockscope');
                }

            }
        },
        onCommandPaused:function(deviceData,message){
            var driverInstance = this.getDriverInstance(deviceData, true);
            if (!driverInstance) {
                return;
            }
            var params = message.params || {};
            if(params.src && params.id){
                var scope = driverInstance.blockScope;
                var block = scope.getBlockById(params.src);
                if(block && block.onCommandPaused){
                    block.onCommandPaused(message);
                }
            }
        },
        onCommandStopped:function(deviceData,message){
            var driverInstance = this.getDriverInstance(deviceData, true);
            if (!driverInstance) {
                return;
            }
            var params = message.params || {};
            if(params.src && params.id){
                var scope = driverInstance.blockScope;
                var block = scope.getBlockById(params.src);
                if(block && block.onCommandStopped){
                    block.onCommandStopped(message);
                }
            }
        },
        onCommandError:function(deviceData,message){
            var driverInstance = this.getDriverInstance(deviceData, true);
            if (!driverInstance) {
                return;
            }
            var params = message.params || {};
            if(params.src && params.id){
                var scope = driverInstance.blockScope;
                var block = scope.getBlockById(params.src);
                if(block && block.onCommandError){
                    block.onCommandError(message);
                }
            }
        },
        /**
         * Primary callback when the device server has received a message from a device.
         * @param evt {object}
         * @param evt.event {string}
         * @param evt.data {string|object}
         * @param evt.data.data {object}
         */
        onDeviceServerMessage: function (evt) {
            var dataIn = evt['data'];
            var deviceMessageData = null;
            if (_.isString(dataIn) && dataIn.indexOf('{') !=-1){
                try {
                    deviceMessageData = dojo.fromJson(dataIn);
                    //at this point "deviceMessageData" is:
                    /*
                    var data ={
                        data:{
                            bytes:"",
                            device:device,
                            deviceMessage:"mssg"
                        },
                        event:""
                    }
                    */

                } catch (e) {
                    console.error('error parsing device message', evt);
                    return;
                }
            }else if(_.isObject(dataIn) && dataIn.data){
                //emulated
                deviceMessageData = dataIn;
            }

            if (!deviceMessageData || !deviceMessageData.data || !deviceMessageData.data.device) {
                debug && console.error('bad device message : ',deviceMessageData);
                return;
            }
            var deviceInfo  = deviceMessageData.data.device;
            if(!deviceInfo){
                debug && console.error('onDeviceServerMessage: cant get device info');
                return;
            }
            if(isServer && !deviceInfo.serverSide){
                return;
            }


            //pick driver instance
            var driverInstance = this.getDriverInstance(deviceMessageData.data.device, true);
            if (!driverInstance) {
                debugDevice && console.error(' onDeviceMessage : failed! Have no device instance for ' + deviceMessageData.data.device.host, deviceMessageData);
                return;
            }


            var device = this.getDeviceStoreItem(deviceInfo);

            if(!device){
                debugStrangers && console.error('cant find device : ',deviceInfo.toString());
                return;
            }

            //important: use our info now
            deviceInfo = device.info;
            if(!deviceInfo){
                console.error('invalid device : '+device.toString());
            }

            var state = device.get('state');
            var serverSide = deviceInfo.serverSide;
            function clear(message){
                delete message['resposeSettings'];
                delete message['driver'];
                delete message['lastResponse'];
                delete message['scope'];
                delete message['driverId'];
                delete message['device'];
                //delete message['src'];
                //delete message['id'];
                delete message['sourceHost'];
                delete message['sourcePort'];
            }

            var message = deviceMessageData.data.deviceMessage;
            var messages = [];
            if (_.isString(message)) {
                messages = driverInstance.split(message);
            }else if(_.isObject(message)){
                clear(message);
                messages = [message];
            }

            var deviceMessages = messages;

            var _messages = driverInstance.onMessageRaw({
                device: deviceMessageData.data.device,
                message:message,
                bytes:deviceMessageData.data.bytes
            });

            if(_messages && !_messages.length){
                _messages = null;
            }

            var bytes = [];

            for (var i = 0; i < messages.length; i++) {
                bytes.push(utils.stringToBuffer(messages[i]));
            }

            if(_messages && _messages.length){
                messages = [];
                bytes = [];
                for (var j = 0; j < _messages.length; j++) {
                    var msg = _messages[j];
                    messages.push(msg.string);
                    bytes.push(msg.bytes);
                }
                //console.log('got messages split',_messages);
            }
            //replay on driver code instance
            if(messages && messages.length) {
                for (var k = 0; k < messages.length; k++) {
                    var _message = messages[k];
                    //driver replay as individual message
                    driverInstance.onMessage({
                        device: deviceMessageData.data.device,
                        message: _message,
                        raw: message,
                        bytes:bytes[k]
                    });


                    //driver replay as broadcast message
                    driverInstance.onBroadcastMessage({
                        device: deviceMessageData.data.device,
                        message: _message,
                        raw: message,
                        bytes:bytes[k]
                    });

                }
            }

            /*
            TypeError: Cannot read property 'Module' of undefined
            at eval (eval at <anonymous> (eval at undefined), <anonymous>:1:9)
            at t.evaluate (eval at undefined, <anonymous>:165:98)
            at DebugCommandProcessor.t.processDebugJSONRequest (eval at undefined, <anonymous>:458:15)
            at dcl.getDriverModule (/PMaster/projects/x4mm/Code/client/src/lib/xcf/model/Command.js:468:13)
            at dcl._resolve (/PMaster/projects/x4mm/Code/client/src/lib/xcf/model/Command.js:312:37)
            at dcl.solve (/PMaster/projects/x4mm/Code/client/src/lib/xcf/model/Command.js:375:36)
            at dcl.start (/PMaster/projects/x4mm/Code/client/src/lib/xcf/model/Command.js:458:22)
            at dcl.start (/PMaster/projects/x4mm/Code/client/src/lib/xblox/model/Scope.js:96:27)
            at dcl.onDeviceStarted (/PMaster/projects/x4mm/Code/client/src/lib/xcf/manager/DeviceManager_DeviceServer.js:352:28)
            at dcl.onDeviceConnected (/PMaster/projects/x4mm/Code/client/src/lib/xcf/manager/DeviceManager_DeviceServer.js:1014:26)
            at dcl.onSetDeviceServerVariables (/PMaster/projects/x4mm/Code/client/src/lib/xcf/manager/DeviceManager_DeviceServer.js:893:18)
            at dcl.write (nxapp/manager/DeviceServerContext.js:132:29)
            at dcl.sendClientMessage (nxapp/server/DeviceServer.js:263:24)
            at dcl.getVariables (nxapp/server/DeviceServer.js:290:26)
            at dcl.handleManagerCommand (nxapp/server/DeviceServer.js:96:33)
            at dcl.sendManagerCommand (nxapp/manager/DeviceManager.js:242:30)
            at dcl.getDeviceServerVariables (/PMaster/projects/x4mm/Code/client/src/lib/xcf/manager/DeviceManager_DeviceServer.js:958:22)
            at dcl.onDeviceConnected (/PMaster/projects/x4mm/Code/client/src/lib/xcf/manager/DeviceManager_DeviceServer.js:1002:22)
            at Object.lang.hitch (dojo/_base/lang.js:375:55)
            at Object.target.(anonymous function).dispatcher [as ononDeviceConnected] (dojo/aspect.js:98:38)
            at Function.on.emit (dojo/on.js:285:37)
            at Object.Evented.emit (dojo/Evented.js:32:19)
            */

            if(state !==types.DEVICE_STATE.READY){
                device.set('state',types.DEVICE_STATE.READY);
            }
            var debugDevice = device.isDebug();
            //system replay:
            if (deviceMessageData.event) {

                //before publishing on the public system bus, we do bundle the driver instance
                //together with the origin event from the device server:
                deviceMessageData.data['driverInstance'] = driverInstance;
                //now tell everybody!
                //
                // 'deviceMessageData.event' is a system event and defined in xcf.types.EVENTS.ON_DEVICE_MESSAGE
                //
                // 'deviceMessageData.data' is the actual payload, build by the device server. it comes with this structure :
                //
                //  {
                //      device:{
                //          host:'192.168.1.20',
                //          port:'23',
                //          protocol:'tcp'
                //      },
                //      deviceMessage:'MV58\r@VOL:-220\r',
                //
                //  }
                //
                //  Current Subscribers : DriverManager & this
                //
                this.publish(deviceMessageData.event, deviceMessageData.data);
            }


            if(has('xcf-ui')) {

                //console replay
                var hash = deviceInfo.hash,
                    viewId = hash + '-Console',
                    messagesNew = [],
                    consoleViews = this.consoles[viewId];

                debug && console.log('on_device message '+hash,driverInstance.options);
                //device.setState(types.DEVICE_STATE.READY);
                if(debugDevice) {
                    var text = deviceMessageData.data.deviceMessage;
                    if (_.isObject(text)) {

                        clear(text);
                        try {
                            text = JSON.stringify(text);
                        } catch (e) {
                            logError(e, 'error serialize message');
                        }
                    }

                    this.publish(types.EVENTS.ON_STATUS_MESSAGE, {
                        text: "Device Message from " + driverInstance.options.host + " : " + '<span class="text-info">' + text + '</span>'
                    });
                }
                //var message = deviceMessageData.data.deviceMessage;

                if(consoleViews) {
                    for (var h = 0; h < consoleViews.length; h++) {
                        var consoleView = consoleViews[h];
                        if (consoleView) {
                            var split = true;
                            var hex = false;

                            if (consoleView.console) {
                                var _consoleEditor = consoleView.console.getTextEditor();
                                split = _consoleEditor.getAction("Console/Settings/Split").value;
                                hex = _consoleEditor.getAction("Console/Settings/HEX").value;
                            }

                            if(!split && hex){

                                var hexStr = utils.bufferToHexString(deviceMessageData.data.bytes);
                                consoleView.log(hexStr, split, false, types.LOG_OUTPUT.RESPONSE);
                                continue;
                            }

                            messagesNew = [];
                            if (_.isString(message)) {
                                messagesNew = split ? _messages && _messages.length ? _messages : driverInstance.split(message) : [message];
                            } else if (_.isObject(message)) {
                                clear(message);
                                messagesNew = [message];
                            }

                            for (var j = 0; j < messagesNew.length; j++) {
                                var _message = messagesNew[j];
                                if (_.isString(_message.string) && _message.string.length === 0) {
                                    continue;
                                }
                                if (hex) {
                                    _message = utils.stringToHex(_message.string);
                                }
                                consoleView.log(_message, split, true, types.LOG_OUTPUT.RESPONSE);
                            }
                        }
                    }
                }

                if(messages && messages.length) {
                    this.publish(types.EVENTS.ON_DEVICE_MESSAGE_EXT, {
                        device: device,
                        deviceInfo: deviceInfo,
                        raw: message,
                        messages: messages,
                        bytes:deviceMessageData.data.bytes
                    });
                }
            }


            /****************   Forward to xblox    ******************/

            if (messages.length > 0 && driverInstance.blockScope) {
                var scope = driverInstance.blockScope;
                var responseBlocks = scope.getBlocks({
                    group: types.BLOCK_GROUPS.CF_DRIVER_RESPONSE_BLOCKS
                });
                var responseVariables = scope.getVariables({
                    group: types.BLOCK_GROUPS.CF_DRIVER_RESPONSE_VARIABLES
                });

                var responseVariable = scope.getVariable('value');
                if (responseVariable){

                } else {
                    responseVariable = new Variable({
                        id: utils.createUUID(),
                        name: 'value',
                        value: '',
                        scope: scope,
                        type: 13,
                        group: 'processVariables',
                        gui: false,
                        cmd: false
                    });
                    scope.blockStore.putSync(responseVariable);
                }
                for (var l = 0; l < messages.length; l++) {

                    if (messages[l].length === 0) {
                        continue;
                    }
                    responseVariable.value = new String(messages[l]);
                    responseVariable.value.setBytes(bytes[l]);
                    responseVariable.value.setString(messages[l]);
                    this.publish(types.EVENTS.ON_DRIVER_VARIABLE_CHANGED, {
                        item: responseVariable,
                        scope: scope,
                        owner: this,
                        save: false,                         //dont save it
                        source: types.MESSAGE_SOURCE.DEVICE,  //for prioritizing
                        publishMQTT:false //just for local processing
                    });
                    //now run each top-variabl block in 'conditional process'
                    for (var o = 0; o < responseVariables.length; o++) {
                        var _var = responseVariables[o];
                        if (responseVariables[o].title == 'value') {
                            continue;
                        }
                        var _varResult = null;
                        var _cValue = responseVariable.value;
                        if (!(typeof _cValue == "number")) {
                            _cValue = '' + _cValue;
                            _cValue = "'" + _cValue + "'";
                        }

                        _varResult = _cValue;
                        if (_var.target && _var.target != 'None' && _varResult !== null && _varResult != 'null' && _varResult != "'null'") {
                            var targetVariable = scope.getVariable(_var.target);
                            if (targetVariable) {
                                targetVariable.value = _varResult;

                                this.publish(types.EVENTS.ON_DRIVER_VARIABLE_CHANGED, {
                                    item: targetVariable,
                                    scope: scope,
                                    owner: this,
                                    save: false,
                                    source: types.MESSAGE_SOURCE.BLOX  //for prioritizing
                                });
                            }
                        }
                    }

                    if( (isServer && serverSide) || (!serverSide && !isServer)) {

                        for (var m = 0; m < messages.length; m++) {
                            var __message = messages[m];
                            if(_.isObject(__message)) {
                                if (__message.src) {

                                    var block = scope.getBlockById(__message.src);
                                    if(block && block.onData){
                                        block.onData(__message);
                                    }
                                }
                            }
                        }


                        if(!runDrivers){
                            return;
                        }
                        //now run each top-level block in 'conditional process'
                        for (var n = 0; n < responseBlocks.length; n++) {
                            var block = responseBlocks[n];
                            if (block.enabled === false) {
                                continue;
                            }
                            block.override = {
                                args: _var ? [_var.value] : null
                            };
                            try {
                                scope.solveBlock(responseBlocks[n], {
                                    highlight: isServer ? false : true
                                });
                            } catch (e) {
                                logError(e,'----solving response block crashed ');
                                debug && console.trace();
                            }
                        }
                    }
                }
            }

        },
        /**
         * Device Server management interface
         * @param cmd
         * @param data
         */
        sendManagerCommand: function (cmd, data) {
            this.checkDeviceServerConnection();
            var dataOut = {
                manager_command: cmd
            };
            utils.mixin(dataOut, data);
            if(this.deviceServerClient) {
                var res = this.deviceServerClient.emit(null, dataOut, cmd);
                debugServerCommands && console.log('send manager command ' + cmd,[dataOut,res]);
                return res;
            }else{
                console.error('Send Manager Command ' + cmd +' failed, have no  device Server client');
                this.onHaveNoDeviceServer();
            }
        },
        /**
         *
         * @param driverInstance
         * @param data
         * @param src
         * @param id
         * @param print
         * @param wait
         * @param stop
         * @param pause
         */
        sendDeviceCommand: function (driverInstance, data,src,id,print,wait,stop,pause) {
            this.checkDeviceServerConnection();
            var options = driverInstance.getDeviceInfo();
            utils.mixin({
                src:src
            },options);

            var dataOut = {
                command: data,
                device_command: 'Device_Send',
                options:options

            };
            utils.mixin(dataOut.options,{
                params:{
                    src:src,
                    id:id,
                    wait:wait,
                    stop:stop,
                    pause:pause
                }
            });

            debug && console.log("Device.Manager.Send.Message : " + dataOut.command.substr(0,30) + ' = hex = ' + utils.stringToHex(dataOut.command) + ' l = ' + dataOut.command.length, dataOut);//sending device message
            var device = this.getDevice(options.id);
            if(!device || !_.isObject(device)){
                console.error('invalid device');
                return;
            }

            if(device._userStopped){
                return;
            }

            if(device && (device.state === types.DEVICE_STATE.DISABLED ||
                device.state === types.DEVICE_STATE.DISCONNECTED ||
                device.state === types.DEVICE_STATE.CONNECTING
                )){
                debug && console.error('send command when disconnected');
                return;
            }

            var message = utils.stringFromDecString(dataOut.command);


            if(device.isDebug()) {
                this.publish(types.EVENTS.ON_STATUS_MESSAGE, {
                    text: "Did send message : " + '<span class="text-warnin">' + message.substr(0, 30) + '</span>' + " to " + '<span class="text-info">' + options.host + ":" + options.port + "@" + options.protocol + '</span>'
                });
            }

            //console replay
            var hash = MD5(JSON.stringify(driverInstance.options), 1);
            var viewId = hash + '-Console';
            if(this.deviceServerClient) {
                this.deviceServerClient.emit(null, dataOut, 'Device_Send');
                if(has('xcf-ui') && print!==false) {
                    var consoleViews = this.consoles[viewId];
                    _.each(consoleViews,function(view){
                        var text = '<span class="text-info"><b>' + dataOut.command + '</span>';
                        view.printCommand(text,'');
                    });
                }
            }else{
                this.onHaveNoDeviceServer();
                console.error('this.deviceServerClient is null');
                console.error(' Send Device Command ' + data +'failed, have no  device Server client');
            }
            if(!driverInstance.blockScope){
                return;
            }
            var command = driverInstance.blockScope.getBlockById(src);
            this.publish(types.EVENTS.ON_DEVICE_COMMAND,{
                device:device,
                command:utils.stringFromDecString(data),
                deviceInfo:this.toDeviceControlInfo(device),
                name:command ? command.name : ""
            });
        },
        /**
         *
         * @param path {string} Absolute path to devices
         */
        loadDevices: function (path) {
            this.sendManagerCommand(types.SOCKET_SERVER_COMMANDS.INIT_DEVICES,{
                path: path
            });
        },
        /**
         *
         * @param driverInstance
         * @param method
         * @param args
         * @param src
         * @param id
         */
        callMethod: function (driverInstance,method,args,src,id) {
            this.checkDeviceServerConnection();
            var sendOptions = {
                id:id,
                src:src
            };
            var dataOut = {
                method: method,
                args: args,
                device_command: types.SOCKET_SERVER_COMMANDS.CALL_METHOD,
                params: sendOptions,
                options:driverInstance.options
            };
            if(this.deviceServerClient) {
                this.deviceServerClient.emit(null, dataOut, types.SOCKET_SERVER_COMMANDS.CALL_METHOD);
            }else{
                this.onHaveNoDeviceServer();
            }
        },
        /**
         *
         * @param driverInstance
         * @param method
         * @param args
         * @param src
         * @param id
         */
        runShell: function (driverInstance,cmd,args,src,id) {
            var options = driverInstance.getDeviceInfo();
            this.sendManagerCommand(types.SOCKET_SERVER_COMMANDS.RUN_SHELL,{
                cmd: cmd,
                args:args,
                options:utils.mixin(options,{
                    params: {
                        id: id,
                        src: src
                    }
                })
            });
            /*
            this.checkDeviceServerConnection();
            var options = driverInstance.options,
                sendOptions = {
                    id:id,
                    src:src
                },
                dataOut = {
                    method:method,
                    args: args,
                    manager_command: 'Run_Shell',
                    host: options.host,
                    port: options.port,
                    protocol: options.protocol,
                    options:sendOptions
                };
            if(this.deviceServerClient) {
                this.deviceServerClient.emit(null, dataOut, 'Run_Shell');
            }else{
                this.onHaveNoDeviceServer();
            }*/
        },
        /**
         * 
         * @param path
         */
        watchDirectory: function (path,watch) {            
            this.checkDeviceServerConnection();
            var dataOut = {
                    path:path,
                    watch:watch,
                    manager_command: types.SOCKET_SERVER_COMMANDS.WATCH
                };
            if(this.deviceServerClient) {
                this.deviceServerClient.emit(null, dataOut, types.SOCKET_SERVER_COMMANDS.WATCH);
            }else{
                this.onHaveNoDeviceServer();
            }
        },
        createDeviceServerClient:function(store){
            var thiz = this;
            var dfd = new Deferred();
            this.deviceServerClient = null;
            this.deviceServerClient = factory.createClientWithStore(store, 'Device Control Server', {
                delegate: {
                    onConnected:function(){
                        thiz.onDeviceServerConnected();
                        dfd.resolve();
                        thiz.publish(types.EVENTS.ON_DEVICE_SERVER_CONNECTED);

                        if(isIDE) {
                            thiz.ctx.getNotificationManager().postMessage({
                                message: 'Connected to Device Server',
                                type: 'success',
                                duration: 3000
                            });
                        }
                    },
                    onLostConnection: function(){
                        thiz.onDeviceServerConnectionLost();
                    },
                    onServerResponse: function (data) {
                        var dataIn = data['data'];
                        var msg = null;
                        if (_.isString(dataIn)) {

                            try {
                                msg = JSON.parse(dataIn);
                            } catch (e) {
                                msg = dataIn;
                            }


                            debug && !msg && console.error('invalid incoming message',data);

                            msg = msg || {};


                            if (msg && msg.data && msg.data.deviceMessage && msg.data.deviceMessage.event === types.EVENTS.ON_COMMAND_FINISH) {
                                thiz.onCommandFinish(msg.data.device,msg.data.deviceMessage);
                                return;
                            }
                            if (msg && msg.data && msg.data.deviceMessage && msg.data.deviceMessage.event === types.EVENTS.ON_COMMAND_PROGRESS) {
                                thiz.onCommandProgress(msg.data.device,msg.data.deviceMessage);
                                return;
                            }
                            if (msg && msg.data && msg.data.deviceMessage && msg.data.deviceMessage.event === types.EVENTS.ON_COMMAND_PAUSED) {
                                thiz.onCommandPaused(msg.data.device,msg.data.deviceMessage);
                                return;
                            }

                            if (msg && msg.data && msg.data.deviceMessage && msg.data.deviceMessage.event === types.EVENTS.ON_COMMAND_STOPPED) {
                                thiz.onCommandStopped(msg.data.device,msg.data.deviceMessage);
                                return;
                            }
                            if (msg.data && msg.data.deviceMessage && msg.data.deviceMessage.event === types.EVENTS.ON_COMMAND_ERROR) {
                                thiz.onCommandError(msg.data.device,msg.data.deviceMessage);
                                return;
                            }
                            if (msg.event === types.EVENTS.ON_DEVICE_DISCONNECTED) {
                                thiz.publish(types.EVENTS.ON_DEVICE_DISCONNECTED, msg.data);
                                return;
                            }

                            if (msg.event === types.EVENTS.SET_DEVICE_VARIABLES) {
                                return thiz.onSetDeviceServerVariables(msg.data);
                            }

                            if (msg.event === types.EVENTS.ON_RUN_CLASS_EVENT) {
                                return thiz.onRunClassEvent(msg.data);
                            }

                            if (msg.event === types.EVENTS.ON_DEVICE_CONNECTED) {
                                thiz.publish(types.EVENTS.ON_DEVICE_CONNECTED, msg.data);
                                return;
                            }

                            if (msg.event === types.EVENTS.ON_SERVER_LOG_MESSAGE) {
                                thiz.publish(types.EVENTS.ON_SERVER_LOG_MESSAGE, msg.data);
                                return;
                            }

                            if (msg.event === types.EVENTS.ON_MQTT_MESSAGE) {
                                thiz.publish(types.EVENTS.ON_MQTT_MESSAGE, msg.data);
                                thiz.onMQTTMessage(msg.data);
                                return;
                            }

                            if (msg.event === types.EVENTS.ON_FILE_CHANGED) {
                                return thiz.ctx.onXIDEMessage(dojo.fromJson(data.data));
                            }

                        }
                        thiz.onDeviceServerMessage(data);
                    }
                }
            });
            if (!this.deviceServerClient) {
                debug && console.log('couldnt connect to device server');
                return;
            } else {
                debug && console.log('did connect to device server');
            }
            this.deviceServerClient.dfd = dfd;
            return this.deviceServerClient;
        }
    });
});

/** @module xcf/mixins/LogMixing **/
define('xcf/mixins/LogMixin',[
    "dcl/dcl",
    'xcf/types/Types',
    'xide/utils'
    ],function (dcl, types, utils) {

    var DEFAULT_LOGGING_FLAGS = types.DEFAULT_DEVICE_LOGGING_FLAGS;

    var Module = dcl(null,{
        /**
         *
         * @param deviceInfo {module:xide/types~DeviceInfo}
         * @param flag {LOGGING_FLAGS}
         * @param source {DEVICE_LOGGING_SOURCE}
         * @returns {boolean}
         */
        hasFlagEx:function(deviceInfo,flag,source){

            var LOGGING_FLAGS = types.LOGGING_FLAGS,
                OUTPUT = types.LOG_OUTPUT,
                flags = deviceInfo.loggingFlags; flags = _.isString(flags) ? utils.fromJson(flags) : flags || {};

            var _flag = flags[source] ? flags[source] : DEFAULT_LOGGING_FLAGS[source];

            if(_flag == null){
                return false;
            }

            if(!(_flag & flag)) {
                return false;
            }

            return true;
        }
    });
    
    Module.DEFAULT_LOGGING_FLAGS = DEFAULT_LOGGING_FLAGS;

    return Module;
});


/** @module xcf/manager/DeviceManager */
define('xcf/manager/DeviceManager',[
    'dcl/dcl',
    "xdojo/declare",
    "dojo/_base/lang",
    'xide/encoding/MD5',
    'xide/types',
    'xide/utils',
    'xide/factory',
    'xcf/manager/BeanManager',
    'xide/mixins/ReloadMixin',
    'xide/mixins/EventedMixin',
    './DeviceManager_Server',
    './DeviceManager_DeviceServer',
    'xide/data/TreeMemory',
    'dojo/has',
    'xide/data/ObservableStore',
    'dstore/Trackable',
    'xcf/model/Device',
    'dojo/Deferred',
    "xide/manager/ServerActionBase",
    "xide/data/Reference",
    'xide/utils/StringUtils',
    'xcf/mixins/LogMixin',
    'xdojo/has!xcf-ui?./DeviceManager_UI',
    'xdojo/has!xexpression?xexpression/Expression',
    'dojo/promise/all'
    //'xdojo/has!host-node?nxapp/utils/_console',
    //"xdojo/has!host-node?nxapp/utils"
], function (dcl,declare, lang, MD5,
             types, utils, factory, BeanManager, ReloadMixin, EventedMixin,
             DeviceManager_Server, DeviceManager_DeviceServer,TreeMemory,has,
             ObservableStore,Trackable,Device,Deferred,ServerActionBase,Reference,StringUtils,
             LogMixin,
             DeviceManager_UI,Expression,all,_console,xUtils) {
  /*  
    var console = typeof window !== 'undefined' ? window.console : console;
    if(_console && _console.error && _console.warn){
        console = _console;
    }
*/
    var bases = [
        ServerActionBase,
        BeanManager,
        DeviceManager_Server,
        DeviceManager_DeviceServer,
        ReloadMixin.dcl,
        LogMixin
    ],
    _debugMQTT = false,
    _debug = false,
    _debugLogging = false,
    _debugConnect = false,
    isServer = !has('host-browser'),
    isIDE = has('xcf-ui'),
    DEVICE_PROPERTY = types.DEVICE_PROPERTY,
    runDrivers = has('runDrivers'),
    EVENTS = types.EVENTS;
    has('xcf-ui') && bases.push(DeviceManager_UI);
    /**
     * Common base class, for server and client.
     * @class module:xcf/manager/DeviceManager
     * @augments module:xide/mixins/EventedMixin
     * @extends module:xcf/manager/BeanManager
     * @extends module:xide/mixins/ReloadMixin
     * @extends module:xcf/manager/DeviceManager_DeviceServer
     */
    return dcl(bases,{
        declaredClass:"xcf.manager.DeviceManager",
        /***
         * The Bean-Manager needs a unique name of the bean:
         * @private
         */
        beanNamespace: 'device',
        /***
         * The Bean-Manager has some generic function like creating Dialogs for adding new items, please
         * provide a title for the interface.
         * @private
         */
        beanName: 'Device',
        /**
         * the icon class for bean edit views
         * @private
         */
        beanIconClass:'fa-sliders',
        /**
         * Bean group type
         * @private
         */
        groupType:types.ITEM_TYPE.DEVICE_GROUP,
        /**
         * Bean item type
         * @private
         */
        itemType:types.ITEM_TYPE.DEVICE,
        /**
         * The name of the CI in the meta database for the title or name.
         * @private
         */
        itemMetaTitleField:DEVICE_PROPERTY.CF_DEVICE_TITLE,
        /**
         * Name of the system scope
         * @private
         */
        systemScope:'system_devices',
        /**
         * Name of the user scope
         * @private
         */
        userScope:'user_devices',
        /**
         * Name of the app scope
         * @private
         */
        appScope:'app_devices',
        /**
         * Name of the default scope for new created items
         * @private
         */
        defaultScope:'system_devices',
        /***
         * The RPC server class:
         * @private
         */
        serviceClass: 'XCF_Device_Service',
        /***
         * A copy of all devices raw data from the server
         * @private
         */
        rawData: null,
        /***
         * @type {module:xcf/data/Store}
         * @private
         */
        store: null,
        /***
         * {xcf.views.DevicesTreeView}
         * @private
         */
        treeView: null,
        /***
         * {xide.client.WebSocket}
         */
        deviceServerClient: null,
        /***
         *  An array of started device instances.
         *  @private
         */
        deviceInstances: null,
        /***
         *  A map of scope names for module hot reloading
         *  @private
         */
        driverScopes: null,
        /***
         * autoConnectDevices does as it says, on app start, it connects to all known devices of the
         * project
         * @param autoConnectDevices
         * @private
         */
        autoConnectDevices: true,
        /**
         * Consoles is an array of {xide.views.ConsoleViews}. There is one console per device possible
         * @private
         */
        consoles: null,
        /**
         * lastUpTime is being used to recognize a computer suspend hibernate
         * @private
         */
        lastUpTime: null,
        /**
         * @private
         */
        reconnectDevice: 15000,
        /**
         * @private
         */
        reconnectDeviceServer: 5000,

        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Device-Related
        //
        /////////////////////////////////////////////////////////////////////////////////////
        onRunClassEvent:function (data) {
            var id = data.args.id;
            if(this.running && this.running[id]){
                var runData = this.running[id];
                var delegate = runData.delegate;
                if(!delegate){
                    return;
                }
                if(data.error){
                    if(delegate.onError){
                        delegate.onError(data.error);
                    }
                }
                if(data.finish){
                    if(delegate.onFinish){
                        delegate.onFinish(data.finish);
                    }
                }
                if(data.progress){
                    if(delegate.onProgress){
                        delegate.onProgress(data.progress);
                    }
                }
            }
        },
        getInstanceByName:function(name){
            var instances = this.deviceInstances;
            var self = this;
            for(var instance in instances){
                var device = instances[instance].device;
                if(!device){
                    continue;
                }
                var title = self.getMetaValue(device, DEVICE_PROPERTY.CF_DEVICE_TITLE);
                if(title ===name){
                    return instances[instance];
                }
            }
        },
        /**
         * Returns the file object for a device
         * @param device
         * @returns {module:xfile/model/File}
         */
        getFile:function(device){
            var dfd = new Deferred();
            var ctx = this.ctx;
            var fileManager = ctx.getFileManager();
            var fileStore = fileManager.getStore(device.scope);
            fileStore.initRoot().then(function(){
                fileStore._loadPath('.',true).then(function(){
                    fileStore.getItem(device.path,true).then(function (item) {
                        dfd.resolve(item);
                    });
                });
            });
            return dfd;
        },
        getSourceHash:function () {
            var userDirectory = this.ctx.getUserDirectory();
            return userDirectory || "no_user_directory";
        },
        /**
         * Make sure we've a connection to our device-server
         * @private
         */
        checkDeviceServerConnection: function () {
            if(!this.ctx.getNodeServiceManager){
                return true;
            }
            if (!this.deviceServerClient && this.ctx.getNodeServiceManager) {
                var store = this.ctx.getNodeServiceManager().getStore();
                if (!store) {
                    console.error('checkDeviceServerConnection : have no service store');
                    return false;
                }
                this.createDeviceServerClient(store);
            }
            return true;
        },
        /**
         *
         * @param target
         * @param source
         * @private
         */
        addDriverFunctions: function (target, source) {
            for (var i in source) {

                if (i === 'constructor' ||
                    i === 'inherited' ||
                    i == 'getInherited' ||
                    i == 'isInstanceOf' ||
                    i == '__inherited' ||
                    i == 'onModuleReloaded' ||
                    i == 'start' ||
                    i == 'publish' ||
                    i == 'subscribe' ||
                    i == 'getInherited' ||
                    i == 'getInherited'
                ) {
                    continue;
                }
                if (_.isFunction(source[i]) && !target[i]) {
                    target[i] = source[i];//swap
                }
            }
        },
        /**
         *
         * @param driver
         * @param instance
         * @private
         */
        addLoggingFunctions: function (driver, instance) {
            var thiz = this;
            instance.log = function (level, type, message, data) {
                data = data || {};
                var oriData = lang.clone(data);
                data.type = data.type || type || 'Driver';
                if (instance.options) {
                    data.device = instance.options;
                }
                thiz.publish(types.EVENTS.ON_SERVER_LOG_MESSAGE, {
                    data: data,
                    level: level || 'info',
                    message: message,
                    details:oriData
                });
            }
        },
        /**
         * An instance of a driver class has been created.
         * We mixin new functions: callCommand, set/get-Variable, log
         * @param driver
         * @param instance
         * @param device
         * @private
         */
        completeDriverInstance: function (driver, instance,device) {
            _debug && console.info('complete driver instance');
            var thiz = this,
                scope = instance.blockScope,
                store = scope.blockStore,
                parentId = device.path,
                commandsRoot = parentId + '_commands',
                variablesRoot = parentId + '_variables';

            
            store.on('delete',function(evt){
                var _isVariable = evt.target.declaredClass.indexOf('Variable') !==-1,
                    _parent = _isVariable  ? variablesRoot : commandsRoot,
                    referenceParent = device._store.getSync(_parent);

                if(referenceParent){
                    referenceParent.refresh();
                }

                var referenceId = _parent + '_reference_'+evt.target.id,
                    reference  = device._store.getSync(referenceId);

                if(reference){
                    reference.refresh();
                }
            });

            function createReference(block,driver,title,icon){
                var _isVariable = block.declaredClass.indexOf('Variable') !==-1;
                var _parent = _isVariable  ? variablesRoot : commandsRoot;
                if(block.declaredClass.indexOf( _isVariable? 'Variable' : 'Command')==-1){
                    return;
                }

                var reference  = new Reference({
                    enabled:true,
                    path: _parent + '_reference_'+block.id,
                    name: title,
                    id: block.id,
                    parentId: _parent,
                    _mayHaveChildren: false,
                    virtual: true,
                    tooltip: true,
                    icon:icon,
                    ref: {
                        driver: driver,
                        item: block,
                        device:device
                    },
                    type: types.ITEM_TYPE.BLOCK
                });

                reference = device._store.putSync(reference);

                block.addReference(reference,{
                    properties: {
                        "name":true,
                        "enabled":true,
                        "value":true
                    },
                    onDelete:true
                },true);

                reference.refresh();
            }

            store.on('added',function(block){
                createReference(block,driver,block.name,block.icon || 'fa-exclamation');
            });

            /**
             * Add 'callCommand'
             * @param title
             */
            /*
            instance.callCommand = function (title) {
                var _block = this.blockScope.getBlockByName(title);
                if (_block) {
                    return _block.solve(this.blockScope,settings);
                }
            };
            */
            instance.setVariable = function (title, value, save, publish,highlight) {
                var _variable = this.blockScope.getVariable(title);
                if (_variable) {
                    _variable.value = value;
                    if(highlight===false){
                        _variable.__ignoreChangeMark = true;
                    }
                    _variable.set('value',value,save,publish,highlight);
                    if(highlight===false){
                        _variable.__ignoreChangeMark = false;
                    }
                } else {
                    _debug &&  console.log('no such variable : ' + title);
                    return;
                }
                thiz.publish(types.EVENTS.ON_DRIVER_VARIABLE_CHANGED, {
                    item: _variable,
                    scope: this.blockScope,
                    driver: driver,
                    owner: thiz,
                    save: save === true,
                    publish : publish
                });
            };
            /**
             * Add getVariable
             * @param title
             */
            instance.getVariable = function (title) {
                var _variable = this.blockScope.getVariable(title);
                if (_variable) {
                    return _variable._getArg(_variable.value,false);
                }
                return '';
            };

            /**
             * add log function
             * @param level
             * @param type
             * @param message
             * @param data
             */
            instance.log = function (level, type, message, data) {

                data = data || {};
                var oriData = lang.clone(data);
                data.type = data.type || type || 'Driver';
                if (instance.options) {
                    data.device = instance.options;
                }
                thiz.publish(types.EVENTS.ON_SERVER_LOG_MESSAGE, {
                    data: data,
                    level: level || 'info',
                    message: message,
                    details:oriData
                });
            };


            for (var i in driver) {

                if (i === 'constructor' ||
                    i === 'inherited' ||
                    i == 'getInherited' ||
                    i == 'isInstanceOf' ||
                    i == '__inherited' ||
                    i == 'onModuleReloaded' ||
                    i == 'start' ||
                    i == 'publish' ||
                    i == 'subscribe' ||
                    i == 'getInherited' ||
                    i == 'getInherited'
                ) {
                    continue;
                }
                if (lang.isFunction(driver[i]) && !instance[i] /*&& lang.isFunction(target[i])*/) {
                    instance[i] = driver[i];//swap
                }
            }
        },

        getDevice:function(mixed){
            var result = mixed;
            if(_.isString(mixed)){                
                var byId = this.getItemById(mixed);
                if(byId){
                    result = byId;
                }else{
                    var byPath = this.getItemByPath(mixed);
                    if(byPath) {
                        result = byPath;
                    }
                }
            }
            return result;
        },
        /**
         * Stops a device with a device model item
         * @param item {module:xcf/model/Device|string}
         */
        stopDevice: function (_item) {
            var device = this.getDevice(_item) || _item;
            if(!device){
                console.error('cant find device '+_item);
                return;
            }
            this.checkDeviceServerConnection();
            device._userStopped = true;
            var cInfo = this.toDeviceControlInfo(device);
            if(!cInfo){
                _debugConnect && console.error('cant find device::no device info',device.toString && device.toString());
                return;
            }
            if(isServer && (!cInfo.serverSide && !device.isServer())){
                return;
            }


            var hash = cInfo.hash;
            if (this.deviceInstances[hash]) {
                this._removeInstance(this.deviceInstances[hash], hash,device);
                delete this.deviceInstances[hash];
                _debugConnect && console.log('-- stop device ' + hash,this.deviceInstances);
            }else {
                _debugConnect && console.log('cant find instance ' + hash);
                return;
            }
            this.sendManagerCommand(types.SOCKET_SERVER_COMMANDS.MANAGER_STOP_DRIVER, cInfo);
            //this.sendManagerCommand(types.SOCKET_SERVER_COMMANDS.STOP_DEVICE, cInfo);
        },
        getStores:function(){
            return this.stores;
        },
        /**
         * @TODO: remove back compat
         * @param scope
         * @returns {*}
         */
        getStore:function(scope){
            scope = scope || 'system_devices';
            var store = this.stores[scope];
            if(store){
                return store;
            }
            if(scope){
                return this.ls(scope);
            }
        },
        /**
         * Get all enabled devices
         * @param enabledOnly
         * @param addDriver
         * @returns {module:xcf/model/Device[]}
         */
        getDevices: function (enabledOnly,addDriver) {
            var store = this.getStore();
            if(!store){
                return [];
            }
            var items = utils.queryStore(store, {
                isDir: false
            });
            if (items._S) {
                items = [items];
            }

            var result = [];
            for (var i = 0; i < items.length; i++) {

                var device = items[i];                
                var enabled = this.getMetaValue(device, DEVICE_PROPERTY.CF_DEVICE_ENABLED);

                if ((enabledOnly === true && enabled == true || enabled == null) || enabledOnly === false) {
                    result.push(device);
                    if(addDriver==true) {
                        var driverId = this.getMetaValue(device, DEVICE_PROPERTY.CF_DEVICE_DRIVER);
                        if (!driverId) {
                            _debug && console.error('device has no driver id!');
                            continue;
                        }
                        var driver = this.ctx.getDriverManager().getItemById(driverId);
                        if (driver){
                            device['driver'] = driver;
                        }
                    }
                }
            }
            return result;
        },
        getStores:function(){

            var stores = [];
            for(var scope in this.stores){
                var store = this.stores[scope];
                if(store){
                    stores.push(store);
                }
            }
            return stores;
        },
        getStorePath:function(scope){
            var ctx = this.getContext();
            var resourceManager = ctx.getResourceManager();
            if(scope==='user_devices'){
                return resourceManager.getVariable('USER_DIRECTORY');
            }
        },
        /**
         * Connect to all known devices
         * @private
         */
        connectToAllDevices: function () {
            if(!this.deviceServerClient){
                this.checkDeviceServerConnection();
                return;
            }
            var stores = this.getStores(),
                thiz = this;

            if(!this.getStores().length){
                return;
            }
            var all = [];

            function start(device) {
                var deviceDfd = thiz.startDevice(device);
                all.push(deviceDfd);
                _debugConnect && console.log('start device ' + thiz.toDeviceControlInfo(device).title);
            };

            function connect(store){
                if(!store){
                    console.error('have no device store');
                    return;
                }
                if(store.connected){
                    return;
                }
                store.connected = true;



                var items = utils.queryStore(store, {
                    isDir: false
                });
                if (items._S) {
                    items = [items];
                }

                if(!_.isArray(items)){
                    items = [items];
                }
                for (var i = 0; i < items.length; i++) {
                    var device = items[i];
                    var enabled = thiz.getMetaValue(device, DEVICE_PROPERTY.CF_DEVICE_ENABLED);
                    if (enabled == true || enabled == null) {
                        start(device);
                    }
                }
                /*
                if(store.scope==='user_devices' && !isServer){
                    var storePath = this.getStorePath(store.scope);
                    if(storePath){
                        this.sendManagerCommand(types.SOCKET_SERVER_COMMANDS.INIT_DEVICES,{
                            path: storePath,
                            scope:store.scope
                        });
                    }
                }
                */

            }
            _.each(stores,connect,this);
            return all;
        },
        debug:function(){
            console.info('Debug info stores : ');
            _.each(this.stores,function(store){
                console.log('have store '+store.scope);
            });
        },
        /**
         *
         * @private
         */
        _getLogText: function (str) {
            return moment().format("HH:mm:ss:SSS") + ' ::   ' + str + '';
        },
        _parse: function (scope, expression) {
            var str = '' + expression;
            if (str.indexOf('{{') > 0 || str.indexOf('}}') > 0) {
                console.time('parse expression');
                var _parser = new Expression();
                str = _parser.parse(types.EXPRESSION_PARSER.FILTREX,
                    str, this,{
                        variables: scope.getVariablesAsObject(),
                        delimiters: {
                            begin: '{{',
                            end: '}}'
                        }
                    }
                );
                console.timeEnd('parse expression');
            }else{
                var _text = scope.parseExpression(expression);
                if(_text){
                    str = _text;
                }
            }
            return str;
        },
        /**
         *
         * @param driver
         * @param device
         * @private
         */
        runCommand: function (driver, device) {},
        /**
         * @private
         */
        _lastActions: null,
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Data related
        //
        /////////////////////////////////////////////////////////////////////////////////////
        /**
         *
         * @param rawData
         * @private
         */
        onStoreReloaded: function (rawData) {
            this.completeDeviceStore();
        },
        getInstance:function(mixed){
            var deviceInfo = mixed ? mixed._store ? this.toDeviceControlInfo(mixed) : mixed : null;
            if(!deviceInfo){
                return;
            }
            return this.getDriverInstance(deviceInfo,false);
        },
        /***
         * returns driver instance!
         * @param deviceInfo {module:xide/types~DeviceInfo}
         * @param fillSettings will convert and put CI settings into the driver's instance (member variable)
         * @returns {module:xcf/driver/DriverBase}
         * @private
         */
        getDriverInstance: function (deviceInfo, fillSettings) {
            if (!deviceInfo) {
                console.error('getDriverInstance::have no device info')
                return null;
            }
            for (var i in this.deviceInstances) {

                var instance = this.deviceInstances[i];
                var instanceOptions = instance.options;
                if(!instanceOptions){
                    continue;
                }

                if (instanceOptions.port === deviceInfo.port &&
                    instanceOptions.host === deviceInfo.host &&
                    instanceOptions.protocol === deviceInfo.protocol &&
                    instanceOptions.isServer === deviceInfo.isServer) {

                    if(fillSettings && instance.sendSettings && has('xcf-ui')){
                        fillSettings = false;
                    }

                    if (fillSettings !== false) {
                        //get settings, if not cached already
                        if (instance && !instance.sendSettings) {
                            //pick driver
                            var driver = this.ctx.getDriverManager().getItemById(deviceInfo.driverId);//driverStore item
                            if (driver) {
                                var meta = driver['user'];
                                var commandsCI = utils.getCIByChainAndName(meta, 0, types.DRIVER_PROPERTY.CF_DRIVER_COMMANDS);
                                if (commandsCI && commandsCI['params']) {
                                    instance.sendSettings = utils.getJson(commandsCI['params']);
                                }

                                var responseCI = utils.getCIByChainAndName(meta, 0, types.DRIVER_PROPERTY.CF_DRIVER_RESPONSES);
                                if (responseCI && responseCI['params']) {
                                    instance.responseSettings = utils.getJson(responseCI['params']);
                                }
                            }else{
                                _debug && console.warn('getDriverInstance:: cant find driver');
                            }
                        }
                    }
                    return instance;
                }
            }
            return null;
        },
        _reconnectServerTimer:null,
        /**
         * @private
         */
        onDeviceServerConnectionLost:function(){

            if(this.deviceServerClient && this.deviceServerClient.pageUnloaded){
                return;
            }
            if (this.deviceServerClient) {
                this.deviceServerClient.destroy();
                this.deviceServerClient = null;
            }

            if(this._reconnectServerTimer){
                return;
            }
            var thiz = this;
            if(isIDE) {
                thiz.ctx.getNotificationManager().postMessage({
                    message: 'Lost connection to device server, try reconnecting in 5 seconds',
                    type: 'error',
                    showCloseButton: true,
                    duration: 1000
                });
            }
            this._reconnectServerTimer = setTimeout(function(){
                thiz.checkDeviceServerConnection();
                thiz._reconnectServerTimer=null;
            },this.reconnectDeviceServer);

            console.log('lost device server connection');
            _.each(this.deviceInstances,function(instance){

                if(instance && instance.device && !instance.domNode) {
                    var device = instance.device;
                    var driverInstance = device.driverInstance;
                    driverInstance && driverInstance.onLostServer && driverInstance.onLostServer();
                    device.setState(types.DEVICE_STATE.LOST_DEVICE_SERVER);
                }
            });

        },
        /**
         *
         * @param msg
         * @private
         */
        onMQTTMessage:function(msg){

            var message=utils.getJson(msg.message);
            var isUs=false;
            var thiz = this;
            if(message){
                var sourceHost = message.sourceHost;
                var sourcePort = message.sourcePort;
                var mqttHost = msg.host;
                var mqttPort = msg.port;
                if(sourceHost && sourcePort){
                    if(sourceHost===mqttHost && sourcePort==mqttPort){
                        isUs=true;
                    }
                }
            }

            if(!isUs) {

                _debugMQTT && console.info('onMQTTMessage:');
                //
                var parts=msg.topic.split('/');
                if(parts.length==4 && parts[2]=='Variable' && message.device){
                    var _device = this.getDeviceStoreItem(message.device);
                    if(_device){
                        _debugMQTT && console.info('\tonMQTTMessage: on mqtt variable topic ' + msg.topic);
                        var _deviceInfo = this.toDeviceControlInfo(message.device);
                        if(_deviceInfo){
                            var driverInstance = this.getDriverInstance(_deviceInfo);
                            if(driverInstance){
                                var scope = driverInstance.blockScope;
                                var _variable = scope.getVariable(parts[3]);
                                if(_variable){
                                    _debugMQTT && console.info('     received MQTT variable ' +_variable.name + ' = ' +message.value);
                                    if(has('xcf-ui')) {
                                        _variable.set('value', message.value);
                                        _variable.refresh();
                                    }else{
                                        delete _variable.value;
                                        _variable.value = message.value;
                                    }
                                    thiz.publish(types.EVENTS.ON_DRIVER_VARIABLE_CHANGED, {
                                        item: _variable,
                                        scope: _variable.scope,
                                        owner: thiz,
                                        save: false,
                                        publish : true,
                                        source:'mqtt',
                                        publishMQTT:false
                                    });

                                }
                            }else{
                                _debugMQTT && console.error('cant find driver instance '+msg.topic);
                            }
                        }else{
                            _debugMQTT && console.error('cant find device info');
                        }
                    }else{
                        console.error('cant find device for : ' + msg.topic);
                    }
                }
            }else{
                _debugMQTT && console.error('same source');
            }
        },
        /**
         * Find a block by url in all instances
         * @param url
         * @returns {*}
         */
        getBlock:function(url){
            for (var id in this.deviceInstances) {
                var instance = this.deviceInstances[id];
                if(!instance || !instance.device){
                    continue;
                }
                var scope = instance.blockScope;
                if(scope) {
                    var block = scope.resolveBlock(url);
                    if (block) {
                        return block;
                    }
                }
            }
            return this.ctx.getDriverManager().getBlock(url);
        },
        /***
         * Callback when the NodeJS service manager initialized its service store. That may
         * happen multiple times as user can reload the store.
         *
         * @param evt
         * @private
         */
        onNodeServiceStoreReady: function (evt) {
            if (this.deviceServerClient) {
                this.deviceServerClient.destroy();
            }
            var store = evt.store,thiz = this;
            var client = this.createDeviceServerClient(store);
            var connect = has('drivers') && has('devices');
        },
        /**
         *
         * @param instance
         * @param modulePath
         * @private
         */
        onDriverUpdated: function (instance, modulePath) {
            return;
        },
        /**
         * Some file has changed, update driver instance
         * @param evt
         * @private
         */
        onModuleReloaded: function (evt) {
            if (this.deviceInstances.length == 0) {//nothing to do
                return;
            }
            var modulePath = utils.replaceAll('//', '/', evt.module);
            var newModule = evt.newModule;
            var found = false;
            for (var i in this.deviceInstances) {

                var instance = this.deviceInstances[i];

                if (instance.modulePath === modulePath ||
                    instance.baseClass === modulePath) {
                    this.mergeFunctions(instance, newModule.prototype);
                    found = true;
                    _debug && console.log('Did update driver code : ' + modulePath,newModule.prototype);
                    if (instance.blockScope) {
                        instance.blockScope.expressionModel.expressionCache = {};
                    }
                    this.onDriverUpdated(instance, modulePath);
                }
            }
        },
        /**
         *
         * @param instance
         * @param hash
         * @param device
         * @private
         */
        _removeInstance: function (instance, hash,device) {
            if (instance.destroy) {
                instance.destroy();
            }
            instance.blockScope && instance.blockScope._destroy();
            delete this.deviceInstances[hash];
            this.ctx.getBlockManager().removeScope(instance.options.id);
            this.ctx.getDriverManager().removeDriverInstance(instance,device);

            device.reset();
            if(this.completeDevice){
                //this.completeDevice(null,device,instance.driver);
            }

        },
        /**
         *
         * @param deviceInfo
         * @private
         */
        removeDriverInstance: function (deviceInfo) {
            var instance = this.getDriverInstance(deviceInfo);
            if(instance){
                this.ctx.getBlockManager().removeScope(instance.options.id);
                if(instance.blockScope){
                    instance.blockScope.destroy();
                }
                instance.destroy();
            }else{
                _debugConnect && console.error('remove instance : cant find!');
            }
            for (var i in this.deviceInstances) {
                if(instance == this.deviceInstances[i]){
                    delete this.deviceInstances[i];
                }
            }
        },
        /**
         *
         * @param item {module:xcf/model/Device} the device
         * @param name {string} the name of the CI
         * @returns {string|int|object|null}
         */
        getMetaValue: function (item, name) {
            var meta = item['user'];
            if (meta) {
                return utils.getCIInputValueByName(meta, name);
            }
            return null;
        },
        /**
         * Return device by host and port
         * @param host {string}
         * @param port {string}
         * @returns {module:xcf/model/Device|null}
         */
        getDeviceByHost: function (host,port) {
            var items = utils.queryStore(this.getStore(), {
                isDir: false
            });
            for (var i = 0; i < items.length; i++) {
                var device = items[i];
                var _host = this.getMetaValue(device, DEVICE_PROPERTY.CF_DEVICE_HOST);
                var _port = this.getMetaValue(device, DEVICE_PROPERTY.CF_DEVICE_PORT);
                if(_host ==host && _port == port){
                    return device;
                }
            }
            return null;
        },
        getDeviceByUrl:function(url){
            var parts = utils.parse_url(url);
            parts = utils.urlArgs(parts.host);
            return this.getDeviceById(parts.device.value);
        },
        /**
         * Returns a device by id
         * @param id {string}
         * @returns {module:xcf/model/Device|null}
         */
        getDeviceById: function (id,store) {

            var self = this;
            function search(_store){
                var items = utils.queryStore(_store, {
                    isDir: false
                });

                if (items._S) {
                    items = [items];
                }
                for (var i = 0; i < items.length; i++) {
                    var device = items[i];
                    var _id = self.getMetaValue(device, DEVICE_PROPERTY.CF_DEVICE_ID);
                    if(_id == id){
                        return device;
                    }
                }
                return null;
            }

            var _store = _.isString(store) ? this.getStore(store) : null;
            if(_store){
                return search(_store);
            }else{
                for (var scope in this.stores){
                    var item = search(this.stores[scope]);
                    if(item){
                        return item;
                    }
                }
            }
            return null;
        },
        /**
         * Returns a device by id
         * @param title {string}
         * @returns {module:xcf/model/Device|null}
         */
        getDeviceByName: function (title,store) {
            var self = this;
            function search(_store){
                var items = utils.queryStore(_store, {
                    isDir: false
                });

                if (items._S) {
                    items = [items];
                }
                for (var i = 0; i < items.length; i++) {
                    var device = items[i];
                    var _id = self.getMetaValue(device, DEVICE_PROPERTY.CF_DEVICE_TITLE);
                    if(_id == title){
                        return device;
                    }
                }
                return null;
            }

            var _store = _.isString(store) ? this.getStore(store) : null;
            if(_store){
                return search(_store);
            }else{
                for (var scope in this.stores){
                    var item = search(this.stores[scope]);
                    if(item){
                        return item;
                    }
                }
            }
            return null;
        },
        /**
         * Returns all devices by driver id
         * @param id {string} the driver id
         * @returns {module:xcf/model/Device[]}
         */
        getDevicesByDriverId: function (id) {
            var items = utils.queryStore(this.getStore(), {
                isDir: false
            });
            if (items._S) {
                items = [items];
            }
            for (var i = 0; i < items.length; i++) {
                var device = items[i];
                var _id = this.getMetaValue(device, DEVICE_PROPERTY.CF_DEVICE_ID);
                if(_id == id){
                    return device;
                }
            }
            return null;
        },
        _cachedItems:null,
        getDeviceStoreItem: function (deviceInfo) {
            if(!deviceInfo){
                return;
            }

            if(!isIDE && deviceInfo.hash && this._cachedItems){
                var _cached = this._cachedItems[deviceInfo.hash];
                if(_cached){
                    return _cached;
                }
            }

            //already device
            if(deviceInfo && deviceInfo._store){
                //return deviceInfo;
            }
            var scope = deviceInfo.deviceScope;
            var store = this.getStore(scope);

            if(!store){

                return;
            }
            var items = utils.queryStore(store, {
                isDir: false
            });

            if(!items){
                _debug && !isServer && console.error('store returned nothing ' + deviceInfo.deviceScope);
                return null;
            }
            if(items && !_.isArray(items)){
                items = [items];
            }
            for (var i = 0; i < items.length; i++) {
                var device = items[i],
                    meta = device['user'],
                    host = utils.getCIInputValueByName(meta, DEVICE_PROPERTY.CF_DEVICE_HOST),
                    port = utils.getCIInputValueByName(meta, DEVICE_PROPERTY.CF_DEVICE_PORT),
                    id = utils.getCIInputValueByName(meta, DEVICE_PROPERTY.CF_DEVICE_ID),
                    protocol = utils.getCIInputValueByName(meta, DEVICE_PROPERTY.CF_DEVICE_PROTOCOL);

                if (port === deviceInfo.port &&
                    host === deviceInfo.host &&
                    protocol === deviceInfo.protocol &&
                    device.isServer() === deviceInfo.isServer &&
                    id === deviceInfo.id ) {

                    var deviceStoreItem = store.getSync(device.path);
                    if(deviceStoreItem){
                        device = deviceStoreItem;
                    }

                    if(!isIDE && deviceInfo.hash){
                        if(!this._cachedItems){
                            this._cachedItems = {};
                        }
                        this._cachedItems[deviceInfo.hash] = device;
                    }

                    return device;
                }
            }
        },
        /**
         *
         * @param ci
         * @param storeRef
         * @private
         */
        onDriverSettingsChanged: function (ci, storeRef) {
            for (var i in this.deviceInstances) {

                var instance = this.deviceInstances[i];
                //get settings, if not cached already
                if (instance && instance.driver == storeRef) {
                    //pick driver
                    var driver = storeRef;// this.ctx.getDriverManager().getItemById(instance.options.id);//driverStore item
                    var meta = driver['user'];
                    var commandsCI = utils.getCIByChainAndName(meta, 0, types.DRIVER_PROPERTY.CF_DRIVER_COMMANDS);
                    if (commandsCI && commandsCI['params'] && commandsCI == ci) {
                        instance.sendSettings = utils.getJson(commandsCI['params']);
                    }
                    var responseCI = utils.getCIByChainAndName(meta, 0, types.DRIVER_PROPERTY.CF_DRIVER_RESPONSES);
                    if (responseCI && responseCI['params']) {
                        instance.responseSettings = utils.getJson(responseCI['params']);
                    }
                    break;
                }
            }
        },
        /**
         * @private
         */
        onDeviceStateChanged: function (item,silent) {
            if(item._userStopped !==true &&  silent!==true && item.info && item.state && item.state ==types.DEVICE_STATE.DISCONNECTED){
                this.ctx.getNotificationManager().postMessage({
                    message:'Lost connection to ' + item.info.host + ', ...reconnecting',
                    type:'error',
                    showCloseButton: false,
                    duration:1500
                });
            }
            if(silent!==true && item.info && item.state && item.state ==types.DEVICE_STATE.CONNECTED){
                this.ctx.getNotificationManager().postMessage({
                    message:'Connected to ' + item.info.host + '',
                    type:'success',
                    showCloseButton: false,
                    duration:2000
                });
            }
        },
        /**
         *
         * @param item
         * @returns {*}
         * @private
         */
        connectDevice:function(item){
            this.checkDeviceServerConnection();            
            var cInfo = this.toDeviceControlInfo(item);
            if (!cInfo) {
                console.error('couldnt start device, invalid control info');
                return;
            }
            var hash = cInfo.hash;
            if (this.deviceInstances[hash]) {
                _debugConnect && console.log('device already connected', cInfo);
                item.setState(types.DEVICE_STATE.CONNECTED);
                return this.deviceInstances[hash];
            }
            item.setState(types.DEVICE_STATE.CONNECTING);
            this.publish(types.EVENTS.ON_STATUS_MESSAGE,{
                text:'Trying to connect to ' + cInfo.toString(),
                type:'info'
            });
            this.sendManagerCommand(types.SOCKET_SERVER_COMMANDS.MANAGER_START_DRIVER, cInfo);
        },
        /**
         * client application ready, mixin instances and block scopes
         * @param evt
         * @private
         */
        onAppReady: function (evt) {
            var appContext = evt.context;
            appContext.deviceManager = this;
            appContext.driverManager = this;
            if (appContext.blockManager) {
                utils.mixin(appContext.blockManager.scopes, this.ctx.getBlockManager().scopes);
            }
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Server methods (NodeJs)
        //
        /////////////////////////////////////////////////////////////////////////////////////

        /**
         * @private
         */
        onHaveNoDeviceServer:function(){
            if(!this.ctx.getNotificationManager()){
                return;
            }
            var thiz = this;
            var msg = this.ctx.getNotificationManager().postMessage({
                message:'Have no device server connection',
                type:'error',
                showCloseButton: true,
                duration:1500,
                actions: {
                    reconnect: {
                        label: 'Reconnect',
                        action: function() {
                            thiz.checkDeviceServerConnection();
                            return msg.update({
                                message: 'Reconnecting...',
                                type: 'success',
                                actions: false,
                                duration:1500
                            });
                        }
                    }
                }
            });
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Server methods (PHP)
        //
        /////////////////////////////////////////////////////////////////////////////////////
        /***
         * setDriverScriptContent is storing a driver's actual code in a given scope on the server
         * @param scope {string}
         * @param path  {string}
         * @param content  {string}
         * @param readyCB   {function}
         * @param errorCB   {function}
         * @returns {*}
         * @private
         */
        setDriverScriptContent: function (scope, path, content, readyCB, errorCB) {
            return this.callMethodEx(null, 'setDriverContent', [scope, path, content], readyCB, true);
        },
        /***
         * getDriverScriptContent is receiving a driver's actual code in a given scope
         * @param scope {string}
         * @param path  {string}
         * @param readyCB   {function}
         * @param errorCB   {function}
         * @returns {*}
         */
        getDriverScriptContent: function (scope, path, readyCB, errorCB) {
            return this.callMethodEx(null, 'getDriverContent', [scope, path], readyCB, true);
        },
        createStore:function(data,scope,track){
            var storeClass = declare('deviceStore',[TreeMemory,Trackable,ObservableStore],{});
            var store = new storeClass({
                data: data.items,
                idProperty: 'path',
                Model:Device,
                id:utils.createUUID(),
                scope:scope,
                observedProperties:[
                    "name",
                    "state",
                    "iconClass",
                    "enabled"
                ]
            });

            if(scope && track!==false){
                this.setStore(scope,store);
            }
            return store;
        },
        /**
         *
         * @param data
         * @returns {exports|module.exports|module:xcf/data/Store}
         * @private
         */
        initStore: function (data,scope,track) {
            return this.createStore(data,scope,track);
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Utils
        //
        /////////////////////////////////////////////////////////////////////////////////////
        /**
         *
         * @param item
         * @private
         */
        fixDeviceCI:function(item){
            var meta = item['user'];
            var driverOptions= utils.getCIByChainAndName(meta, 0, DEVICE_PROPERTY.CF_DEVICE_DRIVER_OPTIONS);
            if(!driverOptions) {
                meta.inputs.push({
                    "chainType": 0,
                    "class": "cmx.types.ConfigurableInformation",
                    "dataRef": "",
                    "dataSource": "",
                    "description": null,
                    "enabled": true,
                    "enumType": "-1",
                    "flags": -1,
                    "group": 'Common',
                    "id": DEVICE_PROPERTY.CF_DEVICE_DRIVER_OPTIONS,
                    "name": DEVICE_PROPERTY.CF_DEVICE_DRIVER_OPTIONS,
                    "order": 1,
                    "params": null,
                    "platform": null,
                    "title": "Driver Options",
                    "type": 5,
                    "uid": "-1",
                    "value":0,
                    "data":[
                        {
                            value: 2,
                            label: 'Runs Server Side'
                        },
                        {
                            value: 4,
                            label: 'Show Debug Messages'
                        },
                        {
                            value: 8,
                            label: 'Allow Multiple Device Connections'
                        },
                        {
                            value: 16,
                            label: 'Server'
                        }

                    ],
                    "visible": true,
                    "device": item
                });
            }else{
                driverOptions.data = [
                    {
                        value: 2,
                        label: 'Runs Server Side'
                    },
                    {
                        value: 4,
                        label: 'Show Debug Messages'
                    },
                    {
                        value: 8,
                        label: 'Allow Multiple Device Connections'
                    },
                    {
                        value: 16,
                        label: 'Server'
                    }

                ];

                driverOptions.group = 'Common'
            }


            var loggingFlags= utils.getCIByChainAndName(meta, 0, DEVICE_PROPERTY.CF_DEVICE_LOGGING_FLAGS);
            if(!loggingFlags) {
                meta.inputs.push({
                    "chainType": 0,
                    "class": "cmx.types.ConfigurableInformation",
                    "dataRef": "",
                    "dataSource": "",
                    "description": null,
                    "enabled": true,
                    "enumType": "-1",
                    "flags": -1,
                    "group": 'Logging',
                    "id": DEVICE_PROPERTY.CF_DEVICE_LOGGING_FLAGS,
                    "name": DEVICE_PROPERTY.CF_DEVICE_LOGGING_FLAGS,
                    "order": 1,
                    "params": null,
                    "platform": null,
                    "title": "Logging Flags",
                    "type": DEVICE_PROPERTY.CF_DEVICE_LOGGING_FLAGS,
                    "uid": "-1",
                    "value":0,
                    "data":[
                        {
                            value: 2,
                            label: 'On Connected'
                        },
                        {
                            value: 4,
                            label: 'On Disconnected'
                        },
                        {
                            value: 8,
                            label: 'On Error'
                        },
                        {
                            value: 16,
                            label: 'Commands'
                        },
                        {
                            value: 32,
                            label: 'Responses'
                        }
                    ],
                    "visible": true,
                    "device": item
                });
            }else{
                loggingFlags.group = "Logging"
            }


            var protocolCI = utils.getCIByChainAndName(meta, 0, DEVICE_PROPERTY.CF_DEVICE_PROTOCOL);
            if(protocolCI){
                protocolCI.type = 3;
                protocolCI.options = [
                    {
                        label:"TCP",
                        value:"tcp"
                    },
                    {
                        label:"UDP",
                        value:"udp"
                    },
                    {
                        label:"Driver",
                        value:"driver"
                    },
                    {
                        label:"SSH",
                        value:"ssh"
                    },
                    {
                        label:"Serial",
                        value:"serial"
                    },
                    {
                        label:"MQTT",
                        value:"mqtt"
                    }
                ]
            }
        },
        _deviceInfoCache:null,
        /**
         * Return handy info for a device
         * @param {module:xcf/model/Device} item
         * @returns {module:xide/types~DeviceInfo|null}
         */
        toDeviceControlInfo: function (item) {            
            if(!item){
                return null;
            }

            var hash = item.hash;
            if(!has('xcf-ui') && hash && !has('host-node')) {
                if(this._deviceInfoCache[hash]){
                    return this._deviceInfoCache[hash];
                }
            }
            if(!item._store && item.id){
                var _item = this.getItemById(item.id);
                if(_item){
                    item = _item;
                }
            }
            if(!item || !item.path){
                _debug && console.error('not a device');
                var _item = this.getDeviceStoreItem(item);
                if(!_item){
                    return null;
                }
            }
            _debug && !item && console.error('toDeviceControlInfo: invalid device item');
            _debug && !item.user && console.error('toDeviceControlInfo: invalid device item, has no meta');
            
            var meta = item['user'],
                host = utils.getCIInputValueByName(meta, DEVICE_PROPERTY.CF_DEVICE_HOST),
                port = utils.getCIInputValueByName(meta, DEVICE_PROPERTY.CF_DEVICE_PORT),
                title = utils.getCIInputValueByName(meta, DEVICE_PROPERTY.CF_DEVICE_TITLE),
                protocol = utils.getCIInputValueByName(meta, DEVICE_PROPERTY.CF_DEVICE_PROTOCOL),
                driverId = utils.getCIInputValueByName(meta, DEVICE_PROPERTY.CF_DEVICE_DRIVER),
                options = utils.getCIInputValueByName(meta, DEVICE_PROPERTY.CF_DEVICE_OPTIONS),
                loggingFlags = utils.getCIInputValueByName(meta, DEVICE_PROPERTY.CF_DEVICE_LOGGING_FLAGS),
                driverOptions = utils.getCIInputValueByName(meta, DEVICE_PROPERTY.CF_DEVICE_DRIVER_OPTIONS),
                serverSide = item.isServerSide(),
                isServer = item.isServer(),
                result = null;

            this.fixDeviceCI(item);
            var driver = this.ctx.getDriverManager().getDriverById(driverId);
            if (driver) {
                var driverMeta = driver['user'],
                    script = utils.getCIInputValueByName(driverMeta, types.DRIVER_PROPERTY.CF_DRIVER_CLASS),
                    responseCI = utils.getCIByChainAndName(driverMeta, 0, types.DRIVER_PROPERTY.CF_DRIVER_RESPONSES),
                    responseSettings = {},
                    driverScope = driver['scope'];

                if (responseCI && responseCI['params']) {
                    responseSettings = utils.getJson(responseCI['params']);
                }
                result = {
                    host: host,
                    port: port,
                    protocol: protocol,
                    driver: script ? script.replace('./', '') : '',                    
                    driverId:driverId,
                    driverScope: driverScope,
                    id: item.id,
                    devicePath:item.path,
                    deviceScope:item.getScope(),
                    title:title,                    
                    options:options,                    
                    driverOptions:driverOptions,
                    serverSide:serverSide,
                    isServer:isServer,
                    responseSettings:responseSettings,
                    source:isIDE ? 'ide' : 'server',
                    user_devices:this.ctx.getMount(item.getScope()),
                    system_devices:this.ctx.getMount('system_devices'),
                    system_drivers:this.ctx.getMount('system_drivers'),
                    user_drivers:this.ctx.getMount('user_drivers'),
                    loggingFlags:loggingFlags,
                    toString:function(){
                        return item.getScope() +'://' + this.host + ':'+this.port+'@'+this.protocol;
                    }
                };

                result.hash = MD5(JSON.stringify({
                    host: host,
                    port: port,
                    protocol: protocol,
                    driverId:driverId,
                    driverScope: driverScope,
                    id: item.id,
                    devicePath:item.path,
                    deviceScope:item.getScope(),
                    source:isIDE ? 'ide' : 'server',
                    user_devices:this.ctx.getMount(item.getScope()),
                    system_devices:this.ctx.getMount('system_devices'),
                    system_drivers:this.ctx.getMount('system_drivers'),
                    user_drivers:this.ctx.getMount('user_drivers')
                }), 1);
                
                var userDirectory = this.ctx.getUserDirectory();
                
                if(userDirectory){
                    result.userDirectory = userDirectory;
                }
                
            }else{
                _debug && console.error('cant find driver ' + driverId + ' for '+ item.toString());
            }


            item.info = result;

            if(!has('xcf-ui') && hash && !has('host-node')) {
                this._deviceInfoCache[hash] = result;
            }

            return result;
        },
        /**
         * Return device model item by device id
         * @param itemId
         * @returns {module:xcf/model/Device} The device
         */
        getItemById: function (itemId) {

            function search(store){
                var data = store.data;
                var device = _.find(data,{
                    id: itemId
                });
                if(!device){
                    return null;
                }
                return store.getSync(device.path);
            }

            for(var scope in this.stores){
                var store = this.stores[scope];
                var result = search(store);
                if(result){
                    return result;
                }
            }
            _debug && console.error('Device Manager::getItemById : cant find device with id: ' + itemId);
        },
        /**
         * Return device model item by device id
         * @param itemId
         * @returns {module:xcf/model/Device} The device
         */
        getItemByPath: function (path) {
            function search(store){
                return store.getSync(path);
            }
            for(var scope in this.stores){
                var store = this.stores[scope];
                var result = search(store);
                if(result){
                    return result;
                }
            }
            _debug && console.error('Device Manager::getItemByPath : cant find device with path: ' + path);
        },
        /**
         *
         * @param evt
         * @private
         */
        onStoreCreated: function (evt) {
            var thiz = this,
                ctx = thiz.ctx,
                type = evt.type,
                data = evt.data,
                store = evt.store,
                items = store ? utils.queryStore(store, { isDir: false}) : [],
                owner = evt.owner,
                driverManager = this.ctx.getDriverManager();

            if(items && !_.isArray(items)){
               items = [items];
            };

            if(type!==types.ITEM_TYPE.DEVICE){
                return;
            }

            for (var i = 0; i < items.length; i++) {
                var item = store.getSync(items[i].path);
                if(!item){
                    console.error('cant find '+items[i].path);
                    continue;
                }
                if (item._completed != null) {
                    continue;
                }
                item._completed = true;

                var driverId = this.getMetaValue(item, DEVICE_PROPERTY.CF_DEVICE_DRIVER);
                if (!driverId) {
                    console.error('device has no driver id!');
                    continue;
                }
                var driver = driverManager.getItemById(driverId),
                    CIS = item.user;

                //complete CIS
                _.each(CIS.inputs,function(ci){
                    ci.device = item;
                    ci.actionTarget = isIDE ? ctx.mainView.getToolbar() : null;
                    ci.ctx = ctx;

                });
                if (!_.isEmpty(driver)) {
                    if(isIDE) {
                        this.completeDevice(store,item,driver);
                        item.iconClass = item.getStateIcon();
                    }
                }
            }
            all(this.connectToAllDevices()).then(function(){
                thiz.publish('DevicesConnected',evt);
            });
            
        },
        /**
         *
         * indirect callback for ON_SERVER_LOG_MESSAGE which tells the device server to
         * log something for us. This might be triggered by xblox/model/logging/Log
         *
         * @param evt {object}
         * @param evt.data {object}
         * @param evt.data.device {module:xide/types~DeviceInfo|null}
         * @param evt.data.details {array}
         * @param evt.data.time {integer}
         * @param evt.data.type {string}
         * @param evt.data.level {string}
         */
        onClientMessage:function(evt){
            this.checkDeviceServerConnection();
            if(this.deviceServerClient){
                _debugLogging && console.log('WRITE_LOG_MESSAGE ',evt);
                this.sendManagerCommand(types.SOCKET_SERVER_COMMANDS.WRITE_LOG_MESSAGE, evt);
            }
        },
        /**
         * 
         * @param evt
         */
        onClientLogMessage:function(evt){
            if(!isServer){
                this.onClientMessage(evt);
            }
        },
        /**
         *
         * @param evt
         * @private
         */
        onVariableChanged:function(evt){

            var variable = evt.item,
                scope = evt.scope,
                name = variable.name,
                publish = evt.publish!==false;

            //_debugMQTT && console.log('DeviceManager/onVariableChanged/variable changed: '+name + ' - publish : ' + publish);

            if(name==='value' || publish===false || !variable){
                return;
            }

            var value = variable.value,
                driver= scope.driver,
                device = scope.device;

            if(device && device.info) {

                var deviceInfo = device.info,
                    mqttTopic = deviceInfo.host + '/' + deviceInfo.port+'/Variable/' + name;

                _debugMQTT && evt.publishMQTT!==false && console.log('send mqtt message ' + mqttTopic);

                evt.publishMQTT!==false && this.sendManagerCommand(types.SOCKET_SERVER_COMMANDS.MQTT_PUBLISH, {
                    topic:mqttTopic,
                    data:{
                        value:value,
                        device:deviceInfo
                    }
                });
            }else{
                _debugMQTT && console.warn('onVariableChanged->MQTT : have no device')
            }
            //_debugMQTT && console.info('on variable changed ' + device.toString());
        },
        /***
         * Common manager function, called by the context of the application
         * @private
         */
        init: function () {
            var thiz = this;
            if(this.initUI){
                this.initUI();
            }
            this.stores = {};
            this._deviceInfoCache={};
            this.subscribe(types.EVENTS.ON_DRIVER_VARIABLE_CHANGED, this.onVariableChanged);
            this.subscribe(types.EVENTS.ON_DEVICE_SERVER_CONNECTED,function(){
                var connect = has('drivers') && has('devices');
                if (thiz.autoConnectDevices && connect) {
                    all(thiz.connectToAllDevices()).then(function(){
                        thiz.publish('DevicesConnected');
                    });
                }
            });
            this.subscribe([
                EVENTS.ON_NODE_SERVICE_STORE_READY,
                EVENTS.ON_MODULE_RELOADED,
                EVENTS.ON_DEVICE_DISCONNECTED,
                EVENTS.ON_DEVICE_CONNECTED,
                EVENTS.ON_CLIENT_LOG_MESSAGE,
                EVENTS.ON_STORE_CREATED
            ]);
            this.deviceInstances = this.consoles = {};
            this.driverScopes = {
                "system_drivers": "system_drivers/",
                "user_drivers": "user_drivers/"
            };
            this.lastUpTime = (new Date()).getTime();            
            setInterval(function () {
                var current = (new Date()).getTime();
                if (current - thiz.lastUpTime > 30000) {
                    thiz.lastUpTime = (new Date()).getTime();
                }
                thiz.lastUpTime = current;
            }, 1000);

            this.initReload();

        },
        onDeviceServerConnected:function(){
            var self = this;
            if(this.deviceInstances) {

                _.each(this.deviceInstances, function (instance) {

                    if(instance && instance.device && !instance.domNode) {
                        var device = instance.device;
                        self.startDevice(device);
                    }else{
                        console.log('invalid instance');
                    }
                    //var driverInstance = instance.driverInstance;
                    //driverInstance && driverInstance.onLostServer && driverInstance.onLostServer();
                    //device.setState(types.DEVICE_STATE.LOST_DEVICE_SERVER);
                });
            }
        },
        //nulled in server mode
        addDeviceInstance:function(device,driver){},
        /***
         * ls is enumerating all drivers in a given scope
         * @param scope{string}
         * @returns {Deferred}
         */
        ls: function (scope,track,path) {
            var dfd = new Deferred();
            function data(data) {
                try {
                    var store = this.createStore(data, scope, track === true ? false : true);
                    track!==false && this.setStore(scope,store);
                    this.onStoreReady(store);
                    track!==false && this.publish(types.EVENTS.ON_STORE_CREATED, {
                        data: data,
                        owner: this,
                        store: store,
                        type: this.itemType
                    });

                    dfd.resolve(store);

                } catch (e) {
                    logError(e, 'error ls drivers');
                }
            }
            if(has('php')) {
                this.runDeferred(null, 'ls', [scope]).then(data.bind(this));
            }else{
                if(!isServer) {
                    this._getText(require.toUrl(scope).replace('main.js', '') + scope + '.json', {
                        sync: false,
                        handleAs: 'json'
                    }).then(data.bind(this));
                }else{
                    dfd.resolve({items:[]});
                }
            }

            return dfd;
        },
        /**
         *
         * @param scope
         * @returns {*}
         */
        hasStore:function(scope){
            return this.stores[scope];
        }
    });
});

define('xcf/manager/BlockManager',[
    'dcl/dcl',
    "xdojo/declare",
    "dojo/_base/lang",
    'xide/types',
    'xide/utils',
    'xide/factory',
    'xide/manager/ManagerBase',
    'xblox/manager/BlockManager'
], function (dcl,declare, lang, types, utils, factory, ManagerBase, BlockManager) {

    return dcl([ManagerBase, BlockManager], {
        declaredClass:"xcf.manager.BlockManager",
        //nulled for server mode
        onReady:function(){},
        addDriverFunctions: function (target, source) {

            for (var i in source) {
                var o = source[i];
                if (i === 'constructor' || i === 'inherited') {
                    continue;
                }
                if (lang.isFunction(source[i]) /*&& lang.isFunction(target[i])*/) {
                    target[i] = source[i];//swap
                }
            }
        },
        /**
         * One time call per blox scope creation. This adds various functions
         * to the blox's owner object. This enables expressions to access the
         * object but also block specific functions like getVariable
         * @param obj
         * @param scope
         * @param owner
         */
        setScriptFunctions: function (obj, scope, owner) {

            var thiz = owner;
            if (!scope.context) {
                scope.context = obj;//set the context of the blox scope
            }
            /*obj._scope = scope;*/

            if (!obj.blockScope) {
                obj.blockScope = scope;
            }


            var deviceManager = this.ctx.getDeviceManager();

            //add shortcuts to the device
            if (scope.context) {

                if (scope.context.instance) {//no real driver instance!

                    scope.device = scope.context.instance;//but we have a device less instance

                    /*scope.context = scope.context.instance;*/
                    /*this.addDriverFunctions(obj,scope.context.instance);*/

                } else {
                    /*this.addDriverFunctions(obj,scope.context.instance);*/

                    /*
                    scope.device = {//we have a real device : add 'sendMessage'
                        _object: obj,
                        _scope: scope,
                        sendMessage: function (message) {

                            //case when we've been constructed with no real device
                            if (this._scope && this._scope.context && this._scope.context.instance) {
                                this._scope.context.instance.sendMessage(message);
                                return;
                            }
                            //console.log('sending device message : ' + message);
                            //xlog('sending message : ' + message);
                            //xtrace('test');
                            //xtrace('test');
                            //console.trace("Device.Manager.Send.Message : " + message, this);//sending device message
                        }
                    }
                    */
                }
            } else {
                console.error('scope has no context!');
            }

            //add various functions

            ///////////////////////////////////////////////////////////////////////////////
            //
            //  Commands
            //
            ///////////////////////////////////////////////////////////////////////////////
            /**
             * Add 'setVariable'
             * @param title
             * @param value
             */
            if (!obj.callCommand) {
                obj.callCommand = function (title) {
                    var _block = this.blockScope.getBlockByName(title);
                    if (_block) {
                        _block.solve(this.blockScope);
                    } else {
                        console.log('no such variable : ' + title);
                        return;
                    }
                };
            }

            ///////////////////////////////////////////////////////////////////////////////
            //
            //  Variables
            //
            ///////////////////////////////////////////////////////////////////////////////
            /**
             * Add 'setVariable'
             * @param title
             * @param value
             */
            if (!obj.setVariable) {
                obj.setVariable = function (title, value, save, publish, source) {
                    var _variable = this.blockScope.getVariable(title);
                    if (_variable) {

                        _variable.value = value;
                        _variable.set('value',value);
                        console.log('setting variable ' + title + ' to ' + value);
                    } else {
                        console.log('no such variable : ' + title);
                        return;
                    }


                    if (publish !== false) {
                        thiz.publish(types.EVENTS.ON_DRIVER_VARIABLE_CHANGED, {
                            item: _variable,
                            scope: scope,
                            driver: obj,
                            owner: thiz,
                            save: save === true,
                            source: source || types.MESSAGE_SOURCE.BLOX  //for prioritizing
                        });
                    }
                };
            }

            /**
             * Add getVariable
             * @param title
             */
            if (!obj.getVariable) {
                obj.getVariable = function (title) {
                    var _variable = this.blockScope.getVariable(title);
                    if (_variable) {
                        return _variable.value;
                    }
                    return '';
                };
            }

            this.inherited(arguments);
        },
        onReloaded: function () {
            this.init();
        },
        getDeviceVariablesAsEventOptions:function(scope){

            var options = [];
            var _item = function(label,value,intend,selected,displayValue){


                var string="<span style=''>" +label + "</span>";
                var pre = "";
                if(intend>0){
                    for (var i = 0; i < intend; i++) {
                        pre+="&nbsp;";
                        pre+="&nbsp;";
                        pre+="&nbsp;";
                    }
                }
                return {
                    label:pre + string,
                    label2:displayValue,
                    value:value/*,
                     selected:selected*/
                };
            };

            var driverManager = this.ctx.getDriverManager();
            var deviceManager = this.ctx.getDeviceManager();
            var items = deviceManager.getDevices(false,true);

            for (var i = 0; i < items.length; i++) {
                var device = items[i];
                var driver = device.driver;
                if(!driver){
                    continue;
                }

                var title = deviceManager.getMetaValue(device, types.DEVICE_PROPERTY.CF_DEVICE_TITLE);
                options.push(_item(title,driver.id+'/' +driver.id,0,false));

                var blockScope = driver.blockScope;
                var variables = blockScope.getVariables();


                for (var j = 0; j < variables.length; j++) {
                    var variable = variables[j];

                    var value = driver.id + '/'+ variable.id;
                    var selected = ci.value ===value;

                    options.push(_item(variable.title,value,1,selected,title + '/' + variable.title));
                }
            }
        },
        /**
         * Callback for VariableSwitch::getFields('variable').
         *
         * @param evt {object}
         * @param evt.CI {xide/types/ConfigurableInformation}
         * @param evt.owner {xblox/model/variables/Variable} The variable
         */
        onCreateVariableCI:function(evt){

            console.log('onCreateVariableCI12',evt);
            /**
             *
             * 1. check its a ui variable:
             * 2. alter CI
             *
             */
            var ci = evt.CI,
                variable = evt.owner,
                scope = variable.scope,
                isDriverVariable = scope.device!=null;

            console.log('ci value ' + ci.value);

            if(!isDriverVariable){
                return;
            }

            //  create filtering select options, pseudo code:
            //
            //  foreach(device in devices)
            //      let driver in device
            //      createSelect(device name)
            //      foreach(variable in driver)
            //          createSelect(variable,value =  )
            //
            //


            var options = [];
            var _item = function(label,value,intend,selected,displayValue){


                var string="<span style=''>" +label + "</span>";
                var pre = "";
                if(intend>0){
                    for (var i = 0; i < intend; i++) {
                        pre+="&nbsp;";
                        pre+="&nbsp;";
                        pre+="&nbsp;";
                    }
                }
                return {
                    label:pre + string,
                    label2:displayValue,
                    value:value/*,
                    selected:selected*/
                };
            };

            var driverManager = this.ctx.getDriverManager();
            var deviceManager = this.ctx.getDeviceManager();
            var items = deviceManager.getDevices(false,true);

            for (var i = 0; i < items.length; i++) {
                var device = items[i];
                var driver = device.driver;
                if(!driver){
                    continue;
                }

                var title = deviceManager.getMetaValue(device, types.DEVICE_PROPERTY.CF_DEVICE_TITLE);
                options.push(_item(title,driver.id+'/' +driver.id,0,false));

                var blockScope = driver.blockScope;
                var variables = blockScope.getVariables();


                for (var j = 0; j < variables.length; j++) {
                    var variable = variables[j];

                    var value = driver.id + '/'+ variable.id;
                    var selected = ci.value ===value;

                    options.push(_item(variable.name,value,1,selected,title + '/' + variable.title));
                }
            }

            ci.options = options;

            ci.widget = {
                "class":"xide.form.FilterSelect"

            }
        }
    });
});

define('xcf/manager/DriverManager_Server',[
    'dcl/dcl',
    "dojo/_base/lang",
    'dojo/_base/declare',
    'xide/types',
    'xide/utils'
], function(dcl,lang,declare,types,utils){

    var debugDeviceMessages = false;

    function isItemPath(startNeedle,path){

        var _start = startNeedle;
        if (path.indexOf(_start) != -1) {
            var libPath = path.substr(path.indexOf(_start) + (_start.length + 1 ), path.length);
            return libPath;
        }
        return null;
    }

    return dcl(null,{
        declaredClass:'xcf.manager.DriverManager_Server',
        onDriverBlocksChanged:function(dataPath,shortPath){


            var options = [];

            var store = this.getStore() || this.store;

            if (!store) {
                console.error('getDriversAsEnumeration:: have no store!');
                return options;
            }

            var items = store.query({
                isDir: false
            });

            for (var i = 0; i < items.length; i++) {
                var driver = items[i];
                var meta = driver['user'];
                var id = utils.getInputCIByName(meta, types.DRIVER_PROPERTY.CF_DRIVER_ID);
                var title = utils.getInputCIByName(meta, types.DRIVER_PROPERTY.CF_DRIVER_NAME);
                if(!meta || !driver.blockPath){
                    continue;
                }


                if(driver.blockPath.indexOf(shortPath)!==-1){

                }


            }

        },
        onFileChanged:function(evt){

            if(evt.type!=='changed'){
                return;
            }
            if(evt._didb){
                return;
            }
            evt._didb=true;

            var path = utils.replaceAll('\\', '/', evt.path);
            path = utils.replaceAll('//', '/', path);
            path = path.replace(/\\/g,"/");

            ////data/system/drivers/SSH/Hercules.xblox'
            var isDriver = isItemPath('system/driver',path);
            if(isDriver && isDriver.indexOf('.xblox')!==-1){
                console.log('driver blocks changed ' + isDriver + ' @ '+ path, evt);
                this.onDriverBlocksChanged(path,isDriver);
            }
        },
        /**
         *
         * @param storeItem
         * @param readyCB
         */
        createDriverInstance:function(storeItem,readyCB){

            var thiz=this;
            var baseDriverPrefix = this.driverScopes['system_drivers'];

            var baseDriverRequire = baseDriverPrefix + 'DriverBase';

            //console.error(baseDriverRequire);

            require([baseDriverRequire],function(baseDriver){

                baseDriver.prototype.declaredClass=baseDriverRequire;

                var meta = storeItem['user'];
                var driverPrefix = thiz.driverScopes[storeItem['scope']];
                var driver  = utils.getCIInputValueByName(meta,types.DRIVER_PROPERTY.CF_DRIVER_CLASS);
                if(!driver){
                    console.error('cant find driver class in meta');
                    return;

                }
                var requirePath  = driverPrefix + driver;
                requirePath=requirePath.replace('.js','');
                requirePath=requirePath.replace('./','');

                console.log('create driver instance ' + requirePath);


                require([requirePath],function(driverProtoInstance){
                    var baseClass = baseDriver;
                    var baseClasses = [baseClass];

                    var driverProto = declare([baseClass],driverProtoInstance.prototype);

                    var driverInstance = new driverProto();
                    driverInstance.baseClass = baseClass.prototype.declaredClass;
                    driverInstance.modulePath = utils.replaceAll('//','/',requirePath);
                    driverInstance.delegate=thiz;
                    storeItem.instance = driverInstance;

                    if(readyCB){
                        readyCB(driverInstance);
                    }

                    try{
                        driverInstance.start();
                    }catch(e){

                    }
                    return driverInstance;
                });
            });
        },
        onDeviceDisconnected:function(evt){
            /*console.log('device disconnected');*/
        },
        onDeviceMessage:function(evt){

            if(evt && evt['device'] && evt['driverInstance']){

                debugDeviceMessages && console.log('device message ',evt);

                var _deviceInfo=evt['device'];
                var _driverInstance=evt['driverInstance'];
                var _driverOptions =_driverInstance['options'];
                if(!_driverOptions)return;

                //split message;
                var messages=[evt.deviceMessage];

                if( _.isString(evt.deviceMessage) &&
                    evt.deviceMessage.indexOf(_driverInstance.lineBreak)!=-1){
                    messages=[];
                    messages=evt.deviceMessage.split(_driverInstance.lineBreak);
                }


                //forward to blox
                if(messages.length>0){

                    var scope=this.ctx.getBlockManager().getScope(_driverOptions.id);
                    var blockStore=scope.blockStore;

                    var responseBlocks = scope.getBlocks({
                        group:types.BLOCK_GROUPS.CF_DRIVER_RESPONSE_BLOCKS
                    });

                    var responseVariables = scope.getVariables({
                        group:types.BLOCK_GROUPS.CF_DRIVER_RESPONSE_VARIABLES
                    });

                    if(!responseBlocks || responseBlocks.length==0){
                        console.log('have no response blocks, abort');
                    }
                    var responseVariable = scope.getVariable('value');
                    if(responseVariable){

                    }else{
                        responseVariable = new Variable({
                            id:utils.createUUID(),
                            title : 'value',
                            value : '',
                            scope : scope,
                            type  : 13,
                            group : 'processVariables',
                            gui:false,
                            cmd:false
                        });
                    }

                    for(var i=0; i < messages.length ; i++){

                        if(messages[i].length==0){
                            continue;
                        }

                        //update system variable 'value'
                        responseVariable.value=messages[i];
                        
                        console.log('update process value '+responseVariable.value + ' for ' + _deviceInfo.host);
                        
                        this.publish(types.EVENTS.ON_DRIVER_VARIABLE_CHANGED,{
                            item:responseVariable,
                            scope:scope,
                            owner:this
                        });

                        //now run each top-variabl block in 'conditional process'
                        for(var j=0; j < responseVariables.length ; j++){
                            //console.profile('profiling response variable');
                            if(responseVariables[j].title=='value'){
                                continue;
                            }
                            scope.expressionModel.parseVariable(scope,responseVariables[j]);
                            //console.profileEnd();
                        }

                        //now run each top-level block in 'conditional process'
                        for(var j=0; j < responseBlocks.length ; j++){
                            scope.solveBlock(responseBlocks[j],{highlight:true});
                        }


                    }

                    console.log('forward messages to scope');
                }
            }
        },
        init:function(){
            this.subscribe(types.EVENTS.ON_DEVICE_MESSAGE,this.onDeviceMessage);
            this.subscribe(types.EVENTS.ON_DEVICE_DISCONNECTED,this.onDeviceDisconnected);
        }
    });
});



define('xcf/manager/DriverManager',[
    'dcl/dcl',
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/json",
    'xide/types',
    'xcf/types/Types',
    'xide/utils',
    'xcf/manager/BeanManager',
    "xcf/model/Variable",
    'xcf/manager/DriverManager_Server',
    'xide/data/TreeMemory',
    'xide/data/ObservableStore',
    'dstore/Trackable',
    'xdojo/has',
    'xcf/model/Driver',
    "xide/manager/ServerActionBase",
    "xide/data/Reference",
    'dojo/Deferred',
    'xide/mixins/ReloadMixin',
    'xide/mixins/EventedMixin',
    'xdojo/has!xcf-ui?./DriverManager_UI',
    'xdojo/has!xcf-ui?xide/views/_CIDialog'
], function (dcl,declare, lang,json,types,fTypes,utils,
             BeanManager,Variable, DriverManager_Server,
             TreeMemory,ObservableStore,Trackable,
             has,Driver,
             ServerActionBase,Reference,Deferred,ReloadMixin,EventedMixin,DriverManager_UI,_CIDialog) {

    var bases = [
        ServerActionBase,
        BeanManager,
        DriverManager_Server
    ],
    debug = false,
    isServer = !has('host-browser'),
    runDrivers = has('runDrivers'),
    debugDeviceMessages = false;
    has('xcf-ui') && bases.push(DriverManager_UI);
    
    return dcl(bases, {
        /**
         *
         * @param driver
         * @returns {dojo/Deferred}
         */
        getDriverModule:function(driver){

            var dfd = new Deferred();

            var driverMeta = driver['user'],
                script = utils.getCIInputValueByName(driverMeta, types.DRIVER_PROPERTY.CF_DRIVER_CLASS);

            var driverScope = driver['scope'];
            script = script ? script.replace('./', '') : '';
            //script = script ? script.replace('.js', '') : '';

            var packageUrl = require.toUrl(driverScope);
            packageUrl = utils.removeURLParameter(packageUrl,'bust');
            packageUrl = utils.removeURLParameter(packageUrl,'time');
            if(has('debug') && isServer){
                packageUrl = packageUrl.replace('?','');
            }
            packageUrl =  packageUrl.replace('/main.js','');
            var isRequireJS = !require.cache;
            if(isRequireJS){
                packageUrl = packageUrl.replace('/.js','/');
            }

            var requirePath = packageUrl + '/'+ script;

            if(has('debug') && !isServer){
                requirePath+= requirePath.indexOf('?') == -1 ? '?' : '&';
                requirePath+='time'+ new Date().getTime();
            }

            try {
                require([requirePath], function (driverModule) {
                    dfd.resolve(driverModule);
                });
            }
            catch (e){
                console.error('error loading driver module from  '+packageUrl +'---' + script,e);
                logError(e,'error loading driver module');
                dfd.reject(e.message);
            }
            return dfd;
        },
        loadDriverModule:function(driver){
            var baseDriverPrefix = this.driverScopes['system_drivers'],
                baseDriverRequire = baseDriverPrefix + 'DriverBase';

            var urlBase = require.toUrl(this.driverScopes['system_drivers']);
            var url = decodeURIComponent(urlBase) + "/DriverBase";
            var self = this;
            var ctx = self.ctx,
                dfd = new Deferred(),
                _require = require;

            _require([baseDriverRequire], function (baseDriver) {

                var driverPrefix = self.driverScopes[driver.scope],
                    isRequireJS = !require.cache;

                if(isRequireJS){
                    require({
                        config:{
                            urlArgs:null
                        }
                    });
                }else{
                    require({
                        cacheBust: null
                    });
                }

                var packageUrl = require.toUrl(driverPrefix);
                if(isRequireJS){
                    packageUrl = packageUrl.replace('/.js','/');
                }
                var driverMeta = driver['user'];
                var script = utils.getCIInputValueByName(driverMeta, types.DRIVER_PROPERTY.CF_DRIVER_CLASS);
                script = script.replace('./','');
                script = script.replace('.js','');
                script = driver.scope + '/' + script;
                script = script.replace('', '').trim();
                try {
                    _require.undef(script);
                    _require([script], function (driverProtoInstance) {
                        driverProtoInstance.declaredClass = script;
                        var driverProto = dcl([baseDriver, EventedMixin.dcl, ReloadMixin.dcl, driverProtoInstance], {});
                        driverProto.getFields = driverProtoInstance.getFields;
                        function onReloaded(newModule,oldModule){
                            driverProtoInstance.getFields = newModule.getFields;
                            newModule.onReloaded = onReloaded;
                            oldModule.onReloaded = onReloaded;
                        }
                        driverProtoInstance.onReloaded = onReloaded;
                        dfd.resolve(driverProtoInstance);
                    });
                }catch(e){
                }

            });
            return dfd;
        },
        getBlock:function(url){
            var parts = utils.parse_url(url);
            parts = utils.urlArgs(parts.host);//go on with query string
            var _driver = this.getItemById(parts.driver.value),
                block  = null;

            if(_driver && _driver.blockScope){
                block = _driver.blockScope.getBlockById(parts.block.value);
            }
            return block;
        },
        getDriverByUrl:function(url){
            var parts = utils.parse_url(url);
            parts = utils.urlArgs(parts.host);//go on with query string
            return this.getItemById(parts.driver.value);
        },
        declaredClass:"xcf.manager.DriverManager",
        /**
         *
         * @param device
         * @param driver
         */
        addDeviceInstance:function(device,driver){

            driver.directory = true;

            var store = driver._store,
                parentId = driver.path,
                deviceManager = this.ctx.getDeviceManager(),
                instances = store.getSync(parentId + '_instances');

            instances = instances || store.putSync({
                    path: parentId + '_instances',
                    name: 'Instances',
                    isDir: true,
                    type: 'leaf',
                    parentId: parentId,
                    virtual: true,
                    isCommand:false,
                    icon:'fa-folder',
                    children:[]
                });



            var deviceName = deviceManager.getMetaValue(device, types.DEVICE_PROPERTY.CF_DEVICE_TITLE),
                deviceId = device.path,
                instance  = store.putSync(new Reference({
                    name:deviceName,
                    isCommand:false,
                    path: instances.path + '_instance_'+deviceId,
                    isDir: false,
                    type: 'driver_instance',
                    parentId:instances.path,
                    device:device,
                    driver:driver,
                    _mayHaveChildren:false,
                    icon:device.iconClass,
                    state:device.state
                }));

            instances.children.push(instance);

            device.addReference(instance,{
                properties: {
                    "name":true,
                    "enabled":true,
                    "state":true,
                    "iconClass":true
                },
                onDelete:false
            },true);


            !driver.instances && (driver.instances =[]);

            var instanceReference = _.find(driver.instances,{
                path:instance.path
            });

            if(instanceReference){
                console.log('instance already added ');
                driver.instances.remove(instanceReference);
            }

            driver.instances.push(instance);
        },
        /***
         * The Bean-Manager needs a unique name of the bean:
         */
        beanNamespace: 'driver',
        /***
         * The Bean-Manager has some generic function like creating Dialogs for adding new items, please
         * provide a title for the interface.
         */
        beanName: 'Driver',
        /**
         * the icon class for bean edit views
         */
        beanIconClass:'fa-exchange',
        /**
         * Bean group type
         */
        groupType: types.ITEM_TYPE.DRIVER_GROUP,
        /**
         * Bean item type
         */
        itemType: types.ITEM_TYPE.DRIVER,
        /**
         * The name of the CI in the meta database for the title or name.
         */
        itemMetaTitleField:types.DRIVER_PROPERTY.CF_DRIVER_NAME,
        /**
         * the default scope for new items
         */
        defaultScope: 'system_drivers',
        /***
         * The RPC server class:
         */
        serviceClass: 'XCF_Driver_Service',
        /***
         * A copy of all divers raw da4ta from the server
         */
        rawData: null,
        /***
         * {module:xide/data/TreeMemory}
         */
        store: null,
        /***
         * {xcf.views.DriverTreeView}
         */
        treeView: null,
        /**
         * array of driver store scopes : TODO : tbr
         */
        driverScopes: null,
        _isLoading: false,
        removeDriverInstance:function(instance,device){

            var driver = instance.driver,
                driverStore = driver._store,
                parentId = driver.path,
                deviceId = device.path,
                instanceId = parentId + '_instances_instance_'+deviceId,
                instanceReferenceItem = driverStore.getSync(instanceId);

            instanceReferenceItem && driverStore.removeSync(instanceId);

            //"Audio-Player/VLC.meta.json_instances_instance_Audio-Player/VLC.meta.json"
            var instanceReference = _.find(driver.instances,{
                path:instanceId
            });

            if(instanceReference){
                //instanceReference.destroy();
                driver.instances.remove(instanceReference);
            }


            device.removeReference(instanceReferenceItem);

            if(instanceReferenceItem) {
                instanceReferenceItem.refresh();
                driverStore.getSync(parentId + '_instances').refresh();
            }else{
                debug && console.error('bad!! cant find reference for instance',arguments);;
            }

        },
        onReloaded: function () {
            return;
        },
        _onReloaded: function () {

            return;

            /*

            var currentItem = this.getItem();
            if (!currentItem) {
                currentItem = {
                    path: ""
                }
            }
            var parent = currentItem ? currentItem.isDir === true ? currentItem.path : '' : '';
            var scope = 'system_drivers';


            var templateUrlMeta = require.toUrl('xcfnode/data/driver/system/Default.meta.json');
            var meta = utils.getJson(this._getText(templateUrlMeta));


            var templateUrlDriverCode = require.toUrl('xcfnode/data/driver/system/Default.js');
            var driverCode = this._getText(templateUrlDriverCode);

            //console.log('template url : ' + templateUrlDriverCode + " : " + driverCode );
            //console.log('template url : ' + templateUrlDriverCode + " : " + driverCode );
            console.log('get json : ', meta);


            var nameCi = utils.getInputCIByName(meta, types.DRIVER_PROPERTY.CF_DRIVER_NAME);
            var idCi = utils.getInputCIByName(meta, types.DRIVER_PROPERTY.CF_DRIVER_ID);
            idCi.value = utils.createUUID();

            nameCi.value = 'My New Driver2';


            var thiz = this;
            var actionDialog = new CIActionDialog({
                title: 'New Driver',
                resizable: true,
                delegate: {
                    onOk: function (dlg, data) {
                        if (nameCi.value !== 'Default') {
                            try {
                                var metaOut = JSON.stringify(meta, null, 2);
                                if (parent.length == 0) {
                                    parent = "/";
                                }
                                thiz.createItem(scope, parent, nameCi.value, metaOut, driverCode).then(function (data) {

                                    var newItem = thiz.createNewItem(title, scope, parent);
                                    newItem.user = meta;
                                    thiz.store.putSync(newItem);

                                    thiz.publish(types.EVENTS.ON_STORE_CHANGED, {
                                        owner: thiz,
                                        store: thiz.store,
                                        action: types.NEW_FILE,
                                        item: newItem
                                    });

                                    //console.log('did create driver ', data);


                                });
                            } catch (e) {
                                console.error('error in CIDialog', e);
                            }
                        }
                    }
                },
                cis: [
                    nameCi,
                    utils.createCI('Scope', 3, 'system_devices', {
                        group: 'Common',
                        options: [
                            {
                                label: 'System',
                                value: 'system_devices'
                            },
                            {
                                label: 'User',
                                value: 'user_devices'
                            },
                            {
                                label: 'App',
                                value: 'app_devices'
                            }
                        ]
                    })
                ]
            });
            actionDialog.show();
            actionDialog.resize();*/
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Device messaging
        //
        /////////////////////////////////////////////////////////////////////////////////////
        /**
         * Secondary entry for incoming device messages. This is a regular callback
         * for the system event xcf.types.EVENTS.ON_DEVICE_MESSAGE emitted by the
         * DeviceManager. It comes with the device info, a driver instance and the
         * unfiltered device message.
         *
         * This function is primarily in charge to :
         * 1. split the message by a delimiter (driver settings)
         * 2. pass the device messages to the actual driver
         * 3. pass the device message to blox
         * 4.
         *
         * @param evt
         */

        onDeviceMessage: function (evt) {


            return;
            if (!evt || !evt.device || !evt.driverInstance) {
                return;
            }
            var _deviceInfo = evt['device'],
                _driverInstance = evt['driverInstance'],
                _driverOptions = _driverInstance['options'];

            if (!_driverOptions)return;

            if (!_driverInstance.responseSettings) {
                console.error('driver has no response settings!');
                return;
            }

            var serverSide = _driverOptions.serverSide;
            var deviceMessage  = evt.deviceMessage;

            debugDeviceMessages && console.log('device message',evt);

            //split string into messages, using the driver's delimiter
            var messages = [deviceMessage];
            if (_.isString(deviceMessage)) {
                messages = _driverInstance.split(deviceMessage);
            }

            var _messages = [];
            /*
            var _messages = _driverInstance.onMessageRaw({
                device: evt.device,
                message:deviceMessage,
                bytes:evt.bytes
            });
            */

            if(_messages){
                messages = _.isArray(_messages) ? _messages : [_messages];
                console.log(' : have ' +messages.length + ' messages');
            }

            /***
             * At this point, we should reject incoming traffic
             */
            if (_driverInstance.hasMessages() && _driverInstance.sendSettings.send.mode) {
                //console.error('abort incoming, have still messages to send');
                //return;
            }

            debugDeviceMessages && console.log('Driver Manager : onDeviceMessage ',evt);

            //forward to blox
            if (messages.length > 0) {

                var scope = _driverInstance.blockScope;

                var responseBlocks = scope.getBlocks({
                    group: types.BLOCK_GROUPS.CF_DRIVER_RESPONSE_BLOCKS
                });

                var responseVariables = scope.getVariables({
                    group: types.BLOCK_GROUPS.CF_DRIVER_RESPONSE_VARIABLES
                });

                if (!responseBlocks || responseBlocks.length == 0) {
                    //console.log('have no response blocks, abort');
                }
                var responseVariable = scope.getVariable('value');
                if (responseVariable) {

                } else {

                    responseVariable = new Variable({
                        id: utils.createUUID(),
                        name: 'value',
                        value: '',
                        scope: scope,
                        type: 13,
                        group: 'processVariables',
                        gui: false,
                        cmd: false
                    });
                    scope.blockStore.putSync(responseVariable);
                }



                for (var i = 0; i < messages.length; i++) {

                   if (messages[i].length == 0) {
                        continue;
                    }

                    responseVariable.value = messages[i];


                    this.publish(types.EVENTS.ON_DRIVER_VARIABLE_CHANGED, {
                        item: responseVariable,
                        scope: scope,
                        owner: this,
                        save: false,                         //dont save it
                        source: types.MESSAGE_SOURCE.DEVICE  //for prioritizing
                    });
                    var runVariables = false;
                    var runBlocks = false;

                    //now run each top-variabl block in 'conditional process'
                    for (var j = 0; j < responseVariables.length; j++) {

                        var _var = responseVariables[j];
                        if (responseVariables[j].title == 'value') {
                            continue;
                        }

                        var _varResult = null;
                        var _cValue = responseVariable.value;


                        if (!(typeof _cValue == "number")) {
                            _cValue = '' + _cValue;
                            _cValue = "'" + _cValue + "'";
                        }


                        var prefix = "var value = " + _cValue + ";";

                        var _varResult = _cValue;

                        /*
                        try {
                            //_varResult = scope.expressionModel.parseVariable(scope, _var, prefix, false, false);
                        } catch (e) {
                            console.error('parsing response variable ' + _var.title + ' failed');
                            this.publish(types.EVENTS.ON_BLOCK_EXPRESSION_FAILED, {
                                item: _var,
                                scope: scope,
                                owner: this,
                                deviceInfo: _deviceInfo
                            });
                        }
                        */

                        if (_var.target && _var.target != 'None' && _varResult != null && _varResult != 'null' && _varResult != "'null'") {

                            var targetVariable = scope.getVariable(_var.target);
                            if (targetVariable) {

                                targetVariable.value = _varResult;
                                this.publish(types.EVENTS.ON_DRIVER_VARIABLE_CHANGED, {
                                    item: targetVariable,
                                    scope: scope,
                                    owner: this,
                                    save: false,
                                    source: types.MESSAGE_SOURCE.BLOX  //for prioritizing
                                });
                            }
                        }
                    }

                    if( (isServer && serverSide) || (!serverSide && !isServer)) {

                        for (var j = 0; j < messages.length; j++) {
                            var message = messages[j];
                            if(_.isObject(message)) {
                                if (message.src) {

                                    var block = scope.getBlockById(message.src);
                                    if(block && block.onData){
                                        block.onData(message);
                                    }
                                }
                            }
                        }


                        if(!runDrivers){
                            return;
                        }
                        //now run each top-level block in 'conditional process'
                        for (var j = 0; j < responseBlocks.length; j++) {

                            var block = responseBlocks[j];

                            if (block.enabled == false) {
                                continue;
                            }
                            block.override = {
                                args: _var ? [_var.value] : null
                            };
                            try {
                                scope.solveBlock(responseBlocks[j], {
                                    highlight: isServer ? false : true
                                });
                            } catch (e) {
                                logError(e,'----solving response block crashed ')
                                debug && console.trace();
                            }
                        }
                    }
                }
            }
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  CI related
        //
        /////////////////////////////////////////////////////////////////////////////////////
        _driverQueryCache:null,
        _getDriverById: function (id,store) {
            var items = utils.queryStore(store, {
                isDir: false
            });

            if (!_.isArray(items)) {
                items = [items];
            }

            var diver = null;

            for (var i = 0; i < items.length; i++) {
                var driver = items[i];
                var meta = driver['user'];
                var _id = utils.getInputCIByName(meta, types.DRIVER_PROPERTY.CF_DRIVER_ID);
                if (!_id) {
                    continue;
                }
                if (_id.value == id) {
                    return store.getSync(driver.path);
                    return driver;
                }
            }
            return null;
        },
        getDriverById: function (id,store) {

            if(store){
                return this._getDriverById(id,store);
            }

            var options = [];
            var result = null;
            var self = this;

            var driver = null;

            if(!has('xcf-ui') && !has('host-node')){
                !this._driverQueryCache && (this._driverQueryCache={});
                if(this._driverQueryCache[id]){
                    return this._driverQueryCache[id];
                }
            }

            function search(_store) {
                return self._getDriverById(id,_store);
            }

            for(var scope in this.stores){

                var store = this.stores[scope];
                result = search(store);
                if(result){
                    driver = result;
                    break;
                }
            }
            if(!has('xcf-ui') && driver && !has('host-node')){
                this._driverQueryCache[id] = driver;
            }

            return driver;
        },
        getDriverByPath: function (path) {

            var options = [];
            var result = null;

            function search(store) {

                var items = utils.queryStore(store, {
                    isDir: false
                });

                if (!_.isArray(items)) {
                    items = [items];
                }

                for (var i = 0; i < items.length; i++) {
                    var driver = items[i];
                    if (driver.path == path) {
                        return driver;
                    }
                }
                return null;
            }

            for(var scope in this.stores){

                var store = this.stores[scope];
                result = search(store);
                if(result){
                    return result;
                }
            }
            return null;
        },

        getItemById: function (itemId) {
            return this.getDriverById(itemId);
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Data related
        //
        /////////////////////////////////////////////////////////////////////////////////////
        /**
         *  Callback when a blox scope has been created. This is being used
         *  to deserialize the driver's CI meta settings into a blox scope : variables, commands
         * @param scope
         */
        onNewDriverScopeCreated: function (scope) {},
        onScopeCreated: function (evt) {},
        onDeviceDisconnected: function (evt) {},
        onDriverCreated: function (store) {
            has('xcf-ui') && types.registerEnumeration('Driver', this.getDriversAsEnumeration(store));
        },
        onDriverRemoved: function (store,item) {
            has('xcf-ui') && types.registerEnumeration('Driver', this.getDriversAsEnumeration(store));
        },
        onStoreReady: function (store) {
            has('xcf-ui') && types.registerEnumeration('Driver', this.getDriversAsEnumeration(store));
        },
        onStoreCreated: function (evt) {
            var type = evt.type,
                data = evt.data,
                store = evt.store,
                items = store.query({
                    isDir: false
                }),
                owner = evt.owner;

            if(type!==types.ITEM_TYPE.DRIVER){
                return;
            }

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item._completed != null || item.name === 'Default') {
                    continue;
                }
                item._completed = true;
                if(has('xcf-ui')) {
                    this.completeDriver(store, item, item);
                }
            }
        },

        /***
         * Inits the store with the driver data
         * @param data
         * @returns {xide.data.TreeMemory}
         */
        createStore:function(data,scope,track){
            
            var storeClass = declare('driverStore',[TreeMemory,Trackable,ObservableStore],{});
            var store = new storeClass({
                data: data.items,
                Model:Driver,
                idProperty: 'path',
                scope:scope,
                id:utils.createUUID(),
                observedProperties:[
                    "name",
                    "enabled"
                ]
            });

            if(scope && track!==false){
                this.setStore(scope,store);
            }

            return store;
        },
        /***
         * Inits the store with the driver data
         * @param data
         * @returns {xide.data.TreeMemory}
         */
        initStore:function(data,scope,track){
            var store = this.createStore(data,scope,track);
            return store;
        },
        getStore:function(scope){
            scope = scope || 'system_drivers'
            var store = this.stores[scope];
            if(store){
                return store;
            }
            return this.ls(scope);
        },
        /***
         * ls is enumerating all drivers in a given scope
         * @param scope{string}
         * @returns {Deferred}
         */
        ls: function (scope,track) {

            var dfd = new Deferred();
            function data(data) {
                try {

                    var store = this.createStore(data, scope,track);
                    track!==false && this.setStore(scope,store);

                    this.onStoreReady(store);

                    track!==false && this.publish(types.EVENTS.ON_STORE_CREATED, {
                        data: data,
                        owner: this,
                        store: store,
                        type: this.itemType
                    });

                    dfd.resolve(store);

                } catch (e) {
                    logError(e, 'error ls drivers');
                }
            }

            if(has('php')) {
                this.runDeferred(null, 'ls', [scope]).then(data.bind(this));
            }else{
                if(!isServer) {
                    var def = this._getText(require.toUrl(scope).replace('main.js', '') + scope + '.json', {
                        sync: false,
                        handleAs: 'json'
                    }).then(data.bind(this));
                }else {
                    dfd.resolve({items:[]});
                }
            }

            return dfd;
        },
        /***
         * Common manager function, called by the context of the application
         */
        init: function () {
            var thiz = this,
                EVENTS = types.EVENTS;
            this.stores = {};
            this.subscribe([
                EVENTS.ON_SCOPE_CREATED,
                EVENTS.ON_STORE_CREATED
            ]);

            //replay block exceptions to log messages
            this.subscribe(EVENTS.ON_BLOCK_EXPRESSION_FAILED, function (evt) {

                thiz.publish(EVENTS.ON_SERVER_LOG_MESSAGE, {
                    data: {
                        type: 'Expression',
                        device: evt.deviceInfo
                    },
                    level: 'error',
                    message: 'Expression Failed: ' + evt.item.title + ' : ' + evt.item.value
                });
            });

            this.driverScopes = {
                "system_drivers": "system_drivers/",
                "user_drivers": "user_drivers/"
            };
        }
    });
});

define('xcf/mainr.js',[
    "xcf/types",
    "xcf/types/Types",
    "xcf/model/Command",
    "xcf/model/Device",
    "xcf/model/Driver",
    "xcf/model/ModelBase",
    "xcf/model/Variable",
    "xcf/factory/Blocks",
    "xcf/manager/BeanManager",
    "xcf/manager/DeviceManager",
    "xcf/manager/BlockManager",
    "xcf/manager/DriverManager",
    "xcf/manager/DriverManager_Server"
], function () {

});
