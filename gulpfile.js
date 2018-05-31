let gulp = require('gulp'),
  path = require('path'),
  browser = require('browser-sync'),
  del = require('del'),
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  cssnano = require('cssnano'),
  stylelint = require('gulp-stylelint'),
  sourcemaps = require('gulp-sourcemaps'),
  modernizr = require('gulp-modernizr'),
  uglify = require('gulp-uglify'),
  webpack = require('webpack'),
  UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
  eslint = require('gulp-eslint');

// Set default environment
process.env.NODE_ENV = 'development';

const isProd = () => process.env.NODE_ENV === 'production';

const paths = {
  dev: './src/',
  get devPages() {
    return this.dev + 'pages/';
  },
  get devScss() {
    return this.dev + 'scss/';
  },
  get devJs() {
    return this.dev + 'js/';
  },
  get devAssets() {
    return this.dev + 'assets/';
  },
  build: './build/',
  get buildCss() {
    return this.build + 'css/';
  },
  get buildJs() {
    return this.build + 'js/';
  },
  get buildAssets() {
    return this.build + 'assets/';
  }
};

const startServer = () => browser.init({
  server: {
    baseDir: './build',
    port: 3000
  },
  open: false
});

const reload = (done) => {
  browser.reload();
  done();
};

const cleanBuild = () => del(paths.build);

const copyPages = () => {
  return gulp.src(paths.devPages + '*.html')
    .pipe(gulp.dest(paths.build));
};

const buildScss = () => {
  let postCssTasks = [
    autoprefixer({browsers: ['last 2 versions']})
  ];

  if (isProd()) {
    postCssTasks.push(cssnano({
      discardComments: {
        removeAll: true
      }
    }));
  }

  return gulp.src(paths.devScss + '*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass()
      .on('error', sass.logError))
    .pipe(postcss(postCssTasks))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.buildCss))

    // reload browser
    .pipe(browser.stream({match: '**/*.css'}));
};

const lintScss = () => {
  return gulp.src([
    paths.devScss + '**/*.scss'
  ])
    .pipe(stylelint({
      failAfterError: false,
      reporters: [
        {
          formatter: 'string',
          console: true
        }
      ]
    }));
};

const buildJs = (done) => {
  let plugins = [];

  if (isProd()) {
    plugins.push(new UglifyJsPlugin({
      sourceMap: true
    }));
  }

  webpack({
    watch: !isProd(),
    devtool: isProd() ? 'source-map' : 'eval-source-map',
    entry: {
      main: path.resolve(paths.devJs, 'main.js')
    },
    output: {
      publicPath: '/',
      filename: '[name].js',
      path: path.resolve(__dirname, paths.buildJs)
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['env']
              }
            }
          ]
        }
      ]
    },
    plugins: plugins
  }, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error(info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }

    // Log result...
    console.log(stats.toString({
      chunks: false,  // Makes the build much quieter
      modules: false,
      colors: true,    // Shows colors in the console
      moduleTrace: false
    }));

    browser.reload();
    done();
  });
};

const lintJs = () => {
  return gulp.src([
    paths.devJs + '**/*.js'
  ])
    .pipe(eslint())
    .pipe(eslint.format());
};

const copyAssets = () => {
  return gulp.src(paths.devAssets + '**/*.*')
    .pipe(gulp.dest(paths.buildAssets));
};

const buildModernizr = () => {
  return gulp.src([paths.devJs + '**/*.js', paths.devScss + '**/*.scss'])
    .pipe(modernizr('modernizr-custom.js', {
      options: [
        'setClasses',
        'addTest',
        'html5printshiv',
        'testProp',
        'fnBind'
      ],
      excludeTests: ['hidden']
    }))
    .pipe(uglify())
    .pipe(gulp.dest(paths.buildJs));
};

const build = gulp.series(cleanBuild, gulp.parallel(
  copyAssets,
  copyPages,
  buildModernizr,
  buildScss,
  buildJs,
  lintScss,
  lintJs
));

const watch = gulp.series(build, () => {
  startServer();

  gulp.watch([paths.devJs + '**/*.js'], lintJs);
  gulp.watch([paths.devPages + '*.html'], gulp.series(copyPages, reload));
  gulp.watch([paths.devScss + '**/*.scss'], gulp.parallel(buildScss, lintScss));
  gulp.watch([paths.devAssets + '**/*.*'], gulp.series(copyAssets, reload));
});

gulp.task('default', watch);

gulp.task('build', gulp.series((done) => {

  // Set environment
  process.env.NODE_ENV = 'production';

  done();
}, build));
