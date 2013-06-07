var requestAllPages = require('..'); 

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
