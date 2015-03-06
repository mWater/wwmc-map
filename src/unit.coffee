
cachedProperties = []
$.getJSON("http://api.mwater.co/v3/properties", (properties) =>
  cachedProperties = properties
)

exports.unitToString = (measure, unit) ->
  for property in cachedProperties
    if measure == property.code
      for propertyUnit in property.units
        if unit == propertyUnit.code
          return propertyUnit.symbol
  return ""