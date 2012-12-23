//Material Functions	

// make a new material for importing to JSON format
var material = function (materialName) {

	this.materialName = materialName;
	this.Indices = [{"lambda": 0, "n": 0 , "k": 0},{"lambda": 0, "n": 0, "k": 0 }];
	//this.Notes = " "; todo
 };

// Take parsed mtx xml data and turn it into json
function mtxToJSON (materialName,nkpoints,notes){
	//Make a new material from material class, make array length equal to data points
	newMaterial = new material(materialName);
	newMaterial.Indices.length = nkpoints.length;
	// iterate through xml.
	for (i=0; i<nkpoints.length; i++) {
			newMaterial.Indices[i] = {"lambda": Math.round(parseFloat($(nkpoints[i]).attr('W'))*10)/10, "n": Math.round(parseFloat($(nkpoints[i]).attr('n'))*1000)/1000, "k": Math.round(parseFloat($(nkpoints[i]).attr('k'))*1000000)/1000000};	
	};
	// We should fill in the Notes data as well.
	//newMaterial.Notes = notes; todo
	return newMaterial;
};

// Take info from dataTable and turn into json
function dataTableToJSON(materialName,data){
		//Make a new material from material class, make array length equal to data points
		newMaterial = new material(materialName);
		newMaterial.Indices.length = data.length;
		for (i=0; i<data.length; i++){
				for (j=0; j<data[0].length; j++) {
					for (i=0; i<data.length; i++){ newMaterial.Indices[i] = {"lambda": data[i][0], "n": data[i][1], "k": data[i][2]}};
				};
		};
		//newMaterial.Notes = notes; todo
		return newMaterial;
};

// Update the list of saved materials in localStorage
function updateSaved() {
	$('select#savedList').html("");
	var savedMaterials = Object.keys(localStorage);
	for (i=0; i<savedMaterials.length; i++) {
		$('#savedList').append('<option>' + savedMaterials[i] + '</option>');
	};
};

//Update the graph
function updateGraph(data) {
	$.plot($('div#graph'),[data]);
};


