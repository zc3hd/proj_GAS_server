var mongoose = require('mongoose');

// 集合标识
var model_key = 'data';

// 文档模型
var doc_model = new mongoose.Schema({
  // 时间戳
  time: Number,
  // 提交日标识
  push: Number,
});

// 模型
module.exports = mongoose.model(model_key, doc_model, model_key);