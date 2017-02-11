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
		$(".orbit-mode-menu li").on("click", orbit.modeChange);
		$(".orbit-calc-reset").on("click", orbit.resetCalc);
		
		queue.next();
	},
	
	loadUnitsRequest: function() {
		orbit.log("load units request");

		Papa.parse(orbit.unitsFile, {
			delimiter: ",",
			download: true,
			header: true,
			complete: orbit.loadUnitsResponse,
			encoding: "UTF-8"
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

		//orbit.log(["unitsHdr", orbit.unitsHdr]);
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
		
	modeChange: function() {
		orbit.log("modeChange");
		
		var that = $(this);
		$("ul.orbit-mode-menu li").removeClass("active");
		var mode = that.data("mode");
		orbit.log("mode[" + mode + "]");
		var active = $("ul.orbit-mode-menu li.mode-menu-" + mode);
		active.addClass("active");
		orbit.log(["active", active]);
		orbit.mode = mode;
		orbit.renderForm();
		orbit.recalc();
		
		$("body").removeClass("mode-data").removeClass("mode-calc").addClass("mode-" + mode);
		var modeLabel = that.text();
		$(".orbit-mode-dropdown-label").html(modeLabel);
	},
	
	recalc: function() {
		orbit.log("recalc");
		
		if (orbit.mode == "calc") {
			var totalCost = 0;
			for (var i=0; i<orbit.unitsData.length; i++) {
				var rowCost = 0;
				var d = orbit.unitsData[i];
				if (d) {
					for (var j in d) {
						var dj = d[j];
						if (j.indexOf("-cost") > -1) {
							var classRef = ".orbit-calc-" + i + "-" + j;
							var val = $(classRef).val();
							var q = parseFloat(val, 10);
							q = q ? q : 0;
							var cost = parseFloat(dj, 10);
							cost = cost ? cost : 0;
							//orbit.log("i[" + i + "], d[" + d + "], j[" + j + "], dj[" + dj + "], classRef[" + classRef + "], q[" + q + "], cost[" + cost + "]");
							rowCost += q * cost;
						}
					}					
					var ccrow = ".orbit-calc-row-" + i;
					var rowCostDisp = rowCost ? rowCost : "";
					$(ccrow).val(rowCostDisp);
					totalCost += rowCost;
				}
			}
			$("#costTotal").html(totalCost);
		}
	},
	
	resetCalc: function() {
		orbit.log("resetCalc");
		
		$("input").val("");
		orbit.recalc();
	},
	
	renderForm: function() {
		orbit.log("render form");
		//orbit.log("orbit.mode[" + orbit.mode + "]");
		
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
			
			th += "<th colspan=\"" + colspan + "\" class=\"orbit-header-" + key + "\">"
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
					th += "<tr class=\"orbit-row-" + i + "\">";
					th += "<td>"
						+ "<img src=\"" + u + "\" alt=\"" + t + "\" class=\"unit-type\" />"
					    + "</td>";
					for (var key in d) {
						var dj = d[key];
						if (key == "hdr-unit-type") {
							dj = dj.toUpperCase();
						}
						if (dj == "-0") {
							dj = "-";
						}
						th += "<td class=\"orbit-header-" + key + "\">" + dj + "</td>";
						
						if (orbit.mode == "calc" && key.indexOf("-cost") > -1) {
							if ($.isNumeric(dj)) {
								th += "<td><input type=\"number\" class=\"orbit-calc orbit-calc-" + i + "-" + key + "\" size=\"3\" min=\"0\" pattern=\"^[0-9]\" /></td>";								
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
		
		$('.unit-type').on('click', orbit.showUnitTypeModal);
		
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
	
	showUnitTypeModal: function() {
		orbit.log("showUnitTypeModal");
		
		var that = $(this);
		var alt = that.attr('alt');
		var title = alt.toUpperCase();
		var descClass = ".orbit-header-hdr-description";
		var desc = that.parents("tr").find(descClass).text();

		var src = that.attr('src');
		that.attr('src', src);
		var dialog = $("#complete-dialog");
		dialog.find(".imagepreview").attr("src", src);
		dialog.find(".modal-title").html(title);
		dialog.find(".orbit-description").html(desc);
		dialog.modal('show');
	}
};

$(function() {
	orbit.init();
});
