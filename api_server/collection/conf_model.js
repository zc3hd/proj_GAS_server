var mongoose = require('mongoose');

// 集合标识
var model_key = 'conf';

// 文档模型
var doc_model = new mongoose.Schema({
  // -----------------------------周期的基本配置
  // 周期基本配置：最少天数
  min: Number,
  // 周期基本配置：周期长度
  max: Number,
  // -----------------------------周期的总周数配置
  sum: Number,

});

// 模型
module.exports = mongoose.model(model_key, doc_model, model_key);