/**
 * This computes registration parameters for an optimal affine transformation
 * between 2 matched point sets towards the least squared error.
 * <p>
 * The implementation is based on <br />
 * <i>Ross, Amy. "Procrustes analysis." Course report, Department of Computer Science and Engineering,
 * University of South Carolina (2004).</i>
 * </p>
 * 
 * @author Daniel Weidele (dkweidel@us.ibm.com)
 * @version 06/18/2018
 */
export class Procrustes
{
	// public static demo = () => {
	// 	let A:Point2D[] = [new Point2D(1,1), new Point2D(5,7)];
	// 	let B:Point2D[] = [new Point2D(8,11), new Point2D(8,9)];
	// 	console.log(Procrustes.e(Procrustes.t(A, Procrustes.r(A, B)), B) < 0.000001 ? "SUCCESS" : "FAIL");
	// }

	private static toPoint2D = (A:number[][], mirror:boolean):Point2D[] => {
		let points:Point2D[] = [];
		A.forEach((a, index) => {
			if(mirror) {
				points.push(new Point2D(a[0], -a[1]));
			} else {
				points.push(new Point2D(a[0], a[1]));
			}
		});
		return points;
	}

	private static toArray = (A:Point2D[]):number[][] => {
		let points:number[][] = [];
		A.forEach((a, index) => {
			points.push([a.x, a.y]);
		});
		return points;
	}

	private static mean = (A:Point2D[]):Point2D => {
	    let mean:Point2D = new Point2D(0,0);
	    A.forEach((a, index) => {
	        mean.x += a.x;
	        mean.y += a.y;
        });
	    mean.x /= A.length;
	    mean.y /= A.length;
	    return mean;
    }

    private static center = (A:Point2D[]):number => {
	    let mean:Point2D = Procrustes.mean(A);
	    let scale:number = 0;
	    A.forEach((a, index) => {
	        a.x -=  mean.x;
	        a.y -=  mean.y;
	        scale += a.x * a.x;
	        scale += a.y * a.y;
        });
	    return Math.sqrt(scale / A.length);
    }

    private static scale = (A:Point2D[], scale:number):void => {
        A.forEach((a, index) => {
            a.x /= scale;
            a.y /= scale;
        });
    }

    private static rotate = (A:Point2D[], B:Point2D[], angle?:number):void => {
	    //let a = Procrustes.toArray(A);
	    //let b = Procrustes.toArray(B);
	    //let MM_ = Utils.product(Utils.transpose(b), a);
	    //let M_M = Utils.transpose(MM_);
        //let U:Decomposition = PowerMethod.singularValueDecomposition(MM_, 2);
        //let V:Decomposition = PowerMethod.singularValueDecomposition(M_M, 2);
        //let X = Utils.product(Utils.transpose(U.vectors), Utils.transpose(V.vectors));
        //return Utils.product(a, X);
        let theta:number;
        if(angle == null) {
            let n: number = 0, d: number = 0;
            for (let i = 0; i < A.length; i++) {
                n += A[i].x * B[i].y - A[i].y * B[i].x;
                d += A[i].x * B[i].x + A[i].y * B[i].y;
            }
            theta = Math.atan(n / d);
            if(theta < 0) {
                theta = Math.PI + theta;
            }
            console.log(`recorded theta is ${theta * (180 / Math.PI)}`);
        }
        else {
            theta = angle * (Math.PI / 180);
        }
        let x = 0, y = 0;
        for(let i = 0; i < A.length; i++) {
            x = Math.cos(theta) * A[i].x - Math.sin(theta) * A[i].y;
            y = Math.sin(theta) * A[i].x + Math.cos(theta) * A[i].y;
            A[i].x = x;
            A[i].y = y;
        }
    }

    public static transform = (A:number[][], B:number[][]):number[][] => {
	    let A_p = Procrustes.toPoint2D(A, false);
	    let A_p_m = Procrustes.toPoint2D(A, true);
	    let B_p = Procrustes.toPoint2D(B, false);
	    Procrustes.scale(A_p, Procrustes.center(A_p));
	    Procrustes.scale(B_p, Procrustes.center(B_p));
	    Procrustes.scale(A_p_m, Procrustes.center(A_p_m));
	    let A_p_r = Procrustes.copy(A_p);
	    Procrustes.rotate(A_p, B_p);
	    Procrustes.rotate(A_p_r, B_p, 180);
	    let A_p_m_r = Procrustes.copy(A_p_m);
	    Procrustes.rotate(A_p_m, B_p);
	    Procrustes.rotate(A_p_m_r, B_p, 180);
	    let d:number = Procrustes.distance(A_p, B_p);
	    let d_r:number = Procrustes.distance(A_p_r, B_p);
	    let d_m:number = Procrustes.distance(A_p_m, B_p);
	    let d_m_r:number = Procrustes.distance(A_p_m_r, B_p);
	    let min = Math.min(d, Math.min(d_r, Math.min(d_m, d_m_r)));
        console.log(min);
	    if(d == min) {
			return Procrustes.toArray(A_p);
		}
		else if(d_r == min) {
			return Procrustes.toArray(A_p_r);
		}
		else if(d_m == min) {
	        return Procrustes.toArray(A_p_m);
        }
        else if(d_m_r == min) {
            return Procrustes.toArray(A_p_m_r);
        }
        else {
	        return null;
        }
    }

    private static copy = (A:Point2D[]):Point2D[] => {
	    let copy:Point2D[] = [];
	    for(let a of A) {
	        copy.push(new Point2D(a.x, a.y));
        }
        return copy;
    }

	/**
	 * Computes the procrustes distance between point sets A and B. The lists
	 * must have equal length.
	 * 
	 * @param A
	 *            list of points
	 * @param B
	 *            list of points
	 * @return the least squared error between A and B
	 */
	private static distance = (A:Point2D[], B:Point2D[]):number => {
		let k = A.length;
		let e = 0;
		for (let i = 0; i < k; i++)
		{
			e += Math.sqrt(Math.pow(A[i].x - B[i].x, 2) + Math.pow(A[i].y - B[i].y, 2));
		}
		return e;
	}

    // private static print = (A:number[][], desc:string):void => {
	 //    console.log("******************************)");
	 //    console.log(desc);
	 //    console.log("******************************)");
	 //    for(let i = 0; i < A.length; i++) {
	 //        console.log(A[i]);
    //     }
    //     console.log("******************************)");
    // }
}

class Point2D {
	constructor(public x:number, public y:number){}
}
