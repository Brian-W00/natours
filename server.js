const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION');
  console.log(err.name, err.message);
  process.exit(1);
}); 

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB,{
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
});

