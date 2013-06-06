'use strict';
/*jshint asi: true */

var test = require('tap').test
  , withPagingParams = require('../lib/with-paging-params')

test('with-paging-params - uri has params', function (t) {

  var uri = 'https://api.github.com/users/thlorenz/repos?somevalue=1&someothervalue=2' 
    , page = 1
    , perPage = 10

  t.equal(
      withPagingParams(uri, page, perPage)
    , 'https://api.github.com/users/thlorenz/repos?somevalue=1&someothervalue=2&per_page=10&page=1'
    , 'adds paging params while preserving existing ones'
  )
  t.end()
})

test('with-paging-params - uri has no params', function (t) {

  var uri = 'https://api.github.com/users/thlorenz/repos' 
    , page = 1
    , perPage = 10

  t.equal(
      withPagingParams(uri, page, perPage)
    , 'https://api.github.com/users/thlorenz/repos?per_page=10&page=1'
    , 'adds paging params'
  )
  t.end()
})

test('with-paging-params - uri has authentication', function (t) {

  var uri = 'https://joe:schmo@api.github.com/users/thlorenz/repos' 
    , page = 1
    , perPage = 10

  t.equal(
      withPagingParams(uri, page, perPage)
    , 'https://joe:schmo@api.github.com/users/thlorenz/repos?per_page=10&page=1'
    , 'adds paging params while preserving authentication'
  )
  t.end()
})
