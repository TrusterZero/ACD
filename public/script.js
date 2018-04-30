$("#shader").css("display", "initial")
$("#loginPrompt").show()
$(".userInterface").hide()

let aoiSelectionMode = false;
let map = L.map('map', {
  zoomControl: false,
}).setView([51.545, -0.09], 13);
let myAOI = L.geoJSON().addTo(map);
let selectionLayer = L.geoJSON().addTo(map);


loadMap = (apiKey) => {
  L.tileLayer(`https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_2018_01_mosaic/gmap/{z}/{x}/{y}.png?api_key=${apiKey}`, {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://planet.com">Planet</a>',
    maxZoom: 15,

  }).addTo(map);
}

let switchViewMode = () => { //Switches between AOI selection and AOI view Mode
  aoiSelectionMode = !aoiSelectionMode
  if (aoiSelectionMode) {
    startAoiSelection(selectionLayer)
  } else {
    endAoiSelection()
  }
}

moveToLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      map.flyTo({
        "lng": position.coords.longitude,
        "lat": position.coords.latitude
      })
    });
  }
}

//Used to create a pop up message with customisable reaction on the Yes and No clicks
let choiceCheck = (message, onYes, onNo) => {
  $("#shader").css("display", "initial")
  $("#choiceCheckHolder").css("display", "initial")
  $("#choiceCheckMessage").html(message)
  if (onYes == "none") {
    $("#choiceCheckYes").one("click", () => {
      $("#choiceCheckHolder").hide()
      $("#shader").css("display", "none")
    })
  } else {
    $("#choiceCheckYes").one("click", () => {
      onYes()
      $("#choiceCheckYes").off().click(function () {}) //Had issues with method firing multiple times this fixes it
      $("#choiceCheckHolder").hide()
      $("#shader").css("display", "none")
    })
  }
  if (onNo == "none") {
    $("#choiceCheckNo").one("click", () => {
      $("#choiceCheckHolder").hide()
      $("#choiceCheckNo").off().click(function () {})
      $("#shader").css("display", "none")
    })
  } else {
    $("#choiceCheckNo").on("click", () => {
      onNo()
      $("#choiceCheckHolder").hide()
      $("#shader").css("display", "none")
    })
  }
}

let sendAlert = (alert) => {
  // Get the snackbar DIV
  let x = document.getElementById("snackbar")
  $("#message").text(alert)
  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 3000);
}
$(document).ready(function () {
  $("#satImage").panzoom({
    minScale: 0.4,
  });
  $("#satImage").panzoom("zoom", 0.4, { silent: true });
  $("#satImage").on('mousewheel', function (event) {

    event.preventDefault()
    if (event.deltaY > 0) {
      $("#satImage").panzoom("zoom")
    } else {
      $("#satImage").panzoom("zoom", true)
    }
  });
});

