var requestAllPages = require('..')
  , through = require('through');

var requestOpts = {
    uri: 'https://api.github.com/users/substack/repos'
  , json: true
  , body: {}
  , headers: { 'user-agent': 'request-all-pages' } 
  };

// gets only the first 2 pages
requestAllPages(
      requestOpts
    , { perPage: 100, limit: { maxPages: 2, abort: false }  }
  )
  .on('error', console.error) 
  .pipe(through(
    function (data) {
      var page = JSON.parse(data)
        , names = page.body.map(function (repo) { return repo.name; });
      this.queue(names.join(', ') + '\n');
    }
  ))
  .pipe(process.stdout);
