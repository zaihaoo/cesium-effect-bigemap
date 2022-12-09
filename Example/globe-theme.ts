import { Color, GlobeTheme, Viewer } from 'cesium';
import { GUI } from 'dat.gui';

let _viewer: Viewer;
const _obj = new GlobeTheme({
	bgColor: Color.BLACK,
	alpha: 0.5,
	invert: true,
	scanningLine: true,
	fogging: true,
});

const _enable = () => {
	_viewer.scene.globe.theme = _obj;
};

const _disable = () => {
	_viewer.scene.globe.theme = undefined;
};

export const example = (viewer: Viewer, gui: GUI) => {
	_viewer = viewer;

	const options = {
		power: false,
		bgColor: Color.BLACK.toCssColorString(),
		alpha: 0.5,
		invert: true,
		scanningLine: true,
		fogging: true,
	};

	const folder = gui.addFolder('地球主题');
	folder
		.add(options, 'power')
		.name('是否开启')
		.onChange(v => {
			v ? _enable() : _disable();
		});
	folder
		.addColor(options, 'bgColor')
		.name('背景色')
		.onChange(v => {
			_obj.bgColor = Color.fromCssColorString(v);
		});
	folder
		.add(options, 'alpha')
		.name('透明度')
		.min(0)
		.max(1)
		.step(0.01)
		.onChange(v => {
			_obj.alpha = v;
		});
	folder
		.add(options, 'invert')
		.name('反转颜色')
		.onChange(v => {
			_obj.invert = v;
		});
	folder
		.add(options, 'scanningLine')
		.name('扫描线')
		.onChange(v => {
			_obj.scanningLine = v;
		});
	folder
		.add(options, 'fogging')
		.name('迷雾')
		.onChange(v => {
			_obj.fogging = v;
		});
};
