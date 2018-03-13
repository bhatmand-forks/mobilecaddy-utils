/* mobilecaddy-utils - v2.0.0 - Bundle Time: 2018-03-12 15:46:01 */
/* git info: "2018-03-08 11:35:36 +0000": 34e66b2d6ddf746b6814f8563e576e511cc89c8f (v2) */
/* Copyright 2018 MobileCaddy Ltd */

import*as smartStoreUtils from"./smartStoreUtils";import*as appDataUtils from"./appDataUtils";import*as devUtils from"./devUtils";import*as syncRefresh from"./syncRefresh";import*as vsnUtils from"./vsnUtils";import*as logger from"./logger";var smartstore=cordova.require("com.salesforce.plugin.smartstore");const LOCAL_DEV=!!window.LOCAL_DEV,USE_FORCETK=!!window.USE_FORCETK;function getRTSPendingconnSess(e,n){smartStoreUtils.querySoupRecords("recsToSync",function(s){console.debug("recsToSync -> "+JSON.stringify(s));for(var o=null,t=null,r=0;r<s.length;r++)if(console.debug("recsToSync["+r+"] -> "+JSON.stringify(s[r])),null!==s[r].Current_Connection_Session&&void 0!==s[r].Current_Connection_Session){o=s[r].Current_Connection_Session,t=s[r];break}if(null!==o&&void 0!==o){var c=(new Date).getTime(),i=t._soupLastModifiedDate+3e4;if(c>i)console.debug("timeNow > timeoutTs",c,i),console.debug("We have a timedout Conn_Sess",o),e(o);else{console.debug("We have a SYNC_ALREADY_IN_PROGRESS",o);var a={status:100498};n(a)}}else console.debug("getRTSPendingconnSess - All clear"),e(o)},n)}var CONN_SESS_OK=100200,CONN_SESS_NOK=100201;function csStatusCheck(e,n,s){console.debug("csStatusCheck -> "+e);try{var o;appDataUtils.getCachedCurrentValueFromAppSoup("syncRefreshVersion").then(function(e){return o=e,syncRefresh.buildConnectionSession(o,"Status Check","M2P SC Status Check Requested",1,1,null)}).then(function(t){syncRefresh.heartBeat(function(r){var c;r.status==syncRefresh.HEARTBEAT_OK||r.status==syncRefresh.HEARTBEAT_NOT_DEVICE||r.status==syncRefresh.HEARTBEAT_REFRESHED_OK?appDataUtils.getCachedCurrentValueFromAppSoup("audId").then(function(r){c=r;var i=function(o,r){var c;r.status?((c=JSON.parse(o)).cs_fc_jr&&(c.cs_fc_jr=JSON.parse(c.cs_fc_jr)),console.debug("Parse json status check done"),"Received Processed"==c.cs_fc_sc?handleCsStatusCheckRespReceivedProcessed(t,c,n,s):clearRTSRecs(e,function(){smartStoreUtils.queryMobileTable("Connection_Session__mc","mobilecaddy1__MC_Proxy_ID__c",e,function(e){if(e.length>0){var o=e[0];"Received Not Processed"==c.cs_fc_sc?handleCsStatusCheckRespReceivedNotProcessed(o,t,c,n,s):handleCsStatusCheckRespNotReceived(o,t,c,n,s)}else n({status:CONN_SESS_OK})},s)},s)):(logger.error("csStatusCheck",r.message),n({status:CONN_SESS_NOK}))},a=t.connSessJson,u=localStorage.getItem("lastErrorLog");u&&(localStorage.removeItem("lastErrorLog"),(a=JSON.parse(a)).lastErrorLog=u,a=JSON.stringify(a)),!0===USE_FORCETK?force.request({method:"POST",path:"/services/apexrest/mobilecaddy1/m2pCSStatusCheck001",contentType:"application/json",data:{audId:c,syncRefreshDataVersion:o,statusCheckCSProxyId:e,connSessJson:a,startPageControllerVersion:mobileCaddy.START_PAGE_CONTROLLER_VSN}},function(e,n){console.info("response -> "+JSON.stringify(e)),void 0===n&&((n={}).status="200"),i(e,n)},function(e){logger.error("err -> "+JSON.stringify(e)),s(e)}):Visualforce.remoting.Manager.invokeAction("mobilecaddy1."+mobileCaddy.START_PAGE_CONTROLLER+".m2pCSStatusCheck",c,o,e,a,i,{buffer:!1,escape:!1,timeout:3e4})}).catch(function(e){s(e)}):cleanConnectionSessionHeartBeat(r,t,function(e){n({status:CONN_SESS_OK,mc_add_status:e.mc_add_status})},s)},s)}).catch(function(e){s(e)})}catch(e){logger.errorAndDispatch(e)}}function handleCsStatusCheckRespReceivedProcessed(e,n,s,o){try{processM2PUpdateResponse(n.cs_fc_jr,function(t){e.connSessionRec.mobilecaddy1__Mobile_Process_Status__c="M2P SC - Status Check Processed",e.connSessionRec.SystemModstamp=(new Date).getTime(),e.connSessionRec.mobilecaddy1__Status__c="Closed",e.connSessionRec.Id=n.cs_sc_sf,smartStoreUtils.queryMobileTable("Connection_Session__mc","Id",n.cs_fc_jr.cp).then(function(s){var o=s[0];return console.log("m2pCsObject",o),o.Id=n.cs_fc_jr.csId,o.SystemModstamp=(new Date).getTime(),o.mobilecaddy1__Mobile_Process_Status__c="M2P Records Processed",postProcessConnectionSession([e.connSessionRec,o])}).then(function(){s({status:CONN_SESS_OK})}).catch(function(e){o(e)})},o)}catch(e){logger.errorAndDispatch("processM2PUpdateResponse",e),o("processM2PUpdateResponse-error")}}function handleCsStatusCheckRespReceivedNotProcessed(e,n,s,o,t){e.mobilecaddy1__Mobile_Process_Status__c="M2P UP Failed - RTS Cleared",e.mobilecaddy1__Session_Type__c="Sync Update",e.mobilecaddy1__Status__c="Closed",e.SystemModstamp=(new Date).getTime(),e.Id=s.cs_fc_sf,postProcessConnectionSession(e).then(function(){n.connSessionRec.mobilecaddy1__Mobile_Process_Status__c="M2P SC - Status Check Processed",n.connSessionRec.SystemModstamp=(new Date).getTime(),n.connSessionRec.mobilecaddy1__Status__c="Closed",n.connSessionRec.Id=s.cs_sc_sf,postProcessConnectionSession(n.connSessionRec,function(){o({status:CONN_SESS_OK})},t)}).catch(function(e){t(e)})}function handleCsStatusCheckRespNotReceived(n,s,o,t,r){smartStoreUtils.deleteRecordsFromSoup([n],"Connection_Session__mc",function(n){s.connSessionRec.mobilecaddy1__Mobile_Process_Status__c="M2P SC - Status Check Processed",s.connSessionRec.SystemModstamp=(new Date).getTime(),s.connSessionRec.mobilecaddy1__Status__c="Closed",s.connSessionRec.Id=o.cs_sc_sf,s.connSessionRec.mobilecaddy1__Session_Type__c="Status Check",postProcessConnectionSession(s.connSessionRec).then(function(){t({status:CONN_SESS_OK})}).catch(function(){r(e)})},r)}function processM2PUpdateResponse(e,n,s,o){o||(o=s,s=n,n="{}");var t=1;console.debug("processM2PUpdateResponse",e,n);var r=e.mt,c=void 0!==e.is?e.is:[],i=void 0!==e.id?e.id:[],a=void 0!==e.us?e.us:[],u=void 0!==e.ifmf?e.ifmf:[],d=void 0!==e.ufmf?e.ufmf:[],p=[],l=[],_=[],f=[],S=[],R=[],m=[],h=[],C=[],b=[],y=[];if(c=c.concat(i),void 0===e.if)b=[];else if(void 0===e.if.if)b=e.if;else{t=2;var g=e.if.if.map(function(n){return{pd:n,fbe:void 0!==e.ifbe?e.ifbe:"K"}}),U=e.if.ifv.map(function(n){return{pd:n,fbe:void 0!==e.ifvbe?e.ifvbe:"K"}}),v=e.if.icv.map(function(n){return{pd:n,fbe:void 0!==e.icvbe?e.icvbe:"K"}});b=g.concat(U.concat(v))}addNonRespondedIds(n,c,b,u).then(function(n){if(b=n,void 0===e.uf)y=[];else if(void 0===e.uf.uf)y=e.uf;else{t=2;var s=e.uf.uf.map(function(n){return{Id:n,fbe:void 0!==e.ufbe?e.ufbe:"K"}}),o=e.uf.usv.map(function(n){return{Id:n,fbe:void 0!==e.usvbe?e.usvbe:"K"}}),c=e.uf.sdf.map(function(n){return{Id:n,fbe:void 0!==e.sdfbe?e.sdfbe:"K"}}),i=e.uf.hdf.map(function(n){return{Id:n,fbe:void 0!==e.hdfbe?e.hdfbe:"K"}}),a=e.uf.ufv.map(function(n){return{Id:n,fbe:void 0!==e.ufvbe?e.ufvbe:"K"}}),u=e.uf.ucv.map(function(n){return{Id:n,fbe:void 0!==e.ucvbe?e.ucvbe:"K"}});y=s.concat(o.concat(c.concat(i.concat(a.concat(u)))))}return querySoupRecsPromise("SnapShot_"+r)}).then(function(e){return C=e,querySoupRecsPromise(r)}).then(function(n){console.debug("priRecords -> "+JSON.stringify(n)),smartStoreUtils.queryMobileTable("recsToSync","Mobile_Table_Name",r,function(i){for(var g in i)if(console.debug("recsToSyncRec[i] = "+JSON.stringify(i[g])),i[g].Current_Connection_Session==e.cp){var U=!1,v={},O={};switch(i[g].CRUD_Operation){case"Insert":case"InsertUpdate":for(var T in c)if(i[g].Id==c[T].pd){if(c[T].crud=i[g].CRUD_Operation,O=priFromRespRec(c[T],n),"Insert"==i[g].CRUD_Operation){switch(e.stbe){case"D":m.push(O),h.push(c[T]);break;default:if("U"==c[T].pc){if(O.Id=c[T].Id,void 0!==c[T].an&&(void 0!==c[T].nf?O[c[T].nf]=c[T].an:O.Name=c[T].an),void 0!==c[T].lu)for(var E in c[T].lu)c[T].lu.hasOwnProperty(E)&&console.debug("prop",E,c[T].lu[E]),O[E]=c[T].lu[E];f.push(O),R.push(O)}}l.push(i[g]._soupEntryId)}else{if(O.Id=c[T].Id,void 0!==c[T].an&&(void 0!==c[T].nf?O[c[T].nf]=c[T].an:O.Name=c[T].an),void 0!==c[T].lu)for(var I in c[T].lu)c[T].lu.hasOwnProperty(I)&&console.debug("iUProp",I,c[T].lu[I]),O[I]=c[T].lu[I];f.push(O);var P=priFromRespRec(c[T],C);P.Id=c[T].Id,R.push(P),(v=i[g]).Current_Connection_Session=null,v.CRUD_Operation="Update",v.Id=c[T].Id,p.push(v)}U=!0;break}if(!U)for(T in b)if(console.info("failure",i[g].Id,b[T].pd),i[g].Id==b[T].pd){if(b[T].crud=i[g].CRUD_Operation,"Insert"==i[g].CRUD_Operation)switch("K",1==t?getFailBehaviour(0,b[T].fl,e):b[T].fbe){case"K":(v=i[g]).Current_Connection_Session=null,p.push(v);break;case"R":break;default:O=priFromRespRec(b[T],n),m.push(O),l.push(i[g]._soupEntryId),h.push(b[T])}else"InsertUpdate"==i[g].CRUD_Operation&&((v=i[g]).Current_Connection_Session=null,v.CRUD_Operation="Insert",p.push(v));U=!0;break}if(!U)for(T in u)if(i[g].Id==u[T].pd){if(u[T].crud=i[g].CRUD_Operation,"Insert"==i[g].CRUD_Operation)switch(u[T].fbe){case"K":(v=i[g]).Current_Connection_Session=null,p.push(v);break;case"R":break;default:O=priFromRespRec(u[T],n),m.push(O),l.push(i[g]._soupEntryId),h.push(u[T])}else"InsertUpdate"==i[g].CRUD_Operation&&((v=i[g]).Current_Connection_Session=null,v.CRUD_Operation="Insert",p.push(v));U=!0;break}break;case"Update":case"UpdateUpdate":for(T in a)if(i[g].Id==a[T].Id){if(a[T].crud=i[g].CRUD_Operation,"Update"==i[g].CRUD_Operation){switch(O=priFromRespRec(a[T],n),e.stbe){case"D":m.push(O),h.push(a[T]);break;default:if("M"==a[T].pc&&(O.SystemModstamp=new Date(a[T].sm)),void 0!==a[T].lu)for(var N in console.debug("lu",a[T].lu),a[T].lu)a[T].lu.hasOwnProperty(N)&&(O[N]=a[T].lu[N]);_.push(O),S.push(O)}l.push(i[g]._soupEntryId)}else"UpdateUpdate"==i[g].CRUD_Operation&&((v=i[g]).Current_Connection_Session=null,v.CRUD_Operation="Update",p.push(v));U=!0;break}if(!U)for(T in y)if(i[g].Id==y[T].Id){if("Update"==i[g].CRUD_Operation)switch("K",1==t?getFailBehaviour(1,y[T].fl,e):y[T].fbe){case"K":(v=i[g]).Current_Connection_Session=null,p.push(v);break;case"R":break;default:O=priFromRespRec(y[T],n),m.push(O),l.push(i[g]._soupEntryId),h.push(y[T])}else"UpdateUpdate"==i[g].CRUD_Operation&&((v=i[g]).Current_Connection_Session=null,v.CRUD_Operation="Update",p.push(v));U=!0;break}if(!U)for(T in d)if(i[g].Id==d[T].pd){if(d[T].crud=i[g].CRUD_Operation,"Update"==i[g].CRUD_Operation)switch(d[T].fbe){case"K":(v=i[g]).Current_Connection_Session=null,p.push(v);break;case"R":break;default:O=priFromRespRec(d[T],n),m.push(O),l.push(i[g]._soupEntryId),h.push(d[T])}else"UpdateUpdate"==i[g].CRUD_Operation&&((v=i[g]).Current_Connection_Session=null,v.CRUD_Operation="Update",p.push(v));U=!0;break}}}var D;console.info("priToInsertRecs",f),console.info("rtsToUpdateRecs",p),smartStoreUtils.getProxyFieldName(r).then(function(e){return D=e,m2pRespUpRecs(r,"Id",_)}).then(function(e){return console.debug("m2pRespUpRecs ("+r+") res -> "+JSON.stringify(e)),m2pRespUpRecs(r,D,f)}).then(function(e){return console.debug("m2pRespUpRecs"+r+") (PROXY KEY) res -> "+JSON.stringify(e)),m2pRespUpRecs("SnapShot_"+r,"Id",S)}).then(function(e){return console.debug("m2pRespUpRecs"+r+") (PROXY KEY) res -> "+JSON.stringify(e)),m2pRespUpRecs("SnapShot_"+r,D,R)}).then(function(e){return console.debug("m2pRespUpRecs (SnapShot_"+r+") res -> "+JSON.stringify(e)),m2pRespDelRecs(r,m)}).then(function(e){return console.debug("m2pRespDelRecs res -> "+JSON.stringify(e)),m2pRespDelRecs("SnapShot_"+r,h)}).then(function(e){return console.debug("m2pRespDelRecs (SnapShot_' + mobileTable + ') res -> "+JSON.stringify(e)),m2pRespUpRTSRecs(p)}).then(function(e){return console.debug("m2pRespUpRTSRecs res -> "+JSON.stringify(e)),m2pRespDelRTSRecs(l)}).then(function(n){return console.debug("m2pRespDelRTSRecs res -> "+JSON.stringify(n)),vsnUtils.checkForMigrateToInfo(e)}).then(function(){var n={status:0};n.csId=e.csId,s(n)}).catch(function(e){logger.errorAndDispatch("m2pResp error for "+r,e),o(e)})},o)}).catch(function(e){logger.errorAndDispatch("Err reading table",r),o(e)})}function priFromRespRec(e,n){var s={};return"Insert"==e.crud||"InsertUpdate"==e.crud?s.Id=e.pd:s.Id=e.Id,_.findWhere(n,s)}function getFailBehaviour(e,n,s){switch(e){case 0:switch(n){case"DF":return s.ifbe;case"CV":return s.icvbe;case"FV":return s.ifvbe}break;case 1:switch(n){case"DF":return s.ufbe;case"SV":return s.usvbe;case"CV":return s.ucvbe;case"FV":return s.ufvbe;case"SD":return s.sdfbe;case"HD":return s.hdfbe}}}function addNonRespondedIds(e,n,s,o){return new Promise(function(t,r){e=JSON.parse(e);var c=s.concat(o),i=s;if(e.records&&e.records.length>n.length+c.length){var a=[];smartStoreUtils.getProxyFieldName(e.MobileTable).then(function(o){e.records.forEach(function(e){if("I"==e.RecordCRUD){var s=e.fields.find(function(e){return e.name==o}).value;_.findWhere(n,{pd:s})||_.findWhere(c,{pd:s})||a.push({pd:s,fbe:"K"})}}),a.length>0&&(i=s.concat(a)),t(i)})}else t(i)})}function querySoupRecsPromise(e){return new Promise(function(n,s){smartStoreUtils.querySoupRecords(e,function(e){n(e)},function(e){s(e)})})}function m2pRespUpRecs(e,n,s){return console.debug("m2pRespUpRecs ("+e+") updateRecs -> "+JSON.stringify(s)),new Promise(function(o,t){s.length>0?smartstore.upsertSoupEntriesWithExternalId(e,s,n,function(e){o(e)},function(e){t(e)}):o("OK")})}function m2pRespDelRTSRecs(e){return console.debug("m2pRespDelRTSRecs recsToDel -> "+JSON.stringify(e)),new Promise(function(n,s){e.length>0?smartstore.removeFromSoup("recsToSync",e,function(e){n(e)},function(e){s(e)}):n("OK")})}function m2pRespUpRTSRecs(e){return console.debug("m2pRespUpRTSRecs recsToUp -> "+JSON.stringify(e)),new Promise(function(n,s){e.length>0?smartstore.upsertSoupEntries("recsToSync",e,function(e){n(e)},function(e){s(e)}):n("OK")})}function m2pRespDelRecs(e,n){return console.debug("m2pRespDelRecs ("+e+") recsToDel -> "+JSON.stringify(n)),new Promise(function(s,o){if(n.length>0)if(-1==e.indexOf("SnapShot"))smartStoreUtils.deleteRecordsFromSoup(n,e,function(e){s(e)},function(e){o(e)});else{console.debug("Deleting from SnapShot ",e);var t=n.filter(function(e){return null!==e&&void 0!==e});smartStoreUtils.deleteRecordsForExternalId(e,t,"Id",function(e){s(e)},function(e){logger.errorAndDispatch(e),o(e)})}else s("OK")})}function clearRTSRecs(e,n,s){console.log("clearRTSRecs",e),smartStoreUtils.queryMobileTable("recsToSync","Current_Connection_Session",e,function(e){if(0!==e.length){for(var o=0;o<e.length;o++)e[o].Current_Connection_Session=null,"InsertUpdate"==e[o].CRUD_Operation?e[o].CRUD_Operation="Insert":"UpdateUpdate"==e[o].CRUD_Operation&&(e[o].CRUD_Operation="Update");smartstore.upsertSoupEntries("recsToSync",e,n,s)}else n()},s)}var CLEAN_CS_OK=100600;function cleanConnectionSessionVFEvent(e,n,s,o){var t={bogus:!0};"exception"===e.type?t.status=syncRefresh.HEARTBEAT_EXCEPTION:t.status=syncRefresh.HEARTBEAT_FAILURE,cleanConnectionSessionHeartBeat(t,n,s,o)}function cleanConnectionSessionHeartBeat(e,n,s,o){console.log("in clean connection session heart beat");var t={},r=null;e.status==syncRefresh.HEARTBEAT_NO_CONNECTION?"Sync - Refresh"==n.connSessionRec.mobilecaddy1__Session_Type__c?r="P2M RE Heartbeat No Connection":"Status Check"==n.connSessionRec.mobilecaddy1__Session_Type__c&&(r="M2P SC Heartbeat No Connection"):e.status==syncRefresh.HEARTBEAT_EXCEPTION?"Sync - Refresh"==n.connSessionRec.mobilecaddy1__Session_Type__c?r=e.bogus?"P2M RE Exception/Timeout":"P2M RE Heartbeat Exception/Timeout":"Status Check"==n.connSessionRec.mobilecaddy1__Session_Type__c&&(r=e.bogus?"M2P SC Exception/Timeout":"M2P SC Heartbeat Exception/Timeout"):e.status==syncRefresh.HEARTBEAT_FAILURE&&("Sync - Refresh"==n.connSessionRec.mobilecaddy1__Session_Type__c?r=e.bogus?"P2M RE Failure":"P2M RE Hearbeat Failure":"Status Check"==n.connSessionRec.mobilecaddy1__Session_Type__c&&(r=e.bogus?"M2P SC Failure":"M2P SC Heartbeat Failure")),null!==r?(n.connSessionRec.mobilecaddy1__Mobile_Process_Status__c=r,n.connSessionRec.SystemModstamp=(new Date).getTime(),n.connSessionRec.mobilecaddy1__Status__c="Closed",console.log("Upserting connection session"),smartstore.upsertSoupEntries("Connection_Session__mc",[n.connSessionRec],function(){t.status=CLEAN_CS_OK,t.mc_add_status=e.status,s(t)},o)):(logger.error("Unknown heartBeatObject.status. ",e.status),o())}function maybeSyncConnSess(e,n,s){var o={};console.debug("maybeSyncConnSess"),smartStoreUtils.querySoupRecsPromise("recsToSync").then(function(t){console.debug("Success from readRecords recsToSync -> "+JSON.stringify(t));var r=_.filter(t,function(e){return void 0!==e.currentConnectionSession});console.debug("connSessRTS -> "+JSON.stringify(r)),r.length>1||"M2P Conn_Sess Records Processed"!=e.mobilecaddy1__Mobile_Process_Status__c?devUtils.syncMobileTable("Connection_Session__mc").then(function(e){console.debug("syncMobileTable -> ",JSON.stringify(e)),o.status=0,n(o)}).catch(function(e){logger.warn("syncMobileTable ERROR -> ",e),s(e)}):(console.debug("maybeSyncConnSess - not syncing"),o.status=0,n(o))}).catch(function(e){logger.error("querySoupRecsPromise ERROR -> ",e),s(e)})}function postProcessConnectionSession(e){return new Promise(function(n,s){var o=function(e){logger.error("postProcessConnectionSession error",e),s(e)},t=Array.isArray(e)?e:[e],r={};smartstore.upsertSoupEntries("Connection_Session__mc",t,function(s){var c=Array.isArray(e);c=t.map(function(e){return{Id:e.Id,SystemModstamp:e.SystemModstamp-1,mobilecaddy1__Session_Type__c:null,mobilecaddy1__Mobile_Process_Status__c:null,mobilecaddy1__Session_Created_Location_Error__c:null,mobilecaddy1__MC_Proxy_ID__c:null}}),smartstore.upsertSoupEntries("SnapShot_Connection_Session__mc",c,function(e){var s=e.map(function(e){return{Mobile_Table_Name:"Connection_Session__mc",CRUD_Operation:"Update",SOUP_Record_Id:e._soupEntryId,Id:e.Id,LastModifiedDateTime:e.SystemModstamp}});smartstore.upsertSoupEntries("recsToSync",s,function(){console.log("success from upsert of recs to sync"),r.status=0,n(r)},o)},o)},o)})}function handleUpdatedCS(e){return new Promise(function(n,s){console.log("handleUpdatedCS",e);e&&e.us&&0!==e.us.length?smartStoreUtils.deleteRecordsForExternalId("Connection_Session__mc",e.us,"Id").then(function(n){return smartStoreUtils.deleteRecordsForExternalId("SnapShot_Connection_Session__mc",e.us,"Id")}).then(function(n){return smartStoreUtils.deleteRecordsForExternalId("recsToSync",e.us,"Id")}).then(function(e){console.log("handleUpdatedCS -> deleted from CS and RTS OK"),n()}).catch(function(e){logger.error("handleUpdatedCS",e),n()}):n(),e&&e.uf&&0!==e.uf.length&&logger.error("handleUpdatedCS -> we have uf",e.uf)})}export{getRTSPendingconnSess,CLEAN_CS_OK,cleanConnectionSessionHeartBeat,cleanConnectionSessionVFEvent,CONN_SESS_OK,csStatusCheck,maybeSyncConnSess,processM2PUpdateResponse,postProcessConnectionSession,handleUpdatedCS};