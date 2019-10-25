const app = require('./src/express/app');

const port = 5002;
app.listen(port, () => {
  console.log(`Express app has started on port ${port}`);
});
