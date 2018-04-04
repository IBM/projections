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
const b = hdsp.Prokrustes.transform([[-1,0],[1,0],[1,1]],[[1,0],[-1,0],[-1,-1]]);
console.log(b);
console.log("-----------")