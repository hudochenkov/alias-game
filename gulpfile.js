var source = require('vinyl-source-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');
var notify = require('gulp-notify');

var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var buffer = require('vinyl-buffer');

var browserSync = require('browser-sync');
var reload = browserSync.reload;
var historyApiFallback = require('connect-history-api-fallback');

var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var mediaMinmax = require('postcss-media-minmax');
var nested = require('postcss-nested');
var propertyLookup = require('postcss-property-lookup');
var simpleVars = require('postcss-simple-vars');
var calc = require('postcss-calc');
var postcssHexrgba = require('postcss-hexrgba');
var postcssImport = require('postcss-import');
var postcssMixins = require('postcss-mixins');

/*
	Styles Task
*/

gulp.task('styles', function() {
	var processors = [
		postcssImport,
		postcssMixins,
		nested,
		simpleVars,
		propertyLookup,
		calc,
		postcssHexrgba,
		mediaMinmax,
		autoprefixer({
			browsers: ['last 2 versions', 'Android >= 4', 'iOS >= 8']
		})
	];

	return gulp.src('pcss/main.pcss')
		.pipe(postcss(processors))
		.on('error', handleErrors)
		.pipe(rename('main.css'))
		.pipe(gulp.dest('build'))
		.pipe(reload({
			stream: true
		}));
});

/*
	Images
*/
gulp.task('images', function() {
	gulp.src('css/images/**')
		.pipe(gulp.dest('./build/css/images'));
});

/*
	Browser Sync
*/
gulp.task('browser-sync', function() {
	browserSync({
		// we need to disable clicks and forms for when we test multiple rooms
		server: {},
		middleware: [historyApiFallback()],
		notify: false,
		ghostMode: false
	});
});

function handleErrors() {
	var args = Array.prototype.slice.call(arguments);
	notify.onError({
		title: 'Compile Error',
		message: '<%= error.message %>'
	}).apply(this, args);
	this.emit('end'); // Keep gulp from hanging on this task
}

function buildScript(file, watch) {
	var props = {
		entries: ['./scripts/' + file],
		debug: true,
		cache: {},
		packageCache: {},
		transform: [babelify.configure({
			stage: 0
		})]
	};

	// watchify() if watch requested, otherwise run browserify() once
	var bundler = watch ? watchify(browserify(props)) : browserify(props);

	function rebundle() {
		var stream = bundler.bundle();
		return stream
			.on('error', handleErrors)
			.pipe(source(file))
			.pipe(gulp.dest('./build/'))
			// If you also want to uglify it
			.pipe(buffer())
			.pipe(uglify())
			// .pipe(rename('app.min.js'))
			.pipe(gulp.dest('./build'))
			.pipe(reload({
				stream: true
			}));
	}

	// listen for an update and run rebundle
	bundler.on('update', function() {
		rebundle();
		gutil.log('Rebundle...');
	});

	// run it once the first time buildScript is called
	return rebundle();
}

gulp.task('scripts', function() {
	return buildScript('main.js', false); // this will run once because we set watch to false
});

// run 'scripts' task first, then watch for future changes
gulp.task('default', ['scripts', 'styles', 'browser-sync'], function() {
	gulp.watch('pcss/**/*', ['styles']); // gulp watch for stylus changes
	return buildScript('main.js', true); // browserify watch for JS changes
});
