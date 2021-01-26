
export default class SparseTerm {

    public w_ij:number = 0;
    public w_ji:number = 0;

    constructor(public i: number, public j: number, public d: number) {

    }
}
