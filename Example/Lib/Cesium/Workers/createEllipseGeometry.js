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
define(["./Matrix3-65932166","./defaultValue-0ab18f7d","./EllipseGeometry-9c643e54","./Math-422cd179","./Transforms-f9e365d3","./Matrix2-82a3f96e","./RuntimeError-e5c6a8b9","./combine-4598d225","./ComponentDatatype-c4eaff65","./WebGLConstants-f27a5e29","./EllipseGeometryLibrary-105b78ab","./GeometryAttribute-5f1e74bd","./GeometryAttributes-eb2609b7","./GeometryInstance-340fedcb","./GeometryOffsetAttribute-cc320d7d","./GeometryPipeline-c53341a2","./AttributeCompression-7fdb1de9","./EncodedCartesian3-ef0d760e","./IndexDatatype-9c4154c8","./IntersectionTests-b7330d18","./Plane-23695f18","./VertexFormat-84d83549"],(function(e,t,r,n,i,a,o,c,d,s,l,f,b,m,p,u,y,G,E,C,x,A){"use strict";return function(n,i){return t.defined(i)&&(n=r.EllipseGeometry.unpack(n,i)),n._center=e.Cartesian3.clone(n._center),n._ellipsoid=e.Ellipsoid.clone(n._ellipsoid),r.EllipseGeometry.createGeometry(n)}}));
