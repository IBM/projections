/**
 * @author Daniel Karl, IBM Research
 *
 * Literature:
 * Ortmann, Mark, Mirza Klimenta, and Ulrik Brandes. "A Sparse Stress Model."
 * International Symposium on Graph Drawing and Network Visualization. Springer, Cham, 2016.
 *
 * Zheng, Jonathan X., Samraat Pawar, and Dan FM Goodman. "Graph drawing by stochastic gradient descent."
 * IEEE transactions on visualization and computer graphics 25.9 (2018): 2738-2748.
 *
 */
import Edge from "./Edge";

import { FibonacciHeap } from '@tyriar/fibonacci-heap';
import SparseTerm from "./SparseTerm";
import {Utils} from "./Utils";

export class SparseMDSSGD {

    /**
     * Project a sparse matrix into `D` dimensions.
     *
     * @param n number of vertices
     * @param m number of edges
     * @param I edges: from vertices
     * @param J edges: to vertices
     * @param V edges: weights
     * @param D output dimensionality
     * @param p number of pivots
     * @param seed random seed
     * @param t_max maximum number of iterations (termination criteria)
     * @param eps minimum improvement (termination criteria)
     */
    static project = (
        n: number, m: number, I: number[], J: number[], V: number[], D:number,
        p: number, seed: number, t_max: number, eps: number
    ): number[][] => {
        let graph = SparseMDSSGD.buildGraphWeighted(n, m, I, J, V);
        let closest_pivots = SparseMDSSGD.maxmin_random_sp_weighted(graph, p, 0, seed);
        let terms = SparseMDSSGD.MSSP_weighted(graph, closest_pivots);
        let etas = SparseMDSSGD.schedule(terms, t_max, eps);
        let X = Utils.random2D(n, D);
        SparseMDSSGD.sgd(X, D, terms, etas, seed);
        return X;
    };

    private static sgd = (X: number[][], D: number, terms: Array<SparseTerm>, etas: Array<number>, seed: number):void => {
        for(let i_eta = 0; i_eta < etas.length; i_eta++) {
            let eta = etas[i_eta];
            SparseMDSSGD.fisheryates_shuffle(terms);

            let n_terms = terms.length;
            for(let i_term = 0; i_term < n_terms; i_term++) {
                let t = terms[i_term];
                let i = t.i;
                let j = t.j;
                let d_ij = t.d;
                // cap step size
                let mu_i = eta * t.w_ij;
                if(mu_i > 1) {
                    mu_i = 1;
                }
                // cap step size
                let mu_j = eta * t.w_ji;
                if(mu_j > 1) {
                    mu_j = 1;
                }
                let dx = X[i][0] - X[j][0];
                let dy = X[i][1] - X[j][1];
                let mag = Math.sqrt(dx * dx + dy * dy);
                let r = (mag - d_ij) / (2 * mag);
                let r_x = r * dx;
                let r_y = r * dy;

                X[i][0] -= mu_i * r_x;
                X[i][1] -= mu_i * r_y;
                X[j][0] -= mu_j * r_x;
                X[j][1] -= mu_j * r_y;
            }
        }
    };

    private static fisheryates_shuffle = (terms: Array<SparseTerm>):void => {
        let n = terms.length;
        for(let i = n-1; i >= 1; i--) {
            let j = SparseMDSSGD.random_int(0, i);
            let temp = terms[i];
            terms[i] = terms[j];
            terms[j] = temp;
        }
    };

    private static random_int = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    private static schedule = (terms: Array<SparseTerm>, t_max: number, eps: number):Array<number> => {
        let w_min = Number.MAX_VALUE;
        let w_max = Number.MIN_VALUE;
        for(let i = 0; i < terms.length; i++) {
            let term = terms[i];
            if(term.w_ij < w_min && term.w_ij !== 0) {
                w_min = term.w_ij;
            }
            if(term.w_ji < w_min && term.w_ji !== 0) {
                w_min = term.w_ji;
            }
            if(term.w_ij > w_max) {
                w_max = term.w_ij;
            }
            if(term.w_ji > w_max) {
                w_max = term.w_ji;
            }
        }
        let eta_max = 1.0 / w_min;
        let eta_min = eps / w_max;

        let lambda = Math.log(eta_max / eta_min) / (t_max - 1);

        // initializxe step sizes
        let etas = new Array<number>();
        for(let t = 0; t < t_max; t++) {
            etas.push(eta_max * Math.exp(-lambda * t));
        }
        return etas;
    };

    // not a proper MSSP because we get regions for free with maxmin_random_sp
    private static MSSP_weighted = (graph: Array<Array<Edge>>, closest_pivots: Array<number>):Array<SparseTerm> => {
        let n = graph.length;

        // get pivots and their regions, but in sets
        let regions = new Map<number, Set<number>>();
        let termsDict = new Map<number, Map<number, SparseTerm>>();

        for(let i = 0; i < n; i++) {
            if(!regions.has(closest_pivots[i])) {
                regions.set(closest_pivots[i], new Set<number>());
            }
            regions.get(closest_pivots[i]).add(i);
        }

        regions.forEach((value, p) => {
            let visited = new Array(n).fill(false);
            let d = new Array(n).fill(Number.MAX_VALUE); // init 'tentative' distances to infinity
            // edges are used 'invisibly' in this queue
            let pq = new FibonacciHeap<Edge, Edge>((a, b) => {
                return a.key.weight > b.key.weight ? 1 : a.key.weight < b.key.weight ? -1 : 0;
            });
            // init initial edges so that pivot-pivot term is avoided
            for(let i_edge = 0; i_edge < graph[p].length; i_edge++) {
                let e = graph[p][i_edge];

                // here the edge is not 'invisible'
                let next = e.target;
                let weight = e.weight;

                d[next] = weight; // init tentative value of d

                pq.insert(new Edge(next, d[next]));
            }
            d[p] = 0;
            visited[p] = true;
            // q2 contains visited vertices' distances for s calculation
            let q2 = new Array<number>();
            let s = 1;
            while(!pq.isEmpty()) {
                let current = pq.findMinimum().key.target;
                let d_pi = pq.findMinimum().key.weight;
                pq.extractMinimum();
                if(!visited[current]) { // ignore redundant elements in queue
                    visited[current] = true;
                    // empty the second queue enough to calculate s
                    while(q2.length > 0 && q2[0] <= d_pi/2) {
                        q2.shift();
                        s += 1;
                    }
                    if(value.has(current)) {
                        q2.push(d_pi);
                    }
                    let i = current;
                    if(i < p) {
                        if(!termsDict.has(i)) {
                            termsDict.set(i, new Map<number, SparseTerm>());
                        }
                        if(!termsDict.get(i).has(p)) {
                            termsDict.get(i).set(p, new SparseTerm(i, p, d_pi));
                        }
                        termsDict.get(i).get(p).w_ij = s / (d_pi * d_pi);
                    }
                    else {
                        if(!termsDict.has(p)) {
                            termsDict.set(p, new Map<number, SparseTerm>());
                        }
                        if(!termsDict.get(p).has(i)) {
                            termsDict.get(p).set(i, new SparseTerm(p, i, d_pi));
                        }
                        termsDict.get(p).get(i).w_ji = s / (d_pi * d_pi);
                    }

                    // update tentative distances
                    for(let i_edge = 0; i_edge < graph[current].length; i_edge++) {
                        let e = graph[current][i_edge];
                        // here the edge is not 'invisible'
                        let next = e.target;
                        let weight = e.weight;
                        if(d_pi + weight < d[next]) {
                            d[next] = d_pi + weight; // update tentative value of d
                            pq.insert(new Edge(next, d[next]));
                        }
                    }
                }
            }
        });

        // 1-stress
        for(let i = 0; i < n; i++) {
            for(let i_edge = 0; i_edge < graph[i].length; i_edge++) {
                let e = graph[i][i_edge];
                let j = e.target;
                let d_ij = e.weight;
                if(i < j) {
                    if(!termsDict.has(i)) {
                        termsDict.set(i, new Map<number, SparseTerm>());
                    }
                    if(!termsDict.get(i).has(j)) {
                        termsDict.get(i).set(j, new SparseTerm(i, j, d_ij));
                    }
                    else {
                        termsDict.get(i).get(j).d = d_ij;
                    }
                    termsDict.get(i).get(j).w_ij = termsDict.get(i).get(j).w_ji = 1 / (d_ij * d_ij);
                }
            }
        }
        let terms = new Array<SparseTerm>();
        termsDict.forEach((i_terms) => {
            i_terms.forEach((term) => {
                terms.push(term);
            });
        });
        return terms;
    };

    // returns closest pivot for each vertex, not pivots themselves
    private static maxmin_random_sp_weighted = (graph: Array<Array<Edge>>, n_pivots: number, p0: number, seed: number): Array<number> => {
        let n = graph.length;

        let mins = new Array(n).fill(Number.MAX_VALUE);
        let argmins = new Array(n).fill(-1);

        // first pivot
        mins[p0] = 0;
        argmins[p0] = p0;
        SparseMDSSGD.maxmin_bfs_weighted(graph, p0, mins, argmins);
        for(let i = 0; i < n; i++) {
            if(argmins[i] === -1) {
                throw new Error("graph has multiple connected components");
            }
        }

        // remaining pivots
        for (let i = 1; i < n_pivots; i++) {
            // choose pivots with probability min
            let min_total = 0;
            for(let j = 0; j < n; j++) {
                min_total += mins[j];
            }
            let sample = Math.random() * min_total; // TODO respect see in random function
            let cumul = 0;
            let argmax = -1;
            for(let j = 0; j < n; j++) {
                cumul += mins[j];
                if(cumul >= sample) {
                    argmax = j;
                    break;
                }
            }
            if(argmax === -1) {
                throw new Error("weighted pivot sampling failed");
            }
            mins[argmax] = 0;
            argmins[argmax] = argmax;
            SparseMDSSGD.maxmin_bfs_weighted(graph, argmax, mins, argmins);
        }
        return argmins;
    };

    private static maxmin_bfs_weighted = (graph: Array<Array<Edge>>, p: number, mins: Array<number>, argmins: Array<number>):void => {
        let n = graph.length;
        let visited = new Array(n).fill(false);
        let d = new Array(n).fill(Number.MAX_VALUE); // init 'tentative' distances to infinity

        // edges are used 'invisible' here
        let pq = new FibonacciHeap<Edge, Edge>((a, b) => {
            return a.key.weight > b.key.weight ? 1 : a.key.weight < b.key.weight ? -1 : 0;
        });

        d[p] = 0;
        pq.insert(new Edge(p, 0));

        while(!pq.isEmpty()) {
            let current = pq.findMinimum().key.target;
            let d_pi = pq.findMinimum().key.weight;
            pq.extractMinimum();

            if(!visited[current]) { // ignore redundant elements in queue
                visited[current] = true;

                if(d_pi < mins[current]) {
                    mins[current] = d_pi;
                    argmins[current] = p;
                }
                for(let i_edge = 0; i_edge < graph[current].length; i_edge++) {
                    let e = graph[current][i_edge];
                    // here the edge is not 'invisible'
                    let next = e.target;
                    let weight = e.weight;
                    if(d_pi + weight < d[next]) { // update tentative value of d
                        d[next] = d_pi + weight;
                        pq.insert(new Edge(next, d[next]))
                    }
                }
            }
        }
    };

    private static buildGraphWeighted = (n: number, m: number, I: number[], J: number[], V: number[]): Array<Array<Edge>> => {
        let undirected = new Array<Map<number, number>>(n); // used to make graph undirected in case is not already
        let graph = new Array<Array<Edge>>(n);

        for (let ij = 0; ij < m; ij++) {
            let i = I[ij], j = J[ij];
            if(i >= n || j >= n) {
                throw new Error("i or j bigger than n");
            }
            let v = V[ij];
            if(v <= 0) {
                throw new Error("edge length less than or equal to 0");
            }
            // init data structures if not seen node so far
            if(!undirected[i]) {
                undirected[i] = new Map<number, number>();
            }
            if(!undirected[j]) {
                undirected[j] = new Map<number, number>();
            }
            if(!graph[i]) {
                graph[i] = new Array<Edge>();
            }
            if(!graph[j]) {
                graph[j] = new Array<Edge>();
            }
            // process edge
            if(i !== j && !undirected[j].get(i)) { // if key not there
                undirected[i].set(j, v);
                undirected[j].set(i, v);
                graph[i].push(new Edge(j, v));
                graph[j].push(new Edge(i, v));
            } else {
                if(undirected[j].get(i) !== v) {
                    throw new Error("graph edge lengths not symmetric");
                }
            }
        }
        return graph;
    };
}
