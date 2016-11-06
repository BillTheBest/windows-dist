define([
        "dojo/_base/declare"
    ],
    function (declare) {
        return declare("xide.layout.ToggleSplitterMixin", null, {
            _restoreToggleSplitters: function () {
                var store = this.ctx.getSettingsManager().getStore();
                if (store) {

                    var data = storeUtils.queryStoreEx(store, {id: 'splitter'}, true, true);
                    if (data) {
                        data = data.data;
                        if (data) {
                            if (this.layoutLeft && this.layoutLeft._splitterWidget) {
                                var state = this._getState('left', data);
                                if (state) {
                                    this.layoutLeft._splitterWidget.set('state', state);
                                }
                            }
                            if (this.layoutRight && this.layoutRight._splitterWidget) {
                                var state = this._getState('right', data);
                                if (state) {
                                    this.layoutRight._splitterWidget.set('state', state);
                                }
                            }
                            if (this.layoutBottom && this.layoutBottom._splitterWidget) {
                                var state = this._getState('bottom', data);
                                if (state) {
                                    this.layoutBottom._splitterWidget.set('state', state);
                                }
                            }
                        }

                    }
                }
            },
            onChangeToggleSplitterState: function (splitter, state) {

                if (!this.persistent) {
                    return;
                }

                var splitterData = [];
                if (this.layoutLeft && this.layoutLeft._splitterWidget) {
                    splitterData.push({region: 'left', state: this.layoutLeft._splitterWidget.state});
                }
                if (this.layoutRight && this.layoutRight._splitterWidget) {
                    splitterData.push({region: 'right', state: this.layoutRight._splitterWidget.state});
                }
                if (this.layoutBottom && this.layoutBottom._splitterWidget) {
                    splitterData.push({region: 'bottom', state: this.layoutBottom._splitterWidget.state});
                }

                this.ctx.getSettingsManager().write(null, '.', null,
                    {
                        id: 'splitter',
                        data: JSON.stringify(splitterData),
                        name: 'Splitter States'
                    }, true, null
                )
            },
            setupToggleSplitterListeners: function () {
                if (this.layoutLeft && this.layoutLeft._splitterWidget) {
                    this.layoutLeft._splitterWidget.delegate = this;
                }
                if (this.layoutRight && this.layoutRight._splitterWidget) {
                    this.layoutRight._splitterWidget.delegate = this;
                }
                if (this.layoutBottom && this.layoutBottom._splitterWidget) {
                    this.layoutBottom._splitterWidget.delegate = this;
                }
            }
        });
    });