$(document).ready(function(){

	//var recipeData = [];
	//var materialData = [{},{},{}]
	
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



