const functions = require('firebase-functions');

const getBaseConfig = () => {
  let config;
  switch (process.env.NODE_ENV) {
    case 'testing':
      // eslint-disable-next-line
      config = require('../../local.runtimeconfig.json');
      break;

    case 'development':
    case 'production':
    default:
      config = functions.config();
      break;
  }

  return config.element;
};

const getBaseHost = () => {
  switch (getBaseConfig().env) {
    case 'production':
      return 'element-did.com';
    default:
      return 'localhost:5002';
  }
};

const getBasePath = () => {
  switch (getBaseConfig().env) {
    case 'production':
      return '/api/v1';
    default:
      return `/${process.env.GCLOUD_PROJECT}/us-central1/${process.env.FUNCTION_NAME}/api/v1`;
  }
};

const getAPIBaseUrl = () => {
  const protocol = getBaseConfig().env === 'production' ? 'https' : 'http';
  return `${protocol}://${getBaseHost()}${getBasePath()}`;
};

module.exports = {
  getBaseConfig,
  getBaseHost,
  getBasePath,
  getAPIBaseUrl,
};
