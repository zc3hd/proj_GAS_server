/*
 本文件为周期数据的计算。并确认周期数据，随机是否可以提交；
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
    // 一周期 最少的天数，后期要配置；
    c_min: conf.c_min,
    // 一周期的内的随机天数
    c_numb: 0,
    // 一周期的确认 后期要配置；
    c_max: conf.c_max,

    // 当前时间戳
    ac_s: 0,

    // 一周的时间戳
    week: [],
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

        // 当前时间的秒
        me.all.ac_s = me._get_active();
        // 一周日期时间戳的 获取
        me._get_week();

        // 得到周期内的随机数
        me._get_week_numb();

        // 得到对象体;
        me._get_week_upd();

        // 赋值到全局变量
        Data.week = me.all.week;

      },
      // 得到第一天的日期毫秒数
      _get_active: function() {
        return FN.f_str_miao(FN.formatterDateDay(new Date(), 1));
      },
      // 计算一周的时间戳对象，全部要提交
      _get_week: function() {
        var one = null;
        me.all.week.length = 0;
        for (let index = 0; index < me.all.c_max; index++) {
          one = {
            date: FN.f_miao_str(me.all.ac_s + index * 24 * 3600 * 1000, 1),
            // 初始化1
            key: 1,
          };
          me.all.week.push(one);
        }
        // console.log(me.all.week);
        one = null;
      },
      // 得到一个周期内的 随机天数
      _get_week_numb: function() {
        me.all.c_numb = me.all.c_min + Math.floor(Math.random() * (me.all.c_max - me.all.c_min + 1));
      },
      // 计算一周期内日期的 数组
      _get_week_upd: function() {
        // me.all.c_numb:一周期内得到的随机数；
        // me.all.week.length - me.all.c_numb : 那么差值，就是要杀死的个数；

        // 小于me.all.c_max  要执行kill 指令
        if (me.all.c_numb < me.all.c_max) {
          // kill     me.all.week.length - me.all.c_numb 多次
          // 随机得到 kill 的下标
          var kill_w_index = 0;
          for (let index = 0; index < me.all.week.length - me.all.c_numb; index++) {
            kill_w_index = Math.floor(Math.random() * me.all.week.length);
            me._kill_week_index(kill_w_index);
          }

        }

      },
      // kill week 数组的 一个下标
      _kill_week_index: function(kill_w_index) {
        // 没有被杀死
        if (me.all.week[kill_w_index].key != 0) {
          me.all.week[kill_w_index].key = 0;
        }
        // 该元素已经被kill
        else {
          kill_w_index = Math.floor(Math.random() * me.all.week.length);
          me._kill_week_index(kill_w_index);
        }
      },



























    };

    for (var key in fns) {
      me[key] = fns[key];
    }
  },
};

module.exports = Module;