'use strict';
/*jshint asi: true */

var test = require('tape')
  , proxyquire = require('proxyquire')
  , generateLink = require('./support/generate-link')
  , requestOpts = { uri: 'http://some.uri/' }

test('\ngetting 200 items maxPages: 4, actual pages: 4', function (t) {
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

      page++;
      setTimeout(cb.bind(0, null, res, res.body), 5)
    }
  })
  requestAll(
      requestOpts
    , { startPage :  page
      , perPage   :  perPage
      , limit     :  { maxPages :  4, abort :  true }
      }
    , function (err, res) {
    var data = res.map(function (r) { return r.body })
    
    t.deepEqual(
        data
      , [ 'data for page1',
          'data for page2',
          'data for page3',
          'data for page4' ]
      , 'gets all 4 pages'
    )
    t.end()
  })
})

test('\ngetting 200 items maxPages: 3, actual pages: 4, abort: true', function (t) {
  var items = 200
    , perPage = 50 
    , page = 1

  var requestAll = proxyquire('..', {
    request: function (opts, cb) {
      var res = {
          headers     : { link: generateLink(page + 1, perPage, items), extra: 'stuff' }
        , statusCode  : 200
        , body        : 'data for page' + page
      }

      page++;
      setTimeout(cb.bind(0, null, res, res.body), 5)
    }
  })
  requestAll(
      requestOpts
    , { startPage :  page
      , perPage   :  perPage
      , limit     :  { maxPages :  3, abort :  true }
      }
    , function (err, responses) {
        var res = responses[0]

        t.equal(page, 2, 'gets first page')
        t.equal(responses.length, 1, 'returns one response')

        t.ok(res.aborted, 'aborted flag is set')
        t.deepEqual(res.body, [], 'response body is empty array')
        t.equal(res.statusCode, 200, 'status code is set')
        t.equal(res.headers.extra, 'stuff', 'headers are set')
        t.end()
      })
})

test('\ngetting 200 items maxPages: 3, actual pages: 4, abort: false', function (t) {
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

      page++;
      setTimeout(cb.bind(0, null, res, res.body), 5)
    }
  })
  requestAll(
      requestOpts
    , { startPage :  page
      , perPage   :  perPage
      , limit     :  { maxPages :  3, abort :  false }
      }
    , function (err, res) {
    var data = res.map(function (r) { return r.body })
    
    t.ok(res.pop().aborted, 'aborted flag is set on last response')
    t.equal(page, 4, 'gets 3 pages')
    t.deepEqual(
        data
      , [ 'data for page1',
          'data for page2',
          'data for page3' ]
      , 'returns 3 pages'
    )
    t.end()
  })
})

test('\ngetting 200 items maxPages: 3, actual pages: 4, abort: true -- streaming interface', function (t) {
  var items = 200
    , perPage = 50 
    , page = 1

  var requestAll = proxyquire('..', {
    request: function (opts, cb) {
      var res = {
          headers     : { link: generateLink(page + 1, perPage, items), extra: 'stuff' }
        , statusCode  : 200
        , body        : 'data for page' + page
      }

      page++;
      setTimeout(cb.bind(0, null, res, res.body), 5)
    }
  })

  var responses = []
  requestAll(
      requestOpts
    , { startPage :  page
      , perPage   :  perPage
      , limit     :  { maxPages :  3, abort :  true }
      }
  )
  .on('error', t.fail.bind(t, 'should have no error'))
  .on('data', [].push.bind(responses))
  .on('end', function () {

    t.equal(page, 2, 'gets first page')
    t.equal(responses.length, 1, 'returns one response')

    var res = JSON.parse(responses[0])

    t.ok(res.aborted, 'aborted flag is set')
    t.deepEqual(res.body, [], 'response body is empty array')
    t.equal(res.statusCode, 200, 'status code is set')
    t.equal(res.headers.extra, 'stuff', 'headers are set')
    t.end()
  })
})

test('\ngetting 200 items maxPages: 3, actual pages: 4, abort: false -- streaming interface', function (t) {
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

      page++;
      setTimeout(cb.bind(0, null, res, res.body), 5)
    }
  })

  var responses = []
  requestAll(
      requestOpts
    , { startPage :  page
      , perPage   :  perPage
      , limit     :  { maxPages :  3, abort :  false }
      }
  )
  .on('error', t.fail.bind(t, 'should have no error'))
  .on('data', [].push.bind(responses))
  .on('end', function () {
    var data = responses.map(function (r) { return JSON.parse(r).body })
    
    t.ok(JSON.parse(responses.pop()).aborted, 'aborted flag is set on last response')
    t.equal(page, 4, 'gets 3 pages')
    t.deepEqual(
        data
      , [ 'data for page1',
          'data for page2',
          'data for page3' ]
      , 'returns 3 pages'
    )
    t.end()
  })
})
