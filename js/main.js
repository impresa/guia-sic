(function () {

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
                        that.set('entries', [])
                    });
            }
        }
    });

    var ShowC = Backbone.Collection.extend({
        model: ShowM,
        getCurrentShowIndex: function () {
            //var now = +new Date(),
            // Hardcode a time
            var now = 1424980800000,
                show = 0;

            for (var i = 0; i < this.models.length; i++) {
                var startTime = this.models[i].get('startDate');

                if (startTime <= now) {
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

    function _doTransition($new, $current, fromClass, toClass, activeClass) {
        $new.setPosition(fromClass, false).render();

        $current.setPosition(toClass);
        $new.setPosition(activeClass);
    }

    function _forceRedraw(element) {
        var $el = $(element);

        try {
            $el[0].offsetWidth = $el[0].offsetWidth;
        } catch (e) {
            // Do nothing. IE8 throws an exception but since it doesn't support animations anyway we just ignore it
        }
    }

    function init() {
        var $content = $('#main-content');

        var idx = 0;

        $.getJSON('data/epg.json').then(function (data) {
            var channel, shows;

            var pager = new SectionHandler($content);

            channel = data['channels'][0];
            shows = new ShowC(channel['schedules'][0]['tvShows']);

            idx = shows.getCurrentShowIndex();

            var show = shows.at(idx);
            show.loadEntries();
            pager.insertRight(show);

            function goRight() {
                if (idx + 1 >= shows.length) {
                    return;
                }

                var show = shows.at(++idx);
                show.loadEntries();

                pager.insertRight(show);
            }

            function goLeft() {
                if (idx - 1 < 0) {
                    return;
                }

                var show = shows.at(--idx);
                show.loadEntries();

                pager.insertLeft(show);
            }

            window.goRight = goRight;
            window.goLeft = goLeft;
        });
    }

    init();
})();
