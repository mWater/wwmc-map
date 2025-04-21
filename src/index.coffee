$ = require 'jquery'
_ = require 'lodash'
Backbone = require 'backbone'
L = require 'leaflet'

$ ->
  console.log "App started"
  
  # Initialize the map
  map = L.map 'map',
    center: [0, 0]
    zoom: 2
    
  # Add a basic tile layer (OpenStreetMap)
  L.tileLayer 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  .addTo(map)
