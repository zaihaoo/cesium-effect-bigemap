/* eslint-disable no-unused-vars */
/**
 * 距离（米）转换为经度  一米对应的经度与所在有关纬度
 * @param meter 距离
 * @param lat 所在纬度
 * @returns {number}
 */
export const meter2Lng = (meter: number, lat: number): number => {
  let pi = Math.PI;
  let latInMeter = (Math.cos((lat * pi) / 180) * 6371 * 2 * pi) / 360;
  return meter / latInMeter / 1000;
};

/**
 * 距离（米）转换为纬度  一米对应的纬度为定值
 * @param meter 距离多少米
 * @returns {number}
 */
export const meter2Lat = (meter: number) => {
  let pi = Math.PI;
  let lngInMeter = (6371 * 2 * pi) / 360;
  return meter / lngInMeter / 1000;
};

/**
 * 判断该点是否是经纬度或者笛卡尔坐标
 * @param point
 */
export const isDegreesOrCartesian = (point: any) => {
  if (!point) {
    throw "参数错误！";
  }
  if (
    "number" === typeof point.x &&
    "number" === typeof point.y &&
    "number" === typeof point.z
  ) {
    return true;
  }
  if ("number" === typeof point.lng && "number" === typeof point.lat) {
    return true;
  }
  return false;
};
/**
 * 笛卡尔坐标转WGS84
 * @param Cartesian3 单个点或点数组
 */
export const Cartesian3ToWGS84 = ({ Cesium, viewer }: any, Cartesian3: any) => {
  if (!Cesium || !viewer) {
    return;
  }
  if (!Cartesian3 || !Cartesian3.x) {
    throw "Error in parameters";
  }
  let _cartesian3 = new Cesium.Cartesian3(
    Cartesian3.x,
    Cartesian3.y,
    Cartesian3.z
  );
  let _cartographic = Cesium.Cartographic.fromCartesian(_cartesian3);
  let _lat = Cesium.Math.toDegrees(_cartographic.latitude);
  let _lng = Cesium.Math.toDegrees(_cartographic.longitude);
  let _alt = _cartographic.height;
  return { lng: _lng, lat: _lat, alt: _alt };
};
/**
 * 世界坐标系转屏幕坐标
 * @param point
 * @param viewer
 */
export const toWindowCoordinates = ({ Cesium, viewer }: any, point: any) => {
  if (!Cesium || !viewer) {
    return;
  }
  if (viewer && point && point.x && point.y && point.z) {
    return Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, point);
  } else if (viewer && point.lng && point.lat && point.alt) {
    return Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      viewer.scene,
      toCartesianFromDegrees({ Cesium, viewer }, point)
    );
  } else {
    throw "参数错误！";
  }
};

/**
 * 笛卡尔坐标转世界坐标
 * @param point
 */
export const toDegreesFromCartesian = ({ Cesium, viewer }: any, point: any) => {
  if (!Cesium || !viewer) {
    return;
  }
  if (point.x && point.y && point.z) {
    let cartesian33 = new Cesium.Cartesian3(point.x, point.y, point.z);
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian33);
    return {
      lng: parseFloat(
        Cesium.Math.toDegrees(cartographic.longitude).toFixed(10)
      ),
      lat: parseFloat(Cesium.Math.toDegrees(cartographic.latitude).toFixed(10)),
      alt: parseFloat(cartographic.height.toFixed(5)),
    };
  } else {
    throw "参数错误！";
  }
};

/**
 * 世界坐标转笛卡尔坐标
 * @param point
 */
export const toCartesianFromDegrees = ({ Cesium, viewer }: any, point: any) => {
  if (!Cesium || !viewer) {
    return;
  }
  if (point.lng && point.lat) {
    return Cesium.Cartesian3.fromDegrees(point.lng, point.lat, point.alt || 0);
  } else {
    throw "参数错误！";
  }
};
/**
 * 转化成经纬度
 * @param point
 */
export const toDegrees = ({ Cesium, viewer }: any, point: any) => {
  if (!Cesium || !viewer) {
    return;
  }
  if (isDegreesOrCartesian(point)) {
    if (point.x && point.y && point.z) {
      point = toDegreesFromCartesian({ Cesium, viewer }, point);
    }
    return point;
  } else {
    throw "参数错误！";
  }
};

/**
 * 转化成笛卡尔坐标
 * @param point
 */
export const toCartesian = ({ Cesium, viewer }: any, point: any) => {
  if (!Cesium || !viewer) {
    return;
  }
  if (isDegreesOrCartesian(point)) {
    if (point.lng && point.lat) {
      point = toCartesianFromDegrees({ Cesium, viewer }, point);
    }
    return point;
  } else {
    throw "参数错误！";
  }
};

/**
 * 获取两点之间的距离
 * @param p1
 * @param p2
 * @returns {*}
 */
export const getDistance = ({ Cesium, viewer }: any, p1: any, p2: any) => {
  p1 = toCartesian({ Cesium, viewer }, p1);
  p2 = toCartesian({ Cesium, viewer }, p2);
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
};

/**
 * 点到线段的最短距离
 * @param a 线段上一点
 * @param b 线段上另一个点
 * @param s 该点到ab的最短距离
 * @returns {number}
 */
export const point2LineMinDistance = ({ Cesium, viewer }: any, a: any, b: any, s: any) => {
  a = toCartesian({ Cesium, viewer }, a);
  b = toCartesian({ Cesium, viewer }, b);
  s = toCartesian({ Cesium, viewer }, s);
  let ab = Math.sqrt(
    Math.pow(a.x - b.x, 2.0) +
    Math.pow(a.y - b.y, 2.0) +
    Math.pow(a.z - b.z, 2.0)
  );
  let as = Math.sqrt(
    Math.pow(a.x - s.x, 2.0) +
    Math.pow(a.y - s.y, 2.0) +
    Math.pow(a.z - s.z, 2.0)
  );
  let bs = Math.sqrt(
    Math.pow(s.x - b.x, 2.0) +
    Math.pow(s.y - b.y, 2.0) +
    Math.pow(s.z - b.z, 2.0)
  );
  let cos_A =
    (Math.pow(as, 2.0) + Math.pow(ab, 2.0) - Math.pow(bs, 2.0)) / (2 * ab * as);
  let sin_A = Math.sqrt(1 - Math.pow(cos_A, 2.0));
  let t =
    ((a.x - s.x) * (a.x - b.x) +
      (a.y - s.y) * (a.y - b.y) +
      (a.z - s.z) * (a.z - b.z)) /
    (Math.pow(a.x - b.x, 2.0) +
      Math.pow(a.y - b.y, 2.0) +
      Math.pow(a.z - b.z, 2.0));
  if (t < 0) {
    return as;
  } else if (t <= 1 && t >= 0) {
    return as * sin_A;
  } else if (t > 1) {
    return bs;
  }
};

/**
 * 求三角形面积;返回-1为不能组成三角形;
 * @param a
 * @param b
 * @param c
 * @returns {*}
 */
export const countTriangleArea = ({ Cesium, viewer }: any, a: any, b: any, c: any) => {
  a = toCartesian({ Cesium, viewer }, a);
  b = toCartesian({ Cesium, viewer }, b);
  c = toCartesian({ Cesium, viewer }, c);
  let area = -1;
  let side:number[] = []; //存储三条边的长度;
  side[0] = Math.sqrt(
    Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2)
  );
  side[1] = Math.sqrt(
    Math.pow(a.x - c.x, 2) + Math.pow(a.y - c.y, 2) + Math.pow(a.z - c.z, 2)
  );
  side[2] = Math.sqrt(
    Math.pow(c.x - b.x, 2) + Math.pow(c.y - b.y, 2) + Math.pow(c.z - b.z, 2)
  );
  //不能构成三角形;
  if (
    side[0] + side[1] <= side[2] ||
    side[0] + side[2] <= side[1] ||
    side[1] + side[2] <= side[0]
  ) {
    return area;
  }
  //利用海伦公式。area =sqr(p*(p-a)(p-b)(p-c));
  let p = (side[0] + side[1] + side[2]) / 2; //半周长;
  area = Math.sqrt(p * (p - side[0]) * (p - side[1]) * (p - side[2]));
  return area;
};

/**
 * 获取多边形的中心(根据经纬度,不包括高程)
 * @param path  数组 [{lng:123,lat:32},...]
 * @returns {{lng: number, lat: number}}
 */
export const getPolygonCenterByDegree = (path: any) => {
  if (!path || path.length < 3 || !path[0].lng) {
    throw "Error in parameters";
  }
  let x = 0.0;
  let y = 0.0;
  for (let i = 0; i < path.length; i++) {
    x = x + parseFloat(path[i].lng);
    y = y + parseFloat(path[i].lat);
  }
  x = x / path.length;
  y = y / path.length;
  return {
    lng: x,
    lat: y,
  };
};

/**
 * 求多边形的面积
 * @param arr
 * @returns {*}
 */
export const countArea = ({ Cesium, viewer }: any, arr: any) => {
  if (!arr || arr.length < 3) {
    throw "参数错误！";
  } else {
    let area = 0;
    for (let i = 0; i < arr.length; i++) {
      let j = (i + 1) % arr.length;
      let p1 = arr[i],
        p2 = arr[j];
      p1 = toCartesian({ Cesium, viewer }, p1);
      p2 = toCartesian({ Cesium, viewer }, p2);
      area += p1.x * p2.y;
      area -= p1.y * p2.x;
    }
    area /= 2;
    return Math.abs(area);
  }
};

