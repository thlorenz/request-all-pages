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

function initGetPages(opts, limit, startPage, cb) {
  var stream = typeof cb !== 'function' ? writeStream() : null;

  function getPages (opts, current, acc) {

    nextPage(opts, function (err, res) {
      if (err) { 
        return stream 
          ? (stream.emit('error', err), stream.emit('end'))
          : cb(err);
      }

      if (stream) { stream.emit('data', JSON.stringify(res)); }
      else        acc.push(res);
      
      var links = parseLinkHeader(res.headers.link);
      if (!links || !links.next)
        return stream ? stream.emit('end') : cb(null, acc); 

      opts.uri = xtendUrl(opts.uri, links.next.url);

      if (current >= parseInt(links.last.page, 10))
        return stream ? stream.emit('end') : cb(null, acc); 

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
