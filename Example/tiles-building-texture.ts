import {
	Cartesian3,
	Cesium3DTileset,
	Color,
	Math,
	Matrix3,
	Matrix4,
	Transforms,
	Viewer,
	Cartesian4,
	TilesBuildingTextureFlood,
	TilesBuildingTextureNight,
	CustomShader,
} from 'cesium';
import { GUI } from 'dat.gui';

let _tileset: Cesium3DTileset;
let _color: Color;
let _viewer: Viewer;
let _style: _Style;
let _style_flood: CustomShader;
let _style_night: CustomShader;

const _loadTestData = () => {
	_tileset = new Cesium3DTileset({
		url: 'Assets/File/Build/tileset.json', //数据地址
		maximumScreenSpaceError: 2, //最大的屏幕空间误差
		show: true,
	});
	_tileset.readyPromise.then(tileset => {
		_update3dtiles(tileset, {
			origin: tileset.boundingSphere.center,
			scalez: 15,
			translation: { x: 0, y: 0, z: -5 },
		});
	});
	_color = new Color(0, 1, 1, 1);
};

// 修改3dtiles位置
/*  var opt = {
   origin: "",
   rx: 30,
   ry: 30,
   rz: 30,
   scale: 2,
   scalex:1,
   scaley:1,
   scalez:1,
   translation: {x:0,y:0,z:0}
 } */
const _update3dtiles = (tileset: Cesium3DTileset, opt: any) => {
	if (!tileset) {
		alert('缺少模型！');
		return;
	}

	var origin = opt.origin;
	if (!origin) {
		alert('缺少坐标信息！');
		return;
	}

	let mtx = Transforms.eastNorthUpToFixedFrame(origin);

	opt.scalex = opt.scalex || 1;
	opt.scaley = opt.scaley || 1;
	opt.scalez = opt.scalez || 1;
	Matrix4.multiplyByScale(mtx, new Cartesian3(opt.scalex, opt.scaley, opt.scalez), mtx);

	opt.scale = opt.scale || 1; // 缩放系数 默认为1
	// 建立从局部到世界的坐标矩阵
	Matrix4.multiplyByUniformScale(mtx, opt.scale, mtx);

	// 表示绕x轴旋转
	if (opt.rx) {
		var mx = Matrix3.fromRotationX(Math.toRadians(opt.rx));
		var rotationX = Matrix4.fromRotationTranslation(mx);
		Matrix4.multiply(mtx, rotationX, mtx);
	}
	// 表示绕y轴旋转
	if (opt.ry) {
		var my = Matrix3.fromRotationY(Math.toRadians(opt.ry));
		var rotationY = Matrix4.fromRotationTranslation(my);
		Matrix4.multiply(mtx, rotationY, mtx);
	}
	// 表示绕z轴旋转
	if (opt.rz) {
		var mz = Matrix3.fromRotationZ(Math.toRadians(opt.rz));
		var rotationZ = Matrix4.fromRotationTranslation(mz);
		Matrix4.multiply(mtx, rotationZ, mtx);
	}

	if (opt.translation) {
		Matrix4.multiplyByTranslation(
			mtx,
			new Cartesian3(opt.translation.x, opt.translation.y, opt.translation.z),
			mtx
		);
	}
	tileset.root.transform = mtx;
};

enum _Style {
	None,
	Flood,
	Night,
}

const _updateTileset = (reload: boolean) => {
	if (!_tileset || !(_style in _Style)) return;
	switch (_style) {
		case _Style.Flood:
			_tileset.customShader = _style_flood;
			break;
		case _Style.Night:
			_tileset.customShader = _style_night;
			break;
		case _Style.None:
			_tileset.customShader = undefined;
			break;
	}
	reload && _viewer.scene.primitives.add(_tileset);
};

const _setStyle = (style: _Style) => {
	if (typeof style !== 'number' || !(style in _Style) || _style === style) return;
	_style = style;
	_updateTileset(false);
};
const _setColor = (color: Color) => {
	if (!color || _color === color) return;
	_color = color;
	_style_flood.setUniform(
		'u_color',
		new Cartesian4(
			...(_color
				? _color.toBytes().map(v => Color.byteToFloat(v))
				: Color.fromRandom()
						.withAlpha(1)
						.toBytes()
						.map(v => Color.byteToFloat(v)))
		)
	);
};
// const _setTileset = (tileset: Cesium3DTileset) => {
// 	if (!tileset || _tileset === tileset) return;
// 	const reload = _tileset && _viewer.scene.primitives.remove(_tileset);
// 	_tileset = tileset;
// 	_updateTileset(reload);
// };

const enable = () => {
	const _destroy_primitives = _viewer.scene.primitives.destroyPrimitives;
	_viewer.scene.primitives.destroyPrimitives = false;
	_viewer.scene.primitives.remove(_tileset);
	_viewer.scene.primitives.destroyPrimitives = _destroy_primitives;

	_viewer.scene.primitives.add(_tileset);
};

const disable = () => {
	const _destroy_primitives = _viewer.scene.primitives.destroyPrimitives;
	_viewer.scene.primitives.destroyPrimitives = false;
	_viewer.scene.primitives.remove(_tileset);
	_viewer.scene.primitives.destroyPrimitives = _destroy_primitives;
};

export const example = (viewer: Viewer, gui: GUI) => {
	_loadTestData();
	_style_flood = TilesBuildingTextureFlood({ color: _color });
	_style_night = TilesBuildingTextureNight();
	_viewer = viewer;
	_style = _Style.Flood;
	_updateTileset(false);

	const options = {
		power: false,
		style: _Style.Flood,
		color: _color.toCssColorString(),
	};

	const folder = gui.addFolder('3DTiles建筑贴图');
	folder
		.add(options, 'power')
		.name('是否开启')
		.onChange(v => {
			v ? enable() : disable();
		});
	folder
		.add(options, 'style', {
			无贴图: _Style.None,
			泛光: _Style.Flood,
			夜景: _Style.Night,
		})
		.name('贴图风格')
		.onChange(v => {
			_setStyle(Number(v));
		});
	folder
		.addColor(options, 'color')
		.name('泛光颜色')
		.onChange(v => {
			_setColor(Color.fromCssColorString(v));
		});
};
