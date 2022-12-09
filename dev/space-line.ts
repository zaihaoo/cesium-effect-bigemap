import {
	Cartesian3,
	Color,
	GeometryInstance,
	PolylineGeometry,
	Primitive,
	SpaceLineMaterialAppearance,
	Viewer,
} from 'cesium';
import { WGS84_POSITION } from './Types';

type _WGS84_POSITION = WGS84_POSITION<true, false>;

// 中心点 数量 范围 颜色
export class SpaceLine {
	private _primitive!: Primitive;
	private readonly _viewer: Viewer;
	center!: _WGS84_POSITION;
	private _center!: _WGS84_POSITION;
	quantity!: number;
	private _quantity!: number;
	range!: number;
	private _range!: number;
	color!: Color;
	private _color!: Color;

	private readonly _generateInstances = (center: _WGS84_POSITION, num: number, radius: number) => {
		const positions: _WGS84_POSITION[] = [];
		for (let i = 0; i < num; i++) {
			let r = Math.sqrt(Math.random()) * radius;
			let theta = Math.random() * 2 * Math.PI;
			let circle = [Math.cos(theta) * r, Math.sin(theta) * r];
			positions.push([center[0] + circle[0], center[1] + circle[1]]);
		}
		return positions.map(item => {
			return new GeometryInstance({
				geometry: new PolylineGeometry({
					positions: [
						Cartesian3.fromDegrees(item[0], item[1], 0),
						Cartesian3.fromDegrees(item[0], item[1], 5000 * Math.random()),
					],
				}),
			});
		});
	};

	private readonly _bindProperty = () => {
		Object.defineProperties(this, {
			center: {
				get: () => {
					return this._center;
				},
				set: (center: _WGS84_POSITION) => {
					if (
						!(center instanceof Array) ||
						center.length !== 2 ||
						typeof center[0] !== 'number' ||
						typeof center[1] !== 'number' ||
						this._center === center
					)
						return;
					this._center = center;
					this._updatePrimitive();
				},
			},
			quantity: {
				get: () => {
					return this._quantity;
				},
				set: (quantity: number) => {
					if (quantity <= 0 || this._quantity === quantity) return;
					this._quantity = quantity;
					this._updatePrimitive();
				},
			},

			range: {
				get: () => {
					return this._range;
				},
				set: (range: number) => {
					if (range <= 0 || this._range === range) return;
					this._range = range;
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
		});
	};

	private readonly _updatePrimitive = () => {
		if (!this._center || !this._quantity || !this._range || !this._color) return;
		const reload = this._primitive && this._viewer.scene.primitives.remove(this._primitive);

		const instances = this._generateInstances(this._center, this._quantity, this._range);
		this._primitive = new Primitive({
			geometryInstances: instances, //合并
			//某些外观允许每个几何图形实例分别指定某个属性，例如：
			appearance: SpaceLineMaterialAppearance(),
		});

		reload && this._viewer.scene.primitives.add(this._primitive);
	};

	constructor(viewer: Viewer, center: _WGS84_POSITION, quantity = 960, range = 0.1, color = new Color(0, 1, 0, 1)) {
		this._viewer = viewer;
		center && (this._center = center);
		quantity && (this._quantity = quantity);
		range && (this._range = range);
		color && (this._color = color);
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
