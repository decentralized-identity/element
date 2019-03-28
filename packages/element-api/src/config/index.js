const functions = require('firebase-functions');
const fs = require('fs');
const path = require('path');

const localConfig = path.resolve(__dirname, '../../secrets/.runtimeconfig.json');

const getBaseConfig = () => {
  let config;

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line
    if (fs.existsSync(localConfig)) {
      // eslint-disable-next-line
      config = require(localConfig);
    } else {
      throw new Error('Local development requires ./secrets/.runtimeconfig.json');
    }
  }

  if (process.env.NODE_ENV === 'production') {
    config = functions.config();
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
