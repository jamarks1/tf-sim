//These functions have now been incorporated into calculations.js 



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

//Next step is to calculate reflectance/transmission
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
      var num = math.chain(math.round(math.pow(math.subtract(x,u),2),5))
                    .subtract(math.round(math.pow(math.subtract(y,v),2),5))
                    .done();
      var den = math.chain(math.round(math.pow(math.add(x,u),2),5))
                    .subtract(math.round(math.pow(math.add(y,v),2),5))
                    .done();
      var R = parseFloat(math.round(math.divide(num,den),4));
      reflectance.push(R);     
   }
   return reflectance;      
}

   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   

