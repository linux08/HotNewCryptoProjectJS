const mongoose = require('mongoose');
mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(resp, err) {
  if(err){
    console.log(err.message);
  }
  console.info(`we're connected on ${process.env.DB}`);

});