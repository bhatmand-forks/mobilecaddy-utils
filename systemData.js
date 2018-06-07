/* mobilecaddy-utils - v2.0.0 - Bundle Time: 2018-06-07 16:10:32 */
/* git info: "2018-06-07 16:10:18 +0100": d15ade09940faa46c0f7e2cd96cdd4e5bc098409 (v2) */
/* Copyright 2018 MobileCaddy Ltd */

"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.getRecordTypeDots=exports.createSystemDataSoup=void 0;var _constants=require("./constants"),mobileCaddy=_interopRequireWildcard(_constants),_logger=require("./logger"),logger=_interopRequireWildcard(_logger),_appDataUtils=require("./appDataUtils"),appDataUtils=_interopRequireWildcard(_appDataUtils);function _interopRequireWildcard(e){if(e&&e.__esModule)return e;var o={};if(null!=e)for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&(o[t]=e[t]);return o.default=e,o}var LOCAL_DEV=!!window.LOCAL_DEV,USE_FORCETK=!!window.USE_FORCETK,smartstore=cordova.require("com.salesforce.plugin.smartstore");function getQueryAndSoupDefinition(e,o,t){console.log("in getQueryAndSoupDefinition");var r=[],a="Select ";e.forEach(function(e){r.push({path:e.Column_Name,type:e.Column_Type}),0!==e.Column_Name.indexOf("_")&&(a+=e.Column_Name+",")}),a=a.substring(0,a.length-1),o(a+=" From "+e[0].Name,r)}function populateSysDataSoupVariables(e,o,t,r){console.log("In populate system data row values");var a=function(e,o){if(o.status){console.log("In remoting callback for getSysDataSoupVariables with record count = "+e.length);var a=JSON.parse(e);console.log("Parse json soup field defns done"),smartstore.upsertSoupEntries("syncLib_system_data",a,t,r)}else"exception"===o.type?(alert(o.message),logger.error("Exception return from getSystemDataRowValues = "+o.message)):logger.error("Unknown return from getSystemDataRowValues = "+o.message)};!0===USE_FORCETK?force.request({method:"POST",path:"/services/apexrest/mobilecaddy1/getSysDataSoupVariables001",contentType:"application/json",data:{audId:e,startPageControllerVersion:mobileCaddy.START_PAGE_CONTROLLER_VSN,systemDataPlatformSupportVersion:o}},function(e){var o={status:"200"};a(e,o)},r):Visualforce.remoting.Manager.invokeAction("mobilecaddy1."+mobileCaddy.START_PAGE_CONTROLLER+".getSysDataSoupVariables",e,o,a,{escape:!1})}function createSystemDataSoup(e,o,t,r){console.log("In createSystemDataSoup"),getSystemDataSoupDefinition(t,r,e,o)}function getSystemDataSoupDefinition(e,o,t,r){console.log("In getSystemDataSoupDefinition with audId = "+e+" and sysDataPlatSupVersion = "+o);var a=function(a,s){if(s.status){console.log("In getSystemDataSoupDefinition callback -> "+a),console.log("Parse json app defns"+a);var n=JSON.parse(a);console.log("Parse json app defns done"),n.forEach(function(e){console.log(e)}),smartstore.registerSoup("syncLib_system_data",n,function(){populateSysDataSoupVariables(e,o,function(){populateDefsForSObjectMobileTables(e,o,t,r)},r)},r)}else"exception"===s.type?(alert(s.message),logger.error("Exception return from getSystemDataSoupDefinition = "+s.message)):logger.error("Unknown return from getSystemDataSoupDefinition = "+s.message)};!0===USE_FORCETK?(console.debug("USE_FORCETK == true"),force.request({method:"POST",path:"/services/apexrest/mobilecaddy1/getSystemDataSoupDefinition001",contentType:"application/json",data:{audId:e,startPageControllerVersion:mobileCaddy.START_PAGE_CONTROLLER_VSN,systemDataPlatformSupportVersion:o}},function(e){var o={status:"200"};a(e,o)},r)):Visualforce.remoting.Manager.invokeAction("mobilecaddy1."+mobileCaddy.START_PAGE_CONTROLLER+".getSystemDataSoupDefinition",e,o,a,{escape:!1})}function populateDefsForSObjectMobileTables(e,o,t,r){console.log(mobileCaddy.START_PAGE_CONTROLLER+".getDefsForSObjectMobileTables");var a=function(e,o){if(o.status){var a=JSON.parse(e);console.log("Parse json table defns done"),smartstore.upsertSoupEntries("syncLib_system_data",a,function(e){console.log("successful upsert with rec count = "+e.length),t(e)},function(e){logger.error("Error returned from upsert, message =  "+e),r(e)})}else"exception"===o.type?(alert(o.message),logger.error("Exception return from getDefsForSObjectMobileTables = "+o.message)):logger.error("Unknown return from getDefsForSObjectMobileTables = "+o.message)};!0===USE_FORCETK?force.request({method:"POST",path:"/services/apexrest/mobilecaddy1/getDefsForSObjectMobileTables001",contentType:"application/json",data:{audId:e,startPageControllerVersion:mobileCaddy.START_PAGE_CONTROLLER_VSN,systemDataPlatformSupportVersion:o}},function(e){var o={status:"200"};a(e,o)},r):Visualforce.remoting.Manager.invokeAction("mobilecaddy1."+mobileCaddy.START_PAGE_CONTROLLER+".getDefsForSObjectMobileTables",e,o,a,{escape:!1,timeout:12e4})}function getRecordTypeDots(e){return new Promise(function(o,t){var r,a=function(e,a){if(console.log("getRecordTypeDots",r,e),a.status){smartstore.registerSoup("dotsRecordTypes",[{path:"Table",type:"string"},{path:"Data",type:"string"}],function(r){var a=JSON.parse(e).map(function(e){return{Table:e.mobileTableName,Data:JSON.stringify(e.recTypeInfoList)}});console.log("upsertRecs",a),smartstore.upsertSoupEntries("dotsRecordTypes",a,function(t){console.log("successful upsert with rec count = "+t.length);var r={};JSON.parse(e).forEach(function(e){var o={};e.recTypeInfoList.forEach(function(e){e.recTypeDevName?(o[e.recTypeId]={recTypeName:e.recTypeName,recTypeDevName:e.recTypeDevName},o[e.recTypeName]=e.recTypeId,o[e.recTypeDevName]=e.recTypeId):(o[e.recTypeId]=e.recTypeName,o[e.recTypeName]=e.recTypeId)}),r[e.mobileTableName]=o}),localStorage.setItem("lsDotsRecordTypes",JSON.stringify(r)),o()},function(e){logger.error("Error returned from upsert, message =  "+e),t(e)})},function(e){t(e)})}else"exception"===a.type?(logger.error("Exception return from p2mRefreshRecTypeDOTs = "+a.message),t(a.message)):(logger.error("Unknown return from p2mRefreshRecTypeDOTs = "+a.message),t(a.message))};appDataUtils.getCachedCurrentValueFromAppSoup("syncRefreshVersion").then(function(o){r=o,!0===USE_FORCETK?force.request({method:"POST",path:"/services/apexrest/mobilecaddy1/p2mRefreshRecTypeDOTs001",contentType:"application/json",data:{audId:e,startPageControllerVersion:mobileCaddy.START_PAGE_CONTROLLER_VSN,syncRefreshDataVersion:r,connSessJson:"{}"}},function(e){var o={status:"200"};a(e,o)},function(e){a("[]",{status:"OK"})}):Visualforce.remoting.Manager.getAction("mobilecaddy1."+mobileCaddy.START_PAGE_CONTROLLER+".p2mRefreshRecTypeDOTs")?Visualforce.remoting.Manager.invokeAction("mobilecaddy1."+mobileCaddy.START_PAGE_CONTROLLER+".p2mRefreshRecTypeDOTs",e,r,"{}",a,{escape:!1,timeout:12e4}):a("[]",{status:"OK"})})})}exports.createSystemDataSoup=createSystemDataSoup,exports.getRecordTypeDots=getRecordTypeDots;