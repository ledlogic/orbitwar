var orbit = {
	$orbitform: null,
	$orbittable: null,
	$map: null,
	dataPath: "data",
	mode: "data",
	unitHdrModule: "unit-hdr",
	unitsFile: "data/orbit-war.csv",
	unitsHdr: null,
	unitsData: null,
	hdr: null,
	
	init: function() {
	    $.material.init();

		orbit.$map = $("#map");
		orbit.$orbitform = $("#orbitform");
		orbit.$orbittable = $("#orbittable");
	
		queue.push("orbit.loadUnitsRequest();");
		queue.push("orbit.loadUnitHdrRequest();");
		queue.push("orbit.renderForm();");
		queue.push("orbit.redraw();");
		
		$("#search").on("textchange", orbit.search);
		$(".orbit-mode-menu li").on("click", orbit.modeMenuChanged);
		
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
		orbit.log("orbit.mode[" + orbit.mode + "]");
		
		var h = [];

		// head
		var th = "";
		th += "<thead>";
		th += "<tr>";
		th += "<th>Counter</th>";
		for (var i=0; i<orbit.unitsHdr.length; i++) {
			var key = orbit.unitsHdr[i];
			var value = messageResource.get(key, orbit.unitHdrModule);
			
			var colspan = 1;
			if (orbit.mode === "calc" && key.indexOf("-cost") > -1) {
				colspan = 2;
			}
			
			th += "<th colspan=\"" + colspan + "\">"
				+ value
				+ "</th>";
		}
		if (orbit.mode == "calc") {
			th += "<th>Total</th>";
		}				
		th += "</tr>";
		th += "</thead>";
		h.push(th);

		// body
		var th = "";
		th += "<tbody>";
		for (var i=0; i<orbit.unitsData.length; i++) {
			var d = orbit.unitsData[i];
			if (d) {
				var u = "img/units/" + d["hdr-unit-type"] + ".fw.png";
				var t = d["hdr-unit-type"];
				
				if (t) {
					th += "<tr class=\"orbit-row-" + j + "\">";
					th += "<td>"
						+ "<img src=\"" + u + "\" alt=\"" + t + "\" class=\"unit-type\" />"
					    + "</td>";
					for (var j in d) {
						var dj = d[j];
						if (j == "hdr-unit-type") {
							dj = dj.toUpperCase();
						}
						th += "<td>" + dj + "</td>";
						
						orbit.log("j[" + j + "]");
						if (orbit.mode == "calc" && j.indexOf("-cost") > -1) {
							if ($.isNumeric(dj)) {
								th += "<td><input type=\"number\" class=\"orbit-calc orbit-calc-" + i + "-" + j + "\" size=\"3\" min=\"0\" pattern=\"^[0-9]\" /></td>";								
							} else {
								th += "<td>&nbsp;</td>";
							}
						}
					}
					
					if (orbit.mode == "calc") {
						th += "<td><input type=\"text\" class=\"orbit-calc orbit-calc-row-" + i +"\" size=\"5\" /></td>";
					}					
					th += "</tr>";
				}
			}
		}
		th += "</tbody>";
		h.push(th);

		orbit.$orbittable.html(h.join());
		
		$('.unit-type').on('click', function() {
			var alt = $(this).attr('alt');
			alt = alt.toUpperCase();

			var src = $(this).attr('src');
			$(this).attr('src', src);
			$("#complete-dialog .imagepreview").attr("src", src);
			$("#complete-dialog .modal-title").html(alt);
			$('#complete-dialog').modal('show');
		});
		
		// TODO: debounce
		$(".orbit-calc").on('textchange', function() {
			var v0 = $(this).val();
			var v1 = v0.replace(/[^0-9]/g, '');
			if (v1 != v0) {
				$(this).val(v1);
			}
			orbit.recalc();
		});
		
		queue.next();
	},
	
	redraw: function() {
		orbit.log("redraw");

		var $heading = orbit.$map.find(".panel-heading");
		var $body = orbit.$map.find(".panel-body");
		var $footer = orbit.$map.find(".panel-footer");
		
		var hh = $heading.height() + parseInt($heading.css("padding-top"), 10) + parseInt($heading.css("padding-bottom"), 10);
		var fh = $footer.height() + parseInt($footer.css("padding-top"), 10) + parseInt($footer.css("padding-bottom"), 10);

		$body.css("top", hh + "px");
		$body.css("bottom", fh + "px");
	},
	
	search: function() {
		orbit.log("search");
		var $search = $("#search");
		var s = $search.val().toLowerCase();
		$("#orbittable tbody tr").each(function() {
			var that = $(this);
			var t = that.text().toLowerCase();
			if (t.indexOf(s) > -1) {
				that.removeClass("search-not-found");
			} else {
				that.addClass("search-not-found");
			}
		});
	},
	
	modeMenuChanged: function() {
		orbit.log("modeMenuChanged");
		$("ul.orbit-mode-menu li").removeClass("active");
		var mode = $(this).data("mode");
		orbit.log("mode[" + mode + "]");
		var active = $("ul.orbit-mode-menu li.mode-menu-" + mode);
		active.addClass("active");
		orbit.log(["active", active]);
		orbit.mode = mode;
		orbit.renderForm();
		orbit.recalc();
	},
	
	recalc: function() {
		orbit.log("recalc");
		if (orbit.mode == "calc") {
			for (var i=0; i<orbit.unitsData.length; i++) {
				var rowCost = 0;
				var d = orbit.unitsData[i];
				if (d) {
					for (var j in d) {
						var dj = d[j];
						if (j.indexOf("-cost") > -1) {
							var classRef = ".orbit-calc-" + i + "-" + j;
							var val = $(classRef).val();
							var q = parseInt(val, 10);
							q = q ? q : 0;
							var cost = parseInt(dj, 10);
							cost = cost ? cost : 0;
							//orbit.log("i[" + i + "], d[" + d + "], j[" + j + "], dj[" + dj + "], classRef[" + classRef + "], q[" + q + "], cost[" + cost + "]");
							rowCost += q * cost;
						}
					}					
					var ccrow = ".orbit-calc-row-" + i;
					$(ccrow).val(rowCost);
				}
			}
		}
	}
};

$(function() {
	orbit.init();
});
