/*
本文件为数据本地计算的入口文件，执行 删除、计算、保存；
执行完成后，把数据保存到数据库内部；
*/


// 本地的数据
var Data = require('../collection/data.js');

// 配置项
var conf = require('./GAS_0_conf.js');

function Module() {
  var me = this;

  // 模型
  me.Data_model = require('../collection/data_model.js');
}
Module.prototype = {
  init: function() {
    var me = this;

    // 本地周期数据初始化
    me._init_once();


    setInterval(function() {
      me._init_once();
    }, conf.c_max * 24 * 3000 * 1000);
  },
  // 执行一次
  _init_once: function() {
    var me = this;
    // 
    // 删除
    me._init_remove()
      .then(function() {
        // 计算
        return me._init_add();
      })
      .then(function() {
        // 本地更新数据
        me._init_upd();
      });
  },
  //  删除
  _init_remove: function() {
    var me = this;

    return new Promise(function(reslove, reject) {
      me.Data_model
        .remove()
        .then(function() {
          reslove();
        });
    });
  },
  // 初始化一个数据
  _init_add: function() {
    var me = this;

    return new Promise(function(reslove, reject) {
      me.Data_model
        .create({
          week: JSON.stringify(Data.week),
        })
        .then(function(data) {
          // 生成一条数据
          Data._id = data._id;

          // 生成数据
          // 一个周期内的天数
          var Cycle_numb = require('./GAS_1_cycle.js');
          new Cycle_numb().init();

          // 每个项目的 提交条数确认 
          var Push_numb = require('./GAS_2_push.js');
          new Push_numb().init();

          reslove();
        });
    });
    // 
  },
  // 本地更新数据
  _init_upd: function() {
    var me = this;
    me.Data_model
      .findById(Data._id)
      .then(function(data) {

        data.week = JSON.stringify(Data.week);
        // console.loh
        return data.save();
      })
      .then(function(data) {
        // 数据已经保存；
        // console.log(Data);
      });
  },
};



module.exports = Module;