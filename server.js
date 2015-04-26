var express = require('express');
var app = express();

// Quick and dirty way to have a functioning server runnin'
app.use(express.static('.'));
app.listen(process.env.PORT || process.argv[2] || 3000);
