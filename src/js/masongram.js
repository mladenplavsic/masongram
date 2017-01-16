(function (window, document, $) {

  window.masongram = $.fn.masongram = function (options) {

    if (!options.access_token) {
      if (/access_token/.test(window.location.search)) {
        options.access_token = window.location.search.replace(/.*access_token=([\w.]+).*/i, '$1');
      } else {
        var message = 'Missing required option "access_token". Read more at https://github.com/mladenplavsic/masongram';
        this.each(function() {
          var self = this;
          $(document).ready(function () {
            $(self).trigger('masongram:error', message).off('masongram:error');
          });
        });
        console.warn(message);
        return this;
      }
    }

    if (/^[\w\d_-]+$/.test(window.location.hash)) {
      options.endpoint = 'tags/' + window.location.hash.substr(1);
    }

    var config = $.extend(true, {
      endpoint: 'users/self',
      count: 10,
      offset: 100,
      columnWidth: 324,
      // use loop for testing purposes
      loop: false,
      title: {
        html: '{caption} {likes} {author} {map}',
        likes: '&#9825; {likes:count}',
        author: '<a href="https://www.instagram.com/{author:username}" target="_blank">{author:full_name}</a>',
        map: '<a href="https://www.google.com/maps?q={map:latitude},{map:longitude}" target="_blank">map</a>'
      }
    }, options );

    return this.each(function() {

      var self = this;

      var $container = $('<div>')
        .attr({
          class: 'masongram-container'
        })
        .appendTo(self);

      $('<div>')
        .attr({
          class: 'masongram-image-sizer'
        })
        .appendTo($container);

      $container.find('.masongram-image-container').fancybox({
        loop: false,
        helpers: {
          overlay: {
            locked: false
          }
        },

        // create HTML caption from object data
        afterLoad: function () {

          var object = $container.find('.masongram-image-container').eq(this.index).data('object');

          this.title = config.title.html;

          if (object.caption) {
            this.title = this.title.replace(/\{caption}/gi, object.caption.text
              .replace(/#([^\s]+)/g, '<a onclick="masongram.filter(\'$1\')">#$1</a>')
              .replace(/@([^\s]+)/g, '<a href="https://www.instagram.com/$1" target="_blank">@$1</a>'));
          }

          this.title = this.title
            .replace(/\{likes}/gi, config.title.likes)
            .replace(/\{likes:count}/gi, object.likes.count);

          this.title = this.title
            .replace(/\{author}/gi, config.title.author)
            .replace(/\{author:username}/gi, object.user.username)
            .replace(/\{author:full_name}/gi, object.user.full_name ? object.user.full_name : object.user.username);

          if (object.location) {
            this.title = this.title
              .replace(/\{map}/gi, config.title.map)
              .replace(/\{map:latitude}/g, object.location.latitude)
              .replace(/\{map:longitude}/g, object.location.longitude);
          }

          // replace empty, trim
          this.title = this.title.replace(/\{[^}]+}/gi, '').trim();

        },

        // check if more images should be added to fancybox
        afterShow: function () {

          $('html, body').animate({
            scrollTop: $container.find('.masongram-image-container').eq(this.index).offset().top
          });

          if (this.index == this.group.length - 1 && this.index != $container.find('.masongram-image-container').length - 1) {
            var next = $container.find('.masongram-image-container').eq(this.index + 1);
            this.group.push({
              href: next.attr('href'),
              type: 'image'
            });
          }

        }
      });

      $container.masonry({
        itemSelector: '.masongram-image-container',
        columnWidth: '.masongram-image-sizer',
        percentPosition: true
      });

      var repository = (function () {

        var pagination = {
          next_url: 'https://api.instagram.com/v1/' + config.endpoint + '/media/recent/'
        };

        var isInProgress = false;

        return {
          append: function () {
            get(function (data, hasNext) {
              if (data) {

                data.forEach(function (object, index) {

                  add(object);

                  // show #end alert on last image loaded
                  if (!config.loop) {
                    $container.on('layoutComplete', function () {
                      if (!hasNext && index === data.length - 1) {
                        $container.imagesLoaded().progress(function () {
                          $(self).trigger('masongram:api:end').off('masongram:api:end');
                        });
                      }
                    });
                  }

                });

              }

            });
          }
        };

        function get(callback) {

          if (isInProgress) {
            return;
          }

          isInProgress = true;

          if (!pagination.next_url) {
            if (config.loop) {
              pagination.next_url = 'https://api.instagram.com/v1/' + config.endpoint + '/media/recent/';
            } else {
              callback();
              return;
            }
          }

          //console.info('Loading ', pagination.next_url);

          $.ajax({
            type: 'POST',
            url: pagination.next_url,
            data: {
              access_token: config.access_token,
              count: config.count
            },
            dataType: 'jsonp',
            success: function (response) {
              pagination = response.pagination;
              callback(response.data, response.pagination && response.pagination.next_url);
            },
            error: function (rejection) {
              console.warn(rejection.statusText)
            },
            complete: function () {
              isInProgress = false;
            }
          });

        }

        function add(object) {

          var $a = $('<a>').attr({
            'href': object.images.standard_resolution.url,
            'rel': 'masongram',
            'target': '_blank',
            'class': 'masongram-image-container'
          });

          $('<img>').attr({
            'src': object.images.low_resolution.url,
            'width': object.images.low_resolution.width,
            'height': object.images.low_resolution.height,
            'class': 'masongram-image'
          }).appendTo($a);

          if (object.caption) {

            var $captionContainer = $('<div>').attr({
              'class': 'masongram-image-caption-container'
            });

            $('<div>').attr({
              'class': 'masongram-image-caption'
            }).html(object.caption.text).appendTo($captionContainer);

            $a.append($captionContainer);
          }

          $a.hide();

          $a.data('object', object);

          $container.append($a);

          $a.imagesLoaded().progress(function () {
            $a.show();
            $container.data('masonry').appended($a);
            $(window).trigger('scroll');
          });

        }

      })();

      repository.append();

      // load images when scrolled close to bottom
      $(window).scroll(function () {
        $container.imagesLoaded().progress(function () {
          if ($(window).scrollTop() + $(window).height() > $(document).height() - config.offset) {
            repository.append();
          }
        });
      });

      // fill window if there is white space left
      $container.on('layoutComplete', function () {
        $container.imagesLoaded().progress(function () {
          if ($('body').height() < $(window).height()) {
            repository.append();
          }
        })
      });

    });
  };

  window.masongram.filter = function (value) {
    window.location.hash = value;
  };

  window.onhashchange = function() {
    $.fancybox.close();
    window.location.reload();
  }

}(window, document, jQuery));
