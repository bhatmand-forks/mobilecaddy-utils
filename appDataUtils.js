/* mobilecaddy-utils - v2.0.0 - Bundle Time: 2018-06-20 10:03:13 */
/* git info: "2018-06-19 16:53:31 +0100": 66bde0d18fcc8ea9fe631c95a4098c71f7ea5302 (v2) */
/* Copyright 2018 MobileCaddy Ltd */

"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.updateCurrentValueInAppSoup=exports.updateNewValueInAppSoup=exports.getCachedCurrentValueFromAppSoup=exports.getCurrentValueFromAppSoup=void 0;var _smartStoreUtils=require("./smartStoreUtils"),smartStoreUtils=_interopRequireWildcard(_smartStoreUtils),_constants=require("./constants"),mobileCaddy=_interopRequireWildcard(_constants);function _interopRequireWildcard(e){if(e&&e.__esModule)return e;var r={};if(null!=e)for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&(r[t]=e[t]);return r.default=e,r}var smartstore=cordova.require("com.salesforce.plugin.smartstore");function getCachedCurrentValueFromAppSoup(e){var r=localStorage.getItem("appSoup-"+e);return new Promise(function(t,u){r?t(r):getCurrentValueFromAppSoup(e).then(function(r){localStorage.setItem("appSoup-"+e,r),t(r)})})}function getCurrentValueFromAppSoup(e){return new Promise(function(r,t){var u=smartstore.buildExactQuerySpec("Name",e,mobileCaddy.QUERY_BUFFER_SIZE);smartStoreUtils.querySoupRecordsWithQuerySpec("appSoup",u,function(e){e[0]?r(e[0].CurrentValue):r(e[0])},function(e){t(e)})})}function updateValueInAppSoup(e,r,t){return new Promise(function(u,p){var o=smartstore.buildExactQuerySpec("Name",e,mobileCaddy.QUERY_BUFFER_SIZE);smartStoreUtils.querySoupRecordsWithQuerySpec("appSoup",o,function(e){e.length>0?(e[0][t]=r,smartstore.upsertSoupEntries("appSoup",e,function(e){u(e)},function(e){p(e)})):u()},function(e){p(e)})})}function updateNewValueInAppSoup(e,r){return updateValueInAppSoup(e,r,"NewValue")}function updateCurrentValueInAppSoup(e,r){return updateValueInAppSoup(e,r,"CurrentValue")}exports.getCurrentValueFromAppSoup=getCurrentValueFromAppSoup,exports.getCachedCurrentValueFromAppSoup=getCachedCurrentValueFromAppSoup,exports.updateNewValueInAppSoup=updateNewValueInAppSoup,exports.updateCurrentValueInAppSoup=updateCurrentValueInAppSoup;