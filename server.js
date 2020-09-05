const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection sucessfull'));

const app = require('./app');

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App listening to ${port}`);
});
