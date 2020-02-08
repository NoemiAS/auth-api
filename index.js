// const nr = require('newrelic');
const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const enableCors = require('./helpers/cors');

// routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const userProfileRoutes = require('./routes/userProfile.routes');
const countryRoutes = require('./routes/country.routes');

const appConfig = require('./config').appConfig();

const app = express();

// passport init
const authHelper = require('./helpers/auth/passport');

authHelper.passportInit(app);

app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000
  })
);
app.use(
  bodyParser.json({
    limit: '50mb'
  })
);
app.use((req, res, next) => {
  const date = new Date();
  if (req.method === 'POST') {
    req.body.updatedAt = date;
    req.body.createdAt = date;
  } else if (req.method === 'PUT') {
    req.body.updatedAt = date;
  }
  next();
});
app.use(expressValidator());
app.use(enableCors);

app.set('appConfig', appConfig);
app.set('view engine', 'hbs');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/profiles', userProfileRoutes, goalRoutes, timeframeRoutes, contextRoutes);


app.get('/', (req, res) => {
  res.send('Welcome to the SOM API');
  res.render();
});

// Route to server assetlinks for app launch from link
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.send(assetlinks);
});

models.sequelize.sync().then(() => {
  app.listen(appConfig.app.port, appConfig.app.host, () => {
    logger.info(`App listening on ${appConfig.app.host}:${appConfig.app.port}!`);
    logger.info(`config environment: ${appConfig.app.configName}`);
    logger.info(
      `db connection: ${appConfig.database.host}:${appConfig.database.port}/${
      appConfig.database.database
      }`
    );
    logger.debug('Debugger active!');
  });
});


module.exports.app = app;
