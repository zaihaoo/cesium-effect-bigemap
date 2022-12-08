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
define(["./defaultValue-0ab18f7d","./Matrix3-65932166","./EllipsoidGeometry-3620f470","./VertexFormat-84d83549","./Math-422cd179","./Transforms-f9e365d3","./Matrix2-82a3f96e","./RuntimeError-e5c6a8b9","./combine-4598d225","./ComponentDatatype-c4eaff65","./WebGLConstants-f27a5e29","./GeometryAttribute-5f1e74bd","./GeometryAttributes-eb2609b7","./GeometryOffsetAttribute-cc320d7d","./IndexDatatype-9c4154c8"],(function(e,t,i,r,o,a,n,s,c,d,l,m,u,p,f){"use strict";function y(r){const o=e.defaultValue(r.radius,1),a={radii:new t.Cartesian3(o,o,o),stackPartitions:r.stackPartitions,slicePartitions:r.slicePartitions,vertexFormat:r.vertexFormat};this._ellipsoidGeometry=new i.EllipsoidGeometry(a),this._workerName="createSphereGeometry"}y.packedLength=i.EllipsoidGeometry.packedLength,y.pack=function(e,t,r){return i.EllipsoidGeometry.pack(e._ellipsoidGeometry,t,r)};const G=new i.EllipsoidGeometry,k={radius:void 0,radii:new t.Cartesian3,vertexFormat:new r.VertexFormat,stackPartitions:void 0,slicePartitions:void 0};return y.unpack=function(o,a,n){const s=i.EllipsoidGeometry.unpack(o,a,G);return k.vertexFormat=r.VertexFormat.clone(s._vertexFormat,k.vertexFormat),k.stackPartitions=s._stackPartitions,k.slicePartitions=s._slicePartitions,e.defined(n)?(t.Cartesian3.clone(s._radii,k.radii),n._ellipsoidGeometry=new i.EllipsoidGeometry(k),n):(k.radius=s._radii.x,new y(k))},y.createGeometry=function(e){return i.EllipsoidGeometry.createGeometry(e._ellipsoidGeometry)},function(t,i){return e.defined(i)&&(t=y.unpack(t,i)),y.createGeometry(t)}}));
