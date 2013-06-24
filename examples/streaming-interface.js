var requestAllPages = require('..')
  , through = require('through');

var requestOpts = {
    uri: 'https://api.github.com/users/substack/repos'
  , json: true
  , body: {}
  , headers: { 'user-agent': 'request-all-pages' } 
  };

requestAllPages(requestOpts, { startPage: 1, pagesPer:  100 })
  .on('error', console.error) 
  .pipe(through(
    function (data) {
      var page = JSON.parse(data)
        , names = page.body.map(function (repo) { return repo.name; });
      this.queue(names.join(', '));
    }
  ))
  .pipe(process.stdout);
