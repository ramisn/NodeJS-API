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
    var vcv_number = req.body.result.parameters.vcv_number
    var date = req.body.result.parameters.vcv_date
    var cwb_no = req.body.result.parameters.cwb_no
    if (vcv_number) {
      reqUrl = encodeURI(`http://localhost:3000/api/v1/bot_details/?vcv_no=${vcv_number}`);
      // reqUrl = encodeURI(`http://tvslsl-api.herokuapp.com/api/v1/bot_details/?vcv_no=${vcv_number}&vcv_date_time=${date}`);
    } 

    if (vcv_number && cwb_no){
    reqUrl = encodeURI(`http://tvslsl-api.herokuapp.com/api/v1/bot_details/?vcv_no=${vcv_number}&cwb_no=${cwb_no}`);
    // reqUrl = encodeURI(`http://localhost:3000/api/v1/bot_details/?vcv_no=${vcv_number}&cwb_no=${cwb_no}`);
    }
    
    var cust_code = req.body.result.parameters.customer_code
    var part_code = req.body.result.parameters.part_code
    
    var vehicle_no = req.body.result.parameters.vehicle_no
    // console.log(cust_code);
    // console.log(part_code);
    // console.log(date);

    if (req.body.result.parameters.customer_code){
    reqUrl = encodeURI(`http://tvslsl-api.herokuapp.com/api/v1/bot_details/?customer_code=${cust_code}`);
    // reqUrl = encodeURI(`http://localhost:3000/api/v1/bot_details/?customer_code=${cust_code}`);
    }

    
    if (req.body.result.parameters.customer_code && req.body.result.parameters.part_code && req.body.result.parameters.vcv_date){
      reqUrl = encodeURI(`http://tvslsl-api.herokuapp.com/api/v1/bot_details/?consignor_part_code=${part_code}&customer_code=${cust_code}&vcv_date_time=${date}`);
      // reqUrl = encodeURI(`http://localhost:3000/api/v1/bot_details/?consignor_part_code=${part_code}&customer_code=${cust_code}&vcv_date_time=${date}`);
      
    } 
    
    if (req.body.result.parameters.customer_code && req.body.result.parameters.part_code && req.body.result.parameters.vcv_date && req.body.result.parameters.cwb_no){
      // reqUrl = encodeURI(`http://localhost:3000/api/v1/bot_details/?consignor_part_code=${part_code}&customer_code=${cust_code}&vcv_date_time=${date}&cwb_no=${cwb_no}`);
      reqUrl = encodeURI(`http://tvslsl-api.herokuapp.com/api/v1/bot_details/?consignor_part_code=${part_code}&customer_code=${cust_code}&vcv_date_time=${date}&cwb_no=${cwb_no}`);
    }

    if (req.body.result.parameters.customer_code && req.body.result.parameters.part_code && req.body.result.parameters.vcv_date && req.body.result.parameters.vehicle_no){
      // reqUrl = encodeURI(`http://localhost:3000/api/v1/bot_details/?consignor_part_code=${part_code}&customer_code=${cust_code}&vcv_date_time=${date}&vehicle_no=${vehicle_no}`);
      reqUrl = encodeURI(`http://tvslsl-api.herokuapp.com/api/v1/bot_details/?consignor_part_code=${part_code}&customer_code=${cust_code}&vcv_date_time=${date}&vehicle_no=${vehicle_no}`);
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
              // console.log(bot_det[0]);
              console.log(bot_det.length);

              // bot_det.forEach(function (value, index) {
              //   // console.log(value);
              //   console.log(index);
              //   // console.log([index]value);
              // });

              // let array_val = [];
              // for (var i in bot_det) {    // don't actually do this
              //   // console.log(i);
              //   array_val.push(`${bot_det[i].cwb_no}\n`);
              // };

              if (bot_det == null || bot_det == 0) {

                let dataToSend = `Something went wrong!. Please try again.`
                  
              return res.json({
                speech: dataToSend,
                displayText: dataToSend,
                source: 'webhook'
                });

              }
              
              if (bot_det.length == 1) {
              let dataToSend = `Here is the details:\
                                This Partcode: ${bot_det[0].consignor_part_code} is part of Cargo way bill ${bot_det[0].cwb_no}. \
                                The consignment has ${bot_det[0].number_of_package} Units of this Partcode.`
                                // GPS Provider - ${bot_det[0].gps_provider}\,
                                // Service Provider Name - ${bot_det[0].service_provider_name}`;
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
                isDeviationText = `Yes, This route have deviation. `;
              }
              
              let vehicleNo = `${bot_det[0].vehicle_no}`;
              let routeCode = `${bot_det[0].routecode}`;
              let timeLeftArrival = `${bot_det[0].durtext}`;
              let distLeftArrival = `${bot_det[0].distext}`;
              let cwb = `${bot_det[0].cwb_no}`;
              let sales_contract = `${bot_det[0].sales_contract}`;
              let customer_code = `${bot_det[0].customer_code}`;
              let customer_name = `${bot_det[0].customer_name}`;
              let item_code = `${bot_det[0].consignor_part_code}`;
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

          if (bot_det.length > 1 && cust_code && part_code && date) {

                let dataToSend = `You have ${bot_det.length} Cargo Way Bills. \n
                Please select the service options to assist you better: \n
                  A. Cargo Way Bill / CWB tracking.`
                  
              return res.json({
                speech: dataToSend,
                displayText: dataToSend,
                source: 'webhook'
                });

              } else if (cust_code) {

                let dataToSend = `Welcome ${bot_det[0].customer_name}. \
                Want Part Code Tracking?`
                  
              return res.json({
                speech: dataToSend,
                displayText: dataToSend,
                source: 'webhook'
                });

              }

              if (bot_det.length > 1 && vcv_number) {

                let dataToSend = `You have ${bot_det.length} Cargo Way Bills attached on this VCV. \n
                Please select the service options to assist you better: \n
                  A. Cargo Way Bill / CWB tracking.`
                  
              return res.json({
                speech: dataToSend,
                displayText: dataToSend,
                source: 'webhook'
                });

              }    


              // if (bot_det.length > 1 && vehicle_no != null) {

              //   let dataToSend = `On this vehicle ${bot_det.length} Cargo Way Bills are attached. \n
              //   Please select the service options to assist you better: \n
              //     i). CWB / Cargo Way Bill / CWB tracking.`
                  
              // return res.json({
              //   speech: dataToSend,
              //   displayText: dataToSend,
              //   source: 'webhook'
              //   });

              // }
          
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





