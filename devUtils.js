/* mobilecaddy-utils - v2.0.0 - Bundle Time: 2018-03-12 15:46:01 */
/* git info: "2018-03-08 11:35:36 +0000": 34e66b2d6ddf746b6814f8563e576e511cc89c8f (v2) */
/* Copyright 2018 MobileCaddy Ltd */

import*as smartStoreUtils from"./smartStoreUtils";import*as appDataUtils from"./appDataUtils";import*as connSessUtils from"./connSessUtils";import*as syncRefresh from"./syncRefresh";import*as vsnUtils from"./vsnUtils";import*as logger from"./logger";import*as _ from"underscore";var smartstore=cordova.require("com.salesforce.plugin.smartstore"),UNKONWN_TABLE=1,UNKONWN_FIELD=2,ACCESS_DENIED=3,MANDATORY_MISSING=4,DATATYPE_MISMATCH=5,PROTECTED_FIELD=6,UNKNOWN_ID=7,UNKNOWN_RECORD_TYPE=8,SYNC_ALREADY_IN_PROGRESS_INC=98,UNKONWN_ERR=99,SYNC=100400,SYNC_NOK_STATUS=100402,INSERT_RECS=100700,READ_RECS=101e3,UPDATE_RECS=101100,DELETE_RECS=101200,GET_REC_TYPES=101300,SYSTEM_TABLES=["syncLib_system_data","appSoup","cacheSoup","recsToSync","SnapShot_Connection_Session__mc"],PROTECTED_FIELDS=["autonumber","CreatedById","CreatedDate","IsDeleted","IsClosed","IsWon","LastModifiedById","LastModifiedDate","LastReferencedDate","mobilecaddy1__MC_Proxy_ID","MC_Proxy_ID","OwnerId","SystemModstamp","Id","dirtyFlag"];function analInc(e){return new Promise(function(t,n){var r=new Date,s=new Date(r.getFullYear(),r.getMonth(),r.getDate(),0,0,0,0).valueOf();maybeCreateAnalyticTable().then(function(){return getCurAnalyticsAndHousekeep(s)}).then(function(n){var r={};if(0===n.length){r[e]=1;var o={Name:s,Data:JSON.stringify(r)};t(r[e]),smartstore.upsertSoupEntries("Analytics",[o],function(e){},function(e){logger.error("Unable to insert analytic recs",e)})}else{var a=n[0];(r=JSON.parse(a.Data))[e]=void 0===r[e]?1:r[e]+1,t(r[e]),a.Data=JSON.stringify(r),smartstore.upsertSoupEntriesWithExternalId("Analytics",[a],"Name",function(e){},function(e){logger.error(e)})}}).catch(function(e){logger.error("Error in analInc",e),n(e)})})}function maybeCreateAnalyticTable(){return new Promise(function(e,t){smartstore.soupExists("Analytics",function(n){if(n)e();else{smartstore.registerSoup("Analytics",[{path:"Name",type:"integer"},{path:"Data",type:"string"}],function(t){e()},function(e){t(e)})}},function(e){logger.error(e),t(e)})})}function getCurAnalyticsAndHousekeep(e){return new Promise(function(t,n){var r="";appDataUtils.getCurrentValueFromAppSoup("audId").then(function(e){return r=e,smartStoreUtils.querySoupRecsPromise("Analytics")}).then(function(s){var o=[],a=[],c=[];s.forEach(function(t){if(t.Name==e)o.push(t);else{var n={Name:t.Name.toString(),SystemModstamp:t.Name,mobilecaddy1__Error_Text__c:JSON.parse(t.Data),mobilecaddy1__Application_User_Device__c:r};logger.hasLogType()&&(n.mobilecaddy1__Log_Type__c="analytic"),a.push(n),c.push(t._soupEntryId)}}),0!==a.length&&smartStoreUtils.insertRecords("Mobile_Log__mc",a,function(e){smartstore.removeFromSoup("Analytics",c,function(e){t(o)},function(e){logger.error("Unable to insert analytic recs",e),n(e)})},function(e){logger.error("Unable to insert analytic recs",e),n(e)}),t(o)}).catch(function(e){logger.error("Error housekeeping Analytics",e),n(e)})})}function checkTableAccess(e,t,n){return console.time("MC-TIMING checkTableAccess "+e),new Promise(function(r,s){var o=function(t,o){var a=0;switch(t){case INSERT_RECS:a=1;break;case READ_RECS:a=4;break;case UPDATE_RECS:a=7;break;case DELETE_RECS:a=10;break;default:a=0}if("Y"==o.charAt(a))console.timeEnd("MC-TIMING checkTableAccess "+e),r(n);else{var c={};c.status=t+ACCESS_DENIED,c.mc_add_status=e,console.timeEnd("MC-TIMING checkTableAccess "+e),s(c)}};-1==SYSTEM_TABLES.indexOf(e)?localStorage["meta-tableCRUD-"+e]?o(t,localStorage["meta-tableCRUD-"+e]):smartStoreUtils.getTableDefnColumnValue(e,"Application Record CRUD").then(function(n){localStorage["meta-tableCRUD-"+e]=n,o(t,n)}).catch(function(t){console.timeEnd("MC-TIMING checkTableAccess "+e),console.info("Opps -> "+e),s(t)}):(console.timeEnd("MC-TIMING checkTableAccess "+e),r(n))})}function getCurrentUserId(){return new Promise(function(e,t){if(!0===USE_FORCETK){var n=force.getUserId();e(n)}else getCachedAppSoupValue("userId").then(function(t){e(t)}).catch(function(e){logger.error("getCurrentUserId",e),t(e)})})}function getCurrentUserName(){var e="";return new Promise(function(t,n){getCachedAppSoupValue("userFirstName").then(function(t){return e=t,getCachedAppSoupValue("userLastName")}).then(function(n){t(e+" "+n)}).catch(function(e){logger.error("getCurrentUserName",e),n(e)})})}function getCachedAppSoupValue(e){return new Promise(function(t,n){appDataUtils.getCachedCurrentValueFromAppSoup(e).then(function(e){t(e)}).catch(function(e){logger.error("getCachedAppSoupValue",e),n(e)})})}function isValidEmail(e){if(0===e.length)return!0;var t=e.indexOf("@"),n=e.lastIndexOf(".");return!(t<1||n<t+2||n+2>=e.length)}var BYTES=0,CHARS=1;function isValidStrLength(e,t,n){if(void 0===e)return!0;switch(t){case BYTES:for(var r=e.length,s=e.length-1;s>=0;s--){var o=e.charCodeAt(s);o>127&&o<=2047?r++:o>2047&&o<=65535&&(r+=2),o>=56320&&o<=57343&&s--}return r<=n;default:return!0}}function isValidFieldAndTranslate(e,t,n,r){if("_soupLastModifiedDate"==e)return r;var s=_.findWhere(n,{path:e}),o={};if(void 0===s)return o.status=t+UNKONWN_FIELD,o.mc_add_status=e,o;var a=0;switch(t){case INSERT_RECS:a=1;break;case READ_RECS:a=4;break;case UPDATE_RECS:a=7;break;default:a=0}if("Y"!=s.crud.charAt(a))return o.status=t+ACCESS_DENIED,o;try{return o.value=maybeWriteTransformType(r,s.appColType,s.platColType),o}catch(n){return o.status=t+DATATYPE_MISMATCH,o.mc_add_status=n+"->"+e,o}}function listMobileTableColumns(e){return console.time("MC-TIMING listMobileTableColumns "+e),new Promise(function(t,n){localStorage["meta-tableDEF-"+e]?(console.timeEnd("MC-TIMING listMobileTableColumns "+e),t(JSON.parse(localStorage["meta-tableDEF-"+e]))):smartStoreUtils.listMobileTableColumns(e,smartStoreUtils.FULL,function(n){localStorage["meta-tableDEF-"+e]=JSON.stringify(n),console.timeEnd("MC-TIMING listMobileTableColumns "+e),t(n)},function(t){console.timeEnd("MC-TIMING listMobileTableColumns "+e),n(t)})})}function maybeReadTransformType(e,t,n){switch(n){case"checkbox":case"Deleted":return"true"===String(e);case"CreatedDate":case"date":case"datetime":case"LastActivtyDate":case"LastModifiedDate":case"LastReferencedDate":case"LastViewedDate":case"SystemModstamp":return null!==e?new Date(e):e;default:return e}}function maybeWriteTransformType(e,t,n){switch(n){case"autonumber":throw"invalid_autonumber";case"checkbox":case"Deleted":if("boolean"==typeof e||"true"===e||"false"===e)return String(e);throw"invalid_boolean";case"date":if(e instanceof Date)return e.setUTCHours(0),e.setUTCMinutes(0),e.setUTCSeconds(0),e.setUTCMilliseconds(0),e.valueOf();if(null===e)return null;throw"invalid_date";case"datetime":if(e instanceof Date)return e.valueOf();throw"invalid_datetime";case"email":if(isValidEmail(e))return e;throw"invalid_email";default:switch(t){case"jsString":if("string"==typeof e)return e;if("number"==typeof e)return e.toString();throw"invalid_string";case"jsNumber":if("number"==typeof e||null===e)return e;throw"invalid_number";default:return e}}}function tableExists(e,t){return console.time("MC-TIMING tableExists "+e),new Promise(function(n,r){var s={};localStorage["meta-tableCRUD-"+e]?(console.timeEnd("MC-TIMING tableExists "+e),n()):smartStoreUtils.listMobileTables(smartStoreUtils.ALPHA,function(o){o.concat(SYSTEM_TABLES).indexOf(e)>=0?(console.timeEnd("MC-TIMING tableExists "+e),n()):(s.status=t+UNKONWN_TABLE,s.mc_add_status=e,console.timeEnd("MC-TIMING tableExists "+e),r(s))},function(n){s.status=t+UNKONWN_ERR,s.mc_add_status="Unkonwn error "+n,console.timeEnd("MC-TIMING tableExists "+e),r(s)})})}function validateRecords(e,t,n,r,s){return new Promise(function(o,a){var c={},i={};c.status=n,getRecordTypesMap().then(function(t){return t[e]&&(i=_.invert(t[e])),getCurrentUserId()}).then(function(e){r.forEach(function(r){if(delete r._soupEntryId,delete r.$$HashKey,r.RecordTypeName){if(r.RecordTypeId=i[r.RecordTypeName],_.isEmpty(i))return c.status=n+UNKONWN_FIELD,c.mc_add_status=r.RecordTypeName,o(c);if(!r.RecordTypeId)return c.status=n+UNKNOWN_RECORD_TYPE,c.mc_add_status=r.RecordTypeName,o(c);delete r.RecordTypeName}for(var a in r)if(r.hasOwnProperty(a)&&a!=t){if(isValidFieldRes=isValidFieldAndTranslate(a,n,s,r[a]),isValidFieldRes.status==n+UNKONWN_FIELD){c.status=isValidFieldRes.status,c.mc_add_status=a;break}if(isValidFieldRes.status==n+DATATYPE_MISMATCH){c.status=isValidFieldRes.status,c.mc_add_status=a;break}if(isValidFieldRes.status==n+ACCESS_DENIED){c.status=isValidFieldRes.status,c.mc_add_status=a;break}if(n==INSERT_RECS&&PROTECTED_FIELDS.indexOf(a)>=0){c.status=n+PROTECTED_FIELD,c.mc_add_status=a;break}r[a]=isValidFieldRes.value}if(c.status!=n+UNKONWN_FIELD&&c.status!=n+DATATYPE_MISMATCH&&c.status!=n+PROTECTED_FIELD){var l=(new Date).getTime();n==INSERT_RECS&&(r.CreatedById=e,r.CreatedDate=l),r.SystemModstamp=l,r.LastModifiedDate=l,r.LastModifiedById=e,r.IsDeleted="false",s.forEach(function(e){if(n==INSERT_RECS){var t=e.crud.charAt(1);PROTECTED_FIELDS.indexOf(e.path)<0&&"false"==e.nillable&&"Y"==t?_.has(r,e.path)||(c.status=n+MANDATORY_MISSING,c.mc_add_status=e.path):("IsClosed"==e.path&&(r.IsClosed="false"),"IsWon"==e.path&&(r.IsWon="false"))}""!==e.proxyRefField&&void 0!==r[e.path]&&r[e.path].length>18&&(r[e.proxyRefField]=r[e.path])})}}),c.records=r,o(c)},function(e){logger.error("validateRecords",e)})})}function getRecordTypes(e){return new Promise(function(t,n){tableExists(e,GET_REC_TYPES).then(function(){return getRecordTypesMap()}).then(function(n){t(n[e])}).catch(function(e){n(e)})})}function getRecordTypesMap(){return new Promise(function(e,t){localStorage.getItem("lsDotsRecordTypes")?e(JSON.parse(localStorage.getItem("lsDotsRecordTypes"))):smartStoreUtils.querySoupRecords("dotsRecordTypes",function(t){console.log("querySoupRecords dotsRecordTypes",t);var n={};t.forEach(function(e){var t={};JSON.parse(e.Data).forEach(function(e){t[e.recTypeId]=e.recTypeName}),n[e.Table]=t}),localStorage.setItem("lsDotsRecordTypes",JSON.stringify(n)),e(n)},function(e){logger.error("Error returned from upsert, message =  "+e),t(e)})})}function deleteRecords(e,t,n){var r,s={};return new Promise(function(o,a){t.length>0?tableExists(e,DELETE_RECS).then(function(){return listMobileTableColumns(e)}).then(function(t){return checkTableAccess(e,DELETE_RECS,t)}).then(function(r){return new Promise(function(s,o){var a=isValidFieldAndTranslate(n,DELETE_RECS,r);a.status!=DELETE_RECS+UNKONWN_FIELD?validateRecords(e,n,DELETE_RECS,t,r).then(function(e){e.status==DELETE_RECS?s(e.records):(o(e),logger.error(e))}):(o(a),logger.error(a))})}).then(function(r){return smartStoreUtils.queryMobileTable(e,n,t[0][n])}).then(function(t){if(0===t.length)s.status=DELETE_RECS+MANDATORY_MISSING,logger.warn("deleteRecord no record found",e),s.mc_add_status="no record found",a(s);else{if(!(t[0].Id.length<19))return r=t,smartStoreUtils.querySoupRecsPromise("recsToSync");s.status=DELETE_RECS+ACCESS_DENIED,logger.warn("deleteRecord Cannot delete synced records"),s.mc_add_status="Cannot delete synced records",a(s)}}).then(function(t){console.debug("tableName",e),console.debug("recsToDelete",r),console.debug("rts recs",t);var n=t.reduce(function(t,n){return n.Mobile_Table_Name==e&&_.findWhere(r,{_soupEntryId:n.SOUP_Record_Id})&&t.push({_soupEntryId:n._soupEntryId}),t},[]);console.debug("rtsRecSoupIds",n),smartStoreUtils.deleteRecordsFromSoup(r,e,function(){smartStoreUtils.deleteRecordsFromSoup(n,"recsToSync",function(){s.status=DELETE_RECS,s.records=r,o(s)},function(e){a(e)})},function(e){a(e)})}).catch(function(e){a(e)}):(s.status=DELETE_RECS,logger.warn("deleteRecord No records supplied"),s.mc_add_status="No records supplied",s.records=[],o(s))})}function dirtyTables(){return new Promise(function(e,t){readRecords("recsToSync").then(function(t){var n=[],r=[];t.records.forEach(function(e){"Connection_Session__mc"!=e.Mobile_Table_Name&&void 0===n[e.Mobile_Table_Name]&&(n[e.Mobile_Table_Name]=!0,r.push(e.Mobile_Table_Name))}),e(r)}).catch(function(e){logger.error(e),t(e)})})}function enrichWithRecordTypeNames(e,t){return new Promise(function(n,r){e.length>0&&-1==SYSTEM_TABLES.indexOf(t)?getRecordTypesMap().then(function(r){if(r[t]){var s=r[t],o=e.map(function(e){return e.RecordTypeName=s[e.RecordTypeId],e.RecordTypeName||logger.warn("enrichWithRecordTypeNames",e.RecordTypeId),e});n(o)}else n(e)}).catch(function(e){r(e)}):n(e)})}function insertRecords(e,t){var n={};return new Promise(function(r,s){tableExists(e,INSERT_RECS).then(function(){return listMobileTableColumns(e)}).then(function(t){return checkTableAccess(e,INSERT_RECS,t)}).then(function(n){return new Promise(function(r,s){validateRecords(e,null,INSERT_RECS,t,n).then(function(e){e.status==INSERT_RECS?r(e.records):s(e)})})}).then(function(t){smartStoreUtils.insertRecords(e,t,function(e){n.status=INSERT_RECS,n.records=e,vsnUtils.upgradeAvailable().then(function(e){n.upgradeAvailable=e,r(n)}).catch(function(e){r(n),logger.error(e)})},function(e){s(e),logger.error(e)})}).catch(function(e){s(e),logger.error(e)})})}function logout(){console.log("Logout requested"),navigator.appVersion.includes("Electron")?ipcRenderer.sendSync("logout",""):cordova.require("com.salesforce.plugin.sfaccountmanager").logout()}function readRecords(e,t){var n={},r="MC-TIMING readRecords "+e;return console.time(r),new Promise(function(t,s){tableExists(e,READ_RECS).then(function(){return checkTableAccess(e,READ_RECS)}).then(function(){return listMobileTableColumns(e)}).then(function(o){smartStoreUtils.querySoupRecords(e,function(a){n.status=READ_RECS,a.length>0?-1==SYSTEM_TABLES.indexOf(e)?smartStoreUtils.getTableDefnColumnValue(e,"Last Refresh Date/Time").then(function(t){return readProcessRecs(e,a,o,t,n)}).then(function(e){console.timeEnd(r),t(e)}).catch(function(e){s(e),logger.error(e)}):readProcessRecs(e,a,o,null,n).then(function(e){console.timeEnd(r),t(e)}):(n.records=[],vsnUtils.upgradeAvailable().then(function(e){n.upgradeAvailable=e,console.timeEnd(r),t(n)}).catch(function(e){console.timeEnd(r),t(n),logger.error(e)}))},function(e){console.timeEnd(r),s(e),logger.error(e)})},function(e){console.timeEnd(r),s(e),logger.error(e)})})}function readProcessRecs(e,t,n,r,s){return new Promise(function(o,a){t.forEach(function(e){for(var t in e){var s=_.findWhere(n,{path:t});void 0!==s&&(e[t]=maybeReadTransformType(e[t],s.appColType,s.platColType),"LastModifiedDate"==t&&(e.dirtyFlag=calcDirtyFlag(e[t],r)))}}),s.records=t.filter(function(e){return"object"==typeof e}),enrichWithRecordTypeNames(s.records,e).then(function(e){return s.records=e,vsnUtils.upgradeAvailable()}).then(function(e){s.upgradeAvailable=e,o(s)}).catch(function(e){o(s),logger.error(e)})})}function smartRead(e){return new Promise(function(t,n){var r,s,o={},a=/\{(\S*)\}/g.exec(e);tableName=a[1],parseSmartSql(tableName,e).then(function(e){return console.debug("smartSql2",e),r=smartstore.buildSmartQuerySpec(e),console.debug("querySpec",r),s="MC-TIMING smartRead "+tableName,console.time(s),tableExists(tableName,READ_RECS)}).then(function(){return checkTableAccess(tableName,READ_RECS)}).then(function(){return listMobileTableColumns(tableName)}).then(function(e){smartStoreUtils.smartQuerySoupRecordsWithQuerySpec(r,function(n){o.status=READ_RECS,n.length>0?-1==SYSTEM_TABLES.indexOf(tableName)?smartStoreUtils.getTableDefnColumnValue(tableName,"Last Refresh Date/Time").then(function(t){return smartReadProcessRecs(tableName,n,e,t,o)}).then(function(e){console.timeEnd(s),t(e)}):smartReadProcessRecs(tableName,n,e,null,o).then(function(e){console.timeEnd(s),t(e)}):(o.records=[],vsnUtils.upgradeAvailable().then(function(e){o.upgradeAvailable=e,console.timeEnd(s),t(o)}).catch(function(e){console.timeEnd(s),t(o),logger.error(e)}))},function(){n()})},function(e){console.timeEnd(s),n(e),logger.error(e)})})}function smartReadProcessRecs(e,t,n,r,s){return new Promise(function(o,a){var c=[];t.forEach(function(e){var t=e[1];for(var s in t){var o=_.findWhere(n,{path:s});void 0!==o&&(t[s]=maybeReadTransformType(t[s],o.appColType,o.platColType),"LastModifiedDate"==s&&(e[1].dirtyFlag=calcDirtyFlag(e[1][s],r)))}c.push(t)}),s.records=c.filter(function(e){return"object"==typeof e}),enrichWithRecordTypeNames(s.records,e).then(function(e){return s.records=e,vsnUtils.upgradeAvailable()}).then(function(e){s.upgradeAvailable=e,o(s)}).catch(function(e){o(s),logger.error(e)})})}function parseSmartSql(e,t){return new Promise(function(n,r){if(m=t.match(/.* WHERE (.* = .*)/i),console.debug("m",m),null!==m&&null!==m[1]){var s={},o="";m[1].split("AND").forEach(function(e){mWhere=e.match(/{(.*):(.*)} = (.*)/i),whereField=mWhere[2],o=mWhere[3].split("'")[1],s[whereField]=o}),void 0!==s.Id&&s.Id.length>18?smartStoreUtils.getProxyFieldName(e).then(function(e){console.log("proxyFieldName",e),parsedSmartSql=t.replace("Id} =",e+"} ="),n(parsedSmartSql)}):n(t)}else n(t)})}function calcDirtyFlag(e,t){return t&&"null"!=t||(t=0),e.valueOf()>t}function innerProcessRefreshTablePromise(e){return new Promise(function(t,n){var r=function(e){console.debug("innerProcessRefreshTablePromise res",e),t(e)},s={table:e};syncRefresh.p2mRefreshTable(e,0,!1,1,1,null,function(e){console.debug("refreshStatusObject",e),e.status==syncRefresh.P2M_REFRESH_OK?(s.status=SYNC,r(s)):(s.status=e.status,s.mc_add_status=e.mc_add_status,r(s))},function(e){logger.error("innerProcessRefreshTablePromise error",e),n(e)})})}function initialSync(e){return console.time("initialSync"),new Promise(function(t,n){if(0===e.length)t({status:SYNC+MANDATORY_MISSING});else{var r={};syncRefresh.heartBeat(function(s){if(console.log("heartbeat call gave "+s.status),s.status==syncRefresh.HEARTBEAT_OK||s.status==syncRefresh.HEARTBEAT_NOT_DEVICE||s.status==syncRefresh.HEARTBEAT_REFRESHED_OK){var o=[];console.debug("tableNames",JSON.stringify(e)),dirtyTables().then(function(t){return console.debug("dirtyTableNames",t),t.forEach(function(t){var n=e.indexOf(t);n>-1&&(o.push({table:t,status:SYNC_NOK_STATUS,mc_add_status:"Dirty records"}),e.splice(n,1))}),console.debug("tableNames",e),console.debug("resArr",o),doInitialSync(e)}).then(function(e){console.debug("doInitialSync res",e);var r=o.concat(e);console.debug("Promise.all resArrFinal",r),console.timeEnd("initialSync"),t(r);connSessUtils.maybeSyncConnSess({mobilecaddy1__Mobile_Process_Status__c:""},function(){console.log("success return from maybeSyncConnSess")},function(e){n(e),logger.error(e)})}).catch(function(e){n(e),logger.error(e)})}else r.status=SYNC_NOK_STATUS,r.mc_add_status=s.status,t(r),100101==r.mc_add_status||100102==r.mc_add_status?logger.error(r):logger.log(r)},function(e){logger.error(e),r.status=SYNC_NOK_STATUS,t(r)})}})}function doInitialSync(e){Promise.resolve();var t=[];return e.reduce(function(e,n){return e.then(function(e){return innerProcessRefreshTablePromise(n)}).then(function(e){return t.push(e),t}).catch(function(e){logger.errorAndDispatch(e),reject(e)})},Promise.resolve())}function syncMobileTable(e,t,n,r,s){console.time("syncMobileTable"),t=void 0===t||t;n||(n=0),r||(r=50),s||(s=!1);var o=function(e,t,r){var s={};syncRefresh.p2mRefreshTable(e,n,!0,1,1,null,function(e){console.debug("refreshStatusObject",e),e.status==syncRefresh.P2M_REFRESH_OK?(s.status=SYNC,t(s)):(s.status=e.status,s.mc_add_status=e.mc_add_status,t(s))},r)},a=function(e,t,s){var o={};smartStoreUtils.queryMobileTable("recsToSync","Mobile_Table_Name",e,function(c){if(c.length>0)try{syncRefresh.m2pUpdateMobileTable(e,r,function(r){console.log("m2pStatusObject",r),r.status==syncRefresh.M2P_UPDATE_OK&&void 0===r.mc_add_status?(n=0,o.status=0,t(o)):r.status==syncRefresh.M2P_UPDATE_OK&&"more-to-sync"===r.mc_add_status?(console.log("moreToSync - Going round again"),a(e,t,s)):(o.status=r.status,o.mc_add_status=r.mc_add_status,t(o))},s)}catch(e){console.error(e)}else o.status=2,o.mc_add_status="no-sync-no-updates",t(o)},s)},c=function(e,t,n,r,c){var i={};console.log("skipP2M",s),"Dynamic (Submit First/Retain)"==t||"Dynamic (Submit First/Clear)"==t?a(e,function(t){console.log("statusObject",t),!s&&(0===t.status||n&&2==t.status)?o(e,r,c):s&&0===t.status||2==t.status?(i.status=SYNC,i.mc_add_status=t.mc_add_status,r(i)):(i.status=SYNC_NOK_STATUS,i.mc_add_status=t.mc_add_status,r(i))},c):"Submit Only"==t||"Submit & Clear"==t||"Submit & Destroy"==t?a(e,function(e){0===e.status?(i.status=SYNC,r(i)):(i.status=SYNC_NOK_STATUS,i.mc_add_status=e.mc_add_status,r(i))},c):logger.errorAndDispatch("Unknown sync type",t,s)};return new Promise(function(n,r){var s={},a=function(e){localStorage.removeItem("syncInProgressTime"),n(e)},i=function(e){localStorage.removeItem("syncInProgressTime"),r(e)},l="syncTime"+e,u=localStorage.getItem(l),E=(new Date).valueOf(),d=u?parseInt(u)+5e3:0;"Connection_Session__mc"!=e&&E<d?(s.status=SYNC,s.mc_add_status="sync-too-soon",console.timeEnd("syncMobileTable"),n(s)):(localStorage.setItem(l,E),tableExists(e,SYNC).then(function(){syncRefresh.heartBeat(function(l){if(console.log("heartbeat call gave "+l.status),l.status==syncRefresh.HEARTBEAT_OK||l.status==syncRefresh.HEARTBEAT_NOT_DEVICE||l.status==syncRefresh.HEARTBEAT_REFRESHED_OK){var u=localStorage.getItem("syncInProgressTime"),E=(new Date).valueOf();console.log("syncInProgressTime",u,E),"Connection_Session__mc"!=e&&u&&u>E-12e4?(console.log("SYNC_ALREADY_IN_PROGRESS"),s.status=SYNC+SYNC_ALREADY_IN_PROGRESS_INC,i(s)):(localStorage.setItem("syncInProgressTime",E),smartStoreUtils.getTableDefnColumnValue(e,"Sync Type").then(function(l){connSessUtils.getRTSPendingconnSess(function(u){"Mobile_Log__mc"!=e?null!==u&&void 0!==u?connSessUtils.csStatusCheck(u,function(r){r.status==connSessUtils.CONN_SESS_OK?"Refresh Only"==l||"Refresh & Clear"==l?o(e,a,i):c(e,l,t,a,i):(s.status=SYNC_OK,s.mc_add_status=r.status,console.timeEnd("syncMobileTable"),n(s))},function(e){logger.errorAndDispatch(e),r(e)}):"Refresh Only"==l||"Refresh & Clear"==l?o(e,a,i):c(e,l,t,a,i):c(e,l,!1,a,i)},i)}).catch(function(e){i(e)}))}else s.status=SYNC_NOK_STATUS,s.mc_add_status=l.status,console.timeEnd("syncMobileTable"),n(s),100101==s.mc_add_status||100102==s.mc_add_status?logger.error(s):logger.log(s)},i)}).catch(i))})}function updateRecords(e,t,n){var r={};return new Promise(function(s,o){t.length>0?tableExists(e,UPDATE_RECS).then(function(){return listMobileTableColumns(e)}).then(function(t){return checkTableAccess(e,UPDATE_RECS,t)}).then(function(r){return new Promise(function(s,o){var a=isValidFieldAndTranslate(n,UPDATE_RECS,r);a.status!=UPDATE_RECS+UNKONWN_FIELD?validateRecords(e,n,UPDATE_RECS,t,r).then(function(e){e.status==UPDATE_RECS?s(e.records):o(e)}):o(a)})}).then(function(t){smartStoreUtils.updateRecordsWithExternalId(e,t,n,function(e){r.status=UPDATE_RECS,r.records=e,vsnUtils.upgradeAvailable().then(function(e){r.upgradeAvailable=e,s(r)}).catch(function(e){s(r)})},function(e){o(e),logger.error(e)})},function(e){o(e),logger.error(e)}):(r.status=UPDATE_RECS,r.mc_add_status="No records supplied",r.records=[],s(r),logger.warn(r))})}export const SYNC_OK=SYNC;export const SYNC_NOK=SYNC_NOK_STATUS;export const SYNC_ALREADY_IN_PROGRESS=SYNC+SYNC_ALREADY_IN_PROGRESS_INC;export const SYNC_UNKONWN_TABLE=SYNC+UNKONWN_TABLE;export const SYNC_MANDATORY_MISSING=SYNC+MANDATORY_MISSING;export const DELETE_RECS_OK=DELETE_RECS;export const DELETE_RECS_UNKONWN_TABLE=DELETE_RECS+UNKONWN_TABLE;export const DELETE_RECS_UNKONWN_FIELD=DELETE_RECS+UNKONWN_FIELD;export const DELETE_RECS_ACCESS_DENIED=DELETE_RECS+ACCESS_DENIED;export const DELETE_RECS_MANDATORY_MISSING=DELETE_RECS+MANDATORY_MISSING;export const INSERT_RECS_OK=INSERT_RECS;export const INSERT_RECS_UNKONWN_TABLE=INSERT_RECS+UNKONWN_TABLE;export const INSERT_RECS_UNKONWN_FIELD=INSERT_RECS+UNKONWN_FIELD;export const INSERT_RECS_ACCESS_DENIED=INSERT_RECS+ACCESS_DENIED;export const INSERT_RECS_MANDATORY_MISSING=INSERT_RECS+MANDATORY_MISSING;export const INSERT_RECS_DATATYPE_MISMATCH=INSERT_RECS+DATATYPE_MISMATCH;export const INSERT_RECS_PROTECTED_FIELD=INSERT_RECS+PROTECTED_FIELD;export const INSERT_RECS_UNKNOWN_RECORD_TYPE=INSERT_RECS+UNKNOWN_RECORD_TYPE;export const READ_RECS_OK=READ_RECS;export const READ_RECS_UNKONWN_TABLE=READ_RECS+UNKONWN_TABLE;export const READ_RECS_ACCESS_DENIED=READ_RECS+ACCESS_DENIED;export const UPDATE_RECS_OK=UPDATE_RECS;export const UPDATE_RECS_UNKONWN_TABLE=UPDATE_RECS+UNKONWN_TABLE;export const UPDATE_RECS_UNKONWN_FIELD=UPDATE_RECS+UNKONWN_FIELD;export const UPDATE_RECS_ACCESS_DENIED=UPDATE_RECS+ACCESS_DENIED;export const UPDATE_RECS_DATATYPE_MISMATCH=UPDATE_RECS+DATATYPE_MISMATCH;export const UPDATE_RECS_UNKNOWN_ID=UPDATE_RECS+UNKNOWN_ID;export const UPDATE_RECS_UNKNOWN_RECORD_TYPE=UPDATE_RECS+UNKNOWN_RECORD_TYPE;export const GET_REC_TYPES_UNKONWN_TABLE=GET_REC_TYPES+UNKONWN_TABLE;export{analInc,deleteRecord,dirtyTables,syncMobileTable,initialSync,getCurrentUserId,getCurrentUserName,getUserLocale,getCachedAppSoupValue,getRecordTypes,insertRecord,insertRecords,logout,readRecords,smartSql,updateRecord,updateRecords,maybeReadTransformType,maybeWriteTransformType};