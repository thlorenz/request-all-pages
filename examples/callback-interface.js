var requestAllPages = require('..'); 

var requestOpts = {
    uri: 'https://api.github.com/users/substack/repos'
  , json: true
  , body: {}
  , headers: { 'user-agent': 'request-all-pages' } 
  }
  , startPage = 1
  , pagesPer = 100;

requestAllPages(requestOpts, { startPage: startPage, pagesPer: pagesPer }, function (err, pages) {
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
