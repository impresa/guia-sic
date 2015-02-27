(function () {

    // TODO LN: use current time instead. This is just for demo purposes
    var NOW = 1424955600000 - (300 * 1000);

    var env = new nunjucks.Environment();

    env.addFilter('dateformat', function (date, formatStr) {
        return moment(date).format(formatStr);
    });

    // Models
    var ShowM = Backbone.Model.extend({
        loadEntries: function () {
            var that = this;

            if (!this.get('entries')) {
                $.getJSON('data/' + this.get('startDate') + '.json')
                    .then(function (data) {
                        that.set('entries', data);
                    }, function () {
                        that.set('entries', []);
                    });
            }
        }
    });

    var ShowC = Backbone.Collection.extend({
        model: ShowM,
        getCurrentShowIndex: function () {
            // TODO LN: don't hardcode the time
            //var now = +new Date(),
            //    show = 0;
            var show = 0;

            for (var i = 0; i < this.models.length; i++) {
                var startTime = this.models[i].get('startDate');

                if (startTime <= NOW) {
                    show = i;
                } else {
                    return show;
                }
            }

            return show;
        }
    });

    // Views
    var SICV = Backbone.View.extend({
        initialize: function () {
            this.listenTo(this.collection || this.model, 'reset change add', this.render);
        },
        clear: function () {
            return this.$el.empty();
        },
        render: function () {
            this.clear().append(
                this.template(
                    (this.collection || this.model) && (this.collection || this.model).toJSON()
                )
            );

            return this;
        },
        template: function (data) {
            return env.render(this.constructor.TEMPLATE_NAME, {
                it: data
            });
        }
    }, {
        TEMPLATE_NAME: undefined
    });

    var SectionV = SICV.extend({
        tagName: 'section',
        className: function () {
            return 'entry ' + this.position;
        },
        position: 'left',
        initialize: function (options) {
            this.position = options && options.position || this.position;
        },
        setModel: function (model) {
            if (this.model) {
                this.stopListening(this.model, 'reset change add', this.render);
            }

            this.model = model;
            this.listenTo(this.model, 'reset change add', this.render);

            this.render();
        },
        render: function() {
            SICV.prototype.render.apply(this, arguments);

            this.updateTime();

            return this;
        },
        setPosition: function (position, transition) {
            transition = transition === undefined;

            this.position = position;

            var className = this.className();

            if (!transition) {
                className += ' no-transition';
            }

            this.$el.attr('class', className);

            if (!transition) {
                _forceRedraw(this.$el);
                this.$el.removeClass('no-transition');
            }

            return this;
        },
        show: function () {
            this.$el.show();
            return this;
        },
        hide: function () {
            this.$el.hide();
            return this;
        },
        empty: function () {
            this.$el.empty();
            return this;
        },
        updateTime: function() {
            if (!this.model) {
                return this;
            }

            this._width = 0;

            var start = this.model.get('startDate'),
                duration = this.model.get('duration');

            if (NOW > start + duration) {
                // Finished
                this._width = 100;
            } else if (NOW < start) {
                // Not airing yet
                this._width = 0;
            } else {
                this._width = ((NOW - start) / duration * 100);
            }

            this.$('.progress-bar').css('width', this._width + '%');
        }
    }, {
        TEMPLATE_NAME: 'section'
    });

    var SectionHandler = function SectionHandler($el, opts) {
        opts = opts || {};

        $el = $($el).empty();

        this._$containers = [];

        // TODO LN: generify
        for (var i = 0; i < 2; i++) {
            this._$containers.push(new SectionV());
            $el.append(this._$containers[i].$el);
        }
    };

    SectionHandler.prototype.set = function set(idx, model) {
        this._$containers[idx].setModel(model);
    };

    SectionHandler.prototype.insertRight = function insertRight(model) {
        this._$containers[1].setModel(model);
        _doTransition(this._$containers[1], this._$containers[0], 'right', 'left', 'current');

        this._$containers.unshift(this._$containers.pop());
    };

    SectionHandler.prototype.insertLeft = function insertLeft(model) {
        this._$containers[1].setModel(model);

        _doTransition(this._$containers[1], this._$containers[0], 'left', 'right', 'current');

        this._$containers = this._$containers.concat(this._$containers.shift());
    };

    SectionHandler.prototype.getCurrent = function getCurrent() {
        return this._$containers.filter(function(item) {
            return item.position === 'current';
        }).shift();
    };

    var clearTimer;

    function _doTransition($new, $current, fromClass, toClass, activeClass) {
        $new.setPosition(fromClass, false).render();

        $new.$el.css('top', $(document).scrollTop());

        $current.setPosition(toClass);
        $new.setPosition(activeClass);

        // TODO LN: event instead of timer
        setTimeout(function($new) {
            $(document).scrollTop(0);
            $new.$el.css('top', '');
        }, 300, $new);

        clearTimeout(clearTimer);
        clearTimer = setTimeout(function($current) {
            $current.empty();
        }, 500, $current);
    }

    function _forceRedraw(element) {
        var $el = $(element);

        try {
            $el[0].offsetWidth = $el[0].offsetWidth;
        } catch (e) {
            // Do nothing. IE8 throws an exception but since it doesn't support animations anyway we just ignore it
        }
    }

    // App logic
    function init() {
        var $content = $('#main-content');

        var idx = 0,
            realTimeIdx = 0,
            lock = false;

        $.getJSON('data/epg.json').then(function (data) {
            var pager, channel, shows, show;

            // TODO LN: suspend the timer when the user is interacting with the page (scroll, taps, etc)
            $(document).on('scroll', function() {
                lock = true;
            });

            function setCurrent() {
                $('.js-now').hide();
                lock = false;
            }

            function unsetCurrent() {
                $('.js-now').show();
                lock = true;
            }

            function goRight() {
                if (idx + 1 >= shows.length) {
                    return;
                }

                var show = shows.at(++idx);
                show.loadEntries();

                pager.insertRight(show);

                if (idx === realTimeIdx) {
                    setCurrent();
                } else {
                    unsetCurrent();
                }
            }

            function goLeft() {
                if (idx - 1 < 0) {
                    return;
                }

                var show = shows.at(--idx);
                show.loadEntries();

                pager.insertLeft(show);

                if (idx === realTimeIdx) {
                    setCurrent();
                } else {
                    unsetCurrent();
                }
            }

            pager = new SectionHandler($content);

            channel = data['channels'][0];
            shows = new ShowC(channel['schedules'][0]['tvShows']);

            console.log(shows.length);

            realTimeIdx = idx = shows.getCurrentShowIndex();

            show = shows.at(idx);
            show.loadEntries();
            pager.insertRight(show);

            setCurrent();

            var c = 10;

            setInterval(function updateRealTime() {
                // increment the fake time
                //NOW += 1000;
                var MULTIPLIER = 30;
                NOW += 500 * MULTIPLIER;

                realTimeIdx = shows.getCurrentShowIndex();

                if (idx !== realTimeIdx && !lock) {
                    goRight();
                } else {
                    var page = pager.getCurrent();
                    page.updateTime();
                }

                if (c % 10 === 0) {
                    console.log("The time is now %s", moment(NOW).format("HH:mm:ss"));
                }

                c++;
            }, 500);

            $('#prev').click(goLeft);
            $('#next').click(goRight);

            $(document.body).on('click', '.js-now', function() {
                var newIdx = shows.getCurrentShowIndex();

                var show = shows.at(newIdx);
                show.loadEntries();

                if (newIdx > idx) {
                    pager.insertRight(show);
                } else {
                    pager.insertLeft(show);
                }

                idx = newIdx;

                setCurrent();
            });
        });
    }

    init();
})();
