var requestAllPages = require('..'); 

var requestOpts = {
    uri: 'https://api.github.com/users/substack/repos'
  , json: true
  , body: {}
  , headers: { 'user-agent': 'request-all-pages' } 
  };

requestAllPages(requestOpts, { startPage: 1, perPage: 100 }, function (err, pages) {
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
