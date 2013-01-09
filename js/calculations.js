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

        var Index1 = ((loWavelength/ w) * loIndex);

	var Extinction1 = ((loWavelength/ w) * loExtinction);
	var Index2 = ((1-(loWavelength/ w)) * hiIndex);
		
	var Extinction2 = ((1-(loWavelength/ w)) * hiExtinction);
	var Index = Math.round((Index1 + Index2)*1000)/1000;
	var Extinction = Math.round((Extinction1 + Extinction2)*1000000)/1000000;

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
phase difference and j = sqrt(-1) is an imaginary number (which cancels out if 
θ equals 0).*/

function calcMatrix () {
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
                                    
function multiplyMatrices();
