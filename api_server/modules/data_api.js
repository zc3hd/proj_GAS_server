function Module(app) {
  var me = this;

  // 
  me.app = app;

  // 路由
  me.router = require('express').Router();
  // 模型
  me.Data_model = require('../collection/data_model.js');
}
Module.prototype = {
  init: function() {
    var me = this;

    // 配置前缀
    me.api_pro = '/api/week';
    // 配置路由
    me.router.post('/data.do', function(req, res) {
      me._data(req, res);
    });
    // 配置前缀
    me.app.use(me.api_pro, me.router);

  },
  // ===============================================================================
  // 获取数据
  _data: function(req, res) {
    var me = this;
    me.Data_model
      .findOne()
      .then(function(data) {
        res.send(data);
      });
  },

};



module.exports = Module;