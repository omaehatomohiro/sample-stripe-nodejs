const log4js = require('log4js');

const logger = log4js.getLogger('nush-server'); //このログのカテゴリ名を指定(option)
logger.level = "info";

const defaultLogger = log4js.getLogger('top');
defaultLogger.level = 'info';

module.exports = {
    logger,
    defaultLogger
}
