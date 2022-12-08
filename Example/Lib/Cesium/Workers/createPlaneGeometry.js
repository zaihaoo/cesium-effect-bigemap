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
define(["./defaultValue-0ab18f7d","./Transforms-f9e365d3","./Matrix3-65932166","./ComponentDatatype-c4eaff65","./GeometryAttribute-5f1e74bd","./GeometryAttributes-eb2609b7","./VertexFormat-84d83549","./Math-422cd179","./Matrix2-82a3f96e","./RuntimeError-e5c6a8b9","./combine-4598d225","./WebGLConstants-f27a5e29"],(function(t,e,n,r,a,o,i,m,u,c,p,s){"use strict";function y(e){e=t.defaultValue(e,t.defaultValue.EMPTY_OBJECT);const n=t.defaultValue(e.vertexFormat,i.VertexFormat.DEFAULT);this._vertexFormat=n,this._workerName="createPlaneGeometry"}y.packedLength=i.VertexFormat.packedLength,y.pack=function(e,n,r){return r=t.defaultValue(r,0),i.VertexFormat.pack(e._vertexFormat,n,r),n};const f=new i.VertexFormat,l={vertexFormat:f};y.unpack=function(e,n,r){n=t.defaultValue(n,0);const a=i.VertexFormat.unpack(e,n,f);return t.defined(r)?(r._vertexFormat=i.VertexFormat.clone(a,r._vertexFormat),r):new y(l)};const A=new n.Cartesian3(-.5,-.5,0),b=new n.Cartesian3(.5,.5,0);return y.createGeometry=function(t){const i=t._vertexFormat,m=new o.GeometryAttributes;let u,c;if(i.position){if(c=new Float64Array(12),c[0]=A.x,c[1]=A.y,c[2]=0,c[3]=b.x,c[4]=A.y,c[5]=0,c[6]=b.x,c[7]=b.y,c[8]=0,c[9]=A.x,c[10]=b.y,c[11]=0,m.position=new a.GeometryAttribute({componentDatatype:r.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:c}),i.normal){const t=new Float32Array(12);t[0]=0,t[1]=0,t[2]=1,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=1,t[9]=0,t[10]=0,t[11]=1,m.normal=new a.GeometryAttribute({componentDatatype:r.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:t})}if(i.st){const t=new Float32Array(8);t[0]=0,t[1]=0,t[2]=1,t[3]=0,t[4]=1,t[5]=1,t[6]=0,t[7]=1,m.st=new a.GeometryAttribute({componentDatatype:r.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:t})}if(i.tangent){const t=new Float32Array(12);t[0]=1,t[1]=0,t[2]=0,t[3]=1,t[4]=0,t[5]=0,t[6]=1,t[7]=0,t[8]=0,t[9]=1,t[10]=0,t[11]=0,m.tangent=new a.GeometryAttribute({componentDatatype:r.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:t})}if(i.bitangent){const t=new Float32Array(12);t[0]=0,t[1]=1,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=0,t[7]=1,t[8]=0,t[9]=0,t[10]=1,t[11]=0,m.bitangent=new a.GeometryAttribute({componentDatatype:r.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:t})}u=new Uint16Array(6),u[0]=0,u[1]=1,u[2]=2,u[3]=0,u[4]=2,u[5]=3}return new a.Geometry({attributes:m,indices:u,primitiveType:a.PrimitiveType.TRIANGLES,boundingSphere:new e.BoundingSphere(n.Cartesian3.ZERO,Math.sqrt(2))})},function(e,n){return t.defined(n)&&(e=y.unpack(e,n)),y.createGeometry(e)}}));
