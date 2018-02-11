'use strict';

var Tile = (function () {

  var
    _$object,
    _data,
    _config,
    _NO_DATA = 'NO_DATA';

  function Tile(data, config) {
    _data = data;
    _config = config;
    this.parseLocation();
    this.create();
  }

  Tile.prototype = {

    create: function () {
      _$object = $('<div>').attr({
        tabindex: 0,
        class: 'masongram-image-container masongram-image-size-' + _config.size,
      });

      var $img = $('<img>').attr({
        src: _data.images[ _config.size ].url,
        width: _data.images[ _config.size ].width,
        height: _data.images[ _config.size ].height,
        class: 'masongram-image',
      });

      $img.appendTo(_$object);

      var $captionContainer = $('<div>', {
        class: 'masongram-image-caption-container',
      });

      var $caption = $('<div>', {
        class: 'masongram-image-caption',
      });

      if (_data.caption && _data.caption.text) {
        $caption.html(this.parseCaption());
      }

      $caption.appendTo($captionContainer);
      $captionContainer.appendTo(_$object);
    },

    getObject: function () {
      return _$object;
    },

    parseLocation: function () {
      // Strip location if explicitly not allowed
      if (_config.location.indexOf('inherit') === -1) {
        delete _data.location;
      }
      // get location from caption content, for example "@12.34,56.78"
      if (_config.location.indexOf('caption') !== -1 && _data.caption && _data.caption.text && /@[\d]+\.[\d]+,[\d]+\.[\d]+/.test(_data.caption.text)) {
        var location = _data.caption.text.match(/@([\d]+\.[\d]+),([\d]+\.[\d]+)/);
        _data.caption.text = _data.caption.text.replace(/\s*@([\d]+\.[\d]+),([\d]+\.[\d]+)/, '');
        _data.location = {
          latitude: location[ 1 ],
          longitude: location[ 2 ],
        };
      }
    },

    parseCaption: function () {
      var html = _config.caption;

      if (/{.*}/.test(html)) {
        var matches = html.match(/{([^}]+)}/g);
        matches.forEach(function (match) {
          switch (match) {
            case '{location}':
              html = html.replace(match, _data.location && _data.location.latitude !== undefined && _data.location.longitude !== undefined ? (_data.location.latitude + ',' + _data.location.longitude) : _NO_DATA);
              break;
            case '{latitude}':
              html = html.replace(match, _data.location && _data.location.latitude !== undefined ? _data.location.latitude : _NO_DATA);
              break;
            case '{longitude}':
              html = html.replace(match, _data.location && _data.location.longitude !== undefined ? _data.location.longitude : _NO_DATA);
              break;
            case '{caption}':
              html = html.replace(match, _data.caption && _data.caption.text !== undefined ? _data.caption.text : _NO_DATA);
              break;
            case '{likes}':
              html = html.replace(match, _data.likes && _data.likes.count !== undefined ? _data.likes.count : _NO_DATA);
              break;
            case '{link}':
              html = html.replace(match, _data.link ? _data.link : _NO_DATA);
              break;
          }
        });
      }

      return html;
    },

  };

  return Tile;

})();
