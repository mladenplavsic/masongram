(function (window, document, $) {

  window.masongram = $.fn.masongram = function (options) {

    if (!options.access_token) {
      if (/access_token/.test(window.location.search)) {
        options.access_token = window.location.search.replace(/.*access_token=([\w.]+).*/i, '$1');
      } else {
        console.warn('Missing required option "access_token". Read more at https://github.com/mladenplavsic/masongram');
        return this;
      }
    }

    if (window.location.hash) {
      options.endpoint = 'tags/' + window.location.hash.substr(1);
    }

    var config = $.extend(true, {
      endpoint: 'users/self',
      count: 10,
      offset: 100,
      columnWidth: 324,
      // use loop for testing purposes
      loop: false,
      map: 'https://www.google.com/maps?q={latitude},{longitude}',
      title: '{caption} {map} {author} {likes}'
    }, options );

    return this.each(function() {

      var self = this;

      var container = document.createElement('div');
      var $container = $(container);
      $container.append('<div class="masongram-image-sizer">');
      $container.addClass('masongram-container');
      $container.appendTo(self);

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
          this.title = config.title;
          this.title = this.title.replace(/\{caption}/gi, object.caption.text
              .replace(/#([^\s]+)/g, '<a onclick="masongram.filter(\'$1\')">#$1</a>')
              .replace(/@([^\s]+)/g, '<a href="https://www.instagram.com/$1" target="_blank">@$1</a>'));
          this.title = this.title.replace(/\{map}/gi, object.location ? '<a href="' + config.map.replace(/\{latitude}/g, object.location.latitude).replace(/\{longitude}/g, object.location.longitude) + '" target="_blank">map</a>' : '');
          this.title = this.title.replace(/\{likes}/gi, object.user_has_liked ? '&#9829;' : '&#9825;' + ' ' + object.likes.count);
          this.title = this.title.replace(/\{author}/gi, '<a href="https://www.instagram.com/' + object.user.username + '" target="_blank" title="' + object.user.full_name + '">@' + object.user.username + '</a>');
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

          var img = document.createElement('img');
          img.setAttribute('src', object.images.low_resolution.url);
          img.setAttribute('width', object.images.low_resolution.width);
          img.setAttribute('height', object.images.low_resolution.height);
          img.setAttribute('class', 'masongram-image');

          var caption = document.createElement('div');
          caption.setAttribute('class', 'masongram-image-caption');
          caption.innerHTML = object.caption.text;

          var captionContainer = document.createElement('div');
          captionContainer.setAttribute('class', 'masongram-image-caption-container');
          captionContainer.appendChild(caption);

          var a = document.createElement('a');
          a.setAttribute('href', object.images.standard_resolution.url);
          a.setAttribute('rel', 'masongram');
          a.setAttribute('target', '_blank');
          a.setAttribute('class', 'masongram-image-container');

          a.appendChild(img);
          a.appendChild(captionContainer);
          var $a = $(a);
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
