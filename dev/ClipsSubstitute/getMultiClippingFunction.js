import Cartesian2 from "../Core/Cartesian2.js";
import Check from "../Core/Check.js";
import ClippingPlaneCollection from "./ClippingPlaneCollection.js";

var textureResolutionScratch = new Cartesian2();
/**
 * Gets the GLSL functions needed to retrieve collections of ClippingPlaneCollections from a MultiClippingPlaneCollection's texture.
 *
 * @param {Array} [multiClippingPlaneCollection] The array of clippingPlaneCollections with a defined texture.
 * @param {Context} context The current rendering context.
 * @returns {String} A string containing GLSL functions for retrieving clipping planes.
 * @private
 */
function getMultiClippingFunction(multiClippingPlaneCollection, context) {
  //>>includeStart('debug', pragmas.debug);
  Check.typeOf.object(
    "multiClippingPlaneCollection",
    multiClippingPlaneCollection
  );
  Check.typeOf.object("context", context);
  //>>includeEnd('debug');

  // var unionClippingRegions = clippingPlaneCollection.unionClippingRegions;
  // var clippingPlanesLength = 0;

  var dataTexture = multiClippingPlaneCollection.dataTexture;
  var width = dataTexture.width;
  var height = dataTexture.height;
  var maxLength = multiClippingPlaneCollection.maxCollectionLength;

  var usingFloatTexture = ClippingPlaneCollection.useFloatTexture(context);

  var functions = usingFloatTexture
    ? getClippingPlaneFloat(width, height)
    : getClippingPlaneUint8(width, height);

  functions += "\n";

  // MultiClippingPlaneCollection is now not abled to deal with unionClippingRegions.
  functions += clippingFunctionIntersect(
    multiClippingPlaneCollection.length,
    maxLength
  );

  // functions += unionClippingRegions
  //   ? clippingFunctionUnion(clippingPlanesLength)
  //   : clippingFunctionIntersect(clippingPlanesLength);
  return functions;
}

// This fucntion has not be rewritten! Don't use it directly.
function clippingFunctionUnion(clippingPlanesLength) {
  var functionString =
    `float clip(vec4 fragCoord, sampler2D clippingPlanes, mat4 clippingPlanesMatrix) 
    { 
        vec4 position = czm_windowToEyeCoordinates(fragCoord); 
        vec3 clipNormal = vec3(0.0); 
        vec3 clipPosition = vec3(0.0); 
        float clipAmount;  // For union planes, we want to get the min distance. So we set the initial value to the first plane distance in the loop below.
        float pixelWidth = czm_metersPerPixel(position); 
        bool breakAndDiscard = false; 
        for (int i = 0; i <  
    ${clippingPlanesLength} 
    ; i) 
        { 
            vec4 clippingPlane = getClippingPlane(clippingPlanes, i, clippingPlanesMatrix); 
            clipNormal = clippingPlane.xyz; 
            clipPosition = -clippingPlane.w * clipNormal; 
            float amount = dot(clipNormal, (position.xyz - clipPosition)) / pixelWidth; 
            clipAmount = czm_branchFreeTernary(i == 0, amount, min(amount, clipAmount)); 
            if (amount <= 0.0) 
            { 
               breakAndDiscard = true; 
               break;  // HLSL compiler bug if we discard here: https://bugs.chromium.org/p/angleproject/issues/detail?id=1945#c6
            } 
        } 
        if (breakAndDiscard) { 
            discard; 
        } 
        return clipAmount; 
    }`;
  return functionString;
}

function clippingFunctionIntersect(arrayLength, maxLength) {
  var functionString =
    "float clip(vec4 fragCoord, sampler2D clippingPlanes, mat4 clippingPlanesMatrix, sampler2D multiClippingPlanesLength)\n" +
    "{\n" +
    "    vec4 position = czm_windowToEyeCoordinates(fragCoord);\n" +
    "    vec3 clipNormal = vec3(0.0);\n" +
    "    vec3 clipPosition = vec3(0.0);\n" +
    "    float clipAmount = 0.0;\n" +
    "    float pixelWidth = czm_metersPerPixel(position);\n" +
    "    int count = 0;\n" +
    "    for (int i = 0; i < " +
    arrayLength +
    "; ++i)\n" +
    "    {\n" +
    "        bool thisOneClipped = true;\n" +
    "        float thisCollectionClipAmount = 0.;\n" +
    "        int thisCollectionLength = int(texture2D(multiClippingPlanesLength, vec2((float(i) + 0.5)/float(" +
    arrayLength +
    "), 0.5)).w);\n" +
    "        for (int j = 0; j < " +
    maxLength +
    " ; ++j)\n" +
    "         {\n" +
    "             thisCollectionLength--;\n" +
    "             vec4 clippingPlane = getClippingPlane(clippingPlanes, count, clippingPlanesMatrix);\n" +
    "             clipNormal = clippingPlane.xyz;\n" +
    "             clipPosition = -clippingPlane.w * clipNormal;\n" +
    "             float amount = dot(clipNormal, (position.xyz - clipPosition)) / pixelWidth;\n" +
    "             thisCollectionClipAmount = max(amount, thisCollectionClipAmount);\n" +
    "             thisOneClipped = thisOneClipped && (amount <= 0.0);\n" +
    "             count++;\n" +
    "             if(thisCollectionLength == 0) break;\n" +
    "         }\n" +
    "         if (thisOneClipped)\n" +
    "         {\n" +
    "             discard;\n" +
    "         }\n" +
    "         if(clipAmount == 0.0) clipAmount = thisCollectionClipAmount;\n" +
    "         else if(thisCollectionClipAmount != 0.0) clipAmount = min(clipAmount, thisCollectionClipAmount);\n" +
    "    }\n" +
    "    return clipAmount;\n" +
    "}\n";
  return functionString;
}

function getClippingPlaneFloat(width, height) {
  var pixelWidth = 1.0 / width;
  var pixelHeight = 1.0 / height;

  var pixelWidthString = pixelWidth + "";
  if (pixelWidthString.indexOf(".") === -1) {
    pixelWidthString += ".0";
  }
  var pixelHeightString = pixelHeight + "";
  if (pixelHeightString.indexOf(".") === -1) {
    pixelHeightString += ".0";
  }

  var functionString =
    "vec4 getClippingPlane(highp sampler2D packedClippingPlanes, int clippingPlaneNumber, mat4 transform)\n" +
    "{\n" +
    "    int pixY = clippingPlaneNumber / " +
    width +
    ";\n" +
    "    int pixX = clippingPlaneNumber - (pixY * " +
    width +
    ");\n" +
    "    float u = (float(pixX) + 0.5) * " +
    pixelWidthString +
    ";\n" + // sample from center of pixel
    "    float v = (float(pixY) + 0.5) * " +
    pixelHeightString +
    ";\n" +
    "    vec4 plane = texture2D(packedClippingPlanes, vec2(u, v));\n" +
    "    return czm_transformPlane(plane, transform);\n" +
    "}\n";
  return functionString;
}

function getClippingPlaneUint8(width, height) {
  var pixelWidth = 1.0 / width;
  var pixelHeight = 1.0 / height;

  var pixelWidthString = pixelWidth + "";
  if (pixelWidthString.indexOf(".") === -1) {
    pixelWidthString += ".0";
  }
  var pixelHeightString = pixelHeight + "";
  if (pixelHeightString.indexOf(".") === -1) {
    pixelHeightString += ".0";
  }

  var functionString =
    "vec4 getClippingPlane(highp sampler2D packedClippingPlanes, int clippingPlaneNumber, mat4 transform)\n" +
    "{\n" +
    "    int clippingPlaneStartIndex = clippingPlaneNumber * 2;\n" + // clipping planes are two pixels each
    "    int pixY = clippingPlaneStartIndex / " +
    width +
    ";\n" +
    "    int pixX = clippingPlaneStartIndex - (pixY * " +
    width +
    ");\n" +
    "    float u = (float(pixX) + 0.5) * " +
    pixelWidthString +
    ";\n" + // sample from center of pixel
    "    float v = (float(pixY) + 0.5) * " +
    pixelHeightString +
    ";\n" +
    "    vec4 oct32 = texture2D(packedClippingPlanes, vec2(u, v)) * 255.0;\n" +
    "    vec2 oct = vec2(oct32.x * 256.0 + oct32.y, oct32.z * 256.0 + oct32.w);\n" +
    "    vec4 plane;\n" +
    "    plane.xyz = czm_octDecode(oct, 65535.0);\n" +
    "    plane.w = czm_unpackFloat(texture2D(packedClippingPlanes, vec2(u + " +
    pixelWidthString +
    ", v)));\n" +
    "    return czm_transformPlane(plane, transform);\n" +
    "}\n";
  return functionString;
}
export default getMultiClippingFunction;
