import { Cartesian3, Color, Tetrahedron, Viewer } from 'cesium';
import { GUI } from 'dat.gui';

let _viewer: Viewer;
let _obj: Tetrahedron;
export const example = (viewer: Viewer, gui: GUI) => {
	_viewer = viewer;
	const options = {
		power: false,
		animation: false,
		fill: true,
		color: new Color(0, 0.8, 0.8, 0.5).toCssColorString(),
	};
	const position = Cartesian3.fromDegrees(121.59, 38.93, 2000);
	_obj = new Tetrahedron({
		position: position,
		color: Color.fromCssColorString(options.color),
		fill: options.fill,
		scale: new Cartesian3(500, 500, 1000),
		show: options.power,
	});
	_viewer.scene.primitives.add(_obj);

	const folder = gui.addFolder('四棱锥图标');
	folder
		.add(options, 'power')
		.name('是否开启')
		.onChange(v => {
			v ? (_obj.show = true) : (_obj.show = false);
		});
	folder
		.add(options, 'animation')
		.name('是否开启动画')
		.onChange(v => {
			v ? _obj.startAnimate() : _obj.closeAnimate();
		});
	folder
		.add(options, 'fill')
		.name('是否填充')
		.onChange(v => {
			_obj.fill = v;
		});
	folder
		.addColor(options, 'color')
		.name('颜色')
		.onChange(v => {
			_obj.color = Color.fromCssColorString(v);
		});
};
