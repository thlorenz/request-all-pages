'use strict';

// pagesize
// [ headers]|header -- if array distribute the across reqs for each page
// [ bodys]|body -- if array distribute the across reqs for each page
//

var qs = require('querystring')
  , extend = require('util')._extend
  , through = require('through');


var opts = {
    uri: 'https://api.github.com/users/thlorenz/repos/?somevalue=1&someothervalue=2' 
  , json: true
  , body: { }
  , headers: {} 
};

