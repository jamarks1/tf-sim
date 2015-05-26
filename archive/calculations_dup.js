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
        var xMin = parseInt($('input#rangeXMin').val());
        var xMax = parseInt($('input#rangeXMax').val());
        var interval = parseInt($('input#interval').val());
        //Make array to hold phase shift data for each layer
        var phaseArray = [];
        
        for (i=0; i < recipeData.length; i++) {
                if (recipeData[i].Material && recipeData[i].Thickness) {
                        
                        var phaseDiff = [];
                        var wavelength = [];
                        var Index = [];
                        for ( var w= xMin; w< xMax; w+=interval){
                
                                //get the corresponding material file, parse it
                                var materialName = recipeData[i].Material;
                                var jsonString = localStorage.getItem(materialName);
                                var data = JSON.parse(jsonString);
                                
                                // Gets the Index and extinction of material at a given wavelength. 
                                // Taking into account dispersion of material between data points.
                                // See corresponding function.
                                var  n = getIndexAndK(w,data)[0];
                                var t = recipeData[i].Thickness;
                                var phase = (2 * Math.PI / w) * n * t;
                                phaseDiff.push(phase);
                                wavelength.push(w);
                                Index.push(n);
                                  
                        }
                phaseArray.push([wavelength, Index, phaseDiff]);
                }
                
        }
        return phaseArray;
        
};

/* Next we make a characteristic matrix for each thin film.    Matrix = |A B|
                                                                        |C D| 
Where A = cos ð, B = (j / n) * sin ð, C = j * n * sin ð, D = cos ð. ð is the 
phase difference. j^2 = -1 is an imaginary number. To handle this we will
make an imaginary class*/
function imaginary (real,imaginary) {
        this.real = real;
        this.imaginary = imaginary;
        
        
};

function calcMatrix() {
        //the phase difference array coupled with wavelength reference
        var phaseData = phaseDifference();
        
        var matrixArray = [];
        
        // in phaseData[i][1][i] is an Index value, [i][2][i] is the phaseDiff
        for (i = 0; i < phaseData.length; i++) {
                //the matrix expressions
                var A = [];
                var B = [];
                var C = [];
                var D = [];
                
                
                for (j = 0; j < phaseData[0][2].length; j++) {
                        var phaseDiff = phaseData[i][2][j];
                        var a = Math.cos(phaseDiff);
                        A.push(a);
                        D.push(a); // in matrix expression A = D
                        var n = phaseData[i][1][j];
                        // See ComplexNumber.js for more info. Thank you Jan
                        // Hartigan for making this class.
                        var b = (1 / n) * Math.sin(phaseDiff);
                        B.push(b);
                        var c = n * Math.sin(phaseDiff);
                        C.push(c);
                        
                }
                matrixArray.push([A , B, C, D]);
        }
        return matrixArray;
};

/* After deriving the matrix for each layer, we multiply the layers. Starting
with last layer, then second to last, etc (Ln * Ln-1 * Ln-2 ... Li). A 2 by 2
matrix is multiplied by the pattern | (A1*A2)+(B1*C2) (A1*B2)+(B1*D2) |
                                    | (C1*A2)+(D1*C2) (C1*B2)+(D1*D2) | */
                                    
function multiplyMatrices() {
        
        var matrixArray = calcMatrix();
        
        
        //empty array to hold the product of matrices
        var productMatrix = [];
        var numlayers = matrixArray.length
          
        var a = 0;
        var b = 1;
        var c = 2;
        var d = 3;
        // For only 1 layer, no multiplication is necessary
        if (numlayers > 1) {
                // First multiplication is last layer and second to last layer
                // When ever b and c are multiplied, imaginary = -1
                for (j=0 ; j < matrixArray[0][0].length ; j++) {
                        var A = (matrixArray[numlayers-1][a][j] * matrixArray[numlayers-2][a][j]) + -(matrixArray[numlayers-1][b][j] * matrixArray[numlayers-2][c][j]);
                        var B = (matrixArray[numlayers-1][a][j] * matrixArray[numlayers-2][b][j]) + (matrixArray[numlayers-1][b][j] * matrixArray[numlayers-2][d][j]);
                        var C = (matrixArray[numlayers-1][c][j]* matrixArray[numlayers-2][a][j]) + (matrixArray[numlayers-1][d][j] * matrixArray[numlayers-2][c][j]);
                        var D = -(matrixArray[numlayers-1][c][j] * matrixArray[numlayers-2][b][j]) + (matrixArray[numlayers-1][d][j] * matrixArray[numlayers-2][d][j]);
                productMatrix.push([A,B,C,D]);
                }
                
                // Subsequent layers are multiplied by product
                for (i = numlayers-3; i >= 0; i--) {
                        
                        for (j=0 ; j < matrixArray[0][0].length ; j++) {
                                productMatrix[j][a] = (productMatrix[j][a] * matrixArray[i][a][j]) + -(productMatrix[j][b] * matrixArray[i][c][j]);
                                productMatrix[j][b] = (productMatrix[j][a] * matrixArray[i][b][j]) + (productMatrix[j][b] * matrixArray[i][d][j]);
                                productMatrix[j][c] = (productMatrix[j][c] * matrixArray[i][a][j]) + (productMatrix[j][d] * matrixArray[i][c][j]);
                                productMatrix[j][d] = -(productMatrix[j][c] * matrixArray[i][b][j]) + (productMatrix[j][d] * matrixArray[i][d][j]);
                        }
                }
                return productMatrix;
        } else {
                for (j=0 ; j < matrixArray[0][0].length ; j++) {
                         productMatrix.push([matrixArray[0][a][j],matrixArray[0][b][j],matrixArray[0][c][j],matrixArray[0][d][j]]);
                }
        }
        return productMatrix;
};



/* Reflectance will be derived from the elements of the matrix and maxwells equation. 
R = (x-u)^2 + (y-v)^2 / (x+u)^2 + (y+v)^2, where x= no*A (no is index of incident 
medium, air = 1.0), y = no*ns*B (ns is index of emergent medium, or substrate), 
u = ns*D, and v = C */

function calculateReflectance(){
        var productMatrix = multiplyMatrices();
        var reflectance = [];
        var wavelength = [];
        var no = 1.0;
        var ns = parseFloat($('input#substrate').val());
        
        // to keep symbolism of formula, for readability
        var a = 0;
        var b = 1;
        var c = 2;
        var d = 3;
        
        for (i=0; i < productMatrix.length; i++){
                var x = no * productMatrix[i][a];
                var y = no * ns * productMatrix[i][b];
                var u = ns * productMatrix[i][d];
                var v = productMatrix[i][c];
                
                var R1 = Math.pow(x - u,2) + Math.pow(y - v,2) 
                var R2 = Math.pow(x + u,2) + Math.pow(y + v,2);
                var R = (R1/R2);
                reflectance.push(R);
        }
        return reflectance;
};


function reflectivityGraph(){
        var reflectance = calculateReflectance();
        var wavelength = phaseDifference()[0][0];
        
        var datasets = [];
        
        //Construct individual arrays for n and k data
        for (i = 0 ; i < wavelength.length; i++) {
               datasets.push([wavelength[i],reflectance[i]*100]);
        }
        $.plot($('div#graph'),[datasets]);
        
        
        
};
