var Router = require('koa-router');
var http = require("http");
var conf = require("../conf.js");
var axios = require('axios');


function API(app, router) {
  var me = this;


  // 路由设计
  me.api = new Router();

  // 装载路由设计
  me.app = app;
  me.router = router;

  // 配置-模型
  me.md_conf = require('../collection/conf_model.js');
  // 全局的配置项；
  me.conf = {};

  // 具体周期数据-模型
  me.md_data = require('../collection/data_model.js');

  // client数据模型
  me.md_client = require('../collection/client_model.js');
}
API.prototype = {
  init: function() {
    var me = this;

    // ----------------------------------------提交周期基本配置
    me.api
      .post('/cycle_conf', async function(ctx) {
        // 数据获取
        var res = await me._conf_get();

        // 无数据 新增
        if (res == null) {
          res = await me._conf_add({
            min: ctx.request.body.min * 1,
            max: ctx.request.body.max * 1,
            sum: ctx.request.body.sum * 1,
          });
        }
        // 有数据 修改
        else {
          res.min = ctx.request.body.min;
          res.max = ctx.request.body.max;
          res.sum = ctx.request.body.sum;
          res = await me._conf_upd(res);
        }
        // 配置完后，全局挂载；
        me.conf.min = res.min;
        me.conf.max = res.max;
        me.conf.sum = res.sum;

        // 重新开启定时器
        clearInterval(me.conf.timer);
        me.conf.timer = setInterval(function() {
          me._data_autoAdd();
          // console.log("配置后 重新");
        }, me.conf.max * 24 * 3600 * 1000);


        // 返回
        ctx.body = res;
      })
      // 周期基本配置获取
      .post('/cycle_get', async function(ctx) {
        var res = await me._conf_get();

        // 存在有数据
        if (res != null) {
          // 获取后，全局挂载；
          me.conf.min = res.min;
          me.conf.max = res.max;
          me.conf.sum = res.sum;

          ctx.body = res;
        }
        // 没有数据
        else {
          ctx.body = { res: -1 };
        }


      });


    // -----------------------------------------具体的周期数据
    me.api
      // 新增一份周期数据
      .post('/data_add', async function(ctx) {
        // 新增数据
        var res = await me._data_add();
        // 返回
        ctx.body = res;
      })
      // 获取全部数据
      .post("/data_list", async function(ctx) {

        // 获取全部数据
        var res = await me._data_list();
        // 返回
        ctx.body = res;
      })
      // 删除第一条过期数据
      .post("/data_delFirst", async function(ctx) {

        var res = await me._data_delFirst(ctx.request.body._id);
        ctx.body = res;
      })
      // 删除所有过期数据
      .post("/data_delAll", async function(ctx) {

        var res = await me._data_delAll(me._data_acTime());
        // 返回
        ctx.body = res;
      })
      // 修改状态
      .post("/data_upd", async function(ctx) {

        var res = await me._data_upd(ctx.request.body._id, ctx.request.body.push);
        // 返回
        ctx.body = res;
      });



    // ------------------------------------------client配置
    me.api
      // 新增一份client
      .post('/client_add', async function(ctx) {
        // 新增数据
        var res = await me._client_add(ctx.request.body);
        // 返回
        ctx.body = res;
      })
      // 修改一份client
      .post('/client_upd', async function(ctx) {
        // 新增数据
        var res = await me._client_upd(ctx.request.body);
        // 返回
        ctx.body = res;
      })
      // 删除一份client
      .post('/client_del', async function(ctx) {
        // 新增数据
        var res = await me._client_del(ctx.request.body._id);
        // 返回
        ctx.body = res;
      })
      // 获取全部client
      .post('/client_list', async function(ctx) {
        var res = await me._client_list();
        // 返回
        ctx.body = res;
      });




    // -----------------------------------------------client 真实调用
    me.api
      // 获取今天是否为提交日 push?：
      //   1：返回该项目数据包
      //   0: 返回0;
      .post('/gas', async function(ctx) {

        // 找到数据
        var res = await me._client_get(ctx.request.body);


        // 返回
        ctx.body = res;
      });




    // 前缀
    me.router.use('/api',
      me.api.routes(),
      me.api.allowedMethods());

    // 加载当前API
    me.app
      .use(me.router.routes())
      .use(me.router.allowedMethods());


    // 自动服务
    me._data_auto();
  },
  // --------------------------------------------------------client
  _client_add: async function(obj) {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.md_client
        .create(obj)
        .then(function(data) {
          resolve(data);
        });
    });
  },
  // 修改一份数据
  _client_upd: function(obj) {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.md_client
        .findByIdAndUpdate(obj._id, {
          $set: obj
        })
        .then(function(data) {
          resolve(data);
        });
    });
  },
  // 删除
  _client_del: function(_id) {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.md_client
        .findByIdAndRemove(_id)
        .then(function(data) {
          resolve(data);
        });
    });
  },
  // 获取全部数据：
  _client_list: function() {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.md_client
        .find({})
        .then(function(data) {
          resolve(data);
        });
    });
  },
  // 获取一份配置：
  _client_get: function(obj) {
    var me = this;

    return new Promise(function(resolve, reject) {
      // 找今日是否为提交日
      me.md_data
        .findOne({ time: me._data_acTime() })
        .then(function(data) {

          // 非提交日
          if (data.push == 0) {
            resolve({ res: -1 });
          }
          // 提交日
          else {
            me.md_client
              .findOne(obj)
              .then(function(data) {

                // 没有该数据
                if (data == null) {
                  resolve({ res: -1 });
                }
                // 有数据，开关为off 
                else if (data.status == "off") {
                  resolve({ res: -1 });
                }
                // 有数据，开关为on
                else {
                  resolve(data);
                }
              });
          }
        });

    });
  },






  // --------------------------------------------------------数据
  // ------------------------------------自动
  // 数据自动服务
  _data_auto: function() {
    var me = this;

    clearInterval(me.conf.timer);
    axios
      .post(`http://${conf.ip}:${conf.api_port}/api/cycle_get`)
      .then(function(res) {

        // 没有配置基础数据
        if (res.data.res == -1) {
          console.log("无周期基础配置数据，不能进行手动或自动新增");
          return;
        }
        console.log("周期基础数据已配置");
        // 数据新增
        me._data_autoAdd();

        // 开启自动新增
        me.conf.timer = setInterval(function() {
          me._data_autoAdd();
          // console.log(1);
        }, me.conf.max * 24 * 3600 * 1000);

      });

  },
  _data_autoAdd: function() {
    var me = this;
    axios
      .post(`http://${conf.ip}:${conf.api_port}/api/data_add`)
      .then(function(data) {
        data = data.data;

        console.log("");
        console.log("*******************自动新增模式******************");

        // 已有数据超过上限
        if (data.res == -1) {
          console.log("数据总长度超过上限");

          // 找到第一条数据
          me._data_getOne(1)
            .then(function(one) {
              console.log("  1.找到第一条数据");
              // 删除 周期长度 数据
              return me._data_delAll(one.time + me.conf.max * 24 * 3600 * 1000);
            })
            .then(function(data) {

              console.log(`  2.删除从第一条开始的周期长度 ${me.conf.max} 条数据`);
              // 新增一份数据
              axios
                .post(`http://${conf.ip}:${conf.api_port}/api/data_add`)
                .then(function(data) {
                  data = data.data;
                  console.log(`  3.自动新增的一份数据,长度为 ${me.conf.max}`);
                });
            });

        }
        // 没有超过上限，就新增一份数据
        else {
          console.log("数据总长度未超上限");
          console.log(`  1.自动新增的一份数据,长度为 ${me.conf.max}`);
        }

      })
  },

  // -----------------------------------------删除
  // 删除第一条数据
  _data_delFirst: function(_id) {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.md_data
        .findByIdAndRemove(_id)
        .then(function(data) {
          resolve(data);
        });
    });
  },
  // 删除某个时间点前面的数据
  _data_delAll: function(time) {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.md_data
        .deleteMany()
        .lt("time", time)
        .then(function(data) {
          resolve(data);
        });
    });
  },





  // 更新一条数据的状态
  _data_upd: function(_id, push) {
    var me = this;
    return new Promise(function(resolve, reject) {
      // console.log(push);

      me.md_data
        .findById(_id)
        .then(function(doc, err) {

          doc.push = push == 1 ? 0 : 1;

          doc.save()
            .then(function(data) {
              resolve(data);
            });
        });
    });
  },



  // -----------------------------------------新增
  // 新增一份周期数据
  _data_add: async function() {
    var me = this;

    // 没有配置数据，不能新增
    if (me.conf.sum == undefined) {
      return { res: -1 };
    }

    // 已有数据的长度 大于= 总容器   数据达到上限，不能手动新增
    var len = await me._data_length();
    if (len >= me.conf.sum * 7) {

      return { res: -1 };
    }
    // 没有超过上限，点击后可以手动新增
    else {
      // 查询最后一条数据 倒序找到最后一条数据
      var res = await me._data_getOne(-1);

      // 生成数据
      var arr = this._data_gen(res);

      // 添加一份周期数据
      await this._data_addCycle(arr);

      // 返回
      return { res: 1 };
    }

  },
  // 数据生成：
  _data_gen: function(ac) {
    var me = this;

    // 有 ??天 确认被提交
    var sure = me.conf.min + Math.floor(Math.random() * (me.conf.max - me.conf.min + 1));

    // 有 ??天 不需要提交
    var none = me.conf.max - sure;


    // ------------------------------没有数据
    var mm;
    if (ac == null) {
      // 获取当前时间戳
      mm = me._data_acTime();
      // 推前me.conf.sum/2 个 周期时间
      mm = mm - Math.floor(me.conf.sum / 2) * 7 * 24 * 3600 * 1000;
    }
    // ------------------------------有最后一条数据：顺着最后一条数据加
    else {
      mm = ac.time * 1 + 24 * 3600 * 1000;
    }

    // 空数组
    var arr = [];
    for (var i = 0; i < me.conf.max; i++) {
      // 默认全部是提交日
      arr[i] = { push: 1, time: mm + i * 24 * 3600 * 1000 };
    };

    // 递归 执行次数
    var num = 0;
    kill();

    function kill() {
      // 当== none(不需要提交的天数) 退出
      if (num == none) {
        return;
      }
      // 随机下标
      var j = Math.floor(Math.random() * arr.length);
      // 随机下标的 提交日 修改为不提交
      if (arr[j].push) {
        arr[j].push = 0;
        num++;
      }


      kill();
    }

    return arr;
  },
  // 返回当前时间戳
  _data_acTime: function() {
    var date, y, m, r;
    date = new Date();
    y = date.getFullYear();
    m = date.getMonth();
    r = date.getDate();
    date = new Date(y, m, r);
    return date.valueOf();
  },
  // 新增一份周期数据
  _data_addCycle: async function(arr) {
    var me = this;
    for (var i = 0; i < arr.length; i++) {
      await this._data_addOne(arr[i]);
    }
  },
  // 新增一条数据
  _data_addOne: function(obj) {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.md_data
        .create(obj)
        .then(function(data) {
          resolve(data);
        });
    });
  },
  // 查询最后一条数据数据
  _data_getOne: function(key) {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.md_data
        .findOne()
        .sort({ time: key })
        .then(function(data) {
          resolve(data);
        });
    });
  },
  // 查询数据的长度
  _data_length: function() {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.md_data
        .count({})
        .then(function(data) {
          resolve(data);
        });
    });
  },
  // 获取全部数据：
  _data_list: function() {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.md_data
        .find({})
        .sort({ time: 1 })
        .then(function(data) {
          resolve(data);
        });
    });
  },


  // ==------------------------------------------------------周期
  // 周期基本配置获取
  _conf_get: function() {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.md_conf
        .findOne()
        .then(function(data) {
          resolve(data);
        });
    });
  },
  // 新增一份数据
  _conf_add: function(obj) {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.md_conf
        .create(obj)
        .then(function(data) {
          resolve(data);
        });
    });
  },
  // 修改配置数据
  _conf_upd: function(obj) {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.md_conf
        // 找到并且更新
        .findById(obj._id)
        // 
        .then(function(doc, err) {
          doc.min = obj.min;
          doc.max = obj.max;
          doc.sum = obj.sum;

          // 实例方法也是promise
          doc.save()
            .then(function(result) {
              resolve(result);
            })

        });

    });

  },
  // 










  _list_all: function() {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.model_msg
        .find()
        .sort({ '_id': -1 })
        .then(function(data) {
          resolve(data);
        });
    });
  },
  // 
  _list_del: function(obj) {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.model_msg
        .deleteOne(obj)
        .then(function(data) {
          resolve(data);
        });
    });
  }
};

module.exports = API;