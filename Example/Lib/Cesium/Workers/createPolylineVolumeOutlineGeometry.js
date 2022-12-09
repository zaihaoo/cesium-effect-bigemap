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
define(["./defaultValue-0ab18f7d","./Matrix3-65932166","./arrayRemoveDuplicates-33a8febf","./BoundingRectangle-cc6329ca","./Transforms-f9e365d3","./Matrix2-82a3f96e","./ComponentDatatype-c4eaff65","./PolylineVolumeGeometryLibrary-c79c2b7d","./GeometryAttribute-5f1e74bd","./GeometryAttributes-eb2609b7","./IndexDatatype-9c4154c8","./Math-422cd179","./PolygonPipeline-c2aa27b1","./combine-4598d225","./RuntimeError-e5c6a8b9","./WebGLConstants-f27a5e29","./EllipsoidTangentPlane-667d464b","./AxisAlignedBoundingBox-06550f25","./IntersectionTests-b7330d18","./Plane-23695f18","./PolylinePipeline-6218af52","./EllipsoidGeodesic-ca606535","./EllipsoidRhumbLine-e32e4fe7"],(function(e,t,i,n,o,a,l,r,s,p,c,d,u,y,f,g,h,m,E,P,_,b,k){"use strict";function C(i){const n=(i=e.defaultValue(i,e.defaultValue.EMPTY_OBJECT)).polylinePositions,o=i.shapePositions;this._positions=n,this._shape=o,this._ellipsoid=t.Ellipsoid.clone(e.defaultValue(i.ellipsoid,t.Ellipsoid.WGS84)),this._cornerType=e.defaultValue(i.cornerType,r.CornerType.ROUNDED),this._granularity=e.defaultValue(i.granularity,d.CesiumMath.RADIANS_PER_DEGREE),this._workerName="createPolylineVolumeOutlineGeometry";let l=1+n.length*t.Cartesian3.packedLength;l+=1+o.length*a.Cartesian2.packedLength,this.packedLength=l+t.Ellipsoid.packedLength+2}C.pack=function(i,n,o){let l;o=e.defaultValue(o,0);const r=i._positions;let s=r.length;for(n[o++]=s,l=0;l<s;++l,o+=t.Cartesian3.packedLength)t.Cartesian3.pack(r[l],n,o);const p=i._shape;for(s=p.length,n[o++]=s,l=0;l<s;++l,o+=a.Cartesian2.packedLength)a.Cartesian2.pack(p[l],n,o);return t.Ellipsoid.pack(i._ellipsoid,n,o),o+=t.Ellipsoid.packedLength,n[o++]=i._cornerType,n[o]=i._granularity,n};const L=t.Ellipsoid.clone(t.Ellipsoid.UNIT_SPHERE),T={polylinePositions:void 0,shapePositions:void 0,ellipsoid:L,height:void 0,cornerType:void 0,granularity:void 0};C.unpack=function(i,n,o){let l;n=e.defaultValue(n,0);let r=i[n++];const s=new Array(r);for(l=0;l<r;++l,n+=t.Cartesian3.packedLength)s[l]=t.Cartesian3.unpack(i,n);r=i[n++];const p=new Array(r);for(l=0;l<r;++l,n+=a.Cartesian2.packedLength)p[l]=a.Cartesian2.unpack(i,n);const c=t.Ellipsoid.unpack(i,n,L);n+=t.Ellipsoid.packedLength;const d=i[n++],u=i[n];return e.defined(o)?(o._positions=s,o._shape=p,o._ellipsoid=t.Ellipsoid.clone(c,o._ellipsoid),o._cornerType=d,o._granularity=u,o):(T.polylinePositions=s,T.shapePositions=p,T.cornerType=d,T.granularity=u,new C(T))};const D=new n.BoundingRectangle;return C.createGeometry=function(e){const a=e._positions,d=i.arrayRemoveDuplicates(a,t.Cartesian3.equalsEpsilon);let y=e._shape;if(y=r.PolylineVolumeGeometryLibrary.removeDuplicatesFromShape(y),d.length<2||y.length<3)return;u.PolygonPipeline.computeWindingOrder2D(y)===u.WindingOrder.CLOCKWISE&&y.reverse();const f=n.BoundingRectangle.fromPoints(y,D);return function(e,t){const i=new p.GeometryAttributes;i.position=new s.GeometryAttribute({componentDatatype:l.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:e});const n=t.length,a=i.position.values.length/3,r=e.length/3/n,d=c.IndexDatatype.createTypedArray(a,2*n*(r+1));let u,y,f=0;u=0;let g=u*n;for(y=0;y<n-1;y++)d[f++]=y+g,d[f++]=y+g+1;for(d[f++]=n-1+g,d[f++]=g,u=r-1,g=u*n,y=0;y<n-1;y++)d[f++]=y+g,d[f++]=y+g+1;for(d[f++]=n-1+g,d[f++]=g,u=0;u<r-1;u++){const e=n*u,t=e+n;for(y=0;y<n;y++)d[f++]=y+e,d[f++]=y+t}return new s.Geometry({attributes:i,indices:c.IndexDatatype.createTypedArray(a,d),boundingSphere:o.BoundingSphere.fromVertices(e),primitiveType:s.PrimitiveType.LINES})}(r.PolylineVolumeGeometryLibrary.computePositions(d,y,f,e,!1),y)},function(i,n){return e.defined(n)&&(i=C.unpack(i,n)),i._ellipsoid=t.Ellipsoid.clone(i._ellipsoid),C.createGeometry(i)}}));
