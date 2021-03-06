var requestAllPages = require('..')
  , through = require('through');

var requestOpts = {
    uri: 'https://api.github.com/users/substack/repos'
  , json: true
  , body: {}
  , headers: { 'user-agent': 'request-all-pages' } 
  };

console.log('This example logs nothing to the console since it immediately aborts.');
// aborts immediately since last page > maxPages
requestAllPages(
      requestOpts
    , { perPage: 100, limit: { maxPages: 2, abort: true }  }
  )
  .on('error', console.error) 
  .pipe(through(
    function (data) {
      var page = JSON.parse(data)
        , names = page.body.map(function (repo) { return repo.name; });
      this.queue(names.join(', '));
    }
  ))
  .pipe(process.stdout);
