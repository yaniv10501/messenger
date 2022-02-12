const AuthorizationError = require('./errors/AuthorizationError');

const whiteList = ['https://yanivportfolio.com', 'https://www.yanivportfolio.com', undefined];
const corsOptions = {
  origin: (origin, callback) => {
    console.log(origin);
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new AuthorizationError('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
