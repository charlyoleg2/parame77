// tunnel.ts
// A tunnel for the train-capsule

import type {
	tContour,
	//tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	tPageDef
	//tSubInst
	//tSubDesign
} from 'geometrix';
import {
	//withinZeroPi,
	//withinPiPi,
	//ShapePoint,
	point,
	contour,
	contourCircle,
	ctrRectangle,
	figure,
	degToRad,
	//radToDeg,
	ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
	pSectionSeparator,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';
//import { triLALrL, triALLrL, triLLLrA } from 'triangule';
//import { triALLrLAA } from 'triangule';

const pDef: tParamDef = {
	partName: 'tunnel',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('W1', 'mm', 2000, 500, 10000, 10),
		pNumber('H1', 'mm', 4000, 500, 10000, 10),
		pNumber('a1', 'degree', 75, 45, 100, 1),
		pSectionSeparator('Stone'),
		pNumber('T1', 'mm', 400, 100, 1000, 1),
		pNumber('T2', 'mm', 200, 100, 1000, 1),
		pNumber('T3Max', 'mm', 400, 100, 1000, 1),
		pNumber('E1', 'mm', 5, 0, 50, 1)
	],
	paramSvg: {
		W1: 'tunnel_profile.svg',
		H1: 'tunnel_profile.svg',
		a1: 'tunnel_profile.svg',
		T1: 'tunnel_profile.svg',
		T2: 'tunnel_profile.svg',
		T3Max: 'tunnel_profile.svg',
		E1: 'tunnel_profile.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figProfile = figure();
	const figSlice = figure();
	const figStoneA = figure();
	const figStoneB = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const pi2 = Math.PI / 2;
		const W12 = param.W1 / 2;
		const a1 = degToRad(param.a1);
		const sin = Math.sin(a1);
		const cos = Math.cos(a1);
		function calc(iW12: number, iH1: number): [number, number, number, number] {
			const kA = (iW12 * (1 + cos)) / sin;
			const kB = sin ** 2 / (1 + cos);
			const H2 = (iH1 - kA) * kB;
			const R1 = (iW12 * sin + H2 * cos) / sin ** 2;
			const BC = R1 * cos;
			const AD = H2 / Math.tan(a1);
			return [H2, R1, BC, AD];
		}
		const [H2i, R1i, BCi, ADi] = calc(W12, param.H1);
		const ccy = H2i + BCi;
		const H1ib = ccy + R1i;
		const fsox = param.T2 + param.E1;
		const W12e = W12 + param.T1 * Math.tan(a1 / 2);
		const H1e = param.H1 + 2 * param.T1;
		const [H2e, R1e, BCe, ADe] = calc(W12e, H1e);
		const H1eb = H2e + BCe + R1e;
		// stones
		const e1 = param.E1;
		const e12 = e1 / 2;
		const T1 = param.T1;
		const T3 = param.T3Max;
		const T32 = T3 - e1;
		const ABgFirstDx = T3 / Math.tan(a1);
		const AgStart = W12e + ABgFirstDx;
		const AgN = Math.floor(AgStart / T3);
		const AgLast = AgStart - AgN * T3;
		const BgStart = W12e + ABgFirstDx - T3 / 2;
		const BgN = Math.floor(BgStart / T3);
		const BgLast = BgStart - BgN * T3;
		const ABsLength = H2i / sin;
		const AsLength = ABsLength - T3 / 2;
		const AsN = Math.floor(AsLength / T3);
		const AsLast = AsLength - AsN * T3;
		const BsN = Math.floor(ABsLength / T3);
		const BsLast = ABsLength - BsN * T3;
		const ABcLength = R1e * (Math.PI - a1);
		const AcN = Math.floor(ABcLength / T3);
		const AcLast = ABcLength - AcN * T3;
		const BcLength = ABcLength - T3 / 2;
		const BcN = Math.floor(BcLength / T3);
		const BcLast = BcLength - BcN * T3;
		// surfaces
		const surf1 = R1i ** 2 * (Math.PI - a1);
		const surf2 = ccy * R1i * sin;
		const surf3 = W12 * H2i;
		const surfaceM2 = (surf1 + surf2 + surf3) * 10 ** -6;
		// step-5 : checks on the parameter values
		if (Math.abs(param.H1 - H1ib) > 0.1) {
			throw `err086: H1 ${ffix(param.H1)} and H1ib ${ffix(H1ib)} are not equal`;
		}
		if (Math.abs(H1e - H1eb) > 0.1) {
			throw `err102: H1e ${ffix(H1e)} and H1eb ${ffix(H1eb)} are not equal`;
		}
		if (Math.abs(H2e + BCe - param.T1 - ccy) > 0.1) {
			throw `err106: H2e ${ffix(H2e)} and BCe ${ffix(BCe)} not match the other circle center`;
		}
		// step-6 : any logs
		rGeome.logstr += `Surface ${ffix(surfaceM2)} m2\n`;
		//rGeome.logstr += `dbg095: ADi ${ffix(ADi)} mm\n`;
		//rGeome.logstr += `dbg123: AgLast ${ffix(AgLast)} mm\n`;
		rGeome.logstr += `dbg131: AsN ${ffix(AsN)} stones\n`;
		// sub-function
		// figProfile
		const ctrProfileI = contour(-W12, 0)
			.addSegStrokeR(2 * W12, 0)
			.addSegStrokeR(ADi, H2i)
			.addPointR(-ADi - W12, BCi + R1i)
			.addPointR(-2 * (ADi + W12), 0)
			.addSegArc2()
			.closeSegStroke();
		const ctrProfileE = contour(-W12e, -param.T1)
			.addSegStrokeR(2 * W12e, 0)
			.addSegStrokeR(ADe, H2e)
			.addPointR(-ADe - W12e, BCe + R1e)
			.addPointR(-2 * (ADe + W12e), 0)
			.addSegArc2()
			.closeSegStroke();
		figProfile.addMainOI([ctrProfileE, ctrProfileI]);
		figProfile.addSecond(contourCircle(0, ccy, R1i));
		// figSlice
		figSlice.addMainOI([
			ctrRectangle(0, -param.T1, param.T2, param.H1 + 2 * param.T1),
			ctrRectangle(0, 0, param.T2, param.H1)
		]);
		figSlice.addMainOI([
			ctrRectangle(fsox, -param.T1, param.T2, param.H1 + 2 * param.T1),
			ctrRectangle(fsox, 0, param.T2, param.H1)
		]);
		// figStoneA Ground
		for (let ii = 0; ii < AgN; ii++) {
			const ox = -AgStart + ii * T3 + e12;
			figStoneA.addMainO(ctrRectangle(ox, -T1, T32, T1));
		}
		if (AgLast > e12) {
			if (2 * AgLast < T3) {
				figStoneA.addMainO(ctrRectangle(-AgLast + e12, -T1, 2 * AgLast - e1, T1));
			} else {
				figStoneA.addMainO(ctrRectangle(-AgLast + e12, -T1, AgLast - e1, T1));
				figStoneA.addMainO(ctrRectangle(e12, -T1, AgLast - e1, T1));
			}
		}
		for (let ii = 0; ii < AgN; ii++) {
			const ox = AgLast + ii * T3 + e12;
			figStoneA.addMainO(ctrRectangle(ox, -T1, T32, T1));
		}
		// figStoneB
		figStoneB.addMainO(ctrRectangle(-BgStart - T3 / 2 + e12, -T1, T3 / 2 - e1, T1));
		for (let ii = 0; ii < BgN; ii++) {
			const ox = -BgStart + ii * T3 + e12;
			figStoneB.addMainO(ctrRectangle(ox, -T1, T32, T1));
		}
		if (BgLast > e12) {
			if (2 * BgLast < T3) {
				figStoneB.addMainO(ctrRectangle(-BgLast + e12, -T1, 2 * BgLast - e1, T1));
			} else {
				figStoneB.addMainO(ctrRectangle(-BgLast + e12, -T1, BgLast - e1, T1));
				figStoneB.addMainO(ctrRectangle(e12, -T1, BgLast - e1, T1));
			}
		}
		for (let ii = 0; ii < BgN; ii++) {
			const ox = BgLast + ii * T3 + e12;
			figStoneB.addMainO(ctrRectangle(ox, -T1, T32, T1));
		}
		figStoneB.addMainO(ctrRectangle(BgStart + e12, -T1, T3 / 2 - e1, T1));
		// figStoneA Side
		function ctrSideStone(iD: number, iL: number, iRnL: number): tContour {
			const aa1 = iRnL === 1 ? a1 : Math.PI - a1;
			const pt = point(iRnL * W12, 0).translatePolar(aa1, iD + e12);
			const rCtr = contour(pt.cx, pt.cy)
				.addSegStrokeRP(aa1 - iRnL * pi2, T1)
				.addSegStrokeRP(aa1, iL - e1)
				.addSegStrokeRP(aa1 + iRnL * pi2, T1)
				.closeSegStroke();
			return rCtr;
		}
		figStoneA.addMainO(ctrSideStone(0, T3 / 2, 1));
		figStoneA.addMainO(ctrSideStone(0, T3 / 2, -1));
		for (let ii = 0; ii < AsN; ii++) {
			figStoneA.addMainO(ctrSideStone(T3 / 2 + ii * T3, T3, 1));
			figStoneA.addMainO(ctrSideStone(T3 / 2 + ii * T3, T3, -1));
		}
		if (AsLast > e1) {
			figStoneA.addMainO(ctrSideStone(T3 / 2 + AsN * T3, AsLast, 1));
			figStoneA.addMainO(ctrSideStone(T3 / 2 + AsN * T3, AsLast, -1));
		}
		// figStoneB Side
		for (let ii = 0; ii < BsN; ii++) {
			figStoneB.addMainO(ctrSideStone(ii * T3, T3, 1));
			figStoneB.addMainO(ctrSideStone(ii * T3, T3, -1));
		}
		if (BsLast > e1) {
			figStoneB.addMainO(ctrSideStone(BsN * T3, BsLast, 1));
			figStoneB.addMainO(ctrSideStone(BsN * T3, BsLast, -1));
		}
		// figStoneA Ceiling
		function ctrCeilingStone(iD: number, iL: number, iRnL: number): tContour {
			const a2 = -pi2 + iRnL * (a1 + iD / R1e);
			const a3 = a2 + (iRnL * iL) / R1e;
			const pt1 = point(0, ccy)
				.translatePolar(a2, R1i)
				.translatePolar(a2 + iRnL * pi2, e12);
			const pt2 = pt1.translatePolar(a2, T1);
			const pt4 = point(0, ccy)
				.translatePolar(a3, R1i)
				.translatePolar(a3 - iRnL * pi2, e12);
			const pt3 = pt4.translatePolar(a3, T1);
			const rCtr = contour(pt1.cx, pt1.cy)
				.addSegStrokeA(pt2.cx, pt2.cy)
				.addSegStrokeA(pt3.cx, pt3.cy)
				.addSegStrokeA(pt4.cx, pt4.cy)
				.closeSegStroke();
			return rCtr;
		}
		for (let ii = 0; ii < AcN; ii++) {
			figStoneA.addMainO(ctrCeilingStone(ii * T3, T3, 1));
			figStoneA.addMainO(ctrCeilingStone(ii * T3, T3, -1));
		}
		if (AcLast > e1) {
			if (AcLast < T3 / 2) {
				figStoneA.addMainO(ctrCeilingStone(AcN * T3, 2 * AcLast, 1));
			} else {
				figStoneA.addMainO(ctrCeilingStone(AcN * T3, AcLast, 1));
				figStoneA.addMainO(ctrCeilingStone(AcN * T3, AcLast, -1));
			}
		}
		// figStoneB Ceiling
		figStoneB.addMainO(ctrCeilingStone(0, T3 / 2, 1));
		figStoneB.addMainO(ctrCeilingStone(0, T3 / 2, -1));
		for (let ii = 0; ii < BcN; ii++) {
			figStoneB.addMainO(ctrCeilingStone(T3 / 2 + ii * T3, T3, 1));
			figStoneB.addMainO(ctrCeilingStone(T3 / 2 + ii * T3, T3, -1));
		}
		if (BcLast > e1) {
			if (BcLast < T3 / 2) {
				figStoneB.addMainO(ctrCeilingStone(T3 / 2 + BcN * T3, 2 * BcLast, 1));
			} else {
				figStoneB.addMainO(ctrCeilingStone(T3 / 2 + BcN * T3, BcLast, 1));
				figStoneB.addMainO(ctrCeilingStone(T3 / 2 + BcN * T3, BcLast, -1));
			}
		}
		// figStoneA figStoneB background
		figStoneA.mergeFigure(figProfile, true);
		figStoneB.mergeFigure(figStoneA, true);
		// final figure list
		rGeome.fig = {
			faceProfile: figProfile,
			faceSlice: figSlice,
			faceStoneA: figStoneA,
			faceStoneB: figStoneB
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_A`,
					face: `${designName}_faceStoneA`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T2,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_B`,
					face: `${designName}_faceStoneB`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T2,
					rotate: [0, 0, 0],
					translate: [0, 0, fsox]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_A`, `subpax_${designName}_B`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'tunnel drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const tunnelDef: tPageDef = {
	pTitle: 'tunnel',
	pDescription: 'tunnel for the train-capsule',
	pDef: pDef,
	pGeom: pGeom
};

export { tunnelDef };
