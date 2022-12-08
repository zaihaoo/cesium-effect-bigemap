import * as Cesium from 'cesium';
import h337 from 'heatmap.js';
import earcut from 'earcut';

//定义一个Trangles类
export function Trangles(options) {
	this._viewer = options.viewer;
	this._height = options.height;
	this.arr = options.arr;
	this.heatmap = options.heatmap;
	this.grey = options.grey;
	this.indices = options.indices;
	this.st = options.st;
	this.ifFill = options.ifFill === undefined ? true : options.ifFill;
	this.source_points = options.source_points;
	// 不能给摄像机设置动画
	this.wheelment = 0;
	// 不能小于5
	this.radius = 100;
	this.max_radius = 200;
	this.getTexture();
	this.createTextures(this._viewer.scene.context);
	this.getCommand(this._viewer.scene.context);
	// 10 - 18 zoom 6627446 - 6369785 magnitude
}

Trangles.prototype.updateRadius = function (radius: number) {
	// this.handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
	// this.handler.setInputAction(wheelment => {
	// }, Cesium.ScreenSpaceEventType.WHEEL);

	if (radius < 5) return;
	this.radius = radius;
	this.points.forEach(v => (v.radius = this.radius));

	this.heatmapInstance.setData(this.data);
	this.greymapInstance.setData(this.data);

	var canvas = document.getElementsByClassName('heatmap-canvas');
	[this.heatmap, this.grey] = canvas;

	this.heatmap_texture = new Cesium.Texture({
		context: this._viewer.scene.context,
		source: this.heatmap,
		width: this.heatmap.width,
		height: this.heatmap.height,
		sampler: Cesium.Sampler.NEAREST,
		pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
	});

	this.grey_texture = new Cesium.Texture({
		context: this._viewer.scene.context,
		source: this.grey,
		width: this.grey.width,
		height: this.grey.height,
		sampler: Cesium.Sampler.NEAREST,
		pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
	});
};

//用prototype给定方法和属性
Trangles.prototype.getCommand = function (context) {
	// 创建geometry
	const attributes_geo = new Cesium.GeometryAttributes();
	attributes_geo.position = new Cesium.GeometryAttribute({
		componentDatatype: Cesium.ComponentDatatype.DOUBLE,
		componentsPerAttribute: 3,
		values: new Float64Array(this.arr),
	});
	attributes_geo.st = new Cesium.GeometryAttribute({
		componentDatatype: Cesium.ComponentDatatype.FLOAT,
		componentsPerAttribute: 2,
		values: new Float32Array(this.st),
	});

	this.boundingSphere = Cesium.BoundingSphere.fromVertices(this.arr);

	// ! 创建图元绘制
	var geometryMesh = Cesium.GeometryPipeline.computeNormal(
		new Cesium.Geometry({
			attributes: attributes_geo,
			indices: new Uint32Array(this.indices),
			primitiveType: Cesium.PrimitiveType.TRIANGLES,
			boundingSphere: this.boundingSphere,
		})
	);

	//网格放置位置(放置到起点经纬度位置)
	var fillOrMeshGeometry = geometryMesh;
	if (!this.ifFill) {
		fillOrMeshGeometry = Cesium.GeometryPipeline.toWireframe(geometryMesh);
	}

	var attributeLocations = Cesium.GeometryPipeline.createAttributeLocations(fillOrMeshGeometry);

	var va = Cesium.VertexArray.fromGeometry({
		context: context,
		geometry: fillOrMeshGeometry,
		attributeLocations: attributeLocations,
	});

	//顶点着色器
	let v = `
        attribute vec3 position3DHigh;
        attribute vec3 position3DLow;
        attribute vec2 st;
        varying vec2 v_st;
        uniform sampler2D grey;
		uniform float u_max_height;
		uniform vec4 u_bezier;
		uniform float radius;
		varying float v_ratio;

		vec2 toBezierInner(float t, vec2 P0, vec2 P1, vec2 P2, vec2 P3) {
			float t2 = t * t;
			float one_minus_t = 1.0 - t;
			float one_minus_t2 = one_minus_t * one_minus_t;
			return (P0 * one_minus_t2 * one_minus_t + P1 * 3.0 * t * one_minus_t2 + P2 * 3.0 * t2 * one_minus_t + P3 * t2 * t);
		}

		vec2 toBezier(float t, vec4 p) {
			return toBezierInner(t, vec2(0.0, 0.0), vec2(p.x, p.y), vec2(p.z, p.w), vec2(1.0, 1.0));
		}

        void main()
        {
        float gradient = texture2D(grey,st).r;

		float height = toBezier(gradient, u_bezier).y;
		float height0 = toBezier(0.0, u_bezier).y;
		float height1 = toBezier(1.0, u_bezier).y;
		// height = (height - height0) / ((height1 - height0) / u_max_height);
		float ratio = (height - height0) / (height1 - height0);
		height = ratio * u_max_height;
		v_ratio = ratio;


          vec4 p = czm_translateRelativeToEye(position3DHigh, position3DLow);
          p.z += height;
          p = czm_modelViewProjectionRelativeToEye * p;
          v_st = st;
          gl_Position = p;
        }
      `;
	//片元着色器
	let f = `
    uniform sampler2D heatmap;
    varying vec2 v_st;
	varying float v_ratio;

        void main()
        {
			if (v_ratio == 0.) discard;
			vec4 color = texture2D(heatmap,v_st);
			if (color.a == 0.) {
				if (v_ratio == 1.) color = vec4(1.,0.,0.,v_ratio);
				else if (v_ratio >= .85) color = vec4(1.,1.,0.,v_ratio);
				else if (v_ratio >= .55) color = vec4(0.,1.,0.,v_ratio);
				else if (v_ratio >= .25) color = vec4(0.,0.,1.,v_ratio);
				else if (v_ratio > 0.) color = vec4(0.,0.,1.,v_ratio);
			}
			// if (color.a == 0. && v_ratio == 0.) color = vec4(1.,0.,0.,1.);
            gl_FragColor = color;
        }`;

	//shaderProgram将两个着色器合并
	var shaderProgram = Cesium.ShaderProgram.fromCache({
		context: context,
		vertexShaderSource: v,
		fragmentShaderSource: f,
		attributeLocations: attributeLocations,
	});
	//渲染状态
	var renderState = Cesium.RenderState.fromCache({
		depthTest: {
			enabled: true,
		},
		depthMask: true,
		blending: Cesium.BlendingState.ALPHA_BLEND,
	});

	const uniformMap = {
		heatmap: () => {
			if (!this.heatmap_texture) {
				return context.defaultTexture;
			}
			return this.heatmap_texture;
		},
		grey: () => {
			if (!this.grey_texture) {
				return context.defaultTexture;
			}
			return this.grey_texture;
		},
		u_bezier: () => {
			// return new Cesium.Cartesian4(0.5, 0.2, 0.8, 1);
			return new Cesium.Cartesian4(0.4, 0.2, 0.381, 0.8);
			// return new Cesium.Cartesian4(0.825, 1.58, 0.252, 0.045);
		},
		u_max_height: () => {
			return 1500;
		},
		radius: () => {
			return this.radius / this.max_radius > 1
				? 1
				: this.radius / this.max_radius > 0.2
				? this.radius / this.max_radius
				: 0.2;
		},
	};

	//新建一个DrawCommand
	this.pointCommand = new Cesium.DrawCommand({
		primitiveType: this.ifFill ? Cesium.PrimitiveType.TRIANGLES : Cesium.PrimitiveType.LINES,
		shaderProgram: shaderProgram,
		renderState: renderState,
		vertexArray: va,
		pass: Cesium.Pass.OPAQUE,
		modelMatrix: this._modelMatrix,
		uniformMap: uniformMap,
	});
};
Trangles.prototype.destroy = function () {
	//this.arr = [];
};

// 创建纹理
Trangles.prototype.createTextures = function (context: any) {
	this.heatmap_texture = new Cesium.Texture({
		context: context,
		source: this.heatmap,
		width: this.heatmap.width,
		height: this.heatmap.height,
		sampler: Cesium.Sampler.NEAREST,
		pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
	});

	this.grey_texture = new Cesium.Texture({
		context: context,
		source: this.grey,
		width: this.grey.width,
		height: this.grey.height,
		sampler: Cesium.Sampler.NEAREST,
		pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
	});

	// if (this.image) return;
	// this.image = new Image();
	// this.image.src = '/File/Texture/wall.png';
	// this.image.onload = () => {
	// 	this.texture = new Cesium.Texture({
	// 		context: context,
	// 		source: this.image,
	// 		width: this.image.width,
	// 		height: this.image.height,
	// 		// sampler: Cesium.Sampler.NEAREST,
	// 		// pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
	// 	});
	// };
};

Trangles.prototype.update = function (frameState) {
	if (!this.heatmap_texture || !this.grey_texture) {
		this.createTextures(frameState.context);
	}
	// this.getCommand(this._viewer.scene.context);
	if (this.radius >= 5) {
		frameState.commandList.push(this.pointCommand);
	}
	// this._viewer.scene.requestRender();
};

/* 计算两点之间的距离 */
Trangles.prototype.getDistance = (start, end) => {
	var geodesic = new Cesium.EllipsoidGeodesic();
	geodesic.setEndPoints(start, end);
	var distance = geodesic.surfaceDistance;
	return distance;
};

Trangles.prototype.getTexture = function () {
	let min_lon = Number.POSITIVE_INFINITY;
	let min_lat = Number.POSITIVE_INFINITY;
	let min_value = Number.POSITIVE_INFINITY;
	let max_lon = Number.NEGATIVE_INFINITY;
	let max_lat = Number.NEGATIVE_INFINITY;
	let max_value = Number.NEGATIVE_INFINITY;
	this.points = [];
	this.source_points.forEach(v => {
		max_lon = Math.max(max_lon, v.x);
		max_lat = Math.max(max_lat, v.y);
		min_lon = Math.min(min_lon, v.x);
		min_lat = Math.min(min_lat, v.y);

		max_value = Math.max(max_value, v.value);
		min_value = Math.min(min_value, v.value);
	});

	this._modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
		Cesium.Cartesian3.fromDegrees(min_lon, min_lat, typeof this._height === 'number' ? this._height : 0)
	);

	const lon_length = this.getDistance(
		Cesium.Cartographic.fromDegrees(min_lon, min_lat),
		Cesium.Cartographic.fromDegrees(max_lon, min_lat)
	);
	const lat_length = this.getDistance(
		Cesium.Cartographic.fromDegrees(min_lon, min_lat),
		Cesium.Cartographic.fromDegrees(min_lon, max_lat)
	);

	let height: number;
	let width: number;
	if (lat_length > lon_length) {
		width = 1024;
		height =
			Math.ceil((width / lat_length) * lon_length) % 2 === 0
				? Math.ceil((width / lat_length) * lon_length)
				: Math.ceil((width / lat_length) * lon_length) + 1;
	} else {
		height = 1024;
		width =
			Math.ceil((height / lon_length) * lat_length) % 2 === 0
				? Math.ceil((height / lon_length) * lat_length)
				: Math.ceil((height / lon_length) * lat_length) + 1;
	}

	// 设置dom
	const heatmap_div = document.createElement('div');
	heatmap_div.setAttribute('id', 'heatmap');
	heatmap_div.setAttribute('style', `width:${width}px; height:${height}px;display:none;`);
	document.body.appendChild(heatmap_div);

	const greymap_div = document.createElement('div');
	greymap_div.setAttribute('id', 'greymap');
	greymap_div.setAttribute('style', `width:${width}px; height:${height}px;display:none;`);
	document.body.appendChild(greymap_div);

	this.source_points.forEach(v => {
		var point = {
			x: Math.floor(((v.x - min_lon) / (max_lon - min_lon)) * height),
			y: Math.floor(((v.y - min_lat) / (max_lat - min_lat)) * width),
			// x: window.Math.floor(((lat1 - latMin) / (latMax - latMin)) * width),
			// y: window.Math.floor(((lon1 - lonMin) / (lonMax - lonMin)) * height),
			value: v.value,
			radius: this.radius,
		};
		this.points.push(point);
	});

	this.heatmap_config = {
		container: heatmap_div,
		maxOpacity: 1, // 最大透明度 0 - 1.0
		minOpacity: 0, // 最小透明度 0 - 1.0
		// blur: 0.6, // 边缘羽化程度 0.0 - 1.0
	};

	this.greymap_config = {
		container: greymap_div,
		maxOpacity: 1, // 最大透明度 0 - 1.0
		minOpacity: 0, // 最小透明度 0 - 1.0
		// blur: 0.6, // 边缘羽化程度 0.0 - 1.0
		gradient: {
			// 0: '#000000',
			// 0.1: '#222222',
			// 0.5: '#777777',
			// 0.65: '#999999',
			// 0.7: '#aaaaaa',
			// 0.9: '#dedede',
			// 1: '#ffffff',
			0: 'black',
			1: 'white',
		},
	};

	this.data = {
		min: min_value,
		max: max_value * 1.25,
		data: this.points,
	};

	this.heatmapInstance = h337.create(this.heatmap_config);
	this.heatmapInstance.setData(this.data);

	this.greymapInstance = h337.create(this.greymap_config);
	this.greymapInstance.setData(this.data);

	// 将热力图添加到球体上(生成的热力图canvas元素类名为heatmap-canvas)
	var canvas = document.getElementsByClassName('heatmap-canvas');
	[this.heatmap, this.grey] = canvas;

	// build plane A
	const count = 350;
	const lon_offset = lon_length / count;
	const lat_offset = lat_length / count;
	const links: number[][] = [];
	const vertexs: number[][] = [];
	const st: number[][] = [];
	const lon = 0;
	const lat = 0;
	const h = 0;

	for (let j = 0; j <= count; j++) {
		for (let i = 0; i <= count; i++) {
			const clon = lon + i * lon_offset <= lon_length ? lon + i * lon_offset : lon_length;
			const clat = lat + j * lat_offset <= lat_length ? lat + j * lat_offset : lat_length;
			vertexs.push([clon, clat, h]);
			st.push([clon / lon_length, clat / lat_length]);
		}
	}

	vertexs.forEach((v, i) => {
		if (v[0] === lon_length || v[1] === lat_length) return;
		links.push([i, i + 1, i + 1 + (count + 1)]);
		links.push([i, i + 1 + (count + 1), i + (count + 1)]);
	});

	this.indices = links.flat();
	this.arr = vertexs.flat();
	this.st = st.flat();

	console.log(this.indices.length / 3);
};
