import * as Cesium from 'cesium';
import h337 from 'heatmap.js';
// import Delaunator from 'delaunator';
// import { test } from './half-edge';
export class Heatmap3D {
    _delta;
    _pixel;
    _alt;
    _arr;
    _heatmap;
    _grey;
    _indices;
    _st;
    _fill;
    _source_points;
    // 不能小于5
    _radius;
    _max_radius;
    _points;
    _width;
    _height;
    _min_lon;
    _min_lat;
    _min_value;
    _max_lon;
    _max_lat;
    _max_value;
    _lon_length;
    _lat_length;
    _dilatation_width;
    _dilatation_height;
    _dilatation_min_lon;
    _dilatation_min_lat;
    _dilatation_max_lon;
    _dilatation_max_lat;
    _dilatation_lon_length;
    _dilatation_lat_length;
    _heatmap_instance;
    _greymap_instance;
    _heatmap_texture;
    _grey_texture;
    _point_command;
    _data;
    _update;
    constructor(options) {
        this._delta = 100;
        this._min_lon = Number.POSITIVE_INFINITY;
        this._min_lat = Number.POSITIVE_INFINITY;
        this._min_value = Number.POSITIVE_INFINITY;
        this._max_lon = Number.NEGATIVE_INFINITY;
        this._max_lat = Number.NEGATIVE_INFINITY;
        this._max_value = Number.NEGATIVE_INFINITY;
        this._pixel = 1024;
        this._alt = typeof options.alt === 'number' ? options.alt : 0;
        this._fill = options.fill === undefined ? true : options.fill;
        this._source_points = options.source_points;
        // 不能小于5
        this._radius = 100;
        this._max_radius = 200;
        this.getTexture();
        this._update = true;
    }
    getTexture = () => {
        this._points = [];
        this._source_points.forEach(v => {
            this._max_lon = Math.max(this._max_lon, v.x);
            this._max_lat = Math.max(this._max_lat, v.y);
            this._min_lon = Math.min(this._min_lon, v.x);
            this._min_lat = Math.min(this._min_lat, v.y);
            this._max_value = Math.max(this._max_value, v.value);
            this._min_value = Math.min(this._min_value, v.value);
        });
        this._lon_length = this.getDistance(Cesium.Cartographic.fromDegrees(this._min_lon, this._min_lat), Cesium.Cartographic.fromDegrees(this._max_lon, this._min_lat));
        this._lat_length = this.getDistance(Cesium.Cartographic.fromDegrees(this._min_lon, this._min_lat), Cesium.Cartographic.fromDegrees(this._min_lon, this._max_lat));
        if (this._lat_length > this._lon_length) {
            this._height = this._pixel;
            this._width =
                Math.ceil((this._height / this._lat_length) * this._lon_length) % 2 === 0
                    ? Math.ceil((this._height / this._lat_length) * this._lon_length)
                    : Math.ceil((this._height / this._lat_length) * this._lon_length) + 1;
        }
        else {
            this._width = this._pixel;
            this._height =
                Math.ceil((this._width / this._lon_length) * this._lat_length) % 2 === 0
                    ? Math.ceil((this._width / this._lon_length) * this._lat_length)
                    : Math.ceil((this._width / this._lon_length) * this._lat_length) + 1;
        }
        // 计算扩容后的参数
        this._dilatation_height = this._height + 2 * this._delta;
        this._dilatation_width = this._width + 2 * this._delta;
        [this._dilatation_min_lon, this._dilatation_min_lat] = Object.values(this._pixel2position({ x: 0, y: this._dilatation_height }));
        [this._dilatation_max_lon, this._dilatation_max_lat] = Object.values(this._pixel2position({ x: this._dilatation_width, y: 0 }));
        this._dilatation_lon_length = this.getDistance(Cesium.Cartographic.fromDegrees(this._dilatation_max_lon, this._dilatation_min_lat), Cesium.Cartographic.fromDegrees(this._dilatation_min_lon, this._dilatation_min_lat));
        this._dilatation_lat_length = this.getDistance(Cesium.Cartographic.fromDegrees(this._dilatation_min_lon, this._dilatation_max_lat), Cesium.Cartographic.fromDegrees(this._dilatation_min_lon, this._dilatation_min_lat));
        // 设置dom
        const heatmap_div = document.createElement('div');
        heatmap_div.setAttribute('id', 'heatmap');
        heatmap_div.setAttribute('style', `width:${this._dilatation_width}px; height:${this._dilatation_height}px;display:none;`);
        document.body.appendChild(heatmap_div);
        const greymap_div = document.createElement('div');
        greymap_div.setAttribute('id', 'greymap');
        greymap_div.setAttribute('style', `width:${this._dilatation_width}px; height:${this._dilatation_height}px;display:none;`);
        document.body.appendChild(greymap_div);
        this._source_points.forEach(v => {
            const pixel = this._position2pixel({ lon: v.x, lat: v.y });
            const point = {
                lon_length: this.getDistance(Cesium.Cartographic.fromDegrees(v.x, this._dilatation_min_lat), Cesium.Cartographic.fromDegrees(this._dilatation_min_lon, this._dilatation_min_lat)),
                lat_length: this.getDistance(Cesium.Cartographic.fromDegrees(this._dilatation_min_lon, v.y), Cesium.Cartographic.fromDegrees(this._dilatation_min_lon, this._dilatation_min_lat)),
                x: pixel.x,
                y: pixel.y,
                value: v.value,
                radius: this._radius,
            };
            this._points.push(point);
        });
        const heatmap_config = {
            container: heatmap_div,
            maxOpacity: 1,
            minOpacity: 0, // 最小透明度 0 - 1.0
            // blur: 0.6, // 边缘羽化程度 0.0 - 1.0
        };
        const greymap_config = {
            container: greymap_div,
            maxOpacity: 1,
            minOpacity: 0,
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
        this._data = {
            min: this._min_value,
            max: this._max_value * 1.25,
            data: this._points,
        };
        this._heatmap_instance = h337.create(heatmap_config);
        this._heatmap_instance.setData(this._data);
        this._greymap_instance = h337.create(greymap_config);
        this._greymap_instance.setData(this._data);
        // 将热力图添加到球体上(生成的热力图canvas元素类名为heatmap-canvas)
        const canvas = document.getElementsByClassName('heatmap-canvas');
        this._heatmap = canvas[0];
        this._grey = canvas[1];
        // build plane A
        const count = 350;
        const lon_offset = this._dilatation_lon_length / count;
        const lat_offset = this._dilatation_lat_length / count;
        const links = [];
        const vertexs = [];
        const st = [];
        const lon = 0;
        const lat = 0;
        for (let j = 0; j <= count; j++) {
            for (let i = 0; i <= count; i++) {
                // 由于浮点数运算的精度问题 这里必须判断一下保证局部坐标最后的数值分别不超过this._dilatation_lon_length和this._dilatation_lat_length
                const clon = i === count
                    ? this._dilatation_lon_length
                    : lon + i * lon_offset <= this._dilatation_lon_length
                        ? lon + i * lon_offset
                        : this._dilatation_lon_length;
                const clat = j === count
                    ? this._dilatation_lat_length
                    : lat + j * lat_offset <= this._dilatation_lat_length
                        ? lat + j * lat_offset
                        : this._dilatation_lat_length;
                vertexs.push([clon, clat, 0]);
                st.push([clon / this._dilatation_lon_length, clat / this._dilatation_lat_length]);
            }
        }
        vertexs.forEach((v, i) => {
            if (v[0] === this._dilatation_lon_length || v[1] === this._dilatation_lat_length)
                return;
            links.push([i, i + 1, i + 1 + (count + 1)]);
            links.push([i, i + 1 + (count + 1), i + (count + 1)]);
        });
        // build plane B
        // const arr2 = this._points.map(v => {
        // 	return [v.lon_length, v.lat_length];
        // });
        // const arr2: number[][] = [];
        // const arr: number[] = [];
        // this._st = this._points
        // 	.map(v => {
        // 		arr.push(v.lon_length, v.lat_length, 0);
        // 		arr2.push([v.lon_length, v.lat_length]);
        // 		// return [v.x / height, v.y / width];
        // 		return [v.lon_length / this._dilatation_lon_length, v.lat_length / this._dilatation_lat_length];
        // 	})
        // 	.flat();
        // arr.push(
        // 	0,
        // 	0,
        // 	0,
        // 	this._dilatation_lon_length,
        // 	0,
        // 	0,
        // 	0,
        // 	this._dilatation_lat_length,
        // 	0,
        // 	this._dilatation_lon_length,
        // 	this._dilatation_lat_length,
        // 	0
        // );
        // arr2.push(
        // 	[0, 0],
        // 	[this._dilatation_lon_length, 0],
        // 	[0, this._dilatation_lat_length],
        // 	[this._dilatation_lon_length, this._dilatation_lat_length]
        // );
        // this._st.push(0, 0, 1, 0, 0, 1, 1, 1);
        // const delaunay = new Delaunator(arr2.flat());
        // this._indices = delaunay.triangles as any;
        // for (let i = 0; i < this.indices.length; i += 3) {
        // 	let min = Number.POSITIVE_INFINITY;
        // 	let max = Number.NEGATIVE_INFINITY;
        // 	[arr2[this.indices[i]], arr2[this.indices[i + 1]], arr2[this.indices[i + 2]]].forEach(v => {
        // 		const coord = {
        // 			x: (v[0] / lon_length) * height,
        // 			y: (v[1] / lat_length) * width,
        // 		};
        // 		min = Math.min(this.greymapInstance.getValueAt(coord), min);
        // 		max = Math.max(this.greymapInstance.getValueAt(coord), max);
        // 	});
        // 	// if (max - min > 1) {
        // 	// 	// 细分
        // 	// }
        // }
        // test(arr2,this.indices);
        // this._arr = arr;
        this._arr = vertexs.flat();
        this._st = st.flat();
        this._indices = links.flat();
    };
    // 创建纹理
    createTextures = (context) => {
        if (this._heatmap_texture)
            this._heatmap_texture.destroy();
        if (this._grey_texture)
            this._grey_texture.destroy();
        this._heatmap_texture = new Cesium.Texture({
            context: context,
            source: this._heatmap,
            width: this._heatmap.width,
            height: this._heatmap.height,
            sampler: Cesium.Sampler.NEAREST,
            pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
        });
        this._grey_texture = new Cesium.Texture({
            context: context,
            source: this._grey,
            width: this._grey.width,
            height: this._grey.height,
            sampler: Cesium.Sampler.NEAREST,
            pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
        });
    };
    update = (frame_state) => {
        if (!this._heatmap_texture || !this._grey_texture || this._update) {
            this.createTextures(frame_state.context);
            this.getCommand(frame_state.context);
            this._update = false;
        }
        if (this._radius >= 5) {
            frame_state.commandList.push(this._point_command);
        }
    };
    /* 计算两点之间的距离 */
    getDistance = (start, end) => {
        const geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(start, end);
        const distance = geodesic.surfaceDistance;
        return distance;
    };
    getPosition = (start, end, distance) => {
        const geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(start, end);
        return geodesic.interpolateUsingSurfaceDistance(distance);
    };
    _position2pixel = (position) => {
        return {
            x: (this._width *
                this.getDistance(Cesium.Cartographic.fromDegrees(position.lon, this._min_lat), Cesium.Cartographic.fromDegrees(this._min_lon, this._min_lat))) /
                this._lon_length +
                this._delta,
            y: this._delta +
                this._height *
                    (1 -
                        this.getDistance(Cesium.Cartographic.fromDegrees(this._min_lon, position.lat), Cesium.Cartographic.fromDegrees(this._min_lon, this._min_lat)) /
                            this._lat_length),
        };
    };
    _pixel2position = (pixel) => {
        // pixel 换算距离
        const lon_distance = (this._lon_length * (pixel.x - this._delta)) / this._width;
        const lat_distance = (1 - (pixel.y - this._delta) / this._height) * this._lat_length;
        // 距离换算wgs84
        return {
            lon: Cesium.Math.toDegrees(this.getPosition(Cesium.Cartographic.fromDegrees(this._min_lon, this._min_lat), Cesium.Cartographic.fromDegrees(this._max_lon, this._min_lat), lon_distance).longitude),
            lat: Cesium.Math.toDegrees(this.getPosition(Cesium.Cartographic.fromDegrees(this._min_lon, this._min_lat), Cesium.Cartographic.fromDegrees(this._min_lon, this._max_lat), lat_distance).latitude),
        };
    };
    updateRadius = (radius) => {
        if (radius < 5)
            return;
        this._radius = radius;
        this._points.forEach(v => (v.radius = this._radius));
        this._heatmap_instance.setData(this._data);
        this._greymap_instance.setData(this._data);
        const canvas = document.getElementsByClassName('heatmap-canvas');
        this._heatmap = canvas[0];
        this._grey = canvas[1];
        this._update = true;
    };
    //用prototype给定方法和属性
    getCommand = (context) => {
        // 创建geometry
        const attributes_geo = new Cesium.GeometryAttributes();
        attributes_geo.position = new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
            componentsPerAttribute: 3,
            values: new Float64Array(this._arr),
        });
        attributes_geo.st = new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 2,
            values: new Float32Array(this._st),
        });
        const bounding_sphere = Cesium.BoundingSphere.fromVertices(this._arr);
        // ! 创建图元绘制
        let geometry = Cesium.GeometryPipeline.computeNormal(new Cesium.Geometry({
            attributes: attributes_geo,
            indices: new Uint32Array(this._indices),
            primitiveType: Cesium.PrimitiveType.TRIANGLES,
            boundingSphere: bounding_sphere,
        }));
        //网格放置位置(放置到起点经纬度位置)
        if (!this._fill) {
            geometry = Cesium.GeometryPipeline.toWireframe(geometry);
        }
        const attributeLocations = Cesium.GeometryPipeline.createAttributeLocations(geometry);
        const va = Cesium.VertexArray.fromGeometry({
            context: context,
            geometry: geometry,
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
		// if (v_ratio == 0.) discard;
		vec4 color = texture2D(heatmap,v_st);
		// if (color.a == 0.) {
		// 	if (v_ratio == 1.) color = vec4(1.,0.,0.,v_ratio);
		// 	else if (v_ratio >= .85) color = vec4(1.,1.,0.,v_ratio);
		// 	else if (v_ratio >= .55) color = vec4(0.,1.,0.,v_ratio);
		// 	else if (v_ratio >= .25) color = vec4(0.,0.,1.,v_ratio);
		// 	else if (v_ratio > 0.) color = vec4(0.,0.,1.,v_ratio);
		// }
		// if (color.a == 0. && v_ratio == 0.) color = vec4(1.,0.,0.,1.);
		// color = vec4(1.,0.,0.,1.);
		gl_FragColor = color;
	}`;
        //shaderProgram将两个着色器合并
        const shader_program = Cesium.ShaderProgram.fromCache({
            context: context,
            vertexShaderSource: v,
            fragmentShaderSource: f,
            attributeLocations: attributeLocations,
        });
        //渲染状态
        const render_state = Cesium.RenderState.fromCache({
            depthTest: {
                enabled: true,
            },
            depthMask: true,
            blending: Cesium.BlendingState.ALPHA_BLEND,
        });
        const uniform_map = {
            heatmap: () => {
                if (!this._heatmap_texture) {
                    return context.defaultTexture;
                }
                return this._heatmap_texture;
            },
            grey: () => {
                if (!this._grey_texture) {
                    return context.defaultTexture;
                }
                return this._grey_texture;
            },
            u_bezier: () => {
                // return new Cesium.Cartesian4(0.5, 0.2, 0.8, 1);
                return new Cesium.Cartesian4(0.4, 0.2, 0.381, 0.8);
                // return new Cesium.Cartesian4(0.825, 1.58, 0.252, 0.045);
            },
            u_max_height: () => {
                return 3000;
            },
            radius: () => {
                return this._radius / this._max_radius > 1
                    ? 1
                    : this._radius / this._max_radius > 0.2
                        ? this._radius / this._max_radius
                        : 0.2;
            },
        };
        const model_matrix = Cesium.Transforms.eastNorthUpToFixedFrame(
        // Cesium.Cartesian3.fromDegrees(this.min_lon, this.min_lat, typeof this._height === 'number' ? this._height : 0)
        Cesium.Cartesian3.fromDegrees(this._dilatation_min_lon, this._dilatation_min_lat, this._alt));
        //新建一个DrawCommand
        this._point_command = new Cesium.DrawCommand({
            primitiveType: this._fill ? Cesium.PrimitiveType.TRIANGLES : Cesium.PrimitiveType.LINES,
            shaderProgram: shader_program,
            renderState: render_state,
            vertexArray: va,
            pass: Cesium.Pass.OPAQUE,
            modelMatrix: model_matrix,
            uniformMap: uniform_map,
        });
    };
    destroy = () => {
        //this.arr = [];
    };
}
//# sourceMappingURL=heatmap-pro.js.map