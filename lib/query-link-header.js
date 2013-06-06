'use strict';

var qs = require('querystring')
  , url = require('url');

var link = 
  'https://joe:schmoe@api.github.com/users/thlorenz/repos?client_id=579929e71dadf664d8b8&client_secret=579929e71dadf664d8b8&per_page=20&page=1; rel="next"'
+ ',https://joe:schmoe@api.github.com/users/thlorenz/repos?client_id=579929e71dadf664d8b8&client_secret=579929e71dadf664d8b8&per_page=20&page=1; rel="last"'

module.exports = function (link) {
  var headers = link.replace(/[<>]/g, '').split(',')
    , parts1 = headers[0].split(';')
    , parts2 = headers[1].split(';')
    ;

  try {
    // TODO: check partsx[1] to find actual 'next' and 'last'
    var parsedNext = url.parse(parts1[0])
      , parsedLast = url.parse(parts2[0])

    var qnext = qs.parse(parts1[0])
      , qlast = qs.parse(parts2[0])
      , nextPage = parseInt(qnext.page, 10)
      , lastPage = parseInt(qlast.page, 10)

    return { 
        next: { link: parts1[0], page: nextPage, perPage: qnext['per_page'] }
      , last: { link: parts2[0], page: lastPage, perPage: qlast['per_page'] }
    };
  } catch (e) {
    return null;
  }
};
