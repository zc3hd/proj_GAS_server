var Koa = require('koa');
var static = require('koa-static');
var path = require('path');
var conf = require('./conf.js');
var Router = require('koa-router');

var app = new Koa();


// -------------------------------------------------跨域
var cors = require('koa2-cors');
app.use(cors());

// -------------------------------------------------连接数据库
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/' + conf.db);
// 链接数据库
mongoose.connection.once('open', function() {
  console.log('数据库已连接');
});


// -------------------------------------------------处理post中间件
var bodyParser = require('koa-bodyparser');
app.use(bodyParser());


// --------------------------------------------------API模块
var router = new Router();
var Msg_api = require('./moudles/gas_api.js');
new Msg_api(app, router).init();


// --------------------------------------------------静态资源加载
app.use(static(path.join(__dirname, `../${conf.web_dist}/`)));



app.listen(conf.api_port, function() {
  console.log("API服务 启动在 端口:" + conf.api_port);
});