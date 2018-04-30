const fs = require('fs');
const planet = require("./planet.js")
const rimraf = require('rimraf');
const usersFolder = "public/users/"
exports = module.exports

let save = exports.save = (data, filename, uid, aoiId, item_type) => {
  return new Promise((resolve, reject) => {
    item_type == "json" ? data = JSON.stringify(data, null, "\t") : "";
    //If the user doesn't have a folder, create one
    if (!fs.existsSync(`${usersFolder}${uid}`)) {
      fs.mkdirSync(`${usersFolder}${uid}`);
      fs.mkdirSync(`${usersFolder}${uid}/requests/`);
    }
    if (!fs.existsSync(`${usersFolder}${uid}/requests/${aoiId}`)) {
      fs.mkdirSync(`${usersFolder}${uid}/requests/${aoiId}`);
      fs.mkdirSync(`${usersFolder}${uid}/requests/${aoiId}/images`);
    }
    //Creates the request file 
    fs.writeFileSync(`${usersFolder}${uid}/requests/${aoiId}/${filename}.${item_type}`, data, "utf8")
    resolve(filename);
  })
}

//Deletes Request folder
let deleteAoi = exports.deleteAoi = (userId, id) => {
  rimraf(`./${usersFolder}${userId}/requests/${id}`, (error) => {
    console.log(error)
    console.log(`deleted ${id}`)
  })
}

let getAllUsers = exports.getAllUsers = () => {
  return fs.readdirSync(`./${usersFolder}`)
}

let get = exports.get = (userId, id, name, item_type) => {
  return new Promise(function (resolve, reject) {
    let collection = []
    fs.readdir(`./${usersFolder}${userId}/requests/`, (err, folders) => {
      if (id == "all" || id == "R" || id == "DR") {   
        foldersRead = 0
        folders.forEach((folder) => {
          foldersRead++;

          file = fs.readdirSync(`./${usersFolder}${userId}/requests/${folder}`)

          file.forEach((filename) => {
            if (filename != "images") {
              data = JSON.parse(fs.readFileSync(`./${usersFolder}${userId}/requests/${folder}/${filename}`))

              switch (id) {
                case "R":
                  filename.substr(0, 1) === "R" ? collection.push(data) : ""
                  break;
                case "DR":
                  filename.substr(0, 2) === "DR" ? collection.push(data) : ""
              }
            }
          })
        })
        if (foldersRead == folders.length) {
          resolve(collection);
        }
      } else {
        resolve(fs.readFileSync(`${usersFolder}${userId}/requests/${id}/${name}.${item_type}`))
      }
    })
  })
}

//Update the status message
let updateStatus = exports.updateStatus =  (userId,aoiId,message) => {
  editRequest(userId,aoiId,"status",message)
}

let editRequest = exports.editRequest = (userId,aoiId,key,value) => {
  get(userId,aoiId,aoiId,"json").then((data) => {
    aoiRequest = JSON.parse(data.toString('utf8'))
    aoiRequest[key] = value;
    save(aoiRequest,aoiId,userId,aoiId,"json")
  },(error) =>{
    console.log(error)
  }) 
}

//This method will run when the AOI is created
let getOriginalImage = exports.getOriginalImage = (userId, requestId) => {
  return new Promise((resolve, reject) => {
    get(userId, requestId, requestId, "json").then((request) => {
      planet.searchCollection([JSON.parse(request)], "new")
    }, (error) => {
      console.log(error)
    })
  })
}