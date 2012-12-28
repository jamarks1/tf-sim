$(document).ready(function(){
	//Initialize recipeTable
	var data = [];
	for (i=0; i<19; i++){data[i]=[i+1,,,,,]}
	$('div#recipeTable').handsontable({
		startCols: 5,
		startRows: 19,
		colHeaders: ["Layer","Material","   n   ","   k   ", "Thickness"],
		cells: function(row, col, prop){
			var cellProperties = {};
			if (col === 0) {
				cellProperties.readOnly = true;
			}
			return cellProperties;
		},
		data: data
	});
	
	// Initialize graph
	$.plot($('div#graph'), [0,0]);
	
});
