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

app.use('/api', index);

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});