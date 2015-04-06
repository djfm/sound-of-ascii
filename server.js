var express = require('express');
var app = express();

// Quick and dirty way to have a functioning server runnin'
app.use(express.static('.'));

app.listen(3000);
