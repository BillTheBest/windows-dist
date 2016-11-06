define([
    'dojo/_base/declare',
    "dojo/i18n", // i18n.getLocalization
    "dojo/i18n!./nls/TemplatedWidgetBase"], function (declare, i18n) {
    return declare("xide.widgets.LocalizationMixin", null,
        {
            tmessages: null,
            translate: function (value) {
                if (this.tmessages == null) {
                    this._setupTranslations();
                }
                if (value) {
                    var _titleKey = value.toLocaleLowerCase();
                    _titleKey = _titleKey.replace(/\s+/g, "_");
                    if (_titleKey && this.tmessages != null) {
                        var _titleValue = this.tmessages[_titleKey];
                        if (_titleValue && _titleValue.length > 0) {
                            return _titleValue;
                        }
                    }
                }
                return value;
            },
            _setupTranslations: function () {

                var dstCtx = sctx;
                if (mctx != null) {
                    dstCtx = mctx;
                }
                if (dstCtx && dstCtx.getLocals) {
                    this.tmessages = dstCtx.getLocals("xide.widgets", "TemplatedWidgetBase");
                } else {
                    this.tmessages = [];
                }
            },
            postMixInProperties: function () {
                this.inherited(arguments);
                this._setupTranslations()

            },
            updateTitleNode: function (value) {
                /***
                 * translation mixin :
                 */
                if (value) {
                    var _titleKey = value.toLocaleLowerCase();
                    _titleKey = _titleKey.replace(/\s+/g, "_");
                    if (_titleKey) {
                        var _titleValue = this.tmessages[_titleKey];
                        if (_titleValue && this.titleNode) {
                            this.titleNode.innerHTML = _titleValue;
                        }
                    }
                }
            }

        });
});