const appModule = require("../artifacts/api-server/dist/app.cjs");
const app = appModule.default || appModule;

module.exports = (req, res) => {
  return app(req, res);
};
