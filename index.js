'use strict';

var request          =  require('request')
  , xtendUrl         =  require('extend-url')
  , Stream           =  require('stream')
  , parseLinkHeader  =  require('parse-link-header')
  , withPagingParams =  require('./lib/with-paging-params')
  ;

function writeStream() {
  var s = new Stream();
  s.readable = true;
  return s;
}

function nextPage(opts, cb) {
  request(opts, function (err, res, body) {
    if (err) return cb(err);  
    if (/^[45]\d\d/.test(res.statusCode)) return cb(body);
    cb(null, { headers: res.headers, statusCode: res.statusCode, body: body });
  });
}

function getPage(which, links) {
  if (!links || !links[which] || !links[which].page) return null;

  var n = parseInt(links[which].page, 10);
  return isNaN(n) ? null: n;
}
var getLastPage = getPage.bind(0, 'last');
var getNextPage = getPage.bind(0, 'next');

function initGetPages(opts, limit, startPage, cb) {
  var stream = typeof cb !== 'function' ? writeStream() : null;

  function data (acc, res) {
    if (stream) stream.emit('data', JSON.stringify(res));
    else        acc.push(res);
  }

  function end (acc, res) {
    data(acc, res);
    return stream ? stream.emit('end') : cb(null, acc);
  }

  function getPages (opts, current, acc) {

    nextPage(opts, function (err, res) {
      var links, lastPageNum, nextPageNum;

      if (err) { 
        return stream 
          ? (stream.emit('error', err), stream.emit('end'))
          : cb(err);
      }

      links = parseLinkHeader(res.headers.link);
      lastPageNum = getLastPage(links);
      nextPageNum = getNextPage(links);

      // abort immediately if number of total pages exceeds the pages we allow and abort was requested
      if ( limit 
        && limit.abort 
        && lastPageNum 
        && limit.maxPages < lastPageNum) {
          res.body = [];
          res.aborted = true;
          return end(acc, res);
      }

      // end if either page info is missing or we reached the last page
      if ( !nextPage
        || !lastPageNum 
        || current >= lastPageNum) { 
          return end(acc, res);
      }

      // if we reached the max desired pages (in case immediate abort wasn't desired) end now
      if ( limit 
        && limit.maxPages <= current) { 
          res.aborted = true;
          return end(acc, res); 
      }

      data(acc, res);
         
      opts.uri = xtendUrl(opts.uri, links.next.url);

      process.nextTick(getPages.bind(null, opts, links.next.page, acc));
    });

    return stream;
  }

  return getPages(opts, startPage, []);
}

module.exports = function (requestOpts, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  var startPage =  opts.startPage ===  void 0 ? 1 : opts.startPage
    , perPage   =  opts.perPage   ===  void 0 ? 50 : opts.perPage
    , limit     =  opts.limit;     

  requestOpts.uri = withPagingParams(requestOpts.uri, startPage, perPage);
  return initGetPages(requestOpts, limit, startPage, cb)
};
