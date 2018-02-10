var gulp = require('gulp');
var concat = require('gulp-concat');
var less = require('gulp-less');
var rename = require('gulp-rename');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var iife = require('gulp-iife');
var replace = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', [
  'docs'
]);

gulp.task('js', function () {
  return gulp.src('src/js/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('masongram.min.js'))
    .pipe(replace(/["']use strict["'];/g, ''))
    .pipe(iife({
      params: ['window', 'document', '$'],
      args: ['window', 'document', 'jQuery']
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
});

gulp.task('less', function () {
  return gulp.src('./src/less/*.less')
    .pipe(less())
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('docs', ['js', 'less'], function () {
  return gulp.src([
    './dist/*.min.*',
    './dist/*.min.*.map'
  ])
    .pipe(gulp.dest('docs'))
});

gulp.task('watch', ['docs'], function () {
  gulp.watch('src/**/*.*', ['docs']);
});
