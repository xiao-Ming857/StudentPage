// console.log(getCookie('username'))
var user = document.getElementById('username');
var username = getCookie('username');
if (username) {
    user.innerText = username;
} else {
    location.href = './login.html';
}

var studentList = document.querySelector('.menu dd[data-id=student-list]');
var tableData = [];
var page = 1;
var size = 10;
var allpage = 1;
//绑定事件
function bindEvent() {
    var menu = document.querySelector('.menu')
        //导航点击事件 事件委托
    menu.onclick = function(e) {
        var target = e.target; //当前点击的元素
        if (target.tagName == 'DD') {
            target.classList.add('active');
            var siblings = getSiblings(target); //获取兄弟节点
            for (var i = 0; i < siblings.length; i++) {
                siblings[i].classList.remove('active');
            }
            var id = target.getAttribute('data-id'); //获取含有自定义属性的标签
            //console.log(id, target.dataset.id) //效果一样
            var showContent = document.getElementById(id);
            // console.log(showContent);
            showContent.style.display = 'block';
            var siblingsContent = getSiblings(showContent);
            for (var i = 0; i < siblingsContent.length; i++) {
                siblingsContent[i].style.display = 'none';
            }
        }
    }

    //点击添加学生
    var studentAddBtn = document.getElementById('add-submit');
    var addStudentForm = document.getElementById('add-student-form');
    studentAddBtn.onclick = function(e) {
        e.preventDefault();
        //获取新增表单数据
        var data = getFormData(addStudentForm);
        if (data) {
            // var str = 'appkey=Xiaoming_1590306979323';
            // for (var prop in data) {
            //     str += '&' + prop + '=' + data[prop];
            // }
            //如果用户数据填写全了 提交给后台
            // ajax('GET', 'http://open.duyiedu.com/api/student/addStudent', str, function(result) {
            //     if (result.status == 'success') {
            //         console.log(result);
            //         alert(result.msg)
            //     } else {
            //         alert(result.msg);
            //     }
            // }, true)
            transferData('/api/student/addStudent', data, function(result) {
                alert('新增成功');
                page = 1;
                getTableData();
                studentList.click();
            })
        }
    }

    //编辑按钮的点击事件
    var tbody = document.getElementById('tbody');
    var modal = document.querySelector('.modal');
    tbody.onclick = function(e) {
        var target = e.target;
        //判断当前点击的元素class类名当中是否含有edit  如果含有就是编辑按钮
        if (target.classList.contains('edit')) {
            modal.style.display = 'block';
            //获取当前学生的索引值
            var index = target.dataset.index;
            // console.log(tableData[index])
            renderEiditForm(tableData[index]);
        } else if (target.classList.contains('remove')) {
            //删除按钮
            var index = target.dataset.index;
            var isDel = confirm('确认删除学号为' + tableData[index].sNo + '的学生信息吗？')
            if (isDel) {
                transferData('/api/student/delBySno', {
                    sNo: tableData[index].sNo
                }, function() {
                    alert('删除成功');
                    page = 1;
                    getTableData();
                })
            }
        }
    }

    // 编辑按钮的 提交按钮
    var studentEditBtn = document.getElementById('edit-submit');
    var editStudentForm = document.getElementById('edit-student-form');
    studentEditBtn.onclick = function(e) {
        e.preventDefault();
        var data = getFormData(editStudentForm);
        if (data) {
            transferData('/api/student/updateStudent', data, function(result) {
                alert('修改成功');
                modal.style.display = 'none';
                getTableData();
            });
        }
    }

    //点击modal让编辑框消失
    var modalContent = modal.querySelector('.modal-contnet');
    modal.onclick = function() {
        modal.style.display = 'none';
    }
    modalContent.onclick = function(e) {
        e.stopPropagation();
    }

    // 翻页按钮 
    var prevBtn = document.getElementById('prev-btn');
    var nextBtn = document.getElementById('next-btn');
    prevBtn.onclick = function() {
        page--;
        getTableData();
    }
    nextBtn.onclick = function() {
        page++;
        getTableData();
    }
}
bindEvent();

//获取节点的兄弟节点
function getSiblings(node) {
    var parentNode = node.parentNode;
    var children = parentNode.children;
    var result = [];
    for (var i = 0; i < children.length; i++) {
        if (children[i] != node) {
            result.push(children[i]);
        }
    }
    return result;
}

//获取表单数据
function getFormData(form) {
    var name = form.name.value;
    var sex = form.sex.value;
    var email = form.email.value;
    var number = form.sNo.value;
    var birthYear = form.birth.value;
    var phone = form.phone.value;
    var address = form.address.value;
    if (!name || !sex || !email || !number || !birthYear || !phone || !address) {
        alert('请将信息填写完整！')
        return false;
    }
    //校验学号 4-16位数字
    if (!(/^\d{4,16}$/.test(number))) {
        alert('学号格式位4到16位数字');
        return false;
    }
    //校验出生年份 4位数字 1920-2020
    if (!(birthYear > 1920 && birthYear <= new Date().getFullYear())) {
        alert('出生年份格式不正确或年龄过大，只接受小鲜肉');
        return false;
    }
    //手机号校验 1开头的11位有效数字
    if (!(/^1\d{10}$/.test(phone))) {
        alert('手机号不正确');
        return false;
    }
    return {
        name: name,
        sex: sex,
        email: email,
        sNo: number,
        birth: birthYear,
        phone: phone,
        address: address
    }
}

//获取学生列表数据
function getTableData() {
    // ajax('GET', 'http://open.duyiedu.com/api/student/findAll', 'appkey=Xiaoming_1590306979323', function (result){
    //     console.log(result);
    //     if (result.status == 'success') {
    //         renderTable(result.data);
    //     }
    // }, true)
    transferData('/api/student/findByPage', {
        page: page,
        size: size
    }, function(data) {
        allpage = Math.ceil(data.cont / size)
        tableData = data.findByPage;
        renderTable(tableData);
    })
}
getTableData();

//渲染表格数据
function renderTable(data) {
    console.log(data);
    str = '';
    for (var i = 0; i < data.length; i++) {
        str += `<tr>
        <td>${data[i].sNo}</td>
        <td>${data[i].name}</td>
        <td>${data[i].sex == 0 ? '男':'女'}</td>
        <td>${data[i].email}/td>
        <td>${new Date().getFullYear() - data[i].birth}</td>
        <td>${data[i].phone}</td>
        <td>${data[i].address}</td>
        <td>
            <button class="btn edit" data-index="${i}">编辑</button>
            <button class="btn remove" data-index="${i}">删除</button>
        </td>
    </tr>`;
    }
    var tbody = document.getElementById('tbody');
    tbody.innerHTML = str;

    //判断页码框
    var prevBtn = document.getElementById('prev-btn');
    var nextBtn = document.getElementById('next-btn');
    if (page > 1) {
        prevBtn.style.display = 'inline-block';
    } else {
        prevBtn.style.display = 'none';
    }
    if (page < allpage) {
        nextBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'none';
    }
}

/**
 * 用于网络请求的函数
 * @param {String} url 请求路径
 * @param {Object} data 请求参数
 * @param {Function} cb 回调函数
 */
function transferData(url, data, cb) {
    var str = 'appkey=Xiaoming_1590306979323';
    for (var prop in data) {
        str += '&' + prop + '=' + data[prop];
    }
    ajax('GET', 'http://open.duyiedu.com' + url, str, function(result) {
        if (result.status == 'success') {
            cb(result.data);
        } else {
            alert(result.msg);
        }
    }, true)
}

// 编辑表单数据的回填
function renderEiditForm(data) {
    var editForm = document.getElementById('edit-student-form')
        // editForm.name.value = data.name
    for (var prop in data) {
        if (editForm[prop]) {
            editForm[prop].value = data[prop];
        }
    }
}