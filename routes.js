var router = require('express').Router();
var file = require("./file.js")
const planet = require("./planet.js")
const uuidv1 = require('uuid/v1')
const request = require("request")
var Jimp = require("jimp");


router.get('/', function (req, res) {
  res.sendFile("/index.html");
})

router.post('/save_request', function (req, res) {
  try {
    console.log(`saving: ${req.body.geoJson.properties.name}`);
    console.log(req.body);
    file.updateStatus(req.body.userId, req.body.geoJson.properties.id, "Server recieved the files");
    file.save(req.body, req.body.geoJson.properties.id, req.body.userId, req.body.geoJson.properties.id, "json").then(() => {
      file.updateStatus(req.body.userId, req.body.geoJson.properties.id, "Files saved on server");
      console.log("file saved");
      res.send("completed");
      file.getOriginalImage(req.body.userId, req.body.geoJson.properties.id).then(() => {
        console.log("image requested");
      })
    })
  } catch (err) {
    console.log(err)
  }
})

let processWebhook = async (type, req) => {
  allUsers = getAllUsers()
  for (user in allUsers) {
    currentUser = allUsers[user]
    downloadRequests = await file.get(currentUser, "DR")
    for (downloadRequest in downloadRequests) {
      if (downloadRequests[downloadRequest].id == req.body.order_id) {
        for (item in req.body.items) {
          dataType = req.body.items[item].name.split(".")[1]
          requestfolder = `R-${downloadRequests[downloadRequest].name.split("-").slice(2).join("-")}`
          ACDRequest = await JSON.parse(file.get(allUsers[user], requestfolder, requestfolder, "json").toString())
          console.log(ACDRequest)
          if (dataType == "tif" && req.body.items[item].name.includes("Visual_clip")) {
            file.updateStatus(currentUser, requestfolder, `${type = "original" ? "original" : "new" } image downloaded`)
            planet.download(req.body.items[item].location, `./public/users/${currentUser}/requests/${requestfolder}/images/${type = "original" ? "or" : "new" }-${uuidv1()}.tif`)
          }
        }
      }
    }
  }
}

//PlanetAPI sends a REST request once images are ready for download
router.post('/original_activated', async function (req, res) {
  processWebhook("original", req)
})
router.post('/asset_activated', async function (req, res) {
  processWebhook("new", req)
})

router.post('/delete_aoi', function (req, res) {
  try {
    console.log(`recieved ${req.body.id}`)
    file.deleteAoi(req.body.userId, req.body.id)
    res.send("completed");
  } catch (err) {
    console.log(err)
  }
})

router.post('/get_aois', function (req, res) {
  try {
    if (getAllUsers().indexOf(`${req.body.userId}`) > -1) {
      file.get(req.body.userId, "R").then((collection) => {
        res.send(collection);
      })
    }
  } catch (err) {
    console.log(err)
  }
})


module.exports = router