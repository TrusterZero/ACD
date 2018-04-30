let userId = 0;

let lastClickedLocation
let aoiActive = false;
let aoiBorderTrail = [];
let lockingAoi = false;
let newAoiId = null
let newCoordinates = [
  []
];
let selectedAoi = {}

let loadAois = (aois) => {
  aois.forEach((aoi) => {
    $("#aoiList").append($(`<li id="li-${aoi.geoJson.properties.name}" onclick=aoiListClick("${aoi.geoJson.properties.id}")><input type='button' name='${aoi.geoJson.properties.name}' value='${aoi.geoJson.properties.name}'></li>`))
    console.log(aoi.geoJson.properties.changes)
    let layer = myAOI.addData(aoi.geoJson)
    myAOI.on("click", (event) => {
      if (!aoiSelectionMode && !lockingAoi) {
        selectedAoi.id = event.layer.feature.properties.id
        showAoiInfo(selectedAoi.id)
      }
    })
  })
  myAOI.eachLayer((layer) => {
    if (layer.feature.properties.changes == "true") {//notify user that changes have been detected in the AOI
      layer.setStyle({
        fillColor: "red"
      })
    } else {
      layer.setStyle({
        fillColor: "green"
      })
    }
  })
}

let aoiListClick = (id) => {
  selectedAoi.id = id
  showAoiInfo(id)
}

let showAoiInfo = (selectedId) => {
  resetAoiSelection()
  map.dragging.disable()
  map.scrollWheelZoom.disable()
  if (selectedId == "new") { //If the AOI is new show the new aoi creation form else show the information about the aoi
    $("#newAoiForm").show()
    $(".aoiDetails").hide()
  } else {
    $("#newAoiForm").hide()
    $(".aoiDetails").show()
    myAOI.eachLayer((layer) => {
      if (layer.feature.properties.id == selectedAoi.id) {
        selectedAoi.originalImage = layer.feature.properties["or-path"]
        selectedAoi.changesImage = layer.feature.properties["ch-path"]
        selectedAoi.newImage = layer.feature.properties["new-path"]
        $(".aoiInfoTitle").html(layer.feature.properties.name)
        if (layer.feature.properties["new-path"] == "") {
          $("#aoiInfoText").hide()
          $("#noData").show()
          $("#showChanges").hide()
        } else {
          $("#aoiInfoText").show()
          $("#noData").hide()
          $("#showChanges").show()
        }
      }
    })
  }
  myAOI.eachLayer((layer) => {
    id = layer.feature.properties.id
    if (id == selectedAoi.id) {
      layer.setStyle({
        color: "yellow"
      })
      bounds = layer.getBounds() != null ? layer.getBounds().getCenter() : "";
      map.flyTo({
        "lat": bounds.lat,
        "lng": bounds.lng + 0.03
      }, 13)
      $(".aoiInfo").css({
        "display": "initial"
      }).animate()
    }
  })
}

//Stops the creation of a new AOI
let cancelAoi = () => {
  resetAoiSelection()
  myAOI.eachLayer((layer) => {
    sendAlert("Area deleted")
    lockingAoi = false;
    if (layer.feature.properties.id == newAoiId) {
      myAOI.removeLayer(layer)
    }
  })
}


let startAoiSelection = (selectionLayer) => {
  map.on("click", (locationData) => {
    if (!aoiActive && !lockingAoi) {
      $("#undo-selection").css("display", "initial")
      L.circle(locationData.latlng, {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.5,
          radius: 50,
        })
        .addTo(selectionLayer)
        .on('click', lockAoi);
      aoiActive = true;
    } else if (!lockingAoi) {
      lastClickedLocation = aoiBorderTrail[aoiBorderTrail.length - 1]
      selectionLayer.addData({
        "type": "Feature",
        "properties": {
          "id": aoiBorderTrail.length //ID used for possible undoing this step
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [lastClickedLocation.latlng.lng, lastClickedLocation.latlng.lat],
            [locationData.latlng.lng, locationData.latlng.lat]
          ]
        }
      })
    }
    if (!lockingAoi) {
      newCoordinates[0].push([locationData.latlng.lng, locationData.latlng.lat])
      aoiBorderTrail.push(locationData)
    }
  });
  sendAlert("Click to start area selection")
  $(".optionButton #aoi-selection").css("border-color", "white")
  map.dragging.disable()
  map.scrollWheelZoom.disable()
}

//Resets all values used to describe an AOI
let resetAoiSelection = () => {
  myAOI.setStyle({
    color: "cyan"
  })
  map.dragging.enable()
  map.scrollWheelZoom.enable()
  $(".aoiInfo").hide()
  $(".aoiInfoTitle").html("New Aoi")
  $("#aoiName").val("")
  $("#undo-selection").css("display", "none")
  $("#satImage").panzoom("reset");

  lastClickedLocation = null
  newCoordinates = [
    []
  ]
  aoiActive = false;
  aoiBorderTrail = [];
}

let lockAoi = () => {
  if (newCoordinates[0].length > 2) {
    lockingAoi = true;
    newCoordinates[0].push(newCoordinates[0][0]) //making sure that the polygon ends at the starting latlng
    $("#undo-selection").css("display", "none")
    newAoiId = `R-${userId}-${guid()}`
    selectedAoi.id = newAoiId
    selectionLayer.clearLayers();
    myAOI.addData({
      "type": "Feature",
      "properties": {
        "id": newAoiId
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": newCoordinates
      }
    })
    showAoiInfo("new")
  }
}

let endAoiSelection = () => {
  $(".aoiInfo").css({
    "display": "none"
  }).animate()
  if (lockingAoi) {
    myAOI.eachLayer((layer) => {
      if (layer.feature.properties.id == newAoiId) {
        myAOI.removeLayer(layer)
      }
      lockAoi = false;
    })
  }
  resetAoiSelection()
  selectionLayer.clearLayers()
  sendAlert("Click and drag to move around the map")
  $(".optionButton #aoi-selection").css("border-color", "transparent")
  map.dragging.enable()
  map.scrollWheelZoom.enable()
  map.off('click')
}

//On CTRL Z run Undo line creation
$(document).keydown(function (e) {
  if (e.which === 90 && e.ctrlKey && aoiSelectionMode && newCoordinates != [
      []
    ]) {
    undoSelection()
  }
})



//Undo The last borderline created
let undoSelection = () => {
  selectionLayer.eachLayer((layer) => {
    if (layer.feature != null) {
      //The place of the borderline in the array is saved as the ID during the creating process
      if (layer.feature.properties.id == aoiBorderTrail.length - 1) {
        selectionLayer.removeLayer(layer)
        newCoordinates[0].pop()
        aoiBorderTrail.pop()
      }
      //If There is no border yet the starting point of the aoi is removed
    } else if (aoiBorderTrail.length == 1) {
      selectionLayer.removeLayer(layer);
      newCoordinates[0].pop()
      aoiBorderTrail.pop()
      aoiActive = false;
    }
  })
}

//Creates a random id
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}