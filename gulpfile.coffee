gulp = require 'gulp'
coffee = require 'gulp-coffee'
gutil = require 'gulp-util'
coffeeify = require 'coffeeify'
hbsfy = require 'hbsfy'
browserify = require 'browserify'
streamConvert = require 'vinyl-source-stream'
concat = require 'gulp-concat'
rework = require 'gulp-rework'
reworkNpm = require 'rework-npm'
shell = require 'gulp-shell'
merge = require 'merge-stream'
fs = require 'fs'
glob = require 'glob'

paths =
  src: 'src/**/*.*'
  coffee: './src/**/*.coffee'
  lib: './lib/'
  demo: './demo/'
  jquery: './bower_components/jquery/dist/'
  bootstrap: './bower_components/bootstrap/dist/'
  select2: './bower_components/select2/'
  dist_css: './dist/css/'
  dist_js: './dist/js/'

# gulp.task "coffee", ->
#   return gulp.src(paths.coffee)
#     .pipe(coffee(bare: true).on("error", gutil.log))
#     .pipe gulp.dest(paths.lib)

gulp.task "browserify", ->
  shim(browserify("./index.coffee",
    extensions: [".coffee"]
    basedir: "./src/"
  )).bundle()
  .on("error", gutil.log)
  .pipe(streamConvert("index.js"))
  .pipe gulp.dest(paths.dist_js)

gulp.task "libs_css", ->
  return gulp.src([
    paths.bootstrap + "css/bootstrap.css"
    paths.bootstrap + "css/bootstrap-theme.css"
    paths.select2 + "select2.css"
    "./bower_components/select2-bootstrap3-css/select2-bootstrap.css"
  ]).pipe(concat("libs.css"))
    .pipe(gulp.dest(paths.dist_css))

gulp.task "libs_js", ->
  return gulp.src([
    paths.jquery + "jquery.js"
    paths.bootstrap + "js/bootstrap.js"
    "./bower_components/lodash/dist/lodash.js"
    "./bower_components/backbone/backbone.js"
    paths.select2 + "select2.js"
  ]).pipe(concat("libs.js"))
    .pipe(gulp.dest(paths.dist_js))

gulp.task "copy_fonts", ->
  return gulp.src([paths.bootstrap + "fonts/*"]).pipe gulp.dest("./dist/fonts/")

gulp.task "copy_images", ->
  gulp.src([
    paths.select2 + "*.png"
    paths.select2 + "*.gif"
  ]).pipe gulp.dest(paths.dist_css)

gulp.task "index_css", ->
  return gulp.src("./src/index.css")
    .pipe(rework(reworkNpm("./src/")))
    .pipe gulp.dest(paths.dist_css)

gulp.task 'copy_assets', ->
  return gulp.src("assets/**/*")
    .pipe(gulp.dest('dist/'))

gulp.task "watch", ->
  return gulp.watch paths.src, ["build"]

gulp.task "build", [
  # "coffee"
  "browserify"
  "libs_js"
  "libs_css"
  "copy_images"
  "copy_fonts"
  "copy_assets"
  "index_css"
  # "copy_to_lib"
]

gulp.task "default", ["build"]

# Shim non-browserify friendly libraries to allow them to be 'require'd
shim = (instance) ->
  shims = {
    jquery: './jquery-shim'
    lodash: './lodash-shim'
    underscore: './lodash-shim'
    backbone: './backbone-shim' 
  }

  # Add shims
  for name, path of shims
    instance.require(path, {expose: name})

  return instance

# gulp.task "prepublish", ['coffee', 'copy_to_lib']

# gulp.task 'deploy_demo', ['demo'], ->
#   # Read credentials
#   aws = JSON.parse(fs.readFileSync("/home/clayton/.ssh/aws-credentials.json"))
#   aws.bucket = "formdesigner.mwater.co"

#   publisher = awspublish.create(aws)
#   headers = {
#     'Cache-Control': 'no-cache, must-revalidate'
#     'Pragma': 'no-cache'
#     'Expires': '0'
#   }
  
#   return gulp.src('./dist/**/*.*')
#     .pipe(awspublish.gzip())
#     .pipe(publisher.publish(headers))
#     .pipe(publisher.cache())
#     .pipe(publisher.sync())    
#     .pipe(awspublish.reporter())

# gulp.task 'prepareTests', ->
#   files = glob.sync("./test/**/*Tests.coffee")
#   bundler = browserify({ entries: files, extensions: [".js", ".coffee"] })
#   return bundler.bundle()
#     .on('error', gutil.log)
#     .on('error', -> throw "Failed")
#     .pipe(streamConvert('browserified.js'))
#     .pipe(gulp.dest('./test'))

# gulp.task "copy_to_lib", ->
#   return gulp.src([
#     "src/**/*.hbs"
#     "src/**/*.css"
#   ]).pipe gulp.dest(paths.lib)

