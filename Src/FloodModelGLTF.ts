import { Cartesian3, Color, Model, Transforms, Viewer } from 'cesium';

export const gltf_loader = (viewer: Viewer, url: string, lon: number, lat: number, height: number, color: Color) => {
	const modelMatrix = Transforms.eastNorthUpToFixedFrame(Cartesian3.fromDegrees(lon, lat, height)); //gltf数据加载位置
	const model = viewer.scene.primitives.add(
		Model.fromGltf({
			url: url, //gltf文件的URL
			modelMatrix: modelMatrix,
			scale: 300.0, //放大倍数
		})
	);
	model.readyPromise.then(function (model:any) {
        console.log(model)
		// Play all animations when the model is ready to render
		model.activeAnimations.addAll();
	});
};
