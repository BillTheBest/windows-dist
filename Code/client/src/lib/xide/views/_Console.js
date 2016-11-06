/** @module xide/view/_Console **/
define([
    "dcl/dcl",
    'xide/utils',
    'xide/types',
    "dojo/_base/lang", // lang.getObject
    "xide/_base/_Widget"
], function (dcl, utils,types,lang, _Widget) {
    
    
  var Module = dcl([_Widget], {
      declaredClass:'xide/views/_Console',
      templateString: '<div attachTo="containerNode" class="widget" style="height: 100%;width: 100%;">' +
      '<div attachTo="logView" style="height:50%;overflow: auto"></div></div>',
      value: "return 2;",
      resizeToParent: true,
      serverClass: 'XShell',
      consoleClass:null,
      server: null,
      showProgress: false,
      jsContext: null,
      onButton: function () {
          var dst = this.getLoggingContainer();
          if (dst) {
              dojo.empty(dst);
          }
      },
      onConsoleExpanded: function () {
          this._resizeLogView();
      },
      _resizeLogView: function () {
          if (this.console) {
              var total = this.$containerNode.height();
              var consoleH = $(this.console.domNode).height();
              $(this.logView).height(total - consoleH + 'px');
          }
      },
      resize:function(){
          utils.resizeTo(this,this._parent);
          this._resizeLogView();
          return this.inherited(arguments);
      },
      _scrollToEnd: function () {
          var thiz = this;
          setTimeout(function(){
              var container = thiz.getLoggingContainer();
              container.lastChild.scrollIntoViewIfNeeded();
          },10);
          return;
      },
      onServerResponse: function (data, addTimes) {

          var container = this.getLoggingContainer();
          container.children.length > 100 && dojo.empty(container);
          this._resizeLogView();
          var node = this.log(data, addTimes);
          this._scrollToEnd();

          return node;

      },
      getLoggingContainer: function () {
          return this.logView;
      },
      onEnter: function (value, print) {

          if (this.showProgress) {
              this.progressItem = this.createLogItem(value, this.getLoggingContainer());
          }
          var _resolved = '';

          if (this.delegate.onConsoleEnter) {
              _resolved = this.delegate.onConsoleEnter({
                  view: this,
                  console: this.console
              }, value, print);
          }


          if (this.showLastInput) {
              var dst = this.getLoggingContainer();

              print !== false && dst.appendChild(dojo.create("div", {
                  innerHTML: '# ' + (_resolved || value),
                  className: 'widget'
              }));

          }
      },
      getServer: function () {
          return this.server || ctx.fileManager;
      },
      _toString: function (str, addTimes) {
          if (addTimes !== false) {
              return this.addTime(str);
          } else {
              return str;
          }
      },
      addTime: function (str) {
          return moment().format("HH:mm:ss:SSS") + ' ::   ' + str + '';
      },
      onMaximized: function (maximized) {

          this.resize();
          this.publish(types.EVENTS.RESIZE, null, 1500);


      },
      maximize:function(){

          var node = this.domNode,
              $node = $(node),
              thiz = this;

          if (!this._isMaximized) {

              this._isMaximized = true;
              var vp = $(this.domNode.ownerDocument);
              var root = $('body')[0];
              var container = utils.create('div', {
                  className: 'ACEContainer bg-opaque',
                  style: 'z-index:300;height:100%;width:100%'
              });

              this._maximizeContainer = container;


              root.appendChild(container);

              $(node).addClass('AceEditorPaneFullScreen');

              $(node).css('width', vp.width());
              $(node).css('height', vp.height());
              this.resize();


              this._lastParent = node.parentNode;
              container.appendChild(node);


              $(container).addClass('bg-opaque');

              $(container).css('width', vp.width());
              $(container).css('height', vp.height());



              $(container).css({
                  position: "absolute",
                  left: "0px",
                  top: "0px",
                  border: 'none medium',
                  width: '100%',
                  height: '100%'
              });





          } else {
              this._isMaximized = false;
              $node.removeClass('AceEditorPaneFullScreen');
              this._lastParent.appendChild(node);
              utils.destroy(this._maximizeContainer);
          }
          this.onMaximized(this._isMaximized);
          return true;
      },
      log: function (msg, addTimes) {

          utils.destroy(this.progressItem);

          var out = '';
          if (_.isString(msg)) {
              out += msg.replace(/\n/g, '<br/>');
          } else if (_.isObject(msg) || _.isArray(msg)) {
              out += JSON.stringify(msg, null, true);
          } else if (_.isNumber(msg)) {
              out += msg + '';
          };

          var dst = this.getLoggingContainer();
          var items = out.split('<br/>');
          var last = null;
          var thiz = this;

          for (var i = 0; i < items.length; i++) {
              var _class = 'logEntry' + (this.lastIndex % 2 === 1 ? 'row-odd' : 'row-even');

              var item = items[i];
              if(!item || !item.length){
                  continue;
              }

              last = dst.appendChild(dojo.create("div", {
                  className: _class,
                  innerHTML: this._toString(items[i], addTimes)

              }));

              this.lastIndex++;
          }

          if (last) {
              last.scrollIntoViewIfNeeded();
          }
      },
      startup: function () {
          this.createWidgets();
      },
      createWidgets: function () {

          this.console = utils.addWidget(this.consoleClass, {
              style: 'width:inherit',
              delegate: this,
              type: this.type,
              owner: this,
              className: 'consoleWidget',
              value: this.value,
              ctx:this.ctx
          }, this, this.containerNode, true);

          this.console.startup();
          this.add(this.console, null, false);
      }
  });
  return Module;
});