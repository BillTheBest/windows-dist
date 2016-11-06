/** @module xide/widgets/Search **/
define([
    'xdojo/declare',
    'dojo/dom-construct',
    'dojo/on'
], function (declare,domConstruct,on) {
    /**
     * @class module:xide/Search
     * */
    return declare('xide/_Search', null,{
        _searchBoxHTML:'<div class="widget form-group grid_search right ">'+
                '<button type="button" action="hide" class="grid_searchbtn_close"></button>'+
                '<div class="grid_search_form">'+
                    '<input class="form-control input-transparent grid_search_field" placeholder="Search for" spellcheck="false"></input>'+
                    '<button type="button input-group-addon" action="findNext" class="grid_searchbtn next"></button>'+
                    '<button type="button" action="findPrev" class="grid_searchbtn prev"></button>'+
                    '<button type="button" action="findAll" class="grid_searchbtn" title="Alt-Enter">All</button>'+
                '</div> '+
                '<div class="ace_replace_form">'+
                    '<input class="grid_search_field" placeholder="Replace with" spellcheck="false"/>'+
                    '<button type="button" action="replaceAndFindNext" class="ace_replacebtn">Replace</button>'+
                    '<button type="button" action="replaceAll" class="ace_replacebtn">All</button>'+
                '</div>'+
                '<div class="grid_search_options">'+
                    '<span action="toggleRegexpMode" class="ace_button" title="RegExp Search">.*</span>'+
                    '<span action="toggleCaseSensitive" class="ace_button" title="CaseSensitive Search">Aa</span>'+
                    '<span action="toggleWholeWords" class="ace_button" title="Whole Word Search">\\b</span>'+
                '</div>'+
            '</div>'.replace(/>\s+/g, ">"),
        isHidden:function(){
            return !$(this.element).is(":visible");
        },
        showSearchBox:function(container){

            var div = domConstruct.create("div");
            div.innerHTML = this._searchBoxHTML;
            this.element = div.firstChild;
            container.appendChild(div);
            this.init();
        },
        highlight : function(re) {
            /*
             this.editor.session.highlight(re || this.editor.$search.$options.re);
             this.editor.renderer.updateBackMarkers()*/
        },
        find : function(skipCurrent, backwards) {

            var searchText = this.searchInput.value;

            //console.log('search for ',searchText);

            /*
             var range = this.editor.find(this.searchInput.value, {
             skipCurrent: skipCurrent,
             backwards: backwards,
             wrap: true,
             regExp: this.regExpOption.checked,
             caseSensitive: this.caseSensitiveOption.checked,
             wholeWord: this.wholeWordOption.checked
             });
             var noMatch = !range && this.searchInput.value;
             dom.setCssClass(this.searchBox, "ace_nomatch", noMatch);
             this.editor._emit("findSearchBox", { match: !noMatch });
             this.highlight();*/
        },
        findNext : function() {
            this.find(true, false);
        },
        findPrev : function() {
            this.find(true, true);
        },
        findAll : function(){
            /*
             var range = this.editor.findAll(this.searchInput.value, {
             regExp: this.regExpOption.checked,
             caseSensitive: this.caseSensitiveOption.checked,
             wholeWord: this.wholeWordOption.checked
             });
             var noMatch = !range && this.searchInput.value;
             dom.setCssClass(this.searchBox, "ace_nomatch", noMatch);
             this.editor._emit("findSearchBox", { match: !noMatch });
             this.highlight();
             this.hide();
             */
        },
        replace : function() {
            /*
             if (!this.editor.getReadOnly())
             this.editor.replace(this.replaceInput.value);
             */
        },
        replaceAndFindNext : function() {
            /*
             if (!this.editor.getReadOnly()) {
             this.editor.replace(this.replaceInput.value);
             this.findNext()
             }*/
        },
        replaceAll : function() {
            /*
             if (!this.editor.getReadOnly())
             this.editor.replaceAll(this.replaceInput.value);
             */
        },
        hide : function() {
            this.element.style.display = "none";
        },
        show : function(value, isReplace) {
            this.element.style.display = "";
            this.replaceBox.style.display = isReplace ? "" : "none";

            this.isReplace = isReplace;

            if (value)
                this.searchInput.value = value;
            this.searchInput.focus();
            this.searchInput.select();
            //this.editor.keyBinding.addKeyboardHandler(this.$closeSearchBarKb);
        },

        isFocused : function() {
            var el = document.activeElement;
            return el == this.searchInput || el == this.replaceInput;
        },
        initElements : function(sb) {
            this.searchBox = sb.querySelector(".grid_search_form");
            this.replaceBox = sb.querySelector(".ace_replace_form");
            this.searchOptions = sb.querySelector(".grid_search_options");
            this.regExpOption = sb.querySelector("[action=toggleRegexpMode]");
            this.caseSensitiveOption = sb.querySelector("[action=toggleCaseSensitive]");
            this.wholeWordOption = sb.querySelector("[action=toggleWholeWords]");
            this.searchInput = this.searchBox.querySelector(".grid_search_field");
            this.replaceInput = this.replaceBox.querySelector(".grid_search_field");
        },
        init : function() {

            var sb = this.element;

            this.initElements(sb);

            var _this = this;

            on(sb, "mousedown", function(e) {
                setTimeout(function(){
                    _this.activeInput.focus();
                }, 0);
                event.stopPropagation(e);
            });

            on(sb, "click", function(e) {

                /*
                 var t = e.target || e.srcElement;
                 var action = t.getAttribute("action");
                 if (action && _this[action]) {
                 _this[action]();
                 }
                 else if (_this.$searchBarKb.commands[action])
                 {
                 _this.$searchBarKb.commands[action].exec(_this);
                 }


                 event.stopPropagation(e);
                 */
            });




            /*
             event.addCommandKeyListener(sb, function(e, hashId, keyCode) {
             var keyString = keyUtil.keyCodeToString(keyCode);
             var command = _this.$searchBarKb.findKeyCommand(hashId, keyString);
             if (command && command.exec) {
             command.exec(_this);
             event.stopEvent(e);
             }
             });
             */

            /*
             this.$onChange = lang.delayedCall(function() {
             _this.find(false, false);
             });*/

            var _lang = {
                delayedCall : function(fcn, defaultTimeout) {
                    var timer = null;
                    var callback = function() {
                        timer = null;
                        fcn();
                    };

                    var _self = function(timeout) {
                        if (timer == null)
                            timer = setTimeout(callback, timeout || defaultTimeout);
                    };

                    _self.delay = function(timeout) {
                        timer && clearTimeout(timer);
                        timer = setTimeout(callback, timeout || defaultTimeout);
                    };
                    _self.schedule = _self;

                    _self.call = function() {
                        this.cancel();
                        fcn();
                    };

                    _self.cancel = function() {
                        timer && clearTimeout(timer);
                        timer = null;
                    };

                    _self.isPending = function() {
                        return timer;
                    };

                    return _self;
                }
            }

            this.$onChange = _lang.delayedCall(function() {
                _this.find(false, false);
            });

            on(this.searchInput, "input", function() {
                _this.$onChange.schedule(20);
            });
            on(this.searchInput, "focus", function() {
                _this.activeInput = _this.searchInput;
                _this.searchInput.value && _this.highlight();
            });
            on(this.replaceInput, "focus", function() {
                _this.activeInput = _this.replaceInput;
                _this.searchInput.value && _this.highlight();
            });
        }
    });
});
