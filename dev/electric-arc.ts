import {
	Cartesian3,
	Color,
	EllipsoidGeometry,
	GeometryInstance,
	HeadingPitchRoll,
	Matrix3,
	Matrix4,
	Primitive,
	Transforms,
	VertexFormat,
	Viewer,
	ElectricArcMaterialAppearance,
} from 'cesium';
import { WGS84_POSITION } from './Types';

export enum ArcMode {
	Bothway,
	Down,
	Up,
}

type _WGS84_POSITION = WGS84_POSITION<true, false>;
export class ElectricArc {
	private readonly _viewer: Viewer;
	position!: _WGS84_POSITION;
	private _position!: _WGS84_POSITION;
	arc_mode!: ArcMode;
	private _arc_mode!: ArcMode;
	mask!: boolean;
	private _mask!: boolean;
	color!: Color;
	private _color!: Color;
	radius!: number;
	private _radius!: number;

	private _primitive!: Primitive;

	private readonly _createEllipsoid = (position: Cartesian3) => {
		const ellipsoid = new EllipsoidGeometry({
			vertexFormat: VertexFormat.POSITION_AND_ST,
			radii: new Cartesian3(this._radius, this._radius, this._radius),
		});

		const modelMatrix = Transforms.eastNorthUpToFixedFrame(position);
		const hprRotation = Matrix3.fromHeadingPitchRoll(new HeadingPitchRoll(0, 0, 0));
		const hpr = Matrix4.fromRotationTranslation(
			hprRotation,
			new Cartesian3(0.0, 0.0, 0.0) // 不平移
		);
		Matrix4.multiply(modelMatrix, hpr, modelMatrix);

		return new GeometryInstance({
			geometry: ellipsoid,
			modelMatrix: modelMatrix,
		});
	};

	private readonly _updatePrimitive = () => {
		if (
			!this._position ||
			!(this._arc_mode in ArcMode) ||
			typeof this._mask !== 'boolean' ||
			!this._color ||
			!this._radius
		)
			return;
		const reload = this._primitive && this._viewer.scene.primitives.remove(this._primitive);

		this._primitive = new Primitive({
			asynchronous: false,
			geometryInstances: this._createEllipsoid(Cartesian3.fromDegrees(this._position[0], this._position[1], 0)), //合并
			appearance: ElectricArcMaterialAppearance(),
		});

		reload && this._viewer.scene.primitives.add(this._primitive);
	};

	private readonly _bindProperty = () => {
		Object.defineProperties(this, {
			position: {
				get: () => {
					return this._position;
				},
				set: (position: _WGS84_POSITION) => {
					if (
						!(position instanceof Array) ||
						position.length !== 2 ||
						typeof position[0] !== 'number' ||
						typeof position[1] !== 'number' ||
						this._position === position
					)
						return;
					this._position = position;
					this._updatePrimitive();
				},
			},
			arc_mode: {
				get: () => {
					return this._arc_mode;
				},
				set: (arc_mode: ArcMode) => {
					if (!(arc_mode in ArcMode) || this._arc_mode === arc_mode) return;
					this._arc_mode = arc_mode;
					this._updatePrimitive();
				},
			},

			mask: {
				get: () => {
					return this._mask;
				},
				set: (mask: boolean) => {
					if (typeof this._mask !== 'boolean' || this._mask === mask) return;
					this._mask = mask;
					this._updatePrimitive();
				},
			},

			color: {
				get: () => {
					return this._color;
				},
				set: (color: Color) => {
					if (!color || this._color === color) return;
					this._color = color;
					this._primitive.appearance.material.uniforms.color = this._color;
				},
			},

			radius: {
				get: () => {
					return this._radius;
				},
				set: (radius: number) => {
					if (radius <= 0 || this._radius === radius) return;
					this._radius = radius;
					this._updatePrimitive();
				},
			},
		});
	};

	constructor(
		viewer: Viewer,
		position: _WGS84_POSITION,
		arc_mode: ArcMode,
		mask: boolean,
		color: Color,
		radius = 1000
	) {
		this._viewer = viewer;
		position && (this._position = position);
		
		arc_mode in ArcMode && (this._arc_mode = arc_mode);
		typeof mask === 'boolean' && (this._mask = mask);
		color && (this._color = color);
		radius > 0 && (this._radius = radius);
		this._updatePrimitive();
		this._bindProperty();
	}

	readonly enable = () => {
		const _destroy_primitives = this._viewer.scene.primitives.destroyPrimitives;
		this._viewer.scene.primitives.destroyPrimitives = false;
		this._viewer.scene.primitives.remove(this._primitive);
		this._viewer.scene.primitives.destroyPrimitives = _destroy_primitives;

		this._viewer.scene.primitives.add(this._primitive);
	};

	readonly disable = () => {
		const _destroy_primitives = this._viewer.scene.primitives.destroyPrimitives;
		this._viewer.scene.primitives.destroyPrimitives = false;
		this._viewer.scene.primitives.remove(this._primitive);
		this._viewer.scene.primitives.destroyPrimitives = _destroy_primitives;
	};
}

const vertex = `attribute vec3 position3DHigh;
attribute vec3 position3DLow;
attribute vec3 normal;
attribute vec2 st;
attribute float batchId;

varying vec3 v_positionEC;
varying vec3 v_normalEC;
varying vec2 v_st;
varying vec3 v_normalMC;

void main()
{
    vec4 p = czm_computePosition();

    v_normalMC = normal;
    v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
    v_normalEC = czm_normal * normal;                         // normal in eye coordinates
    v_st = st;

    gl_Position = czm_modelViewProjectionRelativeToEye * p;
}`;

const fragment = `
	uniform vec4 color;
	uniform float speed;
	uniform float arc_mode;
    uniform bool mask;
    varying vec3 v_normalMC;

    float random3_1(vec3 point) 
    {
        return fract(sin(dot(point, vec3(12.9898,78.233,45.5432)))*43758.5453123);
    }

    float thunder(vec2 uv, float time, float seed, float segments, float amplitude)
    {
        float h = uv.y;
        float s = uv.x*segments;
        float t = time*20.0;
        
        vec2 fst = floor(vec2(s,t));
        vec2 cst = ceil(vec2(s,t));
        
        float h11 = h + (random3_1(vec3(fst.x, fst.y, seed)) - 0.5) * amplitude;
        float h12 = h + (random3_1(vec3(cst.x, fst.y, seed)) - 0.5) * amplitude;
        float h21 = h + (random3_1(vec3(fst.x, cst.y, seed)) - 0.5) * amplitude;
        float h22 = h + (random3_1(vec3(cst.x, cst.y, seed)) - 0.5) * amplitude;
        
        float h1 = mix(h11, h12, fract(s));
        float h2 = mix(h21, h22, fract(s));
        float alpha = mix(h1, h2, fract(t));
        
        return 1.0 - abs(alpha - 0.5) / 0.5;
    }


	#define pi 3.1415926535
	#define PI2RAD 0.01745329252
	#define TWO_PI (2. * PI)
	
	float rands(float p){
	return fract(sin(p) * 10000.0);
	}
	
	float noise(vec2 p){
	float time = fract( czm_frameNumber * speed / 1000.0);
	float t = time / 20000.0;
	if(t > 1.0) t -= floor(t);
	return rands(p.x * 14. + p.y * sin(t) * 0.5);
	}
	
	vec2 sw(vec2 p){
	return vec2(floor(p.x), floor(p.y));
	}
	
	vec2 se(vec2 p){
	return vec2(ceil(p.x), floor(p.y));
	}
	
	vec2 nw(vec2 p){
	return vec2(floor(p.x), ceil(p.y));
	}
	
	vec2 ne(vec2 p){
	return vec2(ceil(p.x), ceil(p.y));
	}
	
	float smoothNoise(vec2 p){
	vec2 inter = smoothstep(0.0, 1.0, fract(p));
	float s = mix(noise(sw(p)), noise(se(p)), inter.x);
	float n = mix(noise(nw(p)), noise(ne(p)), inter.x);
	return mix(s, n, inter.y);
	}
	
	float fbm(vec2 p){
	float z = 2.0;
	float rz = 0.0;
	vec2 bp = p;
	for(float i = 1.0; i < 6.0; i++){
	    rz += abs((smoothNoise(p) - 0.5)* 2.0) / z;
	    z *= 2.0;
	    p *= 2.0;
	}
	return rz;
	}
	

	czm_material czm_getMaterial(czm_materialInput materialInput)
	{
	czm_material material = czm_getDefaultMaterial(materialInput);
	vec2 st = materialInput.st;


    if (st.t < 0.5) discard;

    if (mask) {
        float time = fract( czm_frameNumber * speed / 1000.0);
        vec2 uv = materialInput.st;
        vec2 st2 = materialInput.st;
        uv *= 4.;
        float rz = fbm(uv);
        uv /= exp(mod( time * 2.0, pi));
        rz *= pow(15., 0.9);
        vec4 temp = vec4(0);
        temp = mix( color / rz, vec4(color.rgb, 0.1), 0.2);
        if (st2.s < 0.05) {
            temp = mix(vec4(color.rgb, 0.1), temp, st2.s / 0.05);
        }
        if (st2.s > 0.95){
            temp = mix(temp, vec4(color.rgb, 0.1), (st2.s - 0.95) / 0.05);
        }
        material.diffuse = temp.rgb;
        material.alpha = temp.a * 2.0;
    }



        float time = czm_frameNumber * speed / 1000.0;
        float time_next = (czm_frameNumber + 1.) * speed /1000.0;

        if (arc_mode == 0.) {
            float i = smoothstep(-1.,1.,abs(cos(time)));
            st *= i;
        } else {
            float i = smoothstep(-1.,1.,cos(time));
            float i_next = smoothstep(-1.,1.,cos(time_next));
            float j = (i_next - i) / (time_next - time);

            if (arc_mode == 1.) {
                if (j>0.) {
                    st *= i;
                } else {
                    st *= 1.-i;
                }
            } else if (arc_mode == 2.) {
                if (j<0.) {
                    st *= i;
                } else {
                    st *= 1.-i;
                }
            }
        }


        float alpha = 0.0;
        for(int i = 0; i < 5; ++i)
        {
            float f = float(i) + 0.;
            float a = thunder(st, time/1.5, f, 10.0 * pow(1.25, f), 0.055 * pow(1.25, f));
            a = pow(a, f + 2.0); 
            alpha = max(alpha, a);
        }
        alpha = max((alpha-0.9)/0.1, 0.0);
        
        if (mask) {
            material.diffuse = mix(vec3(alpha,alpha,alpha) * color.rgb,material.diffuse,0.8);
            material.alpha += alpha;
        } else {
            material.diffuse = vec3(alpha,alpha,alpha) * color.rgb;
            material.alpha = alpha;
        }
        return material;

	}
	`;
