/*
 本文件为单个项目的提交条数的确认，随机值；
*/


// 全局工具函数
var FN = require('../tool/common.js');
// 全局数据
var Data = require('../collection/data.js');

// 
var conf = require('./GAS_0_conf.js');


function Module() {
  var me = this;


  me.all = {
    // 一天内最少的提交条数，后期要配置；
    push_min: conf.push_min,
    // 一天内 随机提交条数
    push_numb: 0,
    // 一天内 提交条数 最大值
    push_max: conf.push_max,
  };

}
Module.prototype = {
  init: function() {
    var me = this;

    me._bind();

    me._init();

  },
  _bind: function() {
    var me = this;
    var fns = {
      _init: function() {
        // 得到一周期的 提交数 （每个项目）
        me._get_cycle_push_numb();
      },
      // 得到一个项目的提交的随机数
      _get_one_push_numb: function() {
        me.all.push_numb = me.all.push_min + Math.floor(Math.random() * (me.all.push_max - me.all.push_min + 1));
      },
      // 得到一周期的 提交数 （每个项目）
      _get_cycle_push_numb: function() {
        Data.week.forEach(ele => {
          
          ele.pull_numb = 0;
          if (ele.key) {
            me._get_one_push_numb();
            ele.pull_numb = me.all.push_numb;
          }
        });
      },



























    };

    for (var key in fns) {
      me[key] = fns[key];
    }
  },
};

module.exports = Module;