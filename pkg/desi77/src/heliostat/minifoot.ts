// minifoot.ts
// the holder of the heliostat model

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
	//ctrRectangle,
	figure,
	//degToRad,
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
import { triLALrL, triLLLrA } from 'triangule';

const pDef: tParamDef = {
	partName: 'minifoot',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1', 'mm', 30, 2, 500, 1),
		pNumber('D3', 'mm', 50, 2, 500, 1),
		pNumber('D4', 'mm', 100, 2, 500, 1),
		pNumber('D5', 'mm', 3, 0, 100, 1),
		pNumber('N1', 'foot', 3, 0, 12, 1),
		pSectionSeparator('Heights and details'),
		pNumber('S1', 'mm', 1, 0.1, 5, 0.1),
		pNumber('S5', 'mm', 2, 1, 20, 1),
		pNumber('R3', 'mm', 10, 0, 100, 1),
		pNumber('H1', 'mm', 2, 0.1, 10, 0.1),
		pNumber('H2', 'mm', 10, 0, 100, 1)
	],
	paramSvg: {
		D1: 'minifoot_top.svg',
		D3: 'minifoot_top.svg',
		D4: 'minifoot_top.svg',
		D5: 'minifoot_top.svg',
		N1: 'minifoot_top.svg',
		S1: 'minifoot_side.svg',
		S5: 'minifoot_top.svg',
		R3: 'minifoot_top.svg',
		H1: 'minifoot_side.svg',
		H2: 'minifoot_side.svg'
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
	const figCylinder = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const R1 = param.D1 / 2;
		const R2 = R1 + param.S1;
		const r3 = param.D3 / 2;
		const R4 = param.D4 / 2;
		const R5 = param.D5 / 2;
		const R6 = R5 + param.S5;
		const an = param.N1 > 0 ? Math.PI / param.N1 : 1;
		const [lAB, triLog1] = triLALrL(r3, an, R4);
		const aBAD = Math.acos(R6 / lAB);
		const [aCAB, triLog2] = triLLLrA(lAB, r3, R4);
		const aCAD = aCAB + aBAD;
		const [lCD, triLog3] = triLALrL(R4, aCAD, R6);
		const [aDCA, triLog4] = triLLLrA(lCD, R6, R4);
		rGeome.logstr += triLog1 + triLog2 + triLog3 + triLog4;
		// case N1 = 1 or N1 = 2
		const lCE = Math.sqrt(R4 ** 2 - R6 ** 2);
		const aACE = Math.acos(lCE / R4);
		const aECF = Math.acos(r3 / lCE);
		const aACF = aACE + aECF;
		// step-5 : checks on the parameter values
		if (r3 < R2) {
			throw `err098: D3 ${param.D3} is too small compare to D1 ${param.D1} and S1 ${param.S1}`;
		}
		if (R4 < r3) {
			throw `err101: D4 ${param.D4} is too small compare to D3 ${param.D3}`;
		}
		// step-6 : any logs
		rGeome.logstr += `aCAD ${ffix(radToDeg(aCAD))}, aDCA ${ffix(radToDeg(aDCA))} degree\n`;
		// sub-function
		// figFoot
		function ctrFoot3(): tContour {
			const rCtr = contour(r3, 0);
			for (let ii = 0; ii < param.N1; ii++) {
				const ai = ii * an * 2;
				rCtr.addCornerRounded(param.R3)
					.addSegStrokeAP(ai + an - aDCA, lCD)
					.addPointAP(ai + an, R4 + R6)
					.addPointAP(ai + an + aDCA, lCD)
					.addSegArc2()
					.addSegStrokeAP(ai + 2 * an, r3);
			}
			return rCtr;
		}
		function ctrFoot2(): tContour {
			const aInit = an - aACF;
			const pt = point(0, 0).translatePolar(aInit, r3);
			const rCtr = contour(pt.cx, pt.cy);
			for (let ii = 0; ii < param.N1; ii++) {
				const ai = ii * an * 2 + aInit;
				rCtr.addSegStrokeAP(ai + aECF, lCE)
					.addPointAP(ai + aACF, R4 + R6)
					.addPointAP(ai + aACF + aACE, lCE)
					.addSegArc2()
					.addSegStrokeAP(ai + 2 * aACF, r3)
					.addPointAP(ai + an + aACF, r3)
					.addPointAP(ai + 2 * an, r3)
					.addSegArc2();
			}
			return rCtr;
		}
		let ctrFoot: tContour = contourCircle(0, 0, r3);
		if (param.N1 > 0) {
			if (param.N1 > 2 || (param.N1 === 2 && aACF > Math.PI / 2)) {
				ctrFoot = ctrFoot3();
			} else {
				ctrFoot = ctrFoot2();
			}
		}
		const ctrCircle1 = contourCircle(0, 0, R1);
		const ctrCircle2 = contourCircle(0, 0, R2);
		const ctrHoles: tContour[] = [];
		if (R5 > 0) {
			for (let ii = 0; ii < param.N1; ii++) {
				const ai = ii * an * 2 + an;
				const pt = point(0, 0).translatePolar(ai, R4);
				ctrHoles.push(contourCircle(pt.cx, pt.cy, R5));
			}
		}
		figFoot.addMainOI([ctrFoot, ctrCircle1, ...ctrHoles]);
		figFoot.addSecond(ctrCircle2);
		// figCylinder
		figCylinder.addMainOI([ctrCircle2, ctrCircle1]);
		figCylinder.addSecond(ctrFoot);
		// final figure list
		rGeome.fig = {
			faceFoot: figFoot,
			faceCylinder: figCylinder
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_foot`,
					face: `${designName}_faceFoot`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.H1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_cylinder`,
					face: `${designName}_faceCylinder`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.H1 + param.H2,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_foot`, `subpax_${designName}_cylinder`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'minifoot drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const minifootDef: tPageDef = {
	pTitle: 'minifoot',
	pDescription: 'holder of the heliostat model',
	pDef: pDef,
	pGeom: pGeom
};

export { minifootDef };
