/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.99
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */
define(["./defaultValue-0ab18f7d","./PrimitivePipeline-100df200","./createTaskProcessorWorker","./Transforms-f9e365d3","./Matrix3-65932166","./Math-422cd179","./Matrix2-82a3f96e","./RuntimeError-e5c6a8b9","./combine-4598d225","./ComponentDatatype-c4eaff65","./WebGLConstants-f27a5e29","./GeometryAttribute-5f1e74bd","./GeometryAttributes-eb2609b7","./GeometryPipeline-c53341a2","./AttributeCompression-7fdb1de9","./EncodedCartesian3-ef0d760e","./IndexDatatype-9c4154c8","./IntersectionTests-b7330d18","./Plane-23695f18","./WebMercatorProjection-7210ed68"],(function(e,t,r,n,o,i,s,a,f,c,d,u,b,m,l,p,y,P,k,C){"use strict";const G={};function W(t){let r=G[t];return e.defined(r)||("object"==typeof exports?G[r]=r=require(`Workers/${t}`):require([`Workers/${t}`],(function(e){r=e,G[r]=e}))),r}return r((function(r,n){const o=r.subTasks,i=o.length,s=new Array(i);for(let t=0;t<i;t++){const r=o[t],n=r.geometry,i=r.moduleName;if(e.defined(i)){const e=W(i);s[t]=e(n,r.offset)}else s[t]=n}return Promise.all(s).then((function(e){return t.PrimitivePipeline.packCreateGeometryResults(e,n)}))}))}));
