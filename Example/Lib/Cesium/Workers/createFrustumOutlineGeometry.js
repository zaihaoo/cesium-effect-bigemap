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
define(["./defaultValue-0ab18f7d","./Transforms-f9e365d3","./Matrix3-65932166","./ComponentDatatype-c4eaff65","./FrustumGeometry-b6a793d5","./GeometryAttribute-5f1e74bd","./GeometryAttributes-eb2609b7","./Math-422cd179","./Matrix2-82a3f96e","./RuntimeError-e5c6a8b9","./combine-4598d225","./WebGLConstants-f27a5e29","./Plane-23695f18","./VertexFormat-84d83549"],(function(e,t,r,n,a,u,i,o,s,c,p,m,f,d){"use strict";function h(n){const u=n.frustum,i=n.orientation,o=n.origin,s=e.defaultValue(n._drawNearPlane,!0);let c,p;u instanceof a.PerspectiveFrustum?(c=0,p=a.PerspectiveFrustum.packedLength):u instanceof a.OrthographicFrustum&&(c=1,p=a.OrthographicFrustum.packedLength),this._frustumType=c,this._frustum=u.clone(),this._origin=r.Cartesian3.clone(o),this._orientation=t.Quaternion.clone(i),this._drawNearPlane=s,this._workerName="createFrustumOutlineGeometry",this.packedLength=2+p+r.Cartesian3.packedLength+t.Quaternion.packedLength}h.pack=function(n,u,i){i=e.defaultValue(i,0);const o=n._frustumType,s=n._frustum;return u[i++]=o,0===o?(a.PerspectiveFrustum.pack(s,u,i),i+=a.PerspectiveFrustum.packedLength):(a.OrthographicFrustum.pack(s,u,i),i+=a.OrthographicFrustum.packedLength),r.Cartesian3.pack(n._origin,u,i),i+=r.Cartesian3.packedLength,t.Quaternion.pack(n._orientation,u,i),u[i+=t.Quaternion.packedLength]=n._drawNearPlane?1:0,u};const g=new a.PerspectiveFrustum,l=new a.OrthographicFrustum,_=new t.Quaternion,k=new r.Cartesian3;return h.unpack=function(n,u,i){u=e.defaultValue(u,0);const o=n[u++];let s;0===o?(s=a.PerspectiveFrustum.unpack(n,u,g),u+=a.PerspectiveFrustum.packedLength):(s=a.OrthographicFrustum.unpack(n,u,l),u+=a.OrthographicFrustum.packedLength);const c=r.Cartesian3.unpack(n,u,k);u+=r.Cartesian3.packedLength;const p=t.Quaternion.unpack(n,u,_),m=1===n[u+=t.Quaternion.packedLength];if(!e.defined(i))return new h({frustum:s,origin:c,orientation:p,_drawNearPlane:m});const f=o===i._frustumType?i._frustum:void 0;return i._frustum=s.clone(f),i._frustumType=o,i._origin=r.Cartesian3.clone(c,i._origin),i._orientation=t.Quaternion.clone(p,i._orientation),i._drawNearPlane=m,i},h.createGeometry=function(e){const r=e._frustumType,o=e._frustum,s=e._origin,c=e._orientation,p=e._drawNearPlane,m=new Float64Array(24);a.FrustumGeometry._computeNearFarPlanes(s,c,r,o,m);const f=new i.GeometryAttributes({position:new u.GeometryAttribute({componentDatatype:n.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:m})});let d,h;const g=p?2:1,l=new Uint16Array(8*(g+1));let _=p?0:1;for(;_<2;++_)d=p?8*_:0,h=4*_,l[d]=h,l[d+1]=h+1,l[d+2]=h+1,l[d+3]=h+2,l[d+4]=h+2,l[d+5]=h+3,l[d+6]=h+3,l[d+7]=h;for(_=0;_<2;++_)d=8*(g+_),h=4*_,l[d]=h,l[d+1]=h+4,l[d+2]=h+1,l[d+3]=h+5,l[d+4]=h+2,l[d+5]=h+6,l[d+6]=h+3,l[d+7]=h+7;return new u.Geometry({attributes:f,indices:l,primitiveType:u.PrimitiveType.LINES,boundingSphere:t.BoundingSphere.fromVertices(m)})},function(t,r){return e.defined(r)&&(t=h.unpack(t,r)),h.createGeometry(t)}}));
