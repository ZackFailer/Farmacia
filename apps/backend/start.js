const { chdir } = require('process');
const { join } = require('path');

chdir(join(__dirname, '..', '..', '..'));

require('./main.js');
