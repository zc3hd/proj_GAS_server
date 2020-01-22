function App() {
  // 全局的配置项
  this.conf = {};
  this.api = {
    // ------------------------------周期数据配置
    // 周期基本配置
    cycle_conf: "/api/cycle_conf",
    // 周期基本配置获取
    cycle_get: "/api/cycle_get",

    // ------------------------------具体的数据
    // 新增一份周期数据
    data_add: "/api/data_add",
    // 整个周期数据
    data_list: "/api/data_list",
    // 删除一条数据
    data_delFirst: "/api/data_delFirst",
    // 删除所有数据
    data_delAll: "/api/data_delAll",
    // 更新一条数据
    data_upd: "/api/data_upd",

    // ----------------------------client
    // 用户端配置 新增
    client_add: "/api/client_add",
    // 用户端配置 修改
    client_upd: "/api/client_upd",
    // 用户端配置 删除
    client_del: "/api/client_del",
    // 用户端配置 全部
    client_list: "/api/client_list",
  }
}
App.prototype = {
  init: function() {

    // 默认修改模式
    this.list();
    // 列表的点击修改数据
    this.list_upd();
    // 新增周期数据
    this.list_add();
    // 删除第一条数据
    this.list_delFirst();
    // 删除所有过期数据
    this.list_delAll();



    // 周期基本配置
    this.cycle_conf();
    // 获取基本配置
    this.cycle_get();



    // client的弹窗事件:+号、关闭、点击确认
    this.clien_model();

    // 用户端新增一份
    this.client_add();
    // 修改单份数据
    this.client_upd();
    // 删除单份数据
    this.client_del();


    // 获取所有client列表
    this.client_list();

  },
  // ---------------------------------------------client配置
  // 弹窗内的事件
  clien_model: function() {
    var me = this;
    // + 号事件
    $("#modal_dialog_clinet").on('click', '.glyphicon', function() {
      $(this).parent().after($(this).parent().clone());
      $(this).hide();
    });

    // close
    $("#client_close").on("click", function() {
      me.client_close();
    });

    // save
    var key, ipts;
    $("#client_save").on("click", function() {
      key = false; // 默认没有空格
      ipts = $('#modal_dialog_clinet .form-control');
      for (var i = 0; i < ipts.length; i++) {
        if ($(ipts[i]).val() == "") {
          key = true; // 有存在空格
          break;
        }
      }
      // 存在空格
      if (key) {
        alert("存在空格项，不能提交！")
        return;
      }
      // 普通输入的添加
      var obj = {
        name: $("#cl_name").val(),
        flag: $("#cl_flag").val(),
        status: $("#modal_dialog_clinet input[name='status']:checked").val(),
        filePath: $("#cl_filePath").val(),
        fileCont_min: $("#cl_fileCont_min").val() * 1,
        fileCont_max: $("#cl_fileCont_max").val() * 1,
        dayPush_min: $("#cl_dayPush_min").val() * 1,
        dayPush_max: $("#cl_dayPush_max").val() * 1,
      };

      // 更新内容的添加
      var keys = $('.cl_fileCont_key');
      var vals = $('.cl_fileCont_val');
      var fileCont = {};
      keys.each(function(index, dom) {
        fileCont[$(dom).val()] = $(vals[index]).val();
      });
      obj.fileCont = JSON.stringify(fileCont);


      var url;
      // 添加模式
      if (me.conf.client == "add") {
        url = me.api.client_add;
      }
      // 修改模式
      else {
        url = me.api.client_upd;
        obj._id = me.conf.client_id;
      }


      $.ajax({
          url: url,
          dataType: "json",
          type: "POST",
          data: obj,
        })
        .done(function(res) {
          // 关闭弹窗操作
          me.client_close();

          // 列表展示
          me.client_list();
        });

    });
  },
  // 点击用户端配置新增
  client_add: function() {
    var me = this;
    // 点击显示
    $("#client_add").on("click", function() {
      // 现在为新增模式；
      me.conf.client = "add";
      $('#modal_dialog_clinet').modal('show');
    });
  },
  // 修改
  client_upd: function() {
    var me = this;
    var data, fileCont, add;
    $("#client_list").on("click", ".cl_upd", function() {
      // 保存_id
      me.conf.client_id = $(this).attr("_id");
      me.conf.client = "upd";

      // 显示弹窗
      $('#modal_dialog_clinet').modal('show');

      // 普通信息注入
      data = $(this).attr("_data");
      data = JSON.parse(data);
      for (var key in data) {
        $(`#cl_${key}`).val(data[key]);
      }

      // 单选注入
      $('#modal_dialog_clinet input:radio').attr('checked', false);
      $(`#modal_dialog_clinet input[value=${data.status}]`)[0].checked = true;


      // 更新内容注入
      fileCont = JSON.parse(data.fileCont);
      $('#modal_dialog_clinet .add').remove();
      for (var _key in fileCont) {
        add = $(`<div class="one add">
                  <span class="item_1">更新内容</span>
                  <span class="item_3">
                    <input type="text" class="form-control cl_fileCont_key" placeholder="key" value=${_key}>
                  </span>
                  <span class="item_3">
                    <input type="text" class="form-control cl_fileCont_val" placeholder="val" value=${fileCont[_key]}>
                  </span>
                  <div class="glyphicon glyphicon-plus"></div>
                </div>`);
        $('#modal_dialog_clinet .modal-body').append(add);
      }
      // + 号隐藏
      $('#modal_dialog_clinet .add .glyphicon').hide();
      $('#modal_dialog_clinet .add:last .glyphicon').show();



    });
  },
  // 删除
  client_del: function() {
    var me = this;
    $("#client_list").on("click", ".cl_del", function() {
      $.ajax({
          url: me.api.client_del,
          dataType: "json",
          type: "POST",
          data: { _id: $(this).attr("_id") }
        })
        .done(function() {
          // 列表展示
          me.client_list();
        });
    });
  },
  // 获取用户数据
  client_list: function() {
    var me = this;

    $("#client_list").html("");
    var item;
    var one;
    $.ajax({
        url: me.api.client_list,
        dataType: "json",
        type: "POST",
      })
      .done(function(arr) {


        arr.forEach(function(data, index) {
          // 创建节点
          item = $(`<div class="item col-sm-6 item_${data.status}"></div>`);

          // 循环完每一项数据
          for (var key in data) {
            if (key == "_id") {} else if (key == "__v") {} else {
              one = $(`<div class="one">
                      <span class="left">${key}</span>
                      <span class="right">${data[key]}</span>
                    </div>`);
              item.append(one);
            }
          }
          // 添加按钮
          item.append(`<div class="one">
                        <span class="left">
                            <button type="button" class="btn btn-primary btn-xs cl_upd" _id=${data._id} _data=${JSON.stringify(data)}>修改</button>
                        </span>
                        <span class="right">
                          <button type="button" class="btn btn-danger btn-xs cl_del" _id=${data._id}>删除</button>
                        </span>
                      </div>`);

          $("#client_list").append(item);

        });


      });
  },

  // 用户端关闭设置
  client_close: function() {
    // 内容清空
    $('#modal_dialog_clinet .form-control').val("");

    // 单选恢复
    $('#modal_dialog_clinet input:radio').attr('checked', false);
    $('#modal_dialog_clinet input:radio')[0].checked = true;

    // 内容剩余一条
    $('#modal_dialog_clinet .add:eq(0)').siblings(".add").remove();
    $('#modal_dialog_clinet .add:eq(0)').children(".glyphicon").show();

    // 弹窗隐藏
    $('#modal_dialog_clinet').modal('hide');
  },



  // ----------------------------------------------周期配置
  // 周期基本配置
  cycle_conf: function() {
    var me = this;
    $("#cycle_conf").on("click", function() {
      // 只要有一个数据是空不能配置
      if ($("#cycle_conf_min").val() == "" || $("#cycle_conf_max").val() == "" || $("#cycle_conf_sum").val() == "") {
        $('#modal_body').html('配置不能为空！');
        $('#modal_dialog').modal('show');
        return;
      }

      // 
      $.ajax({
          url: me.api.cycle_conf,
          dataType: "json",
          type: "POST",
          data: {
            min: $("#cycle_conf_min").val(),
            max: $("#cycle_conf_max").val(),
            sum: $("#cycle_conf_sum").val(),
          },
        })
        .done(function(res) {
          me.cycle_show(res);

          $('#modal_body').html('配置成功');
          $('#modal_dialog').modal('show');
        });
    });
  },
  // 周期基本配置获取
  cycle_get: function() {
    var me = this;
    $.ajax({
        url: me.api.cycle_get,
        dataType: "json",
        type: "POST",
      })
      .done(function(res) {
        if (res == undefined) {
          return;
        }
        me.cycle_show(res);
      });
  },
  // 周期数据展示
  cycle_show: function(res) {
    $("#cycle_conf_min").val(res.min);
    $("#cycle_conf_max").val(res.max);
    $("#cycle_conf_sum").val(res.sum);
    $("#data_container").text(res.sum * 7);
  },


  // ----------------------------------------------列表
  list: function() {
    var me = this;

    // 清空列表
    $("#cycle_data").empty().hide();


    // 数据请求
    $.ajax({
        url: me.api.data_list,
        dataType: "json",
        type: "POST",
      })
      .done(function(res) {

        // 数据渲染
        me._list_render(res);

      });




  },
  // 数据渲染
  _list_render: function(res) {
    var me = this;
    var col, cname;
    if (res.length != 0) {
      // 显示
      $("#cycle_data").show();
      // 数据长度
      $('#data_length').html(res.length);
    }
    // 
    for (var i = 0; i < res.length; i++) {
      if (i % 7 == 0) {
        // 生成数据
        col = $(`<div class="col"></div>`);
        // 添加到列表中
        $("#cycle_data").append(col);

      }

      // 过去
      if (res[i].time < me._ac_time()) {

        // 提交显示
        cname = res[i].push ? "r_old_1" : "r_old_0";
      }
      // 未来数据
      else {
        cname = res[i].push ? "r_new_1" : "r_new_0";
      }

      // 新建 r 且添加到col里面：
      col.append($(`<div class="r ${cname}" _id=${res[i]._id} _push=${res[i].push}  _time=${res[i].time} data-toggle="tooltip" data-placement="top" title=${me._ac_info(res[i].time)}></div>`));
    }

    // 提示信息
    $('[data-toggle="tooltip"]').tooltip();

  },
  // 获取当前系统时间戳
  _ac_time: function() {
    var date, y, m, r;
    date = new Date();
    y = date.getFullYear();
    m = date.getMonth();
    r = date.getDate();
    date = new Date(y, m, r);
    return date.valueOf();
  },
  // 当前项的信息显示
  _ac_info: function(time) {
    return FN.formatterDateDay(time, 1);
  },


  // 点击修改数据
  list_upd: function() {
    var me = this;

    var dom;
    // 注册事件
    $("#cycle_data")
      .off()
      .on("click", ".r_new_0,.r_new_1", function() {

        // 当前点击的DOM节点
        dom = $(this);

        // 
        $.ajax({
            url: me.api.data_upd,
            dataType: "json",
            type: "POST",
            data: {
              _id: dom.attr("_id"),
              push: dom.attr("_push"),
            }
          })
          .done(function(data) {

            // push:1
            if (dom.hasClass("r_new_1")) {
              dom
                .removeClass("r_new_1").addClass("r_new_0")
                .attr("_push", 0);
            }
            // push:0
            else {
              dom
                .removeClass("r_new_0").addClass("r_new_1")
                .attr("_push", 1);
            }
          });





      })
  },
  // 新增一份周期数据
  list_add: function() {
    var me = this;
    $("#add").on("click", function() {
      $.ajax({
          url: me.api.data_add,
          dataType: "json",
          type: "POST",
        })
        .done(function(data) {
          // 当前 数据总量 超过容器
          if (data.res == -1) {
            $('#modal_body').html('当前数据总量超过容器，不能添加！');
            $('#modal_dialog').modal('show');
          }
          // 可以添加数据
          else {
            me.list();
          }
        });
    });
  },
  // 删除第一个数据
  list_delFirst: function() {
    var me = this;
    var dom, time;
    $("#del_first")
      .on("click", function() {
        dom = $("#cycle_data .col:eq(0) .r:eq(0)")
          // 获取
        time = dom.attr("_time");
        // console.log(time);

        // 现在及未来的数据
        if (time >= me._ac_time()) {
          $('#modal_body').html('不能删除现在和未来节点！');
          $('#modal_dialog').modal('show');
          return;
        }

        // 
        $.ajax({
            url: me.api.data_delFirst,
            dataType: "json",
            type: "POST",
            data: { _id: dom.attr("_id") },
          })
          .done(function(res) {
            console.log(res);

            me.list();
          });

      });
  },
  // 删除所有数据
  list_delAll: function() {
    var me = this;
    $("#del_all")
      .on("click", function() {

        $.ajax({
            url: me.api.data_delAll,
            dataType: "json",
            type: "POST",
          })
          .done(function(res) {
            // 没有旧数据
            if (res.n == 0) {

              $('#modal_body').html('没有旧数据可删除');
              $('#modal_dialog').modal('show');
              return;
            }
            me.list();
          });

      });
  },


};






new App().init();

// $.ajax({
//   url: "/api/js_demo/font.do",
//   dataType: "json",
//   type: "POST",
// })
//   .done(function (data) {
//     // *********************************************测试数据
//     // var size = Math.floor(Math.random() * 200);
//     // if (size < 60) {
//     //   size = 60;
//     // }
//     // var color = Math.floor(Math.random() * 1000000);
//     // *********************************************测试数据

//     // CSS设置
//     $('#demo').css({
//       fontSize: data.size + "px",
//       color: '#' + data.color
//     });

//     // 显示信息
//     $('#info').html(`fontSize:${data.size}px; color:#${data.color}`);

//     // 
//     setTimeout(function (argument) {
//       this.init();
//     }.bind(this), 2000);

//   }.bind(this));