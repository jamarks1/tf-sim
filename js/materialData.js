

// make a new material for importing to JSON format
material = function(materialName){ 

	this.materialName = materialName;
	this.Indices = [{"lambda": 0 , "n": 0 ,"k": 0},{"lambda": 0, "n": 0, "k": 0 }];
	this.Notes = " ";
	
  };

// Buttons to control ability to Load and save data.
$(document).ready(function(){
	$('a#saveButton').click(function(){
		event.preventDefault();
		saveMaterial = JSON.stringify(materialData.newMaterial);
		localStorage.setItem(materialData.newMaterial.materialName, saveMaterial);
		console.log("Saved new material file: " + materialData.newMaterial.materialName);
		
	});			
});


