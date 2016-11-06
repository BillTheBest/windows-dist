define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "xide/widgets/WidgetBase",
    'xide/utils',
    'xide/types',
    'xide/views/CIViewMixin',
    'xide/layout/ContentPane'

], function (declare, lang, WidgetBase, utils, types, CIViewMixin,ContentPane) {

    return declare("xide.widgets.BlockSettingsWidget", [WidgetBase], {

        minHeight: "54px;",
        value: "",
        options: null,
        dialogTitle: 'Select Block',
        showDialog:true,
        lastItem:null,
        root:null,
        pane:null,
        view:null,
        /**
         * settings changed are gathered here per block-id
         */
        blockSettings:{

        },
        templateString: "<div class='' style=''>" +
            "<div attachTo='root'></div>" +
        "</div>",

        /**
         * Gathers 'overrides' for a selected block.
         * @param block
         * @param settings
         */
        onSettingsChanged:function(block,settings){

            var _newValue = lang.mixin(this.blockSettings[block.id],settings);

            this.blockSettings[block.id] = _newValue;
            this.userData.changed = true;
            this.userData.active = true;
            var _value = JSON.stringify(_newValue);
            this.value = _value;
            this.setValue(_value);

        },
        onCIUpdate:function(evt){

            console.log('on ci update',evt);

            if( evt['owner'] && evt.owner.source && evt.owner.source.delegate && evt.owner.item && evt.owner.delegate===this){

                var cis = evt.owner.getCIS();
                var item = evt.owner.item;
                var settingsOut = {};
                var options = utils.toOptions(cis);

                for(var i = 0 ; i < options.length ; i++){
                    var option = options[i];
                    var field = option.dst;
                    if(field!=null && item[field]!=null){

                        if(option.active!=null && option.active===false && option.changed===false){
                            continue;
                        }
                        if( item[option.dst]!=option.value ||
                            item[option.dst]!==option.value)
                        {
                            //notify the block before changing something!
                            if(item.onChangeField){
                                item.onChangeField(option.dst,option.value,cis,evt['owner']);
                            }
                            //item[option.dst]=option.value;
                            settingsOut[option.dst] = option.value;
                        }
                    }
                }

                this.onSettingsChanged(this.lastItem,settingsOut);
            }
        },
        onReloaded:function(){

            console.log('on reloaded');

            if(this.lastItem){

                this.initWithBlock(this.lastItem);
            }
        },
        destroy:function(){
            this.inherited(arguments);
        },
        onItemSelected: function (evt) {

            this.lastItem = evt.item;
            this.initWithBlock(evt.item);

            /*

            this.userData.changed = true;
            this.userData.active = true;

            if(this.editBox) {
                this.editBox.set('value', this.lastItem.id);
            }
            this.value = this.lastItem.id;
            this.setValue(this.lastItem.id);*/


        },
        _createPane:function(){

            this.pane = utils.addWidget(ContentPane,{

            },null,this.root,true);

        },
        initWithBlock:function(block){

            this.lastItem = block;

            utils.destroy(this.view,true);
            if(!this.pane){
                this._createPane();
            }


            //var settings = this.blockSettings[block.id];
            var _settings = this.userData['settings'],
                settings = null;
            if(_settings){

                var _newValue = lang.mixin(this.blockSettings[block.id],_settings);
                this.blockSettings[block.id] = _newValue;
                settings = _newValue;
            }

            console.log('init with block',_settings);



            var cisIn = block.getFields(),
                cisOut = [];
            for (var i = 0; i < cisIn.length; i++) {

                var ci = cisIn[i];
                if(cisIn[i].group=='General'){
                    cisOut.push(ci);
                    //apply old settings
                    if(settings && ci['dst'] in settings ){
                        ci['value'] = settings[ci['dst']];
                    }
                }
            }

            if(this.view){

                this.view.empty();
            }else {

                this.view = new CIViewMixin({
                    tabContainer: this.pane,
                    delegate: this,
                    viewStyle: 'padding:0px;',
                    autoSelectLast: true,
                    item: block,
                    source:this,
                    options: {
                        groupOrder: {
                            'Block': 0,
                            'Settings':1
                        }
                    },
                    cis: cisOut
                });
            }
            this.view.initWithCIS(cisOut);

            console.log('got CIS',cisOut);
        },
        startup: function () {

            this.inherited(arguments);

            this.subscribe(
                [types.EVENTS.ON_ITEM_SELECTED,
                types.EVENTS.ON_CI_UPDATE]);

            var scope = this.userData['scope'],
                block = this.userData['block'];

            if(block){
                this.initWithBlock(block);
            }
            this.onReady();
        }
    });
});