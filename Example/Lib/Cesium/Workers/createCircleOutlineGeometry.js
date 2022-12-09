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
define(["./Matrix3-65932166","./defaultValue-0ab18f7d","./EllipseOutlineGeometry-7e59d6ac","./Math-422cd179","./Transforms-f9e365d3","./Matrix2-82a3f96e","./RuntimeError-e5c6a8b9","./combine-4598d225","./ComponentDatatype-c4eaff65","./WebGLConstants-f27a5e29","./EllipseGeometryLibrary-105b78ab","./GeometryAttribute-5f1e74bd","./GeometryAttributes-eb2609b7","./GeometryOffsetAttribute-cc320d7d","./IndexDatatype-9c4154c8"],(function(e,i,t,r,l,n,s,o,a,u,d,c,m,p,y){"use strict";function f(e){const r=(e=i.defaultValue(e,i.defaultValue.EMPTY_OBJECT)).radius,l={center:e.center,semiMajorAxis:r,semiMinorAxis:r,ellipsoid:e.ellipsoid,height:e.height,extrudedHeight:e.extrudedHeight,granularity:e.granularity,numberOfVerticalLines:e.numberOfVerticalLines};this._ellipseGeometry=new t.EllipseOutlineGeometry(l),this._workerName="createCircleOutlineGeometry"}f.packedLength=t.EllipseOutlineGeometry.packedLength,f.pack=function(e,i,r){return t.EllipseOutlineGeometry.pack(e._ellipseGeometry,i,r)};const G=new t.EllipseOutlineGeometry({center:new e.Cartesian3,semiMajorAxis:1,semiMinorAxis:1}),_={center:new e.Cartesian3,radius:void 0,ellipsoid:e.Ellipsoid.clone(e.Ellipsoid.UNIT_SPHERE),height:void 0,extrudedHeight:void 0,granularity:void 0,numberOfVerticalLines:void 0,semiMajorAxis:void 0,semiMinorAxis:void 0};return f.unpack=function(r,l,n){const s=t.EllipseOutlineGeometry.unpack(r,l,G);return _.center=e.Cartesian3.clone(s._center,_.center),_.ellipsoid=e.Ellipsoid.clone(s._ellipsoid,_.ellipsoid),_.height=s._height,_.extrudedHeight=s._extrudedHeight,_.granularity=s._granularity,_.numberOfVerticalLines=s._numberOfVerticalLines,i.defined(n)?(_.semiMajorAxis=s._semiMajorAxis,_.semiMinorAxis=s._semiMinorAxis,n._ellipseGeometry=new t.EllipseOutlineGeometry(_),n):(_.radius=s._semiMajorAxis,new f(_))},f.createGeometry=function(e){return t.EllipseOutlineGeometry.createGeometry(e._ellipseGeometry)},function(t,r){return i.defined(r)&&(t=f.unpack(t,r)),t._ellipseGeometry._center=e.Cartesian3.clone(t._ellipseGeometry._center),t._ellipseGeometry._ellipsoid=e.Ellipsoid.clone(t._ellipseGeometry._ellipsoid),f.createGeometry(t)}}));
