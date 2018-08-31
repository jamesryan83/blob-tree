"use strict";

var gulp = require("gulp");
var path = require("path");
var sass = require("gulp-sass");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var gulpts = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");
var autoprefixer = require("gulp-autoprefixer");

var tsProject = gulpts.createProject("tsconfig.json");
var scssInputsPath = path.join(__dirname, "scss", "**", "*.scss");


// watch all
gulp.task("default", function () {
    gulp.watch(scssInputsPath, { interval: 500 }, ["scss"]);
    gulp.watch(path.join(__dirname, "src", "**", "*.ts"), { interval: 500 }, ["ts"]);
});


// build all
gulp.task("dist", ["minify", "scss"]);


// Scss
gulp.task("scss", function () {
    return gulp.src(scssInputsPath)
        .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
        .pipe(autoprefixer({
            browsers: ["> 5%"],
            cascade: false
        }))
        .pipe(gulp.dest(path.join(__dirname, "dist")));
});


// typescript only
gulp.task("ts", function () {
    var tsResult = gulp.src("src/**/*.ts").pipe(tsProject());
    return tsResult
        .js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("dist"));
});


// typescript + minify
gulp.task("minify", ["ts"], function() {
    gulp.src(["dist/**/*.js"])
        .pipe(uglify())
        .pipe(rename("blob-tree.min.js"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("dist"));
});
