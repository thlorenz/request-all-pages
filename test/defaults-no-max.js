'use strict';
/*jshint asi: true */

var test = require('tap').test
  , proxyquire = require('proxyquire')
  , generateLink = require('./support/generate-link')
  , requestOpts = { uri: 'http://some.uri/' }

test('\ngetting 200 items without supplying start page or perPage defaults correctly', function (t) {
  var items = 200
    , perPage = 50 
    , page = 1

  var requestAll = proxyquire('..', {
    request: function (opts, cb) {
      var res = {
          headers     : { link: generateLink(page + 1, perPage, items) }
        , statusCode  : 200
        , body        : 'data for page' + page
      }

      t.equal(opts.uri, 'http://some.uri/?per_page=' + perPage + '&page=' + page, 'passes request opts with adapted uri')

      page++;
      setTimeout(cb.bind(0, null, res, res.body), 5)
    }
  })
  requestAll(requestOpts, function (err, res) {
    var data = res.map(function (r) { return r.body })
    
    t.deepEqual(
        data
      , [ 'data for page1',
          'data for page2',
          'data for page3',
          'data for page4' ]
      , 'gets all data defaulting to perPage: 50 and starting on page 1'
    )
    t.end()
  })
})
