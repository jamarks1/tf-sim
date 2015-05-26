// trying to dynamically change either the QWOT or Physical thickness value
//based on if  a user changed either one

$('tbody tr').on('click',function(){
selection = this;
})

selection.cells[5].innerHTML = parseFloat(selection.cells[4].innerHTML) / (wavelength/4);

$('div.recipeTable').handsontable('setDataAtCell',0,5,.06);
$('div.recipeTable').handsontable('getDataAtRow',0);

$('tbody tr').on('click',function(){
selection = this;
index = $('tr').index(this)-1;
var row = $('div.recipeTable').handsontable('getDataAtRow',index);
var wavelength = $('#wavelength').val()
var ot = math.round((row[2]*row[4])/wavelength/4,3);
$('div.recipeTable').handsontable('setDataAtCell',index,5,ot);

})




var table = new Handsontable(dataContainer,options)

//A function that converts optical thickness to physical, or physical to 
//optical
//focusout wont attach directly to a table column, so i'm calling it on
//the document under the conditions that i'd want it to attach.
function updateThickness(){
   $(document).on('focusout',function(){      
   if ($('div.recipeTable').handsontable('getSelected') !== undefined) { 
      var columnNum = $('div.recipeTable').handsontable('getSelected')[1];    
      if (columnNum === 4 || columnNum === 5) {
         updateRowNK();
         var rowNum = $('div.recipeTable').handsontable('getSelected')[0];
         var wavelength = parseFloat($('#wavelength').val());
         console.log('4 or 5!!');
         var value = $('div.recipeTable').handsontable('getValue');
         var row = $('div.recipeTable').handsontable('getDataAtRow',rowNum);
      
         if (columnNum === 4){         
            var ot = math.round((row[2]*row[4])/(wavelength/4),3);
            $('div.recipeTable').handsontable('setDataAtCell',rowNum,5,ot);
         }
         if (columnNum === 5){
            var pt = math.round((row[5]*(wavelength/4))/row[2],2);
            $('div.recipeTable').handsontable('setDataAtCell',rowNum,4,pt);   
         }
         
         console.log('focusedout!!!');
         $(document).off('focusout','**');      
      }
   }
   });
};

function deleteRows(){
   if ($('div.recipeTable').handsontable('getSelected') !== undefined) {
      var row1 = $('div.recipeTable').handsontable('getSelected')[0];
      var row2 = $('div.recipeTable').handsontable('getSelected')[2];
      if (confirm("Delete selected row(s)?") === true) {
         recipeData.splice(row1,(row2-row1)+1);
         renderRecipeTable(recipeData);
      }
      
   }
};

function insertRows(){
   if ($('div.recipeTable').handsontable('getSelected') !== undefined) {
      var row1 = $('div.recipeTable').handsontable('getSelected')[0];
      var row2 = $('div.recipeTable').handsontable('getSelected')[2];
      for (var i = row1; i<=row2; i++){
         recipeData.splice(i,0,{"Thickness": "", "Layer": "", "Material":"", "n": "", "k": "","QWOT": ""});
         renderRecipeTable(recipeData);
      }    
   }  
};














