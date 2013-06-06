'use strict';

var qs = require('querystring')
  , extend = require('util')._extend

module.exports = function (uri, page, perPage) {
  var parts       =  uri.split('?')
    , route       =  parts[0]
    , existingQry =  parts[1]
    , qry         =  qs.parse(existingQry);
  
  return route + '?' + qs.stringify(extend(qry, { page: page, 'per_page': perPage }))
}
