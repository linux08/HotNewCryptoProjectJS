// server/index.js
var index = require('./routes/index');
var cors = require('cors');

const express = require("express");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors()); 

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use('/', index);


app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});