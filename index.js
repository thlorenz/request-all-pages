'use strict';

var hyperquest       =  require('hyperquest')
  , xtendUrl         =  require('extend-url')
  , through          =  require('through')
  , Stream           =  require('stream')
  , parseLinkHeader  =  require('parse-link-header')
  , withPagingParams =  require('./lib/with-paging-params')
  ;

var setImmediate = setImmediate || function (fn) { setTimeout(fn, 0) };

function writeStream() {
  var s = new Stream();
  s.readable = true;
  return s;
}

function nextPage(opts, cb) {
  
  function onresponse (err, res) {
    if (err) return cb(err);  
    var body = '';

    res.pipe(through(write, end));

    function write (d) { body += d }

    function end () {
      if (/^[45]\d\d/.test(res.statusCode)) return cb(body);

      if (opts.json) {
        try {
          body = JSON.parse(body);
        } catch (e) {
          return cb(e);
        }
      }

      cb(null, { headers: res.headers, statusCode: res.statusCode, body: body });
    }
  }

  hyperquest(opts, onresponse);
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
    if (stream) stream.emit('end'); 
    else        cb(null, acc);
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

      function getRemainingPages () { getPages(opts, links.next.page, acc); }
      setImmediate(getRemainingPages);
    });

    return stream;
  }

  return getPages(opts, startPage, []);
}

var go = module.exports = function (requestOpts, opts, cb) {
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
