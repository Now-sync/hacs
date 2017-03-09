var gulp = require("gulp");
var mocha = require("gulp-mocha");

gulp.task("test", function () {
    gulp.src("test/javascript/*.js")
        .pipe(mocha())
        .on("error", function (err) {
            this.emit(err);
        });
});

gulp.task("watch", function () {
    gulp.watch("src/**/*.js", ["test"]);
    gulp.watch("test/**/*.js", ["test"]);
});
