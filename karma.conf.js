// Karma configuration
module.exports = function(config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "karma-typescript"],
    files: [
      "dist/blob-tree.js",
      "test/*.spec.ts"
    ],
    preprocessors: {
        "**/*.spec.ts": "karma-typescript"
    },
    client: {
      clearContext: false,
      karmaHTML: {
        auto: false,
        width: "400px",
        height: "35vw",
        source: [{ src: "./test/index.html", tag: "index" }]
      }
    },
    reporters: ["karmaHTML", "progress", "kjhtml"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    singleRun: false
  })
}
