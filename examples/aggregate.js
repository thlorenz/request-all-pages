var getAllPages = require('..'); 

var env = process.env;
var opts = {
    uri: 'https://api.github.com/users/substack/repos?client_id=' + env.VALUEPACK_GITHUB_CLIENT_ID + '&client_secret=' + env.VALUEPACK_GITHUB_CLIENT_SECRET
  , json: true
  , body: {}
  , headers: { 'user-agent': 'request-all-pages' } 
  }
  , startPage = 1
  , pagesPer = 100;

getAllPages(opts, startPage, pagesPer, function (err, pages) {
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
