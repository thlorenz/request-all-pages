'use strict';

var qs = require('querystring');

module.exports = function (link) {
  var headers = link.replace(/[<>]/g, '').split(',')
    , parts1 = headers[0].split(';')
    , parts2 = headers[1].split(';')
    ;

  try {
    var qnext = qs.parse(parts1[0])
      , qlast = qs.parse(parts2[0]);
    return { 
        next: { link: parts1[0], page: qnext.page, perPage: qnext['per_page'] }
      , last: { link: parts2[0], page: qlast.page, perPage: qlast['per_page'] }
    };
  } catch (e) {
    return null;
  }
};
