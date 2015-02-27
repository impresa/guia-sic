// TODO LN: AMD and other details
window.PagerWidget = window.PagerWidget || (function ($, Promise) {
    var DEFAULTS = {
        from: 'right',
        to: 'left'
    };

    var PagerWidget = function PagerWidget($container, options) {
        this._$container = $($container);

        this._contentContainers = [];


    };

    PagerWidget.prototype.show = function (data, onProgress) {

    };


    var DEFAULT_ANIMATION_DURATION = 300,
        TRANSITIONS = ['left', 'right', 'top', 'bottom', 'fade'];

    var events = {
        transition: {
            end: 'transitionend webkitTransitionEnd MozTransitionEnd oTransitionEnd'
        }
    };

    PagerWidget.prototype._doTransition = function _doTransition(data, onProgress) {
        if (!data.content) {
            var err = new Error('emptyContainer');
            err.type = err.message;
            throw err;
        }

        var that = this,
            opts = $.extend({}, DEFAULTS, data),
            newContainer = this._contentContainers[1],
            oldContainer = this._contentContainers[0];

        // Setup the animation
        newContainer.show(opts);

        var middleRan = false;

        var middle = function middle() {
            middleRan = true;

            if (onProgress) {
                onProgress();
            }
        };

        return new Promise(function (resolve, reject) {
            var after = function after() {
                if (!middleRan) {
                    middle();
                }

                oldContainer.hide();

                // Update variables
                that._contentContainers.reverse();
                that._currentContainer = newContainer;

                resolve();
            };

            // Trigger the animation
            _transition(oldContainer.$el, newContainer.$el, {
                activeClass: 'current',
                endClass: opts.to,
                progress: middle
            }).then(after, reject);
        });
    };

    function _transition(from, to, opts) {
        var data = {
                from: from,
                to: to
            };

        opts = $.extend({
            transitions: TRANSITIONS,
            time: DEFAULT_ANIMATION_DURATION,
            activeClass: 'active',
            endClass: ''
        }, opts || {});

        from = $(from);
        to = $(to);

        return new Promise(function (resolve, reject) {
            _addAnimationListeners(data, {
                resolve: resolve,
                reject: reject,
                notify: opts && opts['onProgress']
            });

            from.removeClass(opts.activeClass).addClass(opts.endClass);
            to.addClass(opts.activeClass);

            from.css({
                'left': '',
                'transform': ''
            });

            _forceRedraw(to[0]);

            to.removeClass(opts.transitions.join(' '));
        });
    }

    function _addAnimationListeners(data, cbs) {
        var timer,
            $from = $(data.from),
            $to = $(data.to);

        var end = function end(e) {
            clearAnimationListeners();
            clearTimeout(timer);

            cbs.resolve(data);
        };

        var middle = function middle(e) {
            if (cbs.notify) {
                cbs.notify(data);
            }
        };

        $to.one(events.transition.end, end);
        $from.one(events.transition.end, middle);

        function clearAnimationListeners() {
            $to.off(events.transition.end, end);
            $from.off(events.transition.end, middle);
        }

        // Timeouts
        timer = setTimeout(
            end,
            // 2x Animation duration + 20%
            DEFAULT_ANIMATION_DURATION * 2 * 1.2
        );
    }

    function _forceRedraw(element) {
        var $el = $(element);

        try {
            $el[0].offsetWidth = $el[0].offsetWidth;
        } catch (e) {
            // Do nothing. IE8 throws an exception but since it doesn't support animations anyway we just ignore it
        }
    }

    return PagerWidget;
})($, Promise);