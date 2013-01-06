$(document).ready(function(){
	
	//Initialize recipeTable
	renderRecipeTable(recipeData);

	
	// Initialize graph
	$.plot($('div#graph'), [[0,0],[1,2]]);
	
//----Buttons-------------------------------------------------------------------
        //regularly update layer number column
        $('tbody tr').click(function(){updateRecipeTableLayers(recipeData)});
        	
	// Calculate Button
	$('a#recipeCalcButton').click(function(event){
		event.preventDefault();
		//In case user decides to fool around :)
		removeEmptyRows();
		//Update Layer Numbers
		updateRecipeTableLayers(recipeData);
		//Update Table Index
		updateRecipeTableNK();
		
	});
	
	//New recipe file
        $('a#newRecipeFile').click(function(event){
                event.preventDefault();
                recipeData = [];
                renderRecipeTable(recipeData); 
        });
        
        //Load Recipe. Must reinitiate jquery recipe click after change
        $(document).on('click','a.recipes',(function(event){
                event.preventDefault();
                var recipeName = $(this).text();
		loadRecipe(recipeName);
		updateRecipeTableLayers(recipeData);
		updateRecipeTableNK();
		renderRecipeTable(recipeData);
	}));
	
	// Save Button
	$(document).on('click','a#saveButton.recipeButton',(function(event){
		event.preventDefault();
		saveRecipe(recipeData);
	}));
	
        // Delete Button
	$(document).on('click','a#deleteButton.recipeButton',(function(event){
	        event.preventDefault();
	        deleteRecipe();
	}));
});
//--------------------------------------------end of on document-- ready section

//update HandsonTable autocompleteCells-----------------------------------------

// Display recipe Table
function renderRecipeTable(recipeData) {
	$('div.recipeTable').handsontable({
		minRows: 21,
		Cols: 5,
		dataSchema: {Layer: null, Material: null,  n: null, k: null, Thickness: null},
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
		cells: function(row, col, prop, td){
			var cellProperties = {};
			if (col == 0 || col == 2 || col == 3) {
				cellProperties.readOnly = true;
			}
			
			return cellProperties;
		},
		data: recipeData
	});
}

// The materials drop down list.
function updateRecipeTableSavedMaterials(){
	var savedItems = Object.keys(localStorage);
	var savedList = [];
	for (i=0; i<savedItems.length; i++) {
		if (localStorage.getItem(savedItems[i]).indexOf('materialName') == 2) {
			savedList.push(savedItems[i]);
		}
	}
	return savedList;
}

//Check for empty rows in recipe, delete if any.
function removeEmptyRows() {
        var num = 0;
        var index = [];
        // First get number of filled in rows and their index
        for (i = 0; i < recipeData.length; i++) {
                if (recipeData[i].Material !== null) {
                        num += 1;
                        index.push(i);
                }
        }
        // iterate over number of rows by index- this pushes rows together
        for (i = 0 ; i < num ; i++) {
                recipeData[i] = recipeData[index[i]];
        }
        // empty left over rows
        for (i = num ; i < recipeData.length ; i++) {
                recipeData.splice(i,1,{"Thickness": null, "Layer": null, "Material":null, "n": null, "k": null})
        }
}

// All Layer numbers
function updateRecipeTableLayers(recipeData) {
	for (i=0; i<recipeData.length; i++){
		if (recipeData[i].Material) {
			recipeData[i]["Layer"]=i+1;
		}
	}
	$('div.recipeTable').handsontable('render');
}

// the index of the material corresponding to the wavelength of interest
function updateRecipeTableNK(){
	var wavelength =  parseInt($('input#wavelength').val());
	var noThick = 0; //Catch layers without a thickness
	for (i=0; i<recipeData.length; i++) {
		if (recipeData[i].Material && recipeData[i].Thickness){
			var materialName = recipeData[i].Material;
			var n = JSON.parse(localStorage.getItem(materialName));
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

		recipeData[i].n = Index;
		recipeData[i].k = Extinction;
		} else if (recipeData[i].Material && !recipeData[i].Thickness){
                                noThick += 1;
			} else {
			        recipeData[i] = {"Thickness": null, "Layer": null, "Material":null, "n": null, "k": null}
			}
	}
	if (noThick != 0) {
	        $('div#output').append("Thicknesses for " + noThick + " layers missing.<br/>");
	}
}

//------------------------------------------------End Autocomplete cells--------

//Recipe List
function updateRecipeList() {
	$('div#recipeContainer').empty();
	var saved = Object.keys(localStorage);
	
	for (i=0; i<saved.length; i++) {
		if (localStorage.getItem(saved[i]).indexOf('recipeName') == 2) {
			$('div#recipeContainer').append('<a href="' + saved[i] + '" class="recipes">' + saved[i] + '</a><br/>');
                }
        };
        //Clear field for new file
        $('div#recipeContainer').prepend('<a href="" id="newRecipeFile">new recipe file</a><br/>')
        
};

//Function for loading a recipe from local storage.
function loadRecipe(recipeName) {
        toggleRecipeTable();
	$('#name').val(recipeName);
	document.title = recipeName;
	// retrieve recipe from storage
	var jsonData = $.parseJSON(localStorage.getItem(recipeName));
	updateOutput("Loading Recipe: " + recipeName + "<br/>");
	
	//construct recipe table	
	for (i=0; i<jsonData.Layers.length; i++){
	        recipeData[i] = {"Thickness": jsonData.Layers[i].Thickness, "Layer": jsonData.Layers[i].Layer, "Material": jsonData.Layers[i].Material};
		recipeData[i].length = 0;
	};
	//remove any cells from previously loaded recipes
	for (i=jsonData.Layers.length; i < recipeData.length ; i++) {
			recipeData[i] = {"Thickness": null, "Layer": null, "Material":null, "n": null, "k": null};
		}
	renderRecipeTable(recipeData);
};

//Function for saving a recipe to local storage.
function saveRecipe(recipeData) {
	var recipeName = $('input#name').val();
	var wavelength = $('input#wavelength').val();
	// make new recipe object
	var jsonData = new recipe(wavelength, recipeName);

	for (i = 0 ; i < recipeData.length ; i++) {
	        //skip over blank fields, build recipe
		if (recipeData[i].Material && recipeData[i].Thickness) { 
			jsonData.Layers[i] = { "Thickness": recipeData[i].Thickness, "Material": recipeData[i].Material, "Layer": recipeData[i].Layer}
		}
		
	// Store a new recipe in a string
	var jsonString = JSON.stringify(jsonData);
	// place in storage with a key equal to the recipe Name.
	localStorage.setItem(recipeName, jsonString);
	}
	updateOutput("Recipe file saved: " + recipeName + "<br/>");
	updateRecipeList();
}

//Delete from storage
function deleteRecipe() {
        var recipeName = $('input#name').val();
        var decision = confirm("Are you sure you want to delete recipe " + recipeName);
        if (decision) {
                localStorage.removeItem(recipeName);
                updateRecipeList();
                updateOutput(recipeName + " deleted.<br/>")
        }
     
};

// Initialize the recipe template
var recipe = function (wavelength, recipeName) {
	this.recipeName = recipeName;
	this.Wavelength = wavelength;
	this.Layers = [{"Layer": 0, "Thickness": 0}]
}




