import * as Cesium from 'cesium';

//！ 网格位置
// var modelMatrixWhereTo = Cesium.Transforms.eastNorthUpToFixedFrame(
//     Cesium.Cartesian3.fromDegrees(113.802689907, 35.373933211, 0.00000));

//！ 网格容器
var custom_2DMesh = [];
var instances2DMesh: Cesium.GeometryInstance[] = [];

function Clear2DMeshPloygons(viewer) {
	//! 关闭网格
	if (custom_2DMesh) {
		custom_2DMesh.show = false;
		viewer.scene.primitives.remove(custom_2DMesh);
	}
}

//设置值的区间(16个区间)
var range = [48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 104];
// var range=[0,1152.1424547605388, 1218.128785640212, 1284.1151165198853, 1350.1014473995588, 1416.0877782792318, 1482.0741091589052, 1548.0604400385785, 1814.0467709182517]
//设置对应颜色信息(16颜色值)
var colorRange = [
	Cesium.Color.fromBytes(127, 1, 131, 255),
	Cesium.Color.fromBytes(85, 1, 171, 255),
	Cesium.Color.fromBytes(40, 0, 212, 255),
	Cesium.Color.fromBytes(2, 1, 253, 255),
	Cesium.Color.fromBytes(2, 56, 226, 255),
	Cesium.Color.fromBytes(1, 109, 194, 255),
	Cesium.Color.fromBytes(2, 167, 167, 255),
	Cesium.Color.fromBytes(0, 196, 108, 255),
	Cesium.Color.fromBytes(0, 226, 57, 255),
	Cesium.Color.fromBytes(0, 255, 0, 255),
	Cesium.Color.fromBytes(84, 255, 1, 255),
	Cesium.Color.fromBytes(171, 255, 1, 255),
	Cesium.Color.fromBytes(255, 255, 3, 255),
	Cesium.Color.fromBytes(255, 171, 2, 255),
	Cesium.Color.fromBytes(253, 85, 3, 255),
	Cesium.Color.fromBytes(254, 1, 3, 255),
];
// var colorRange = [Cesium.Color.fromBytes(0, 16, 295, 255),
//     Cesium.Color.fromBytes(0, 142, 114, 255),
//     Cesium.Color.fromBytes(0, 240, 10, 255),
//     Cesium.Color.fromBytes(72, 254, 0, 255),
//     Cesium.Color.fromBytes(2, 56, 226, 255),
//     Cesium.Color.fromBytes(1, 109, 194, 255),
//     Cesium.Color.fromBytes(2, 167, 167, 255),
//     Cesium.Color.fromBytes(0, 196, 108, 255),
//     Cesium.Color.fromBytes(0, 226, 57, 255),
//     Cesium.Color.fromBytes(0, 255, 0, 255),
//     Cesium.Color.fromBytes(84, 255, 1, 255),
//     Cesium.Color.fromBytes(171, 255, 1, 255),
//     Cesium.Color.fromBytes(255, 255, 3, 255),
//     Cesium.Color.fromBytes(255, 171, 2, 255),
//     Cesium.Color.fromBytes(253, 85, 3, 255),
//     Cesium.Color.fromBytes(254, 1, 3, 255)
// ];

//查找所在区间的颜色
function findRangeColor(array, val) {
	//如果值小于range最小的值时，则奖励0
	if (val < Math.min.apply(null, array)) {
		return 0;
	}
	//如果值大于range最大的值时，则奖励最高一档
	if (val > Math.max.apply(null, array)) {
		return array.length - 1;
	}
	var idx = 0,
		i = 0,
		j = array.length;
	for (i; i < j; i++) {
		if (array[i] > val) {
			idx = i;
			break;
		}
	}
	return idx;
}

function GenerateMeshColor(rainValue, alphaDefault) {
	var curColor = Cesium.Color.fromBytes(255, 255, 255, 120);

	if (alphaDefault == undefined) {
		alphaDefault = 0.2;
	}
	//根据数据查询颜色值
	if (rainValue > 0) {
		curColor = colorRange[findRangeColor(range, rainValue)];
	}

	return curColor.withAlpha(alphaDefault);
}

//! 绘制维网格
export function Draw2DMeshPloygons(viewer, canvas: HTMLCollection, data?, ifFill?, value?) {
	console.log(canvas, 123);
	Clear2DMeshPloygons(viewer);
	instances2DMesh = [];

	var colorArr: any[] = [];
	// 根据data
	if (data != undefined) {
		var links = data.links;
		var curdataArr = data.vertexs;
	} else {
		var vertexs = [];
		// 121.58, 38.91
		var lon = 0;
		var lat = 0;

		var curdataArr: any = [];
		curdataArr[0] = lon;
		curdataArr[1] = lat;
		curdataArr[2] = 200;

		curdataArr[3] = lon + 5000;
		curdataArr[4] = lat;
		curdataArr[5] = 200;

		curdataArr[6] = lon + 5000;
		curdataArr[7] = lat + 5000;
		curdataArr[8] = 200;

		curdataArr[9] = lon + 5000 + 5000;
		curdataArr[10] = lat;
		curdataArr[11] = 200;

		curdataArr[12] = lon + 5000 + 5000;
		curdataArr[13] = lat + 5000;
		curdataArr[14] = 200;

		var links: any = new Uint32Array(6);
		links[0] = 0;
		links[1] = 1;
		links[2] = 2;
		links[3] = 1;
		links[4] = 3;
		links[5] = 4;
	}

	value = value !== undefined ? value : new Array(curdataArr.length).fill(0);
	range = [0];
	var arr: any[] = [];
	for (var i = 0; i != curdataArr.length / 3; ++i) {
		var zFieldValue = curdataArr[3 * (i + 1) - 1];
		zFieldValue += value[window.Math.floor(i)];
		arr.push(zFieldValue);
	}
	arr.sort(function (a, b) {
		return a - b;
	});
	var min = arr[0];
	var max = arr[arr.length - 1];
	var intvl = max - min;
	for (var i = 0; i < 15; i++) {
		if (i == 14) {
			range.push(max + 1);
		} else {
			range.push(min + (intvl / 15) * (i + 1));
		}
	}
	var legendTitles: any[] = [];
	for (var i = 1; i < range.length; i++) {
		if (i == 1) {
			legendTitles.push('低于' + range[i]);
		} else {
			if (i == range.length - 1) {
				legendTitles.push(range[i - 1] + 'range[i]' + range[i]);
				legendTitles.push('高于' + range[i]);
			} else {
				legendTitles.push(range[i - 1] + 'range[i]' + range[i]);
			}
		}
	}
	localStorage.MeshRange = range;
	for (var i = 0; i != curdataArr.length / 3; ++i) {
		var zFieldValue = curdataArr[3 * (i + 1) - 1];
		zFieldValue += value[window.Math.floor(i)];
		// test
		curdataArr[3 * (i + 1) - 1] = zFieldValue;
		var tempColor = GenerateMeshColor(zFieldValue, 0.6);
		colorArr.push(tempColor.red);
		colorArr.push(tempColor.green);
		colorArr.push(tempColor.blue);
		colorArr.push(tempColor.alpha);
	}

	// const st = [0.5, 0.5, 0.0, 0.0, 0.5, 1.0, 1.0, 0.0, 0.5, 0];
	const attributes = new Cesium.GeometryAttributes();
	attributes.position = new Cesium.GeometryAttribute({
		componentDatatype: Cesium.ComponentDatatype.DOUBLE,
		componentsPerAttribute: 3,
		values: new Float64Array(curdataArr),
	});
	attributes.color = new Cesium.GeometryAttribute({
		componentDatatype: Cesium.ComponentDatatype.FLOAT,
		componentsPerAttribute: 4,
		values: new Float32Array(colorArr),
	});
	attributes.st = new Cesium.GeometryAttribute({
		componentDatatype: Cesium.ComponentDatatype.FLOAT,
		componentsPerAttribute: 2,
		values: new Float32Array(data.st),
	});

	// ! 创建图元绘制
	var geometryMesh = Cesium.GeometryPipeline.computeNormal(
		new Cesium.Geometry({
			attributes: attributes,
			indices: new Uint16Array(links),
			primitiveType: Cesium.PrimitiveType.TRIANGLES,
			boundingSphere: Cesium.BoundingSphere.fromVertices(curdataArr),
		})
	);
	console.log(geometryMesh);

	//网格放置位置(放置到起点经纬度位置)
	var fillOrMeshGeometry = geometryMesh;
	if (!ifFill) {
		fillOrMeshGeometry = Cesium.GeometryPipeline.toWireframe(geometryMesh);
	}

	//！ 图元放置位置计算
	// var modelMatrixWhereTo = Cesium.Transforms.eastNorthUpToFixedFrame(
	// 	Cesium.Cartesian3.fromDegrees(data.position.x, data.position.y, 0)
	// );

	var modelMatrixWhereTo = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(121.58, 38.91, 0));

	var instanceMesh = new Cesium.GeometryInstance({
		geometry: fillOrMeshGeometry,
		modelMatrix: modelMatrixWhereTo,
	});

	instances2DMesh.push(instanceMesh);

	// console.log(
	// 	new Cesium.MaterialAppearance({
	// 		flat: true,
	// 		translucent: true,
	// 		material: new Cesium.Material({
	// 			strict: true,
	// 			fabric: {
	// 				uniforms: {
	// 					grey: canvas[1],
	// 					heatmap: canvas[0],
	// 				},
	// 				source: fs,
	// 			},
	// 		}),
	// 		// vertexShaderSource: vs,
	// 	}).vertexShaderSource
	// );

	viewer.scene.primitives.add(
		new Cesium.Primitive({
			geometryInstances: instances2DMesh,
			// appearance: new Cesium.PerInstanceColorAppearance({
			// 	flat: true,
			// 	translucent: true,
			// 	// closed: true,
			// }),

			appearance: new Cesium.MaterialAppearance({
				flat: true,
				translucent: true,
				material: new Cesium.Material({
					strict: true,
					fabric: {
						uniforms: {
							grey: canvas[1],
							heatmap: canvas[0],
						},
						source: fs,
					},
				}),
				vertexShaderSource: vs,
			}),
			asynchronous: false,
		})
	);
}
//! 绘制维网格
export function UpdateMeshGridColorsByTimeData(data, ifFill, value, tmMa) {
	Clear2DMeshPloygons();
	// ！ 根据data
	if (data != undefined) {
		// var vertexs = data.vertexs;
		var links = data.links;
		var curdataArr = data.vertexs;

		var colorArr: number[] = [];
		range = [0];
		var arr: any[] = [];
		for (var i = 0; i != curdataArr.length / 3; i++) {
			arr.push(tmMa[i] == undefined ? 1 : tmMa[i].Z);
		}
		arr.sort(function (a, b) {
			return a - b;
		});
		var min = arr[0];
		var max = arr[arr.length - 1];
		var intvl = max - min;
		for (var i = 0; i < 15; i++) {
			if (i == 14) {
				range.push(max + 1);
			} else {
				range.push(min + (intvl / 15) * (i + 1));
			}
		}
		var legendTitles: any = [];
		for (var i = 1; i < range.length; i++) {
			if (i == 1) {
				legendTitles.push('低于' + range[i]);
			} else {
				if (i == range.length - 1) {
					legendTitles.push(range[i - 1] + 'range[i]' + range[i]);
					legendTitles.push('高于' + range[i]);
				} else {
					legendTitles.push(range[i - 1] + 'range[i]' + range[i]);
				}
			}
		}
		//updateLegendByMAcesh(legendTitles);
		localStorage.MeshRange = range;
		for (var i = 0; i != curdataArr.length / 3; ++i) {
			// var zFieldValue = curdataArr[3*(i+1) - 1];
			// zFieldValue += parseInt(value);
			var tempColor = GenerateMeshColor(tmMa[i] == undefined ? 1 : tmMa[i].Z, 0.6);
			colorArr.push(tempColor.red);
			colorArr.push(tempColor.green);
			colorArr.push(tempColor.blue);
			colorArr.push(tempColor.alpha);
		}
	}

	// ! 创建图元绘制
	if (instances2DMesh.length && instances2DMesh[0] != undefined) {
		if (instances2DMesh[0].geometry.attributes.color.values.length == colorArr!.length) {
			debugger;
			instances2DMesh[0].geometry.attributes.color.values = colorArr!;
		}
	}

	custom_2DMesh = map3d.cesium3Dview.scene.primitives.add(
		new Cesium.Primitive({
			geometryInstances: instances2DMesh,
			// appearance:new Cesium.PerInstanceColorAppearance( {
			//     translucent : true,
			//     closed : true,
			//     material: Cesium.Material.fromType('Grid')
			// } )
			appearance: new Cesium.PolylineColorAppearance({
				translucent: false,
			}),
		})
	);
}

const fs = `
uniform bool mask;
uniform sampler2D grey;
uniform sampler2D heatmap;


czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
	grey;

	// material.diffuse = texture2D(heatmap,st);
    // material.alpha = alpha;
	vec4 color = texture2D(heatmap,st);
	material.diffuse = color.rgb;
    material.alpha = color.a;
    return material;

}`;

const vs = `
attribute vec3 position3DHigh;
attribute vec3 position3DLow;
attribute vec3 normal;
attribute vec2 st;
attribute float batchId;

varying vec3 v_positionEC;
varying vec3 v_normalEC;
varying vec2 v_st;

void main()
{
    vec4 p = czm_computePosition();

    v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
    v_normalEC = czm_normal * normal;                         // normal in eye coordinates
    v_st = st;

    gl_Position = czm_modelViewProjectionRelativeToEye * p;
}
`;
