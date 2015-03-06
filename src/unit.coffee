
#TODO
# Use http://api.mwater.co/v3/properties to get the properties for the units

exports.unitToString = (unit) ->
  if unit == "dissolved_oxygen_mg_per_L"
    return "mg/L"
  else if unit == "turbidity_JTU"
    return "JTU"
  else if unit == "temperature_C"
    return "°C"
  return ""