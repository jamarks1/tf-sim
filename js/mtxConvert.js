
$(document).ready(function(){
	
	$('#upload').change( function(){

		// remove the previous table
		$('table#materialTable').empty();
		$('textarea#materialJSON').val("");
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

// Presenting the Data uploaded to the User -------------------------------------------------------
			// Fill out head of table
			$('table#materialTable').append('<tr><td colspan="3">'+ materialName + '</td></tr>');	
			$('table#materialTable').append('<tr><td>Wavelength</td><td>Refractive Index</td><td>Extinction Coeff</td></tr>');
				
			// iterate through xml and fill out values for W,n, and k.
			for (i=0; i<nkpoints.length; i++) {
				$('table#materialTable').append('<tr><td>' + parseInt($(nkpoints[i]).attr('W')) + '</td><td>' + parseFloat($(nkpoints[i]).attr('n')).toFixed(3) + '</td><td>' + parseFloat($(nkpoints[i]).attr('k')).toFixed(6) + '</td></tr>');			
			};
			// lastly, "Notes" section
			$('table#materialTable').append('<tr><td colspan="3">' + notes.text() + '</td></tr>');
// Now to get this into JSON format --------------------------------------------------------------
			//Make a new material from material class, make array length equal to data points
			materialData.newMaterial = new material(materialName);
			materialData.newMaterial.Indices.length = nkpoints.length;
			
			
			// iterate through xml. Yes I know. Not DRY :P Need to keep this seperate in my head for now.
			for (i=0; i<nkpoints.length; i++) {
					materialData.newMaterial.Indices[i] = {"lambda": parseInt($(nkpoints[i]).attr('W')), "n": parseFloat($(nkpoints[i]).attr('n')).toFixed(3), "k": parseFloat($(nkpoints[i]).attr('k')).toFixed(6)};	
			}

			// We should get and fill in the Notes data as well.
			materialData.newMaterial.Notes = notes.text();
			// Display resulting JSON
			$('#materialJSON').val(JSON.stringify(materialData.newMaterial));
		};
	});
});
