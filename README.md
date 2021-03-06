# request-all-pages [![build status](https://secure.travis-ci.org/thlorenz/request-all-pages.png)](http://travis-ci.org/thlorenz/request-all-pages)

Requests all pages of paginated data and emits them into a stream or aggregates them into an array.

Follows the [link headers](http://tools.ietf.org/html/rfc5988) until it reaches the last page. As an example see [github
api pagination](http://developer.github.com/v3/#pagination)

```js
var requestAllPages = require('request-all-pages'); 

var requestOpts = {
    uri: 'https://api.github.com/users/substack/repos'
  , json: true
  , body: {}
  , headers: { 'user-agent': 'request-all-pages' } 
  };

requestAllPages(requestOpts, { startPage: 1, pagesPer: 100 }, function (err, pages) {
  if (err) return console.error(err);  
  var names = pages
    .reduce(
      function (acc, page) {
        acc = acc.concat(page.body.map(function (repo) { return repo.name; }))
        return acc;
      }
    , []);

  console.log('%s\nTotal: %s', names.join(', '), names.length);
});
```

```
airport, airport-cluster-example, amok-copter, astw, .... 
```

### Default opts

```js
// startPage defaults to 1 and pagesPer defaults to 50
requestAllPages(requestOpts, function (err, pages) {
  [..]
});
```

### Streaming Interface

```js
requestAllPages(requestOpts, { startPage: 1, pagesPer: 100 })
  .on('error', console.error) 
  .pipe(through(
    function (data) {
      var page = JSON.parse(data)
        , names = page.body.map(function (repo) { return repo.name; });
      this.queue(names.join(', '));
    }
  ))
  .pipe(process.stdout);
```

### Limit option

```js
// aborts immediately if last page > maxPages
requestAllPages(
      requestOpts
    , { pagesPer: 100, limit: { maxPages: 2, abort: true }  }
  )
  .pipe([...]);
```

```js
// gets only the first 2 pages even if there are more
requestAllPages(
      requestOpts
    , { pagesPer: 100, limit: { maxPages: 2, abort: false }  } 
  )
  .pipe([...]);
```

[Complete versions of these examples](https://github.com/thlorenz/request-all-pages/tree/master/examples).

## Installation

    npm install request-all-pages 

## API

***requestAllPages(requestOpts : Object[, opts: Object, callback : Function]) : Stream***

- **requestOpts**: options passed to [request](https://github.com/mikeal/request) after the `uri` was modified to
  include paging information. The same opts will be used for all paging requests.
- **opts**: optional configuration (see example below)
  - **startPage**: the page to start at (default: 1)
  - **perPage**: how many pages to ask for per request -- the smaller this number, the more requests have to be made to get
    all data (default: 50)

  - **limit**: object with following properties
      - **maxPages**: the maximum number of pages to fetch
      - **abort**: 
          - if `true` aborts immediately and returns [empty response](#empty-response) with `aborted: true` if last page exceeds `maxPages`
          - if `false` it fetches and returns data until `maxPages` is reached

- **callback**: `function (err, pages) {..}` if supplied, it will be called with an error or an array containing all
  pages each with the following structure: 

### response structure

```js
[ { headers      // response headers 
  , statusCode   // response statusCode 
  , body      }, // response body 
  { .. },
  .. ]
```

### empty response

```js
[ { statusCode: xxx
  , body: []
  , headers: { ... }
  , aborted: true } ]
```


If **no callback** is supplied, a `stream` is returned instead which emits `data` for each page and `error` if one
occurs.
