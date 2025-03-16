import copy from 'gulp-copy';
import gulp from 'gulp';
import rename from 'gulp-rename';
import typescript from 'gulp-typescript';
import uglify from 'gulp-uglify';

const ts = typescript.createProject('tsconfig.json');
gulp.task(
  'scripts',
  () => ts.src()
    .pipe(ts())
    .pipe(uglify())
    .pipe(rename({ extname: '.js' }))
    .pipe(gulp.dest('dist/src'))
);

gulp.task(
  'copy-views',
  () => gulp.src('views/**/*')
    .pipe(copy('dist/views', { prefix: 1 }))
);

gulp.task(
  'copy-assets',
  () => gulp.src('assets/**/*')
    .pipe(copy('dist/assets', { prefix: 1 }))
);

gulp.task(
  'copy-server',
  () => gulp.src('./dist/server', { encoding: false })
    .pipe(gulp.dest('dist/dist', { mode: 0o755 }))
);

gulp.task('default', gulp.series('scripts', 'copy-views', 'copy-assets', 'copy-server'));
