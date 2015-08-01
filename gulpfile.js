var gulp       = require('gulp'),
    sass       = require('gulp-sass'),
    browserify = require('gulp-browserify'),
    concat     = require('gulp-concat'),
    embedlr    = require('gulp-embedlr'),
    refresh    = require('gulp-livereload'),
    lrserver   = require('tiny-lr')(),
    express    = require('express'),
    livereload = require('connect-livereload'),
    del = require('del')
    ;

    var livereloadport = 35729,
        serverport     = 5000;

var paths = {
  src: 'src',
  dest: 'build'
};

//We only configure the server here and start it only when running the watch task
var server = express();
//Add livereload middleware before static-middleware
server.use(livereload({
  port: livereloadport
}));

server.use(express.static('./build'));


gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build/**/*'], cb);
});

gulp.task('copy', ['copy:misc']);

gulp.task('copy:misc', function () {
    return gulp.src([

        // Copy all files
        paths.src + '/**/*',

        // Exclude the following files
        // (other tasks will handle the copying of these files)
        '!' + paths.src + '/sass/**/*.scss',
        '!' + paths.src + '/**/*.html',
        '!' + paths.src + '/js/**/*.js'

    ], {

        // Include hidden files by default
        dot: true
    }).pipe(gulp.dest(paths.dest));
});

//Task for sass using libsass through gulp-sass
gulp.task('sass', function(){
  gulp.src(paths.src+'/sass/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest(paths.dest+'/css'))
    .pipe(refresh(lrserver));
});

//Task for processing js with browserify
gulp.task('browserify', function(){
  gulp.src(paths.src+'/js/**/*.js')
   .pipe(browserify())
   .pipe(concat('main.js'))
   .pipe(gulp.dest(paths.dest+'/js'))
   .pipe(refresh(lrserver));
});

//Task for moving html-files to the build-dir
//added as a convenience to make sure this gulpfile works without much modification
gulp.task('html', function(){
  gulp.src(paths.src+'/**/*.html')
    .pipe(gulp.dest(paths.dest))
    .pipe(refresh(lrserver));
});

//Convenience task for running a one-off build
gulp.task('build', ['clean', 'html', 'browserify', 'sass', 'copy']);

gulp.task('serve', function() {
  //Set up your static fileserver, which serves files in the build dir
  server.listen(serverport);

  //Set up your livereload server
  lrserver.listen(livereloadport);
});

gulp.task('watch', function() {
  gulp.watch(paths.src+'/img/**/*', ['copy:image']);
  gulp.watch(paths.src+'/sass/**/*.scss', ['sass']);
  gulp.watch(paths.src+'/js/**/*.js', ['browserify']);
  gulp.watch(paths.src+'/**/*.html', ['html']);
});

gulp.task('default', ['build', 'serve', 'watch']);
