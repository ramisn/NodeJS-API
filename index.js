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
    // if (req.body.result.parameters.vcv_number != null) {
    //   var vcv_number = req.body.result.parameters.vcv_number
    //   reqUrl = encodeURI(`http://tvslsl-api.herokuapp.com/api/v1/bot_details/?vcv_no=${vcv_number}`);
    // } else if (req.body.result.parameters.sp_name != null) {
    //   var sp_name = req.body.result.parameters.sp_name
    //   reqUrl = encodeURI(`http://tvslsl-api.herokuapp.com/api/v1/bot_details/?service_provider_name=${sp_name}`);
    // } else if ((req.body.result.parameters.vcv_number != null) && (req.body.result.parameters.cwb_no != null)){
    //   var vcv_number = req.body.result.parameters.vcv_number
    //   var cwb_no = req.body.result.parameters.cwb_no
    //   reqUrl = encodeURI(`http://tvslsl-api.herokuapp.com/api/v1/bot_details/?vcv_no=${vcv_number}&cwb=${cwb_no}`);
    // }
    var cust_code = req.body.result.parameters.customer_code
    var part_code = req.body.result.parameters.part_code
    var date = req.body.result.parameters.vcv_date
    console.log(cust_code);
    console.log(part_code);
    console.log(date);
    // if (req.body.result.parameters.customer_code && req.body.result.parameters.part_code){
    // // reqUrl = encodeURI(`http://localhost:3000/api/v1/bot_details/?consignor_part_code=26021547&customer_code=LUTGCCHE06`);
    // reqUrl = encodeURI(`http://localhost:3000/api/v1/bot_details/?consignor_part_code=${part_code}&customer_code=${cust_code}`);
    // }
    if (req.body.result.parameters.customer_code && req.body.result.parameters.part_code && req.body.result.parameters.vcv_date){
      // var cust_code = req.body.result.parameters.customer_code
      // var part_code = req.body.result.parameters.part_code
      // var date = req.body.result.parameters.vcv_date
      reqUrl = encodeURI(`http://tvslsl-api.herokuapp.com/api/v1/bot_details/?consignor_part_code=${part_code}&customer_code=${cust_code}&vcv_date_time=${date}`);
      // reqUrl = encodeURI(`http://localhost:3000/api/v1/bot_details/?consignor_part_code=${part_code}&customer_code=${cust_code}&vcv_date_time=${date}`);
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

              // bot_det.forEach(function (value, index) {
              //   // console.log(value);
              //   console.log(index);
              //   // console.log([index]value);
              // });

              let array_val = [];
              for (var i in bot_det) {    // don't actually do this
                // console.log(i);
                array_val.push(`${bot_det[i].cwb_no}\n`);
              };

            
              // if (bot_det.length > 1) {

              //   let dataToSend = `You have ${bot_det.length} CWBs - ${array_val}\n
              //   Want to know more about these CWB? \n
              //   Say Yes or No`;
              // return res.json({
              //   speech: dataToSend,
              //   displayText: dataToSend,
              //   source: 'webhook'
              //   });

              // }

              if (bot_det.length > 1) {
              let dataToSend = `Here is the deatils:
                                You have ${bot_det.length} CWBs on this Truck.
                                GPS Provider - ${bot_det[0].gps_provider}\n,
                                Service Provider Name - ${bot_det[0].service_provider_name},\n
                                VCV Number - ${bot_det[0].vcv_no}`;
              let plannedETA = `${bot_det[0].planned_eta}`;
              let actualETA = `${bot_det[0].actual_eta}`;
              let currentLatLon = `${bot_det[0].currentlatlon}`;
              let currentLat = `${bot_det[0].currentlat}`;
              let currentLon = `${bot_det[0].currentlon}`;
              let originOfVCV = `${bot_det[0].origin}`;
              let originAddrOfVCV = `${bot_det[0].originaddress}`;
              let destOfVCV = `${bot_det[0].destination}`;
              let destAddrOfVCV = `${bot_det[0].destaddress}`;
              let isDeviationText = '';
              let isDeviation = `${bot_det[0].routedeviationflag}`;
              
              if (isDeviation == 'NULL'){
                isDeviationText = `Luckily, No deviation for this path!`;
              } else {
                isDeviationText = `Yes, This route have deviation`;
              }
              
              let vehicleNo = `${bot_det[0].vehicle_no}`;
              let routeCode = `${bot_det[0].routecode}`;
              let timeLeftArrival = `${bot_det[0].durtext}`;
              let distLeftArrival = `${bot_det[0].distext}`;
              let cwb = `${bot_det[0].cwb_no}`;
              let sales_contract = `${bot_det[0].sales_contract}`;
              let customer_code = `${bot_det[0].customer_code}`;
              let customer_name = `${bot_det[0].customer_name}`;
              let item_code = `${bot_det[0].item_code}`;
              let generating_loc_des = `${bot_det[0].generating_loc_des}`;
              let destination_loc_des = `${bot_det[0].destination_loc_des}`;
              let nature_of_movement = `${bot_det[0].nature_of_movement}`;
              let consignor_name = `${bot_det[0].consignor_name}`;
              let consignee_name = `${bot_det[0].consignee_name}`;
              let number_of_package = `${bot_det[0].number_of_package}`;
              
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
                         Cwb: cwb,
                         SalesContract: sales_contract,
                         CustomerCode: customer_code,
                         CustomerName: customer_name,
                         ItemCode: item_code,
                         GeneratingLoc: generating_loc_des,
                         DestinationLoc: destination_loc_des,
                         NatureOfMove: nature_of_movement,
                         ConsignorName: consignor_name,
                         ConsigneeName: consignee_name,
                         NoP: number_of_package,
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





