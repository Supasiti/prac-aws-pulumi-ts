const { log } = require('../src/common/logger');

// Turn off the log during test
log.level = 'silent';
