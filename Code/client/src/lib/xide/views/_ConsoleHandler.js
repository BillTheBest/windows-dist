/** @module xide/view/_Console **/
define([
    "dcl/dcl",
    'xide/utils',
    "dojo/_base/lang", // lang.getObject
    "xide/_base/_Widget"
], function (dcl, utils, lang, _Widget) {

    return dcl(null, {

        owner: null,
        onServerResponse: function (theConsole, data, addTimes) {

            if (theConsole && data && theConsole.owner && theConsole.owner.onServerResponse) {
                theConsole.owner.onServerResponse(data, addTimes);
            }
        },
        runBash: function (theConsole, value, cwd) {

            var thiz = this;
            var server = ctx.fileManager;
            var _value = server.serviceObject.base64_encode(value);
            server.runDeferred('XShell', 'run', ['sh', _value, cwd]).then(function (response) {
                thiz.onServerResponse(theConsole,response, false);
            });
        },

        runPHP: function (theConsole, value, cwd) {
            var thiz = this;
            var server = ctx.fileManager;
            var _value = server.serviceObject.base64_encode(value);
            server.runDeferred('XShell', 'run', ['php', _value, cwd]).then(function (response) {
                thiz.onServerResponse(theConsole, response, false);
            });

        },
        runJavascript: function (theConsole, value, context, args) {

            var _function = new Function("{" + value + "; }");
            var response = _function.call(context, args);
            if (response != null) {
                //console.error('response : ' + response);
                this.onServerResponse(theConsole, response);
                return response;
            }
            return value;
        },
        onConsoleCommand: function (data, value) {


            var thiz = this,
                theConsole = data.console;


            if (theConsole.type === 'sh') {

                value = value.replace(/["'`]/g, "");



                thiz.onServerResponse(theConsole,"<pre style='font-weight: bold'># " + value + "</pre>", true);

                var dstPath = null;

                if (this.owner && this.owner.getCurrentFolder) {
                    var cwd = this.owner.getCurrentFolder();
                    if (cwd) {
                        dstPath = utils.buildPath(cwd.mount, cwd.path, false);
                    }
                }
                console.log('run bash in ' + dstPath);
                if (theConsole.isLinked()) {
                    //dstPath = this.getCurrentPath();
                }
                return this.runBash(theConsole, value, dstPath);
            }

            if (theConsole.type === 'php') {

                value = value.replace(/["'`]/g, "");

                var dstPath = null
                if (theConsole.isLinked()) {
                    dstPath = this.getCurrentPath();
                }
                return this.runPHP(theConsole, value, dstPath);
            }

            if (theConsole.type === 'javascript') {
                return this.runJavascript(theConsole, value);
            }
        },
        onConsoleEnter: function (data, input) {
            return this.onConsoleCommand(data, input);
        }
    });
});