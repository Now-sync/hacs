var gulp = require("gulp");
var mocha = require("gulp-mocha");
var webpack = require("webpack");
var gulpWebpack = require("webpack-stream");
var nodemon = require("nodemon");
var browsersync = require("browser-sync").create();
var proxy = require("proxy-middleware");
var url = require("url");

function handleError() {
    this.emit("end");
}

gulp.task("build", function () {
    return gulp.src("src/frontend/js/client.js")
        .pipe(gulpWebpack(require("./webpack.config.js"), webpack))
        .on("error", handleError)
        .pipe(gulp.dest("src/frontend/"));
});

gulp.task("nodemon", ["build"], function () {
    return nodemon({
        script: "src/app.js",
        ignore: ["test/*"],
        watch: ["src/app.js"]
    });
});

gulp.task("browsersync", ["nodemon"], function () {
    // redirect all api requests to port 3000 where the server is actually running
    var proxyOptions = url.parse("https://localhost:3000/api");
    proxyOptions.route = "/api";
    proxyOptions.rejectUnauthorized = false;
    return browsersync.init({
        server: {
            baseDir: "src/frontend/",
            middleware: [proxy(proxyOptions)]
        },
        port: 3010,
        ui: {
            port: 3011
        },
        https: {
            key: "./server.key",
            cert: "./server.crt"
        },
        ws: true
    });
});

gulp.task("browsersyncJS", ["build"], function () {
    return browsersync.reload();
});

gulp.task("browsersyncReload", function () {
    return browsersync.reload();
});

gulp.task("test", function () {
    return gulp.src("test/**/*.js")
        .pipe(mocha({
            reporter: "nyan",
            compilers: "js:babel-core/register"
        }))
        .on("error", handleError);
});

gulp.task("test_after_build", ["browsersyncJS"], function () {
    return gulp.src("test/**/*.js")
        .pipe(mocha({
            reporter: "nyan",
            compilers: "js:babel-core/register"
        }))
        .on("error", handleError);
});

gulp.task("default", ["browsersync"], function () {
    gulp.watch("src/frontend/js/**/*.js", ["test_after_build"]);
    gulp.watch(["src/app.js", "test/**/*.js"], ["test"]);
    gulp.watch(["src/app.js", "src/frontend/**/*.html", "src/frontend/**/*.css"],
        ["browsersyncReload"]);
});
