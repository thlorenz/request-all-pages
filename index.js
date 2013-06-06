'use strict';

var request          =  require('request')
  , xtendUrl         =  require('extend-url')
  , through          =  require('through')
  , queryLinkHeader  =  require('./lib/query-link-header')
  , withPagingParams =  require('./lib/with-paging-params')
  ;

function nextPage(opts, cb) {
  request(opts, function (err, res, body) {
    if (err) return cb(err);  
    if (/^[45]\d\d/.test(res.statusCode)) return cb(body);
    cb(null, { headers: res.headers, body: body });
  });
}

function getPages (opts, current, acc, cb) {
  nextPage(opts, function (err, res) {
    if (err) return cb(err);
    
    var links = queryLinkHeader(res.headers.link);

    opts.uri = xtendUrl(opts.uri, links.next.link);
    acc.push(res);

    if (current >= links.last.page) return cb(null, acc); 

    process.nextTick(getPages.bind(null, opts, links.next.page, acc, cb));
  });
}

module.exports = function (opts, startPage, perPage, cb) {
  opts.uri = withPagingParams(opts.uri, startPage, perPage);
  return getPages(opts, startPage, [], cb)
};
