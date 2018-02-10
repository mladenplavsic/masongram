"use strict";

window.masongram = $.fn.masongram = function(options) {
    return this.each(function() {
        new Masongram(this, options);
    });
};

"use strict";

var Masongram = function() {
    var _dependencies = [ "jQuery", "Masonry" ];
    var _error = false;
    var _config;
    var _$container;
    var _resource;
    var _inProgress;
    function Masongram($element, options) {
        var self = this;
        _dependencies.forEach(function(name) {
            self.require(name);
        });
        if (_error) {
            return;
        }
        this.configure(options);
        this.setup($element);
    }
    Masongram.prototype = {
        require: function(name) {
            var result = window[name] !== undefined;
            if (!result) {
                _error = true;
                console.error("Dependency unavailable: " + name);
            }
            return result;
        },
        configure: function(options) {
            _config = $.extend(true, {
                endpoint: "users/self",
                loop: false,
                count: 10,
                offset: 10,
                size: "low_resolution",
                caption: "{caption}"
            }, options);
        },
        setup: function($element) {
            var self = this;
            _$container = $("<div>").attr({
                class: "masongram-container"
            }).appendTo($element);
            $("<div>").attr({
                class: "masongram-image-sizer masongram-image-size-" + _config.size
            }).appendTo(_$container);
            _$container.masonry({
                itemSelector: ".masongram-image-container",
                columnWidth: ".masongram-image-sizer",
                percentPosition: true
            });
            _resource = new Resource(_config);
            _resource.on("loaded", function(items) {
                self.append(items);
            });
            var scrollTimeout;
            $(window).scroll(function() {
                if (!scrollTimeout) {
                    scrollTimeout = setTimeout(function() {
                        _$container.imagesLoaded().progress(function() {
                            if ($(window).scrollTop() + $(window).height() > $(document).height() * (1 - _config.offset / 100)) {
                                self.load();
                            }
                        });
                        scrollTimeout = null;
                    }, 100);
                }
            });
            _$container.on("layoutComplete", function() {
                _$container.imagesLoaded().progress(function() {
                    if ($("body").height() < $(window).height()) {
                        self.load();
                    }
                });
            });
            self.load();
        },
        load: function() {
            if (_inProgress) {
                return;
            }
            _inProgress = true;
            _resource.load();
        },
        append: function(items) {
            items.forEach(function(item, index) {
                var tile = new Tile(item, {
                    caption: _config.caption,
                    size: _config.size
                });
                var $object = tile.getObject();
                setTimeout(function() {
                    $object.imagesLoaded().progress(function() {
                        _$container.append($object).masonry("appended", $object);
                        if (index + 1 === items.length) {
                            _inProgress = false;
                            $(window).trigger("scroll");
                        }
                    });
                }, index * 200);
            });
        }
    };
    return Masongram;
}();

"use strict";

var Resource = function() {
    var _config;
    var _url;
    function Resource(config) {
        _config = config;
        _url = "https://api.instagram.com/v1/" + _config.endpoint + "/media/recent/";
    }
    Resource.prototype = {
        load: function() {
            if (!_url) {
                return;
            }
            var self = this;
            var deferred = $.Deferred();
            $.ajax({
                type: "POST",
                url: _url,
                data: {
                    access_token: _config.access_token,
                    count: _config.count
                },
                dataType: "jsonp"
            }).success(function(response) {
                $(self).trigger("loaded", [ response.data ]);
                deferred.resolve(response.data);
                if (!_config.loop) {
                    _url = response.pagination && response.pagination.next_url ? response.pagination.next_url : false;
                }
            }).error(function() {
                deferred.reject("Error fetching data");
            });
            return deferred.promise();
        },
        on: function(name, callback) {
            $(this).on(name, function(event, data) {
                callback(data);
            });
        }
    };
    return Resource;
}();

"use strict";

var Tile = function() {
    var _$object, _data, _config, _NO_DATA = "NO_DATA";
    function Tile(data, config) {
        _data = data;
        _config = config;
        this.parseLocation();
        this.create();
    }
    Tile.prototype = {
        create: function() {
            _$object = $("<a>").attr({
                class: "masongram-image-container masongram-image-size-" + _config.size
            });
            var $img = $("<img>").attr({
                src: _data.images[_config.size].url,
                width: _data.images[_config.size].width,
                height: _data.images[_config.size].height,
                class: "masongram-image"
            });
            $img.appendTo(_$object);
            var $captionContainer = $("<div>", {
                class: "masongram-image-caption-container"
            });
            var $caption = $("<div>", {
                class: "masongram-image-caption"
            });
            if (_data.caption && _data.caption.text) {
                $caption.html(this.parseCaption());
            }
            $caption.appendTo($captionContainer);
            $captionContainer.appendTo(_$object);
        },
        getObject: function() {
            return _$object;
        },
        parseLocation: function() {
            if (_data.caption && _data.caption.text && /@[\d]+\.[\d]+,[\d]+\.[\d]+/.test(_data.caption.text)) {
                var location = _data.caption.text.match(/@([\d]+\.[\d]+),([\d]+\.[\d]+)/);
                _data.caption.text = _data.caption.text.replace(/\s*@([\d]+\.[\d]+),([\d]+\.[\d]+)/, "");
                _data.location = {
                    latitude: location[1],
                    longitude: location[2]
                };
            }
        },
        parseCaption: function() {
            var html = _config.caption;
            if (/{.*}/.test(html)) {
                var matches = html.match(/{([^}]+)}/g);
                matches.forEach(function(match) {
                    switch (match) {
                      case "{location}":
                        html = html.replace(match, _data.location && _data.location.latitude !== undefined && _data.location.longitude !== undefined ? _data.location.latitude + "," + _data.location.longitude : _NO_DATA);
                        break;

                      case "{latitude}":
                        html = html.replace(match, _data.location && _data.location.latitude !== undefined ? _data.location.latitude : _NO_DATA);
                        break;

                      case "{longitude}":
                        html = html.replace(match, _data.location && _data.location.longitude !== undefined ? _data.location.longitude : _NO_DATA);
                        break;

                      case "{caption}":
                        html = html.replace(match, _data.caption && _data.caption.text !== undefined ? _data.caption.text : _NO_DATA);
                        break;

                      case "{likes}":
                        html = html.replace(match, _data.likes && _data.likes.count !== undefined ? _data.likes.count : _NO_DATA);
                        break;

                      case "{link}":
                        html = html.replace(match, _data.link ? _data.link : _NO_DATA);
                        break;
                    }
                });
            }
            return html;
        }
    };
    return Tile;
}();