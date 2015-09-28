// Ionic Starter App
var db = null;
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var climaApp = angular.module('climaApp', ['ionic','ngCordova'])

.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
      console.log("Entrou no .run");
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
        db = $cordovaSQLite.openDB({name:"my.db"});
    $cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS infos (id INTEGER PRIMARY KEY, cidade text, temperatura INTEGER, tempmin INTEGER, tempmax INTEGER, pressao INTEGER, humidade INTEGER, lat INTEGER, lon INTEGER)");        

  });
})

climaApp.service("climaService",["$http","$rootScope","$cordovaSQLite",climaService]);

climaApp.controller("climaCtrl",["$scope", "$cordovaSQLite","climaService",climaCtrl])





function climaCtrl($scope, $cordovaSQLite , climaService){
    
    
   
    $scope.$on("climaApp.clima",function(_,result){
        
    $scope.temperatura = Math.round(result.main.temp-273.15);
    $scope.latitude = result.coord.lat;    
    $scope.longitude = result.coord.lon;            
        

  $scope.pressure = result.main.pressure;
  $scope.humidity = result.main.humidity;
  $scope.temp_min = Math.round(result.main.temp_min-273.15);
  $scope.temp_max = Math.round(result.main.temp_max-273.15);
  $scope.sys_name = result.name;
        
  $scope.temp_icon = "http://openweathermap.org/img/w/" + result.weather[0].icon + ".png";
  $scope.temp_description = result.weather[0].description;

  $scope.$broadcast('loading:hide');
  $scope.$broadcast("scroll.infiniteScrollComplete");
  $scope.$broadcast("scroll.refreshComplete");        
    
    
  }
              
              );
               
    
  climaService.loadClima("Guararapes","sp");              

};



function climaService($http,$rootScope, $cordovaSQLite){
    
    this.loadClima = function (cidade,uf){
        console.log("Service - Cidade - : " + cidade + " - Uf: " + uf);
        if (cidade && uf) {
            
   url = "http://api.openweathermap.org/data/2.5/weather?q=" + cidade + "," + uf;
   console.log("url = " + url );
   $http.get(url, {
    params : ""
   }).success(function(result) {
    $rootScope.$broadcast("climaApp.clima", result);
    $rootScope.$broadcast('mensagem:statusSucesso');
    $rootScope.$broadcast('loading:hide');
    
       var query = "insert into infos (cidade, temperatura, tempmin, tempmax, pressao, humidade, lat, lon) values (?,?,?,?,?,?,?,?)";
       
       $cordovaSQLite.execute(db, query, [result.name,
                                          result.main.temp,
                                          result.main.temp_min,
                                         result.main.temp_max,
                                         result.main.pressure,
                                         result.main.humidity,
                                         result.coord.lat,
                                         result.coord.lon]).then(
            function(result){ 
                $scope.resultado = "INSERI COM SUCESSO";
                console.log("INSERI");
            }, function(error){ 
                $scope.resultado = "FAIO!";
                console.log(error);
            }
        ); // fim do then
   }).error(function(result) {       
       var query = "select cidade, temperatura, tempmin, tempmax, pressao, humidade, lat, lon from infos";
        $cordovaSQLite.execute(db, query, []).then(function(result){
            console.log("Executei select");
            if(result.rows.length > 0){
                console.log("Achei dados");
                
                $scope.temperatura = Math.round(result.rows.item(result.rows.length).temperatura-273.15);
                $scope.latitude = result.rows.item(result.rows.length).lat;    
                $scope.longitude = result.rows.item(result.rows.length).lon;
                $scope.pressure = result.rows.item(result.rows.length).pressao;
                $scope.humidity = result.rows.item(result.rows.length).humidade;
                $scope.temp_min = Math.round(result.rows.item(result.rows.length).tempmin-273.15);
                $scope.temp_max = Math.round(result.rows.item(result.rows.length).tempmax-273.15);
                $scope.sys_name = result.rows.item(result.rows.length).cidade;    
                
                  //  $scope.pessoas.push({nome: result.rows.item(i).nome, sobrenome: result.rows.item(i).sobrenome});
                    //$scope.pessoas.push({nome: 'Ciclano', sobrenome: 'fulano'});
                
            } else {
                $scope.resultado = "Tabela vazia."; 
                console.log("Tabela Vazia");
            }
            
        }, function(error){
            console.log(error);
        });       
    console.log('Erro obter Temperatura');
    $rootScope.$broadcast('mensagem:statusErro');
    $rootScope.$broadcast('loading:hide');
   });
  } else {
   $rootScope.$broadcast("climaApp.temperaturaErro", "NA");
  }
 }

};
