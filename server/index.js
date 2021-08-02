// server/index.js
var index = require('./routes/index');
var cors = require('cors');

const express = require("express");
const path = require("path")
require('dotenv').config()
 // console.log(process.env.TWITTER_CONSUMER) 


const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors()); 

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use('/api', index);
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(express.static("build"));


app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});