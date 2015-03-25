var gulp = require('gulp');
var gutil = require('gulp-util');
var connect = require('gulp-connect');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var mold = require('mold-source-map');

//var baseDir = './app/';
var baseDir = '/';

var scriptDir = baseDir + 'scripts/';
var styleDir = baseDir + 'styles/';
var distDir = baseDir + 'dist/';

gulp.task('server', function() {
	connect.server({
		root: baseDir,
		port: 3000,
		livereload: true
	})
});



gulp.task('html', function() {
	gulp.src(baseDir + 'index.html')
		.pipe(connect.reload());
});


gulp.task('watch', function() {
	gulp.watch(scriptDir + '**/*.js');
	gulp.watch(baseDir + 'index.html', ['html']);
});

gulp.task('default', ['server', 'watch']);