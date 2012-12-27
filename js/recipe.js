$(document).ready(function(){
	//Initialize recipeTable
	$('div#recipeTable').handsontable({
		startCols: 3,
		startRows: 19,
		colHeaders: ["Material","Index","Thickness"]
	});
	
	// Initialize graph
	$.plot($('div#graph'), [0,0]);
	
});
