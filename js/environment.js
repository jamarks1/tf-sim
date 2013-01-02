$(document).ready(function(){
	
	//hide table scrollbars
	var dataTableWidth = document.getElementById("dataTable").scrollWidth;
	document.getElementById("dataContainer").style.width = dataTableWidth + "px";
	
	//var recipeData = [];
	//var materialData = [{},{},{}]
	
	updateRecipeList();
	
	//Recipe environment or material environment
	$('a#Recipe').click(function(event){
		event.preventDefault();
		$('div#dataTable').addClass('recipeTable');
		$('div#dataTable').removeClass('materialTable');
		
		renderRecipeTable(recipeData);
	});
	
	$('a#Material').click(function(event){
		event.preventDefault();
		$('div#dataTable').addClass('materialTable');
		$('div#dataTable').removeClass('recipeTable');
		
		renderMaterialTable(materialData);
		
		
		
	});
	
	

});

// Functions for setting environment----------------------------------------------------



