
    var margin = { top: 30, right: 0, bottom: 30, left: 70 },
       width = 980,
       height = 300;

    var parseDate = d3.time.format("%X").parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.minute, 5)
        .tickFormat(d3.time.format("%X"));
        

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .innerTickSize(-width)
        .outerTickSize(0)
        .tickPadding(10);

    var line = d3.svg.line()
        .x(function (d) { return x(d.RecvDate); })
        .y(function (d) { return y(d.Value); })
        .interpolate("linear");



    var svg = d3.select("#AmperageGraph")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var ln = svg.append("path").attr("class", "line");
    


    var x_axis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");
        

    var y_axis = svg.append("g")
            .attr("class", "y axis");


    x_axis.call(xAxis);
    y_axis.call(yAxis);



var unicom = angular.module("unicom", []);

unicom.controller('UnicomController', function UnicomController($scope,$interval,requests) {
    $scope.EWdata = {
        startDate: new Date(),
        endDate: new Date(),
        data: [],
        dataGraph: []
    };

    $scope.graphParam = 'Amperage1';

    $scope.updatedTime = null;

    // рассчиываю расход воды часовой на основе данных за посл 20 мин
    $scope.WaterByHour = function () {
        // интервал
        var to_ = moment($scope.updatedTime);
        var from_ = moment($scope.updatedTime).subtract(20, 'minutes');

       // выбираю записи из интервала
        var dataCalculate = $scope.EWdata.data.filter(function (e,i) {
            return e.RecvDate >= from_ && e.RecvDate <= to_ && e.TotalWaterRate>0;
        });

        var substractValue = 0;
        var secondsInterval = 0;
        // если данных > чем 2 записи, то рассчитываю на основе первого и последнего значения из интервала
        if (dataCalculate.length > 0) {
            // разность показаний
            substractValue = dataCalculate[0].TotalWaterRate - dataCalculate[dataCalculate.length - 1].TotalWaterRate;
            // разность в секундах
            secondsInterval = moment(dataCalculate[0].RecvDate).diff(moment(dataCalculate[dataCalculate.length - 1].RecvDate), "seconds");

            if (secondsInterval != 0) {
                return substractValue * 60 * 60 / secondsInterval;
            } else
                return 0;
            // нет данных за последние 20 мин
        } else {
            return 0;
        }
        
    };

 
    // посчитаный расход воды по табличным данным
    $scope.WaterRate = function () {
        var filtered = $scope.EWdata.data.filter(function (e, i) {
            return e.TotalWaterRate > 0;
        });
        if (filtered.length > 0) {
            return filtered[0].TotalWaterRate - filtered[filtered.length - 1].TotalWaterRate;
        } else {
            return 0;
        }
    };
    
    $scope.EnergyRate = function () {
        if ($scope.EWdata.data.length > 0) {
            return $scope.EWdata.data[0].TotalEnergy - $scope.EWdata.data[$scope.EWdata.data.length - 1].TotalEnergy;
        } else {
            return 0;
        }
    };

    // время в минутах
    $scope.intervalData = function() {
        if ($scope.EWdata.data.length > 0) {
            return ($scope.EWdata.data[0].RecvDate - $scope.EWdata.data[$scope.EWdata.data.length - 1].RecvDate)/1000/60;
        } else {
            return 0;
        }
    };
    
    // последние показания
    $scope.lastData = function() {
        if ($scope.EWdata.data.length > 0) {
        return $scope.EWdata.data[0];
        } else {
            return {
                
                    Id:null,
                    RecvDate: null,
                    TotalEnergy: null,
                    Amperage1: null,
                    Amperage2: null,
                    Amperage3: null,
                    Voltage1: null,
                    Voltage2: null,
                    Voltage3: null,
                    CurrentElectricPower: null,
                    TotalWaterRate: null,
                    WaterEnergy: null,
                    Errors: null,
                    Alarm:null
            };
    }
    };

    // время, прошедшее после получения последних данных (сек)
    $scope.loseDataTime = function() {
        return ($scope.updatedTime - $scope.lastData().RecvDate) / 1000;
    };
   
    $scope.init = function (identity) {
        $scope.loadData(identity);
        
       
        $interval(function () { $scope.loadData(identity); }, 10000);
              
    };

    $scope.isShowAlert=function() {
        return $scope.lastData().RecvDate != null && $scope.lastData().Alarm != null && $scope.lastData().Alarm>0;
    }
    // запрос данных
    $scope.loadData = function (identity) {
        showLoading(true);
        requests.getLastData(identity, $scope.graphParam)
            .success(function (data) {
                $scope.EWdata.startDate = new Date(parseInt(data.StartDate.substr(6)));
                $scope.EWdata.endDate = new Date(parseInt(data.EndDate.substr(6)));
                
                $scope.EWdata.data = [];
                data.DataTable.map(function(e, i) {
                    $scope.EWdata.data.push({
                        Id: e.Id,
                        RecvDate: new Date(parseInt(e.RecvDate.substr(6))),
                        TotalEnergy: e.TotalEnergy,
                        Amperage1: e.Amperage1,
                        Amperage2: e.Amperage2,
                        Amperage3: e.Amperage3,
                        Voltage1: e.Voltage1,
                        Voltage2: e.Voltage2,
                        Voltage3: e.Voltage3,
                        CurrentElectricPower: e.CurrentElectricPower,
                        TotalWaterRate: e.TotalWaterRate,
                        WaterEnergy: e.WaterEnergy,
                        Errors: e.Errors,
                        Alarm:e.Alarm
                    });
                });
                    $scope.EWdata.dataGraph = [];
                    data.DataGraph.map(function(e, i) {
                        $scope.EWdata.dataGraph.push({
                            RecvDate: new Date(parseInt(e.RecvDate.substr(6))),
                            Value: e.Value
                        });
                        });
                   

                    x.domain([$scope.EWdata.startDate, $scope.EWdata.endDate]);
                    y.domain([d3.min($scope.EWdata.dataGraph,function(d){return d.Value;})*0.95,d3.max($scope.EWdata.dataGraph,function(d){return d.Value;})*1.05]);  // d3.extent($scope.EWdata.dataGraph, function (d) { return d.Value; }));
                    
                    x_axis.call(xAxis);
                    y_axis.call(yAxis);
                    
                                           
                    

                    ln.datum($scope.EWdata.dataGraph)
                       .attr("d", line);
                    
                    var dots = svg.selectAll("circle.dot").data($scope.EWdata.dataGraph);

                    

                    dots.enter()
                        .append("circle")
                        .attr("class", "dot")
                        .attr("cx", function(d) { return x(d.RecvDate); })
                        .attr("cy", function(d) { return y(d.Value); })
                        .attr("r", 0.8);
                    
                    dots.attr("cx", function (d) { return x(d.RecvDate); })
                        .attr("cy", function (d) { return y(d.Value); });
                        
                    dots.exit().remove();

                
                
            }).error(function (error) { console.log(error); })
            .finally(function () {
                $scope.updatedTime = new Date();
                showLoading(false);
            });
    };


    $scope.getClassRowError = function(elem) {
        if (elem != null && elem.length > 0) {
            return 'bg-danger';
        }
        return '';
    };

});


unicom.service("requests", function ($http) {
    this.getLastData = function(identity,type) {
        return $http({
            url: '../GetDataBySmallPeriod',
            method: 'GET',
            dataType: 'json',
            cache: false,
            params: { 'identity': identity, 'parameterGraph': type }
        });
    };
});



unicom.directive("alert", function () {
    return {
        restrict: 'E',
        transclude:true,
        template: '<div class="alert_ col-md-12 col-sm-12 col-xs-12 {{cls}}" ng-transclude></div>',
        scope: {
            cls: "@"
        },
        link: function (scope, element, attrs) {
            
        }
    }
});