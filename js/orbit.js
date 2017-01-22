var orbit = {
	$orbitform: null,
	$orbittable: null,
	$map: null,
	dataPath: "data",
	unitHdrModule: "unit-hdr",
	unitsFile: "data/orbit-war.csv",
	unitsHdr: null,
	unitsData: null,
	hdr: null,
	
	init: function() {
		orbit.$map = $("#map");
		orbit.$orbitform = $("#orbitform");
		orbit.$orbittable = $("#orbittable");
	
		queue.push("orbit.loadUnitsRequest();");
		queue.push("orbit.loadUnitHdrRequest();");
		queue.push("orbit.renderForm();");
		queue.push("orbit.redraw();");
		
		queue.next();
	},
	
	loadUnitsRequest: function() {
		orbit.log("load units request");

		Papa.parse(orbit.unitsFile, {
			delimiter: ",",
			download: true,
			header: true,
			complete: orbit.loadUnitsResponse
		});
	},
	
	loadUnitsResponse: function(d) {
		orbit.log("load units response");

		orbit.log(d);
		orbit.log(d.data);
		orbit.unitsHdr = d.meta.fields;
		orbit.unitsData = d.data;
		
		queue.next();
	},
	
	loadUnitHdrRequest: function() {
		orbit.log("load unit hdr request");

		messageResource.init({
			filePath : orbit.dataPath
		});
		messageResource.load(orbit.unitHdrModule, orbit.loadUnitHdrResponse);
	},
	
	loadUnitHdrResponse: function() {
		orbit.log("load unit hdr response");

		orbit.log(["unitsHdr", orbit.unitsHdr]);
		for (var i=0; i<orbit.unitsHdr.length; i++) {
			var key = orbit.unitsHdr[i];
			var value = messageResource.get(key, orbit.unitHdrModule);
			orbit.log([key, value]);
		}
		queue.next();
	},
	
	log: function(s) {
		if (window.console) {
			console.log(s);
		}
	},

	renderForm: function() {
		orbit.log("render form");
		
		var h = [];

		// head
		var th = "";
		th += "<thead>";
		th += "<tr>";
		th += "<th>Counter</th>";
		for (var i=0; i<orbit.unitsHdr.length; i++) {
			var key = orbit.unitsHdr[i];
			var value = messageResource.get(key, orbit.unitHdrModule);
			th += "<th>" + value + "</th>";
		}
		th += "</tr>";
		th += "</thead>";
		h.push(th);

		// body
		var th = "";
		th += "<tbody>";
		for (var i=0; i<orbit.unitsData.length; i++) {
			var d = orbit.unitsData[i];
			console.log(d);
			if (d) {
				var u = "img/units/" + d["hdr.unit.type"] + ".fw.png";
				var t = d["hdr.unit.type"];
				
				if (t) {
					th += "<tr>";
					th += "<td><img src=\"" + u + "\" alt=\"" + t + "\" class=\"unit-type\" /></td>";
					
					for (var j in d) {
						var dj = d[j];
						if (j == "hdr.unit.type") {
							dj = dj.toUpperCase();
						}
						th += "<td>" + dj + "</td>";
					}
					th += "</tr>";
				}
			}
		}
		th += "</tbody>";
		h.push(th);

		orbit.$orbittable.append(h.join());
		
		queue.next();
	},
	
	redraw: function() {
		orbit.log("redraw");

		var $heading = orbit.$map.find(".panel-heading");
		var $body = orbit.$map.find(".panel-body");
		var $footer = orbit.$map.find(".panel-footer");
		
		var hh = $heading.height() + parseInt($heading.css("padding-top"), 10) + parseInt($heading.css("padding-bottom"), 10);
		var fh = $footer.height() + parseInt($footer.css("padding-top"), 10) + parseInt($footer.css("padding-bottom"), 10);
		//hex.hexLog("hh[" + hh + "]");
		//hex.hexLog("fh[" + fh + "]");
		$body.css("top", hh + "px");
		$body.css("bottom", fh + "px");
	},
};

$(function() {
	orbit.init();
});
