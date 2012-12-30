$(document).ready(function(){
	//Initialize recipeTable
	//var data = [];
	
	
	$('div#recipeTable').handsontable({
		minRows: 19,
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
		data: data
	});
	updateRecipeTableNumberLayers(data);
	
	// Initialize graph
	$.plot($('div#graph'), [0,0]);
	
//----Buttons--------------------------------------------------------------------------------	
	// Calculate Button
	$('a#recipeCalcButton').click(function(event){
		event.preventDefault();
		//Update Table Index
		updateRecipeTableIndex();
	});
	
});
//----------------------------------------------------------end of on document ready section

//update HandsonTable autocompleteCells-----------------------------------------------------
// The saved materials list. Same as updateSaved() for materials savedList
function updateRecipeTableSavedMaterials(){
	var savedMaterials = Object.keys(localStorage);
	var savedList = [];
	for (i=0; i<savedMaterials.length; i++) {
		if (savedMaterials[i].indexOf('material.') === 0) {
			savedList[i] = savedMaterials[i].slice(9);
		}
	}
	return savedList;
}

// Called when Layers numbers change
function updateRecipeTableNumberLayers(data) {
	for (i=0; i<data.length; i++){
		data[i]["Layer"]=i+1;
	}
	$('div#recipeTable').handsontable('render');
}

// the index of the material corresponding to the wavelength of interest
function updateRecipeTableIndex(){
	var wavelength =  parseInt($('input#wavelength').val());
	for (i=0; i<data.length; i++) {
		if (data[i].Material != undefined || data[i].Material != null){
			var materialName = data[i].Material;
			var n = JSON.parse(localStorage.getItem("material." + materialName));
			// This code will find the two wavelengths in material table closest to
			// wavelength of interest and take a proportion of both relative to the
			// wavelength. This will allow us to extrapolate based on the data we have. 
			var hiWavelength = 0;
			var hiIndex = 0;
			var loWavelength = 0; 
			var loIndex = 0;
			var hiExtinction = 0;
			var loExtinction = 0;
			for (j = 0; j < n.Indices.length; j++) {
				
				if (n.Indices[j].lambda <= wavelength && (loWavelength === 0 || loWavelength < n.Indices[j].lambda)) {
					loWavelength = n.Indices[j].lambda;
					loIndex = n.Indices[j].n;
					loExtinction = n.Indices[j].k;		
				}
					
				if (n.Indices[j].lambda >= wavelength && (hiWavelength === 0 || hiWavelength > n.Indices[j].lambda)) {
					
					hiWavelength = n.Indices[j].lambda;
					hiIndex = n.Indices[j].n;
					hiExtinction = n.Indices[j].k;				
				}
				
			};
		
		// Closer data point is the wavelength, higher proportion used.
		// But if LoWavelength is the highest number, It's proportion should be 1. 
		if (hiIndex == 0) {
			loWavelength = wavelength;
		}
		
		var Index1 = ((loWavelength/ wavelength) * loIndex);

		var Extinction1 = ((loWavelength/ wavelength) * loExtinction);
		var Index2 = ((1-(loWavelength/ wavelength)) * hiIndex);
		
		var Extinction2 = ((1-(loWavelength/ wavelength)) * hiExtinction);
		var Index = Math.round((Index1 + Index2)*1000)/1000;
		var Extinction = Math.round((Extinction1 + Extinction2)*1000000)/1000000;

		data[i].n = Index;
		data[i].k = Extinction;
		}
		
	}
	$('div#recipeTable').handsontable('render');
}

//----------------------------------------------------------End Autocomplete cells--------


