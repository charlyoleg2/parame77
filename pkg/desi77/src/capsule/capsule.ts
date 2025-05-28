// capsule.ts
// a concept train for 2, 4 or 6 people

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
	//ShapePoint,
	point,
	contour,
	contourCircle,
	ctrRectangle,
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
		pNumber('H0', 'mm', 600, 100, 2000, 1),
		pNumber('D7', 'mm', 500, 10, 2000, 1),
		pNumber('D8', 'mm', 100, 10, 2000, 1),
		pNumber('WW2', 'mm', 1000, 100, 4000, 1),
		pNumber('WW3', 'mm', 100, 1, 500, 1),
		pSectionSeparator('Wheels details'),
		pNumber('W6', 'mm', 500, 10, 2000, 1),
		pNumber('W7', 'mm', 600, 10, 2000, 1),
		pNumber('W8', 'mm', 300, 10, 2000, 1),
		pNumber('H6', 'mm', 300, 10, 2000, 1),
		pSectionSeparator('Top'),
		pNumber('H5', 'mm', 300, 10, 2000, 1),
		pNumber('W4', 'mm', 500, 10, 5000, 1),
		pNumber('W5', 'mm', 1000, 10, 5000, 1),
		pNumber('R5', 'mm', 50, 1, 500, 1),
		pNumber('S5', 'mm', 200, 10, 500, 1)
	],
	paramSvg: {
		L1: 'capsule_side.svg',
		WW1: 'capsule_top.svg',
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
		H0: 'capsule_side.svg',
		D7: 'capsule_side.svg',
		D8: 'capsule_side.svg',
		WW2: 'capsule_wheels.svg',
		WW3: 'capsule_wheels.svg',
		W6: 'capsule_side.svg',
		W7: 'capsule_side.svg',
		W8: 'capsule_side.svg',
		H6: 'capsule_side.svg',
		H5: 'capsule_nose.svg',
		W4: 'capsule_nose.svg',
		W5: 'capsule_top.svg',
		R5: 'capsule_top.svg',
		S5: 'capsule_top.svg'
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
	const figWheels = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const pi2 = Math.PI / 2;
		const platSurface = (param.L1 * param.WW1) / 10 ** 6;
		const L12 = param.L1 / 2;
		const E1 = param.E1;
		const Wwheels = param.W6 + param.W7 + param.W8;
		const Hbatterie = param.H0 - param.H6;
		const Lbatterie = param.L1 - 2 * Wwheels;
		const Lroof = param.L1 + 2 * param.W1 - 2 * param.W3;
		const aN1 = Math.atan2(param.H3, -param.W3);
		const p1 = point(0, 0)
			.translate(-param.W3 / 2, param.H3 / 2)
			.translatePolar(aN1 - pi2, param.C3);
		const aN2 = Math.atan2(-param.H3, -param.W3);
		const p2 = point(0, 0)
			.translate(-param.W3 / 2, -param.H3 / 2)
			.translatePolar(aN2 - pi2, param.C3);
		// noseInt
		const aN3 = Math.atan2(param.H1, -param.W1);
		const L1dx = E1 / Math.tan(aN3 / 2);
		const H2dy = E1 / Math.tan((3 * pi2 - aN3) / 2);
		const aN4 = pi2 + Math.atan2(param.W3, param.H3);
		const H3dy = E1 / Math.tan(aN4 / 2);
		const W3dx = E1 / Math.tan((3 * pi2 - aN4) / 2);
		const W3b = param.W3 - E1 + W3dx;
		const H3b = param.H3 - E1 + H3dy;
		const p1b = point(0, 0)
			.translate(-W3b / 2, H3b / 2)
			.translatePolar(aN1 - pi2, param.C3);
		const p2b = point(0, 0)
			.translate(-W3b / 2, -H3b / 2)
			.translatePolar(aN2 - pi2, param.C3);
		const iR1 = Math.max(0, param.R1 - E1);
		const iR2 = Math.max(0, param.R2 - E1);
		const iR3 = Math.max(0, param.R3 - E1);
		const iR4 = Math.max(0, param.R4 - E1);
		// wheels
		const R7 = param.D7 / 2;
		const R8 = param.D8 / 2;
		const posXwheel1 = L12 - param.W8;
		const posXwheel2 = posXwheel1 - param.W7;
		// top
		const L5 = Lroof - 2 * param.W4;
		const L52 = L5 / 2;
		const posYtop = param.H0 + param.H1 + param.H2 + param.H3;
		const posYtop2 = posYtop + param.H5;
		const heightTot = posYtop2 + E1;
		const Ltotal = param.L1 + 2 * param.W1;
		// batterie
		const posYbatterie = param.H6 + E1;
		const LbatInt = Lbatterie - 2 * E1;
		const LbatInt2 = LbatInt / 2;
		const HbatInt = Hbatterie - E1;
		// wheels
		const WW12 = param.WW1 / 2;
		const WW22 = param.WW2 / 2;
		const posYwheels = WW12 - WW22 - param.WW3;
		const posXwheels = [-posXwheel1, -posXwheel2, posXwheel1, posXwheel2];
		// step-5 : checks on the parameter values
		if (param.L1 - 2 * Wwheels < 2 * E1) {
			throw `err176: L1 ${ffix(param.L1)} is too small compare to W6 ${ffix(param.W6)}, W7 ${ffix(param.W7)} and W8 ${ffix(param.W8)} mm`;
		}
		if (Hbatterie < E1) {
			throw `err114: Hbatterie ${ffix(Hbatterie)} is too small compare to E1 ${ffix(E1)} mm`;
		}
		if (Lbatterie < 2 * E1) {
			throw `err118: Lbatterie ${ffix(Lbatterie)} is too small compare to E1 ${ffix(E1)} mm`;
		}
		if (L5 < 3 * param.R5 + param.W5) {
			throw `err122: L5 ${ffix(L5)} is too small compare to W5 ${ffix(param.W5)} and R5 ${ffix(param.R5)}mm`;
		}
		// step-6 : any logs
		rGeome.logstr += `Platform surface: ${ffix(platSurface)} m2, height: ${ffix(heightTot / 1000)} m\n`;
		rGeome.logstr += `Lroof: ${ffix(Lroof)}, L5: ${ffix(L5)} mm\n`;
		rGeome.logstr += `Ltotal: ${ffix(Ltotal / 1000)} m\n`;
		rGeome.logstr += `Batterie: LbatInt ${ffix(LbatInt)}, HbatInt: ${ffix(HbatInt)}, WW1 ${ffix(param.WW1)} mm\n`;
		//rGeome.logstr += `dbg134: p1.cx ${ffix(p1.cx)} p2.cx ${ffix(p2.cx)}\n`;
		// step-7 : drawing of the figures
		// sub-function
		// figNoseExt
		const ctrNoseExt = contour(-L12, param.H0)
			.addSegStrokeR(Wwheels, 0)
			.addSegStrokeR(0, -Hbatterie)
			.addSegStrokeR(Lbatterie, 0)
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
		const ctrNoseInt = contour(-L12 + L1dx, param.H0 + E1)
			.addSegStrokeR(2 * L12 - 2 * L1dx, 0)
			.addCornerRounded(iR1)
			.addSegStrokeR(param.W1 - E1 + L1dx, param.H1 - E1 + H2dy)
			.addCornerRounded(iR2)
			.addSegStrokeR(0, param.H2 - 2 * H2dy)
			.addCornerRounded(iR3)
			//.addSegStrokeR(-W3b, H3b)
			.addPointR(p1b.cx, p1b.cy)
			.addPointR(-W3b, H3b)
			.addSegArc2()
			.addCornerRounded(iR4)
			.addSegStrokeR(-Lroof + 2 * W3dx, 0)
			.addCornerRounded(iR4)
			//.addSegStrokeR(-W3b, -H3b)
			.addPointR(p2b.cx, p2b.cy)
			.addPointR(-W3b, -H3b)
			.addSegArc2()
			.addCornerRounded(iR3)
			.addSegStrokeR(0, -param.H2 + 2 * H2dy)
			.addCornerRounded(iR2)
			//.addSegStrokeR(param.W1 - E1 + L1dx, -param.H1 + E1 - H2dy)
			.closeSegStroke()
			.addCornerRounded(iR1);
		const ctrBatterie = ctrRectangle(-LbatInt2, posYbatterie, LbatInt, HbatInt);
		figNoseExt.addMainOI([ctrNoseExt, ctrNoseInt, ctrBatterie]);
		figNoseExt.addSecond(contourCircle(-posXwheel1, R7, R7));
		figNoseExt.addSecond(contourCircle(-posXwheel1, R7, R8));
		figNoseExt.addSecond(contourCircle(-posXwheel2, R7, R7));
		figNoseExt.addSecond(contourCircle(-posXwheel2, R7, R8));
		figNoseExt.addSecond(contourCircle(posXwheel1, R7, R7));
		figNoseExt.addSecond(contourCircle(posXwheel1, R7, R8));
		figNoseExt.addSecond(contourCircle(posXwheel2, R7, R7));
		figNoseExt.addSecond(contourCircle(posXwheel2, R7, R8));
		figNoseExt.addSecond(ctrRectangle(-L52, posYtop, L5, param.H5));
		figNoseExt.addSecond(ctrRectangle(-L52 - param.S5, posYtop2, L5 + 2 * param.S5, E1));
		// figWheels
		function ctrWheels(sign: number): tContour {
			const rCtr = contour(0, posYwheels)
				.addSegStrokeR(sign * R7, 0)
				.addSegStrokeR(0, param.WW3)
				.addSegStrokeR(sign * (R8 - R7), 0)
				.addSegStrokeR(0, 2 * WW22)
				.addSegStrokeR(-sign * (R8 - R7), 0)
				.addSegStrokeR(0, param.WW3)
				.addSegStrokeR(-sign * R7, 0)
				.closeSegStroke();
			return rCtr;
		}
		figWheels.addMainO(ctrWheels(1));
		figWheels.addSecond(ctrWheels(-1));
		// final figure list
		rGeome.fig = {
			faceNoseExt: figNoseExt,
			faceWheels: figWheels
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
				},
				{
					outName: `subpax_${designName}_wheel1`,
					face: `${designName}_faceWheels`,
					extrudeMethod: EExtrude.eRotate,
					rotate: [0, 0, 0],
					translate: [posXwheels[0], R7, 0]
				},
				{
					outName: `subpax_${designName}_wheel2`,
					face: `${designName}_faceWheels`,
					extrudeMethod: EExtrude.eRotate,
					rotate: [0, 0, 0],
					translate: [posXwheels[1], R7, 0]
				},
				{
					outName: `subpax_${designName}_wheel3`,
					face: `${designName}_faceWheels`,
					extrudeMethod: EExtrude.eRotate,
					rotate: [0, 0, 0],
					translate: [posXwheels[2], R7, 0]
				},
				{
					outName: `subpax_${designName}_wheel4`,
					face: `${designName}_faceWheels`,
					extrudeMethod: EExtrude.eRotate,
					rotate: [0, 0, 0],
					translate: [posXwheels[3], R7, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [
						`subpax_${designName}_noseExt`,
						`subpax_${designName}_wheel1`,
						`subpax_${designName}_wheel2`,
						`subpax_${designName}_wheel3`,
						`subpax_${designName}_wheel4`
					]
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
