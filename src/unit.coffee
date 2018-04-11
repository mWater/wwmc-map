
# Hardcode units of the form (less complicated then making a query and fetching them with all the sub sections/questions
existingUnits =
  [
    {"id":"s4LKM6c","label":{"en":"\u00B0C","_base":"en"}},
    {"id":"CcGKk2e","label":{"en":"\u00B0F","_base":"en"}}
    {"id":"ZHb6JX2","label":{"en":"JTU","_base":"en"}},
    {"id":"AJT2jGZ","label":{"en":"NTU","_base":"en"}},
    {"id":"f555CvE","label":{"en":"cm","_base":"en"}}
    {"id":"TD1xCge","label":{"en":"\u00B0C","_base":"en"}},
    {"id":"tHNeSTm","label":{"en":"\u00B0F","_base":"en"}}
    {"id":"7Qh9S4R","label":{"en":"ppm","_base":"en"}},
    {"id":"VymS4Et","label":{"en":"mg/L","_base":"en"}}
    {"id":"p648Aws","label":{"en":"PSU","_base":"en"}},
    {"id":"7RdW2rL","label":{"en":"ppt","_base":"en"}},
    {"id":"anG4cLQ","label":{"en":"g/kg","_base":"en"}},
    {"id":"xCbEbJH","label":{"en":"mg/L","_base":"en"}},
    {"id":"hwwqNWg","label":{"en":"uS/cm","_base":"en"}}
    {"id":"GyEGcc9","label":{"en":"mg/L-N","_base":"en"}},
    {"id":"NHN3drA","label":{"en":"mg/L-NO3","_base":"en"}}
    {"id":"GyEGcc9","label":{"en":"mg/L-N","_base":"en"}},
    {"id":"NHN3drA","label":{"en":"mg/L-NO2","_base":"en"}}
    {"id":"ZpKrFN4","label":{"en":"mg/L-P","_base":"en"}},
    {"id":"z63Yxfm","label":{"en":"mg/L-PO3","_base":"en"}}
    {"id":"tEXD8lc","label":{"en":"$","_base":"en"}}
  ]

# measure is of no use with the new technique, but I've kept it just in case
exports.unitToString = (measure, unit) ->
  for existingUnit in existingUnits
    if unit == existingUnit.id
      return existingUnit.label['en']
  return ""
