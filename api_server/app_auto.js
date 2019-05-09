var nodemon = require('gulp-nodemon');
var path = require('path');
nodemon({
  // 监听的入口
  script: path.join(__dirname, './app.js'),
  // 忽略的文件
  ignore: [
    path.join(__dirname, '../src_webapp/'),
    path.join(__dirname, '../webapp/'),
    path.join(__dirname, '../gulpfile.js'),
    path.join(__dirname, '../cmd.js'),
  ],
  env: { 'NODE_ENV': 'development' }
});