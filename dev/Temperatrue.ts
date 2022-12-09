import { Color, GeoJsonDataSource, getTimestamp, Viewer } from 'cesium';
// import { getVectorContour } from 'kriging-contour';

export type GEOJSON_FEATURE = {
	type: 'Feature';
	properties: {
		level: number;
		contour_value: number;
		color: Color;
	};
	geometry: {
		type: 'Point';
		coordinates: [number, number];
	};
};

export type GEOJSON_FEATURECOLLECTION = {
	type: 'FeatureCollection';
	features: GEOJSON_FEATURE[];
};

/**
 * 等值面的开启状态
 * @enum
 */
enum _STATUS {
	/**
	 * 关闭
	 */
	disable,
	/**
	 * 开启
	 */
	enable,
}

export class Temperatrue {
	private readonly _viewer: Viewer;
	private _geojson_data_sources!: GeoJsonDataSource[] & { time?: number };

	dataset!: { [index: string]: any }[];
	private _dataset!: { [index: string]: any }[];

	format!: { lon_flag: string; lat_flag: string; value_flag: string };
	private _format!: { lon_flag: string; lat_flag: string; value_flag: string };

	levels!: number[];
	private _levels!: number[];

	colors!: Color[];
	private _colors!: Color[];

	conversion!: (level: number) => number;
	private _conversion: (level: number) => number;

	private _time!: number;
	private _status: _STATUS;

	private readonly _bindProperty = () => {
		Object.defineProperties(this, {
			dataset: {
				get: () => {
					return this._dataset;
				},
				set: (dataset: { [index: string]: any }[]) => {
					this._dataset = dataset;
					this._updateDataSources();
				},
			},
			format: {
				get: () => {
					return this._format;
				},
				set: (format: { lon_flag: string; lat_flag: string; value_flag: string }) => {
					this._format = format;
					this._updateDataSources();
				},
			},

			levels: {
				get: () => {
					return this._levels;
				},
				set: (levels: number[]) => {
					this._levels = levels;
					this._updateDataSources();
				},
			},

			colors: {
				get: () => {
					return this._colors;
				},
				set: (colors: Color[]) => {
					this._colors = colors;
					this._updateDataSources();
				},
			},

			conversion: {
				get: () => {
					return this._conversion;
				},
				set: (conversion: (level: number) => number) => {
					this._conversion = conversion;
					this._updateDataSources();
				},
			},
		});
	};

	constructor(
		viewer: Viewer,
		dataset: { [index: string]: any }[],
		format: { lon_flag: string; lat_flag: string; value_flag: string },
		levels = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
		colors = [
			Color.fromCssColorString('#006837'),
			Color.fromCssColorString('#1a9850'),
			Color.fromCssColorString('#66bd63'),
			Color.fromCssColorString('#a6d96a'),
			Color.fromCssColorString('#d9ef8b'),
			Color.fromCssColorString('#ffffbf'),
			Color.fromCssColorString('#fee08b'),
			Color.fromCssColorString('#fdae61'),
			Color.fromCssColorString('#f46d43'),
			Color.fromCssColorString('#d73027'),
			Color.fromCssColorString('#a50026'),
		],
		conversion: (level: number) => number = level => level
	) {
		this._viewer = viewer;
		this._status = _STATUS.disable;
		this._conversion = conversion;
		dataset && (this._dataset = dataset);
		format && (this._format = format);
		levels && (this._levels = levels);
		colors && (this._colors = colors);

		this._updateDataSources();
		this._bindProperty();
	}

	private readonly _updateDataSources = () => {
		if (!this._dataset || !this._format || !this._levels || !this._colors) return;
		// 格式化dataset格式为geojson
		const features = this._dataset
			.filter(v => {
				return (
					v[this._format.lon_flag] !== undefined &&
					v[this._format.lat_flag] !== undefined &&
					v[this._format.value_flag] !== undefined
				);
			})
			.map(v => {
				return {
					type: 'Feature',
					properties: { level: v[this._format.value_flag] },
					geometry: { type: 'Point', coordinates: [v[this._format.lon_flag], v[this._format.lat_flag]] },
				} as GEOJSON_FEATURE;
			});

		if (!features) throw new Error(`检查绘制等值面的参数是否正确`);

		const geojson_dataset: GEOJSON_FEATURECOLLECTION = {
			type: 'FeatureCollection',
			features: features,
		};

		const _r = getVectorContour(
			geojson_dataset,
			'level',
			{
				model: 'exponential',
				sigma2: 0,
				alpha: 100,
			},
			this._levels
		);

		const promises: Promise<GeoJsonDataSource>[] = [];
		_r.features.forEach((v: GEOJSON_FEATURE) => {
			const color = this._colors[this._levels.indexOf(this._conversion(v.properties.contour_value))];
			if (color) {
				color.withAlpha(0.15, color);
				promises.push(
					GeoJsonDataSource.load(v, {
						clampToGround: true,
						fill: color,
					})
				);
			}
		});

		const ctime = (this._time = getTimestamp());
		this._awaitPromises(promises, ctime);
	};

	private readonly _awaitPromises = async (promises: Promise<GeoJsonDataSource>[], ctime: number) => {
		const data_sources = await Promise.all(promises);
		if (ctime === this._time) {
			if (this._geojson_data_sources) {
				this._geojson_data_sources.forEach(v => this._viewer.dataSources.remove(v, true));
			}
			this._geojson_data_sources = data_sources;
			this._geojson_data_sources.time = ctime;

			if (this._status === _STATUS.enable)
				this._geojson_data_sources.forEach(v => this._viewer.dataSources.add(v));
		}
	};

	readonly enable = () => {
		this._status = _STATUS.enable;

		if (this._geojson_data_sources) {
			this._geojson_data_sources.forEach(v =>
				this._viewer.dataSources.remove(v, this._geojson_data_sources.time !== this._time ? true : false)
			);
			this._geojson_data_sources.time === this._time &&
				this._geojson_data_sources.forEach(v => this._viewer.dataSources.add(v));
		}
	};

	readonly disable = () => {
		this._status = _STATUS.disable;

		if (this._geojson_data_sources) {
			this._geojson_data_sources.forEach(v =>
				this._viewer.dataSources.remove(v, this._geojson_data_sources.time !== this._time ? true : false)
			);
			if (this._geojson_data_sources.time !== this._time) {
				this._geojson_data_sources = [];
			}
		}
	};
}
