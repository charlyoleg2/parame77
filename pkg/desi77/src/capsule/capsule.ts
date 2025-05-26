// capsule.ts
// a concept train for 2, 4 or 6 people

import type {
	//tContour,
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
	//ShapePoint,
	point,
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
//import { triALLrL } from 'triangule';

const pDef: tParamDef = {
	partName: 'capsule',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('L1', 'mm', 5000, 1000, 20000, 1),
		pNumber('WW1', 'mm', 1800, 100, 4000, 1),
		pNumber('WW2', 'mm', 1000, 100, 4000, 1),
		pNumber('H0', 'mm', 600, 100, 2000, 1),
		pNumber('E1', 'mm', 10, 1, 100, 1),
		pSectionSeparator('Nose'),
		pNumber('H1', 'mm', 300, 10, 4000, 1),
		pNumber('H2', 'mm', 500, 10, 4000, 1),
		pNumber('H3', 'mm', 1200, 10, 4000, 1),
		pNumber('W1', 'mm', 300, 10, 4000, 1),
		pNumber('W3', 'mm', 1500, 10, 4000, 1),
		pNumber('C3', 'mm', 200, 1, 1000, 1),
		pNumber('R1', 'mm', 100, 0, 500, 1),
		pNumber('R2', 'mm', 100, 0, 500, 1),
		pNumber('R3', 'mm', 100, 0, 500, 1),
		pNumber('R4', 'mm', 100, 0, 500, 1),
		pSectionSeparator('Wheels'),
		pNumber('D7', 'mm', 500, 10, 2000, 1),
		pNumber('D8', 'mm', 100, 10, 2000, 1),
		pNumber('W6', 'mm', 500, 10, 2000, 1),
		pNumber('W7', 'mm', 600, 10, 2000, 1),
		pNumber('W8', 'mm', 300, 10, 2000, 1),
		pNumber('H6', 'mm', 300, 10, 2000, 1),
		pSectionSeparator('Top'),
		pNumber('H5', 'mm', 300, 10, 2000, 1),
		pNumber('W4', 'mm', 1000, 10, 5000, 1)
	],
	paramSvg: {
		L1: 'capsule_side.svg',
		H0: 'capsule_side.svg',
		E1: 'capsule_nose.svg',
		H1: 'capsule_nose.svg',
		H2: 'capsule_nose.svg',
		H3: 'capsule_nose.svg',
		W1: 'capsule_nose.svg',
		W3: 'capsule_nose.svg',
		C3: 'capsule_nose.svg',
		R1: 'capsule_nose.svg',
		R2: 'capsule_nose.svg',
		R3: 'capsule_nose.svg',
		R4: 'capsule_nose.svg',
		D7: 'capsule_side.svg',
		D8: 'capsule_side.svg',
		W6: 'capsule_side.svg',
		W7: 'capsule_side.svg',
		W8: 'capsule_side.svg',
		H6: 'capsule_side.svg',
		H5: 'capsule_nose.svg',
		W4: 'capsule_nose.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figNoseExt = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const pi2 = Math.PI / 2;
		const platSurface = (param.L1 * param.WW1) / 10 ** 6;
		const L12 = param.L1 / 2;
		const E1 = param.E1;
		const Wwheels = param.W6 + param.W7 + param.W8;
		const Hbatterie = param.H0 - param.H6;
		const Wbatterie = param.L1 - 2 * Wwheels;
		const Lroof = param.L1 + 2 * param.W1 - 2 * param.W3;
		const aN1 = Math.atan2(param.H3, -param.W3);
		const p1 = point(0, 0)
			.translate(-param.W3 / 2, param.H3 / 2)
			.translatePolar(aN1 - pi2, param.C3);
		const aN2 = Math.atan2(-param.H3, -param.W3);
		const p2 = point(0, 0)
			.translate(-param.W3 / 2, -param.H3 / 2)
			.translatePolar(aN2 - pi2, param.C3);
		// wheels
		const R7 = param.D7 / 2;
		const R8 = param.D8 / 2;
		const posXwheel1 = L12 - param.W8;
		const posXwheel2 = posXwheel1 - param.W7;
		// step-5 : checks on the parameter values
		if (param.L1 - 2 * Wwheels < 2 * E1) {
			throw `err176: L1 ${ffix(param.L1)} is too small compare to W6 ${ffix(param.W6)}, W7 ${ffix(param.W7)} and W8 ${ffix(param.W8)} mm`;
		}
		if (Hbatterie < E1) {
			throw `err114: Hbatterie ${ffix(Hbatterie)} is too small compare to E1 ${ffix(E1)} mm`;
		}
		if (Wbatterie < 2 * E1) {
			throw `err118: Wbatterie ${ffix(Wbatterie)} is too small compare to E1 ${ffix(E1)} mm`;
		}
		if (Lroof < 2 * param.W4) {
			throw `err122: Lroof ${ffix(Lroof)} is too small compare to W4 ${ffix(param.W4)} mm`;
		}
		// step-6 : any logs
		rGeome.logstr += `Platform surface: ${ffix(platSurface)} m2\n`;
		//rGeome.logstr += `dbg134: p1.cx ${ffix(p1.cx)} p2.cx ${ffix(p2.cx)}\n`;
		// step-7 : drawing of the figures
		// sub-function
		// figNoseExt
		const ctrNoseExt = contour(-L12, param.H0)
			.addSegStrokeR(Wwheels, 0)
			.addSegStrokeR(0, -Hbatterie)
			.addSegStrokeR(Wbatterie, 0)
			.addSegStrokeR(0, Hbatterie)
			.addSegStrokeR(Wwheels, 0)
			.addCornerRounded(param.R1)
			.addSegStrokeR(param.W1, param.H1)
			.addCornerRounded(param.R2)
			.addSegStrokeR(0, param.H2)
			.addCornerRounded(param.R3)
			//.addSegStrokeR(-param.W3, param.H3)
			.addPointR(p1.cx, p1.cy)
			.addPointR(-param.W3, param.H3)
			.addSegArc2()
			.addCornerRounded(param.R4)
			.addSegStrokeR(-Lroof, 0)
			.addCornerRounded(param.R4)
			//.addSegStrokeR(-param.W3, -param.H3)
			.addPointR(p2.cx, p2.cy)
			.addPointR(-param.W3, -param.H3)
			.addSegArc2()
			.addCornerRounded(param.R3)
			.addSegStrokeR(0, -param.H2)
			.addCornerRounded(param.R2)
			//.addSegStrokeR(param.W1, -param.H1)
			.closeSegStroke()
			.addCornerRounded(param.R1);
		figNoseExt.addMainO(ctrNoseExt);
		figNoseExt.addSecond(contourCircle(-posXwheel1, R7, R7));
		figNoseExt.addSecond(contourCircle(-posXwheel1, R7, R8));
		figNoseExt.addSecond(contourCircle(-posXwheel2, R7, R7));
		figNoseExt.addSecond(contourCircle(-posXwheel2, R7, R8));
		figNoseExt.addSecond(contourCircle(posXwheel1, R7, R7));
		figNoseExt.addSecond(contourCircle(posXwheel1, R7, R8));
		figNoseExt.addSecond(contourCircle(posXwheel2, R7, R7));
		figNoseExt.addSecond(contourCircle(posXwheel2, R7, R8));
		// final figure list
		rGeome.fig = {
			faceNoseExt: figNoseExt
		};
		// step-8 : recipes of the 3D construction
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_noseExt`,
					face: `${designName}_faceNoseExt`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.WW1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_noseExt`]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'capsule drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const capsuleDef: tPageDef = {
	pTitle: 'capsule',
	pDescription: 'high-level concept of the train-capsule',
	pDef: pDef,
	pGeom: pGeom
};

export { capsuleDef };
