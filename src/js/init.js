'use strict';

window.masongram = $.fn.masongram = function (options) {
  return this.each(function () {
    new Masongram(this, options);
  });
};
