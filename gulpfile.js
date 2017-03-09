var gulp = require("gulp");
var mocha = require("gulp-mocha");
var webpack = require("webpack-stream");
var nodemon = require("nodemon");

gulp.task("build", function () {
    return gulp.src("src/frontend/js/client.js")
        .pipe(webpack(require("./webpack.config.js")))
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
    return gulp.src("test/javascript/*.js")
        .pipe(mocha());
});

gulp.task("test_after_build", ["build"], function () {
    return gulp.src("test/javascript/*.js")
        .pipe(mocha());
});

gulp.task("default", ["nodemon"], function () {
    gulp.watch("src/frontend/js/**/*.js", ["test_after_build"]);
    gulp.watch("src/app.js", ["test"]);
    gulp.watch("test/**/*.js", ["test"]);
});
