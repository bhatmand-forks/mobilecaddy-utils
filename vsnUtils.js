/* mobilecaddy-utils - v2.0.0 - Bundle Time: 2018-09-07 11:03:38 */
/* git info: "2018-09-07 10:52:31 +0100": 86feeafc0686d53e19dfbf9077e67117ccac8edc (v2) */
/* Copyright 2018 MobileCaddy Ltd */

"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports._getBootstrapUrl=exports.upgradeIfAvailable=exports.upgradeAvailable=exports.hardReset=exports.getSoupsToClear=exports.clearSoups=void 0;var _devUtils=require("./devUtils.js"),devUtils=_interopRequireWildcard(_devUtils),_appDataUtils=require("./appDataUtils"),appDataUtils=_interopRequireWildcard(_appDataUtils),_smartStoreUtils=require("./smartStoreUtils"),smartStoreUtils=_interopRequireWildcard(_smartStoreUtils),_syncRefresh=require("./syncRefresh"),syncRefresh=_interopRequireWildcard(_syncRefresh),_logger=require("./logger"),logger=_interopRequireWildcard(_logger),_underscore=require("underscore"),_=_interopRequireWildcard(_underscore);function _interopRequireWildcard(e){if(e&&e.__esModule)return e;var r={};if(null!=e)for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(r[o]=e[o]);return r.default=e,r}var smartstore=cordova.require("com.salesforce.plugin.smartstore"),SYSTEM_TABLES=["recsToSync"];function getSoupsToClear(e,r){return new Promise(function(r,o){null===e?smartStoreUtils.listMobileTables(smartStoreUtils.ALPHA,function(e){var o=SYSTEM_TABLES;_.each(e,function(e){o.push(e),o.push("SnapShot_"+e),localStorage.removeItem("meta-tableDEF-"+e),localStorage.removeItem("meta-tableCRUD-"+e)}),console.debug("allTables",o),r(o)},function(e){o(e)}):r([])})}function clearSoups(e,r){return new Promise(function(o,t){getSoupsToClear(e,r).then(function(e){return Promise.all(e.map(smartStoreUtils.deleteSoup))}).then(function(){o()}).catch(function(e){logger.error(e),t(e)})})}function hardReset(e){return new Promise(function(r,o){var t={},n=e?"Version Upgrade":"HardReset",a="";testRefreshAccessToken().then(function(){smartStoreUtils.querySoupRecsPromise("appSoup").then(function(e){return e.forEach(function(e){t[e.Name]=e.CurrentValue}),console.info("appSoupRecs",JSON.stringify(t)),clearSoups(null,["appSoup"])}).then(function(){a=getBootstrapUrl(t),console.log("resetURL",a);var i="";console.debug("deletedSoups OK");var s,l,c=getAppEnv();"codeflow"==c&&(s=localStorage.getItem("forceOAuth"),l=localStorage.getItem("appSoup"));if(e&&localStorage.getItem("lsItemsToPersist")){var u=JSON.parse(localStorage.getItem("lsItemsToPersist")).map(function(e){return{key:e,value:localStorage.getItem(e)}});u.push({key:"lsItemsToPersist",value:localStorage.getItem("lsItemsToPersist")}),console.log("lsItemsToPersist",u),localStorage.clear(),u.forEach(function(e){localStorage.setItem(e.key,e.value)})}else localStorage.clear();if("codeflow"==c)localStorage.setItem("forceOAuth",s),localStorage.setItem("appSoup",l),i=window.location.protocol+"//"+window.location.host+"/www",r("ok");else if("platform"==c)i=window.location.href.substr(0,window.location.href.indexOf("#"));else{var p,d="";if(navigator&&navigator.connection&&(d=navigator.connection.type),window.device&&(p=window.device),navigator.appVersion.includes("Electron")){p=ipcRenderer.sendSync("request-device-info",""),d="wifi";var g="landscape"}var f=f||g;i=a+"?deviceUuid="+p.uuid+"&deviceName="+p.name+"&deviceCordova="+p.cordova+"&deviceVersion="+p.version+"&deviceModel="+p.model+"&buildName="+t.buildName+"&buildVersion="+t.buildVersion+"&buildOS="+t.buildOS+"&knownAud="+t.audId+"&currentDv="+t.dynVersionNumber+"&orientation="+f+"&viewportWidth="+window.innerWidth+"&viewportHeight="+window.innerHeight+"&sessionType="+n+"&connType="+d+"&loginUrl="+t.loginUrl+"&millsFromEpoch="+(new Date).getTime()}appDataUtils.updateNewValueInAppSoup("buildStatus","Resetting").then(function(){console.info("AppSoup Updated for reset"),smartStoreUtils.deleteSoup("syncLib_system_data").then(function(e){console.log("Redirecting to: "+i);try{window.location.href=i}catch(e){logger.errorAndDispatch("error on redirect",e),o(e)}r()}).catch(function(e){logger.errorAndDispatch(e)}),r()}).catch(function(e){logger.errorAndDispatch(e),o(e)})}).catch(function(e){logger.errorAndDispatch(e),o(e)})}).catch(function(e){logger.error("Tokens are bad, testRefreshAccessToken rejected with: "+JSON.stringify(e)),window.history.go(-(history.length-1)),navigator.appVersion.includes("Electron")||cordova.require("com.salesforce.plugin.sfaccountmanager").logout(),o(e)})})}function getBootstrapUrl(e){var r,o="/apex/mobilecaddy1__MobileCaddyBootstrap001_mc";switch(e.platAuthUrl){case"i":case"I":r=e.instanceUrl+o;break;case"l":case"L":r=e.loginUrl+o;break;case"":r=void 0;break;default:r=e.platAuthUrl}return r||(e.authURLType||(e.authURLType="login"),r="login"==e.authURLType?e.loginUrl+o:e.instanceUrl+o),r}function testRefreshAccessToken(){return new Promise(function(e,r){syncRefresh.refreshToken(function(r){console.debug("Successfully refreshed access token. Continue reset."),e("ok")},function(e){console.error("Unable to refresh access token. Abort reset: "+JSON.stringify(e)),r(e)})})}function getAppEnv(){return"localhost:3030"==window.location.host?"codeflow":"undefined"!=typeof mockStore?navigator.appVersion.includes("Electron")?"desktop":"platform":"device"}function upgradeAvailable(){return new Promise(function(e,r){smartStoreUtils.queryMobileTable("appSoup","Name","dynVersionNumber").then(function(r){void 0!==r[0].NewValue&&r[0].NewValue!=r[0].CurrentValue?e(!0):e(!1)}).catch(function(e){logger.error(e),r(e)})})}function upgradeIfAvailable(e){return new Promise(function(r,o){upgradeAvailable().then(function(t){if(t&&"force"==e)return hardReset(!0);if(t){var n="skip-failures"==e?syncRefresh.getSyncRecFailures():null;devUtils.dirtyTables(n).then(function(e){e.length>0?r(!1):syncRefresh.getRTSPendingconnSess(function(e){if(null===e||void 0===e)return hardReset(!0);r(!1)},function(e){r(!1)})}).catch(function(e){logger.error(e),o(e)})}else r(!1)}).catch(function(e){logger.error(e),o(e)})})}function _getBootstrapUrl(e){return getBootstrapUrl(e)}exports.clearSoups=clearSoups,exports.getSoupsToClear=getSoupsToClear,exports.hardReset=hardReset,exports.upgradeAvailable=upgradeAvailable,exports.upgradeIfAvailable=upgradeIfAvailable,exports._getBootstrapUrl=_getBootstrapUrl;