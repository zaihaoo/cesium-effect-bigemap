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
define(["./AttributeCompression-7fdb1de9","./Matrix3-65932166","./Math-422cd179","./Matrix2-82a3f96e","./createTaskProcessorWorker","./ComponentDatatype-c4eaff65","./defaultValue-0ab18f7d","./WebGLConstants-f27a5e29","./RuntimeError-e5c6a8b9"],(function(e,a,t,r,n,o,i,s,c){"use strict";const u=32767,p=new a.Cartographic,f=new a.Cartesian3,l=new r.Rectangle,d=new a.Ellipsoid,m={min:void 0,max:void 0};return n((function(n,o){const i=new Uint16Array(n.positions);!function(e){e=new Float64Array(e);let t=0;m.min=e[t++],m.max=e[t++],r.Rectangle.unpack(e,t,l),t+=r.Rectangle.packedLength,a.Ellipsoid.unpack(e,t,d)}(n.packedBuffer);const s=l,c=d,h=m.min,C=m.max,b=i.length/3,g=i.subarray(0,b),w=i.subarray(b,2*b),k=i.subarray(2*b,3*b);e.AttributeCompression.zigZagDeltaDecode(g,w,k);const y=new Float64Array(i.length);for(let e=0;e<b;++e){const r=g[e],n=w[e],o=k[e],i=t.CesiumMath.lerp(s.west,s.east,r/u),l=t.CesiumMath.lerp(s.south,s.north,n/u),d=t.CesiumMath.lerp(h,C,o/u),m=a.Cartographic.fromRadians(i,l,d,p),b=c.cartographicToCartesian(m,f);a.Cartesian3.pack(b,y,3*e)}return o.push(y.buffer),{positions:y.buffer}}))}));
