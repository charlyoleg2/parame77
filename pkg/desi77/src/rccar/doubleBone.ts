// doubleBone.ts
// combined suspension bones of the rccar

import type {
	tContour,
	//tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	tPageDef
	//tExtrude
	//tSubInst
	//tSubDesign
} from 'geometrix';
import {
	//withinZeroPi,
	//withinHPiHPi,
	//ShapePoint,
	//point,
	//contour,
	contourCircle,
	//ctrRectangle,
	//figure,
	degToRad,
	//radToDeg,
	ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
	pSectionSeparator,
	//transform2d,
	//transform3d,
	//EExtrude,
	//EBVolume,
	initGeom
} from 'geometrix';
//import { triLALrL, triALLrL, triLLLrA } from 'triangule';
//import { triALLrL } from 'triangule';
import type { tContourJ, Facet, tJunc, tJuncs, tHalfProfile } from 'sheetfold';
import {
	tJDir,
	tJSide,
	contourJ,
	facet,
	//contourJ2contour,
	//facet2figure,
	sheetFold
} from 'sheetfold';

const pDef: tParamDef = {
	partName: 'doubleBone',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1', 'mm', 30, 1, 500, 1),
		pNumber('D2', 'mm', 70, 1, 500, 1),
		pNumber('L1', 'mm', 300, 10, 1000, 1),
		pNumber('L2', 'mm', 200, 10, 1000, 1),
		pNumber('E1', 'mm', 40, 1, 1000, 1),
		pSectionSeparator('Side'),
		pNumber('W1', 'mm', 30, 1, 500, 1),
		pNumber('P2', '%', 50, 0, 99, 1),
		pNumber('W2', 'mm', 10, 1, 500, 1),
		pSectionSeparator('Top'),
		pNumber('S1', 'mm', 20, 1, 100, 1),
		pNumber('S2', 'mm', 20, 1, 100, 1),
		pNumber('S3', 'mm', 20, 1, 100, 1),
		pNumber('R3', 'mm', 10, 0, 1000, 1),
		pSectionSeparator('Wing width'),
		pNumber('P11', '%', 8, 0, 90, 1),
		pNumber('P12', '%', 20, 0, 90, 1),
		pNumber('P21', '%', 18, 0, 90, 1),
		pNumber('P22', '%', 20, 0, 90, 1),
		pSectionSeparator('Folding'),
		pNumber('T1', 'mm', 2, 0.5, 10, 0.1),
		pNumber('Jangle', 'degree', 90, 30, 120, 1),
		pNumber('Jradius', 'mm', 10, 0.1, 50, 0.1),
		pNumber('Jneutral', '%', 50, 0, 100, 1),
		pNumber('Jmark', 'mm', 2, 0.1, 10, 0.1),
		pNumber('Jradius2', 'mm', 4, 0.1, 50, 0.1),
		pNumber('Jmark2', 'mm', 2, 0.1, 10, 0.1)
	],
	paramSvg: {
		D1: 'doubleBone_face.svg',
		D2: 'doubleBone_face.svg',
		L1: 'doubleBone_face.svg',
		L2: 'doubleBone_top.svg',
		E1: 'doubleBone_top.svg',
		W1: 'doubleBone_face.svg',
		P2: 'doubleBone_side.svg',
		W2: 'doubleBone_side.svg',
		S1: 'doubleBone_top.svg',
		S2: 'doubleBone_top.svg',
		S3: 'doubleBone_top.svg',
		R3: 'doubleBone_side.svg',
		P11: 'doubleBone_top.svg',
		P12: 'doubleBone_top.svg',
		P21: 'doubleBone_top.svg',
		P22: 'doubleBone_top.svg',
		T1: 'doubleBone_folding.svg',
		Jangle: 'doubleBone_folding.svg',
		Jradius: 'doubleBone_folding.svg',
		Jneutral: 'doubleBone_folding.svg',
		Jmark: 'doubleBone_folding.svg',
		Jradius2: 'doubleBone_folding.svg',
		Jmark2: 'doubleBone_folding.svg'
	},
	sim: {
		tMax: 200,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	//const figBone = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const pi = Math.PI;
		const pi2 = pi / 2;
		const W1 = param.W1;
		const W12 = W1 / 2;
		const R12 = param.D1 / 2;
		const R22 = param.D2 / 2;
		const boneLen = param.L1 + 2 * R22;
		const dX2 = R22 ** 2 - W12 ** 2;
		if (dX2 < 0) {
			throw `err086: D2 ${ffix(param.D2)} is too small compare to W1 ${ffix(param.W1)} mm`;
		}
		const dX = Math.sqrt(dX2);
		const L1b = param.L1 - 2 * dX;
		const Rh = (W12 * param.P2) / 100;
		const hX1 = param.W2 + 2 * Rh;
		const N2 = Math.max(Math.floor((param.L1 - 2 * R22 - param.W2) / hX1), 0);
		const W2b = (param.L1 - 2 * R22 - N2 * 2 * Rh) / (N2 + 1);
		const hX0b = R22 + W2b + Rh;
		const hX1b = W2b + 2 * Rh;
		const aJa = degToRad(param.Jangle);
		const aJn = param.Jneutral / 100;
		const aJr = param.Jradius;
		const aJm = param.Jmark;
		const aJr2 = param.Jradius2;
		const aJm2 = param.Jmark2;
		const cornerSizeExt = aJr + param.T1 * (1 - aJa);
		const cornerSizeInt = aJr - param.T1 * aJa;
		const cornerSizeInt2 = aJr2 - param.T1 * aJa;
		const L2b = param.L2 - 2 * cornerSizeExt;
		const L2c = L2b + 2 * cornerSizeInt - 2 * param.E1;
		const L2d = (L2b - L2c) / 2;
		const N2c = Math.max(Math.floor((L2c - param.W2) / hX1), 0);
		const W2c = (L2c - N2c * 2 * Rh) / (N2c + 1);
		const hX0c = W2c + Rh;
		const hX1c = W2c + 2 * Rh;
		const L1i = L1b - 2 * param.S2;
		const L2i = L2b - 2 * param.S1;
		function calcInnerTri(iW: number, iH: number, iDW: number): [number, number] {
			const rA = Math.atan2(iH, iW);
			const rInitDist = iDW / Math.sin(rA);
			return [rA, rInitDist];
		}
		const [tri1a, tri1d0] = calcInnerTri(L2i, L1i, param.S3 / 2);
		const tri11L = L2i - 2 * tri1d0;
		const [tri2a, tri2d0] = calcInnerTri(L1i, L2i, param.S3 / 2);
		const tri21L = L1i - 2 * tri2d0;
		function calcSplitTri(iL: number, iP: number): [number, number] {
			if (iL < 0) {
				throw `err559: iL ${ffix(iL)} is negative mm`;
			}
			let rLside = iL;
			let rLcenter = 0;
			if (iP > 0) {
				const pr = iP / 100;
				rLcenter = pr * iL;
				rLside = (iL - rLcenter) / 2;
			}
			return [rLside, rLcenter];
		}
		const [tri11s, tri11c] = calcSplitTri(tri11L, param.P11);
		const tri12L = tri11L / (2 * Math.cos(tri1a));
		const [tri12s, tri12c] = calcSplitTri(tri12L, param.P12);
		const [tri21s, tri21c] = calcSplitTri(tri21L, param.P21);
		const tri22L = tri21L / (2 * Math.cos(tri2a));
		const [tri22s, tri22c] = calcSplitTri(tri22L, param.P22);
		const wingH = param.W1 / 2 + cornerSizeInt - cornerSizeInt2;
		// step-5 : checks on the parameter values
		if (R22 < R12) {
			throw `err085: D2 ${ffix(param.D2)} is too small compare to D1 ${ffix(param.D1)} mm`;
		}
		if (L1b < 0) {
			throw `err095: L1 ${ffix(param.L1)} is too small compare to D2 ${ffix(param.D2)} mm`;
		}
		if (param.E1 < cornerSizeInt) {
			throw `err151: E1 ${ffix(param.E1)} is too small compare to Jradius ${ffix(param.Jradius)} mm`;
		}
		if (L2c < 0) {
			throw `err150: L2 ${ffix(param.L2)} is too small compare to E1 ${ffix(param.E1)} mm`;
		}
		// step-6 : any logs
		rGeome.logstr += `Bone length ${ffix(boneLen)} mm\n`;
		rGeome.logstr += `Bone with N2 ${N2} holes of diameter ${ffix(2 * Rh)} and W2b ${ffix(W2b)} mm\n`;
		rGeome.logstr += `Side with N2c ${N2c} holes of diameter ${ffix(2 * Rh)} and W2c ${ffix(W2c)} mm\n`;
		// step-7 : drawing of the figures
		// sub-function
		// facet faBone1 faBone2
		function makeCtrBone(iJ1: string, iJ2: string): tContourJ {
			const rCtr = contourJ(dX, W12)
				.addPointR(-dX - R22, -W12)
				.addPointR(0, -2 * W12)
				.addSegArc2()
				.startJunction(iJ1, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(L1b, 0)
				.addPointR(dX + R22, W12)
				.addPointR(0, 2 * W12)
				.addSegArc2()
				.startJunction(iJ2, tJDir.eB, tJSide.eABRight)
				.closeSegStroke();
			return rCtr;
		}
		const ctrAxis1 = contourCircle(0, 0, R12);
		const ctrAxis2 = contourCircle(param.L1, 0, R12);
		const ctrMinis: tContour[] = [];
		if (Rh > 0) {
			for (let ii = 0; ii < N2; ii++) {
				ctrMinis.push(contourCircle(hX0b + ii * hX1b, 0, Rh));
			}
		}
		const ctrBone1 = makeCtrBone('J1', 'J2');
		const ctrBone2 = makeCtrBone('J3', 'J4');
		const faBone1 = facet([ctrBone1, ctrAxis1, ctrAxis2, ...ctrMinis]);
		const faBone2 = facet([ctrBone2, ctrAxis1, ctrAxis2, ...ctrMinis]);
		// facet faPlate1 faPlate2
		function makeCtrPlate(iJ1: string, iJ2: string, idx: number): tContourJ {
			const tJ1 = `J${idx}1`;
			const tJ2 = `J${idx}2`;
			const rCtr = contourJ(0, 0)
				.addSegStrokeR(L2d, 0)
				.startJunction(tJ1, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(L2c, 0)
				.addSegStrokeR(L2d, 0);
			if (iJ2 !== '') {
				rCtr.startJunction(iJ2, tJDir.eA, tJSide.eABLeft);
			}
			rCtr.addSegStrokeR(0, L1b)
				.addSegStrokeR(-L2d, 0)
				.startJunction(tJ2, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(-L2c, 0)
				.addSegStrokeR(-L2d, 0)
				.startJunction(iJ1, tJDir.eB, tJSide.eABRight)
				.closeSegStroke();
			return rCtr;
		}
		const ctrPlate1 = makeCtrPlate('J1', '', 1);
		const ctrPlate2 = makeCtrPlate('J3', 'J2', 2);
		function makeCtrTri(
			jn: string,
			x0: number,
			y0: number,
			r0: number,
			ia: number,
			t1s: number,
			t1c: number,
			t2s: number,
			t2c: number
		): tContourJ {
			const ctr = contourJ(x0, y0).addCornerRounded(param.R3).addSegStrokeR(t1s, 0);
			if (t1c > 0) {
				ctr.startJunction(`${jn}1`, tJDir.eA, tJSide.eABRight)
					.addSegStrokeR(t1c, 0)
					.addSegStrokeR(t1s, 0);
			}
			const a2 = pi - ia;
			ctr.addCornerRounded(param.R3).addSegStrokeRP(a2, t2s);
			if (t2c > 0) {
				ctr.startJunction(`${jn}2`, tJDir.eA, tJSide.eABRight)
					.addSegStrokeRP(a2, t2c)
					.addSegStrokeRP(a2, t2s);
			}
			const a3 = pi + ia;
			ctr.addCornerRounded(param.R3).addSegStrokeRP(a3, t2s);
			if (t2c > 0) {
				ctr.startJunction(`${jn}3`, tJDir.eA, tJSide.eABRight)
					.addSegStrokeRP(a3, t2c)
					.addSegStrokeRP(a3, t2s);
			}
			const rCtr = ctr.rotate(x0, y0, r0);
			return rCtr;
		}
		const x04 = param.S1 + tri1d0;
		const y04 = param.S2;
		const ctrTri14 = makeCtrTri('J14', x04, y04, 0, tri1a, tri11s, tri11c, tri12s, tri12c);
		const ctrTri24 = makeCtrTri('J24', x04, y04, 0, tri1a, tri11s, tri11c, tri12s, tri12c);
		const x02 = L2b - param.S1 - tri1d0;
		const y02 = L1b - param.S2;
		const ctrTri12 = makeCtrTri('J12', x02, y02, pi, tri1a, tri11s, tri11c, tri12s, tri12c);
		const ctrTri22 = makeCtrTri('J22', x02, y02, pi, tri1a, tri11s, tri11c, tri12s, tri12c);
		const x01 = L2b - param.S1;
		const y01 = param.S2 + tri2d0;
		const ctrTri11 = makeCtrTri('J11', x01, y01, pi2, tri2a, tri21s, tri21c, tri22s, tri22c);
		const ctrTri21 = makeCtrTri('J21', x01, y01, pi2, tri2a, tri21s, tri21c, tri22s, tri22c);
		const x03 = param.S1;
		const y03 = L1b - param.S2 - tri2d0;
		const ctrTri13 = makeCtrTri('J13', x03, y03, -pi2, tri2a, tri21s, tri21c, tri22s, tri22c);
		const ctrTri23 = makeCtrTri('J23', x03, y03, -pi2, tri2a, tri21s, tri21c, tri22s, tri22c);
		const faPlate1 = facet([ctrPlate1, ctrTri14, ctrTri12, ctrTri11, ctrTri13]);
		const faPlate2 = facet([ctrPlate2, ctrTri24, ctrTri22, ctrTri21, ctrTri23]);
		// facet faSide1 faSide2
		function makeCtrSide(iJ1: string): tContourJ {
			const rCtr = contourJ(0, 0)
				.addSegStrokeR(L2c, 0)
				.addSegStrokeR(0, param.W1)
				.startJunction(iJ1, tJDir.eB, tJSide.eABRight)
				.addSegStrokeR(-L2c, 0)
				.closeSegStroke();
			return rCtr;
		}
		const ctrMinics: tContour[] = [];
		if (Rh > 0) {
			for (let ii = 0; ii < N2c; ii++) {
				ctrMinics.push(contourCircle(hX0c + ii * hX1c, W12, Rh));
			}
		}
		const faSide1 = facet([makeCtrSide('J11'), ...ctrMinics]);
		const faSide2 = facet([makeCtrSide('J12'), ...ctrMinics]);
		// facet wings
		const Jwings: string[] = [];
		const faWings: Facet[] = [];
		//Jwings.push(...['J111', 'J112', 'J113']);
		//Jwings.push(...['J121', 'J122', 'J123']);
		//Jwings.push(...['J131', 'J132', 'J133']);
		//Jwings.push(...['J141', 'J142', 'J143']);
		//Jwings.push(...['J211', 'J212', 'J213']);
		//Jwings.push(...['J221', 'J222', 'J223']);
		//Jwings.push(...['J231', 'J232', 'J233']);
		//Jwings.push(...['J241', 'J242', 'J243']);
		//for (const iJ of Jwings) {
		const tri13 = [tri21c, tri22c, tri22c];
		const tri24 = [tri11c, tri12c, tri12c];
		for (let i1 = 0; i1 < 2; i1++) {
			for (let i2 = 0; i2 < 4; i2++) {
				for (let i3 = 0; i3 < 3; i3++) {
					const jN = `J${i1 + 1}${i2 + 1}${i3 + 1}`;
					Jwings.push(jN);
					const triParity = i2 % 2;
					const triC = triParity === 1 ? tri24 : tri13;
					const lc = triC[i3];
					if (lc > 0) {
						const ctrJ = contourJ(0, 0)
							.addSegStrokeR(lc, 0)
							.addSegStrokeR(0, wingH)
							.startJunction(jN, tJDir.eA, tJSide.eABLeft)
							.addSegStrokeR(-lc, 0)
							.closeSegStroke();
						faWings.push(facet([ctrJ]));
					}
				}
			}
		}
		// sheetFold
		const Jbase = ['J1', 'J2', 'J3', 'J4', 'J11', 'J12', 'J21', 'J22'];
		const Jdef: tJunc = { angle: aJa, radius: aJr, neutral: aJn, mark: aJm };
		const Jdef2: tJunc = { angle: aJa, radius: aJr2, neutral: aJn, mark: aJm2 };
		const juncs: tJuncs = {};
		for (const iJ of Jbase) {
			juncs[iJ] = Jdef;
		}
		for (const iJ of Jwings) {
			juncs[iJ] = Jdef2;
		}
		// profile preparation
		const half1A: tHalfProfile = ['J1', L2b, 'J2', W1, 'J3', L2b];
		const half2A: tHalfProfile = ['J11', W1, 'J21', L1b];
		const half2P: tHalfProfile = ['J12', W1, 'J22'];
		//const half3A: tHalfProfile = ['J2', param.S1, 'J111', wingH];
		//const half3P: tHalfProfile = ['J3', param.S1, 'J211', wingH];
		const sFold = sheetFold(
			[faBone1, faPlate1, faPlate2, faBone2, faSide1, faSide2, ...faWings],
			juncs,
			[
				{ x1: 0, y1: 0, a1: 0, l1: W1, ante: half1A, post: ['J4'] },
				//{ x1: 2 * W1, y1: 0, a1: 0, l1: W1, ante: half3A, post: half3P },
				{ x1: 4 * W1, y1: 0, a1: 0, l1: L1b, ante: half2A, post: half2P }
			],
			param.T1,
			rGeome.partName
		);
		// final figure list
		rGeome.fig = sFold.makeFigures();
		// step-8 : recipes of the 3D construction
		// volume
		rGeome.vol = sFold.makeVolume();
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'doubleBone drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const doubleBoneDef: tPageDef = {
	pTitle: 'doubleBone',
	pDescription: 'combined suspension bones of the rccar',
	pDef: pDef,
	pGeom: pGeom
};

export { doubleBoneDef };
