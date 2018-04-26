/**
 * @author Daniel K. Weidele, IBM Research
 */
export class Utils {
	static array2D = (M:number, N:number):number[][] => {
		let result:number[][] = [];
		for(let m = 0; m < M; m++) {
			result.push(Utils.fillArray(N, 0));
		}
		return result;
	}

	static array(N:number):number[] {
		return Utils.fillArray<number>(N, 0);
	}

	static fillArray<T>(N:number, value:T):T[] {
	    let result:T[] = [];
		for(let n = 0; n < N; n++) {
			result.push(value);
		}
		return result;
    }
}