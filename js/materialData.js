

// make a new material for importing to JSON format- Used by mtxConvert.js
material = function(materialName){ 

	this.materialName = materialName;
	this.Indices = [{"lambda": 0 , "n": 0 ,"k": 0},{"lambda": 0, "n": 0, "k": 0 }];
	this.Notes = " ";
	
  };

$(document).ready(function(){
	$('#saveButton').click(function(){
		var filename = 'materials/' + materialData.newMaterial.materialName + '.js';
		$.post(filename,JSON.stringify(materialData.newMaterial),console.log("success"));
	});			
});


