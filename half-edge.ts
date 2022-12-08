class Vector {
	position: number[];
	half_edge: HalfEdge;
}

class HalfEdge {
	end_point: Vector;
	face: Face;
	opposite_edge: HalfEdge;
	next_edge: HalfEdge;
}

class Face {
	half_edge: HalfEdge;
}

export class Entity {
	readonly faces: Face[];
	readonly half_edges: HalfEdge[];
	readonly points: Vector[];
	constructor(positions: number[][], indices: number[]) {
		// 创建顶点
		this.points = [];
		positions.forEach(v => {
			const point = new Vector();
			point.position = v;

			this.points.push(point);
		});

		// 创建面和半边
		this.faces = [];
		this.half_edges = [];
		const half_edge: { [index: string]: HalfEdge } = {};
		for (let i = 0; i < indices.length; i += 3) {
			// indices[i],indices[i+1] indices[i+1],indices[i+2] indices[i+2],indices[i]
			const face = new Face();
			// 两个顶点创建一个半边
			const new_edge = [indices[i], indices[i + 1], indices[i + 2]].map((v, i, arr) => {
				// v, arr[(i+1)%3]
				if (`${v},${arr[(i + 1) % 3]}` in half_edge) {
					// 已经存在
					return half_edge[`${v},${arr[(i + 1) % 3]}`];
				} else {
					// 新建半边
					const edge = new HalfEdge();
					const opposite = new HalfEdge();
					edge.end_point = this.points[arr[(i + 1) % 3]];
					edge.opposite_edge = opposite;
					this.points[v].half_edge = edge;

					opposite.end_point = this.points[v];
					opposite.opposite_edge = edge;

					half_edge[`${v},${arr[(i + 1) % 3]}`] = edge;
					half_edge[`${arr[(i + 1) % 3]},${v}`] = opposite;

					return edge;
				}
			});

			new_edge.forEach((v, i) => {
				v.next_edge = new_edge[(i + 1) % 3];
				v.face = face;
				this.half_edges.push(v);
			});
			face.half_edge = new_edge[0];
			this.faces.push(face);
		}
	}

	// 检测半边是否为图形的边界边
	public checkEdgeIsBoundaryByHalfEdge(half_edge: HalfEdge) {
		return half_edge.face === undefined || half_edge.opposite_edge.face === undefined;
	}

	// 获取点涉及的半边
	public getHalfEdgesByPoint(point: Vector) {
		const edges: HalfEdge[] = [];
		let edge = point.half_edge;
		// 半边的对边的下一条半边
		do {
			edges.push(edge);
			if (edge.opposite_edge.face === undefined) break;
			edge = edge.opposite_edge.next_edge;
		} while (edge !== undefined && edge !== point.half_edge);

		// 半边的上一条半边的对边
		edge = point.half_edge;
		do {
			edges.push(edge);
			if (edge.face === undefined) break;
			edge = edge.next_edge.next_edge.opposite_edge;
		} while (edge !== undefined && edge !== point.half_edge);

		// 有重复的半边 需要去重
		return [...new Set(edges)];
	}

	// 获取点涉及的面片
	public getFacesByPoint(point: Vector) {
		return this.getHalfEdgesByPoint(point)
			.map(v => v.face)
			.filter(v => v !== undefined);
	}

	// 获取点相邻的点
	public getAdjacentPointsByPoint(point: Vector) {
		return this.getHalfEdgesByPoint(point).map(v => v.end_point);
	}
}

export const test = (vec: number[][], indices: number[]) => {
	vec = [
		[0, 0, 0],
		[1, 0, 0],
		[0, 1, 0],
		[1, 1, 0],
		[2, 0, 0],
	];
	indices = [0, 1, 3, 0, 3, 2, 1, 4, 3];

	const entity = new Entity(vec, indices);
	console.log(entity.getAdjacentPointsByPoint(entity.points[3]));
};
