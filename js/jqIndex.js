/**
 * 1. 登录状态确认
 * 2. 登录页面中 需要对账号进行校验
 * 3. 注册页面中 需要注册信息并提交
 * 4. 菜单栏切换的功能
 * 5. 新增界面中 新增学生功能（增加完学生要跳转到学生列表页，并且要获取到最新的数据） 学生图表界面
 * 6. 学生列表的展示（分页）
 * 7. 学生编辑删除功能
 * 8. 搜索功能
 */

var username = getCookie('username');
if (username) {
    // var user = document.getElementById('username');
    // user.innerText = username;
    $('#username').text(username);
} else {
    location.href = './login.html';
}

// 当前表格数据所属页数
var nowPage = 1;
// 当前获取的表格数据每一页的条数
var pageSize = 10;
// 当前表格数据一共的页码
var allPage = 1;
// 存储表格数据
var tableData = [];

// 绑定事件函数
function bindEvent() {
    location.hash = 'student-list';
    var list = $('.header .drop-list');
    $('.header .btn').click(function() {
        list.slideToggle();
    });
    $(window).resize(function() {
        if ($(window).innerWidth() >= 768) {
            list.css('display', 'none');
        }
    });
    // 改变锚点切换图表
    $(window).on('hashchange', function() {
        var hash = location.hash;
        console.log(hash);
        $('.show-list').removeClass('show-list');
        $(hash).addClass('show-list');
        $('.left-menu dd.active').removeClass('active');
        $('.' + hash.slice(1)).addClass('active');
    });
    // 点击切换图表
    $('.list-item').click(function() {
        $('.drop-list').slideUp();
        var id = $(this).attr('data-id');
        // $('#' + id).fadeIn().siblings().fadeOut();
        location.hash = id;
    });
    // 切换显示界面
    // $('.menu').on('click', 'dd', function() {
    //     $(this).siblings().removeClass('active').end().addClass('active');
    //     // 在$中选择data-id元素
    //     var id = $(this).data('id');
    //     $('#' + id).fadeIn().siblings().fadeOut();
    // });
    // 提交添加学生表单
    $('#add-submit').click(function(e) {
        e.preventDefault();
        var formData = $('#add-student-form').serializeArray();
        var checkedData = checkedFormData(formData);
        console.log(checkedData)
        if (checkedData.status == 'success') {
            $.ajax({
                url: 'http://open.duyiedu.com/api/student/addStudent',
                type: 'get',
                data: $.extend({
                    appkey: 'Xiaoming_1590306979323'
                }, checkedData.data),
                dataType: 'json',
                success: function(result) {
                    if (result.status === 'success') {
                        alert('添加成功');
                        $('#add-student-form')[0].reset();
                        $('.menu>dd[data-id=student-list]').trigger('click');
                    } else {
                        alert(result.msg)
                    }
                }
            });
            // transferData('/api/student/addStudent', checkedData.data, function() {
            //     alert('添加成功');
            //     $('#add-student-form')[0].reset();
            //     $('.menu>dd[data-id=student-list]').trigger('click');
            // })
        } else {
            // 表单校验失败
            alert(checkedData.msg)
        }
    });
    // 编辑按钮的功能
    $('#tbody').on('click', '.edit', function() {
        var index = $(this).parents('tr').index();
        renderForm(tableData[index]);
        $('.modal').slideDown().css("opacity", "1");
    }).on('click', '.remove', function() {
        var index = $(this).parents('tr').index();
        var isDelete = confirm('确认删除学号为' + tableData[index].sNo + '的学生吗？');
        if (isDelete) {
            transferData('/api/student/delBySno', {
                sNo: tableData[index].sNo
            }, function() {
                alert('删除成功')
                getTableData();
            })
        }
    });
    // 编辑按钮的提交按钮
    $('#edit-submit').click(function(e) {
        e.preventDefault();
        var formData = $('#edit-student-form').serializeArray();
        var checkedData = checkedFormData(formData);
        if (checkedData.status == 'success') {
            transferData('/api/student/updateStudent', checkedData.data, function(data) {
                alert('修改成功');
                $('.modal').slideUp();
                getTableData();
            })
        } else {
            alert(checkedData.msg);
        }
    });
    $('.modal').click(function(e) {
        if (e.target == this) {
            $(this).slideUp()
        }
    });
    $('#search-submit').click(function() {
        var val = $('#search-word').val();
        nowPage = 1;
        if (val) {
            searchData(val);
        } else {
            getTableData();
        }
    });
    $('#search-word').keyup(function(e) {
        // console.log(e.which)
        var val = $('#search-word').val();
        nowPage = 1;
        if (val && e.which == 13) {
            $('#search-submit').trigger('click');
        } else if (!val && e.which == 8) {
            $('#search-submit').trigger('click');
        }
    })
}
bindEvent();

// 搜索数据
function searchData(val) {
    transferData('/api/student/searchStudent', {
        sex: -1,
        search: val,
        page: nowPage,
        size: pageSize
    }, function(data) {
        console.log(data);
        allPage = Math.ceil(data.cont / pageSize);
        tableData = data.searchList;
        renderTable(tableData);
    })
}

// 编辑表单数据回填
function renderForm(data) {
    var form = $('#edit-student-form')[0];
    // 判断当前属性在页面中是否有填写的位置 如果有则数据填写进去
    for (var prop in data) {
        if (form[prop]) {
            form[prop].value = data[prop];
        }
    }
}

/**
 * 校验表单数据
 * @param {Object} formData 
 * return obj = {status: 'success / fail', data: {}, msg: '校验不成功的项的错误信息'}
 */
function checkedFormData(formData) {
    var result = {
        status: 'success',
        data: {},
        msg: '校验成功！'
    }
    for (var i = 0; i < formData.length; i++) {
        if (!formData[i].value) {
            result.status = 'fail';
            result.data = {};
            result.msg = formData[i].name + '不存在';
            break;
        }
        //校验学号 4-16位数字
        if (formData[i].name === 'sNo' && !(/^\d{4,16}$/.test(formData[i].value))) {
            result.status = 'fail';
            result.data = {};
            result.msg = formData[i].name + '学号格式位4到16位数字';
            break;
        }
        //校验出生年份 4位数字 1920-2020
        else if (formData[i].name === 'birth' && !(formData[i].value > 1920 && formData[i].value <= new Date().getFullYear())) {
            result.status = 'fail';
            result.data = {};
            result.msg = formData[i].name + '出生年份格式不正确或年龄过大，只接受小鲜肉';
            break;
        }
        //手机号校验 1开头的11位有效数字
        else if (formData[i].name === 'phone' && !(/^1\d{10}$/.test(formData[i].value))) {
            result.status = 'fail';
            result.data = {};
            result.msg = formData[i].name + '手机号不正确';
            break;
        }
        result.data[formData[i].name] = formData[i].value;
    }
    return result;
}

/**
 * 数据交互封装函数 网络请求
 * @param {URL} url 请求路径
 * @param {Object} data 请求对象参数
 * @param {Function} callback 回调函数
 */
function transferData(url, data, callback) {
    $.ajax({
        url: 'http://open.duyiedu.com' + url,
        type: 'get',
        data: $.extend({
            appkey: 'Xiaoming_1590306979323' //Q_A_Q_1590927055348, Xiaoming_1590306979323
        }, data),
        dataType: 'json',
        success: function(result) {
            if (result.status === 'success') {
                callback(result.data)
            } else {
                alert(result.msg)
            }
        }
    })
}

// 获取学生列表数据
function getTableData() {
    transferData('/api/student/findByPage', {
        page: nowPage,
        size: pageSize
    }, function(data) {
        allPage = Math.ceil(data.cont / pageSize);
        tableData = data.findByPage;
        renderTable(data.findByPage)
    })
}
getTableData();

// 渲染表格数据
function renderTable(data) {
    var str = data.reduce(function(prevStr, current) {
        return prevStr + `<tr>
        <td>${current.sNo}</td>
        <td>${current.name}</td>
        <td>${current.sex == 0 ? '男' : '女'}</td>
        <td>${current.email}</td>
        <td>${new Date().getFullYear() - current.birth}</td>
        <td>${current.phone}</td>
        <td>${current.address}</td>
        <td>
            <button class="btn btn-success edit" data-target="#editMessage">编辑</button>
            <button class="btn btn-danger remove">删除</button>
        </td>
    </tr>`
    }, '');
    $('#tbody').html(str);
    $('.turn-page').page({
        size: pageSize,
        current: nowPage,
        allPage: allPage,
        changePage: function(page, size) {
            nowPage = page;
            pageSize = size;
            var val = $('#search-word').val();
            if (val) {
                searchData(val);
            } else {
                getTableData();
            }
        }
    });
}