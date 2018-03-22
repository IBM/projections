/**
 * @author Daniel K. Weidele, IBM Research
 */
export class Utils {
	static array2D = (M:number, N:number):number[][] => {
		let result:number[][] = [];
		for(let m = 0; m < M; m++) {
			result.push(new Array(N));
		}
		return result;
	}

	static array = (N:number):number[] => {
		let result:number[] = [];
		for(let n = 0; n < N; n++) {
			result.push(0);
		}
		return result;
	}
}