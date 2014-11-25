require! {
  gulp
  'gulp-livescript':live-script
  'gulp-cssshrink':css-shrink
  'gulp-uglify':uglify
}

  
task = gulp~task
source = gulp~src
destination = gulp~dest

task \default ->
  source __dirname + '/src/app.ls'
  .pipe live-script!
  .pipe uglify!
  .pipe destination '.'

  source __dirname + '/src/style.css'
  .pipe css-shrink!
  .pipe destination '.'