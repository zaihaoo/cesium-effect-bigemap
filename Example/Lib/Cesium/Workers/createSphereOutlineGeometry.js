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
define(["./defaultValue-0ab18f7d","./Matrix3-65932166","./EllipsoidOutlineGeometry-9ea9a1b5","./Math-422cd179","./Transforms-f9e365d3","./Matrix2-82a3f96e","./RuntimeError-e5c6a8b9","./combine-4598d225","./ComponentDatatype-c4eaff65","./WebGLConstants-f27a5e29","./GeometryAttribute-5f1e74bd","./GeometryAttributes-eb2609b7","./GeometryOffsetAttribute-cc320d7d","./IndexDatatype-9c4154c8"],(function(e,i,t,n,r,o,s,a,d,l,c,u,m,p){"use strict";function f(n){const r=e.defaultValue(n.radius,1),o={radii:new i.Cartesian3(r,r,r),stackPartitions:n.stackPartitions,slicePartitions:n.slicePartitions,subdivisions:n.subdivisions};this._ellipsoidGeometry=new t.EllipsoidOutlineGeometry(o),this._workerName="createSphereOutlineGeometry"}f.packedLength=t.EllipsoidOutlineGeometry.packedLength,f.pack=function(e,i,n){return t.EllipsoidOutlineGeometry.pack(e._ellipsoidGeometry,i,n)};const y=new t.EllipsoidOutlineGeometry,G={radius:void 0,radii:new i.Cartesian3,stackPartitions:void 0,slicePartitions:void 0,subdivisions:void 0};return f.unpack=function(n,r,o){const s=t.EllipsoidOutlineGeometry.unpack(n,r,y);return G.stackPartitions=s._stackPartitions,G.slicePartitions=s._slicePartitions,G.subdivisions=s._subdivisions,e.defined(o)?(i.Cartesian3.clone(s._radii,G.radii),o._ellipsoidGeometry=new t.EllipsoidOutlineGeometry(G),o):(G.radius=s._radii.x,new f(G))},f.createGeometry=function(e){return t.EllipsoidOutlineGeometry.createGeometry(e._ellipsoidGeometry)},function(i,t){return e.defined(t)&&(i=f.unpack(i,t)),f.createGeometry(i)}}));
