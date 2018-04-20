import * as hdsp from "./HDSP";
console.log("-----------")
const a = hdsp.PivotMDS.project(
	[
		[1,0,0,1,0,0,0,1],
		[0,1,1,0,1,1,1,1],
		[0,0,0,1,0,1,0,1]
	],
    4, 2);
console.log(a);
console.log("-----------")
let b = hdsp.Prokrustes.transform([[1,1],[4,1],[4,2]],[[1,-1],[4,-1],[4,-2]]); // mirror
console.log(b);
b = hdsp.Prokrustes.transform([[1,1],[1,4],[2,4]],[[1,-1],[4,-1],[4,-2]]); // mirror, rotate
console.log(b);
b = hdsp.Prokrustes.transform([[20,20],[20,50],[30,50]],[[1,-1],[4,-1],[4,-2]]); // mirror, rotate, scale, transform
console.log(b);
console.log("-----------")