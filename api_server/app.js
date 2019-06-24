var express = require('express');
var app = express();


// 服务器
var http = require('http').Server(app);

// IO
// var io = require('socket.io')(http);

// 静态文件 POST
var path = require('path');
var bodyParser = require('body-parser');

// conf
var conf = require('../conf.js');
process.env.NODE_ENV = process.env.NODE_ENV || "process.env.NODE_ENV";

// =====================================================连接数据库
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/' + conf.db);
// 链接数据库
mongoose.connection.once('open', function() {
  console.log('数据库已连接');
});




// =====================================================API
// 提供所有的API
function API(app) {

  // post应该放在内部，不然就没有设置post
  app.use(bodyParser.urlencoded({ extended: false }));

  // 开启跨域模式
  app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    next();
  });

  // 开启测试 API
  app.post(conf.test_api, function(req, res) {
    res.send({
      ret: 1
    });
  });

  // GAS 周期、条数 数据初始化
  var GAS_data = require('./GAS/GAS.js');
  new GAS_data().init();


  // Data_api输出
  var Data_api = require('./modules/data_api.js');
  new Data_api(app).init();
}



// ==============================都是代理模式启动
// 提供静态文件
app.use(express.static(path.join(__dirname, '../webapp/')));

// 提供api服务
API(app);


http.listen(conf.api_port, function() {
  console.log('app服务 启动在：' + conf.api_port);
});