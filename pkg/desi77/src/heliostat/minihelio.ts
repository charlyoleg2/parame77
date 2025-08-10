// minihelio.ts
// a table-top model of an heliostat

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
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';
//import { triLALrL, triALLrL, triLLLrA } from 'triangule';
//import { triALLrLAA } from 'triangule';

const pDef: tParamDef = {
	partName: 'minihelio',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('N1', 'mirror', 3, 1, 20, 1),
		pNumber('W1', 'mm', 100, 5, 2000, 1),
		pNumber('W2', 'mm', 5, 1, 200, 1),
		pNumber('H4', 'mm', 30, 1, 2000, 1),
		pNumber('H5', 'mm', 10, 1, 2000, 1),
		pNumber('H6', 'mm', 120, 5, 2000, 1),
		pNumber('H7', 'mm', 10, 1, 2000, 1),
		pNumber('H8', 'mm', 50, 1, 2000, 1),
		pNumber('D8', 'mm', 3, 1, 50, 1),
		pSectionSeparator('Frame side'),
		pNumber('T1', 'mm', 1, 0.5, 10, 0.1),
		pNumber('T2', 'mm', 1, 0.5, 10, 0.1),
		pNumber('W3', 'mm', 5, 1, 500, 1),
		pNumber('W4', 'mm', 10, 1, 500, 1),
		pNumber('W5', 'mm', 30, 1, 500, 1),
		pNumber('HW3', 'mm', 40, 1, 2000, 1),
		pNumber('HW53', 'mm', 60, 1, 2000, 1),
		pSectionSeparator('Foot'),
		pNumber('D1', 'mm', 10, 5, 1000, 1),
		pNumber('D2', 'mm', 20, 5, 1000, 1),
		pNumber('D3', 'mm', 10, 5, 1000, 1),
		pNumber('H1', 'mm', 10, 5, 2000, 1),
		pNumber('H2', 'mm', 20, 5, 2000, 1),
		pNumber('H3', 'mm', 40, 5, 2000, 1),
		pSectionSeparator('Mirror'),
		pNumber('Wm', 'mm', 60, 5, 2000, 1),
		pNumber('Hm', 'mm', 60, 5, 2000, 1),
		pNumber('Tm', 'mm', 1, 0.5, 10, 0.1),
		pNumber('Dm', 'mm', 2, 0.1, 50, 0.1),
		pNumber('Sm', 'mm', 5, 1, 200, 1),
		pSectionSeparator('Simulation'),
		pNumber('aSun', 'degree', 45, 0, 90, 1),
		pNumber('Lt', 'm', 10, 1, 200, 0.1),
		pNumber('Ht1', 'm', 2, 0.1, 20, 0.1),
		pNumber('Ht2', 'm', 1, 0.1, 20, 0.1)
	],
	paramSvg: {
		N1: 'minihelio_front.svg',
		W1: 'minihelio_front.svg',
		W2: 'minihelio_front.svg',
		H4: 'minihelio_front.svg',
		H5: 'minihelio_front.svg',
		H6: 'minihelio_front.svg',
		H7: 'minihelio_front.svg',
		H8: 'minihelio_front.svg',
		D8: 'minihelio_front.svg',
		T1: 'minihelio_side.svg',
		T2: 'minihelio_side.svg',
		W3: 'minihelio_side.svg',
		W4: 'minihelio_side.svg',
		W5: 'minihelio_side.svg',
		HW3: 'minihelio_side.svg',
		HW53: 'minihelio_side.svg',
		D1: 'minihelio_front.svg',
		D2: 'minihelio_front.svg',
		D3: 'minihelio_front.svg',
		H1: 'minihelio_front.svg',
		H2: 'minihelio_front.svg',
		H3: 'minihelio_front.svg',
		Wm: 'minihelio_mirror.svg',
		Hm: 'minihelio_mirror.svg',
		Tm: 'minihelio_mirror.svg',
		Dm: 'minihelio_mirror.svg',
		Sm: 'minihelio_mirror.svg',
		aSun: 'minihelio_side.svg',
		Lt: 'minihelio_side.svg',
		Ht1: 'minihelio_side.svg',
		Ht2: 'minihelio_side.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figFoot = figure();
	const figMirrorSide = figure();
	const figMirrorAxis = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const R1 = param.D1 / 2;
		const R2 = param.D2 / 2;
		const R3 = param.D3 / 2;
		const Rm = param.Dm / 2;
		const R12 = R2 - R1;
		const R23 = R2 - R3;
		const Hm2 = param.Hm / 2 - Rm;
		const mirrorSurface = param.Hm * param.Wm;
		const mirrorSurfaceN = param.N1 * mirrorSurface;
		// step-5 : checks on the parameter values
		if (R12 < 0.1) {
			throw `err134: D2 ${ffix(param.D2)} is too small compare to D1 ${ffix(param.D1)} mm`;
		}
		if (R23 < 0.1) {
			throw `err139: D2 ${ffix(param.D2)} is too small compare to D3 ${ffix(param.D3)} mm`;
		}
		if (param.H2 < param.T1) {
			throw `err142: H2 ${ffix(param.h2)} is too small compare to T1 ${ffix(param.T1)} mm`;
		}
		if (Hm2 < 0) {
			throw `err096: Hm ${ffix(param.Hm)} is too small compare to Dm ${ffix(param.Dm)} mm`;
		}
		if (param.Sm < Rm) {
			throw `err099: Sm ${ffix(param.Sm)} is too small compare to Dm ${ffix(param.Dm)} mm`;
		}
		if (param.D8 < param.Dm) {
			throw `err102: D8 ${ffix(param.D8)} is too small compare to Dm ${ffix(param.Dm)} mm`;
		}
		// step-6 : any logs
		rGeome.logstr += `Mirror surface: One: ${ffix(mirrorSurface)}, N: ${param.N1} : ${ffix(mirrorSurfaceN)} mm2\n`;
		// sub-function
		// figFoot
		function ctrFoot(sign: number): tContour {
			const rCtr = contour(sign * R1, 0)
				.addSegStrokeR(0, param.H1)
				.addSegStrokeR(sign * R12, 0)
				.addSegStrokeR(0, param.H2)
				.addSegStrokeR(-sign * R23, param.H3)
				.addSegStrokeR(-sign * param.T1, 0)
				.addSegStrokeR(sign * R23, -param.H3)
				.addSegStrokeR(0, -param.H2 + param.T1)
				.addSegStrokeR(-sign * R12, 0)
				.addSegStrokeR(0, -param.H1 - param.T1)
				.closeSegStroke();
			return rCtr;
		}
		figFoot.addMainO(ctrFoot(1));
		figFoot.addSecond(ctrFoot(-1));
		// figMirrorSide
		const ctrMirrorSide = contour(-Rm, 0)
			.addPointR(Rm, -Rm)
			.addPointR(2 * Rm, 0)
			.addSegArc2()
			.addSegStrokeR(0, param.Sm)
			.addSegStrokeR(Hm2, 0)
			.addSegStrokeR(0, param.Tm)
			.addSegStrokeR(-param.Hm, 0)
			.addSegStrokeR(0, -param.Tm)
			.addSegStrokeR(Hm2, 0)
			.closeSegStroke();
		const ctrMirrorAxis = contourCircle(0, 0, Rm);
		figMirrorSide.addMainO(ctrMirrorSide);
		figMirrorSide.addSecond(ctrMirrorAxis);
		// figMirrorAxis
		figMirrorAxis.addMainO(ctrMirrorAxis);
		figMirrorAxis.addSecond(ctrMirrorSide);
		// final figure list
		rGeome.fig = {
			faceFoot: figFoot,
			faceMirrorSide: figMirrorSide,
			faceMirrorAxis: figMirrorAxis
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_foot`,
					face: `${designName}_faceFoot`,
					extrudeMethod: EExtrude.eRotate,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_mirrorSide`,
					face: `${designName}_faceMirrorSide`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.Wm,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_mirrorAxis`,
					face: `${designName}_faceMirrorAxis`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.W1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_mirrorSide`, `subpax_${designName}_mirrorSide`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'minihelio drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const minihelioDef: tPageDef = {
	pTitle: 'minihelio',
	pDescription: 'table-top model of an heliostat',
	pDef: pDef,
	pGeom: pGeom
};

export { minihelioDef };
