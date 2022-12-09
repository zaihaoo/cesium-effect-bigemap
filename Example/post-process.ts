import { GUI } from 'dat.gui';
import { PostProcessStageComposite, PostProcessStageLibrary, Viewer } from 'cesium';

export const _controlNightVision = () => {
	return new PostProcessStageComposite({
		stages: [PostProcessStageLibrary.createNightVisionStage()],
	});
};

export const example = (viewer: Viewer, gui: GUI) => {
	const options = {
		power: false,
	};
	let _control: PostProcessStageComposite;

	const folder = gui.addFolder('夜视模式');
	folder
		.add(options, 'power')
		.name('是否开启')
		.onChange(v => {
			if (v) {
				if (_control && !_control.isDestroyed()) {
					viewer.postProcessStages.add(_control);
				} else {
					_control = _controlNightVision();
					viewer.postProcessStages.add(_control);
				}
			} else {
				_control && viewer.postProcessStages.remove(_control);
			}
		});
};
