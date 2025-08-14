// trackXY.ts
// simulation of train-capsule on XY-track

import type {
	tContour,
	//tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	tPageDef
	//tExtrude
	//tVolume
	//tSubInst
	//tSubDesign
} from 'geometrix';
import {
	//withinZeroPi,
	//withinPiPi,
	//ShapePoint,
	point,
	contour,
	//contourCircle,
	ctrRectangle,
	figure,
	degToRad,
	radToDeg,
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
import { triLALrL } from 'triangule';

const pDef: tParamDef = {
	partName: 'trackXY',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('W1', 'mm', 1000, 10, 2000, 1),
		pNumber('T1', 'mm', 80, 1, 200, 1),
		pNumber('S1', 'mm', 200, 1, 500, 1),
		pNumber('B1', 'mm', 200, 2, 500, 1),
		pNumber('B2', 'mm', 300, 2, 1000, 1),
		pNumber('H1', 'mm', 100, 1, 500, 1),
		pNumber('H2', 'mm', 200, 1, 500, 1),
		pSectionSeparator('Track'),
		pNumber('a0', 'degree', 30, -180, 180, 1),
		pNumber('a1', 'degree', -40, -180, 180, 1),
		pNumber('a2', 'degree', 30, -180, 180, 1),
		pNumber('L1', 'm', 30, 0.01, 200, 0.01),
		pNumber('L2', 'm', 1, 0.01, 200, 0.01),
		pNumber('L3', 'm', 20, 0.01, 200, 0.01),
		pNumber('r1', 'm', 10, 0.01, 200, 0.01),
		pNumber('r2', 'm', 20, 0.01, 200, 0.01)
	],
	paramSvg: {
		W1: 'trackXY_section.svg',
		T1: 'trackXY_section.svg',
		S1: 'trackXY_top.svg',
		B1: 'trackXY_top.svg',
		B2: 'trackXY_top.svg',
		H1: 'trackXY_side.svg',
		H2: 'trackXY_side.svg',
		a0: 'trackXY_midLine.svg',
		a1: 'trackXY_midLine.svg',
		a2: 'trackXY_midLine.svg',
		L1: 'trackXY_midLine.svg',
		L2: 'trackXY_midLine.svg',
		L3: 'trackXY_midLine.svg',
		r1: 'trackXY_midLine.svg',
		r2: 'trackXY_midLine.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figTop1 = figure();
	const figTop2 = figure();
	const figSection = figure();
	const figSide = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		//const pi2 = Math.PI / 2;
		const A0 = degToRad(param.a0);
		const A1 = degToRad(param.a1);
		const A2 = degToRad(param.a2);
		const Lr1 = A1 * param.r1;
		const Lr2 = A2 * param.r2;
		const Ltot = param.L1 + Lr1 + param.L2 + Lr2 + param.L3;
		const A1b = A0 + A1;
		const A2b = A1b + A2;
		const [Lr1c, logTri1] = triLALrL(param.r1, A1, param.r1);
		const [Lr2c, logTri2] = triLALrL(param.r2, A2, param.r2);
		rGeome.logstr += logTri1 + logTri2;
		const aLr1c = A1 / 2;
		const aLr2c = A2 / 2;
		const Lbeam2 = (param.W1 / 2 + param.T1 + param.S1) / 1000; // m
		const Wbeam2 = param.B1 / 2000; // m
		// calculation for beam positions
		const Bstep = (param.B1 + param.B2) / 1000; // m
		const Nb1 = Math.floor(param.L1 / Bstep);
		const Rb1 = param.L1 - Nb1 * Bstep;
		const Nb1c = Math.floor((Rb1 + Lr1) / Bstep);
		const Rb1c = Rb1 + Lr1 - Nb1c * Bstep;
		const Nb2 = Math.floor((Rb1c + param.L2) / Bstep);
		const Rb2 = Rb1c + param.L2 - Nb2 * Bstep;
		const Nb2c = Math.floor((Rb2 + Lr2) / Bstep);
		const Rb2c = Rb2 + Lr2 - Nb2c * Bstep;
		const Nb3 = Math.floor((Rb2c + param.L3) / Bstep);
		//const Rb3 = Rb2c + param.L3 - Nb3 * Bstep;
		// step-5 : checks on the parameter values
		if (Math.abs(param.a1) < 0.5) {
			throw `err102: a1 ${param.a1} degree is too closed to zero`;
		}
		if (Math.abs(param.a2) < 0.5) {
			throw `err112: a2 ${param.a2} degree is too closed to zero`;
		}
		// step-6 : any logs
		rGeome.logstr += `Track-XY length: ${ffix(Ltot)} m\n`;
		rGeome.logstr += `Beam size: ${ffix(2 * Lbeam2)} x ${ffix(2 * Wbeam2)} m\n`;
		rGeome.logstr += `Final orientation: ${ffix(radToDeg(A2b))} degree\n`;
		// sub-function
		function ctrBeam(iX: number, iY: number, iA: number): tContour {
			const ctr1 = ctrRectangle(iX - Wbeam2, iY - Lbeam2, 2 * Wbeam2, 2 * Lbeam2);
			const rCtr = ctr1.rotate(iX, iY, iA);
			return rCtr;
		}
		// figTop1
		const ctrMidLine = contour(0, 0)
			.addSegStrokeRP(A0, param.L1)
			.addPointRP(A0 + aLr1c, Lr1c)
			.addSegArc3(A0, true)
			.addSegStrokeRP(A1b, param.L2)
			.addPointRP(A1b + aLr2c, Lr2c)
			.addSegArc3(A1b, true)
			.addSegStrokeRP(A2b, param.L3);
		figTop1.addSecond(ctrMidLine);
		const pt0 = point(0, 0);
		for (let ii = 0; ii < Nb1; ii++) {
			const pt = pt0.translatePolar(A0, ii * Bstep);
			figTop1.addMainO(ctrBeam(pt.cx, pt.cy, A0));
		}
		const pt1e = pt0.translatePolar(A0, param.L1).translatePolar(A0 + aLr1c, Lr1c);
		for (let ii = 0; ii < Nb2; ii++) {
			const pt = pt1e.translatePolar(A1b, ii * Bstep - Rb1c);
			figTop1.addMainO(ctrBeam(pt.cx, pt.cy, A1b));
		}
		const pt2e = pt1e.translatePolar(A1b, param.L2).translatePolar(A1b + aLr2c, Lr2c);
		for (let ii = 0; ii < Nb3; ii++) {
			const pt = pt2e.translatePolar(A2b, ii * Bstep - Rb2c);
			figTop1.addMainO(ctrBeam(pt.cx, pt.cy, A2b));
		}
		// figTop2
		// figSection
		// figSide
		// final figure list
		rGeome.fig = {
			faceTop1: figTop1,
			faceTop2: figTop2,
			faceSide: figSide,
			faceSection: figSection
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_beam`,
					face: `${designName}_faceTop1`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.H1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_rail`,
					face: `${designName}_faceTop2`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.H2,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_beam`, `subpax_${designName}_rail`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'trackXY drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const trackXYDef: tPageDef = {
	pTitle: 'trackXY',
	pDescription: 'simulation of train-capsule on XY-track',
	pDef: pDef,
	pGeom: pGeom
};

export { trackXYDef };
