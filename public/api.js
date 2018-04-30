

const url = "http://13.59.83.47:8002"
let xhttp = new XMLHttpRequest();


let getAois = () => {
  let xhttp = new XMLHttpRequest();
  xhttp.open("POST", `${url}/get_aois`)
  xhttp.setRequestHeader("content-type", "application/json")
  request = {
    "userId": userId
  }

  xhttp.onreadystatechange = function () { //Call a function when the state changes.
    if (xhttp.readyState == XMLHttpRequest.DONE && xhttp.status == 200) {
      loadAois(JSON.parse(xhttp.response))
    }
  }
  xhttp.send(JSON.stringify(request))
}

let deleteAoi = (id) => {
  xhttp.open("POST", `${url}/delete_aoi`)
  xhttp.setRequestHeader("content-type", "application/json")
  xhttp.send(JSON.stringify({"userId": userId , "id": id}))
  console.log(`just sent out ${id}`)
  xhttp.onreadystatechange = function () { //Call a function when the state changes.
    if (xhttp.readyState == XMLHttpRequest.DONE && xhttp.status == 200) {      
      myAOI.eachLayer((layer)=>{
        if(layer.feature.properties.id == id){
          $(`#li-${layer.feature.properties.name}`).remove()
          map.dragging.enable()
          map.scrollWheelZoom.enable()
          myAOI.removeLayer(layer)
          sendAlert(`deleted "${$("#aoiInfoTitle").html()}"`)
          $(".aoiInfo").hide()
        }
      })
    }
  }
}

let saveRequest = (feature, aoiName,detectionType) => {
  let xhttp = new XMLHttpRequest();
  xhttp.open("POST", `${url}/save_request`)
  xhttp.setRequestHeader("content-type", "application/json")
  feature.properties.name = aoiName
  request = {
    "userId": userId,
    "detectionType": detectionType ,
    "changes": false,
    "status": "sending to server",
    "geoJson": feature
  }
  console.log(request)

  xhttp.send(JSON.stringify(request))

  xhttp.onreadystatechange = function () { //Call a function when the state changes.
    if (xhttp.readyState == XMLHttpRequest.DONE && xhttp.status == 200) {
      sendAlert(`Saving "${aoiName}" ${xhttp.response}`)
    }
  }
}

