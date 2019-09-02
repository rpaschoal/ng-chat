// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

module.exports = function (config) {
  const configuration = {
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    // files: [
    //   {pattern: './test.ts', watched: false}
    // ],
    // preprocessors: {
    //   './test.ts': ['@angular-devkit/build-angular']
    // },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, 'coverage'), reports: [ 'html', 'lcovonly' ],
      fixWebpackSourcePaths: false
    },
    
    reporters: config.angularCli && config.angularCli.codeCoverage
      ? ['dots', 'coverage-istanbul']
      : ['dots'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    mime: { 'text/x-typescript': ['ts','tsx'] },
    client: { captureConsole: true }
  };

  config.set(configuration);
};
