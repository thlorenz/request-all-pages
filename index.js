'use strict';

var request          =  require('request')
  , xtendUrl         =  require('extend-url')
  , Stream           =  require('stream')
  , queryLinkHeader  =  require('./lib/query-link-header')
  , withPagingParams =  require('./lib/with-paging-params')
  ;

function writeStream() {
  var s = new Stream();
  s.writable = true;
  return s;
}

function nextPage(opts, cb) {
  request(opts, function (err, res, body) {
    if (err) return cb(err);  
    if (/^[45]\d\d/.test(res.statusCode)) return cb(body);
    cb(null, { headers: res.headers, body: body });
  });
}

function getPages (opts, current, acc, cb) {
  var stream;

  if (typeof cb !== 'function') { 
    // cb will be the stream when this function is called recursively
    stream = cb instanceof Stream ? cb : writeStream();  
  }

  nextPage(opts, function (err, res) {
    if (err) { 
      return stream 
        ? (stream.emit('error', err), stream.end())
        : cb(err);
    }
    if (stream) stream.emit('data', res); 
    else        acc.push(res);
    
    var links = queryLinkHeader(res.headers.link);
    if (!links)
      return stream ? stream.end() : cb(null, acc); 

    opts.uri = xtendUrl(opts.uri, links.next.link);

    if (current >= links.last.page)
      return stream ? stream.end() : cb(null, acc); 

    process.nextTick(getPages.bind(null, opts, links.next.page, acc, stream || cb));
  });

  return stream;
}

module.exports = function (opts, startPage, perPage, cb) {
  opts.uri = withPagingParams(opts.uri, startPage, perPage);
  return getPages(opts, startPage, [], cb)
};
