# request-all-pages [![build status](https://secure.travis-ci.org/thlorenz/request-all-pages.png)](http://travis-ci.org/thlorenz/request-all-pages)

Requests all pages of paginated data and emits them into a stream or aggregates them into an array.

Follows the [link headers](http://tools.ietf.org/html/rfc5988) until it reaches the last page. As an example see [github
api pagination](http://developer.github.com/v3/#pagination)


```js
var requestAllPages = require('request-all-pages'); 

var opts = {
    uri: 'https://api.github.com/users/substack/repos'
  , json: true
  , body: {}
  , headers: { 'user-agent': 'request-all-pages' } 
  }
  , startPage = 1
  , pagesPer = 100;

requestAllPages(opts, startPage, pagesPer, function (err, pages) {
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

```js
// same using streaming interface
requestAllPages(opts, startPage, pagesPer)
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

```
airport, airport-cluster-example, amok-copter, astw, .... 
```

## Installation

    npm install request-all-pages 

## ***requestAllPages(opts : Object, startPage : Number, perPage: Number[, callback : Function]) : Stream***

- **opts**: options passed to [request](https://github.com/mikeal/request) after the `uri` was modified to
  include paging information. The same opts will be used for all paging requests.
- **startPage**: page to start at
- **perPage**: how many pages to ask for per request (the smaller this number, the more requests have to be made to get
  all data)
- **callback**: `function (err, pages) {..}` if supplied, it will be called with an error or an array containing all
  pages each with the following structure ( `{ headers: /* response headers */, body: /* response body */ })

If **no callback** is supplied, a `stream` is returned instead which emits `data` for each page and `error` if one
occurs.
