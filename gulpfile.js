var gulp = require("gulp");
var mocha = require("gulp-mocha");
var webpack = require("webpack");
var gulpWebpack = require("webpack-stream");
var nodemon = require("nodemon");

gulp.task("build", function () {
    return gulp.src("src/frontend/js/client.js")
        .pipe(gulpWebpack(require("./webpack.config.js"), webpack))
        .pipe(gulp.dest("src/frontend/"));
});

gulp.task("nodemon", ["build"], function () {
    return nodemon({
        script: "src/app.js",
        ignore: ["test/*"],
        watch: ["src/*"]
    });
});

gulp.task("test", function () {
    return gulp.src("test/**/*.js")
        .pipe(mocha({reporter: "nyan"}));
});

gulp.task("test_after_build", ["build"], function () {
    return gulp.src("test/**/*.js")
        .pipe(mocha({reporter: "nyan"}));
});

gulp.task("default", ["nodemon"], function () {
    gulp.watch("src/frontend/js/**/*.js", ["test_after_build"]);
    gulp.watch("src/app.js", ["test"]);
    gulp.watch("test/**/*.js", ["test"]);
});
