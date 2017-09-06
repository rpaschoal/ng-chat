/// <binding BeforeBuild='get:started' />
var gulp = require('gulp');
var runSeq = require('run-sequence');

require('./gulpTasks/dev');
require('./gulpTasks/dist');

gulp.task('get:started', function (done) {
    runSeq(
        'build:dev',
        done);
});