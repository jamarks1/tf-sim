//Environment.js
/*Global recipeData*/
recipeData = [];
/*Global materialData */
materialData = [];

$(document).ready(function(){
	
	//hide table scrollbars
	var dataTableWidth = document.getElementById("dataTable").scrollWidth;
	document.getElementById("dataContainer").style.width = dataTableWidth + "px";

	//Update and display saved items in environment container
	updateRecipeList();
   updateMaterialsList();
        
        // Initialize graph
	$.plot($('div#graph'), [0,0]);
       
	//$('table.htCore tr').css('margin-top','14px');
	
	$('div#output').append("___________________Thin Film Simulator___________________<br/> ready.....<br/>");
	
	//On units change. Change units listed in scan range and interval to selection
	//Also, convert current values to more sane values under new units
   $('#waveUnits').on('change',function(){
      $('span.xUnit').text($('#waveUnits').val());
      if ($('#waveUnits').val()==="microns"){
         var wave = $('#wavelength').val()/1000;
         $('#wavelength').val(wave);
         var xMin = $('#rangeXMin').val()/1000;
         $('#rangeXMin').val(xMin);
         var xMax = $('#rangeXMax').val()/1000;
         $('#rangeXMax').val(xMax);
         var interval = parseFloat($('#interval').val())/100;
         $('#interval').val(interval);
      }
      else if ($('#waveUnits').val()==="nanometers"){
         var wave = $('#wavelength').val()*1000;
         $('#wavelength').val(wave);
         var xMin = $('#rangeXMin').val()*1000;
         $('#rangeXMin').val(xMin);
         var xMax = $('#rangeXMax').val()*1000;
         $('#rangeXMax').val(xMax);
         var interval = parseFloat($('#interval').val())*100;
         $('#interval').val(interval);
      }
      
   });
	
	//Recipe environment or material environment, toggle displays for
	//Settings and environment
	$('a#Recipe').click(function(event){
		event.preventDefault();
		toggleRecipeTable();
		$('div#recipeContainer').slideToggle();
		$('div#materialContainer').slideToggle();
	});
	
	$('a#Material').click(function(event){
		event.preventDefault();
		toggleMaterialTable();
		$('div#materialContainer').slideToggle();
		$('div#recipeContainer').slideToggle();
	});
	
        $('a#Settings').click(function(event){
                event.preventDefault();
                $('div#settingsContainer').slideToggle();
        });
        
        $('a#Environment').click(function(event){
                event.preventDefault();
       
        });

});

// Functions for settings environment----------------------------------------------------
// toggleClass wasn't working well for this. 
function toggleRecipeTable() {
        $('div#dataTable').addClass('recipeTable');
        $('div#dataTable').removeClass('materialTable');
        $('a#saveButton').addClass('recipeButton');
        $('a#saveButton').removeClass('materialButton');
        $('a#deleteButton').addClass('recipeButton');
        $('a#deleteButton').removeClass('materialButton');
        $('a#plotButton').addClass('recipeButton').removeClass('materialButton');

        renderRecipeTable(recipeData);
};

function toggleMaterialTable() {
        $('div#dataTable').addClass('materialTable');
        $('div#dataTable').removeClass('recipeTable');
        $('a#saveButton').addClass('materialButton');
        $('a#saveButton').removeClass('recipeButton');
        $('a#deleteButton').addClass('materialButton');
        $('a#deleteButton').removeClass('recipeButton');
        $('a#plotButton').addClass('materialButton').removeClass('recipeButton');
        
        renderMaterialTable(materialData);
};


//Scroll output to bottom with each append
function updateOutput(message){
        $('div#output').append(message);
        var elem = document.getElementById('output');
        elem.scrollTop = elem.scrollHeight;
};

