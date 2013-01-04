$(document).ready(function(){

        renderMaterialTable(materialData);

//---Buttons-------------------------------------------------------------------

        //load
        $('a#materialLoadButton').click(function(event){
                event.preventDefault();
                loadMaterial();
        });

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
			
		data: materialData
	});
}


//Material List
function updateMaterialList() {
	$('select#materialList').html("");
	var saved = Object.keys(localStorage);
	
	for (i=0; i<saved.length; i++) {
		if (localStorage.getItem(saved[i]).indexOf('materialName') == 2) {
			$('#materialList').append('<option>' + saved[i] + '</option>');
		}
	};
	//No recipe selected until selected
	$('select#materialList').prepend('<option value=""></option>')
};

//Load material file from local storage. Very similar to loadRecipe(). Would
//like to combine in the future.
function loadMaterial() {
        toggleMaterialTable();
        var materialName = $('select#materialList option:selected').val();
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
	
}
