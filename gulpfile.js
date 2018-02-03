var gulp = require('gulp');
var concat = require('gulp-concat');
var less = require('gulp-less');
var rename = require('gulp-rename');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');

gulp.task('default', [
  'docs'
]);

gulp.task('js', function () {
  return gulp.src('src/js/*.js')
    .pipe(concat('masongram.js'))
    .pipe(uglify({
      output: {
        beautify: true
      },
      compress: false,
      mangle: false
    }))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'))
});

gulp.task('less', function () {
  return gulp.src('./src/less/*.less')
    .pipe(less())
    .pipe(gulp.dest('dist'))
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('docs', ['js', 'less'], function () {
  return gulp.src([
    './dist/*.min.*'
  ])
    .pipe(gulp.dest('docs'))
});

gulp.task('watch:less', function () {
  gulp.watch('./src/less/*.less', ['docs']);
});

gulp.task('watch:js', function () {
  gulp.watch('src/js/*.js', ['docs']);
});

gulp.task('watch', [
  'watch:less',
  'watch:js'
]);
