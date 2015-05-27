// recipe.js

$(document).ready(function(){
	
	//Initialize recipeTable
	renderRecipeTable(recipeData);
	//QWOT to physical thickness
   updateThicknessListener();
   //initialize scrollbar in datatable, using the Perfect scrollbar plugin
   var dataTable = document.getElementById('dataTable');
   Ps.initialize(dataTable);
   	
//----Buttons-------------------------------------------------------------------
        //regularly update layer number column
        $('div#dataTable.recipeTable tbody tr').click(function(){
         updateRecipeTableLayerNumbers(recipeData);
         //selection = $('div.recipeTable').handsontable('getSelected');
         });          
        	
	// Plot Button
	$('a#plotButton.recipeButton').click(function(event){
		event.preventDefault();
		removeEmptyRows();
		//Update Layer Numbers, 
		updateRecipeTableLayerNumbers(recipeData);
		//Update Table Index
		updateRecipeTableNK();		
		graph();
		
	});
	
	//New recipe file
        $('a#newRecipeFile').click(function(event){
                event.preventDefault();
                recipeData = [];
                renderRecipeTable(recipeData);
                $.plot($('div#graph'), [0,0]);
        });
        
        //Load Recipe. Must reinitiate jquery recipe click after change
        $(document).on('click','a.recipes',(function(event){
                event.preventDefault();
                var recipeName = $(this).text();
		loadRecipe(recipeName);
		updateRecipeTableLayerNumbers(recipeData);
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
	// remove empty rows button
	$(document).on('click','a#deleteRowsButton.recipeButton',(function(event){
	   event.preventDefault();
	   deleteRows();
	}));
});
//--------------------------------------------end of on document-- ready section

//update HandsonTable autocompleteCells-----------------------------------------

// Display recipe Table
  
function renderRecipeTable(recipeData) {
	$('div.recipeTable').handsontable({
		minRows: 25,
		Cols: 6,
		dataSchema: {Layer: null, 
		Material: null,  
		n: null, k: null, 
		Thickness: null, 
		QWOT: null},
		minSpareRows: 1,
		stretchH: 'all',
		outsideClickDeselects: false,
		colHeaders: ["Layer", "Material", "n", "k", "Thickness", "QWOT"], 
		columns: [{data: "Layer"},
			{data:"Material", 
				type: "dropdown",
				source: updateRecipeTableSavedMaterials()
			},
			{data: "n"},
			{data: "k"}, 
			{data: "Thickness"},
			{data: "QWOT"}],

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
      var m = recipeData[i].Material;
      var ot = recipeData[i].QWOT;
      var t = recipeData[i].Thickness;
      if (m !== "" && ot !== "" && t !== "") {
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
      recipeData.splice(i,1,{"Thickness": null, "Layer": null, "Material":null, "n": null, "k": null, "QWOT":null})
   }
   $('div.recipeTable').handsontable('render');
}

// All Layer numbers
function updateRecipeTableLayerNumbers(recipeData) {
	for (i=0; i<recipeData.length; i++){
		if (recipeData[i].Material) {
			recipeData[i]["Layer"]=i+1;
		}
	}
	$('div.recipeTable').handsontable('render');
}

// the index of the material corresponding to the reference wavelength
function updateRecipeTableNK(){
	var wavelength =  parseFloat($('input#wavelength').val());
	if ($('select#waveUnits').val() === "microns"){
	   wavelength = wavelength * 1000;
	}//if microns for units is chosen, convert to nanometers
	var noThick = 0; //Catch layers without a thickness
	for (i=0; i<recipeData.length; i++) {
		if (recipeData[i].Material && recipeData[i].Thickness){
			var materialName = recipeData[i].Material;
			var n = JSON.parse(localStorage.getItem(materialName));
	/* This code will find the two wavelengths in material table closest to
	 wavelength of interest and take a proportion of both relative to it */
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
	renderRecipeTable(recipeData);
}

//update the calculated Index or Extinction by wavelength for just selected row.
function updateRowNK(){
   updateRecipeTableLayerNumbers(recipeData);
   var wavelength =  parseFloat($('input#wavelength').val());
   //from Handsontable API
   var rowNum = $('div.recipeTable').handsontable('getSelected')[0] 
   var row = $('div.recipeTable').handsontable('getDataAtRow',rowNum);
   var materialName = row[1];
   var n = JSON.parse(localStorage.getItem(materialName));
   
   /* This code will find the two wavelengths in material table closest to
	wavelength of interest and take a proportion of both relative to it */
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
   
   if (hiIndex == 0) {
	   loWavelength = wavelength;
	}
	
	var Index1 = ((loWavelength/ wavelength) * loIndex);
   var Extinction1 = ((loWavelength/ wavelength) * loExtinction);
   var Index2 = ((1-(loWavelength/ wavelength)) * hiIndex);
		
   var Extinction2 = ((1-(loWavelength/ wavelength)) * hiExtinction);
   var Index = Math.round((Index1 + Index2)*1000)/1000;
   var Extinction = Math.round((Extinction1 + Extinction2)*1000000)/1000000;
   
   recipeData[row[0]-1].n = Index;
   recipeData[row[0]-1].k = Extinction;
   
   
   renderRecipeTable(recipeData);
   
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

//list of materials used in a recipe
function materialsUsed(){
   var materialsUsed = [];
   materialsUsed.push(recipeData[0].Material);
   for (var i = 1; i<recipeData.length; i++) {
   var flag = false;
   for (var index in materialsUsed){
      var material = recipeData[i].Material;
      if (material === materialsUsed[index]){
           flag = true;
      }
   };   
   if (flag === false && material !== null){ //empty lines give null value
      materialsUsed.push(material);
   }  
   };
   
   return materialsUsed;
};

//Function for loading a recipe from local storage.
function loadRecipe(recipeName) {
   toggleRecipeTable();
	$('#name').val(recipeName);
	//document.title = recipeName;
	// retrieve recipe from storage
	var jsonData = $.parseJSON(localStorage.getItem(recipeName));
	//Put in the previously saved user defined parameters
	updateOutput("Loading Recipe: " + recipeName + "<br/>");
	$('input#wavelength').val(jsonData.wavelength);
	$('select#waveUnits').val(jsonData.waveUnits);
	$('input#rangeXMin').val(jsonData.scanRange.from);
	$('input#rangeXMax').val(jsonData.scanRange.to);
	$('input#interval').val(jsonData.interval);
	$('input#aoi').val(jsonData.aoi);
	$('input#substrate').val(jsonData.substrate);
	$('select#y-axis').val(jsonData.yAxis);
	$('select#x-axis').val(jsonData.xAxis);
		
	//construct recipe table	
	for (i=0; i<jsonData.layers.length; i++){
	        recipeData[i] = {"Thickness": jsonData.layers[i].Thickness, "layer": jsonData.layers[i].layer, "Material": jsonData.layers[i].Material, "QWOT":jsonData.layers[i].QWOT};
		recipeData[i].length = 0;
	};
	//remove any cells from previously loaded recipes
	for (i=jsonData.layers.length; i < recipeData.length ; i++) {
			recipeData[i] = {"Thickness": null, "Layer": null, "Material":null, "n": null, "k": null,"QWOT": null};
		}
   $.plot($('div#graph'), [0,0]);
	renderRecipeTable(recipeData);
};

//Function for saving a recipe to local storage.
function saveRecipe(recipeData) {
	var recipeName = $('input#name').val();
	
	// make new recipe object
	var jsonData = new recipe(recipeName);

	for (i = 0 ; i < recipeData.length ; i++) {
	        //skip over blank fields, build recipe
		if (recipeData[i].Material && recipeData[i].Thickness) { 
			jsonData.layers[i] = { "Thickness": recipeData[i].Thickness, "Material": recipeData[i].Material, "Layer": recipeData[i].Layer, "QWOT": recipeData[i].QWOT}
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

// Initialize the recipe template. Save user defined options with recipe
var recipe = function (recipeName) {
	this.recipeName = recipeName;
	this.wavelength = $('input#wavelength').val();
	this.waveUnits = $('select#waveUnits').val();
	this.scanRange = {"from": $('input#rangeXMin').val(),
	                  "to": $('input#rangeXMax').val()};
	this.interval = $('input#interval').val();
	this.aoi = $('input#aoi').val();
	this.substrate = $('input#substrate').val();
	this.yAxis = $('select#y-axis').val();
	this.xAxis = $('select#x-axis').val();
	this.layers = [{"layer": 0, "Thickness": 0}];
	
}

//Delete the rows selected in the table
function deleteRows(){
   console.log($('div.recipeTable').handsontable('getSelected'));
   if ($('div.recipeTable').handsontable('getSelected') !== undefined) {
      var row1 = $('div.recipeTable').handsontable('getSelected')[0];
      var row2 = $('div.recipeTable').handsontable('getSelected')[2];
      if (confirm("Delete selected row(s)?") === true) {
         recipeData.splice(row1,(row2-row1)+1);
         renderRecipeTable(recipeData);
      }
      
   }
};

//insert rows
function insertRows(){
   if ($('div.recipeTable').handsontable('getSelected') !== undefined) {
      var row1 = $('div.recipeTable').handsontable('getSelected')[0];
      var row2 = $('div.recipeTable').handsontable('getSelected')[2];
      for (var i = row1; i<=row2; i++){
         recipeData.splice(i,0,{"Thickness": "", "Layer": "", "Material":"", "n": "", "k": "","QWOT": ""});
         renderRecipeTable(recipeData);
      }    
   }  
};

//A function that converts optical thickness to physical, or physical to 
//optical
//focusout wont attach directly to a table column, so i'm calling it on
//the document under the conditions that i'd want it to attach.
function updateThicknessListener(){
   $(document).on('focusout click',function(){      
   if ($('div.recipeTable').handsontable('getSelected') !== undefined) { 
      var columnNum = $('div.recipeTable').handsontable('getSelected')[1];    
      if (columnNum === 4 || columnNum === 5) {
         updateRowNK();
         var rowNum = $('div.recipeTable').handsontable('getSelected')[0];
         var wavelength = parseFloat($('#wavelength').val());
         var value = $('div.recipeTable').handsontable('getValue');
         var row = $('div.recipeTable').handsontable('getDataAtRow',rowNum);
      
         if (columnNum === 4){         
            var ot = math.round((row[2]*row[4])/(wavelength/4),3);
            $('div.recipeTable').handsontable('setDataAtCell',rowNum,5,ot);
         }
         if (columnNum === 5){
            var pt = math.round((row[5]*(wavelength/4))/row[2],2);
            $('div.recipeTable').handsontable('setDataAtCell',rowNum,4,pt);   
         }
      
         $(document).off('focusout','**');      
      }
   }
   });
};

