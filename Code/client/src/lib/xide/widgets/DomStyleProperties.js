define([
    'dcl/dcl',
    "dojo/dom-class",
    "dojo/dom-attr",
    "xide/widgets/WidgetBase",
    'xide/factory',
    'xide/utils',
    'xide/types',
    'xide/layout/_TabContainer',


    "dojo/_base/lang",
    "dojo/i18n!davinci/ve/nls/ve",
    "dojo/i18n!dijit/nls/common",

    "dijit/layout/ContentPane",
    "xideve/widgets/WidgetLite",
    "xide/mixins/ReloadMixin",
    "davinci/ve/widgets/HTMLStringUtil",

    "davinci/ve/widgets/WidgetToolBar",
    "davinci/ve/widgets/Cascade",
    "davinci/ve/widgets/CommonProperties",
    "davinci/ve/widgets/WidgetProperties",
    "davinci/ve/widgets/EventSelection",
    "dijit/_WidgetBase",
    "davinci/ve/widgets/MutableStore",
    "dijit/form/ComboBox",
    "dojo/i18n!davinci/ve/nls/ve",
    "dojo/i18n!dijit/nls/common",
    "xide/form/Select",
    "xdojo/declare",
    "xide/mixins/EventedMixin"

], function (dcl,domClass, domAttr, WidgetBase, factory, utils, types,_TabContainer,
             lang,veNls, commonNls,ContentPane,
             WidgetLite, ReloadMixin, HTMLStringUtil,WidgetToolBar, Cascade, CommonProperties, WidgetProperties, EventSelection,
             _WidgetBase, MutableStore, ComboBox, veNLS,commonNLS,Select,declare,EventedMixin
) {

    var StyleView = declare("xideve/views/StyleView", [WidgetLite, ReloadMixin,EventedMixin], {
        /* FIXME: These won't expand into pageTemplate. Not sure if that's a JS issue or dojo.declare issue.
         * Temporary copied into each property below but would be better if could get reusable values working somehow.
         _paddingMenu:['', '0px', '1em'],
         _radiusMenu:['', '0px', '6px'],
         */
        showWidgetProperties: true,
        _editor: null,	// selected editor
        _widget: null,	// selected widget
        _widgets: null,
        _subWidget: null,	// selected sub widget
        _titleBarDiv: "<div class='palette_titleBarDiv'><span class='paletteCloseBox'></span><span class='titleBarDivTitle'></span></div>",
        constructor: function (params, srcNodeRef) {
            this.subscribe("/davinci/ui/editorSelected", dojo.hitch(this, this._editorSelected));
            this.subscribe("/davinci/ui/widgetSelected", dojo.hitch(this, this._widgetSelectionChanged));
            this.subscribe("/davinci/states/state/changed", dojo.hitch(this, this._stateChanged));
            this.subscribe("/maqetta/appstates/state/changed", dojo.hitch(this, this._stateChanged));
            this.subscribe("/davinci/ui/initialPerspectiveReady", dojo.hitch(this, this._initialPerspectiveReady));
            this.subscribe("/davinci/workbench/ready", dojo.hitch(this, this._workbenchReady));
        },
        _pageTemplate: [

            //Note: the keys here must match the propsect_* values in the supports() functions
            //in the various editors, such as PageEditor.js and ThemeEditor.js

            /*
             {key: "common",
             className:'maqPropertySection page_editor_only',
             addCommonPropertiesAtTop:false,
             pageTemplate:{html: "<div dojoType='davinci.ve.widgets.CommonProperties'></div>"}},
             */
            // NOTE: the first section (widgetSpecific) is injected within buildRendering()
            {
                key: "widgetSpecific",
                className: 'maqPropertySection page_editor_only',
                addCommonPropertiesAtTop: false,
                html: "<div dojoType='davinci.ve.widgets.WidgetProperties'></div>"
            },

            {
                key: "layout",
                className: 'maqPropertySection',
                addCommonPropertiesAtTop: true,
                /* startsNewGroup:true, // This flag causes a few extra pixels between this and previous button */
                pageTemplate: [
                    {display: "width", type: "multi", target: ["width"], values: ['', 'auto', '100%', '200px', '10em']},
                    {
                        display: "height",
                        type: "multi",
                        target: ["height"],
                        values: ['', 'auto', '100%', '200px', '10em']
                    },
                    {html: "&nbsp;"},
                    {
                        key: "showMinMax", display: "&nbsp;&nbsp;&nbsp;", type: "toggleSection",
                        pageTemplate: [{
                            display: "min-height",
                            type: "multi",
                            target: ["min-height"],
                            rowClass: "propertiesSectionHidden"
                        },
                            {
                                display: "max-height",
                                type: "multi",
                                target: ["max-height"],
                                rowClass: "propertiesSectionHidden"
                            },
                            {
                                display: "min-width",
                                type: "multi",
                                target: ["min-width"],
                                rowClass: "propertiesSectionHidden"
                            },
                            {
                                display: "max-width",
                                type: "multi",
                                target: ["max-width"],
                                rowClass: "propertiesSectionHidden"
                            },
                            {html: "&nbsp;", rowClass: "propertiesSectionHidden"}]
                    },
                    {
                        display: "position",
                        type: "combo",
                        target: ["position"],
                        values: ['', 'absolute', 'fixed', 'relative', 'static']
                    },
                    {display: "left", type: "multi", target: ["left"], values: ['', '0px', '1em']},
                    {display: "top", type: "multi", target: ["top"], values: ['', '0px', '1em']},
                    {display: "right", type: "multi", target: ["right"], values: ['', '0px', '1em']},
                    {display: "bottom", type: "multi", target: ["bottom"], values: ['', '0px', '1em']},
                    {
                        display: "display",
                        type: "combo",
                        target: ["display"],
                        values: ['', 'none', 'block', 'inline', 'inline-block']
                    },
                    {display: "opacity", type: "multi", target: ["opacity"], values: ['0', '0.5', '1.0']},
                    {
                        display: "box-shadow",
                        type: "text",
                        target: ["box-shadow"],
                        value: ['', 'none', '1px 1px rgba(0,0,0,.5)']
                    },
                    {display: "float", type: "combo", target: ["float"], values: ['', 'none', 'left', 'right']},
                    {display: "clear", type: "combo", target: ["clear"], values: ['', 'none', 'left', 'right', 'both']},
                    {
                        display: "overflow",
                        type: "combo",
                        target: ["overflow"],
                        values: ['', 'visible', 'hidden', 'scroll', 'auto']
                    },
                    {
                        display: "z-index",
                        type: "multi",
                        target: ["z-index"],
                        values: ['', 'auto', '0', '1', '100', '-1', '-100']
                    },
                    {
                        display: "box-sizing",
                        type: "combo",
                        target: ['box-sizing', '-webkit-box-sizing', '-ms-box-sizing', '-moz-box-sizing'],
                        values: ['', 'content-box', 'border-box']
                    }
                ]
            },
            {
                key: "padding",
                className: 'maqPropertySection',
                addCommonPropertiesAtTop: true,
                pageTemplate: [
                    {display: "<b>(padding)</b>", type: "multi", target: ["padding"], values: ['', '0px', '1em']},
                    {
                        key: "showtrbl", display: "&nbsp;&nbsp;&nbsp;", type: "toggleSection",
                        pageTemplate: [
                            {
                                display: "padding-top",
                                type: "multi",
                                target: ["padding-top"],
                                values: ['', '0px', '1em'],
                                rowClass: "propertiesSectionHidden"
                            },
                            {
                                display: "padding-right",
                                type: "multi",
                                target: ["padding-right"],
                                values: ['', '0px', '1em'],
                                rowClass: "propertiesSectionHidden"
                            },
                            {
                                display: "padding-bottom",
                                type: "multi",
                                target: ["padding-bottom"],
                                values: ['', '0px', '1em'],
                                rowClass: "propertiesSectionHidden"
                            },
                            {
                                display: "padding-left",
                                type: "multi",
                                target: ["padding-left"],
                                values: ['', '0px', '1em'],
                                rowClass: "propertiesSectionHidden"
                            }
                        ]
                    }
                ]
            },
            {
                key: "margins",
                className: 'maqPropertySection',
                addCommonPropertiesAtTop: true,
                pageTemplate: [
                    {display: "<b>(margin)</b>", type: "multi", target: ["margin"], values: ['', '0px', '1em']},
                    {
                        key: "showtrbl", display: "&nbsp;&nbsp;&nbsp;", type: "toggleSection",
                        pageTemplate: [
                            {
                                display: "margin-top",
                                type: "multi",
                                target: ["margin-top"],
                                values: ['', '0px', '1em'],
                                rowClass: "propertiesSectionHidden"
                            },
                            {
                                display: "margin-right",
                                type: "multi",
                                target: ["margin-right"],
                                values: ['', '0px', '1em'],
                                rowClass: "propertiesSectionHidden"
                            },
                            {
                                display: "margin-bottom",
                                type: "multi",
                                target: ["margin-bottom"],
                                values: ['', '0px', '1em'],
                                rowClass: "propertiesSectionHidden"
                            },
                            {
                                display: "margin-left",
                                type: "multi",
                                target: ["margin-left"],
                                values: ['', '0px', '1em'],
                                rowClass: "propertiesSectionHidden"
                            }
                        ]
                    }
                ]
            },
            {
                key: "background",
                className: 'maqPropertySection',
                addCommonPropertiesAtTop: true,
                pageTemplate: [
                    {display: "background-color", type: "background", target: ['background-color'], colorswatch: true},
                    {
                        display: "background-image",
                        type: "background",
                        target: ['background-image'],
                        values: ['', 'none']
                    },
                    {
                        display: "background-repeat",
                        type: "background",
                        values: ['', 'repeat', 'repeat-x', 'repeat-y', 'no-repeat'],
                        target: ['background-repeat']
                    },
                    {
                        display: "background-position",
                        type: "background",
                        target: ['background-position'],
                        values: ['', '0px 0px', '0% 0%', 'left top', 'center center', 'right bottom']
                    },
                    {
                        display: "background-size",
                        type: "background",
                        target: ['background-size'],
                        values: ['', 'auto', 'contain', 'cover', '100%']
                    },
                    {
                        display: "background-origin",
                        type: "background",
                        target: ['background-origin'],
                        values: ['', 'border-box', 'padding-box', 'content-box']
                    },
                    {
                        display: "background-clip",
                        type: "background",
                        target: ['background-clip'],
                        values: ['', 'border-box', 'padding-box', 'content-box']
                    }
                ]
            },
            {
                key: "border",
                className: 'maqPropertySection',
                addCommonPropertiesAtTop: true,
                pageTemplate: [
                    {
                        display: "<b>(border)</b>",
                        type: "multi",
                        target: ['border'],
                        values: ['', 'none', '1px solid black']
                    },
                    {
                        display: "show", type: "combo", values: ['none', 'props', 'sides', 'all'],
                        id: 'properties_show_select',
                        onchange: function (propIndex) {
                            if (typeof propIndex != "number") {
                                return;
                            }
                            var showRange = function (sectionData, first, last, begin, end) {
                                for (var k = first; k <= last; k++) {
                                    var thisProp = sectionData[k];
                                    var thisRow = dojo.byId(thisProp.rowId);
                                    if (k >= begin && k <= end) {
                                        dojo.removeClass(thisRow, "propertiesSectionHidden");
                                    } else {
                                        dojo.addClass(thisRow, "propertiesSectionHidden");
                                    }
                                }
                            };
                            if (this.pageTemplate) {
                                var propObj = this.pageTemplate[propIndex];
                                var value;
                                if (propObj && propObj.id) {
                                    value = dojo.byId(propObj.id).value;
                                }
                                // In some circumstances, value is undefined, which causes exception.
                                // Make sure it is a string.
                                if (dojo.isString(value)) {
                                    if (value === 'none') {
                                        showRange(this.pageTemplate, 2, 20, -1, -1);
                                    } else if (value === 'sides') {
                                        showRange(this.pageTemplate, 2, 20, 2, 5);
                                    } else if (value === 'props') {
                                        showRange(this.pageTemplate, 2, 20, 6, 8);
                                    } else if (value === 'all') {
                                        showRange(this.pageTemplate, 2, 20, 9, 20);
                                    }
                                }
                            }
                        }
                    },
                    {
                        display: "border-top",
                        type: "multi",
                        target: ['border-top'],
                        values: ['', 'none', '1px solid black'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-right",
                        type: "multi",
                        target: ['border-right'],
                        values: ['', 'none', '1px solid black'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-bottom",
                        type: "multi",
                        target: ['border-bottom'],
                        values: ['', 'none', '1px solid black'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-left",
                        type: "multi",
                        target: ['border-left'],
                        values: ['', 'none', '1px solid black'],
                        rowClass: 'propertiesSectionHidden'
                    },


                    {
                        display: "border-width",
                        type: "multi",
                        target: ['border-width'],
                        values: ['', '1px', '1em'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-style",
                        type: "multi",
                        target: ['border-style'],
                        values: ['', 'none', 'solid', 'dotted', 'dashed'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-color",
                        type: "color",
                        target: ['border-color'],
                        rowClass: 'propertiesSectionHidden'
                    },

                    {
                        display: "border-top-width",
                        type: "multi",
                        target: ['border-top-width'],
                        values: ['', '1px', '1em'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-top-style",
                        type: "multi",
                        target: ['border-top-style'],
                        values: ['', 'none', 'solid', 'dotted', 'dashed'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-top-color",
                        type: "color",
                        target: ['border-top-color'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-right-width",
                        type: "multi",
                        target: ['border-right-width'],
                        values: ['', '1px', '1em'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-right-style",
                        type: "multi",
                        target: ['border-right-style'],
                        values: ['', 'none', 'solid', 'dotted', 'dashed'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-right-color",
                        type: "color",
                        target: ['border-right-color'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-bottom-width",
                        type: "multi",
                        target: ['border-bottom-width'],
                        values: ['', '1px', '1em'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-bottom-style",
                        type: "multi",
                        target: ['border-bottom-style'],
                        values: ['', 'none', 'solid', 'dotted', 'dashed'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-bottom-color",
                        type: "color",
                        target: ['border-bottom-color'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-left-width",
                        type: "multi",
                        target: ['border-left-width'],
                        values: ['', '1px', '1em'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-left-style",
                        type: "multi",
                        target: ['border-left-style'],
                        values: ['', 'none', 'solid', 'dotted', 'dashed'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-left-color",
                        type: "color",
                        target: ['border-left-color'],
                        rowClass: 'propertiesSectionHidden'
                    },
                    {
                        display: "border-collapse",
                        type: "combo",
                        target: ['border-collapse'],
                        values: ['', 'separate', 'collapse']
                    },
                    {
                        display: "<b>(border-radius)</b>",
                        type: "multi",
                        target: ['border-radius', '-moz-border-radius'],
                        values: ['', '0px', '6px']
                    },
                    {
                        key: "showDetails", display: "", type: "toggleSection",
                        pageTemplate: [
                            {
                                display: "border-top-left-radius",
                                type: "multi",
                                target: ["border-top-left-radius", '-moz-border-radius-topleft'],
                                values: ['', '0px', '6px'],
                                rowClass: "propertiesSectionHidden"
                            },
                            {
                                display: "border-top-right-radius",
                                type: "multi",
                                target: ['border-top-right-radius', '-moz-border-radius-topright'],
                                values: ['', '0px', '6px'],
                                rowClass: "propertiesSectionHidden"
                            },
                            {
                                display: "border-bottom-right-radius",
                                type: "multi",
                                target: ['border-bottom-right-radius', '-moz-border-radius-bottomright'],
                                values: ['', '0px', '6px'],
                                rowClass: "propertiesSectionHidden"
                            },
                            {
                                display: "border-bottom-left-radius",
                                type: "multi",
                                target: ['border-bottom-left-radius', '-moz-border-radius-bottomleft'],
                                values: ['', '0px', '6px'],
                                rowClass: "propertiesSectionHidden"
                            }
                        ]
                    }
                ]
            },
            {
                key: "fontsAndText",
                className: 'maqPropertySection',
                addCommonPropertiesAtTop: true,
                pageTemplate: [{display: "font", type: "text", target: ["font"]},
                    {display: "font-family", type: "font", target: ["font-family"]},
                    {
                        display: "size",
                        type: "multi",
                        target: ["font-size"],
                        values: ['', '100%', '1em', '10px', '10pt']
                    },
                    {display: "color", type: "color", target: ["color"]},
                    {display: "font-weight", type: "combo", target: ["font-weight"], values: ['', 'normal', 'bold']},
                    {display: "font-style", type: "combo", target: ["font-style"], values: ['', 'normal', 'italic']},
                    {
                        display: "text-decoration",
                        type: "combo",
                        target: ["text-decoration"],
                        values: ['', 'none', 'underline', 'line-through']
                    },
                    {
                        display: "text-align",
                        type: "combo",
                        target: ["text-align"],
                        values: ['', 'left', 'center', 'right', 'justify']
                    },
                    {
                        display: "vertical-align",
                        type: "combo",
                        target: ["vertical-align"],
                        values: ['', 'baseline', 'top', 'middle', 'bottom']
                    },
                    {
                        display: "white-space",
                        type: "combo",
                        target: ['white-space'],
                        values: ['', 'normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap']
                    },
                    {display: "text-indent", type: "multi", target: ["text-indent"], values: ['', '0', '1em', '10px']},
                    {
                        display: "line-height",
                        type: "multi",
                        target: ["line-height"],
                        values: ['', 'normal', '1.2', '120%']
                    }
                ]
            }/*,
             {key: "shapesSVG",
             className:'maqPropertySection',
             addCommonPropertiesAtTop:true,
             pageTemplate:[{display:"stroke", type:"color", target:["stroke"]},
             {display:"stroke-width", type:"multi", target:["stroke-width"], values:['','1', '2', '3', '4', '5', '10']},
             {display:"fill", type:"color", target:["fill"]}
             ]}
             */
            /*,
             {title:"Animations",
             pageTemplate:[{html:"in progress..."}]},
             {title:"Transistions",
             pageTemplate:[{html:"in progress..."}]},
             {title:"Transforms",
             pageTemplate:[{html:"in progress..."}]},*/

        ],
        getPageTemplate:function(){
            return [

                //Note: the keys here must match the propsect_* values in the supports() functions
                //in the various editors, such as PageEditor.js and ThemeEditor.js

                /*
                 {key: "common",
                 className:'maqPropertySection page_editor_only',
                 addCommonPropertiesAtTop:false,
                 pageTemplate:{html: "<div dojoType='davinci.ve.widgets.CommonProperties'></div>"}},
                 */
                // NOTE: the first section (widgetSpecific) is injected within buildRendering()
                {
                    key: "widgetSpecific",
                    className: 'maqPropertySection page_editor_only',
                    addCommonPropertiesAtTop: false,
                    html: "<div dojoType='davinci.ve.widgets.WidgetProperties'></div>"
                },

                {
                    key: "layout",
                    className: 'maqPropertySection',
                    addCommonPropertiesAtTop: true,
                    /* startsNewGroup:true, // This flag causes a few extra pixels between this and previous button */
                    pageTemplate: [
                        {display: "width", type: "multi", target: ["width"], values: ['', 'auto', '100%', '200px', '10em']},
                        {
                            display: "height",
                            type: "multi",
                            target: ["height"],
                            values: ['', 'auto', '100%', '200px', '10em']
                        },
                        {html: "&nbsp;"},
                        {
                            key: "showMinMax", display: "&nbsp;&nbsp;&nbsp;", type: "toggleSection",
                            pageTemplate: [{
                                display: "min-height",
                                type: "multi",
                                target: ["min-height"],
                                rowClass: "propertiesSectionHidden"
                            },
                                {
                                    display: "max-height",
                                    type: "multi",
                                    target: ["max-height"],
                                    rowClass: "propertiesSectionHidden"
                                },
                                {
                                    display: "min-width",
                                    type: "multi",
                                    target: ["min-width"],
                                    rowClass: "propertiesSectionHidden"
                                },
                                {
                                    display: "max-width",
                                    type: "multi",
                                    target: ["max-width"],
                                    rowClass: "propertiesSectionHidden"
                                },
                                {html: "&nbsp;", rowClass: "propertiesSectionHidden"}]
                        },
                        {
                            display: "position",
                            type: "combo",
                            target: ["position"],
                            values: ['', 'absolute', 'fixed', 'relative', 'static']
                        },
                        {display: "left", type: "multi", target: ["left"], values: ['', '0px', '1em']},
                        {display: "top", type: "multi", target: ["top"], values: ['', '0px', '1em']},
                        {display: "right", type: "multi", target: ["right"], values: ['', '0px', '1em']},
                        {display: "bottom", type: "multi", target: ["bottom"], values: ['', '0px', '1em']},
                        {
                            display: "display",
                            type: "combo",
                            target: ["display"],
                            values: ['', 'none', 'block', 'inline', 'inline-block']
                        },
                        {display: "opacity", type: "multi", target: ["opacity"], values: ['0', '0.5', '1.0']},
                        {
                            display: "box-shadow",
                            type: "text",
                            target: ["box-shadow"],
                            value: ['', 'none', '1px 1px rgba(0,0,0,.5)']
                        },
                        {display: "float", type: "combo", target: ["float"], values: ['', 'none', 'left', 'right']},
                        {display: "clear", type: "combo", target: ["clear"], values: ['', 'none', 'left', 'right', 'both']},
                        {
                            display: "overflow",
                            type: "combo",
                            target: ["overflow"],
                            values: ['', 'visible', 'hidden', 'scroll', 'auto']
                        },
                        {
                            display: "z-index",
                            type: "multi",
                            target: ["z-index"],
                            values: ['', 'auto', '0', '1', '100', '-1', '-100']
                        },
                        {
                            display: "box-sizing",
                            type: "combo",
                            target: ['box-sizing', '-webkit-box-sizing', '-ms-box-sizing', '-moz-box-sizing'],
                            values: ['', 'content-box', 'border-box']
                        }
                    ]
                },
                {
                    key: "padding",
                    className: 'maqPropertySection',
                    addCommonPropertiesAtTop: true,
                    pageTemplate: [
                        {display: "<b>(padding)</b>", type: "multi", target: ["padding"], values: ['', '0px', '1em']},
                        {
                            key: "showtrbl", display: "&nbsp;&nbsp;&nbsp;", type: "toggleSection",
                            pageTemplate: [
                                {
                                    display: "padding-top",
                                    type: "multi",
                                    target: ["padding-top"],
                                    values: ['', '0px', '1em'],
                                    rowClass: "propertiesSectionHidden"
                                },
                                {
                                    display: "padding-right",
                                    type: "multi",
                                    target: ["padding-right"],
                                    values: ['', '0px', '1em'],
                                    rowClass: "propertiesSectionHidden"
                                },
                                {
                                    display: "padding-bottom",
                                    type: "multi",
                                    target: ["padding-bottom"],
                                    values: ['', '0px', '1em'],
                                    rowClass: "propertiesSectionHidden"
                                },
                                {
                                    display: "padding-left",
                                    type: "multi",
                                    target: ["padding-left"],
                                    values: ['', '0px', '1em'],
                                    rowClass: "propertiesSectionHidden"
                                }
                            ]
                        }
                    ]
                },
                {
                    key: "margins",
                    className: 'maqPropertySection',
                    addCommonPropertiesAtTop: true,
                    pageTemplate: [
                        {display: "<b>(margin)</b>", type: "multi", target: ["margin"], values: ['', '0px', '1em']},
                        {
                            key: "showtrbl", display: "&nbsp;&nbsp;&nbsp;", type: "toggleSection",
                            pageTemplate: [
                                {
                                    display: "margin-top",
                                    type: "multi",
                                    target: ["margin-top"],
                                    values: ['', '0px', '1em'],
                                    rowClass: "propertiesSectionHidden"
                                },
                                {
                                    display: "margin-right",
                                    type: "multi",
                                    target: ["margin-right"],
                                    values: ['', '0px', '1em'],
                                    rowClass: "propertiesSectionHidden"
                                },
                                {
                                    display: "margin-bottom",
                                    type: "multi",
                                    target: ["margin-bottom"],
                                    values: ['', '0px', '1em'],
                                    rowClass: "propertiesSectionHidden"
                                },
                                {
                                    display: "margin-left",
                                    type: "multi",
                                    target: ["margin-left"],
                                    values: ['', '0px', '1em'],
                                    rowClass: "propertiesSectionHidden"
                                }
                            ]
                        }
                    ]
                },
                {
                    key: "background",
                    className: 'maqPropertySection',
                    addCommonPropertiesAtTop: true,
                    pageTemplate: [
                        {display: "background-color", type: "background", target: ['background-color'], colorswatch: true},
                        {
                            display: "background-image",
                            type: "background",
                            target: ['background-image'],
                            values: ['', 'none']
                        },
                        {
                            display: "background-repeat",
                            type: "background",
                            values: ['', 'repeat', 'repeat-x', 'repeat-y', 'no-repeat'],
                            target: ['background-repeat']
                        },
                        {
                            display: "background-position",
                            type: "background",
                            target: ['background-position'],
                            values: ['', '0px 0px', '0% 0%', 'left top', 'center center', 'right bottom']
                        },
                        {
                            display: "background-size",
                            type: "background",
                            target: ['background-size'],
                            values: ['', 'auto', 'contain', 'cover', '100%']
                        },
                        {
                            display: "background-origin",
                            type: "background",
                            target: ['background-origin'],
                            values: ['', 'border-box', 'padding-box', 'content-box']
                        },
                        {
                            display: "background-clip",
                            type: "background",
                            target: ['background-clip'],
                            values: ['', 'border-box', 'padding-box', 'content-box']
                        }
                    ]
                },
                {
                    key: "border",
                    className: 'maqPropertySection',
                    addCommonPropertiesAtTop: true,
                    pageTemplate: [
                        {
                            display: "<b>(border)</b>",
                            type: "multi",
                            target: ['border'],
                            values: ['', 'none', '1px solid black']
                        },
                        {
                            display: "show", type: "combo", values: ['none', 'props', 'sides', 'all'],
                            id: 'properties_show_select',
                            onchange: function (propIndex) {
                                if (typeof propIndex != "number") {
                                    return;
                                }
                                var showRange = function (sectionData, first, last, begin, end) {
                                    for (var k = first; k <= last; k++) {
                                        var thisProp = sectionData[k];
                                        var thisRow = dojo.byId(thisProp.rowId);
                                        if (k >= begin && k <= end) {
                                            dojo.removeClass(thisRow, "propertiesSectionHidden");
                                        } else {
                                            dojo.addClass(thisRow, "propertiesSectionHidden");
                                        }
                                    }
                                };
                                if (this.pageTemplate) {
                                    var propObj = this.pageTemplate[propIndex];
                                    var value;
                                    if (propObj && propObj.id) {
                                        value = dojo.byId(propObj.id).value;
                                    }
                                    // In some circumstances, value is undefined, which causes exception.
                                    // Make sure it is a string.
                                    if (dojo.isString(value)) {
                                        if (value === 'none') {
                                            showRange(this.pageTemplate, 2, 20, -1, -1);
                                        } else if (value === 'sides') {
                                            showRange(this.pageTemplate, 2, 20, 2, 5);
                                        } else if (value === 'props') {
                                            showRange(this.pageTemplate, 2, 20, 6, 8);
                                        } else if (value === 'all') {
                                            showRange(this.pageTemplate, 2, 20, 9, 20);
                                        }
                                    }
                                }
                            }
                        },
                        {
                            display: "border-top",
                            type: "multi",
                            target: ['border-top'],
                            values: ['', 'none', '1px solid black'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-right",
                            type: "multi",
                            target: ['border-right'],
                            values: ['', 'none', '1px solid black'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-bottom",
                            type: "multi",
                            target: ['border-bottom'],
                            values: ['', 'none', '1px solid black'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-left",
                            type: "multi",
                            target: ['border-left'],
                            values: ['', 'none', '1px solid black'],
                            rowClass: 'propertiesSectionHidden'
                        },


                        {
                            display: "border-width",
                            type: "multi",
                            target: ['border-width'],
                            values: ['', '1px', '1em'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-style",
                            type: "multi",
                            target: ['border-style'],
                            values: ['', 'none', 'solid', 'dotted', 'dashed'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-color",
                            type: "color",
                            target: ['border-color'],
                            rowClass: 'propertiesSectionHidden'
                        },

                        {
                            display: "border-top-width",
                            type: "multi",
                            target: ['border-top-width'],
                            values: ['', '1px', '1em'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-top-style",
                            type: "multi",
                            target: ['border-top-style'],
                            values: ['', 'none', 'solid', 'dotted', 'dashed'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-top-color",
                            type: "color",
                            target: ['border-top-color'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-right-width",
                            type: "multi",
                            target: ['border-right-width'],
                            values: ['', '1px', '1em'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-right-style",
                            type: "multi",
                            target: ['border-right-style'],
                            values: ['', 'none', 'solid', 'dotted', 'dashed'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-right-color",
                            type: "color",
                            target: ['border-right-color'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-bottom-width",
                            type: "multi",
                            target: ['border-bottom-width'],
                            values: ['', '1px', '1em'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-bottom-style",
                            type: "multi",
                            target: ['border-bottom-style'],
                            values: ['', 'none', 'solid', 'dotted', 'dashed'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-bottom-color",
                            type: "color",
                            target: ['border-bottom-color'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-left-width",
                            type: "multi",
                            target: ['border-left-width'],
                            values: ['', '1px', '1em'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-left-style",
                            type: "multi",
                            target: ['border-left-style'],
                            values: ['', 'none', 'solid', 'dotted', 'dashed'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-left-color",
                            type: "color",
                            target: ['border-left-color'],
                            rowClass: 'propertiesSectionHidden'
                        },
                        {
                            display: "border-collapse",
                            type: "combo",
                            target: ['border-collapse'],
                            values: ['', 'separate', 'collapse']
                        },
                        {
                            display: "<b>(border-radius)</b>",
                            type: "multi",
                            target: ['border-radius', '-moz-border-radius'],
                            values: ['', '0px', '6px']
                        },
                        {
                            key: "showDetails", display: "", type: "toggleSection",
                            pageTemplate: [
                                {
                                    display: "border-top-left-radius",
                                    type: "multi",
                                    target: ["border-top-left-radius", '-moz-border-radius-topleft'],
                                    values: ['', '0px', '6px'],
                                    rowClass: "propertiesSectionHidden"
                                },
                                {
                                    display: "border-top-right-radius",
                                    type: "multi",
                                    target: ['border-top-right-radius', '-moz-border-radius-topright'],
                                    values: ['', '0px', '6px'],
                                    rowClass: "propertiesSectionHidden"
                                },
                                {
                                    display: "border-bottom-right-radius",
                                    type: "multi",
                                    target: ['border-bottom-right-radius', '-moz-border-radius-bottomright'],
                                    values: ['', '0px', '6px'],
                                    rowClass: "propertiesSectionHidden"
                                },
                                {
                                    display: "border-bottom-left-radius",
                                    type: "multi",
                                    target: ['border-bottom-left-radius', '-moz-border-radius-bottomleft'],
                                    values: ['', '0px', '6px'],
                                    rowClass: "propertiesSectionHidden"
                                }
                            ]
                        }
                    ]
                },
                {
                    key: "fontsAndText",
                    className: 'maqPropertySection',
                    addCommonPropertiesAtTop: true,
                    pageTemplate: [{display: "font", type: "text", target: ["font"]},
                        {display: "font-family", type: "font", target: ["font-family"]},
                        {
                            display: "size",
                            type: "multi",
                            target: ["font-size"],
                            values: ['', '100%', '1em', '10px', '10pt']
                        },
                        {display: "color", type: "color", target: ["color"]},
                        {display: "font-weight", type: "combo", target: ["font-weight"], values: ['', 'normal', 'bold']},
                        {display: "font-style", type: "combo", target: ["font-style"], values: ['', 'normal', 'italic']},
                        {
                            display: "text-decoration",
                            type: "combo",
                            target: ["text-decoration"],
                            values: ['', 'none', 'underline', 'line-through']
                        },
                        {
                            display: "text-align",
                            type: "combo",
                            target: ["text-align"],
                            values: ['', 'left', 'center', 'right', 'justify']
                        },
                        {
                            display: "vertical-align",
                            type: "combo",
                            target: ["vertical-align"],
                            values: ['', 'baseline', 'top', 'middle', 'bottom']
                        },
                        {
                            display: "white-space",
                            type: "combo",
                            target: ['white-space'],
                            values: ['', 'normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap']
                        },
                        {display: "text-indent", type: "multi", target: ["text-indent"], values: ['', '0', '1em', '10px']},
                        {
                            display: "line-height",
                            type: "multi",
                            target: ["line-height"],
                            values: ['', 'normal', '1.2', '120%']
                        }
                    ]
                }/*,
                 {key: "shapesSVG",
                 className:'maqPropertySection',
                 addCommonPropertiesAtTop:true,
                 pageTemplate:[{display:"stroke", type:"color", target:["stroke"]},
                 {display:"stroke-width", type:"multi", target:["stroke-width"], values:['','1', '2', '3', '4', '5', '10']},
                 {display:"fill", type:"color", target:["fill"]}
                 ]}
                 */
                /*,
                 {title:"Animations",
                 pageTemplate:[{html:"in progress..."}]},
                 {title:"Transistions",
                 pageTemplate:[{html:"in progress..."}]},
                 {title:"Transforms",
                 pageTemplate:[{html:"in progress..."}]},*/

            ];
        },
        buildRendering: function () {
            this.domNode = dojo.doc.createElement("div");
            dojo.addClass(this.domNode, 'propertiesContent');
            var template = "";
            template += this._titleBarDiv;
            template += "<div class='propertiesToolBar' dojoType='davinci.ve.widgets.WidgetToolBar'></div>";
            template += "<div dojoType='davinci.ve.widgets.WidgetProperties'></div>";
            template += "<div class='propScrollableArea'>";
            template += "<table class='propRootDetailsContainer'>";
            template += "<tr>";
            template += "<td class='propPaletteRoot'>";
            //run through pageTemplate to insert localized strings
            var langObj = veNls;




            this.pageTemplate = this.getPageTemplate();

            for (var i = 0; i < this.pageTemplate.length; i++) {
                this.pageTemplate[i].title = langObj[this.pageTemplate[i].key] ? langObj[this.pageTemplate[i].key] : "Key not found";
                if (this.pageTemplate[i].pageTemplate) {
                    for (var j = 0; j < this.pageTemplate[i].pageTemplate.length; j++) {
                        if (this.pageTemplate[i].pageTemplate[j].key) {
                            this.pageTemplate[i].pageTemplate[j].display += langObj[this.pageTemplate[i].pageTemplate[j].key] ? langObj[this.pageTemplate[i].pageTemplate[j].key] : "Key not found";
                        }
                    }
                }
            }
            this.domNode.innerHTML = template;

            this.inherited(arguments);
        },
        _widgetValuesChanged: function (event) {
            var currentPropSection = this._currentPropSection;
            if (currentPropSection) {
                var found = false;
                for (var propSectionIndex = 0; propSectionIndex < this.pageTemplate.length; propSectionIndex++) {
                    if (this.pageTemplate[propSectionIndex].key == currentPropSection) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    var visibleCascade = this._getVisibleCascade(propSectionIndex);
                    for (var i = 0; i < visibleCascade.length; i++)
                        visibleCascade[i]._widgetValuesChanged(event);
                }
            }
        },
        _getVisibleCascade: function (targetIndex) {
            if (targetIndex)
                return this.pageTemplate[targetIndex]['cascade'];
            var visibleCascade = [];
            var currentPropSection = this._currentPropSection;
            if (currentPropSection) {
                for (var i = 0; i < this.pageTemplate.length; i++) {
                    if (this.pageTemplate[i].key == currentPropSection) {
                        visibleCascade = visibleCascade.concat(this.pageTemplate[i]['cascade']);
                        break;
                    }
                }
            }
            return visibleCascade;
        },
        _updatePaletteValues: function (widgets) {
            //debugger;
            if (!this._editor) {
                console.error('have no editor', widgets);
                return;
            }
            //debugger;

            if(!lang.isArray(widgets)){
                widgets = [widgets];
            }


            var widget = widgets[0];
            /* What about state changes and undo/redo? wdr
             * if(this._widget == widget && this._subwidget==widget.subwidget)
             return false;
             */
            this._widget = widget;
            this._subwidget = widget && widget.subwidget;

            this.setReadOnly(!(this._widget || this._subwidget));
            var visibleCascade = this._getVisibleCascade();
            for (var i = 0; i < visibleCascade.length; i++) {
                visibleCascade[i]._widgetSelectionChanged(widgets);
            }

        },
        _widgetSelectionChanged: function (changeEvent) {
            this._updatePaletteValues(changeEvent);
        },
        _stateChanged: function () {
            var widgets = this._widget ? [this._widget] : [];
            this._updatePaletteValues(widgets);
        },
        _widgetPropertiesChanged: function (widgets) {
            /* Check to see that this is for the same widget
             * Some widget like Tree update the DataStore but not the widget it's self from smar input
             * Cant check the id, it may change.
             */
            if (!this._widget) {
                console.error('have no widget');
            }
            if ((!this._widget) || (this._widget.type === widgets[0].type)) {
                this._updatePaletteValues(widgets);
            }
        },
        _titlePaneOpen: function (index) {

            var visibleCascade = this._getVisibleCascade(index);
            for (var i = 0; i < visibleCascade.length; i++) {
                visibleCascade[i]._editorSelected({'editor': this._editor});
                //visibleCascade[i]._widgetSelectionChanged([this._widget]);

            }

        },
        startup: function () {

            this.domNode.style.height = "100%";
            /*this._editor = Runtime.currentEditor;*/

            this.inherited(arguments);

            //FIXME: Do we need this?
            // Install any onchange handlers for specific input elements
            for (var i = 0; i < this.pageTemplate.length; i++) {
                var section = this.pageTemplate[i];
                if (section.pageTemplate) {
                    for (var j = 0; j < section.pageTemplate.length; j++) {
                        var propData = section.pageTemplate[j];
                        if (propData.onchange && propData.id) {
                            // onchange function gets invoked with "this" pointing to pageTemplate[i]
                            // and receives parameter j
                            dojo.connect(dojo.byId(propData.id), "onchange", dojo.hitch(section, propData.onchange, j));
                        }
                    }
                }
            }
            //FIXME: Do we need this?
            for (var v = 0; v < this.pageTemplate.length; v++) {
                this.pageTemplate[v]['cascade'] = [];
            }
            this.setReadOnly(true);
            this.onEditorSelected();
            this.subscribe("/davinci/ui/widgetValuesChanged", dojo.hitch(this, this._widgetValuesChanged));
            this.subscribe("/davinci/ui/widgetPropertiesChanged", dojo.hitch(this, this._widgetPropertiesChanged));
            //Don't need to subscribe here. ViewLite already does it for us.
            this.subscribe("/davinci/ui/widgetSelected", dojo.hitch(this, this._widgetSelectionChanged));
        },
        destroy:function(){
            this.inherited(arguments);
            for (var v = 0; v < this.pageTemplate.length; v++) {
                var page = this.pageTemplate[v]['pageTemplate'];
                if (!page)
                    continue;
                for (var i = 0; i < page.length; i++) {
                    var widget = page[i]['widget'];
                    if (widget) {
                        //widget.set("readOnly", isReadOnly);
                        if(widget._destroyed){
                            page[i]['widget']=null;
                        }else{
                            widget.destroy();
                        }
                    }
                    else {
                        var node = page[i].domNode;
                        if (node) {
                            //dojo.attr(node, "disabled", isReadOnly);
                        }
                    }
                }
            }

        },
        setReadOnly: function (isReadOnly) {
            for (var v = 0; v < this.pageTemplate.length; v++) {
                var page = this.pageTemplate[v]['pageTemplate'];
                if (!page)
                    continue;
                for (var i = 0; i < page.length; i++) {
                    var widget = page[i]['widget'];
                    if (widget)
                        widget.set("readOnly", isReadOnly);
                    else {
                        var node = page[i].domNode;
                        if (node)
                            dojo.attr(node, "disabled", isReadOnly);
                    }
                }
            }
        },
        _modelEntryById: function (id) {
            for (var v = 0; v < this.pageTemplate.length; v++) {
                var page = this.pageTemplate[v]['pageTemplate'];
                if (!page)
                    continue;
                for (var i = 0; i < page.length; i++) {
                    var sectionId = page[i]['id'];
                    if (id == sectionId) {
                        return page[i];
                    }
                }
            }
        },
        _editorSelected: function (editorChange) {

            this._editor = editorChange.editor;
            this.onEditorSelected(this._editor);

            var parentTabContainer = this.getParent();
            //console.log('_editor selected',parentTabContainer);
            var selectedChild = parentTabContainer.selectedChildWidget;
            var updatedSelectedChild = false;
            var allSections = dojo.query('.maqPropertySection', parentTabContainer.domNode);
            if (this._editor) {
                if (this._editor.declaredClass != 'davinci.ve.PageEditor' &&
                    this._editor.declaredClass != 'davinci.ve.themeEditor.ThemeEditor') {
                    //Hide all sections
                    allSections.forEach(function (section) {
                        var contentPane = dijit.byNode(section);
                        if (contentPane.controlButton) {
                            contentPane.controlButton.domNode.style.display = 'none';
                        }
                        if (contentPane == selectedChild) {
                            updatedSelectedChild = true;
                        }
                    });
                } else {
                    //Show all sections
                    allSections.forEach(function (section) {
                        var contentPane = dijit.byNode(section);
                        if (contentPane.controlButton) {
                            contentPane.controlButton.domNode.style.display = '';
                        }
                    });
                    if (this._editor.declaredClass == 'davinci.ve.themeEditor.ThemeEditor') {
                        //Hide sections intended only for page editor
                        var pageEditorOnlySections = dojo.query('.page_editor_only', parentTabContainer.domNode);
                        pageEditorOnlySections.forEach(function (section) {
                            var contentPane = dijit.byNode(section);
                            if (contentPane.controlButton) {
                                contentPane.controlButton.domNode.style.display = 'none';
                            } else {

                            }
                            if (contentPane == selectedChild) {
                                updatedSelectedChild = true;
                            }
                        });
                    }
                }
            } else {
                //No editor, so bring back to default state by showing all sections
                allSections.forEach(function (section) {
                    var contentPane = dijit.byNode(section);
                    contentPane.controlButton.domNode.style.display = '';
                });
                updatedSelectedChild = true;
            }
            if (updatedSelectedChild) {
                this._selectFirstVisibleTab();
            }
        },
        onEditorSelected: function () {
            //we should clear selected widget from the old editor
            this._widget = null;
            this._subWidget = null;

            //this._updateToolBars();

            /* add the editors ID to the top of the properties pallete so you can target CSS rules based on editor */
            if (this._oldClassName) {
                if (this.domNode) {
                    dojo.removeClass(this.domNode.parentNode.parentNode, this._oldClassName); //remove the class from the  tab container
                } else {
                    console.error('have no dom node !');
                }
            }

            if (!this._editor) {
                return;
            }
            if (this._editor && this._editor.editorID) {
                this._oldClassName = this._editor.editorID.replace(/\./g, "_");
                if (this.domNode) {
                    dojo.addClass(this.domNode.parentNode.parentNode, this._oldClassName); //put the class on the  tab container
                } else {
                    console.error('have no dom node !');
                }
            }

            if (!this.domNode) {
                console.error('have no dom node !');
                return;
            }

            //FIXME: I'm pretty sure at least some of the code below is no longer necessary
            // Hide or show the various section buttons on the root pane
            var currentPropSection = this._currentPropSection;
            var sectionButtons = dojo.query(".propSectionButton", this.domNode);
            for (var i = 0; i < sectionButtons.length; i++) {
                var sectionButton = sectionButtons[i];
                if (this._editor && this._editor.supports && this._editor.supports('propsect_' + this.pageTemplate[i].key)) {
                    dojo.removeClass(sectionButton, 'dijitHidden');
                } else {
                    dojo.addClass(sectionButton, 'dijitHidden');
                    if (currentPropSection == this.pageTemplate[i].key) {
                        // If a hidden section is currently showing, then
                        // jump to Property palette's root view.
                        HTMLStringUtil.showRoot();
                    }
                }
            }
            //ENDOF FIXME COMMENT

            var visibleCascade = [];
            for (var i = 0; i < this.pageTemplate.length; i++) {
                var cascade = this.pageTemplate[i]['cascade'];
                if (cascade) {
                    visibleCascade = visibleCascade.concat(cascade);
                } else {
                    console.log("no cascade found");
                }
            }
            for (var i = 0; i < visibleCascade.length; i++) {
                var cascade = visibleCascade[i];
                if (cascade._editorSelected) {
                    cascade._editorSelected({'editor': this._editor});
                }
            }


        },
        _destroyContent: function () {
            var containerNode = (this.containerNode || this.domNode);
            dojo.forEach(dojo.query("[widgetId]", containerNode).map(dijit.byNode), function (w) {
                w.destroy();
            });
            while (containerNode.firstChild) {
                dojo._destroyElement(containerNode.firstChild);
            }
            dojo.forEach(this._tooltips, function (t) {
                t.destroy();
            });
            this._tooltips = undefined;
        },
        sectionTitleFromKey: function (key) {
            for (var i = 0; i < this.pageTemplate.length; i++) {
                if (this.pageTemplate[i].key == key) {
                    return this.pageTemplate[i].title;
                }
            }
        },
        _initialPerspectiveReady: function () {
            var cp =null;
            if (!this._alreadySplitIntoMultipleTabs) {
                var parentTabContainer = this.tabContainer;
                dojo.addClass(parentTabContainer.domNode, 'propRootDetailsContainer');
                dojo.addClass(parentTabContainer.domNode, 'propertiesContent');


                for (var i = 0; i < this.pageTemplate.length; i++) {
                    var key = this.pageTemplate[i].key;
                    var title = this.pageTemplate[i].title;
                    var className = this.pageTemplate[i].className;
                    if (!className) {
                        className = '';
                    }
                    var topContent = this._titleBarDiv;
                    topContent += "<div class='propertiesToolBar' dojoType='davinci.ve.widgets.WidgetToolBar'></div>";
                    topContent += "<div class='cascadeBackButtonDiv'><button onclick='davinci.ve.widgets.HTMLStringUtil.showSection(\"" + key + "\",\"" + title + "\")'>" + title + " " + veNls.properties + "</button></div>";
                    var paneContent = HTMLStringUtil.generateTemplate(this.pageTemplate[i]);
                    var content = topContent + paneContent;
                    if (i == 0) {
                        cp = this;
                        cp.set('title', title);
                        dojo.addClass(cp.domNode, className);
                    } else {



                        var contentPane = parentTabContainer.createTab(title, null, null, null, {
                            'class': className,
                            delegate: this
                        });
                        contentPane._maqPropGroup = this.pageTemplate[i].key;



                        //if(i==1){
                        cp = utils.addWidget(ContentPane,{
                            title: title,
                            content: content,
                            'class': className,
                            delegate: this,
                            style:"with:inherit;height:inherit"
                            //resizeToParent:true
                        }, null,contentPane,false);
                        contentPane.cp = cp;
                        contentPane._maqPropGroup = this.pageTemplate[i].key;
                        contentPane.add(cp,null,false);
                        // }

                    }

                    if(cp) {
                        cp._maqPropGroup = this.pageTemplate[i].key;
                    }

                    //FIXME: temp hack
                    var closeBoxNodes = dojo.query('.paletteCloseBox', cp.domNode);
                    if (closeBoxNodes.length > 0) {
                        var closeBox = closeBoxNodes[0];
                        dojo.connect(closeBox, 'click', this, function (event) {
                            davinci.Workbench.collapsePaletteContainer(event.currentTarget);
                        });
                    }
                }

                for (var v = 0; v < this.pageTemplate.length; v++) {
                    this.pageTemplate[v]['cascade'] = [];
                    var page = this.pageTemplate[v]['pageTemplate'];
                    if (!page)
                        continue;
                    for (var i = 0; i < page.length; i++) {
                        var id = page[i]['id'];
                        var widget = dijit.byId(id);
                        if (widget) {
                            page[i]['widget'] = widget;
                        } else {
                            widget = dojo.byId(id);
                            if (widget)
                                page[i]['domNode'] = widget;
                        }
                    }
                    var sectionId = this.pageTemplate[v].id;
                    var nodeList = dojo.query("#" + sectionId + " .CascadeTop");
                    nodeList.forEach(function (target) {
                        return function (p) {
                            var cascade = dijit.byId(p.id);
                            target['cascade'].push(cascade);
                        };
                    }(this.pageTemplate[v]));
                }
                var thiz = this;
                parentTabContainer._on('selectChild',function (tab) {
                    if (tab._maqPropGroup) {
                        /*
                         if(!tab.cp) {
                         var cp = utils.addWidget(ContentPane, {
                         //title: title,
                         content: content,
                         'class': tab['class'],
                         delegate: tab.delegate
                         }, null, tab, true);

                         tab.cp = cp;
                         //contentPane._maqPropGroup = this.pageTemplate[i].key;
                         contentPane._maqPropGroup = tab._maqPropGroup;
                         tab.add(cp, null, false);
                         utils.resizeTo(cp,tab,true,true);


                         }
                         */


                        this._currentPropSection = tab._maqPropGroup;
                        var context = (this._editor && this._editor.getContext) ? this._editor.getContext() : null;
                        var selection = (context && context.getSelection) ? context.getSelection() : [];
                        this._updatePaletteValues(selection);
                        HTMLStringUtil._initSection(this._currentPropSection);
                        parentTabContainer.resize();
                        tab.resize();
                        tab.cp.resize();
                    }
                }.bind(this));

                //utils.resizeTo(parentTabContainer,this,true,true);
                parentTabContainer.selectChild(0);
                this._alreadySplitIntoMultipleTabs = true;
            }

        },
        _workbenchReady: function () {
            this._updateToolBars();
        },
        _updateToolBars: function () {
            var propertyToolbarContainers = dojo.query('.propertiesToolBar');
            propertyToolbarContainers.forEach(function (container) {
                if (this._editor && this._editor.declaredClass == 'davinci.ve.PageEditor') {
                    dojo.removeClass(container, "dijitHidden");
                    container.style.display = '';
                } else {
                    dojo.addClass(container, 'dijitHidden');
                }
            }.bind(this));
        },
        _selectFirstVisibleTab: function () {
            var parentTabContainer = this.getParent();
            var children = parentTabContainer.getChildren();
            for (var i = 0; i < children.length; i++) {
                var cp = children[i];
                if (cp.controlButton.domNode.style.display != 'none') {
                    // This flag prevents Workbench.js logic from triggering expand/collapse
                    // logic based on selectChild() event
                    parentTabContainer._maqDontExpandCollapse = true;
                    parentTabContainer.selectChild(cp);
                    delete parentTabContainer._maqDontExpandCollapse;
                    break;
                }
            }
        }
    });



    return dcl(WidgetBase, {
        declaredClass:"xide.widgets.DomStyleProperties",
        wContentSelectorButton: null,
        lastUploadedFileName: null,
        oriPath: null,
        minHeight: "400px;",
        value: "",
        options: null,
        styleView: null,
        tabContainer: null,
        stylePane: null,
        preview: null,
        widgetNode:null,
        values: {},//temporary key-value map. used before going into value
        previewExtraStyle: 'max-width:300px;max-height:100px;height:inherit;width:inherit;',
        templateString: "<div class='widgetContainer widgetBorder widgetTable' style=''>" +
        "<table border='0' cellpadding='5px' width='100%' >" +
        "<tbody>" +
        "<tr attachTo='extensionRoot'>" +
            //"<td width='15%' class='widgetTitle'><span><b>${!title}</b><span></td>" +
            "<td width='100px' class='widgetValue2' valign='middle' attachTo='previewNode'></td>" +
            "<td class='extension' width='25px' attachTo='button0'></td>" +
            "<td class='extension' width='25px' attachTo='button1'></td>" +
            "<td class='extension' width='25px' attachTo='button2'></td>" +
        "</tr>" +
        "</tbody>" +
        "</table>" +
        "<div attachTo='expander' onclick='' style='width:100%;'></div>" +
        "<div attachTo='previewRoot' style='width: inherit;min-height:100px;height:auto;padding: 4px;background-color: #808080'>" +
        "<div id='div_5' attachTo='widgetNode' style='width: inherit;height:inherit;'></div>" +
            "<span class='dijitReset' style='text-align: center'>Some Text</span>" +
        "</div>" +
        "<div attachTo='last'></div>" +
        "</div>",
        filePathValidator: function (value, constraints) {
            return true;
        },
        loadVE: function (readyCB) {
            var styleViewProto = dojo.getObject('xideve.views.StyleView');
            var thiz = this;
            if (!styleViewProto) {
                var _re = require;
                _re([
                    'xideve/Embedded'
                ], function (Embedded) {
                    var veEmbedded = new Embedded();
                    if (readyCB) {
                        readyCB();
                    }
                });
            } else {
                readyCB();
            }
        },
        postMixInProperties: function () {
            if (this.userData && this.userData.title) {
                this.title = this.userData.title;
            }


            if ((this.userData && this.userData.vertical === true) || this.vertical === true) {

                this.templateString = "<div class='widgetContainer widgetBorder widgetTable' style=''>" +
                    "<table border='0' cellpadding='5px' width='100%' >" +
                    "<tbody>" +
                    "<tr attachTo='extensionRoot'>" +
                        "<td class='widgetValue2' valign='middle' attachTo='previewNode'></td>" +
                        "<td class='extension' width='25px' attachTo='button0'></td>" +
                        "<td class='extension' width='25px' attachTo='button1'></td>" +
                        "<td class='extension' width='25px' attachTo='button2'></td>" +
                    "</tr>" +
                    "</tbody>" +
                    "</table>" +
                    "<div attachTo='expander' onclick='' style='width:100%;'></div>" +
                    "<div attachTo='previewRoot' style='width: inherit;height:120px;padding: 4px;background-color: #808080'>" +
                    "<div id='div_5' attachTo='widgetNode' style='width: inherit;height:100px;'>" +
                        "<span class='dijitReset' style='text-align: center'>Some Text</span>" +
                    "</div>" +
                    "</div>" +
                    "<div attachTo='last' style=''></div>" +
                    "</div>"
            }

        },
        onReloaded: function () {
            console.log('on reloaded');
            this._destroyWidgets();
            this.createWidgets();

        },
        _destroyWidgets: function () {

            utils.destroy(this.tabContainer);
            utils.destroy(this.styleView);
            utils.destroy(this.stylePane);
            dojo.empty(this.last);
            this.styleView = null;
        },
        createWidgets: function () {
            this.styleView = this.createStyleView();
        },
        getStyleArray: function () {
            var value = utils.toString(this.userData['value']);
            var _values = value.split(';');
            var result = [];
            for (var i = 0; i < _values.length; i++) {
                var obj = _values[i];
                if (!obj || obj.length == 0 || !obj.split) {
                    continue;
                }
                var keyVal = obj.split(':');
                if (!keyVal || !keyVal.length) {
                    continue;
                }
                var _prop = {};
                _prop[keyVal[0]] = keyVal[1];
                result.push(_prop);
            }
            return result;
        },
        createStyleView: function () {

            var pane = utils.addWidget(ContentPane, {
                title: 'Widget Properties',
                closable: false,
                style: 'padding:0px;min-height:400px;'
            }, this, this.last,true, 'ui-widget-content');

            this.stylePane = pane;

            var tabContainer = utils.addWidget(_TabContainer, {
                region: 'center',
                id: 'palette-tabcontainer-right-top',
                tabPosition: 'right' + '-h',
                tabStrip: false,
                'class': "davinciPalette davinciTopPalette widget",
                style: 'height:inherit;width:inherit;',
                splitter: false,
                direction:'right',
                resizeToParent:true
            }, null, pane, true);
            domClass.add(tabContainer.domNode, "davinciPalette davinciTopPalette");

            tabContainer.startup();

            this.tabContainer = tabContainer;
            var _re = require;
            var thiz = this;
            var styleView=null;

            try {
                styleView = new StyleView({
                    toolbarDiv: pane.containerNode,
                    //_editor: this.editor,
                    parentContainer: tabContainer,
                    tabContainer:tabContainer
                });
            } catch (e) {
                console.error('html_style_view crash ' + e);

            }
            this.add(styleView);
            var _ctx = this.createFakeContext();
            this.supports = function () {
                return true;
            };
            var widgetEventData = this.createFakeWidget(_ctx);
            this._widgetSelection = [widgetEventData];


            styleView._initialPerspectiveReady();
            styleView._editor = this;
            this.editorID = 'davinci.ve.HTMLPageEditor';
            styleView._widgets = [widgetEventData];
            styleView._widget = widgetEventData;
            this.getContext=function(){
                return _ctx;
            }
            this.getSelection=function(){
                return thiz._widgetSelection;
            }
            this.publish("/davinci/ui/widgetSelected", this._widgetSelection);
            return styleView;
        },
        onSelect: function () {
            if (!this.styleView) {
                this.createWidgets();
            } else {
                this._destroyWidgets();
            }

        },
        _onChanged: function () {
            var _value = this._toStyleString(this.values);
            if (_value === ";") {
                _value = '';
            }
            this.userData.changed = true;
            this.userData.active = true;
            this.editBox.set('value', _value);
            var previewVal = _value + this.previewExtraStyle;
            domAttr.set(this.widgetNode, 'style', previewVal);
            this.setValue(_value);
        },
        onChangeStyleProperty: function (property, value) {
            if (!property || property === 'undefined') {
                return;
            }
            if (!value || !value.length) {
                delete this.values[property];
                this._onChanged();
                return;
            }
            this.values[property] = value;
            this._onChanged();
        },
        onStyleValuesChange: function (evt) {
            if (!evt || !evt.cascade || !evt.values) {
                return;
            }
            if (utils.isDescendant(this.domNode, evt.cascade.domNode)) {
                this.onChangeStyleProperty(evt.cascade.target[0], evt.cascade._value);
            }
        },
        _toStyleString: function (values) {
            var _values = [];
            for (var prop in values) {
                _values.push(prop + ':' + values[prop]);
            }
            return _values.join(';') + ';';
        },
        _toObject: function (styleString) {

            var _result = {};
            var _values = styleString.split(';');
            for (var i = 0; i < _values.length; i++) {
                var obj = _values[i];
                if (!obj || obj.length == 0 || !obj.split) {
                    continue;
                }
                var keyVal = obj.split(':');
                if (!keyVal || !keyVal.length) {
                    continue;
                }
                _result[keyVal[0]] = keyVal[1];
            }
            return _result;
        },
        _createEditBox: function () {
            var thiz = this;

            var value = utils.toString(this.userData['value']);
            this.editBox = factory.createValidationTextBox(this.previewNode, "", "Value", value, this.filePathValidator, this.delegate, 'Not a path!', 'I need some input');
            this.connectEditBox(this.editBox, function (value) {
                if (value && value.length) {
                    thiz.values = thiz._toObject(value);
                    thiz.setValue(value);
                    domAttr.set(thiz.widgetNode, 'style', value + thiz.previewExtraStyle);
                    if(thiz.styleView) {
                        thiz.styleView._updatePaletteValues(thiz._widgetSelection);
                    }
                }
            });
        },
        createFakeContext:function(){
            var self = this;
            var ctx = {
                editor: self,
                blockChange: function () {
                },
                getAppCssRelativeFile: function () {
                    return '';
                },
                getThemeMeta: function () {
                    return null;
                },
                getStyleAttributeValues: function (widget) {
                    return self.getStyleArray();
                },
                getSelection: function () {
                    return self._widgetSelection;
                },
                _cssCache: {},
                _getCssFiles: function () {
                    return null;
                },
                getModel: function () {
                    return {
                        getRule: function () {
                            return [];
                        }
                    }
                },
                model: {
                    getMatchingRules: function () {
                        return {
                            rules: []
                        }
                    }
                }
            };

            return ctx;
        },
        createFakeWidget:function(ctx){
            var widgetEventData = {
                owner: this,
                isFake: true,
                domNode: this.widgetNode,
                type: 'html.div',
                _srcElement: {
                    tag: 'div'
                },
                isHtmlWidget: true,
                isWidget: false,
                _skipAttrs: [],
                _edit_context: {},
                id: "div_5",
                _params: null,
                children:[],
                getClassNames: function () {
                    return null;
                },
                getContext: function () {
                    return ctx;
                },
                metadata: {
                    '$ownproperty': {},
                    '$src': 'no source',
                    content: '<div></div>',
                    "description": {
                        "type": "text/html",
                        "value": "<p>The div element has no special meaning at all. It represents its children.</p>"
                    },
                    version: '1.0',
                    "id": "http://www.w3.org/html/div",
                    "name": "html.div",
                    "spec": "1.0",
                    "title": {
                        "type": "text/html",
                        "value": "<p>HTML block-level container element.</p>"
                    }

                }
            };
            return widgetEventData;
        },
        fillTemplate: function () {
            var thiz = this;

            var value = this.userData.value;

            this.values = this._toObject(value);
            var previewVal = value + this.previewExtraStyle;
            domAttr.set(this.widgetNode, 'style', previewVal);
            if (!this.editBox) {
                this._createEditBox();
            }

            this.selectButton = factory.createSimpleButton("",'fa-magic',"",{},this.button0);
            $(this.selectButton).on('click',function(e){
                thiz.onSelect();
            });
            this.subscribe('/davinci/ui/styleValuesChange', this.onStyleValuesChange);
        },
        startup: function () {
            var styleViewProto = dojo.getObject('xideve.views.StyleView');
            var thiz = this;
            var value = this.userData.value;
            this.values = this._toObject(value);
            this._createEditBox();
            if (!styleViewProto) {
                this.loadVE(function () {
                    thiz.fillTemplate();
                })
            } else {
                this.fillTemplate();
            }

            this.onReady();
        }
    });
});