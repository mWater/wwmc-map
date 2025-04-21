_ = require 'lodash'
path = require 'path'
gulp = require 'gulp'
gutil = require 'gulp-util'
browserify = require 'browserify'
source = require 'vinyl-source-stream'
concat = require 'gulp-concat'
rework = require 'gulp-rework'
reworkNpm = require 'rework-npm'
awspublish = require 'gulp-awspublish'
fs = require 'fs'
webpack = require('webpack')
WebpackDevServer = require 'webpack-dev-server'

publishBucket = (bucket) ->
  # Read credentials
  aws = JSON.parse(fs.readFileSync("../aws-credentials.json"))
  aws.params = { Bucket: bucket }

  publisher = awspublish.create(aws)
  headers = { 'Cache-Control': 'no-cache, must-revalidate' }
  
  return gulp.src('./dist/**')
    .pipe(awspublish.gzip())
    .pipe(publisher.publish(headers))
    .pipe(publisher.cache())
    .pipe(publisher.sync())    
    .pipe(awspublish.reporter())


makeWebpackConfig = -> {
  entry: ['./src/index.coffee']
  devtool: "eval"
  output: {
    filename: 'index.js'
    path: path.resolve(__dirname, 'dist', 'js')
  }
  module: {
    rules: [
      {
        test: /\.coffee$/
        use: [ 'coffee-loader' ]
      }
      {   
        test: /\.hbs$/
        loader: "handlebars-loader" 
      }
    ]
  }
  resolve: {
    extensions: [".coffee", ".js", ".json"]
  }
  externals: {
    'jquery': 'jQuery'
    'lodash': 'window._'
    'underscore': 'window._'
    'backbone': 'window.Backbone'
    'leaflet': 'L'
  }
}

gulp.task 'webpack_release', (done) ->
  webpackConfig = makeWebpackConfig()
  # Remove mode which isn't supported in Webpack 2
  # webpackConfig.mode = "production"
  webpackConfig.devtool = 'source-map'

  webpack(webpackConfig).run (error, stats) ->
    if error
      gutil.log("Error", error)
    else
      done()

gulp.task 'webpack_watch', ->
  webpackConfig = makeWebpackConfig()
  # Remove mode which isn't supported in Webpack 2
  # webpackConfig.mode = "development"
  webpackConfig.output.publicPath = 'http://localhost:3001/js/'
  webpackConfig.entry.unshift('webpack-dev-server/client?http://localhost:3001')

  compiler = webpack(webpackConfig)
  new WebpackDevServer(compiler, { contentBase: "dist", publicPath: "/js/" }).listen 3001, "localhost", (err) =>
    if err 
      throw new gutil.PluginError("webpack-dev-server", err)
    gutil.log("[webpack-dev-server]", "http://localhost:3001/index.html")


gulp.task "browserify", ->
  shim(browserify("./index.coffee",
    extensions: [".coffee"]
    basedir: "./src/"
  )).bundle()
  .on("error", gutil.log)
  .pipe(source("index.js"))
  .pipe gulp.dest("./dist/js/")

gulp.task "libs_css", ->
  return gulp.src([
    "bower_components/bootstrap/dist/css/bootstrap.css"
    "bower_components/bootstrap/dist/css/bootstrap-theme.css"
    "bower_components/select2/select2.css"
    "bower_components/select2-bootstrap3-css/select2-bootstrap.css"
    "bower_components/leaflet/dist/leaflet.css"
    'vendor/esri/esri-leaflet-geocoder.css'
  ]).pipe(concat("libs.css"))
    .pipe(gulp.dest("./dist/css/"))

gulp.task "libs_js", ->
  return gulp.src([
    "bower_components/jquery/dist/jquery.js"
    "bower_components/lodash/dist/lodash.js"
    "bower_components/backbone/backbone.js"
    "bower_components/bootstrap/dist/js/bootstrap.js"
    "bower_components/select2/select2.js"
    "bower_components/leaflet/dist/leaflet-src.js"
    "bower_components/leaflet-plugins/layer/tile/Bing.js"
    "bower_components/Chart.js/Chart.min.js"
    "vendor/Leaflet.utfGrid.js"
    'vendor/esri/esri-leaflet-core.js'
    'vendor/esri/esri-leaflet-geocoder.js'
  ]).pipe(concat("libs.js"))
    .pipe(gulp.dest("./dist/js/"))

gulp.task 'copy_esri_images', ->
  return gulp.src("vendor/esri/img/*")
  .pipe(gulp.dest('dist/css/img/'))

gulp.task "copy_fonts", ->
  return gulp.src(["bower_components/bootstrap/dist/fonts/*"]).pipe(gulp.dest("./dist/fonts/"))

gulp.task 'copy_leaflet_images', ->
  return gulp.src("bower_components/leaflet/images/*")
  .pipe(gulp.dest('dist/css/images/'))

gulp.task "copy_select2_images", ->
  gulp.src([
    "bower_components/select2/*.png"
    "bower_components/select2/*.gif"
  ]).pipe(gulp.dest("./dist/css/"))

gulp.task "index_css", ->
  return gulp.src("./src/index.css")
    .pipe(rework(reworkNpm("./src/")))
    .pipe gulp.dest("./dist/css/")

gulp.task 'copy_assets', ->
  return gulp.src("assets/**/*")
    .pipe(gulp.dest('dist/'))

gulp.task "build", [
  "webpack_release"
  "libs_js"
  "libs_css"
  "copy_select2_images"
  "copy_leaflet_images"
  "copy_fonts"
  "copy_assets"
  "index_css"
  "copy_esri_images"
]

gulp.task "watch", ["build"], ->
  gulp.start "webpack_watch"

gulp.task "deploy", ["build"], ->
  publishBucket("wwmc-map.mwater.co")
  .on 'end', ->
    publishBucket("map.monitorwater.org")

gulp.task "default", ["build"]

# Shim non-browserify friendly libraries to allow them to be 'require'd
shim = (instance) ->
  shims = {
    jquery: './jquery-shim'
    lodash: './lodash-shim'
    underscore: './lodash-shim'
    backbone: './backbone-shim'
    leaflet: './leaflet-shim'
  }

  # Add shims
  for name, path of shims
    instance.require(path, {expose: name})

  return instance
