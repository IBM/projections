/**
 * This computes registration parameters for an optimal affine transformation
 * between 2 matched point sets towards the least squared error.
 * <p>
 * The implementation is based on <br />
 * <i> Chang, Shih-Hsu, et al.
 * "Fast algorithm for point pattern matching: invariant to translations, rotations and scale changes."
 * Pattern recognition 30.2 (1997): 311-320.</i>
 * </p>
 * 
 * @author Daniel Weidele (dkweidel@us.ibm.com)
 * @version 03/16/2018
 */
export class Prokrustes
{
	// public static demo = () => {
	// 	let A:Point2D[] = [new Point2D(1,1), new Point2D(5,7)];
	// 	let B:Point2D[] = [new Point2D(8,11), new Point2D(8,9)];
	// 	console.log(Prokrustes.e(Prokrustes.t(A, Prokrustes.r(A, B)), B) < 0.000001 ? "SUCCESS" : "FAIL");
	// }

	private static toPoint2D = (A:number[][]):Point2D[] => {
		let points:Point2D[] = [];
		A.forEach((a, index) => {
			points.push(new Point2D(a[0], a[1]));
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

	/*
	 * Optimally translate, scale and rotate and input point cloud `A` to a given point cloud `B`.
	 * @param A input point cloud
	 * @param B target point cloud
         */
	static transform = (A: number[][], B: number[][]):number[][] => {
		let A_p = Prokrustes.toPoint2D(A);
    	return Prokrustes.toArray(Prokrustes.t(A_p, Prokrustes.r(A_p, Prokrustes.toPoint2D(B))));
	}

	/**
	 * Computes the Registration parameters of an affine transformation
	 * that leads to least squared error between A and B. The lists of points
	 * must be equal in length. Points are matched according to positions in
	 * their respective lists.
	 * 
	 * @param A
	 *            list of points to match to B
	 * @param B
	 *            list of points to matched by A
	 * @return Registration parameters of the transformation that leads
	 *         to least squared error between A and B
	 */
	private static r = (A: Point2D[], B: Point2D[]): Registration =>
	{
		let k = A.length;
		let m_xa = 0, m_ya = 0, m_xb = 0, m_yb = 0, lAPlusB = 0, lAMinusB = 0, lA = 0;
		for (let i = 0; i < k; i++)
		{
			m_xa += A[i].x;
			m_ya += A[i].y;
			m_xb += B[i].x;
			m_yb += B[i].y;
			lAPlusB += A[i].x * B[i].x + A[i].y * B[i].y;
			lAMinusB += A[i].x * B[i].y - A[i].y * B[i].x;
			lA += Math.pow(A[i].x, 2) + Math.pow(A[i].y, 2);
		}
		let det = k * lA - Math.pow(m_xa, 2) - Math.pow(m_ya, 2);
		let r = new Registration();
		r.tx = (lA * m_xb - m_xa * lAPlusB + m_ya * lAMinusB) / det;
		r.ty = (lA * m_yb - m_ya * lAPlusB - m_xa * lAMinusB) / det;
		r.sct = (-m_xa * m_xb - m_ya * m_yb + k * lAPlusB) / det;
		r.sst = (m_ya * m_xb - m_xa * m_yb + k * lAMinusB) / det;
		return r;
	}

	/**
	 * Applies the affine transformation based on the Registration
	 * parameters.
	 * 
	 * @param A
	 *            the list of points to be transformed
	 * @param r
	 *            the Registration parameters
	 * @return a copy of transformed points A
	 */
	private static t = (A:Point2D[], r:Registration):Point2D[] =>
	{
		let T:Point2D[] = [];
		A.forEach((a, index) => {
			T.push(
				new Point2D(
					r.tx + a.x * r.sct - a.y * r.sst, // x
					r.ty + a.y * r.sct + a.x * r.sst  // y
				)
			);
		});
		return T;
	}

	///**
	// * Computes the least squared error between point sets A and B. The lists
	// * must have equal length.
	// * 
	// * @param A
	// *            list of points
	// * @param B
	// *            list of points
	// * @return the least squared error between A and B
	// */
	//private static e = (A:Point2D[], B:Point2D[]):number => {
	//	let k = A.length;
	//	let e = 0;
	//	for (let i = 0; i < k; i++)
	//	{
	//		e += Math.sqrt(Math.pow(A[i].x - B[i].x, 2) + Math.pow(A[i].y - B[i].y, 2));
	//	}
	//	return e;
	//}
}

class Point2D {
	constructor(public x:number, public y:number){}
}

/**
 * Registration parameters for an affine transformation.
 * 
 * @author Daniel Weidele (dkweidel@us.ibm.com)
 * @version 03/16/2018
 */
class Registration
{
	tx: number;
	ty: number;
	sct: number;
	sst: number;

	///**
	// * Getter for x translation
	// * 
	// * @return x translation for the affine transformation
	// */
	//getTx = ():number =>
	//{
	//	return this.tx;
	//}

	///**
	// * Getter for y translation
	// * 
	// * @return y translation for the affine transformation
	// */
	//getTy = ():number =>
	//{
	//	return this.ty;
	//}

	///**
	// * Getter for scaling
	// *
	// * @return scaling
	// */
	//getScaling = ():number =>
	//{
	//	return Math.sqrt(Math.pow(this.sct, 2) + Math.pow(this.sst, 2));
	//}

	///**
	// * Getter for rotation (in degrees)
	// *
	// * @return rotation (in degrees)
	// */
	//getRotation = ():number =>
	//{
	//	return this.toDegrees(Math.acos(this.sct / this.getScaling()));
	//}

	//private toDegrees = (angle):number => {
  	//	return angle * (180 / Math.PI);
  	//}
}
