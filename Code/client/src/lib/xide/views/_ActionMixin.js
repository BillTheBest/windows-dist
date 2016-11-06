define([
    "dojo/_base/declare",
    'dojo/_base/lang',
    "xide/utils",
    "xide/types",
    'xide/Keyboard',
    'xaction/Action',
    'xide/mixins/EventedMixin'
], function (declare,lang,utils,types,Keyboard, Action,EventedMixin) {
    /**
     * Provides tools to deal with 'actions' (xaction/Action). This is the model part for actions which is being used
     * always together with the render part(xide/widgets/_MenuMixin) in a subclass.
     *
     * @mixin module:xide/mixins/ActionMixin
     */
    var Implementation = {
        /**
         *
         * @param title
         * @param command
         * @param group
         * @param icon
         * @param handler
         * @param accelKey
         * @param keyCombo
         * @param keyProfile
         * @param keyTarget
         * @param keyScope
         * @param mixin
         * @returns {{title: *, command: *, group: *, icon: *, handler: *, accelKey: *, keyCombo: *, keyProfile: *, keyTarget: *, keyScope: *}}
         */
        createActionParameters:function(title, command, group, icon, handler, accelKey, keyCombo, keyProfile, keyTarget, keyScope,mixin){
            return {
                title: title,
                command: command,
                group: group,
                icon: icon,
                handler: handler,
                accelKey: accelKey,
                keyCombo: keyCombo,
                keyProfile: keyProfile,
                keyTarget: keyTarget,
                keyScope: keyScope,
                mixin:mixin
            };
        },
        /**
         *
         * @param where
         * @param action
         * @returns {boolean}
         */
        addAction:function(where,action){
            var actions = where || [],
                thiz = this;

            var eventCallbackResult = this._emit('addAction',action);
            if(eventCallbackResult===false){
                return false;

            }else if(_.isObject(eventCallbackResult)){
                utils.mixin(action,eventCallbackResult);
            }
            actions.push(action);
            return true;
        }
    };

   //package via declare
    var _class = declare("xide/views/_ActionMixin",[EventedMixin,Keyboard],Implementation);
    _class.Implementation = Implementation;
    _class.createActionParameters = Implementation.createActionParameters;
    return _class;

});
