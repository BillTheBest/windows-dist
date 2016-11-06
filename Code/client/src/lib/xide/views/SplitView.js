define([
    'dcl/dcl',
    "dojo/_base/declare",
    "xide/utils",
    "xide/types",
    "xide/widgets/TemplatedWidgetBase",
    "dojo/dom-class",
    'xide/mixins/EventedMixin'
    //'xide/mixins/ItemActionMixin'
], function (dcl, declare, utils, types, TemplatedWidgetBase,domClass, EventedMixin) {
    return dcl([TemplatedWidgetBase], {
        declaredClass: "xide.views.SplitView",
        config: null,
        ctx: null,
        cssClass: "splitView",
        /***
         * Widget-Instances from templateString, referenced by 'data-dojo-attach-point'
         */
        layoutMain: null,
        layoutTop: null,
        layoutLeft: null,
        layoutCenter: null,
        layoutRight: null,
        layoutBottom: null,
        preventCaching: true,
        leftPanel: null,
        centerPanel: null,
        initialReload: false,
        persistent: false,
        _restoredPermaItems: 0,
        layoutRightPlaceHolder: null,

        mode: 'vertical',
        /***
         * Variables
         */
        templateString: "<div>" +
        "<div data-dojo-attach-point='layoutMain' data-dojo-type='xide.layout.BorderContainer' data-dojo-props=\"design:'headline'\" class='layoutMain '>" +
        "<div data-dojo-attach-point='layoutLeft' data-dojo-type='xide.layout.ContentPane' data-dojo-props=\"region:'left',splitter:'true'\" class='layoutLeftSplit' style='width: 50%;overflow: hidden'></div>" +
        "<div data-dojo-attach-point='layoutCenter' data-dojo-type='xide.layout.ContentPane' data-dojo-props=\"region:'center',splitter:'true'\" class='layoutCenterSplit' style='width: 50%;overflow: hidden'></div>" +
        "</div>" +
        "</div>",


        firstContainer: null,
        secondContainer: null,
        setFirstContainer: function (container) {
            utils.destroy(this.firstContainer);
            dojo.empty(this.layoutLeft.containerNode);
            //utils.addChild(this.layoutLeft,container,false);
        },
        postMixInProperties: function () {
            if (this.mode == 'horizontal') {
                this.templateString = "<div>" +
                    "<div data-dojo-attach-point='layoutMain' data-dojo-type='xide.layout.BorderContainer' data-dojo-props=\"design:'headline'\" class='layoutMain '>" +
                    "<div data-dojo-attach-point='layoutLeft' data-dojo-type='xide.layout.ContentPane' data-dojo-props=\"region:'top',splitter:'true'\" class='layoutLeftSplit' style='height: 50%'></div>" +
                    "<div data-dojo-attach-point='layoutCenter' data-dojo-type='xide.layout.ContentPane' data-dojo-props=\"region:'center',splitter:'true'\" class='layoutCenterSplit' style='height: 50%'></div>" +
                    "</div>" +
                    "</div>";

            }

            this.inherited(arguments);

        },
        onChildAdded: function (who, what) {

            this.resize();
        },
        openItem: function () {


        },
        resize: function () {
            this.inherited(arguments);

            if (this.layoutMain) {
                this._resizeContainer(this.layoutMain, 'main');
            }

            if (this.layoutLeft) {
                this._resizeContainer(this.layoutLeft, 'left');
            }
            if (this.layoutTop) {
                this._resizeContainer(this.layoutTop, 'top');
            }
            if (this.layoutCenter) {
                this._resizeContainer(this.layoutCenter, 'center');
            }
            if (this.layoutRight) {
                this._resizeContainer(this.layoutRight, 'right');
            }

            if (this.layoutLeft) {
                this._resizeContainer(this.layoutLeft, 'left');
            }
            if (this.layoutBottom) {
                this._resizeContainer(this.layoutBottom, 'bottom');
            }

        },
        _resizeContainer: function (container, name) {
            try {
                if (container && container.domNode) {
                    container.resize();
                } else {
                    //console.error('resizing container failed : object or domNode missing : ' + name );
                }
            } catch (e) {
                //  console.error('_resizeContainer : failed for ' + name);
            }
        },
        startup: function () {
            this.inherited(arguments);


            if (this.mode == 'vertical') {
                domClass.add(this.domNode, 'splitViewVertical');
            } else {
                domClass.add(this.domNode, 'splitViewHorizontal');
            }
            this.subscribe(types.EVENTS.RESIZE, this.resize);
        }

    });
});