import { meter2Lng, meter2Lat, toDegrees, toCartesian } from './drag';

let leftDownFlag = false; //左键是否按下 作为可拖拽的依据
let pointDraged: any = null; //左键按下之后拾取到的东西
let viewer: any;
let Cesium: any;
let handler: any;
let activeModelEntity: any; //要拖动的实体
let arrowLength: number; //单位米
let lastMaterial: any; // 坐标轴原本的材质
let activePolyLineEntity: any; //选中的线实体
let activePolyLineMaterial: any; //坐标轴选中之后的材质
let lastEndPosition: any; //鼠标移动上次的位置
let lastLngAxis: any;
let lastLatAxis: any;
let lastAltAxis: any;

let destroy = () => {
	handler.destroy();
	lastLngAxis && viewer.entities.remove(lastLngAxis);
	lastLatAxis && viewer.entities.remove(lastLatAxis);
	lastAltAxis && viewer.entities.remove(lastAltAxis);
};

let addOrUpdateAxis = (pickedId: any = null, activePolyLineMaterial: any = null) => {
	if (activeModelEntity && arrowLength) {
		let startPosition = activeModelEntity.position.getValue(viewer.clock.currentTime);
		let p_p = toDegrees({ Cesium: Cesium, viewer: viewer }, startPosition);
		// console.log(p_p) //打印位置
		let endLng = toCartesian(
			{ Cesium: Cesium, viewer: viewer },
			{ lng: p_p.lng + meter2Lng(arrowLength, p_p.lat), lat: p_p.lat, alt: p_p.alt }
		);
		let endLat = toCartesian(
			{ Cesium: Cesium, viewer: viewer },
			{ lng: p_p.lng, lat: p_p.lat + meter2Lat(arrowLength), alt: p_p.alt }
		);
		let endAlt = toCartesian(
			{ Cesium: Cesium, viewer: viewer },
			{ lng: p_p.lng, lat: p_p.lat, alt: p_p.alt + arrowLength }
		);

		let AxisLng = viewer.entities.getOrCreateEntity('AxisLng');
		AxisLng.polyline = {
			positions: new Cesium.CallbackProperty(function () {
				return [startPosition, endLng];
			}, false),
			width: 10,
			material:
				pickedId === 'AxisLng'
					? activePolyLineMaterial
					: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED),
		};
		lastLngAxis = AxisLng;

		let AxisLat = viewer.entities.getOrCreateEntity('AxisLat');
		AxisLat.polyline = {
			positions: new Cesium.CallbackProperty(function () {
				return [startPosition, endLat];
			}, false),
			width: 10,
			material:
				pickedId === 'AxisLat'
					? activePolyLineMaterial
					: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN),
		};
		lastLatAxis = AxisLat;

		let AxisAlt = viewer.entities.getOrCreateEntity('AxisAlt');
		AxisAlt.polyline = {
			positions: new Cesium.CallbackProperty(function () {
				return [startPosition, endAlt];
			}, false),
			width: 10,
			material:
				pickedId === 'AxisAlt'
					? activePolyLineMaterial
					: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.BLUE),
		};
		lastAltAxis = AxisAlt;
	}
};

let Init = () => {
	// 左键按下
	handler.setInputAction((movement: any) => {
		pointDraged = viewer.scene.pick(movement.position); //选取当前的entity
		leftDownFlag = true;
		if (pointDraged) {
			viewer.scene.screenSpaceCameraController.enableRotate = false; //锁定相机
			//当前实体Entity的polyline坐标属性信息暂存
			if (pointDraged.id.polyline) {
				activePolyLineEntity = pointDraged.id; //记录正在活动的线实体
				lastMaterial = activePolyLineEntity.polyline.material; //线实体材质
				activePolyLineEntity.polyline.material = activePolyLineMaterial;
			}
		}
	}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

	// 左键抬起
	handler.setInputAction(() => {
		leftDownFlag = false;
		pointDraged = null;
		viewer.scene.screenSpaceCameraController.enableInputs = true;
		viewer.scene.screenSpaceCameraController.enableRotate = true; //锁定相机

		if (activePolyLineEntity && lastMaterial) {
			activePolyLineEntity.polyline.material = lastMaterial;
			activePolyLineEntity = null;
		}
		lastEndPosition = null;
	}, Cesium.ScreenSpaceEventType.LEFT_UP);
	// 鼠标移动
	handler.setInputAction((movement: any) => {
		if (leftDownFlag === true && pointDraged != null && activePolyLineEntity && activeModelEntity) {
			let endPosition = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
			if (!endPosition) {
				return;
			}

			let cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(endPosition);
			let cartographic2: any;
			if (endPosition && lastEndPosition) {
				cartographic2 = viewer.scene.globe.ellipsoid.cartesianToCartographic(lastEndPosition);
			}
			let nowPosition_Cartesian = activeModelEntity.position.getValue(viewer.clock.currentTime); //模型当前位置
			let nowPosition_Degree = toDegrees({ Cesium: Cesium, viewer: viewer }, nowPosition_Cartesian);
			let temp = 0.5; //这个可以通过传参来搞
			let pickedId = pointDraged.id.id;

			if (!['AxisAlt', 'AxisLng', 'AxisLat'].includes(pickedId)) {
				return;
			}

			if (pickedId === 'AxisAlt') {
				//高度调整
				let pixel_difference = movement.endPosition.y - movement.startPosition.y;
				//pixel_difference > 0高度减少  pixel_difference < 0 高度增加
				nowPosition_Degree.alt = nowPosition_Degree.alt - temp * pixel_difference;
			} else if (pickedId === 'AxisLng') {
				//经度调整
				if (cartographic2 && cartographic) {
					let lng = Cesium.Math.toDegrees(cartographic.longitude); //鼠标拾取的经度
					let lng2 = Cesium.Math.toDegrees(cartographic2.longitude);
					nowPosition_Degree.lng -= lng2 - lng;
				}
			} else if (pickedId === 'AxisLat') {
				//纬度调整
				if (cartographic2 && cartographic) {
					let lat = Cesium.Math.toDegrees(cartographic.latitude); //鼠标拾取的纬度
					let lat2 = Cesium.Math.toDegrees(cartographic2.latitude);
					nowPosition_Degree.lat -= lat2 - lat;
				}
			}
			lastEndPosition = endPosition;
			let r = toCartesian({ Cesium: Cesium, viewer: viewer }, nowPosition_Degree);
			activeModelEntity.position = new Cesium.CallbackProperty(() => r, false);
			addOrUpdateAxis(pickedId, activePolyLineMaterial);
		}
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

	// 右键结束
	handler.setInputAction(() => {
		destroy();
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
};
/**
 * 拖拽坐标轴调整实体位置
 * @param Cesium
 * @param viewer
 * @param activeModelEntity 要移动的实体
 * @param arrowLength 坐标轴长度（米） 默认200
 */
let dragEntity: any = function (cesium: any, view: any, activeModel: any, arrowLen: number) {
	viewer = view;
	Cesium = cesium;
	activeModelEntity = activeModel;
	arrowLength = arrowLen || 200;
	handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
	Init();
	addOrUpdateAxis(null, null);
	viewer.scene.globe.depthTestAgainstTerrain = true; //开启深度检测
	activePolyLineMaterial = new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW);
};

let dragDestroy = () => {
    destroy();
}

export { dragEntity, dragDestroy };
