/**
 * @author Daniel K. Weidele, IBM Research
 */
import {PowerMethod, Decomposition} from "./PowerMethod";
import {Utils} from "./Utils";
export class PivotMDS {
	
	/**
	 * Project a feature space into `D` dimensions.
	 * @param featureVectors the feature vectors
	 * @param K the number of pivots
	 * @param D the output dimensionality
	 * @return
	 */
	static project = (featureVectors: number[][], K:number, D:number): number[][] => {
		if(featureVectors == null) {
			return null;
		}
		let N = featureVectors.length;
		// empty input
		if(N == 0) {
			return [];
		}
		K = Math.min(N, K);
		let distances:number[][] = PivotMDS.distance(featureVectors);
		let result:number[][] = Utils.array2D(N, D);
		let C:number[][] = Utils.array2D(K, N);
		for (let k = 0; k < K; k++) {
			for (let n = 0; n < N; n++) {
				C[k][n] = distances[k][n] * distances[k][n];
			}
		}
		let rMeans:number[] = Utils.array(K);
	    let cMeans: number[] = Utils.array(N);
	    let mean = 0;
	    for (let k = 0; k < K; k++) {
	    	for (let n = 0; n < N; n++) {
	    		rMeans[k] += C[k][n];
	    		cMeans[n] += C[k][n];
	    		mean += C[k][n];
	    	}
	    	rMeans[k] /= N;
	    }
	    for (let n = 0; n < N; n++) {
	    	cMeans[n] /= K;
	    }
	    mean /= K * N;
	    for (let k = 0; k < K; k++) {
	    	for (let n = 0; n < N; n++) {
	    		C[k][n] = -.5 * (C[k][n] - rMeans[k] - cMeans[n] + mean);
	    	}
	    }
    	let decomposition:Decomposition = PowerMethod.singularValueDecomposition(C, D);
    	let eVals:number[] = decomposition.values;
    	let eVecs:number[][] = decomposition.vectors;
	    for (let i = 0; i < eVecs.length; i++) {
	    	let scale = Math.sqrt(eVals[i]);
	    	// fix degeneracy for low intrinstic dimensionality
	    	if(isNaN(scale)) {
	    		scale = 0;
	    	}
	    	for (let j = 0; j < eVecs[0].length; j++) {
	    		// fix degeneracy for low intrinsic dimenstionality
	    		if(isNaN(eVecs[i][j])) {
	    			eVecs[i][j] = 0;
	    		}
	    		eVecs[i][j] *= scale;
	    	}
	    }
	    for (let n = 0; n < N; n++) {
	    	for (let d = 0; d < D; d++) {
	    		result[n][d] = eVecs[d][n];
	    	}
	    }
		return result;
	}

	private static distance = (featureVectors: number[][]): number[][] => {
		let N = featureVectors.length;
		let result:number[][] = Utils.array2D(N, N);
		for(let n = 0; n < N; n++) {
			for(let m = 0; m <= n; m++) {
				result[n][m] = result[m][n] = PivotMDS.euclidean(featureVectors[n], featureVectors[m]);
			}
		}
		return result;	
	}

	private static euclidean = (u:number[], v:number[]): number => {
		let sum:number = 0;
		for(let i = 0; i < u.length; i++) {
			sum += Math.pow(u[i] - v[i], 2);
		}
		return Math.sqrt(sum);
	}
}
