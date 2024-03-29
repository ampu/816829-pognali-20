const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sourcemap = require('gulp-sourcemaps');
const gulpSass = require('gulp-sass');
const sass = require('sass')
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const rename = require('gulp-rename');
const csso = require('gulp-csso');

const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const svgstore = require('gulp-svgstore');
const gulpWebp = require('gulp-webp');

const del = require('del');
const sync = require('browser-sync').create();

const clean = exports.clean = () => del(['build']);

const css = exports.css = () => {
  return gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemap.init())

    .pipe(gulpSass(sass)())
    .pipe(postcss([
      autoprefixer(),
    ]))
    .pipe(gulp.dest('source/css'))
    .pipe(gulp.dest('build/css'))

    .pipe(csso({restructure: false}))
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('source/css'))
    .pipe(gulp.dest('build/css'))

    .pipe(sync.stream());
};

const html = exports.html = () => {
  return gulp.src('source/*.html')
    .pipe(plumber())
    .pipe(gulp.dest('build'));
};

const js = exports.js = () => {
  return gulp.src(['source/js/script.js', 'source/js/script.min.js'])
    .pipe(plumber())
    .pipe(gulp.dest('build/js'));
};

const img = exports.img = () => {
  return gulp.src('source/img/**/*')
    .pipe(plumber())
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      pngquant(),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false},
        ],
      }),
    ]))
    .pipe(gulp.dest('build/img'))

    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
};

const webp = exports.webp = () => gulp.src(['source/img/**/*.png'])
  .pipe(plumber())
  .pipe(gulpWebp())
  .pipe(gulp.dest('build/img'));

const fonts = exports.fonts = () => {
  return gulp.src(['source/fonts/*.woff', 'source/fonts/*.woff2'])
    .pipe(plumber())
    .pipe(gulp.dest('build/fonts'));
};

const server = exports.server = (done) => {
  sync.init({
    server: {
      baseDir: 'build',
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

const watcher = exports.watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series('css'));
  gulp.watch('source/*.html', gulp.series('html'));
  gulp.watch('source/js/*.js', gulp.series('js'));
  gulp.watch('source/img/**/*', gulp.parallel('img', 'webp'));
  gulp.watch('source/fonts/**/*', gulp.series('fonts'));

  gulp.watch('build/*.html').on('change', sync.reload);
  gulp.watch('build/js/*.js').on('change', sync.reload);
  gulp.watch('build/img/**/*').on('change', sync.reload);
  gulp.watch('build/fonts/**/*').on('change', sync.reload);
};

const build = exports.build = gulp.series(clean, gulp.parallel(css, html, js, img, webp, fonts));

exports.default = gulp.series(build, server, watcher);
