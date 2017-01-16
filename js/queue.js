var queue = {
	a: [],
	
	push: function(s) {
		queue.a.push(s);
	},
	
	next: function() {
		setTimeout("queue.callback();", 10);
	},
	
	callback: function() {
		var s = queue.a.shift();
		if (s) {
			eval(s);
		}
	}

};