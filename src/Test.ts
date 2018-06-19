import * as hdsp from "./HDSP";
//console.log("-----------")
//const a = hdsp.PivotMDS.project(
//	[
//		[1,0,0,1,0,0,0,1],
//		[0,1,1,0,1,1,1,1],
//		[0,0,0,1,0,1,0,1]
//	],
//  4, 2);
//console.log(a);
//console.log("-----------")
//let b =
    // hdsp.Procrustes.align([[1,1],[4,1],[4,2]],[[2,0],[5,0],[5,1]]); // translate
    //console.log(hdsp.Procrustes.align([[1,1],[4,1],[4,2]],[[5,5],[35,5],[35,15]])); // translate & scale
//console.log(hdsp.Procrustes.align([[1,1],[4,1],[4,2]],[[5,5],[5,35],[15,35]])); // translate & scale & rotate
    //hdsp.Procrustes.align([[1,1],[4,1],[4,2]],[[1,-1],[4,-1],[4,-2]]); // mirror
//console.log(b);
//b = hdsp.Procrustes.align([[1,1],[1,4],[2,4]],[[1,-1],[4,-1],[4,-2]]); // mirror, rotate
//console.log(b);
//hdsp.Procrustes.transform([[20,20],[20,50],[30,50]],[[1,-1],[4,-1],[4,-2]]); // mirror, rotate, scale, transform
//hdsp.Procrustes.transform([[20,20],[20,50],[30,50]],[[20,20],[20,50],[30,50]]); // self
//console.log("-----------")

hdsp.Procrustes.transform(
    [[0,0],[0,-2],[-1,-1]],
    [[0,0],[0,2],[1,1]]
);