
// Display material table
function renderMaterialTable(materialData) {
	$('div.materialTable').handsontable({
		startRows: 19,
		Cols: 3,
		colHeaders: ["Wavelength", "Refractive Index", "Extinction Coefficient"],
		minSpareRows: 1,
		columns: [{data: "Wavelength"},
			{data: "Refractive Index"},
			{data: "Extinction Coefficient"}],
		cells: function(row,col,prop){
			var cellProperties={}
			cellProperties.readOnly = false;
		},
		data: materialData
	});
}
