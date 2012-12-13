

// make a new material for importing to JSON format
material = function(materialName){ 

	this.materialName = materialName;
	this.Indices = [{"lambda": 0 , "n": 0 ,"k": 0},{"lambda": 0, "n": 0, "k": 0 }];
	this.Notes = " ";
	
  };

function mtxToJSON (materialName){
	materialData.newMaterial = new material(materialName);
	materialData.newMaterial.Indices.length = nkpoints.length;

	for (i=0; i<nkpoints.length; i++) {
					materialData.newMaterial.Indices[i] = {"lambda": parseInt($(nkpoints[i]).attr('W')), "n": parseFloat($(nkpoints[i]).attr('n')).toFixed(3), "k": parseFloat($(nkpoints[i]).attr('k')).toFixed(6)};	
			};

	materialData.newMaterial.Notes = notes.text();
	// Display resulting JSON
	$('textarea#output').val(JSON.stringify(materialData.newMaterial));
};


