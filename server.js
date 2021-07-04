const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');

const app = express();
const port = process.env.PORT || 8080;

const staticFileMiddleware = express.static(path.join(__dirname + '/dist'));

app.use(staticFileMiddleware);
app.use(
  history({
    disableDotRule: true,
    verbose: true,
  }),
);
app.use(staticFileMiddleware);

app.get('/', function(req, res) {
  res.render(path.join(__dirname + '/dist/index.html'));
});

app.listen(port, () => {
  console.log('App now running on port', port);
});
