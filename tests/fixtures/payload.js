const fs = require('fs'),
      path = require('path'),
      files = fs.readdirSync(path.join(__dirname, 'payloads'));

files.forEach(filename => {
  module.exports[
    filename.split('.').slice(0, -1).join('.')
  ] = require(path.resolve(__dirname, 'payloads', filename));
});
