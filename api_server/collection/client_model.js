var mongoose = require('mongoose');

// 集合标识
var model_key = 'client';

// 文档模型
var doc_model = new mongoose.Schema({
  // 项目名称
  name: String,
  // 后台请求的标识
  flag: String,
  // 总状态开关
  status: String,
  // 文件地址
  filePath: String,
  // 要修改的文件内容
  fileCont: String,
  // 文件内容的min
  fileCont_min: Number,
  // 文件内容的max
  fileCont_max: Number,
  // 日提交的最少数量min
  dayPush_min: Number,
  // 日提交的最大数量max
  dayPush_max: Number,
});

// 模型
module.exports = mongoose.model(model_key, doc_model, model_key);