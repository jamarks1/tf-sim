$(document).ready(function(){
	//Recipe environment or material environment
	$('a#Recipe').click(function(event){
		event.preventDefault();
		$('div#dataTable').addClass('recipeTable');
		$('div#dataTable').removeClass('materialTable');
		$('div.materialTable').hide();
		renderRecipeTable(recipeData);
	});
	
	$('a#Material').click(function(event){
		event.preventDefault();
		$('div#dataTable').addClass('materialTable');
		$('div#dataTable').removeClass('recipeTable');
		$('div.recipeTable').hide();
		renderMaterialTable(materialData);
		
		
	});
	
	

});

// Functions for setting environment----------------------------------------------------
// Change to display material table
function renderMaterialTable(materialData) {
	$('div.materialTable').handsontable({
		startRows: 19,
		startCols: 3,
		colHeaders: ["Wavelength", "Refractive Index", "Extinction Coefficient"],
		minSpareRows: 1,
		data: materialData
	});
}

// Change to display recipe Table
function renderRecipeTable(recipeData) {
	$('div.recipeTable').handsontable({
		minRows: 19,
		Cols: 5,
		minSpareRows: 1,
		colHeaders: ["Layer", "Material", "   n   ", "   k   ", "Thickness"], 
		columns: [{data: "Layer"},
			{data:"Material", 
				type:Handsontable.AutocompleteCell,
				source: updateRecipeTableSavedMaterials()
			},
			{data: "n"},
			{data: "k"}, 
			{data: "Thickness"}],
		cells: function(row, col, prop){
			var cellProperties = {};
			if (col == 0 || col == 2 || col == 3) {
				cellProperties.readOnly = true;
			}
			return cellProperties;
		},
		data: recipeData
	});
	updateRecipeTableNumberLayers(recipeData);
}
