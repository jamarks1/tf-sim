
$(document).ready(function(){

	// materialData will have other material objects attached to it
	var materialData = {};
	
	$('div#dataTable').handsontable({
		startRows: 19,
		startCols: 3,
		colHeaders: ["Wavelength", "Refractive Index", "Extinction Coefficient"]
			
	});

//Importing from Essential Macleod----------------------------------------------------------------------
	$('#upload').change( function(){

		// remove the previous table
		//$('table#materialTable').empty();
		$('textarea#output').val("");

		// upload file chosen from input, make a Filereader, read file as text
		var uploadFile = $('#upload').get(0).files[0];
		var reader = new FileReader();
		reader.onload = function(){console.log("Loading file " + uploadFile.name);};
		reader.onerror = function(){console.log("Oops! Try again.");};
		reader.readAsText(uploadFile);		
		reader.onloadend = loaded;

		// waiting until blob is fully loaded(see onloadend), store result in string
		function loaded(){
			var file = reader.result;
			
			// parseXML from text, store Material name and nkpoints in variables
			var textToXML = $.parseXML( file );
			var $xml = $( textToXML );
			var materialName = $xml.find('EssentialMacleodMaterial').attr('Name');
			var nkpoints = $xml.find('NKPoint');
			var notes = $xml.find('Notes');

			// Presenting the Data uploaded to the User -------------------
			var data = [];			
			for (i=0;i<nkpoints.length;i++){
				data[i] = [parseFloat($(nkpoints[i]).attr('W')).toFixed(1),parseFloat($(nkpoints[i]).attr('n')).toFixed(3), parseFloat($(nkpoints[i]).attr('k')).toFixed(6)]
			};
			$('div#dataTable').handsontable({ 
				data: data	
			});
			// Fill out head of table
//			$('table#materialTable').append('<tr><td colspan="3">'+ materialName + '</td></tr>');	
//			$('table#materialTable').append('<tr><td>Wavelength</td><td>Refractive Index</td><td>Extinction Coeff</td></tr>');
				
			// iterate through xml and fill out values for W,n, and k.
//			for (i=0; i<nkpoints.length; i++) {
//				$('table#materialTable').append('<tr><td>' + parseInt($(nkpoints[i]).attr('W')) + '</td><td>' + parseFloat($(nkpoints[i]).attr('n')).toFixed(3) + '</td><td>' + parseFloat($(nkpoints[i]).attr('k')).toFixed(6) + '</td></tr>');			
//			};
			// lastly, "Notes" section
//			$('table#materialTable').append('<tr><td colspan="3">' + notes.text() + '</td></tr>');
			// Now to get this into JSON format(see corresponding function)-------------------
			mtxToJSON(materialName,nkpoints,notes);

			// Display resulting JSON to output		
			$('textarea#output').val(JSON.stringify(newMaterial));
			// broaden scope of this material by attaching to materialData object. 
			// First save material name as string
			materialData.newMaterialName = materialName;
			//then save material object
			materialData[materialName] = newMaterial;
			
		};
	});
//--------------------------------------------------------------------------End Essential Macleod Import
//buttons-----------------------------------------------------------------------------------------------
	// Save button
	$('a#saveButton').click(function(event){
		event.preventDefault();
		var newMaterialName = materialData.newMaterialName;
		//If there is a file to save. Else,"hey no file."
		if (newMaterialName != undefined) {
			// And if we aren't overwriting a previous key
			if (localStorage.getItem(newMaterialName) == null){
				saveMaterial = JSON.stringify(materialData[newMaterialName]);
				localStorage.setItem(newMaterialName, saveMaterial);
				console.log("Saved new material file: " + newMaterialName);
			//If there is a difference between files, confirm user wants to overwrite file, else prompt for new name.
			} else { 
				var storedMaterial = localStorage.getItem(newMaterialName);
				saveMaterial = JSON.stringify(materialData[newMaterialName]);
				if (storedMaterial == saveMaterial) {
					console.log("File already saved.");
				} else {
					var decision = confirm("A different file by this name already exists in the database. Do you want to replace the file with this file?") 
					if (decision == true){
								localStorage.setItem(newMaterialName, saveMaterial);} else { 
						alert("Save file under different file name.");
						return false;
					}
				}
			}
 
		} else { console.log("error: No material to save")}
	});
	//Load Button	
});

	
