Tab = require('./Tab')
unitToString = require('./../unit').unitToString
moment = require 'moment'

durations = [
  {"id":"eJzaU1w","label":{"en":"5 minutes","_base":"en"}},
  {"id":"dBF76uD","label":{"en":"15 minutes","_base":"en"}},
  {"id":"sekt45H","label":{"en":"30 minutes","_base":"en"}},
  {"id":"jlCLQTQ","label":{"en":"1+ hour","_base":"en"}}
]

posterOptions = [
  { "id": "4gEt9hY","label": {"en": "Yes","_base": "en"}},
  { "id": "sxRjm6r", "label": {"en": "No","_base": "en"}}
]

beachOptions = [
  { "id": "G15wjwt","label": {"en": "pounds","_base": "en"}},
  { "id": "pka2kmE", "label": {"en": "kilograms","_base": "en"}}
]

stormDrainOptions = [
  { "id": "yjExEDy","label": {"en": "pounds","_base": "en"}},
  { "id": "zrbqMpW", "label": {"en": "kilograms","_base": "en"}}
]


affiliations = [
  { "id": "vbvSy2S", "label": { "en": "School", "_base": "en" }},
  { "id": "CdbSvWD", "label": { "en": "Organization", "_base": "en"}},
  { "id": "vShkZmm", "label": { "en": "Group name", "_base": "en" }},
  { "id": "78q4BkC", "label": { "en": "None", "_base": "en" }}
]

# Mapping from action IDs to human-readable labels
ACTION_LABELS = {
  'flushing': 'Flushing',
  'TKdfEkd': 'Beach/river cleanup',
  'ASR2hr3': 'Storm Drain Activity',
  'lSTK7fU': 'Education',
  'NzRwvgQ': 'Tree planting',
  'f1PswKP': 'Habitat Restoration',
  'B5pN6Yc': 'Other (please specify)'
}

module.exports = class WaterActionTab extends Tab
  constructor: (content) ->
    super(content)
    @actions = []

  initialize: ->
    @content.html(require("./WaterActionTab.hbs")())

    @subContent = @content.find("#subContent")

    @content.find("#waterActionSelector").on 'change', (e) =>
      selected = $('#waterActionSelector option').filter(':selected')[0].value
      @render(selected)

    @render('plogging')

  setActionsData: (actions) ->
    @actions = actions
    @render()

  render: ->
    data = []
    for action in @actions
      data.push {
        date: if action.date.length <= 10 then moment(action.date, moment.ISO_8601).format("ll") else moment(action.date, moment.ISO_8601).format("lll"),
        action_type: ACTION_LABELS[action.action_type] || action.action_type,
        participants: action.participants,
        response: action.response,
        form: action.form
      }
    @content.html(require("./WaterActionTable.hbs")({ data: data, hasNoData: data.length == 0 }))

    # Attach click handler for modal
    _this = this
    @content.find('.view-details').off('click').on('click', (e) ->
      e.preventDefault()
      idx = parseInt($(e.currentTarget).data('index'))
      action = _this.actions[idx]
      _this.showActionModal(action)
    )

  showActionModal: (action) ->
    # Remove any existing modal
    $('#waterActionModal').remove()
    html = ''
    if action.form == 'flushing' or action.form == '2e5325c13c80416db098e77a14eef2c3'
      data = action.response.data
      # Affiliation mapping
      affiliationMap = {
        'vbvSy2S': 'School',
        'CdbSvWD': 'Organization',
        'vShkZmm': 'Group name',
        '78q4BkC': 'None'
      }
      posterMap = {
        '4gEt9hY': 'Yes',
        'sxRjm6r': 'No'
      }
      affiliation = affiliationMap[data['b907c273299a40c8afbfa0fb00ec63bf']?.value] or ''
      affiliationName = data['29814a936c6941c7b16a4c8803412f31']?.value or ''
      poster = posterMap[data['cbe19b8328374cb38da6494ba922f0f3']?.value] or ''
      posterImages = data['f41bcf066ccf41598a6decf8f0624984']?.value or []
      posterImgTag = ''
      if posterImages.length > 0 and posterImages[0]?.id?
        posterImgTag = "<div class='text-center mt-3'><img class='img-thumbnail' src='https://api.mwater.co/v3/images/#{posterImages[0].id}?h=200' style='max-height:200px' onerror=\"this.onerror=null;this.src='img/no-image-icon.jpg';\"></div>"
      html = """
      <div class='modal fade' id='waterActionModal' tabindex='-1' role='dialog'>
        <div class='modal-dialog' role='document'>
          <div class='modal-content'>
            <div class='modal-header bg-primary text-white py-2 px-3 d-flex align-items-center'>
              <h4 class='modal-title mb-0 mr-auto'>Flushing Challenge Details</h4>
            </div>
            <div class='modal-body p-3'>
              <div class='row mb-3'>
                <div class='col-md-6'>
                  <div class='card h-100'>
                    <div class='card-body p-3'>
                      <h5 class='card-title'>Event Information</h5>
                      <p class='card-text mb-2'><strong>Date:</strong> #{moment(action.date).format('ll')}</p>
                      <p class='card-text mb-0'><strong>Participants:</strong> #{action.participants or 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div class='col-md-6'>
                  <div class='card h-100'>
                    <div class='card-body p-3'>
                      <h5 class='card-title'>Organization Details</h5>
                      <p class='card-text mb-2'><strong>Affiliation:</strong> #{affiliation or 'N/A'}</p>
                      <p class='card-text mb-0'><strong>Affiliation Name:</strong> #{affiliationName or 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class='row'>
                <div class='col-md-6'>
                  <div class='card'>
                    <div class='card-body p-3'>
                      <h5 class='card-title'>Poster Information</h5>
                      <div class='px-3'>
                        <p class='card-text mb-3'><strong>Poster Created:</strong> #{poster or 'N/A'}</p>
                        #{posterImgTag}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class='modal-footer py-2 px-3'>
              <button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button>
            </div>
          </div>
        </div>
      </div>
      """
    else if action.form == 'd1c360082dfc46b9bb1fd0ff582d6c06' or action.form == '3203d0e5b2ec47418fc7a37466dff7ba'
      data = action.response.data
      html = """
      <div class='modal fade' id='waterActionModal' tabindex='-1' role='dialog'>
        <div class='modal-dialog' role='document'>
          <div class='modal-content'>
            <div class='modal-header bg-primary text-white py-2 px-3'>
              <h4 class='modal-title mb-0'>Action Details</h4>
              <button type='button' class='close text-white' data-dismiss='modal'>&times;</button>
            </div>
            <div class='modal-body p-3'>
              <div class='row mb-3'>
                <div class='col-md-6'>
                  <div class='card h-100'>
                    <div class='card-body p-3'>
                      <h5 class='card-title'>Event Information</h5>
                      <p class='card-text mb-2'><strong>Date:</strong> #{moment(action.date).format('ll')}</p>
                      <p class='card-text mb-2'><strong>Action Type:</strong> #{ACTION_LABELS[action.action_type] or action.action_type}</p>
                      <p class='card-text mb-0'><strong>Participants:</strong> #{action.participants or 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div class='col-md-6'>
                  <div class='card h-100'>
                    <div class='card-body p-3'>
                      <h5 class='card-title'>Impact Details</h5>
      """
      # Field IDs for each form
      isVisit = action.form == 'd1c360082dfc46b9bb1fd0ff582d6c06'
      isPlogging = action.form == '3203d0e5b2ec47418fc7a37466dff7ba'
      
      # Beach/river cleanup
      if action.action_type == 'TKdfEkd'
        # --- Event Duration (action form only) ---
        durationVal = data['b8041344dc9f4ad39fde730feee52808']?.value
        durationLabel = ''
        if durationVal?
          durationMap = {
            'KkyCEUK': '5 minutes',
            '7kbp1Qf': '15 minutes',
            'NacqJvl': '30 minutes',
            'RA1sWJE': '1+ hour'
          }
          durationLabel = durationMap[durationVal] or durationVal
          html += "<p class='card-text mb-2'><strong>Event Duration:</strong> #{durationLabel}</p>"

        # --- Distance of clean-up (unit question, action form only) ---
        distanceObj = data['ded3045bbb394616b5c9138a254e25ff']
        distance = if distanceObj?.value? then distanceObj.value.quantity else distanceObj?.quantity
        distanceUnits = if distanceObj?.value? then distanceObj.value.units else distanceObj?.units
        distanceLabel = if distanceUnits == 'c7nLyvE' then 'miles' else if distanceUnits == 'mFk9XEy' then 'kilometers' else ''
        if distance?
          html += "<p class='card-text mb-2'><strong>Distance of Clean-up:</strong> #{distance} #{distanceLabel}</p>"

        # --- Total estimated weight (matrix for action form, direct for visit form) ---
        weight = null
        weightUnits = null
        unitLabel = ''
        if isPlogging
          # Action form: matrix structure
          matrix = data['ac2fd2bbd74e47ccb0dd305d45c90927']?.value
          beachRow = if matrix? then matrix['UCxBANG'] else undefined
          beachWeightObj = if beachRow? then beachRow['f326ecae8ca949789d553b4673425431'] else undefined
          weight = if beachWeightObj?.value? then beachWeightObj.value.quantity else beachWeightObj?.quantity
          weightUnits = if beachWeightObj?.value? then beachWeightObj.value.units else beachWeightObj?.units
        else if isVisit
          # Visit form: direct
          weightObj = data['f326ecae8ca949789d553b4673425431']
          weight = if weightObj?.value? then weightObj.value.quantity else weightObj?.quantity
          weightUnits = if weightObj?.value? then weightObj.value.units else weightObj?.units
        if weightUnits
          opt = beachOptions.find((o) -> o.id == weightUnits)
          unitLabel = opt?.label?.en or ''
        if weight?
          html += "<p class='card-text mb-2'><strong>Total Estimated Weight:</strong> #{weight} #{unitLabel}</p>"
      
      # Storm Drain Activity
      if action.action_type == 'ASR2hr3'
        markedDrains = data['f9560b5ee5db4586b365820f8d8d22ee']?.value
        numDrains = data['51b5bf0208a344b48b108ae4b7349e5d']?.value
        debrisObj = data['8dbc1755488e4f919423984da96cb895']
        debrisQuantity = if debrisObj?.value? then debrisObj.value.quantity else debrisObj?.quantity
        debrisUnits = if debrisObj?.value? then debrisObj.value.units else debrisObj?.units
        debrisLabel = ''
        if debrisUnits
          opt = stormDrainOptions.find((o) -> o.id == debrisUnits)
          debrisLabel = opt?.label?.en or ''
        if markedDrains == 'jm5akUr'
          html += "<p class='card-text mb-2'><strong>Storm Drains Marked:</strong> Yes</p>"
          if numDrains?
            html += "<p class='card-text mb-2'><strong>Number of Drains Marked:</strong> #{numDrains}</p>"
        if debrisQuantity?
          html += "<p class='card-text mb-2'><strong>Storm Drain Debris Collected:</strong> #{debrisQuantity} #{debrisLabel}</p>"
        
      # Tree planting
      if action.action_type == 'NzRwvgQ'
        trees = if isVisit then data['626fd436c5ea48fb9ada22094eea9005']?.value else data['cb972ebaf6ac45718eea988160f2c6f8']?.value
        treeTypes = data['2269cd7772e34286b43d36ab84b5ecf4']?.value
        nativeSpecies = if isVisit then data['9c1e366f1c234381884bfe5df94a4264']?.value else data['420079c0c9834ae0b4abd2d21a7ab452']?.value
        speciesPlanted = data['65eed5ce68be42a9ba9d23e4ae1f724b']?.value
        if trees?
          html += "<p class='card-text mb-2'><strong>Trees Planted:</strong> #{trees}</p>"
        if treeTypes?
          html += "<p class='card-text mb-2'><strong>Types of Trees:</strong> #{treeTypes}</p>"
        if nativeSpecies?
          html += "<p class='card-text mb-2'><strong>Native Species Planted:</strong> #{if nativeSpecies == 'KYDFjR8' then 'Yes' else 'No'}</p>"
        if speciesPlanted?
          html += "<p class='card-text mb-0'><strong>Species Planted:</strong> #{speciesPlanted}</p>"
      
      # Habitat Restoration
      if action.action_type == 'f1PswKP'
        areaRestoredObj = data['098c2f20637d4468ad5403439ce84983']
        areaRestored = if areaRestoredObj?.value? then areaRestoredObj.value.quantity else areaRestoredObj?.quantity
        if areaRestored?
          html += "<p class='card-text mb-2'><strong>Area of Habitat Restored:</strong> #{areaRestored} m²</p>"
        invasivesRemoved = data['91b2ec06b678413d89ff6a2afcece01f']?.value
        if invasivesRemoved == 'jzfqdme'
          html += "<p class='card-text mb-2'><strong>Invasive Species Removed:</strong> Yes</p>"
          invasiveSpecies = data['1c8cf5b3d5ce40538eff1dbde4e271eb']?.value
          invasiveSpeciesList = data['ecbc3a42f3ca4ef888c0cc30fa9f05af']?.value
          if invasiveSpecies?
            if Array.isArray(invasiveSpecies)
              html += "<p class='card-text mb-2'><strong>Types of Invasive Species Removed:</strong> #{invasiveSpecies.join(', ')}</p>"
            else
              html += "<p class='card-text mb-2'><strong>Types of Invasive Species Removed:</strong> #{invasiveSpecies}</p>"
          if invasiveSpeciesList?
            if Array.isArray(invasiveSpeciesList)
              html += "<p class='card-text mb-2'><strong>Invasive Species Removed (List):</strong> #{invasiveSpeciesList.join(', ')}</p>"
            else
              html += "<p class='card-text mb-2'><strong>Invasive Species Removed (List):</strong> #{invasiveSpeciesList}</p>"
          areaRestoredInvasivesObj = data['01a17e04ec574517b7d9d71c8dfe0c2a']
          areaRestoredInvasives = if areaRestoredInvasivesObj?.value? then areaRestoredInvasivesObj.value.quantity else areaRestoredInvasivesObj?.quantity
          if areaRestoredInvasives?
            html += "<p class='card-text mb-0'><strong>Area Restored from Invasives:</strong> #{areaRestoredInvasives} m²</p>"
        # Always show 'What species did you plant?'
        speciesPlanted = data['65eed5ce68be42a9ba9d23e4ae1f724b']?.value
        if speciesPlanted?
          html += "<p class='card-text mb-0'><strong>Species Planted:</strong> #{speciesPlanted}</p>"
      
      # Other action type
      if action.action_type == 'B5pN6Yc'
        # For action form
        if isPlogging
          otherAction = data['646a5d4f22ba4b9f81e03061df5e655d']?.specify?.B5pN6Yc
        else if isVisit
          otherAction = data['2597aa0b0ae940a6b71a7d3aa87a4776']?.specify?.B5pN6Yc

        if otherAction?
          html += "<p class='card-text mb-0'><strong>Other Action (Specify):</strong> #{otherAction}</p>"
        
      html += """
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class='modal-footer py-2 px-3'>
              <button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button>
            </div>
          </div>
        </div>
      </div>
      """
    else
      # Simple details for other actions
      html = """
      <div class='modal fade' id='waterActionModal' tabindex='-1' role='dialog'>
        <div class='modal-dialog' role='document'>
          <div class='modal-content'>
            <div class='modal-header bg-primary text-white py-2 px-3'>
              <h4 class='modal-title mb-0'>Action Details</h4>
              <button type='button' class='close text-white' data-dismiss='modal'>&times;</button>
            </div>
            <div class='modal-body p-3'>
              <div class='row mb-3'>
                <div class='col-md-6'>
                  <div class='card h-100'>
                    <div class='card-body p-3'>
                      <h5 class='card-title'>Event Information</h5>
                      <p class='card-text mb-2'><strong>Date:</strong> #{moment(action.date).format('ll')}</p>
                      <p class='card-text mb-2'><strong>Action Type:</strong> #{ACTION_LABELS[action.action_type] or action.action_type}</p>
                      <p class='card-text mb-0'><strong>Participants:</strong> #{action.participants or 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div class='col-md-6'>
                  <div class='card h-100'>
                    <div class='card-body p-3'>
                      <h5 class='card-title'>Response Data</h5>
                      <pre class='card-text mb-0' style='background:#f8f8f8;max-height:200px;overflow:auto;'>#{JSON.stringify(action.response, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class='modal-footer py-2 px-3'>
              <button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button>
            </div>
          </div>
        </div>
      </div>
      """
    # Append and show modal
    $('body').append(html)
    $('#waterActionModal').modal('show')

  setLoading: ->
    @content.html("""
      <div class='text-center' style='padding: 40px 0;'>
        <div class='spinner-border text-primary' role='status'>
          <span class='sr-only'>Loading...</span>
        </div>
        <p class='mt-2 text-muted'>Loading water actions...</p>
      </div>
    """)
