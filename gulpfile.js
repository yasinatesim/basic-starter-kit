/**
 * Dependencies
 * -----------------------------------------------------------------------------
 */

const gulp = require("gulp");
const gulpLoadPlugins = require("gulp-load-plugins");
const browserSync = require("browser-sync").create();
const del = require("del");

// plugins load
const $ = gulpLoadPlugins();

// auto reload the browser
const reloadStream = browserSync.reload;
const reload = (done) => {
  browserSync.reload();
  done();
};

// catch stream errors
const gulpSrc = gulp.src;

gulp.src = function onError(...args) {
  return (
    gulpSrc
      .apply(gulp, args)
      // Catch errors
      .pipe(
        $.plumber(function onError(error) {
          $.util.log(
            $.util.colors.red(`Error (${error.plugin}):${error.message}`)
          );
          this.emit("end");
        })
      )
  );
};

// Project Path
const srcRoot = "src";
const src = {
  views: `${srcRoot}/views`,
  styles: `${srcRoot}/sass`,
  images: `${srcRoot}/img`,
};

// Distribution Path
const distRoot = "dist";
const dist = {
  views: `${distRoot}`,
  styles: `${distRoot}/assets/css`,
  images: `${distRoot}/assets/img`,
};

/**
 * Builds
 * ================================================================
 */

// html

gulp.task("views", () => {
  let stream = gulp
    .src(`${src.views}/**/*`)
    .pipe(gulp.dest(`${dist.views}`));

  stream = stream.pipe(reloadStream({ stream: true }));
  return stream;
});

// styles

gulp.task("styles", () => {
  let stream = gulp
    .src(`${src.styles}/*.scss`)
    .pipe($.sass())
    .pipe(
      $.sass
        .sync({
          outputStyle: "expanded",
          precision: 6,
          includePaths: ["."],
        })
        .on("error", $.sass.logError)
    )
    .pipe($.autoprefixer());

  stream = stream
    .pipe(gulp.dest(dist.styles))
    .pipe($.cleanCss())
    .pipe($.rename({ suffix: ".min" }));

  stream = stream
    .pipe(gulp.dest(dist.styles))
    .pipe(reloadStream({ stream: true }));
  return stream;
});

// images

gulp.task("images", () => {
  let stream = gulp
    .src(`${src.images}/**/*`)
    .pipe($.newer(`${dist.images}`))
    .pipe(
      $.imagemin()
    )
    .pipe(gulp.dest(`${dist.images}`));

  stream = stream.pipe(reloadStream({ stream: true }));
  return stream;
});

/**
 * Clean
 * ================================================================
 */

gulp.task("clean", () =>
  del(`${distRoot}`, {
    force: true,
  })
);

/**
 * Build Theme
 * ================================================================
 */

gulp.task(
  "build",
  gulp.series("clean", "views", "styles", "images")
);

/**
 * Serve
 * ================================================================
 */

// 'gulp serve' - open up theme in your browser and watch for changes
gulp.task("serve", (done) => {
  browserSync.init({
    notify: false,
    ui: false,
    port: 3000,
    server: dist.views,
  });

  done();

	gulp.watch(`${src.views}/**/*.html`, gulp.series("views", reload));

  gulp.watch([`${src.styles}/**/*.scss`], gulp.series("styles", reload));

  gulp.watch(`${src.images}/**/*`, gulp.series("images", reload));
});

// 'gulp' - build and serves the theme
gulp.task("default", gulp.series("build", "serve"));
