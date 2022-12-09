import {
	Cartesian4,
	Cesium3DTileset,
	Color,
	TilesBuildingTextureFlood,
	TilesBuildingTextureNight,
	Viewer,
} from 'cesium';

export enum Style {
	None,
	Flood,
	Night,
}

export class TilesBuildingTexture {
	private readonly _viewer: Viewer;
	tileset!: Cesium3DTileset;
	private _tileset: Cesium3DTileset;
	style!: Style;
	private _style: Style;
	color!: Color;
	private _color!: Color;

	private readonly _updateTileset = (reload: boolean) => {
		if (!this._tileset || !(this._style in Style)) return;
		switch (this._style) {
			case Style.Flood:
				this._tileset.customShader = TilesBuildingTextureFlood();
				break;
			case Style.Night:
				this._tileset.customShader = TilesBuildingTextureNight();
				break;
			case Style.None:
				this._tileset.customShader = undefined;
				break;
		}
		reload && this._viewer.scene.primitives.add(this._tileset);
	};

	private readonly _bindProperty = () => {
		Object.defineProperties(this, {
			style: {
				get: () => {
					return this._style;
				},
				set: (style: Style) => {
					if (typeof style !== 'number' || !(style in Style) || this._style === style) return;
					this._style = style;
					this._updateTileset(false);
				},
			},

			color: {
				get: () => {
					return this._color;
				},
				set: (color: Color) => {
					if (!color || this._color === color) return;
					this._color = color;
					this.style === Style.Flood &&
						this._tileset.customShader?.setUniform(
							'u_color',
							new Cartesian4(
								...(this._color
									? this._color.toBytes().map(v => Color.byteToFloat(v))
									: Color.fromRandom()
											.withAlpha(1)
											.toBytes()
											.map(v => Color.byteToFloat(v)))
							)
						);
				},
			},

			tileset: {
				get: () => {
					return this._tileset;
				},
				set: (tileset: Cesium3DTileset) => {
					if (!tileset || this._tileset === tileset) return;
					const reload = this._tileset && this._viewer.scene.primitives.remove(this._tileset);
					this._tileset = tileset;
					this._updateTileset(reload);
				},
			},
		});
	};

	constructor(viewer: Viewer, tileset: Cesium3DTileset, style = Style.Flood, color?: Color) {
		this._viewer = viewer;
		this._style = style;
		this._tileset = tileset;
		color && (this._color = color);

		this._updateTileset(false);
		this._bindProperty();
	}

	readonly enable = () => {
		const _destroy_primitives = this._viewer.scene.primitives.destroyPrimitives;
		this._viewer.scene.primitives.destroyPrimitives = false;
		this._viewer.scene.primitives.remove(this._tileset);
		this._viewer.scene.primitives.destroyPrimitives = _destroy_primitives;

		this._viewer.scene.primitives.add(this._tileset);
	};

	readonly disable = () => {
		const _destroy_primitives = this._viewer.scene.primitives.destroyPrimitives;
		this._viewer.scene.primitives.destroyPrimitives = false;
		this._viewer.scene.primitives.remove(this._tileset);
		this._viewer.scene.primitives.destroyPrimitives = _destroy_primitives;
	};
}
