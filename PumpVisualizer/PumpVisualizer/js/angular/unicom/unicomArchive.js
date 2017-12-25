var unicom = angular.module("unicom", []);

unicom.controller('UnicomController', function UnicomController($scope, $interval, requests) {
    $scope.EWdata = {
        startDate: new Date(),
        endDate: new Date(),
        data: []
    };


    // посчитаный расход воды по табличным данным
    $scope.WaterRate = function () {
        var filtered = $scope.EWdata.data.filter(function (e, i) {
            return e.TotalWaterRate > 0;
        });
        if (filtered.length > 0) {
            return filtered[filtered.length - 1].TotalWaterRate-filtered[0].TotalWaterRate;
        } else {
            return 0;
        }
    };

    $scope.EnergyRate = function () {
        if ($scope.EWdata.data.length > 0) {
            return $scope.EWdata.data[$scope.EWdata.data.length - 1].TotalEnergy-$scope.EWdata.data[0].TotalEnergy;
        } else {
            return 0;
        }
    };

    // время в минутах
    $scope.intervalData = function () {
        if ($scope.EWdata.data.length > 0) {
            return ($scope.EWdata.data[$scope.EWdata.data.length - 1].RecvDate-$scope.EWdata.data[0].RecvDate) / 1000 / 60;
        } else {
            return 0;
        }
    };

    
    $scope.init = function (identity) {
        $scope.loadData(identity);
        
    };

    // запрос данных
    $scope.loadData = function (identity,dateStart) {
        showLoading(true);
        requests.getLastData(identity, dateStart)
            .success(function (data) {
                $scope.EWdata.startDate = new Date(parseInt(data.StartDate.substr(6)));
                $scope.EWdata.endDate = new Date(parseInt(data.EndDate.substr(6)));

                $scope.EWdata.data = [];
                data.DataTable.map(function (e, i) {
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
                        Alarm: e.Alarm
                    });
                });
                
            }).error(function (error) { console.log(error); })
            .finally(function () {
                showLoading(false);
            });
    };


    $scope.getClassRowError = function (elem) {
        if (elem != null && elem.length > 0) {
            return 'bg-danger';
        }
        return '';
    };

});


unicom.service("requests", function ($http) {
    this.getLastData = function (identity,date_start) {
        return $http({
            url: '../GetByPeriod',
            method: 'GET',
            dataType: 'json',
            cache: false,
            params: { 'identity': identity, 'parameterGraph': 'Amperage1', 'start_': date_start.toISOString() }
        });
    };
});
