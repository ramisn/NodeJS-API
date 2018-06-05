'use strict';

const express = require('express');
const apiai = require('apiai');
var request = require('request');
const bodyParser = require('body-parser');
const http = require('http');
const API_KEY = require('./apiKey');

const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));

server.use(bodyParser.json());

// var app = apiai("5aa2e68b7e5b405ba1de0ed4d52f0c08");
// console.log(app);

server.post('/webhook', (req, res) => {
    var data = req.body;

    console.log("WEBHOOK CALLED FROM AI",data);
    // console.log(req.body.result.parameters.vcv_number);
    var reqUrl = '';
    // Start
    if (req.body.result.parameters.vcv_number != null) {
      var vcv_number = req.body.result.parameters.vcv_number
      reqUrl = encodeURI(`http://tvslsl-api.herokuapp.com/api/v1/bot_details/?vcv_no=${vcv_number}`);
    } else if (req.body.result.parameters.sp_name != null) {
      var sp_name = req.body.result.parameters.sp_name
      reqUrl = encodeURI(`http://tvslsl-api.herokuapp.com/api/v1/bot_details/?service_provider_name=${sp_name}`);
    } 
    // else if (req.body.result.parameters.gps_name != null){
    //   var gps_name = req.body.result.parameters.gps_name
    //   reqUrl = encodeURI(`http://tvslsl-api.herokuapp.com/api/v1/bot_details/?gps_provider=${gps_name}`);
    // } 
    console.log(reqUrl); 
    http.get(reqUrl, (responseFromAPI) => {
        let completeResponse = '';
        responseFromAPI.on('data', (chunk) => {
            completeResponse += chunk;
        });
        responseFromAPI.on('end', () => {
            // const movie = JSON.parse(completeResponse);
            const bot_det = JSON.parse(completeResponse);
            // console.log(bot_det);
            // console.log(bot_det.GpsProvider);
            // let dataToSend = '';
            // if (bot_det != null){
              console.log(bot_det.length);
              // console.log(bot_det.gps_provider);
              if (bot_det.length > 0) {
              let dataToSend = `Here is the deatils: GPS Provider -- ${bot_det[0].gps_provider}, 
                                                     Service Provider Name -- ${bot_det[0].service_provider_name}, 
                                                     VCV Number -- ${bot_det[0].vcv_no}`;
              let plannedETA = `${bot_det[0].planned_eta}`;
              let actualETA = `${bot_det[0].actual_eta}`;
              let currentLatLon = `${bot_det[0].CurrentLatLon}`;
              let currentLat = `${bot_det[0].CurrentLat}`;
              let currentLon = `${bot_det[0].CurrentLon}`;
              let originOfVCV = `${bot_det[0].Origin}`;
              let originAddrOfVCV = `${bot_det[0].OriginAddress}`;
              let destOfVCV = `${bot_det[0].Destination}`;
              let destAddrOfVCV = `${bot_det[0].DestAddress}`;
              let isDeviationText = '';
              let isDeviation = `${bot_det[0].RouteDeviationFlag}`;
              
              if (isDeviation == 'NULL'){
                isDeviationText = `Luckily, no deviation for this path!`;
              } else {
                isDeviationText = `Yes, ${isDeviation}`;
              }
              
              let vehicleNo = `${bot_det[0].VehicleNo}`;
              let routeCode = `${bot_det[0].RouteCode}`;
              let timeLeftArrival = `${bot_det[0].DurText}`;
              let distLeftArrival = `${bot_det[0].DisText}`;
              
            return res.json({
                speech: dataToSend,
                displayText: dataToSend,
                contextOut: [
                {
                    name: "tvslsl-context",
                    parameters: {
                         PlannedETA: plannedETA,
                         ActualETA: actualETA,
                         CurrentLatLon: currentLatLon,
                         CurrentLat: currentLat,
                         CurrentLon: currentLon,
                         OriginOfVCV: originOfVCV,
                         OriginAddrOfVCV: originAddrOfVCV,
                         DestOfVCV: destOfVCV,
                         DestAddrOfVCV: destAddrOfVCV,
                         IsDeviation: isDeviationText,
                         VehicleNo: vehicleNo,
                         RouteCode: routeCode,
                         TimeLeftArrival: timeLeftArrival,
                         DistLeftArrival: distLeftArrival,
                        
                    },
                    lifespan: 5
                }
            ],
                source: 'webhook'
            });
            }
        });
    }, (error) => {
        return res.json({
            speech: 'Something went wrong!',
            displayText: 'Something went wrong!',
            source: 'webhook'
        });
    }); 
//  }
}); 

server.listen((process.env.PORT || 8000), () => {
    console.log("Server is UP and Running...");
});





