import { PostProcessStageComposite, PostProcessStageLibrary } from '../Lib/Cesium/index.js';
export const _controlNightVision = () => {
    return new PostProcessStageComposite({
        stages: [PostProcessStageLibrary.createNightVisionStage()],
    });
};
export const example = (viewer, gui) => {
    const options = {
        power: false,
    };
    let _control;
    const folder = gui.addFolder('夜视模式');
    folder
        .add(options, 'power')
        .name('是否开启')
        .onChange(v => {
        if (v) {
            if (_control && !_control.isDestroyed()) {
                viewer.postProcessStages.add(_control);
            }
            else {
                _control = _controlNightVision();
                viewer.postProcessStages.add(_control);
            }
        }
        else {
            _control && viewer.postProcessStages.remove(_control);
        }
    });
};
//# sourceMappingURL=post-process.js.map