import { Cartesian3, GeometryInstance, Material, PolylineGeometry, PolylineMaterialAppearance, Primitive, Viewer } from "cesium"

const durationFrame = '1000.0'
const source = `
  uniform vec4 color;
  czm_material czm_getMaterial(czm_materialInput materialInput){
    float frame = czm_frameNumber;
    float progress = mod(frame, ${durationFrame}) / ${durationFrame};
    czm_material material = czm_getDefaultMaterial(materialInput);
    material.diffuse = vec3(0.992, 0.502, 0.365);
    if(materialInput.s < progress || materialInput.s > progress + 0.1) {
      material.alpha = 0.0;
    }
    return material;
  }`;

const createWay = async (viewer: Viewer) => {
    const material = new Material({
        fabric: {
            source
        },
        translucent: false
    })
    const res = await fetch(
        // 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/trips-v7.json'
        "file/model/way.geojson"
    )
    const data = await res.json();
    const lines: GeometryInstance[] = [];
    // console.log(data.features[0].geometry.coordinates);
    // console.log(data.features)

    let line_globel: number[][] = [];
    data.features.forEach(
        (i: any,index:number) => {
            // if (index > 600) return;
            if (i.geometry.type === "LineString") {
                if (line_globel.length < 20) {
                    line_globel.push.apply(line_globel, i.geometry.coordinates);
                }

                if (line_globel.length >= 20) {
                    lines.push(
                        new GeometryInstance({
                            geometry: new PolylineGeometry({
                                positions: Cartesian3.fromDegreesArray(line_globel.flat()),
                                width: 4.0
                            })
                        })
                    );
                    line_globel = [];
                }
            }
        }
    );
    // const geometryInstances = data.features.map((item: any) => {
    //         // console.log(item.geometry.coordinates.flat())
    //     if (item.geometry.type === "LineString") {
    //         // lines.push(1);
    //         return new GeometryInstance({
    //             geometry: new PolylineGeometry({
    //                 positions: Cartesian3.fromDegreesArray(item.geometry.coordinates.flat()),
    //                 width: 1.0
    //             })
    //         })
    //     }
    // })


    // const geometryInstances = data.map((item: any) => {
    //     return new GeometryInstance({
    //         geometry: new PolylineGeometry({
    //             positions: Cartesian3.fromDegreesArray(item.path.flat()),
    //             width: 1.0
    //         })
    //     })
    // })
    viewer.scene.primitives.add(
        new Primitive({
            geometryInstances: lines,
            appearance: new PolylineMaterialAppearance({
                material
            })
        })
    )
}
export default createWay;