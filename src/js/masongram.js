'use strict';

var Masongram = (function () {

    var _dependencies = [
        'jQuery',
        'Masonry',
    ];

    var _error = false;
    var _config;
    var _$container;
    var _resource;
    var _inProgress;

    function Masongram($element, options) {
        var self = this;

        _dependencies.forEach(function (name) {
            self.require(name);
        });

        if (_error) {
            return;
        }

        this.configure(options);
        this.setup($element);
    }

    Masongram.prototype = {

        require: function (name) {
            var result = window[name] !== undefined;
            if (!result) {
                _error = true;
                console.error('Dependency unavailable: ' + name);
            }
            return result;
        },

        configure: function (options) {
            _config = $.extend(true, {
                endpoint: 'users/self',
                loop: false,
                count: 10,
                offset: 10,
                size: 'low_resolution',
                caption: '{caption}',
                location: 'inherit&caption',
            }, options);
        },

        setup: function ($element) {
            var self = this;
            _$container = $('<div>')
                .attr({
                    class: 'masongram-container',
                })
                .appendTo($element);

            $('<div>')
                .attr({
                    class: 'masongram-image-sizer masongram-image-size-' + _config.size,
                })
                .appendTo(_$container);

            _$container.masonry({
                itemSelector: '.masongram-image-container',
                columnWidth: '.masongram-image-sizer',
                percentPosition: true,
            });

            _resource = new Resource(_config);

            _resource.on('loaded', function (items) {
                self.append(items);
            });

            // load images when scrolled close to bottom
            var scrollTimeout;// throttle
            $(window).scroll(function () {
                if (!scrollTimeout) {
                    scrollTimeout = setTimeout(function () {
                        _$container.imagesLoaded().progress(function () {
                            if ($(window).scrollTop() > $(document).height() - ($(window).height() * (1 + _config.offset / 100))) {
                                self.load();
                            }
                        });
                        scrollTimeout = null;
                    }, 100);
                }
            });

            // fill window if there is white space left
            _$container.on('layoutComplete', function () {
                _$container.imagesLoaded().progress(function () {
                    if ($('body').height() < $(window).height()) {
                        self.load();
                    }
                });
            });

            self.load();
        },

        load: function () {
            if (_inProgress) {
                return;
            }
            _inProgress = true;
            _resource.load();
        },

        append: function (items) {
            items.forEach(function (item, index) {
                var tile = new Tile(item, {
                    caption: _config.caption,
                    size: _config.size,
                    location: _config.location
                });
                var $object = tile.getObject();
                setTimeout(function () {
                    $object.imagesLoaded().progress(function () {
                        _$container.append($object).masonry('appended', $object);
                        if (index + 1 === items.length) {
                            _inProgress = false;
                            $(window).trigger('scroll');
                        }
                    });
                }, index * 200);
            });
        },
    };

    return Masongram;

})();
