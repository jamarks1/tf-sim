//Material.js

$(document).ready(function () {
	
	var dataTableWidth = document.getElementById("dataTable").scrollWidth;
	document.getElementById("dataContainer").style.width = dataTableWidth + "px";
	

	// materialData will have other material objects attached to it
	var materialData = {};
	var data = [];


	// get the saved local materials
	updateSaved();


	// Initialize data table
	$('div.materialTable').handsontable({
		startRows: 19,
		startCols: 3,
		colHeaders: ["Wavelength", "Refractive Index", "Extinction Coefficient"],
		minSpareRows: 1		
	});
		
	// Initialize graph
	$.plot($('div#graph'), [0,0]);

//Importing from Essential Macleod----------------------------------------------------------------------
	$('#upload').change(function () {

		// remove the previous table
		//var data = [];
		$('div#output').val("");

		// upload file chosen from input, make a Filereader, read file as text
		var uploadFile = $('#upload').get(0).files[0];
		var reader = new FileReader();
		reader.onload = function(){$('div#output').append("Loading file " + uploadFile.name + '<br/>');};
		reader.onerror = function(){$('div#output').append("Oops! Try again. <br/>");};
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
			$('div.materialTable').handsontable({ 
				data: data	
			});

			// Now to get this into JSON format(see corresponding function)-----------------
			mtxToJSON(materialName,nkpoints,notes);
			
			// Display resulting JSON to output		
			//$('div#output').append(JSON.stringify(newMaterial));
			updateGraph(data);
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
		var materialName = "material." + $('#materialTitle').val();
		//If there is a file to save. Else,"hey no file."
		if (materialName != "material.") {
			// And if we aren't overwriting a previous key
			if (localStorage.getItem(materialName) == null){
				saveMaterial = JSON.stringify(materialData[materialName.slice(9)]);
				localStorage.setItem(materialName, saveMaterial);
				$('div#output').append("Saved new material file: " + materialName + "<br/>");
				updateSaved();
				
			//If there is a difference between files, confirm user wants to overwrite file, else prompt for new name.
			} else { 
				var storedMaterial = localStorage.getItem(materialName);
				saveMaterial = JSON.stringify(materialData[materialName]);

				if (saveMaterial == undefined) {
					$('div#output').append("File already saved. <br/>");
				} else {
					var decision = confirm("A different file by this name already exists in the database. Do you want to replace the file with this file?") 
					if (decision == true){
								localStorage.setItem(materialName, saveMaterial);} else { 
						alert("Save file under different file name.");
						return false;
					}
				}
			}

		} else { $('div#output').append("error: No material to save <br/>")}
	});
	//Calculate Button
	$('#calcButton').click(function(event){
		event.preventDefault();
		// Name of file will change according to user input
		var materialName = "material." + $('#materialTitle').val();
		//turn data table to json.
		dataTableToJSON(materialName,data);
		
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
		var materialName = "material." + $('select#savedList option:selected').val();
		$('#materialTitle').val(materialName.slice(9));
		var jsonData = $.parseJSON(localStorage.getItem(materialName));
		data.length = jsonData.Indices.length;
		$('div#output').append("Loading: " + materialName.slice(9) + "<br/>");
		newMaterial = new material(materialName);
		for (i=0; i<jsonData.Indices.length; i++){
		data[i]= [jsonData.Indices[i]['lambda'], jsonData.Indices[i]['n'], jsonData.Indices[i]['k']];		
		};
		$('div.materialTable').handsontable({ 
				data: data	
		});
		//$('div#output').append(JSON.stringify(jsonData));
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
		var materialName = "material." + $('select#savedList option:selected').val();
		var decision = confirm("Are you sure you'd like to delete " + materialName.slice(9));
		if (decision == true) {
			localStorage.removeItem(materialName);
			$('div#output').append(materialName.slice(9) + " was deleted.</br>")
			updateSaved();		
		} else {$('div#output').append("Material was not deleted.")}
	});
});

	
