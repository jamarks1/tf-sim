

// make a new material for importing to JSON format
material = function(materialName){ 

	this.materialName = materialName;
	this.Indices = [{"lambda": 0 , "n": 0 ,"k": 0},{"lambda": 0, "n": 0, "k": 0 }];
	this.Notes = " ";
	
  };

// Take parsed mtx xml data and turn it into json
function mtxToJSON (materialName,nkpoints,notes){
	//Make a new material from material class, make array length equal to data points
	newMaterial = new material(materialName);
	newMaterial.Indices.length = nkpoints.length;
	// iterate through xml.
	for (i=0; i<nkpoints.length; i++) {
			newMaterial.Indices[i] = {"lambda": parseInt($(nkpoints[i]).attr('W')), "n": parseFloat($(nkpoints[i]).attr('n')).toFixed(3), "k": parseFloat($(nkpoints[i]).attr('k')).toFixed(6)};	
	};
	// We should fill in the Notes data as well.
	newMaterial.Notes = notes.text();
	return newMaterial;
};

// Take info from dataTable and turn into json
function dataTableToJSON(materialName,data,notes){
		//Make a new material from material class, make array length equal to data points
		newMaterial = new material(materialName);
		newMaterial.Indices.length = data.length;
		for (i=0; i<data.length; i++){
				for (j=0; j<data[0].length; j++) {
					for (i=0; i<data.length; i++){ newMaterial.Indices[i] = {"lambda": data[i][0], "n": data[i][1], "k": data[i][2]}};
				};
		};
		newMaterial.Notes = notes;
		return newMaterial;
};

