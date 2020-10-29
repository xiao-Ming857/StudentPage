(function() {
    var pie = {
        init() {
            this.getData();
            this.option = {
                title: {
                    text: '',
                    subtext: '纯属虚构',
                    left: 'center',
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    data: [],
                },
                series: {
                    name: '',
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '60%'],
                    data: [],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0,0,0,.5)',
                        }
                    }
                }
            }
        },
        getData() {
            var self = this;
            $.ajax({
                url: 'http://open.duyiedu.com/api/student/findAll?appkey=Xiaoming_1590306979323', //Q_A_Q_1590927055348, Xiaoming_1590306979323
                success: function(data) {
                    // console.log(data);
                    // {"address":"武汉","appkey":"Xiaoming_1590306979323","birth":2002,"ctime":1593481311,"email":"www@qq.com","id":58104,"name":"张三","phone":"13232323232","sNo":"0002","sex":0,"utime":1595650650}
                    var list = JSON.parse(data).data;
                    if (list.length > 0) {
                        self.areaChart(list);
                        self.sexChart(list);
                    } else {
                        alert('没有数据哦~');
                    }
                }
            });
        },
        areaChart(data) {
            var myChart = echarts.init($('.areaChart')[0]);
            var legendData = [];
            var seriesData = [];

            // legendData = ['北京', '上海', '广州', '武汉']
            // seriesData = [{name: '北京', value: 1}]

            // {北京: 1, 上海: 2}
            var newData = {};
            data.forEach(item => {
                if (!newData[item.address]) {
                    newData[item.address] = 1;
                    legendData.push(item.address);
                } else {
                    newData[item.address]++;
                }
            });
            // console.log(legendData);
            for (const prop in newData) {
                seriesData.push({
                    name: prop,
                    value: newData[prop],
                });
            }
            // console.log(seriesData);
            this.option.title.text = '学生地区分布统计';
            this.option.legend.data = legendData;
            this.option.series.name = '地区分布';
            this.option.series.data = seriesData;
            myChart.setOption(this.option);
        },
        sexChart(data) {
            var myChart = echarts.init($('.sexChart')[0]);
            var legendData = ['男', '女'];
            var seriesData = [];
            var newData = {};
            data.forEach(item => {
                if (!newData[item.sex]) {
                    newData[item.sex] = 1;
                } else {
                    newData[item.sex]++;
                }
            });
            var seriesData = [
                { name: '男', value: newData[0] },
                { name: '女', value: newData[1] },
            ]
            this.option.title.text = '学生性别统计';
            this.option.legend.data = legendData;
            this.option.series.name = '性别分布';
            this.option.series.data = seriesData;
            myChart.setOption(this.option);
        }
    }
    pie.init();
})();