import fragShader from 'fs.glsl?raw';
import vtxShader from 'vs.glsl?raw';
import * as Cesium from 'cesium';

export default class MyPrimitive {
	modelMatrix: Cesium.Matrix4;
	drawCommand: Cesium.DrawCommand;
	texture: Cesium.Texture;
	image: Image;
	constructor(modelMatrix?: Cesium.Matrix4) {
		this.modelMatrix = modelMatrix || Cesium.Matrix4.IDENTITY.clone();
	}
	generateGeometry() {
		const positions = new Array(4 * 3);
		// position[0]
		positions[0] = 0.0;
		positions[1] = 0.0;
		positions[2] = 100.0;
		// position[1]
		positions[3] = 0.0;
		positions[4] = 100.0;
		positions[5] = 100.0;
		// position[2]
		positions[6] = 100.0;
		positions[7] = 100.0;
		positions[8] = 100.0;
		// position[3]
		positions[9] = 0.0;
		positions[10] = 0.0;
		positions[11] = 0.0;
		const bufferPositions = new Float64Array(positions);

		const indices = new Array(4 * 3);
		indices[0] = 0;
		indices[1] = 1;
		indices[2] = 2;

		indices[3] = 0;
		indices[4] = 2;
		indices[5] = 3;

		indices[6] = 2;
		indices[7] = 3;
		indices[8] = 1;

		indices[9] = 3;
		indices[10] = 1;
		indices[11] = 0;
		const indicesFinal = new Uint16Array(indices);

		const boundingSphere = Cesium.BoundingSphere.fromVertices(positions);
		const _colors = [1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0];
		const st = [0.5, 0.5, 0.0, 0.0, 0.5, 1.0, 1.0, 0.0];
		const attributes = new Cesium.GeometryAttributes();
		attributes.position = new Cesium.GeometryAttribute({
			componentDatatype: Cesium.ComponentDatatype.DOUBLE,
			componentsPerAttribute: 3,
			values: bufferPositions,
		});
		attributes.color = new Cesium.GeometryAttribute({
			componentDatatype: Cesium.ComponentDatatype.FLOAT,
			componentsPerAttribute: 4,
			values: new Float32Array(_colors),
		});
		attributes.st = new Cesium.GeometryAttribute({
			componentDatatype: Cesium.ComponentDatatype.FLOAT,
			componentsPerAttribute: 2,
			values: new Float32Array(st),
		});

		const geometry = new Cesium.Geometry({
			attributes: attributes,
			indices: indicesFinal,
			primitiveType: Cesium.PrimitiveType.TRIANGLES,
			boundingSphere: boundingSphere,
		});
		return geometry;
	}
	createCommand(context: any) {
		const geometry = this.generateGeometry();
		const vertexArray = Cesium.VertexArray.fromGeometry({
			geometry: geometry,
			context: context,
			attributeLocation: Cesium.GeometryPipeline.createAttributeLocations(geometry),
		});
		const shaderProgram = Cesium.ShaderProgram.fromCache({
			context: context,
			vertexShaderSource: vtxShader,
			fragmentShaderSource: fragShader,
			attributeLocation: Cesium.GeometryPipeline.createAttributeLocations(geometry),
		});
		const uniformMap = {
			random() {
				return Math.random(); // 0-1
			},
			wenli: () => {
				if (!this.texture) {
					return context.defaultTexture;
				}
				return this.texture;
			},
		};
		const renderState = Cesium.RenderState.fromCache({
			depthTest: {
				enabled: true,
			},
		});

		this.drawCommand = new Cesium.DrawCommand({
			vertexArray: vertexArray,
			shaderProgram: shaderProgram,
			uniformMap: uniformMap,
			renderState: renderState,
			pass: Cesium.Pass.OPAQUE,
			modelMatrix: this.modelMatrix,
		});
	}
	// 创建纹理
	createTextures = (context: any) => {
		if (this.image) return;
		this.image = new Image();
		this.image.src = '/imgs/spriteline2.png';
		this.image.onload = () => {
			this.texture = new Cesium.Texture({
				context: context,
				source: this.image,
			});
		};
	};
	update(frameState: any) {
		// if (!this.drawCommand) {
		this.createCommand(frameState.context);
		// }
		if (!this.texture) {
			this.createTextures(frameState.context);
		}
		frameState.commandList.push(this.drawCommand);
	}
}
