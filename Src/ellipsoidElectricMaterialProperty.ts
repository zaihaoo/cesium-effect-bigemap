import { Color, defined, Event, Material, Property, createPropertyDescriptor, MaterialProperty } from "cesium";

declare interface EllipsoidElectricMaterialProperty {
    _definitionChanged: any;
    _color: any;
    _speed: any;
    _arc_mode: any;
    _mask: any;
    color: any;
    speed: any;
    arc_mode: any;
    mask: any;
}

class EllipsoidElectricMaterialProperty {
    constructor(options: any) {
        this._definitionChanged = new Event();
        this._color = undefined;
        this._speed = undefined;
        this._arc_mode = undefined;
        this._mask = undefined;
        this.color = options.color;
        this.speed = options.speed;
        this.arc_mode = options.arc_mode;
        this.mask = options.mask;
    }

    get isConstant() {
        return false;
    }

    get definitionChanged() {
        return this._definitionChanged;
    }

    getType(time: any) {
        return (Material as any).EllipsoidElectricMaterialType;
    }

    getValue(time: any, result: any) {
        if (!defined(result)) {
            result = {};
        }

        result.color = (Property as any).getValueOrDefault(this._color, time, Color.RED, result.color);
        result.speed = (Property as any).getValueOrDefault(this._speed, time, 10, result.speed);
        result.arc_mode = (Property as any).getValueOrDefault(this._arc_mode, time, 10, result.arc_mode);
        result.mask = (Property as any).getValueOrDefault(this._mask, time, 10, result.mask);
        return result;
    }

    equals(other: any) {
        return (this === other ||
            (other instanceof EllipsoidElectricMaterialProperty &&
                (Property as any).equals(this._color, other._color) &&
                (Property as any).equals(this._speed, other._speed) &&
                (Property as any).equals(this._arc_mode, other._arc_mode) &&
                (Property as any).equals(this._mask, other._mask)))
    }
}


Object.defineProperties(EllipsoidElectricMaterialProperty.prototype, {
    color: createPropertyDescriptor('color'),
    speed: createPropertyDescriptor('speed'),
    arc_mode: createPropertyDescriptor('arc_mode'),
    mask: createPropertyDescriptor('mask')
});

(Material as any).EllipsoidElectricMaterialProperty = 'EllipsoidElectricMaterialProperty';
(Material as any).EllipsoidElectricMaterialType = 'EllipsoidElectricMaterialType';
(Material as any).EllipsoidElectricMaterialSource =
    `
	uniform vec4 color;
	uniform float speed;
	uniform float arc_mode;
    uniform bool mask;

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
	// if (st.t < 0.5) {
	//     discard;
	// }


    material.diffuse = normalize(czm_inverseNormal * materialInput.normalEC);
    if (dot(vec4(0.0, 1.0, 0.0,1.), vec4(czm_inverseNormal * materialInput.normalEC,1.)) > 0.95) {
        material.diffuse = vec3(1.,0.,0.);
        return material;
    }
    // return material;

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

    // material.diffuse = normalize(czm_inverseModelView  * vec4(materialInput.normalEC,0.)).xyz;
    // return material;

    // if (dot(vec4(0.0, 1.0, 0.0,1.), (czm_inverseModelView * vec4(materialInput.normalEC,1.))) > 0.95) {
    //     material.diffuse = vec3(1.,0.,0.);
    //     return material;
    // }

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

(Material as any)._materialCache.addMaterial((Material as any).EllipsoidElectricMaterialType, {
    fabric: {
        type: (Material as any).EllipsoidElectricMaterialType,
        uniforms: {
            color: new Color(1.0, 0.0, 0.0, 1.0),
            speed: 10.0,
            arc_mode: 0,
            mask: false
        },
        source: (Material as any).EllipsoidElectricMaterialSource
    },
    translucent: false
})
export default EllipsoidElectricMaterialProperty;