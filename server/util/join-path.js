const path = require('path');

module.exports = (...args) =>  path.join(path.dirname(require.main.filename), ...args);