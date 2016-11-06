define([
    'dojo/_base/declare',
    "dojox/xml/parser",
    "dojo/dom-attr",
    "dojo/_base/lang" // lang.mixin lang.hitch
],
    function(declare,xmlParser,domAttr,lang)
    {
        return declare("xide.widgets._HTMLTemplateMixin", null,
            {
                setMixins:function(htmlTemplate){

                    var isWrapped=false;
                    var xml = xmlParser.parse(htmlTemplate||this.templateString);

                    if(xml && xml.firstChild && xml.firstChild.attributes && xml.firstChild.attributes.length==1){
                        isWrapped=true;

                        var dataAttriubte = domAttr.get(xml.firstChild, 'data-dojo-props');
                        if(dataAttriubte){

                            try{
                                var jsonData=dojo.fromJson('{' + dataAttriubte+'}');
                                if(jsonData){
                                    lang.mixin(this,jsonData);
                                }
                            }catch(e){
                                console.error('couldnt parse template');
                            }
                        }
                    }
                    if(isWrapped==false){
                        this.templateString = '<div>' + this.templateString + '</div>';
                    }
                },
                parseHTMLTemplate:function (data)
                {
                    if(data && data.htmlTemplate){
                        if(data.htmlTemplate.indexOf('htm')==-1){
                            this.templateString=data.htmlTemplate;
                        }else{
                            this.templateString=this._getHTMLTemplate(data.htmlTemplate);
                        }

                        this.setMixins(this.templateString);
                    }
                },
                _getHTMLTemplate:function(path){
                    return this._getText(path);
                },
                _getText:function(url){
                    var result;
                    var def = dojo.xhrGet({
                        url:url,
                        sync:true,
                        handleAs:'text',
                        load:function(text){
                            result = text;
                        }
                    });
                    return '' + result + '';
                }
            });
    });