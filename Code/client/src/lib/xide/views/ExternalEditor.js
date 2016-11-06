define([
    "dojo/_base/declare",
    'dojo/_base/connect',
    "xide/widgets/TemplatedWidgetBase",
    'xide/utils'
],function (declare, connect, TemplatedWidgetBase,utils){

    return declare("xide.views.ScriptEditor", [TemplatedWidgetBase],{

            wFloatingPane:null,
            title:"Scripts",
            idName:'scriptGroup',
            labelUserFolder:'User',
            labelSystemFolder:'System',
            labelAppFolder:'App',
            labelScope:'Scope',
            appFolderRadio:null,
            systemFolderRadio:null,
            userFolderRadio:null,
            toolBarMenu:null,
            currentScope:"XAPP",
            currentScopePath:null,
            scriptFrame:null,
            scriptRoot:null,
            frameUrl:null,
            wNewCustomApp:null,
            wNewPlugin:null,
            scriptFrameParent:null,
            toolBarHeight:"27px",
            wReloadButton:null,
            editorWaitingTime:4000,
            menuBar:null,
            editorUrl:null,
            isLoading:false,
            templateString:"<div id='scriptContentPane' class='scriptEditor' data-dojo-type='dojox.layout.ContentPane' title='${!title}' data-dojo-attach-point='wFloatingPane' style=''>" +
                "<div id='scriptFrameParent' class='scriptFrameParent' data-dojo-attach-point='scriptFrameParent'></div>"+
                "</div>",
            onEditorReady:function (url)
            {
                var scriptStandBy = dijit.registry.byId('scriptStandBy');
                if(scriptStandBy)
                {
                    scriptStandBy.hide();
                }
                this.frameUrl = url;
                if(!url){
                    return null;
                }
                var thiz=this;
                var xdmTarget = this.scriptFrameParent;

                if(xdmTarget)
                {
                  //  xdmTarget.blur();
                }

                this._focusEditor();
                this.isLoading=false;

                this.scriptFrame = new easyXDM.Socket({
                    remote:url,
                    container:this.scriptFrameParent,
                    props:{
                        style:{
                            width:"100%",
                            height:"100%"
                        },
                        width:"100%",
                        height:"100%"
                    },
                    onload:function()
                    {
                        console.error('iframe ready');
                    },
                    onReady:function()
                    {
                        console.error('xdm ready');
                    },
                    onMessage:function(message, origin) {
                        //thiz.onEditorMessage(dojo.fromJson(message));
                    }
                });
                console.error('scriptFrame : ' + this.scriptFrame.id);
            },
            _focusEditor:function(){
                setTimeout(function()
                {
                    var l = dojo.query('[id*=\"easyXDM_\"]');
                    if(l!=null && l.length > 0)
                    {
                        for(var i = 0 ; i < l.length ; i++)
                        {
                            if(l[i].contentWindow)
                            {
                                l[i].contentWindow.focus();
                            }
                        }
                    }
                },200);
            },
            createScriptFrame:function (scope)
            {
                if(this.isLoading){
                    return;
                }
                this.isLoading=true;
                var thiz = this;
                var frameReady = function (res)
                {
                    setTimeout(function ()
                    {
                        thiz.onEditorReady(res);
                    }, thiz.editorWaitingTime);
                };
                var defered = sctx.getScriptManager().serviceObject.getScriptIFrameUrl(sctx.getSession().getUUID(), sctx.getSession().getAppId(), sctx.getSession().getStylePlatform(), scope);
                defered.addCallback(frameReady);
            },
            onShowEditor:function()
            {
                this._focusEditor();
                var cxroot = sctx.getSession().getCXAppRoot();
                if(!this.scriptFrame)
                {
                    /**
                     *  Scope is app folder
                     */
                    if(this.currentScope=="XAPP")
                    {
                        var scriptStandBy = dijit.registry.byId('scriptStandBy');
                        if(scriptStandBy)
                        {
                            scriptStandBy.show();
                        }
                        this.currentScopePath=this.getCurrentScope();
                        this.createScriptFrame(this.getCurrentScope());
                    }
                }

                if (cxroot && this.wNewCustomApp)
                {
                    utils.destroy(this.wNewCustomApp);
                    this.wNewCustomApp=null;
                }
                console.error("on show editor");
            },
            onHide:function()
            {

            },
            destroy:function()
            {

            },
            buildRendering:function()
            {
                this.inherited(arguments);
            },
            onCustomAppReady:function (res)
            {
                location.reload();
            },
            /***
             * Custom App Related
             * @param dlg
             */
            onNewCustomAppOk:function (dlg)
            {
                var thiz = this;
                var cxappReady = function (res)
                {
                    setTimeout(function () {
                        thiz.onCustomAppReady(res);
                    }, 100);
                };
                var defered = sctx.getScriptManager().serviceObject.createCustomApp(sctx.getSession().getUUID(), sctx.getSession().getAppId(), sctx.getSession().getStylePlatform(), dlg.customAppSettingsView.folderType);
                defered.addCallback(cxappReady);
            },
            openCustomAppWizard:function ()
            {
                var thiz = this;
                var delegate =
                {
                    onOk:function (dlg)
                    {
                        thiz.onNewCustomAppOk(dlg);
                    }
                };
                var dlg = xas.factory.createNewCustomAppDialog(delegate, sctx.getSession().getUUID(), sctx.getSession().getAppId(), sctx.getSession().getStylePlatform());
            },
            getCurrentScope:function()
            {
                if(this.appFolderRadio.get('checked'))
                {
                    return "%XAPP%";
                }
                if(this.userFolderRadio.get('checked'))
                {
                    return "%XUSER%";
                }
                if(this.systemFolderRadio.get('checked'))
                {
                    return "%XAPP%";
                }

                return null;
            },
            onNewCustomPluginOk:function(dlg){
                var cxappReady = function (res)
                {
                    setTimeout(function () {
                        location.reload();
                    }, 100);
                };
                var scope=this.getCurrentScope();
                var defered = sctx.getScriptManager().serviceObject.createCustomPlugin(sctx.getSession().getUUID(), sctx.getSession().getAppId(), dlg.settingsView.wIdentifier.get('value'), scope);
                defered.addCallback(cxappReady);
            },
            openCustomPluginWizard:function ()
            {
                var thiz = this;
                var delegate =
                {
                    onOk:function (dlg)
                    {
                       thiz.onNewCustomPluginOk(dlg);
                    }
                };
                var dlg = xas.factory.createNewCustomPluginDialog(delegate, sctx.getSession().getUUID(), sctx.getSession().getAppId(), sctx.getSession().getStylePlatform());
            },
            onNewCustomApp:function(){
                var cxroot = sctx.getSession().getCXAppRoot();
                if (!cxroot)
                {
                    this.openCustomAppWizard();
                }
            },
            reloadScriptEditor:function(scope)
            {
                var scriptStandBy = dijit.registry.byId('scriptStandBy');
                if(scriptStandBy)
                {
                    scriptStandBy.show();
                }

                dojo.empty(this.scriptFrameParent);
                this.scriptFrame=null;
                this.currentScopePath=scope||this.getCurrentScope();
                this.createScriptFrame(scope||this.currentScopePath);
            },
            changeScope:function(scope){

            },
            _registerMenuHandlers:function(){
                var thiz=this;
                if(this.wNewCustomApp)
                {
                    connect.connect(this.wNewCustomApp, "onClick", function(item)
                    {
                        thiz.onNewCustomApp();
                    });
                }

                if(this.wNewPlugin)
                {
                    connect.connect(this.wNewPlugin, "onClick", function(item)
                    {
                        thiz.openCustomPluginWizard();
                    });
                }
                connect.connect(this.wReloadButton, "onClick", function(item)
                {
                    setTimeout(function(){
                        thiz.reloadScriptEditor();
                    },800);
                });

                this.connect(this.appFolderRadio, "onClick", function (choice)
                {
                    setTimeout(function(){
                        thiz.reloadScriptEditor();
                    },800);

                });
                this.connect(this.userFolderRadio, "onClick", function (choice)
                {
                    setTimeout(function(){
                        thiz.reloadScriptEditor();
                    },800);

                });

                this.connect(this.systemFolderRadio, "onClick", function (choice)
                {
                    setTimeout(function(){
                        thiz.reloadScriptEditor();
                    },800);
                });
            },
            startup:function()
            {
                if(this._started){
                    return;
                }

                this.inherited(arguments);
                this._registerMenuHandlers();

                if(typeof isAdmin !='undefined' && isAdmin===true)
                {
                    this.systemFolderRadio.set('disabled',false);
                }
            }
        });
    });