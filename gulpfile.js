"use strict";

var gulp = require("gulp"),
    less = require("gulp-less"),
    plumber = require("gulp-plumber"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    server = require("browser-sync").create(),
    csso = require("gulp-csso"),
    rename = require("gulp-rename"),
    imagemin = require("gulp-imagemin"),
    webp = require("gulp-webp"),
    svgostore = require("gulp-svgstore"),
    posthtml = require("gulp-posthtml"),
    include = require("posthtml-include"),
    del = require("del"),
    htmlmin = require("gulp-htmlmin"),
    uglify = require("gulp-uglify");


gulp.task("clean", function() {
  return del("build/")
})
gulp.task("copy", function() {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**"], {
      base: "source/"
    })
  .pipe(gulp.dest("build/"));
});
gulp.task("css", function () {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});
gulp.task("html", function() {
  return gulp.src("source/*.html")
  .pipe(posthtml([
    include()]))
  .pipe(htmlmin({
      collapseWhitespace: true
    }))
  .pipe((gulp.dest("build/")));
});
gulp.task("images", function() {
  return gulp.src("build/img/**/*.{png,jpg,svg}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive: true}),
    imagemin.svgo()
    ]))
  .pipe(gulp.dest("build/img/"));
});
gulp.task("webp", function() {
  return gulp.src("build/img/**/*.{png,jpg}")
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest("build/img/"));
});
gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", gulp.series("css"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
});

gulp.task("refresh", function(done) {
  server.reload();
  done();
})

gulp.task("build", gulp.series(
  "clean",
  "copy",
  "images",
  "webp",
  "css",
  "html",
  ));

gulp.task("start", gulp.series("build", "server"));
