import { BoxGeometry, Cartesian3, Cesium3DTileFeature, Color, EllipsoidSurfaceAppearance, GeometryInstance, Label, Material, Model, ModelAnimationLoop, Primitive, ScreenSpaceEventHandler, ScreenSpaceEventType, Transforms, VertexFormat, } from '../Lib/Cesium/index.js';
let _viewer;
let _gltf_model;
let _box;
let _handler;
let _last;
const _loadTestData = () => {
    const modelMatrix1 = Transforms.eastNorthUpToFixedFrame(Cartesian3.fromDegrees(121.48, 38.91, 0));
    const modelMatrix2 = Transforms.eastNorthUpToFixedFrame(Cartesian3.fromDegrees(121.5, 38.9, 0));
    // gltf
    _gltf_model = _viewer.scene.primitives.add(Model.fromGltf({
        url: 'Assets/File/BOX2.glb',
        modelMatrix: modelMatrix1,
        scale: 10,
        id: 'house',
    }));
    _gltf_model.readyPromise.then(function (model) {
        // Play all animations when the model is ready to render
        model.activeAnimations.addAll({
            loop: ModelAnimationLoop.REPEAT,
        });
    });
    // primitive
    const instance = new GeometryInstance({
        modelMatrix: modelMatrix2,
        geometry: new BoxGeometry({
            maximum: new Cartesian3(500.0, 500.0, 500.0),
            minimum: new Cartesian3(-500.0, -500.0, -500.0),
            vertexFormat: VertexFormat.POSITION_AND_ST,
        }),
        id: 'box',
    });
    _box = new Primitive({
        geometryInstances: instance,
        appearance: new EllipsoidSurfaceAppearance({
            material: Material.fromType('Color'),
        }),
    });
    _box.appearance.material.uniforms.color = new Color(0, 0.5, 1, 1);
    _viewer.scene.primitives.add(_box);
};
const _handlerEvent = function (movement) {
    var pick = _viewer.scene.pick(movement.endPosition); //获取的pick对象
    if (_last)
        _last.forEach((v) => _viewer.scene.bloom.remove(v));
    _last = [];
    if (pick && pick instanceof Cesium3DTileFeature) {
        _last.push(pick);
    }
    else if (pick && pick.primitive instanceof Label) {
        pick.primitive._glyphs.forEach((v) => {
            _last.push(v.billboard);
        });
    }
    else if (pick && pick.primitive) {
        if (pick.id === 'box' || pick.id === 'house') {
            _last.push(pick.primitive);
        }
    }
    _last.forEach((v) => _viewer.scene.bloom.add(v));
};
export const example = (viewer, gui) => {
    _viewer = viewer;
    _loadTestData();
    const options = {
        power: false,
    };
    _handler = new ScreenSpaceEventHandler();
    _last = [];
    const folder = gui.addFolder('物体泛光');
    folder
        .add(options, 'power')
        .name('是否开启')
        .onChange(v => {
        if (v) {
            _handler.setInputAction(_handlerEvent, ScreenSpaceEventType.MOUSE_MOVE);
        }
        else {
            _handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
            _viewer.scene.bloom.removeAll();
            _last = [];
        }
    });
};
//# sourceMappingURL=bloom.js.map