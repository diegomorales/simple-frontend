const {series, parallel, watch} = require('gulp')

// Tasks
const paths = require('./tasks/paths');
const startServer = require('./tasks/start-server');
const reload = require('./tasks/reload');
const cleanBuild = require('./tasks/clean-build');
const copyAssets = require('./tasks/copy-assets');
const copyPages = require('./tasks/copy-pages');
const buildScss = require('./tasks/build-scss');
const buildJs = require('./tasks/build-js');

// Set default environment
process.env.NODE_ENV = 'production';

const build = series(cleanBuild, parallel(
  copyAssets,
  copyPages,
  buildScss,
  buildJs
));

const watchTask = series(build, () => {
  startServer()

  watch([paths.devPages + '*.html'], series(copyPages, reload));
  watch([paths.devScss + '**/*.scss'], buildScss);
  watch([paths.devAssets + '**/*.*'], series(copyAssets, reload));
});

exports.build = build
exports.default = watchTask
