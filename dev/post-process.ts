import { PostProcessStageComposite, PostProcessStageLibrary, Viewer } from 'cesium';

let _night_vision_stage: PostProcessStageComposite;
export const enableNightVision = (viewer: Viewer) => {
	if (_night_vision_stage && !_night_vision_stage.isDestroyed()) return;
	_night_vision_stage = new PostProcessStageComposite({
		stages: [PostProcessStageLibrary.createNightVisionStage()],
	});

	viewer.scene.postProcessStages.add(_night_vision_stage);
};

export const disableNightVision = (viewer: Viewer) => {
	(_night_vision_stage && _night_vision_stage.isDestroyed()) ||
		viewer.scene.postProcessStages.remove(_night_vision_stage);
};
