$(document).ready(function(){
	
	//hide table scrollbars
	var dataTableWidth = document.getElementById("dataTable").scrollWidth;
	document.getElementById("dataContainer").style.width = dataTableWidth + "px";
	
	//var recipeData = [];
	//var materialData = [{},{},{}]
	
	updateRecipeList();
        updateMaterialList();
        $('select#materialList').prop("selectedIndex",0);
	$('select#recipeList').prop("selectedIndex",0);
	
	$('div#output').append("___________________Thin Film Simulator___________________<br/> ready...<br/>");
	
	//Recipe environment or material environment
	$('a#Recipe').click(function(event){
		event.preventDefault();
		toggleRecipeTable();
	});
	
	$('a#Material').click(function(event){
		event.preventDefault();
		toggleMaterialTable();
		
	});
	
	

});

// Functions for setting environment----------------------------------------------------
function toggleRecipeTable() {
        $('div#dataTable').addClass('recipeTable');
        $('div#dataTable').removeClass('materialTable');
        
        renderRecipeTable(recipeData);
};

function toggleMaterialTable() {
        $('div#dataTable').addClass('materialTable');
        $('div#dataTable').removeClass('recipeTable');

        renderMaterialTable(materialData);
};

function updateOutput(message){
        $('div#output').append(message);
        var elem = document.getElementById('output');
        elem.scrollTop = elem.scrollHeight;
};

