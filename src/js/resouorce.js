'use strict';

var Resource = (function () {

  var _config;
  var _url;

  function Resource(config) {
    _config = config;
    _url = 'https://api.instagram.com/v1/' + _config.endpoint + '/media/recent/';
  }

  Resource.prototype = {

    load: function () {
      if (!_url) {
        return;
      }

      var self = this;
      var deferred = $.Deferred();

      $.ajax({
        type: 'POST',
        url: _url,
        data: {
          access_token: _config.access_token,
          count: _config.count,
        },
        dataType: 'jsonp',
      }).success(function (response) {
        $(self).trigger('loaded', [ response.data ]);
        deferred.resolve(response.data);
        if (!_config.loop) {
          // Used for testing
          _url = response.pagination && response.pagination.next_url ? response.pagination.next_url : false;
        }
      }).error(function () {
        deferred.reject('Error fetching data');
      });

      return deferred.promise();
    },

    on: function (name, callback) {
      $(this).on(name, function (event, data) {
        callback(data);
      });
    },

  };

  return Resource;

})();
