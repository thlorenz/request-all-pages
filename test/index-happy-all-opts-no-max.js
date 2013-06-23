'use strict';
/*jshint asi: true */

var test = require('tap').test
  , proxyquire = require('proxyquire')
  , requestOpts = { uri: 'http://some.uri/' }

function generateLink(page, perPage, items) {
  return  '<http://some.uri/?page=' + page  + '&per_page=' + perPage +'>; rel="next", ' + 
          '<http://some.uri/?page=' + (items/perPage) + '&per_page=' + perPage +'>; rel="last"';
}

test('\ngetting 200 items starting at page 1 with page size 20 callback interface', function (t) {
  var items = 200
    , perPage = 20
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
      cb(null, res, res.body)
    }
  })

  requestAll(requestOpts, { startPage: page, perPage: perPage }, function (err, res) {
    var data = res.map(function (r) { return r.body })

    t.deepEqual(
        data
      , [ 'data for page1',
          'data for page2',
          'data for page3',
          'data for page4',
          'data for page5',
          'data for page6',
          'data for page7',
          'data for page8',
          'data for page9',
          'data for page10' ]
      , 'returns array containing correct data'
    )
    t.end()
  });
})

test('\ngetting 200 items starting at page 1 with page size 20 streaming interface', function (t) {
  var items = 200
    , perPage = 20
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
      cb(null, res, res.body)
    }
  })

  var responses = []
  requestAll(requestOpts, { startPage: page, perPage: perPage })
    .on('error', t.fail.bind(t, 'should have no error'))
    .on('data', [].push.bind(responses))
    .on('end', function () {
      var data = responses.map(function (r) { return JSON.parse(r).body })

      t.deepEqual(
          data
        , [ 'data for page1',
            'data for page2',
            'data for page3',
            'data for page4',
            'data for page5',
            'data for page6',
            'data for page7',
            'data for page8',
            'data for page9',
            'data for page10' ]
        , 'emits stringified response containing correct data for each page'
      )
      t.end()
  })
})
