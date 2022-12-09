// vite.config.js
const path = require("path");
const _build_package_name = "cesium-effect-bigemap";
const _build_package_format = ["es"];
let mode;

const transformIndexHtml = (code) => {
  switch (mode) {
    case 'staging':
      return code.replace(/\.\.\/Src\/main/, `../Dist/${_build_package_name}.${_build_package_format[0]}`)   // 生产环境
  }
}

const fileRegex = /Example\/[^]+\.ts$/;
const _initHTMLPlugin = () => {
  return {
    name: 'initHTMLPlugin',
    enforce: 'pre',

    configResolved(resolvedConfig) {
      // 存储最终解析的配置
      mode = resolvedConfig.mode;
    },
    transform(code, id) {
      // if (id.endsWith('.html')) {
      if (fileRegex.test(id)) {
        return { code: transformIndexHtml(code), map: null }
      }
    },
    transformIndexHtml
  };
}

export default {
  // 配置选项
  server: {
    hmr: false,
    // open: '/dev.html'
  },
  build: {
    outDir: "Dist",
    lib: {
      entry: path.resolve(__dirname, "index.ts"),
      name: _build_package_name,
      formats: _build_package_format,
      fileName: (format) => `cesium-effect-bigemap.${format}.js`
    },
    sourcemap: true
  },
  publicDir: "Assets",
  plugins: [
    _initHTMLPlugin(),
  ],
  define: {
    'process.env.VITE_ENV': `'${process.env.VITE_ENV}'`,
    // 'process.env.CESIUM_BASE_URL': JSON.stringify(process.env.CESIUM_BASE_URL || 'http://localhost:3000/'),
    // 'window.CESIUM_BASE_URL':  'http://localhost:3000/',
  },
  optimizeDeps: {
    exclude: ['__INDEX__'], // 排除 __INDEX__
  },
}