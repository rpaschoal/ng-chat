var gulp = require('gulp');
var runSeq = require('run-sequence');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var tsc = require('gulp-typescript');
var path = require('path');
var embedTemplates = require('gulp-angular-embed-templates');
var sysBuilder = require('systemjs-builder');
var inject = require('gulp-inject');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var buildConfig = require('../gulp.config');
var tscConfig = require('../tsconfig.json');

gulp.task('build:prod', function (done) {
    runSeq(
        'prod-clean-temp',
        'prod-clean-vendor-js-in-root',
        'prod-clean-vendor-css-in-root',
        'prod-clean-app-in-root',
        'prod-web-copy-app-to-temp',
        'prod-web-compile-typescript',
        'prod-web-embed-templates',
        'prod-copy-vendor-js-to-temp',
        'prod-copy-vendor-css-to-temp',
        'prod-web-copy-systemjs',
        'prod-web-build-app',
        'prod-web-build-vendor',
        'prod-web-inject',
        done);
});

gulp.task('prod-clean-vendor-js-in-root', function (done) {
    del(buildConfig.rootJsFolder, { force: true }).then(function () {
        done();
    });
});

gulp.task('prod-clean-vendor-css-in-root', function (done) {
    del(buildConfig.rootCssFolder, { force: true }).then(function () {
        done();
    });
});

gulp.task('prod-clean-app-in-root', function (done) {
    del(buildConfig.rootAppFolder, { force: true }).then(function () {
        done();
    });
});

gulp.task('prod-clean-temp', function (done) {
    del('./.temp/', { force: true }).then(function () {
        done();
    });
});

gulp.task('prod-web-copy-app-to-temp', function (done) {
    return gulp.src([
        './angularApp/**/*.js',
        './angularApp/**/*.ts',
        './angularApp/**/*.html',
        './angularApp/**/*.css',
    ])
        .pipe(gulp.dest('./.temp/app/'));
});

gulp.task('prod-web-compile-typescript', function () {
    return gulp
        .src('./.temp/app/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsc(tscConfig.compilerOptions))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.join('./.temp/', 'app')));
});

gulp.task('prod-web-embed-templates', function (done) {
    return gulp.src('./.temp/app/**/*.js')
        .pipe(embedTemplates({ sourceType: 'js' }))
        .pipe(gulp.dest(path.join('./.temp/', 'app')));

});

gulp.task('prod-copy-vendor-js-to-temp', function (done) {
    runSeq(
        'prod-copy-angular',
        'prod-copy-rxjs',
        'prod-copy-toastr',
        'prod-copy-loadingBar',
        'prod-copy-allOther',
        done);
});

gulp.task('prod-copy-angular', function () {
    return gulp.src(buildConfig.sources.angular)
        .pipe(gulp.dest('./.temp/js/@angular/'));
});

gulp.task('prod-copy-rxjs', function () {
    return gulp.src(buildConfig.sources.Rxjs)
        .pipe(gulp.dest('./.temp/js/rxjs/'));
});

gulp.task('prod-copy-toastr', function () {
    return gulp.src(buildConfig.sources.angularToastr)
        .pipe(gulp.dest('./.temp/js/angular2-toaster/'));
});

gulp.task('prod-copy-ng-chat', function () {
    return gulp.src(buildConfig.sources.NgChat)
        .pipe(gulp.dest('./.temp/js/ng-chat/'));
});

gulp.task('prod-copy-loadingBar', function () {
    return gulp.src(buildConfig.sources.angularLoadingBar)
        .pipe(gulp.dest('./.temp/js/ng2-loading-bar/'));
});

gulp.task('prod-copy-allOther', function () {
    return gulp.src(buildConfig.sources.jsFilesInclSourcePaths)
        .pipe(gulp.dest('./.temp/js/'));
});

gulp.task('prod-copy-vendor-css-to-temp', function () {
    return gulp.src(buildConfig.sources.cssFiles)
        .pipe(gulp.dest('./wwwroot/css/'));
});

gulp.task('prod-web-copy-systemjs', function (done) {
    return gulp.src('./system.config.js')
        .pipe(gulp.dest('./.temp/'));
});

gulp.task('prod-web-build-app', function (done) {
    var builder = new sysBuilder('./.temp/', './.temp/system.config.js');

    return builder.buildStatic('app', path.join('./wwwroot', 'js', 'app.bundle.js'), { minify: true })
        .catch(function (err) {
            console.error('>>> [systemjs-builder] Bundling failed'.bold.green, err);
        });
});

gulp.task('prod-web-build-vendor', function (done) {
    return gulp.src(buildConfig.sources.jsFilesInclSourcePaths)
        .pipe(concat('vendor.bundle.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.join('./wwwroot', 'js')));
});

gulp.task('prod-web-inject', function (done) {
    var target = gulp.src(path.join('./wwwroot', 'index.html'));

    var sources = gulp.src([
        path.join('./wwwroot', 'js', 'vendor.bundle.js'),
        path.join('./wwwroot', 'js', 'app.bundle.js'),
        path.join('./wwwroot', 'css', '*.css')
    ], { read: false });

    return target.pipe(inject(sources, {
        ignorePath: 'wwwroot',
        addRootSlash: false
    }))
        .pipe(gulp.dest('./wwwroot'));
});
