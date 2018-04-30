const request = require('request');
const file = require("./file.js")
const fs = require('fs');
const credentials = require("./credentials.js")

let startSearch = (date) => {
  var startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
  return startDate;
}

let endSearch = (date) => {
  var endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return endDate;
}

search = (r) => {
  return new Promise(function (resolve, reject) {
    date = new Date();
    geometry = r.geoJson.geometry;
    if (geometry.coordinates[0].length < 4) {
      geometry.coordinates[0].push(geometry.coordinates[0][0]);
    }

    geometry_filter = {
      "type": "GeometryFilter",
      "field_name": "geometry",
      "config": geometry
    }
    date_range_filter = {
      "type": "DateRangeFilter",
      "field_name": "acquired",
      "config": {
        "gte": startSearch(date),
        "lte": endSearch(date)
      }
    };

    //Cloud filter turned of to have more images to test with

    // cloud_cover_filter = {
    //   "type": "RangeFilter",
    //   "field_name": "cloud_cover",
    //   "config": {
    //     "lte": 0.2
    //   }
    // }

    logical_filter = {
      "type": "AndFilter",
      "config": [geometry_filter, date_range_filter]
    };

    request_json = {
      "interval": "day",
      "item_types": ["PSScene4Band"],
      "filter": logical_filter
    };

    request.post({
      url: 'https://api.planet.com/data/v1/quick-search',
      headers: {
        "Content-Type": "application/json"
      },
      auth: {
        user: credentials.PLANET_API_KEY,
        pass: '',
        sendImmediately: false
      },
      body: request_json,
      json: true
    }, (error, response, body) => {
      console.log(body)
      if (body.features == null) {
        reject(new Error(body))
      }
      if ("field" in body) {
        reject(new Error(body.field))
      }
      try {
        if (body.features.length == 0) {
          reject(new Error("No viable images found"))
        }
      } catch (error) {
        reject(error)
      }
      ids = []

      for (feature in body.features) {
        ids.push(body.features[feature].id)
        if (feature == body.features.length - 1) {
          console.log("done")
          resolve(ids)
        }
      }
    });
  });
}

let searchCollection = exports.searchCollection = (requests, mode) => {
  if (requests.length != 0) {
    currentRequest = requests.pop()
    search(currentRequest).then((ids) => {
      if (currentRequest.detectionType == 1) {
          //Change itemtype to PSScene4Band
      }
      downloadRequest = requestTemplate
      if (currentRequest.detectionType == 1) { //1 = ndvi detection type
        downloadRequest.products.product_bundle = "analytic";
        downloadRequest.products.item_type = "PSScene4Band";
        downloadRequest.bandmath = {
          "pixel_type": "16S",
          "b1": "(b4 - b3) / (b4+b3)"
        };
      }
      downloadRequest.name = `DR-NEW-${currentRequest.geoJson.properties.id.substr(2)}`;
      downloadRequest.products[0].item_ids = ids;
      downloadRequest.clip.aoi = currentRequest.geoJson.geometry;

      if (mode != null) {
        downloadRequest.notifications.webhook.url = `${credentials.SERVER_IP}/original_activated`;
        downloadRequest.name = `DR-OR-${currentRequest.geoJson.properties.id.substr(2)}`;
      }

      activate(downloadRequest).then((id) => {
        downloadRequest.id = id;
        file.save(downloadRequest, downloadRequest.name, currentRequest.userId, currentRequest.geoJson.properties.id, "json");
        searchCollection(requests);
      }, (error) => {
        console.log(error);
        searchCollection(requests);
      });//On error move on to the next one in the list
    }, (error) => {
      console.log(error);
      searchCollection(requests);
    })
  }
}

requestTemplate = {
  "name": "",
  "products": [{
    "item_ids": [],
    "item_type": "PSScene4Band",
    "product_bundle": "analytic"
  }],
  "clip": {
    "aoi": ""
  },
  "composite": {
    "composite": true
  },
  "notifications": {
    "webhook": {
      "url": `${credentials.SERVER_IP}/asset_activated`
    }
  }
};

var activate = (downloadRequest) => {
  return new Promise((resolve, reject) => {
    request.post({
      url: "https://api.planet.com/compute/ops/orders/v2/",
      headers: {
        "Content-Type": "application/json"
      },
      auth: {
        user: credentials.PLANET_API_KEY,
        pass: '',
        sendImmediately: false
      },
      body: downloadRequest,
      json: true
    }, function (error, response, body) {
      console.log(error);
      console.log(body)
      resolve(body.id);
    });
  })
}

exports.download = (uri, filename) => {
  request
    .get(uri)
    .auth(credentials.PLANET_API_KEY, "")
    .on('error', function (err) {
      console.log(err)
    })
    .on("close", () => {
      console.log("completed")
    })
    .pipe(fs.createWriteStream(filename));
};