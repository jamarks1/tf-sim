$(document).ready(function(){

        renderMaterialTable(materialData);
        
        
//---Buttons-------------------------------------------------------------------
        
        //New material file
        $('a#newMaterialFile').click(function(event){
                event.preventDefault();
                materialData = [];
                renderMaterialTable(materialData);
        });
        
        //load material. The .on lets it persist through updateMaterialList().
       $(document).on('click','a.materials',(function(event){
                event.preventDefault();
                var materialName = $(this).text();
                loadMaterial(materialName);
        }));
        
        //Save material file
        $(document).on('click','a#saveButton.materialButton',(function(event){
                event.preventDefault();
                saveMaterial(materialData);
        }));
        // Delete Button
	$(document).on('click','a#deleteButton.materialButton',(function(event){
	        event.preventDefault();
	        deleteMaterial();
	}));
});
//--------------------------------------------------------end of document ready.

// Display material table
function renderMaterialTable(materialData) {
	$('div.materialTable').handsontable({
		startRows: 19,
		Cols: 3,
		dataSchema: {lambda: null, n: null,  k: null},
		colHeaders: ["Wavelength", "Refractive Index", "Extinction Coefficient"],
		minSpareRows: 1,
		columns: [{data: "lambda"},
			{data: "n"},
			{data: "k"}],
		cells: function(row, col, prop, td){
			var cellProperties = {};
			cellProperties.readOnly = false;
			return cellProperties;
			},
		data: materialData
	});
}


//Material List
function updateMaterialList() {
	$('div#materialContainer').empty();
	var saved = Object.keys(localStorage);
	
	for (i=0; i<saved.length; i++) {
		if (localStorage.getItem(saved[i]).indexOf('materialName') == 2) {
			$('div#materialContainer').append('<a href="' + saved[i] + '" class="materials">' + saved[i] + '</a><br/>');
		}
	};
	//Clear fields for new file
	$('div#materialContainer').prepend('<a href="" id="newMaterialFile">new material file</a><br/>')
	
};

//Load material file from local storage. Very similar to loadRecipe(). Would
//like to combine in the future.
function loadMaterial(materialName) {
        toggleMaterialTable();
        $('#name').val(materialName);
        document.title = materialName;
        var jsonData = $.parseJSON(localStorage.getItem(materialName));
       updateOutput("Loading Material: " + materialName + "<br/>");
        
        //construct material table
        for (i=0; i<jsonData.Indices.length; i++){
		materialData[i] = { lambda: jsonData.Indices[i].lambda , n: jsonData.Indices[i].n, k: jsonData.Indices[i].k}
		materialData[i].length = 0;
	};
	//remove any cells from previously loaded 
	for (i=jsonData.Indices.length; i < materialData.length ; i++) {
			materialData.splice(i);                
		}
	renderMaterialTable(materialData);
	$.plot($('div#graph'),[materialData]);
}

//Function for saving a material to local storage.
function saveMaterial(materialData) {
	var materialName = $('input#name').val();

	// make new material object
	var jsonData = new material(materialName);

	for (i = 0 ; i < materialData.length ; i++) {
	        //skip over blank fields, build recipe
		if (materialData[i].lambda && materialData[i].n) { 
			jsonData.Indices[i] = { "lambda": materialData[i].lambda, "n": materialData[i].n, "k": materialData[i].k}
		}
		
	// Store a new recipe in a string
	var jsonString = JSON.stringify(jsonData);
	// place in storage with a key equal to the recipe Name.
	localStorage.setItem(materialName, jsonString);
	}
	updateOutput("Material file saved: " + materialName + "<br/>");
	updateMaterialList();
}

//Delete Material function
function deleteMaterial(){
        var materialName = $('input#name').val();
        var decision = confirm("Are you sure you want to delete material " + materialName);
        if (decision) {
                localStorage.removeItem(materialName);
                updateMaterialList();
                updateOutput(materialName + " deleted.<br/>")
        }
}


//Material Functions-----------------------------------------------------------	

// make a new material for importing to JSON format
var material = function (materialName) {

	this.materialName = materialName;
	this.Indices = [{"lambda": 0, "n": 0 , "k": 0},{"lambda": 0, "n": 0, "k": 0 }];
	//this.Notes = " "; todo
 };     
        
        
        
