define([
    "dojo/_base/declare",
    'xide/utils',
    'require',
    'xide/views/TitlePane',
    'xide/views/ActionTogglePane'
], function (declare, utils, require, TitlePane, ActionTogglePane) {
    return declare("xcf.widgets.CommandSettingsRenderUtils", null, {
        /**
         * Internale factory to create an action toggle pane
         * @param name
         * @param options
         * @returns {xide.views.ActionTogglePane}
         */
        createActionTogglePane: function (name, options, actions) {

            return utils.addWidget(ActionTogglePane, {
                title: name,
                open: options['open'] != null ? options['open'] : true,
                lazy: options['lazy'] != null ? options['lazy'] : false,
                delegate: this,
                toggleable: true,
                actions: actions || [
                    {
                        title: 'Add',
                        icon: ' el-icon-plus',
                        place: 'last',
                        emit: false,
                        style: '',
                        handler: null
                    }
                ]
            }, this, this.containerNode, true);
        },
        /**
         * Standard Title Pane
         * @param name
         * @param options
         * @returns {xide.views.TitlePane}
         */
        createTitlePane: function (name, options) {
            return utils.addWidget(TitlePane, {
                title: name,
                open: options['open'] != null ? options['open'] : true,
                lazy: options['lazy'] != null ? options['lazy'] : false,
                delegate: this
            }, this, this.containerNode, true);
        },
        _createSettingsPane: function (open) {

            var thiz = this;
            this.settingsPane = this.createTitlePane('Settings', {
                open: open,
                lazy: !open
            });


            var settings = utils.getJson(this.userData['params']) || {
                    constants: {
                        start: '',
                        end: ''
                    },
                    send: {
                        mode: false,
                        interval: 500,
                        timeout: 500,
                        onReply: ''
                    }
                };
            var settingsPane = utils.templatify(
                null,
                this._getText(require.toUrl('./templates/commandSettings.html')),
                this.settingsPane,
                {
                    baseClass: 'settings',
                    start: settings.constants.start,
                    end: settings.constants.end,
                    interval: settings.send.interval,
                    timeout: settings.send.timeout,
                    sendMode: settings.send.mode,
                    onReply: settings.send.onReply,
                    settings: settings
                }, null
            );

            if (settings.send.mode) {
                settingsPane.rReply.set('checked', true);
            } else {
                settingsPane.rInterval.set('checked', true);
            }

            var _onSettingsChanged = function () {
                //update params field of our ci
                thiz.userData['params'] = JSON.stringify(settingsPane.settings);
                thiz.save();

            };


            //wire events
            dojo.connect(settingsPane.wStart, "onChange", function (item) {
                settingsPane.settings.constants.start = item;
                _onSettingsChanged();
            });
            dojo.connect(settingsPane.wEnd, "onChange", function (item) {
                settingsPane.settings.constants.end = item;
                _onSettingsChanged();
            });

            dojo.connect(settingsPane.wInterval, "onChange", function (item) {
                settingsPane.settings.send.interval = item;
                _onSettingsChanged();
            });
            dojo.connect(settingsPane.wTimeout, "onChange", function (item) {
                settingsPane.settings.send.timeout = item;
                _onSettingsChanged();
            });

            dojo.connect(settingsPane.wOnReply, "onChange", function (item) {
                settingsPane.settings.send.onReply = item;
                _onSettingsChanged();
            });

            dojo.connect(settingsPane.rReply, "onChange", function (item) {
                settingsPane.settings.send.mode = item;
                _onSettingsChanged();
            });
            return settingsPane;

        }
    });
});
