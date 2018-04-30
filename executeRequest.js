const planet = require("./planet.js")
var file = require("./file.js")

//This method will run daily to execute all the requests
var executeRequest = (id) => {
  return new Promise((resolve, reject) => {
    file.get(id, "R").then((requests) => {
      planet.searchCollection(requests)
    }, (error) => {
      console.log(error)
    })
  })
}
