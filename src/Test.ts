import * as hdsp from "./HDSP";
console.log("-----------")
const a = hdsp.PivotMDS.project(
	[
		[1,0,2],
      	[0,1,1],
      	[0,0,0]
    ], 
    4, 2);
console.log(a);
console.log("-----------")
const b = hdsp.Prokrustes.transform([[1,2],[2,2]],[[2,3],[3,4]]);
console.log(b);
console.log("-----------")