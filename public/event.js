//Aoi Pop up Option Menu
$("#aoiName").on("keyup", () => {
  if ($("#aoiName").val() != "") {
    $("#new-aoiInfoTitle").html($("#aoiName").val())
  } else {
    $("#new-aoiInfoTitle").html("New AOI")
  }
})
$("#cancelAoi").on("click", () => {
  choiceCheck("Are you sure?", () => cancelAoi(), "none")
})
$("#deleteAoi").on("click", () => {
  myAOI.eachLayer((layer) => {
    if (layer.feature.properties.id == selectedAoi.id) {
      console.log(layer.feature.properties.id + "," + layer.feature.properties.name)
      choiceCheck("Are you sure?", () => deleteAoi(selectedAoi.id), "none")
    }
  })
})
$("#showChanges").on("click", () => {
  myAOI.eachLayer((layer) => {
    if (layer.feature.properties.id == selectedAoi.id) {
      $("#satImage").attr("src", selectedAoi.changesImage)
      $(".full-image-box").show()
    }
  })
})
$("#closeAoi").on("click", () => {
  resetAoiSelection()
})
$("#newAoiForm").on("click", "#saveAoi", () => {
  console.log("clicked")
  myAOI.eachLayer((layer) => {
    if (layer.feature.properties.id == newAoiId) {
      layer.on("click", (layer) => {
        showAoiInfo(id)
      })
      if ($("#aoiName").val() == "") {
        sendAlert("Please name AOI")
      } else {
        console.log($('input[name=detectionType]:checked').val())
        saveRequest(layer.feature, $("#aoiName").val(),$('input[name=detectionType]:checked').val())
        $("#aoiList").append($(`<li id="li-${$("#aoiName").val()}" onclick=aoiListClick("${newAoiId}")><input type='button' name='${$("#aoiName").val()}' value='${$("#aoiName").val()}'></li>`))
        lockingAoi = false;
        newAoiId = 0;
        switchViewMode()
        $(".aoiInfo").css({
          "display": "none"
        }).animate()
      }
    }
  })
})

//Sat image view options
$("#closeFullImage").on("click", () => {
  $(".full-image-box").hide()
})
$("#changesImageButton").on("click", ()=>{$("#satImage").attr("src", selectedAoi.changesImage)})
$("#originalImageButton").on("click", ()=>{$("#satImage").attr("src", selectedAoi.originalImage)})
$("#newImageButton").on("click", ()=>{$("#satImage").attr("src", selectedAoi.newImage)})

//Log in options
$("#loginButton").on("click", () => {
  if ($("#apiKeyTextBox").val() != "") {
    //userId = $("#apiKeyTextBox").val()
    loadMap($("#apiKeyTextBox").val());
    $("#shader").hide()
    $("#aoiList").show()
    $(".userInterface").show()
    $("#aoiInfo").hide()
    $("#loginPrompt").hide()
    $("#undo-selection").hide()
    getAois()
  } else {
    sendAlert("Please fill in your API key")
  }
})