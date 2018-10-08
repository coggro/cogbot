const request = require('request');

request('http://www.giantitp.com/cgi-bin/GiantITP/ootscript', { json: true}, (err, res, body) => {
    if (err) {
        console.log(err);
    }
    url_location = res.body.search(/\/comics\/oots.*\.html/g);
    console.log('http://www.giantitp.com' + res.body.substring(url_location, url_location+21));
});