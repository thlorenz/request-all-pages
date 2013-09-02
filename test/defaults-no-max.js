'use strict';
/*jshint asi: true */

var test = require('tape')
  , from = require('from')
  , proxyquire = require('proxyquire')
  , generateLink = require('./support/generate-link')
  , requestOpts = { uri: 'http://some.uri/' }

test('\ngetting 200 items without supplying start page or perPage defaults correctly', function (t) {
  var items = 200
    , perPage = 50 
    , page = 1

  var requestAll = proxyquire('..', {
    hyperquest: function (opts, cb) {
      var res = {
          headers     : { link: generateLink(page + 1, perPage, items) }
        , statusCode  : 200
        , pipe        : function (tgt) { return from(('data for page' + page).split('')).pipe(tgt); }
      }

      t.equal(opts.uri, 'http://some.uri/?per_page=' + perPage + '&page=' + page, 'passes request opts with adapted uri')

      setTimeout(function () { cb(null, res, res.body); page++ }, 5)
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
