import { Cartographic, SkyBox as CesiumSkyBox, Viewer } from 'cesium';

export class SkyBox {
	private readonly _sky_box: CesiumSkyBox;
	private readonly _viewer: Viewer;
	private _listener: ((...args: any[]) => void) | undefined;

	constructor(
		viewer: Viewer,
		textures = {
			negative_x: '../File/SkyBox/nx.png',
			positive_x: '../File/SkyBox/px.png',
			negative_y: '../File/SkyBox/ny.png',
			positive_y: '../File/SkyBox/py.png',
			negative_z: '../File/SkyBox/nz.png',
			positive_z: '../File/SkyBox/pz.png',
		}
	) {
		this._viewer = viewer;
		// 自定义的近地天空盒
		this._sky_box = new CesiumSkyBox({
			sources: {
				negativeX: textures.negative_x,
				positiveX: textures.positive_x,
				negativeY: textures.negative_y,
				positiveY: textures.positive_y,
				negativeZ: textures.negative_z,
				positiveZ: textures.positive_z,
			},
			nearGround: true,
		});
	}

	private readonly _createListener = () => {
		return () => {
			const e = this._viewer.camera.position;
			if (Cartographic.fromCartesian(e).height < 10000) {
				this._viewer.scene.skyBox.nearGround = true;
				this._viewer.scene.skyBox = this._sky_box;
				this._viewer.scene.skyAtmosphere.show = false;
			} else {
				this._viewer.scene.skyBox = this._viewer.scene.defaultSkyBox;
				this._viewer.scene.skyAtmosphere.show = true;
			}
		};
	};

	readonly enable = () => {
		this._listener && this._viewer.scene.preUpdate.removeEventListener(this._listener);

		this._listener = this._createListener();
		this._viewer.scene.preUpdate.addEventListener(this._listener);
	};

	readonly disable = () => {
		this._listener && this._viewer.scene.preUpdate.removeEventListener(this._listener);
		this._viewer.scene.skyBox = this._viewer.scene.defaultSkyBox;
		this._viewer.scene.skyAtmosphere.show = true;

		this._listener = undefined;
	};
}
