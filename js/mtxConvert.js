//Material.js

$(document).ready(function () {

	// materialData will have other material objects attached to it
	var materialData = {};
	var data = [];


	// get the saved local materials
	updateSaved();

	// Initialize data table
	$('div#dataTable').handsontable({
			startRows: 19,
			startCols: 3,
			colHeaders: ["Wavelength", "Refractive Index", "Extinction Coefficient"]
					
		});

//Importing from Essential Macleod----------------------------------------------------------------------
	$('#upload').change(function () {

		// remove the previous table
		//var data = [];
		$('textarea#output').val("");

		// upload file chosen from input, make a Filereader, read file as text
		var uploadFile = $('#upload').get(0).files[0];
		var reader = new FileReader();
		reader.onload = function(){console.log("Loading file " + uploadFile.name);};
		reader.onerror = function(){console.log("Oops! Try again.");};
		reader.readAsText(uploadFile);		
		reader.onloadend = loaded;

		// waiting until blob is fully loaded, store result in string
		function loaded(){
			var file = reader.result;
			
			// parseXML from text, store Material name and nkpoints in variables
			var textToXML = $.parseXML( file );
			var $xml = $( textToXML );
			var materialName = $xml.find('EssentialMacleodMaterial').attr('Name');
			var nkpoints = $xml.find('NKPoint');
			var notes = $xml.find('Notes').text();

			// Presenting the Data uploaded to the user in data table -------------------
			$('#materialTitle').val(materialName);
			data.length = nkpoints.length;			
			for (i=0;i<nkpoints.length;i++){
				data[i] = [Math.round(parseFloat($(nkpoints[i]).attr('W'))*10)/10,Math.round(parseFloat($(nkpoints[i]).attr('n'))*1000)/1000, Math.round(parseFloat($(nkpoints[i]).attr('k'))*1000000)/1000000]
			};
			//data.push(notes); todo
			$('div#dataTable').handsontable({ 
				data: data	
			});

			// Now to get this into JSON format(see corresponding function)-----------------
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
				updateSaved();
				
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
	//Calculate Button
	$('#calcButton').click(function(event){
		event.preventDefault();
		// Name of file will change according to user input
		var materialName = $('#materialTitle').val();
		//turn data table to json.
		dataTableToJSON(materialName,data);
		$('textarea#output').val(JSON.stringify(newMaterial));
		updateGraph(data);

		// broaden scope of this material by attaching to materialData object. 
		// First material name as string
		materialData.newMaterialName = materialName;

		//then material object
		materialData[materialName] = newMaterial;
		
	})
	//Load Button
	$('#loadButton').click(function(event){
		event.preventDefault();
		var materialName = $('select#savedList option:selected').val();
		$('#materialTitle').val(materialName);
		var jsonData = $.parseJSON(localStorage.getItem(materialName));
		data.length = jsonData.Indices.length;
		console.log("Loading: " + materialName);
		newMaterial = new material(materialName);
		for (i=0; i<jsonData.Indices.length; i++){
		data[i]= [jsonData.Indices[i]['lambda'], jsonData.Indices[i]['n'], jsonData.Indices[i]['k']];		
		};
		$('div#dataTable').handsontable({ 
				data: data	
		});
		$('textarea#output').val(JSON.stringify(jsonData));
		updateGraph(data);
		// broaden scope of this material by attaching to materialData object. 
		// First save material name as string
		materialData.newMaterialName = materialName;
		//then save material object
		materialData[materialName] = newMaterial;
		
	});
	//Delete Button
	$('#deleteButton').click(function(event){
		event.preventDefault();
		var materialName = $('select#savedList option:selected').val();
		var decision = confirm("Are you sure you'd like to delete " + materialName);
		if (decision == true) {
			localStorage.removeItem(materialName);
			console.log(materialName + " was deleted.")
			updateSaved();		
		} else {console.log("Material was not deleted.")}
	});
});

	
