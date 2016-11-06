define([
    'dcl/dcl',
    "xdojo/declare",
    "xide/widgets/TemplatedWidgetBase",
    'xide/views/ConsoleKeyboardDelegate',
    'xide/views/History'
], function (dcl, declare, TemplatedWidgetBase, ConsoleKeyboardDelegate, History) {
    return dcl([TemplatedWidgetBase, ConsoleKeyboardDelegate], {
        declaredClass: "xide.views.Console",
        delegate: null,
        value: null,
        editNode: null,
        labelTextNode: null,
        labelNode: null,
        type: null,
        linkToggle: null,
        edit: null,
        templateString: "" +
        '<div class="consoleWidget form-group">' +
        '<div class="">' +
        '<div class="input-group">' +
        '<input data-dojo-attach-point="edit" class="form-control input-transparent" type="text">' +
        '<span data-dojo-attach-point="clear" class="input-group-addon">' +
        '<i class="fa fa-remove"></i>' +
        '</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        "",
        _templateString: "<div>" +
        "<div class='console' data-dojo-attach-point='root'>" +

        '<table class="" border="0" cellpadding="0px" width="100%" height="100%" >' +

        "<tbody data-dojo-attach-point='tBody' align='left'>" +

        "<tr class='' >" +

        "<td class='linkNode' data-dojo-attach-point='linkNode' class='' valign='middle' width='30px'>" +
        "<button data-dojo-attach-point='linkToggle' data-dojo-type='dijit/form/ToggleButton' data-dojo-props=\"iconClass:'el-icon-remove-circle', checked: true\">" +
        "</button>" +
        "</td>" +

        "<td  class='editNode' data-dojo-attach-point='editNode' class='' valign='middle' width='100%'>" +
        "</td>" +

        "</tr>" +
        "</tbody>" +
        "</table>" +


        "</div></div>",
        isLinked: function () {
            if (this.linkToggle) {
                return this.linkToggle.get('checked');
            }
            return false;
        },
        createWidgets: function () {

            this.editBox = $(this.edit);
            var thiz = this;

            this.editBox.on("keydown", function (evt) {
                thiz.onKey(evt);
            });

            this.editBox.on("keyup", function (evt) {
                thiz.onKey(evt);
            });
            $(this.clear).on('click', function () {
                if (thiz.delegate && thiz.delegate.onButton) {
                    thiz.delegate.onButton();
                }
            });

        },
        getValue: function () {
            return this.editBox.val();
        },
        startup: function () {
            if (this._started) {
                return;
            }
            this.history = new History();
            this.inherited(arguments);
            this.createWidgets();
        },
        /***
         * Keyboard impl.
         */
        onUp: function () {
            this.editBox.val(this.history.getPrev());
        },
        onDown: function () {

            this.editBox.val(this.history.getNext());
        },
        onEnter: function () {

            var value = this.editBox.val();

            this.delegate.onEnter(value);
            this.editBox.val('');
            this.history.push(value);
        }
    });
});