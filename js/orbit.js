var orbit = {
	$orbitform: null,
	$map: null,
	unitsfile: "data/orbit-war.csv",
	
	init: function() {
		orbit.$map = $("#map");
		orbit.$orbitform = $("#orbitform");
		
		orbit.loadUnits();
		
		orbit.redraw();
	},
	
	loadUnits: function() {
		orbit.log("load units request");
		Papa.parse(orbit.unitsfile, {
			delimiter: ",",
			download: true,
			header: true,
			complete: orbit.loadUnitsResponse
		})
	},
	
	loadUnitsResponse: function(d) {
		orbit.log("load units response");
		orbit.log(d);
		orbit.log(d.data);
	},
	
	log: function(s) {
		if (window.console) {
			console.log(s);
		}
	},

	redraw: function() {
		var $heading = orbit.$map.find(".panel-heading");
		var $body = orbit.$map.find(".panel-body");
		var $footer = orbit.$map.find(".panel-footer");
		
		var hh = $heading.height() + parseInt($heading.css("padding-top"), 10) + parseInt($heading.css("padding-bottom"), 10);
		var fh = $footer.height() + parseInt($footer.css("padding-top"), 10) + parseInt($footer.css("padding-bottom"), 10);
		//hex.hexLog("hh[" + hh + "]");
		//hex.hexLog("fh[" + fh + "]");
		$body.css("top", hh + "px");
		$body.css("bottom", fh + "px");
	}
};

$(function() {
	orbit.init();
});
