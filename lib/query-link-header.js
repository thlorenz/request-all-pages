'use strict';

var qs = require('querystring');

module.exports = function (link) {
  var parts = link.replace(/[<>]/g, '').split(/[;,]/)
    , next = parts[0]
    , last = parts[2]

  try {
    var qnext = qs.parse(next)
      , qlast = qs.parse(last)
    return { 
        next: { page: qnext.page, perPage: qnext['per_page'] }
      , last: { page: qlast.page, perPage: qlast['per_page'] }
    };
  } catch (e) {
    return null;
  }

};

var link = 
  '<https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=2&per_page=100>; rel="next", ' + 
  '<https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=3&per_page=100>; rel="last"'


