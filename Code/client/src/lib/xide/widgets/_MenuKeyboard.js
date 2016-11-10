define([
    "dcl/dcl",
    "xide/$",
    "xide/lodash",
    "xide/mixins/EventedMixin"
], function (dcl, $, _, EventedMixin) {

    var skip = [
        '.divider',
        '.nav-header',
        '.disabled'
    ];

    var Module = dcl(EventedMixin.dcl, {
        owner: null,
        /**
         *
         * @param owner
         */
        setup: function (owner) {
            this.owner = owner;
        },
        /**
         * Return parent action container for an element
         * @param $el {jQuery}
         * @param $max {jQuery}
         * @param dataIdentifier {string} The data identifier to find some object in $el
         * @returns {jQuery|null}
         */
        findNavigationContainerElement: function ($el, $max, dataIdentifier) {
            if (!$el || !$el[0]) {
                return null;
            }
            if ($el && $max && $el[0] == $max[0]) {
                return $el;
            }

            var data = $el.data(dataIdentifier || 'data');
            if (data && data != null) {
                return $el;
            }
            return this.findNavigationContainerElement($el.parent(), $max, dataIdentifier);
        },
        /**
         *
         * @param $el
         * @param $max
         * @param dataIdentifier
         * @returns {jQuery|null}
         */
        findNavigationElement: function ($el, $max, dataIdentifier) {
            if (!$el || !$el[0]) {
                return null;
            }
            if ($el && $max && $el[0] == $max[0]) {
                return $el;
            }
            var data = $el.data(dataIdentifier || 'item') || $el.data(dataIdentifier || 'data');
            if (data && !_.isEmpty(data)) {
                return $el;
            }
            return this.findNavigationElement($el.parent());
        },
        /**
         *
         * @param $el {jQuery}
         * @param $max {jQuery}
         * @param dataIdentifier {string} The data identifier to find some object in $el
         * @param findParent
         * @returns {{element: Object, data: (*|{}), parent: *}}
         */
        toNavigationData: function ($el, $max, dataIdentifier, findParent) {
            var element = this.findNavigationElement($el, $max, dataIdentifier);
            if (element) {
                var data = element.data(dataIdentifier || 'item') || element.data(dataIdentifier || 'data');
                if (data) {
                    return {
                        element: element,
                        data: data,
                        parent: findParent !== false ? this.findNavigationContainerElement($el, $max, dataIdentifier) : null
                    };
                }
            }
        },
        /**
         *
         * @param $parent
         * @param $origin
         * @param direction
         * @returns {*}
         */
        next: function ($parent, $origin, direction) {
            if ($origin) {
                var result = $origin[direction == 1 ? 'next' : 'prev']();
                if (!this.canSelect(result)) {
                    return this.next($parent, result, direction);
                } else {
                    return result;
                }
            }
        },
        /**
         * Return valid children
         * @param $el{jQuery}
         * @returns {*}
         */
        canSelect: function ($el) {
            return $($el).is(skip.join(',')) == false;
        },
        /**
         *
         * @param $parent{jQuery}
         * @param all {boolean}
         * @returns {HTMLElement[]}
         */
        children: function ($parent, all) {
            var self = this;
            return $parent.children('LI').filter(function (i, child) {
                if (all !== true) {
                    return self.canSelect(child);
                } else {
                    return child;
                }
            });
        },
        /**
         *
         * @param $el {jQuery}
         */
        close: function ($el) {
            var _parent = $el.parent();
            var _parentParent = $el.parent().parent();
            _parent.css('display', '');
            _parent.removeClass('open');
            $el.removeClass('open');
            $el.removeClass('focus');
            $el.removeClass('active');
            _parentParent.removeClass('open');
            _parentParent.focus();
        },
        /**
         * Opens the very root menu by a given origin
         * @param $el
         * @param $next
         * @param direction {init} left = -1, right = 1
         * @returns {*}
         */
        openRoot: function ($el, $next, direction) {
            var _next = $next || this.topMost($el).parent()[direction === -1 ? 'prev' : 'next']();
            var _trigger = $(_next.find('A')[0]);
            _trigger.trigger('click');
            var _navData = this.toNavigationData($(_next.find('UL')[0]), this.owner.getRootContainer());
            if (_navData) {
                return this.activate($(this.children(_navData.element)[0]), _navData.element, true);
            }

        },
        destroy: function () {
            delete this.owner;
        },
        /**
         *
         * @param $el {jQuery}
         */
        open: function ($el) {
            $el.css('display', 'block');
            var _navData = this.toNavigationData($el, this.owner.getRootContainer(), 'data', null, null);
            var firstInner = this.children(_navData.parent)[0];
            if (firstInner) {
                _navData = this.toNavigationData($(firstInner), this.owner.getRootContainer());
                this.activate(_navData.element, _navData.parent, true);
            }
        },
        topMost: function ($el) {
            if ($el) {
                var data = $el.data();
                if (data.item || data.data) {
                    var next = $el.parent();
                    var parentData = next.data();
                    if (next && next[0] && (parentData.item || parentData.data)) {
                        return this.topMost(next);
                    }
                    return $el;
                }
            }
        },
        keyboardHandler: function (event, $parent) {
            var origin = $parent.data('currentTarget');
            if (event.keyCode === 13) {
                var trigger = origin.find("A");
                var handler = trigger.data('handler');
                if (handler) {
                    var actionResult = handler();
                    if (actionResult && actionResult.then) {
                        actionResult.then(function () {
                            origin.focus();
                        });
                    }
                    return;
                }
                //perform action
                origin.find("A").click();
                origin.focus();
                return;
            }

            var vertical = event.keyCode == 38 || event.keyCode == 40 || event.keyCode == 36 || event.keyCode == 35;
            var horizontal = event.keyCode == 37 || event.keyCode == 39;
            var direction = vertical ? (event.keyCode == 38 || event.keyCode == 36) ? -1 : 1 : (event.keyCode == 37 ? -1 : 1 );
            var max = !!(event.keyCode == 36 || event.keyCode == 35 );

            var nextElement = null;
            var nextData = {};
            var navData = null;
            if (vertical) {
                nextElement = max ? direction == 1 ? $(_.last(this.children($parent))) : $(_.first(this.children($parent))) : this.next($parent, origin, direction);
                nextElement && (nextData = nextElement.data('item'));
            }
            if (horizontal) {
                var data = origin.data('item');
                if (data) {
                    if (direction > 0) {
                        //sub - items?, open them
                        if (data.subMenuData) {
                            var isOpen = data.subMenuData.css('display') === 'block';
                            if (!isOpen) {
                                return this.open(data.subMenuData);
                            } else {
                                //root bounce
                                if (this.openRoot(origin, null, 1)) {
                                    return;
                                }
                            }
                        } else {
                            //root bounce
                            if (this.openRoot(origin, null, 1)) {
                                return;
                            }
                        }
                    } else {
                        //left
                        this.close(origin);
                        navData = this.toNavigationData(origin, this.owner.getRootContainer());
                        //root bounce
                        if (_.isEmpty(navData.parent.parent().data())) {
                            return this.openRoot(origin, null, -1);
                        }
                        return;
                    }
                }
            }
            if (nextElement && nextData) {
                navData = this.toNavigationData(nextElement, this.owner.getRootContainer());
                this.activate(navData.element, navData.parent, true);
            }
        },
        initContainer: function ($container) {
            var self = this;
            if (!$container.data('didSetup')) {
                $container.data('didSetup', true);
                this.__on($container, 'keydown', null, function (evt) {
                    if (($(evt.target).parent()[0] == $container[0])) {
                        self.keyboardHandler(evt, $container);
                    }
                });
            }
        },
        activate: function ($next, $parent, clear) {
            if ($parent) {
                this.initContainer($parent);
            }
            if (clear && $parent) {
                this.children($parent, true).each(function (i, c) {
                    $(c).removeClass('focus');
                    $(c).removeClass('open');
                    $(c).removeClass('active');
                    var _s = $(c).find('.dropdown-context-sub');
                    if (_s[0] && _s.css('display') === 'block') {
                        _s.css('display', '');
                        _s.removeClass('open');
                        _s.removeClass('active');
                    }
                });
            }
            $next.addClass('focus');
            $next.addClass('active');
            $next.focus();
            $parent.addClass('open');
            $parent.data('currentTarget', $next);
            return true;
        },
        clear: function ($parent) {
            this.children($parent, true).each(function (i, c) {
                $(c).removeClass('focus');
                $(c).removeClass('open');
                $(c).removeClass('active');
                var _s = $(c).find('.dropdown-context-sub');
                if (_s[0] && _s.css('display') === 'block') {
                    _s.css('display', '');
                    _s.removeClass('open');
                }
            });
        }
    });
    return Module;
});