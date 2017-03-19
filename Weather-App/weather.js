window.xpos = 0;
window.loadCount = 0;

function run() {
	$("#loading").css("display", "block");
	xpos = (xpos + 64) % 1600;
	$("#loadericon").css("background-position", xpos + "px 0px");
}

window.loadingAnimation = setInterval(run, 100);

function loaded() {
	clearInterval(window.loadingAnimation);
	$("#loading").css("display", "none");
}

function onload() {
	loaded();
	$("html").on("keypress", function(e) {
			if (e.which === 13 && $("#startBox").css("display") !== "none") {
				submitData();
			}
		}
	);
	$(".pane").css("display", "none");
	$(".todayButton").css("display", "block");
	$("#Today").click(function(){
			$(".pane").css("display", "none");
			$(".todayButton").css("display", "block");
		}
	);
	$("#Hourly").click(function(){
			$(".pane").css("display", "none");
			$(".hour").css("display", "block");
		}
	);
	$("#Week").click(function(){
			$(".pane").css("display", "none");
			$(".week").css("display", "block");
		}
	);
	$("#startBox .text").focus();
	startLocate();
}

function submitData(location) {
	if (location === undefined) {
		var location = document.forms["weatherlocation"]["location"].value;
	}
	var conditionsUrl = "http://api.wunderground.com/api/f2ee2059d8b951a7/conditions/q/"+location+".json";
	var alertsUrl="http://api.wunderground.com/api/f2ee2059d8b951a7/alerts/q/"+location+".json"
	var forecastUrl="http://api.wunderground.com/api/f2ee2059d8b951a7/forecast/q/"+location+".json"
	var forecast7Url = "http://api.wunderground.com/api/f2ee2059d8b951a7/forecast10day/q/"+location+".json"
	var hourUrl = "http://api.wunderground.com/api/f2ee2059d8b951a7/hourly/q/"+location+".json"
	window.loadingAnimation = setInterval(run, 100);
	$("table, .hour, .week").html("");
	$.ajax({
		url : conditionsUrl,
		dataType : "jsonp",
		success : function (data){arrangeData(data, window.arrangeData_conditions);}
	});
	$.ajax({
		url : alertsUrl,
		dataType : "jsonp",
		success : function (data){arrangeData(data, window.arrangeData_alerts)}
	});
	$.ajax({
		url : forecastUrl,
		dataType : "jsonp",
		success : function (data){arrangeData(data, window.arrangeData_forecast)}
	});
	$.ajax({
		url : forecast7Url,
		dataType : "jsonp",
		success : function (data){arrangeData(data, window.arrangeData_7DayForecast)}
	});
	$.ajax({
		url : hourUrl,
		dataType : "jsonp",
		success : function (data){arrangeData(data, window.arrangeData_HourForecast)}
	});
}

function arrangeData(data, JSONFunc) {
		if (data["response"]["error"] === undefined && data["response"]["results"] === undefined) {
			JSONFunc(data);
			window.loadCount++;
			if (window.loadCount === 5) {
				$("#startBox, #cover, #error1, #error2").css("display", "none");
				loaded();
				window.loadCount = 0;
			}
		} else {
			loaded();
			if (!(data["response"]["error"] === undefined)) {
				$("#error1").css("display", "block");
			} else if (!(data["response"]["results"] === undefined)) {
				$("#error2").css("display", "block");
			}
		}
	}

function arrangeData_conditions(data) {
	var loc = data["current_observation"]["display_location"]["full"];
	$("#location").html("Weather for "+loc);
	var feelslike = data["current_observation"]["feelslike_string"]; //
	var humidity = data["current_observation"]["relative_humidity"]; //
	var wind = data["current_observation"]["wind_mph"]+"mph "+data["current_observation"]["wind_dir"]; //
	var visibility = data["current_observation"]["visibility_mi"]+"mi"; //
	var icon = data["current_observation"]["icon_url"]
	var condition = data["current_observation"]["weather"];
	var temperature = data["current_observation"]["temperature_string"]
	$("#quickstats .icon, #Current .icon").html("<img src=\""+icon+"\">");
	$("#quickstats p").html("<span class=\"important\">"+temperature+"</span><br><br>"+condition);
	$("#Current .icon").append("<p>"+condition+"</p>");
	$("#Current table").append("<tr id=\"temp\"></tr>");
	var temper = $("#Current table #temp");
	temper.append("<td>Temperature: </td>");
	temper.append("<td>"+temperature+"</td>")
	$("#Current table").append("<tr id=\"feelslike\"></tr>");
	var feels = $("#Current table #feelslike");
	feels.append("<td>Feels Like: </td>");
	feels.append("<td>"+feelslike+"</td>");
	$("#Current table").append("<tr id=\"hum\"></tr>");
	var hum = $("#Current table #hum");
	hum.append("<td>Humidity: </td>");
	hum.append("<td>"+humidity+"</td>");
	$("#Current table").append("<tr id=\"windy\"></tr>");
	var windRow = $("#Current table #windy");
	windRow.append("<td>Wind: </td>");
	windRow.append("<td>"+wind+"</td>");
	$("#Current table").append("<tr id=\"visibility\"></tr>");
	var visible = $("#Current table #visibility");
	visible.append("<td>Visibility: </td>");
	visible.append("<td>"+visibility+"</td>");
}

function arrangeData_alerts(data) {
	$(".warning, .warningClicked").remove();
	var icon = "Alert-Icon-.png";
	for (var i=0; i < data["alerts"].length; i++) {
		var description = data["alerts"][i]["description"];
		var date = data["alerts"][i]["date"];
		var expires = data["alerts"][i]["expires"];
		var alertText = data["alerts"][i]["message"];
		$("#head").append("<div class=\"warning\" id=\"warnings"+i+"\"><div class=\"icon\"></div><p></p><div class=\"content\"></div></div>");
		$("#warnings"+i+" .icon").css("float", "left").css("height", "30px").css("width", "30px").html("<img src=\""+icon+"\">");
		$("#warnings"+i+" .icon img").css("width", "100%").css("height", "100%");
		$("#warnings"+i+" p").html("<span class=\"important\">"+description+"</span>")
							 .css("color", "rgb(255,0,0)")
							 .css("height", "30px")
							 .css("overflow", "hidden");
		$(".content").html("Date: "+date+"<br>Expires: "+expires+"<br>"+alertText)
		$(".warning").click(clickWarn);
	}	
}

function arrangeData_forecast(data) {
	var high = data["forecast"]["simpleforecast"]["forecastday"][0]["high"]["fahrenheit"]; //
	var wind = data["forecast"]["simpleforecast"]["forecastday"][0]["avewind"]["mph"]+"mph "+data["forecast"]["simpleforecast"]["forecastday"][0]["avewind"]["dir"]; //
	var humidity = data["forecast"]["simpleforecast"]["forecastday"][0]["avehumidity"]; //
	var precip = data["forecast"]["txt_forecast"]["forecastday"][0]["pop"]; //
	///
	var low = data["forecast"]["simpleforecast"]["forecastday"][0]["low"]["fahrenheit"]; //
	var precipNight = data["forecast"]["txt_forecast"]["forecastday"][1]["pop"]; //
	////
	var iconToday = data["forecast"]["txt_forecast"]["forecastday"][0]["icon_url"];
	var iconTonight = data["forecast"]["txt_forecast"]["forecastday"][1]["icon_url"];
	var conditionToday = data["forecast"]["txt_forecast"]["forecastday"][0]["fcttext"];
	var conditionTonight = data["forecast"]["txt_forecast"]["forecastday"][1]["fcttext"];
	$("#TodayWeather .icon").html("<img src=\""+iconToday+"\"><p>" + conditionToday+"</p>");
	$("#Tonight .icon").html("<img src=\""+iconTonight+"\"><p>" + conditionTonight+"</p>");
	$("#TodayWeather table").append("<tr id=\"high\"></tr>");
	var highTempRow = $("#TodayWeather table #high");
	highTempRow.append("<td>High: </td>");
	highTempRow.append("<td>"+high+"F</td>");
	$("#TodayWeather table").append("<tr id=\"wind\"></tr>");
	var windRow = $("#TodayWeather table #wind");
	windRow.append("<td>Wind: </td>");
	windRow.append("<td>"+wind+"</td>");
	$("#TodayWeather table").append("<tr id=\"humidity\"></tr>");
	var humRow = $("#TodayWeather table #humidity");
	humRow.append("<td>Humidity: </td>");
	humRow.append("<td>"+humidity+"%</td>")
	$("#TodayWeather table").append("<tr id=\"pop\"></tr>");
	var popRow = $("#TodayWeather table #pop");
	popRow.append("<td>Precipitation: </td>");
	popRow.append("<td>"+precip+"%</td>")
	$("#Tonight table").append("<tr id=\"low\"></tr>");
	var lowTemp = $("#Tonight table #low");
	lowTemp.append("<td>Low: </td>");
	lowTemp.append("<td>"+low+"F</td>");
	$("#Tonight table").append("<tr id=\"nightpop\"></tr>");
	var nprec = $("#Tonight table #nightpop");
	nprec.append("<td>Precipitation: </td>");
	nprec.append("<td>"+precipNight+"%</td>");
}

function clickWarn() {
	$(this).removeClass("warning").addClass("warningClicked").unbind("click");
	$(".warningClicked").click(clickWarnC);
}

function clickWarnC() {
	$(this).removeClass("warningClicked").addClass("warning").unbind("click");
	$(".warning").click(clickWarn);
}

function changeLoc() {
	$("#startBox, #cover").css("display", "block");
}

function arrangeData_7DayForecast(data){
	for (var i=1; i<=7; i++) {
		forecastData = data["forecast"]["simpleforecast"]["forecastday"][i]
		var title = forecastData["date"]["weekday_short"]
		var icon = forecastData["icon_url"];
		var conditions = forecastData["conditions"];
		var high = forecastData["high"]["fahrenheit"]+"F";
		var low = forecastData["low"]["fahrenheit"]+"F";
		var popr = forecastData["pop"]+"%";
		var wind = forecastData["avewind"]["mph"]+"mph "+forecastData["avewind"]["dir"];
		var humidity = forecastData["avehumidity"]+"%";
		$(".pane.week").append("<div class=\"weekFore\" id=\"WF"+i+"\"></div>");
		$("#WF"+i).css("width", (100/7)+"%")
				  .css("position", "absolute")
				  .css("left", ((i-1)*100/7)+1+"%")
				  .css("margin-top", "20px")
				  .html("<h3>"+title+"</h3><div class=\"icon\"><img src=\""+icon+"\"><p>" + conditions+"</p></div>")
		$("#WF"+i+" img").css("float", "left").css("width", "25px").css("height", "25px");
		$("#WF"+i).append("<h4>High: </h4><h5>"+high+"</h5><h4>Low: </h4><h5>"+low+"</h5><h4>Wind: </h4><h5>"+wind+"</h5><h4>Hum.:</h4><h5>"+humidity+"</h5><h4>Precip.: </h4><h5>"+popr+"</h5>");
	}
}

function arrangeData_HourForecast(data) {
	for (var i=0; i<10; i++) {
		var dat = data["hourly_forecast"][i];
		var time = dat["FCTTIME"]["pretty"];
		var icon = dat["icon_url"];
		var temp = dat["temp"]["english"]+"F";
		var precip = dat["pop"];
		$(".pane.hour").append("<div id=\"h"+i+"\"></div>")
		$("#h"+i).css("width", "100%").css("top", 20+50*i+"px");
		$("#h"+i).append("<h3>"+time+"</h3><img src=\""+icon+"\">");
		$("#h"+i+" h3").css("float", "left").css("margin-left", "20px").css("margin-top", "10px");
		$("#h"+i+" img").css("height", "30px")
					    .css("width", "30px");
		$("#h"+i).append("<h4>Temp: </h4><h5>"+temp+"</h5><h4>Precip: </h4><h5>"+precip+"</h5>");
		$("#h"+i+" h4").css("float", "none").css("clear", "none").css("width", "50px").css("display", "inline");
		$("#h"+i+" h5").css("float", "none").css("clear", "none").css("width", "50px").css("display", "inline");
		if (i%2 === 0) {
			$("#h"+i).css("background-color", "#06F");
		}
	}
}

function startLocate(){

	if (navigator.geolocation) {
	  var timeoutVal = 10 * 1000 * 1000;
	  navigator.geolocation.getCurrentPosition(
		ifSuccess, 
		ifFailure,
		{ enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 }
	  );
	} else {
	  alert("Geolocation is not supported by this browser, please use a browser such as Firefox or Chrome that does for a fuller experience!");
	  changeLoc();
	}
}

function getSpecificLocation(lat, lon)
{
  var uarel = "http://api.wunderground.com/api/23ddb985fffcc49c/geolookup/q/" + lat + "," + lon + ".json";
  $.ajax({
    url : uarel,
    dataType : "Jsonp",
    success : function(data) {
      var loc = new LocationData(data);
      if (loc.country !== "USA") {
        fromVal = loc.country; //This way it searches for city,country where appropriate
      }
      else {
        fromVal = loc.state;
      }
      var locString = loc.city + ", " + fromVal;
      submitData(locString);}

  })
}

function LocationData(baseData) {
  if (baseData !== null)
  {
  this.baseData = baseData;
  this.city = baseData["location"]["city"];
  this.country = baseData["location"]["country_name"];
  this.state = baseData["location"]["state"];
  }
}

LocationData.prototype.city = "Pittsburgh";
LocationData.prototype.country = "USA";
LocationData.prototype.state = "Pennsylvania";
function ifSuccess(position) {
  var city = getSpecificLocation(position.coords.latitude, position.coords.longitude);
  return city;
}

function ifFailure(error) {
  var errors = { 
    1: 'Permission denied',
    2: 'Position unavailable',
    3: 'Request timeout'
  };
  //alert("Error: " + errors[error.code]); 
  $("#startBox").css("display", "block");
}