'use strict';

module.exports = function generateLink(page, perPage, items) {
  return  '<http://some.uri/?page=' + page  + '&per_page=' + perPage +'>; rel="next", ' + 
          '<http://some.uri/?page=' + (items/perPage) + '&per_page=' + perPage +'>; rel="last"';
};
