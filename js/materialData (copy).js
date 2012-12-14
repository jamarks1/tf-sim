

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


