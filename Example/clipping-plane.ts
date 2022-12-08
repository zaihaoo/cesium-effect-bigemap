import { Color, getTimestamp, MultiClippingPlane, Viewer } from 'cesium';
import { GUI } from 'dat.gui';
// import { BMClippingPlane } from '../Src/main';

let positions: any;
let batch_index: number | undefined = undefined;
let batch_time: number;
const _loadTestData = () => {
	positions = [
		{
			lon: 2.1192125462215756,
			lat: 0.6787820941789823,
			height: 327.67146775499555,
		},
		{
			lon: 2.1191739797652334,
			lat: 0.6786959358239262,
			height: 222.68919249336244,
		},
		{
			lon: 2.119369158766294,
			lat: 0.6786285651231962,
			height: 107.52557919760044,
		},
		{
			lon: 2.1190166378484103,
			lat: 0.6786143925308216,
			height: 227.783261202765,
		},
		{
			lon: 2.1190464689471042,
			lat: 0.6787785644958954,
			height: 147.73561489677596,
		},
	];
};

export const example = (viewer: Viewer, gui: GUI) => {
	_loadTestData();
	MultiClippingPlane.enter(viewer, { edgeWidth: 5, edgeColor: Color.RED });

	const options = {
		batch: false,
		draw: MultiClippingPlane.draw,
		removeAll: MultiClippingPlane.removeAll,
	};

	const folder = gui.addFolder('地形开挖');
	folder.add(options, 'draw').name('绘制开挖');
	folder
		.add(options, 'removeAll')
		.name('删除所有')
		.onChange(async _ => {
			batch_index = undefined;
			options.batch = false;
		});
	folder
		.add(options, 'batch')
		.name('顶点导入开挖')
		.listen()
		.onChange(async v => {
			const ctime = (batch_time = getTimestamp());
			batch_index !== undefined && (await MultiClippingPlane.remove(batch_index));
			batch_index = undefined;
			if (v) {
				batch_index = await MultiClippingPlane.draw(positions);
				if (ctime !== batch_time) {
					await MultiClippingPlane.remove(batch_index);
					batch_index = undefined;
				}
			}
		});
};