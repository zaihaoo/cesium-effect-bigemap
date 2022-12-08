import { SkyBoxControl, Viewer } from 'cesium';
import { GUI } from 'dat.gui';

export const example = (viewer: Viewer, gui: GUI) => {
	const obj = new SkyBoxControl(viewer);
	const options = {
		power: false,
	};

	const folder = gui.addFolder('近地天空盒');
	folder
		.add(options, 'power')
		.name('是否开启')
		.onChange(v => {
			v ? obj.enable() : obj.disable();
		});
};