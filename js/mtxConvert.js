
$(document).ready(function(){

	// materialData will have other material objects attached to it
	var materialData = {};

//Importing from Essential Macleod----------------------------------------------------------------------
	$('#upload').change( function(){

		// remove the previous table
		$('table#materialTable').empty();
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
			// Fill out head of table
			$('table#materialTable').append('<tr><td colspan="3">'+ materialName + '</td></tr>');	
			$('table#materialTable').append('<tr><td>Wavelength</td><td>Refractive Index</td><td>Extinction Coeff</td></tr>');
				
			// iterate through xml and fill out values for W,n, and k.
			for (i=0; i<nkpoints.length; i++) {
				$('table#materialTable').append('<tr><td>' + parseInt($(nkpoints[i]).attr('W')) + '</td><td>' + parseFloat($(nkpoints[i]).attr('n')).toFixed(3) + '</td><td>' + parseFloat($(nkpoints[i]).attr('k')).toFixed(6) + '</td></tr>');			
			};
			// lastly, "Notes" section
			$('table#materialTable').append('<tr><td colspan="3">' + notes.text() + '</td></tr>');
			// Now to get this into JSON format ------------------------------------------
			mtxToJSON(materialName,nkpoints,notes);

			// Display resulting JSON to output		
			$('textarea#output').val(JSON.stringify(newMaterial));
			// broaden scope of this material by attaching to materialData object
			materialData.newMaterialName = materialName;
			console.log(materialData);
			materialData[materialName] = newMaterial;
			console.log(materialData);
		};
	});
//--------------------------------------------------------------------------End Essential Macleod Import
//buttons-----------------------------------------------------------------------------------------------
	// Save button
	$('a#saveButton').click(function(){
		event.preventDefault();
		var newMaterialName = materialData.newMaterialName;
		saveMaterial = JSON.stringify(materialData[newMaterialName]);
		localStorage.setItem(newMaterialName, saveMaterial);
		console.log("Saved new material file: " + newMaterialName);
		
	});	
});
