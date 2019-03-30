const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const element = require('@transmute/element-lib');

const pack = require('../../../package.json');

const { getBasePath, getBaseConfig, getAPIBaseUrl } = require('../../config');


const { schemas } = element.schema;

module.exports = (app) => {
  // Initialize swagger-jsdoc -> returns validated swagger spec in json format
  const swaggerDoc = swaggerJSDoc({
    definition: {
      info: {
        title: 'Element DID',
        version: pack.version,
        description: 'Element DID Rest API',
      },
      basePath: getBasePath(),
    },
    // Path to the API docs
    apis: ['./src/express/routes/**/index.js', './src/express/routes/.well-known/index.js'],
  });

  // Add all JSON schemas as definitions in the Swagger JS doc
  Object.keys(schemas).forEach((schemaName) => {
    // eslint-disable-next-line
    const jsonSchema = schemas[schemaName];
    const { id } = jsonSchema;
    if (id) {
      // eslint-disable-next-line
      swaggerDoc.definitions[id] = jsonSchema;
      // eslint-disable-next-line
    }
  });

  app.get('/api/v1/swagger.json', (req, res) => {
    res.json(swaggerDoc);
  });

  // 404 Middleware
  const pageNotFound = (req, res, next) => {
    if (['/', '/docs', '/api/docs'].indexOf(req.url) === -1) {
      res.status(404).json({
        message: 'Element DID endpoint not found.',
        url: req.url,
      });
    } else {
      next();
    }
  };

  // Swagger
  app.use(
    getBaseConfig().env === 'production' ? '/api/docs' : '/',
    swaggerUi.serve,
    pageNotFound,
    swaggerUi.setup(null, {
      swaggerUrl: `${getAPIBaseUrl()}/swagger.json`,
      explorer: true,
    }),
  );
};
