
/*Global recipeData*/
recipeData = [];
/*Global materialData */
materialData = [];

$(document).ready(function(){
	
	//hide table scrollbars
	var dataTableWidth = document.getElementById("dataTable").scrollWidth;
	document.getElementById("dataContainer").style.width = dataTableWidth + "px";

	
	updateRecipeList();
        updateMaterialList();
       
	$('table.htCore tr').css('margin-top','14px');
	
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
        $('a#saveButton').addClass('recipeButton');
        $('a#saveButton').removeClass('materialButton');
        $('a#deleteButton').addClass('recipeButton');
        $('a#deleteButton').removeClass('materialButton');
        
        renderRecipeTable(recipeData);
};

function toggleMaterialTable() {
        $('div#dataTable').addClass('materialTable');
        $('div#dataTable').removeClass('recipeTable');
        $('a#saveButton').addClass('materialButton');
        $('a#saveButton').removeClass('recipeButton');
        $('a#deleteButton').addClass('materialButton');
        $('a#deleteButton').removeClass('recipeButton');
        
        renderMaterialTable(materialData);
};

function updateOutput(message){
        $('div#output').append(message);
        var elem = document.getElementById('output');
        elem.scrollTop = elem.scrollHeight;
};

