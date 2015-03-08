/* Code for handling material files. Developed by James Marks (jamarks1 on github) in 2012. */
$(document).ready(function(){

        renderMaterialTable(materialData);
        
        //Turn curves on and off with checkbox
        $('div#materialSettingsContainer :checkbox').click(function(){materialGraph(materialData)})
        
        
//---Buttons-------------------------------------------------------------------
        
        //New material file
        $('a#newMaterialFile').click(function(event){
                event.preventDefault();
                materialData = [];
                renderMaterialTable(materialData);
                $.plot($('div#graph'), [0,0]);
        });
        
        //load material. The .on lets it persist through updateMaterialsList().
       $(document).on('click','a.materials',(function(event){
                event.preventDefault();
                var materialName = $(this).text();
                loadMaterial(materialName);
        }));
        
        //calculate and plot material table
        $('a#plotButton.materialButton').click(function(event){
                event.preventDefault();
                materialGraph(materialData);        
        });
        
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


//update Material List 
function updateMaterialsList() {
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

//Make an array of the materials saved.
function materialsList(){
   var materialsList = []
   var saved = Object.keys(localStorage);
   for (i=0; i<saved.length; i++) {
		if (localStorage.getItem(saved[i]).indexOf('materialName') == 2) {
			materialsList.push(saved[i]);
		}
	};
    return materialsList;
}

//Load material file from local storage. Very similar to loadRecipe().
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
	materialGraph(materialData);
	
}

//Function for saving a material to local storage.
function saveMaterial(materialData) {
	var materialName = $('input#name').val();

	// make new material object
	var jsonData = new material(materialName);

	for (i = 0 ; i < materialData.length ; i++) {
	        //skip over blank fields, build recipe
		if (materialData[i].lambda && materialData[i].n) { 
			jsonData.Indices[i] = { "lambda": parseFloat(materialData[i].lambda), "n": parseFloat(materialData[i].n), "k": parseFloat(materialData[i].k)}
		}
		
	// Store a new recipe in a string
	var jsonString = JSON.stringify(jsonData);
	// place in storage with a key equal to the recipe Name.
	localStorage.setItem(materialName, jsonString);
	}
	updateOutput("Material file saved: " + materialName + "<br/>");
	updateMaterialsList();

}

//Delete Material function
function deleteMaterial(){
        var materialName = $('input#name').val();
        var decision = confirm("Are you sure you want to delete material " + materialName);
        if (decision) {
                localStorage.removeItem(materialName);
                updateMaterialsList();
                updateOutput(materialName + " deleted.<br/>")
        }
}

// Produce materialGraph
function materialGraph(materialData) {
        var datasets = [];
        var nPlot = [];
        var kPlot = [];
                //Construct individual arrays for n and k data
                for (i = 0 ; i < materialData.length; i++) {
                        nPlot[i] = [materialData[i].lambda , materialData[i].n];
                        kPlot[i] = [materialData[i].lambda , materialData[i].k];
                }
        // Reference material settings for user input. plot displayed?
        $('div#materialSettingsContainer input:checked').each(function(){
                var key = $(this).attr('id');
                if (key === 'plotIndex'){
                        datasets.push({ color: '#D1718C', data: nPlot});
                }
                if (key === 'PlotExtinction'){
                        datasets.push({ color: '#71D1B6' , data: kPlot});
                }
        });
        // If no plot is checked, return an empty plot
        if (datasets.length === 0) {
                datasets = [0,0];
        }
        
        $.plot($('div#graph'),datasets);
}

//Material Functions-----------------------------------------------------------	

// make a new material class
var material = function (materialName) {

        this.materialName = materialName;
        this.Indices = [{"lambda": 0, "n": 0 , "k": 0},{"lambda": 0, "n": 0, "k": 0 }];

        //Methods for graphing the data. Not being used right now.
        material.prototype.plotIndex = function(materialData){
                var nPlot = [];
                for (i = 0 ; i < materialData.length; i++) {
                        nPlot[i] = [materialData[i].lambda , materialData[i].n];
                }
        return nPlot;
        };

         material.prototype.plotExtinction = function(materialData){
                var kPlot = [];
                for (i = 0 ; i < materialData.length; i++) {
                        kPlot[i] = [materialData[i].lambda , materialData[i].k];
                }
        return kPlot;
        };
};     
     

       
 
        
        
