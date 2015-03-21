 // calculations.js
/* Code for handling the thin film calculations. */

//------------------------------------------------------------------------------
// First we get the Index and extinction of material at a given wavelength. 
// Taking into account dispersion of material between data points.
function getIndexAndK(w,data) {
   var hiWavelength = 0;
   var hiIndex = 0;
   var loWavelength = 0; 
   var loIndex = 0;
   var hiExtinction = 0;
	var loExtinction = 0;
				
   for (j = 0; j < data.Indices.length; j++) {
                
      if (data.Indices[j].lambda <= w && (loWavelength === 0 || loWavelength < data.Indices[j].lambda)) {
         loWavelength = data.Indices[j].lambda;
         loIndex = data.Indices[j].n;
         loExtinction = data.Indices[j].k;		
	   }

      if (data.Indices[j].lambda >= w && (hiWavelength === 0 || hiWavelength > data.Indices[j].lambda)) {
         hiWavelength = data.Indices[j].lambda;
         hiIndex = data.Indices[j].n;
         hiExtinction = data.Indices[j].k;				
         }
   };

	// Closer data point is the wavelength, higher proportion used.
	// But if LoWavelength is the highest number, It's proportion should be 1. 
	if (hiIndex == 0) {
      loWavelength = w;
	}
	
   if (loIndex == 0) {
      hiWavelength = w;
   }
	
	var diff = hiWavelength - loWavelength;
	// if difference is 0 (i.e. loWavelength = hiWavelength). We can just
	// take either hiIndex or loIndex as the final Index
      if (diff != 0) {
         var Index1 = (1 - (( w - loWavelength ) / diff)) * loIndex;
         var Extinction1 = ((loWavelength/ w) * loExtinction);
         var Index2 = (1 - (( hiWavelength - w ) / diff)) * hiIndex;
         var Extinction2 = ((1-(loWavelength/ w)) * hiExtinction);
         var Index = Index1 + Index2;
         var Extinction = Math.round((Extinction1 + Extinction2)*1000000)/1000000;
         	        
        } else {
            var Index = hiIndex;
            var Extinction = hiExtinction;
        }     
        return [Index, Extinction];
}

/* Then we must calculate Phase Difference of wave at boundary,
 ð = (2π/λ)(n)(t)(cosθ) where λ is wavelength, n is index, t is physical 
 thickness of film, and θ is angle of incidence (in radians) */ 

function phaseDifference() {
   // get user defined params for range and interval
   var xMin = parseFloat($('input#rangeXMin').val());
   var xMax = parseFloat($('input#rangeXMax').val());   
   var interval = parseFloat($('input#interval').val());

   //Make array to hold phase shift data for each layer
   var phaseArray = []; 
       
   for (i=0; i < recipeData.length; i++) {
      if (recipeData[i].Material && recipeData[i].Thickness) {      
         var phaseDiff = [];
         var wavelength = [];
         var Index = [];
         //convert aoi to radians
         var aoi = parseFloat($('input#aoi').val()) * (math.pi/180); 
         for ( var w= xMin; w< xMax; w+=interval){               
            //get the corresponding material file, parse it
            var materialName = recipeData[i].Material;
            var jsonString = localStorage.getItem(materialName);
            var data = JSON.parse(jsonString);
                                         
            if ($('select#waveUnits').val() === "microns") {
               w = w * 1000;
            } //convert to nanometers if microns is selected
            // Gets the Index and extinction of material at a given wavelength. 
            // Taking into account dispersion of material between data points.
            // See corresponding function.
            var  n = getIndexAndK(w,data)[0];
            var t = recipeData[i].Thickness;
            var phase = (2 * Math.PI / w) * n * t * math.cos(aoi);
            phaseDiff.push(phase);
            if ($('select#waveUnits').val() === "microns") {
               w = w / 1000;
            }// convert back into microns if microns is selected
            wavelength.push(w);
            Index.push(n);                                  
         }
         phaseArray.push([wavelength, Index, phaseDiff]);
      }              
   }
   return phaseArray;       
};

/* This is mainly a note to myself: an Alternative way is to multiply matrices 
using the math.js functions. First we need to make a simple array of all the
 matrices (instead of using the complexNumber object we'll use the math.js math.
complex(real,imaginary) function. Then we'll use the math.js built in matrix 
multiplication method.*/

/* Next we make a characteristic matrix for each thin film.    Matrix = |A B|
                                                                        |C D| 
Where A = cos ð, B = (j / n) * sin ð, C = j * n * sin ð, D = cos ð. ð is the 
phase difference as defined above. j is an imaginary number (j^2 = -1).*/

/*the layer Matrices will take the form [[[{A1},{B1}],[{C1},{D1}]},
[[{A2},{B2}],[{C2},{D2}]],...[[{An},{Bn}],[{Cn},{Dn}]]] for each layer
*/
function layerMatrices() {
   var phaseData = phaseDifference();
   var matrixLayers = [];
   //for each layer
   for (i = 0; i < phaseData.length; i++) {
      
      var matrixArray = [];      
      var A = "";
      var B = "";
      var C = "";
      var D = "";
      // for each wavelength
      for (j = 0; j < phaseData[0][2].length; j++) {
         var phaseDiff = phaseData[i][2][j];
         var n = phaseData[i][1][j];
         
         A = math.complex(Math.cos(phaseDiff),0);
         B = math.complex(0,(1 / n) * Math.sin(phaseDiff));
         C = math.complex(0,n * Math.sin(phaseDiff));
         D = math.complex(Math.cos(phaseDiff),0);
         matrixArray.push([[A,B],[C,D]]);
         };
      matrixLayers.push(matrixArray);  
   }
   return matrixLayers;   
};

/*Multiply all the the matrices for each film in a given wavelength 
together, returning one product matrix for each wavelength
Since light will enter last layer in the film first, layers will be multiplied
Ln...*L3*L2*L1.*/
function matrixMultiply() {
   var matrixLayers = layerMatrices();
   var productMatrix = [];
   if (matrixLayers.length > 1){
      for (var l = matrixLayers.length-1; l>= 0; l--){
         //matrixLayers array is organized by [Layer][wavelength], then the 
         //matrix components
         var layer = matrixLayers[l];
         for (var w = 0; w < layer.length; w++){
            var ab = layer[w][0];
            var cd = layer[w][1];
            var matrix1 = math.matrix([ab,cd]); 
         /*multiply the last two layers to populate the productMatrix, then 
         use multiply each subsequent matrix layer by the product matrix */         
         if (matrixLayers.length-1 === l){
            var nextLayer = matrixLayers[l-1];
            var ab2 = nextLayer[w][0];
            var cd2 = nextLayer[w][1];
            var matrix2 = math.matrix([ab2,cd2]);
            productMatrix[w] = math.multiply(matrix1,matrix2);
            //if last wavelength has been multiplied, move on to 3rd to last l
            if (w=== layer.length-1){
               l = l -1;
            }
         }
         //All layers after 2nd to last will be multiplied by the product matrix
         else {
            productMatrix[w] = math.multiply(productMatrix[w],matrix1);
         }        
         }             
      }
   }
   //if there is only 1 layer, matrix1 is the only matrix to calculate
   else {
      var layer = matrixLayers[0];
      for (var w = 0; w < matrixLayers[0].length; w++){
         var ab = layer[w][0];
         var cd = layer[w][1];
         var matrix1 = math.matrix([ab,cd]);
         productMatrix[w] = matrix1;  
      }  
   }
   return productMatrix;
};

//Next step is to calculate reflectance/transmission/OD value
/* Reflectance will be derived from the elements of the matrix and maxwells 
equation. R = (x-u)^2 + (y-v)^2 / (x+u)^2 + (y+v)^2, where x= no*A (no is index 
of incident medium, air = 1.0), y = no*ns*B (ns is index of emergent medium, or 
substrate), u = ns*D, and v = C */

function calculate(){
   var productMatrix = matrixMultiply();
   var reflectance = [];
   var no = 1.0;
   var ns = parseFloat($('input#substrate').val());
   
   //for each wavelength find matrix values a-d, then calculate x,y,u,v based
   //on above formula.    
   for (var w = 0; w < productMatrix.length; w++){
      var value = productMatrix[w].valueOf();
      var a = value[0][0];
      var b = value[0][1];
      var c = value[1][0];
      var d = value[1][1];
      
      var x = math.multiply(no,a);
      var y = math.multiply(math.multiply(no,ns),b);
      var u = math.multiply(ns,d);
      var v = c;
      
      //calculate reflectance
      //using the math.js api for calculations.
      var num = math.chain(math.round(math.pow(math.subtract(x,u),2),8))
                    .subtract(math.round(math.pow(math.subtract(y,v),2),8))
                    .done();
      var den = math.chain(math.round(math.pow(math.add(x,u),2),8))
                    .subtract(math.round(math.pow(math.add(y,v),2),8))
                    .done();
      var R = parseFloat(math.round(math.divide(num,den),8));
      //Look at Y axis selection and formulate 
      if ($('select#y-axis').val()==="R"){
         reflectance.push(R*100);     
         }
      else if ($('select#y-axis').val()==="T"){
         reflectance.push((1-R)*100);
      }
      else if ($('select#y-axis').val()==="OD"){
         reflectance.push(-math.log10(1-R));
      }
     
   }
   
   return reflectance;      
}

function graph(){
   var reflectance = calculate();
   var wavelength = phaseDifference()[0][0];
   var datasets = [];
   //convert xaxis to wavenumber if selected
   if ($('select#x-axis').val() === "wavenumber"){
       switch ($('select#waveUnits').val()) {
         case "microns":
            for (var i = 0; i<wavelength.length; i++){
               wavelength[i] = 10000/wavelength[i];
            };
            break;
         case "nanometers":
             for (var i = 0; i<wavelength.length; i++){
               wavelength[i] = 10000000/wavelength[i];
            };
            break; 
       }  
   }  
   for (i = 0 ; i < wavelength.length; i++) {
         datasets.push([wavelength[i],reflectance[i]]);
   } 
   // The Graph
   $.plot($('div#graph'),[datasets],{
   //if wavenumber selected, don't display x by numerical order (default of flot.js)
      xaxis: {transform: function (v) { 
         if ($('select#x-axis').val() === "wavenumber"){
            return -v;
         }
         else {
            return v;
         }
         }}
    }); 
              
};
