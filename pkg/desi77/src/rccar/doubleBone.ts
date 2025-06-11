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
	contour,
	contourCircle,
	//ctrRectangle,
	figure,
	//degToRad,
	//radToDeg,
	ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
	pSectionSeparator,
	//transform2d,
	//transform3d,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';
//import { triLALrL, triALLrL, triLLLrA } from 'triangule';
//import { triALLrL } from 'triangule';

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
		pNumber('R3', 'mm', 50, 0, 1000, 1),
		pSectionSeparator('Wings'),
		pNumber('P11', '%', 20, 0, 90, 1),
		pNumber('P12', '%', 20, 0, 90, 1),
		pNumber('P21', '%', 20, 0, 90, 1),
		pNumber('P22', '%', 20, 0, 90, 1),
		pSectionSeparator('Folding'),
		pNumber('T1', 'mm', 2, 0.5, 10, 0.1),
		pNumber('Jangle', 'degree', 90, 30, 120, 1),
		pNumber('Jradius', 'mm', 10, 0.1, 50, 0.1),
		pNumber('Jneutral', '%', 50, 0, 100, 1),
		pNumber('Jmark', 'mm', 2, 0.1, 10, 0.1)
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
		Jmark: 'doubleBone_folding.svg'
	},
	sim: {
		tMax: 200,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figBone = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		//const pi = Math.PI;
		//const pi2 = pi / 2;
		const W12 = param.W1 / 2;
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
		// step-5 : checks on the parameter values
		if (R22 < R12) {
			throw `err085: D2 ${ffix(param.D2)} is too small compare to D1 ${ffix(param.D1)} mm`;
		}
		if (L1b < 0) {
			throw `err095: L1 ${ffix(param.L1)} is too small compare to D2 ${ffix(param.D2)} mm`;
		}
		// step-6 : any logs
		rGeome.logstr += `Bone length ${ffix(boneLen)} mm\n`;
		rGeome.logstr += `Bone with N2 ${N2} holes of diameter ${ffix(2 * Rh)} mm\n`;
		rGeome.logstr += `Bone W2b ${ffix(W2b)} mm\n`;
		// step-7 : drawing of the figures
		// sub-function
		// figBone
		const ctrBone = contour(dX, W12)
			.addPointR(-dX - R22, -W12)
			.addPointR(0, -2 * W12)
			.addSegArc2()
			.addSegStrokeR(L1b, 0)
			.addPointR(dX + R22, W12)
			.addPointR(0, 2 * W12)
			.addSegArc2()
			.closeSegStroke();
		const ctrAxis1 = contourCircle(0, 0, R12);
		const ctrAxis2 = contourCircle(param.L1, 0, R12);
		const ctrMinis: tContour[] = [];
		if (Rh > 0) {
			for (let ii = 0; ii < N2; ii++) {
				ctrMinis.push(contourCircle(hX0b + ii * hX1b, 0, Rh));
			}
		}
		figBone.addMainOI([ctrBone, ctrAxis1, ctrAxis2, ...ctrMinis]);
		// final figure list
		rGeome.fig = {
			faceBone: figBone
		};
		// step-8 : recipes of the 3D construction
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_bone`,
					face: `${designName}_faceBone`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eIdentity,
					inList: [`subpax_${designName}_bone`]
				}
			]
		};
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
