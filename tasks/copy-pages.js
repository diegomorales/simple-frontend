const gulp = require('gulp');
const paths = require('./paths');

module.exports = function copyPages () {
  return gulp.src(paths.devPages + '*.html')
    .pipe(gulp.dest(paths.build));
};
