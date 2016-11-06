define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    'dojo/dom-class',
    'xide/types',
    'xide/factory',
    'xide/widgets/ActionToolbarButton',
    "xide/utils",
    "dojo/i18n", // i18n.getLocalization
    "dojo/i18n!./nls/TemplatedWidgetBase"
], function (declare,lang, domClass, types, factory, ActionToolbarButton, utils) {

    return declare("xide/widgets/ActionToolbarMixin", null,
        {
            config: null,
            useElusive: true,
            editSelector: null,
            currentItem: null,
            owner: null,
            _createButtonEx: function (command, title, iconClass, item, clickcb, disabled, owner, place, emit, style, label, extraClass,action) {

                if(!this.buttons){
                    this.buttons=[];
                }

                if (iconClass && title) {


                    var _buttonProto = ActionToolbarButton,
                        _visibiltyOptions = {};

                    var _buttonArgs  = {
                        title: title,
                        iconClass: iconClass,
                        operation: command,
                        item: item,
                        disabled: disabled,
                        style: style != null ? style : 'float:right;',
                        label: label || '',
                        owner:owner
                    };

                    if(action){

                        //we have another action button class
                        if(action.widgetClass){
                            _buttonProto = utils.getObject(action.widgetClass,_buttonProto);
                        }
                        //we have additional mixins for the custom widget
                        if(action.widgetArgs) {
                            lang.mixin(_buttonArgs, action.widgetArgs);
                        }
                        if(action.getVisibility) {
                            _visibiltyOptions= action.getVisibility(types.ACTION_VISIBILITY.ACTION_TOOLBAR);
                            lang.mixin(_buttonArgs,_visibiltyOptions);
                        }

                        action.owner = owner;
                        action.item = item;
                        action.command = command;
                        //action.operation = action.operation;


                    }

                    var button = utils.addWidget(_buttonProto,_buttonArgs,this,this.containerNode,false);
                    if (place !== null) {
                        dojo.place(button.domNode, this.containerNode, place);
                    }
                    button.startup();
                    this.buttons.push(button);

                    if (_visibiltyOptions.label && label != null && label.length > 0) {
                        button.showLabel = true;
                        button.set('label', label);
                    }

                    if (clickcb) {
                        try {
                            button.on('click', function (evt) {
                                evt.preventDefault();
                                if (owner != null) {
                                    clickcb(action.operation, item, owner, button);
                                } else {
                                    clickcb(action.operation, item, owner, button);
                                }
                            });
                        }catch(e){
                            console.error('error in action handler! ' + e);
                        }

                    }
                    if (extraClass) {
                        domClass.add(button.domNode, extraClass);
                    }
                    if (this.useElusive) {
                        domClass.remove(button.iconNode, 'dijitReset');
                        domClass.add(button.iconNode, 'actionToolbarButtonElusive');
                    }
                    return button;
                }
            },
            getCurrentItem: function () {
                return this.currentItem;
            },
            translate: function (value) {
                if (this._messages == null || this._messages.length == 0) {
                    this._setupTranslations();
                }
                if (value) {
                    var _titleKey = value.toLocaleLowerCase();
                    _titleKey = _titleKey.replace(/\s+/g, "_");
                    if (_titleKey && this._messages != null) {
                        var _titleValue = this._messages[_titleKey];
                        if (_titleValue && _titleValue.length > 0) {
                            return _titleValue;
                        }
                    }
                }
                return value || '';
            },
            _setupTranslations: function () {
                var dstCtx = this.ctx;
                if (dstCtx && dstCtx.getLocals) {
                    this._messages = dstCtx.getLocals("xide.widgets", "TemplatedWidgetBase");
                } else {
                    this._messages = [];
                }
            },
            postMixInProperties: function () {
                this.inherited(arguments);
                this._setupTranslations()

            },
            toTitle: function (operation) {

                switch (operation) {

                    case types.OPERATION.DELETE:
                    {
                        return this.translate('Delete')
                    }
                    case types.OPERATION.EDIT:
                    {
                        return this.translate('Edit')
                    }
                    case types.OPERATION.RENAME:
                    {
                        return this.translate('Rename')
                    }
                    case types.OPERATION.COPY:
                    {
                        return this.translate('Copy')
                    }
                    case types.OPERATION.MOVE:
                    {
                        return this.translate('Move')
                    }
                    case types.OPERATION.DOWNLOAD:
                    {
                        return this.translate('Download')
                    }
                    case types.OPERATION.INFO:
                    {
                        return this.translate('Info')
                    }
                    case types.OPERATION.COMPRESS:
                    {
                        return this.translate('Compress')
                    }
                    case types.OPERATION.RELOAD:
                    {
                        return this.translate('Reload')
                    }
                    case types.OPERATION.PREVIEW:
                    {
                        return this.translate('Preview')
                    }
                    case types.OPERATION.INSERT_IMAGE:
                    {
                        return this.translate('Insert')
                    }
                    case types.OPERATION.OPTIONS:
                    {
                        return this.translate('Options')
                    }
                    case types.OPERATION.PERMA_LINK:
                    {
                        return this.translate('Perma Link')
                    }
                }
                return 'No Title';
            },
            toIconClassElusive: function (operation) {
                switch (operation) {
                    case types.OPERATION.DELETE:
                    {
                        return 'el-icon-remove-circle'
                    }
                    case types.OPERATION.EDIT:
                    {
                        return 'el-icon-file-edit'
                    }
                    case types.OPERATION.RENAME:
                    {
                        return 'el-icon-edit'
                    }
                    case types.OPERATION.COPY:
                    {
                        return 'el-icon-random'
                    }
                    case types.OPERATION.MOVE:
                    {
                        return 'el-icon-move'
                    }
                    case types.OPERATION.DOWNLOAD:
                    {
                        return 'el-icon-download'
                    }
                    case types.OPERATION.INFO:
                    {
                        return 'el-icon-info-sign'
                    }
                    case types.OPERATION.COMPRESS:
                    {
                        return 'el-icon-briefcase'
                    }
                    case types.OPERATION.RELOAD:
                    {
                        return 'fa-refresh'
                    }
                    case types.OPERATION.PREVIEW:
                    {
                        return 'icon-32-preview-content'
                    }
                    case types.OPERATION.INSERT_IMAGE:
                    {
                        return 'icon-32-insert-image'
                    }
                    case types.OPERATION.OPTIONS:
                    {
                        return 'el-icon-cogs'
                    }
                    case types.OPERATION.PERMA_LINK:
                    {
                        return 'el-icon-link'
                    }

                }
            },
            toIconClass: function (operation) {
                if (this.useElusive) {
                    return this.toIconClassElusive(operation);
                }
                switch (operation) {
                    case types.OPERATION.DELETE:
                    {
                        return 'icon-32-remove'
                    }
                    case types.OPERATION.EDIT:
                    {
                        return 'icon-32-edit'
                    }
                    case types.OPERATION.RENAME:
                    {
                        return 'icon-32-edit'
                    }
                    case types.OPERATION.COPY:
                    {
                        return 'icon-32-copy'
                    }
                    case types.OPERATION.MOVE:
                    {
                        return 'icon-32-move'
                    }
                    case types.OPERATION.DOWNLOAD:
                    {
                        return 'icon-32-download'
                    }
                    case types.OPERATION.INFO:
                    {
                        return 'icon-32-info'
                    }
                    case types.OPERATION.COMPRESS:
                    {
                        return 'icon-32-compress'
                    }
                    case types.OPERATION.RELOAD:
                    {
                        return 'icon-32-reload'
                    }
                    case types.OPERATION.PREVIEW:
                    {
                        return 'icon-32-preview-content'
                    }
                    case types.OPERATION.INSERT_IMAGE:
                    {
                        return 'icon-32-insert-image'
                    }

                }
            },
            onButtonClicked: function (button) {
                if (this.delegate && this.delegate.onActionButton) {
                    this.delegate.onActionButton(button, button.item, button.operation, button.owner);
                }
            },
            onItemSelected: function (data) {

            },
            _createButton: function (operation, item, clickcb, disabled) {

                var iconClass = this.toIconClass(operation);
                var title = this.toTitle(operation);
                if (iconClass && title) {

                    var button = new ActionToolbarButton({
                        title: title,
                        iconClass: iconClass,
                        operation: operation,
                        item: item,
                        disabled: disabled
                    }, dojo.doc.createElement('div'));
                    this.parentContainer.appendChild(button.domNode);
                    dojo.place(button.domNode, this.parentContainer, 'first');
                    button.startup();
                    this.buttons.push(button);
                    var thiz = this;
                    button.domNode.onclick = function () {
                        thiz.onButtonClicked(button);
                    };
                    if (this.useElusive) {
                        domClass.remove(button.iconNode, 'dijitReset');
                        domClass.add(button.iconNode, 'actionToolbarButtonElusive');
                    }
                    return button;
                }
            },
            onViewChanged: function () {

            },
            clear: function () {

                for (var i in this.buttons) {
                    var button = this.buttons[i];
                    utils.destroy(button);
                }
                this.buttons = [];
            },
            /**
             * Back compat
             * @param actions
             * @param owner
             * @param items
             */
            addActions: function (actions, owner, items) {
                //return true;

                this.owner = owner;
                for (var i = 0; i < actions.length; i++) {

                    var action = actions[i];
                    if(!action){
                        continue;
                    }
                    if (action && action.domNode) {
                        this.containerNode.appendChild(action.domNode);
                        if (action.place !== null) {
                            dojo.place(action.domNode, this.containerNode, action.place);
                        }
                        this.buttons.push(action);

                    } else {
                        var newEditButton = this._createButtonEx(
                            action['command'],
                            action['title'],
                            action['icon'],
                            items,
                            action['handler'],
                            action['disabled'] || false,
                            owner,
                            action['place'],
                            action['emit'],
                            action['style'],
                            action['label'],
                            action['extraClass'],
                            action
                        );

                        if (action['elusive'] === true) {
                            domClass.remove(newEditButton.iconNode, 'dijitReset');
                        }
                    }

                }
            },

            startup: function () {
                var thiz = this;
                this.inherited(arguments);

                this.currentItem = {};

                this.subscribe(types.EVENTS.ON_VIEW_SHOW, function(){
                    thiz.onViewChanged(arguments);
                }, this);

                this.subscribe(types.EVENTS.SET_ITEM_ACTIONS,function(evt){

                    if (!thiz.isMyBeanContext(evt)) {
                        return;
                    }
                    if(!evt[thiz.id]) {
                        thiz.setItemActions(evt.item, evt.actions, evt.owner);
                        evt[thiz.id]=true
                    }
                });
            }
        });
});