// minimir.ts
// a mirror-support of the heliostat-model

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
	partName: 'minimir',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('L1', 'mm', 50, 10, 2000, 1),
		pNumber('G1', 'mm', 50, 10, 2000, 1),
		pNumber('G2', 'mm', 5, 1, 500, 1),
		pNumber('G3', 'mm', 5, 1, 500, 1),
		pSectionSeparator('Wheel'),
		pNumber('D1', 'mm', 1, 0, 200, 0.5),
		pNumber('D2', 'mm', 2, 0.5, 200, 0.5),
		pNumber('D3', 'mm', 5, 1, 2000, 1),
		pNumber('D4', 'mm', 40, 1, 2000, 1),
		pNumber('D5', 'mm', 50, 1, 2000, 1),
		pNumber('N1', 'arms', 6, 0, 20, 1),
		pNumber('S1', 'mm', 4, 1, 200, 1),
		pNumber('R6', 'mm', 1, 0, 200, 1),
		pSectionSeparator('Frame'),
		pNumber('W1', 'mm', 5, 1, 200, 1),
		pNumber('W2', 'mm', 5, 1, 200, 1),
		pNumber('W3', 'mm', 5, 1, 200, 1),
		pNumber('R7', 'mm', 5, 0, 200, 1),
		pNumber('R8', 'mm', 5, 0, 200, 1),
		pSectionSeparator('Transversal and thickness'),
		pNumber('S2', 'mm', 2, 1, 50, 1),
		pNumber('S3', 'mm', 10, 1, 200, 1),
		pNumber('T1', 'mm', 1, 1, 50, 1),
		pNumber('T2', 'mm', 2, 1, 200, 1),
		pNumber('T3', 'mm', 1, 1, 50, 1)
	],
	paramSvg: {
		L1: 'minimir_top.svg',
		G1: 'minimir_top.svg',
		G2: 'minimir_top.svg',
		G3: 'minimir_top.svg',
		D1: 'minimir_wheel.svg',
		D2: 'minimir_wheel.svg',
		D3: 'minimir_wheel.svg',
		D4: 'minimir_wheel.svg',
		D5: 'minimir_wheel.svg',
		N1: 'minimir_wheel.svg',
		S1: 'minimir_wheel.svg',
		R6: 'minimir_wheel.svg',
		W1: 'minimir_top.svg',
		W2: 'minimir_top.svg',
		W3: 'minimir_top.svg',
		R7: 'minimir_top.svg',
		R8: 'minimir_top.svg',
		S2: 'minimir_wheel.svg',
		S3: 'minimir_wheel.svg',
		T1: 'minimir_wheel.svg',
		T2: 'minimir_wheel.svg',
		T3: 'minimir_wheel.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figWheel = figure();
	const figFrame = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const R1 = param.D1 / 2;
		const R2 = param.D2 / 2;
		const R3 = param.D3 / 2;
		const R4 = param.D4 / 2;
		const R5 = param.D5 / 2;
		const Lww = 2 * param.T1 + 2 * param.G2 + param.G1;
		const Laxis = Lww + 2 * param.G3;
		const wha2 = param.N1 > 0 ? Math.PI / param.N1 : 1;
		const S12 = param.S1 / 2;
		let R3b = R3;
		if (R3b < S12) {
			R3b = S12;
			rGeome.logstr += `warn116: R3 is updated from ${ffix(R3)} to ${ffix(R3b)} mm\n`;
		}
		const wha3 = Math.asin(S12 / R3b);
		const wha4 = Math.asin(S12 / R4);
		const wh3R = S12 / Math.sin(wha2);
		const wh3Rb = param.R6 / Math.sin(wha2);
		const wha3b = Math.asin(param.R6 / (wh3R + wh3Rb));
		const wh3n4 = wha3b > wha2 - wha3;
		const minDiff = 0.1;
		// step-5 : checks on the parameter values
		if (param.D2 < param.D1 + minDiff) {
			throw `err114: D2 ${param.D2} is too small compare to D1 ${param.D1}`;
		}
		// step-6 : any logs
		rGeome.logstr += `Lww: ${ffix(Lww)} mm, Laxis: ${ffix(Laxis)} mm\n`;
		// sub-function
		// figWheel
		const ctrCircle1 = contourCircle(0, 0, R1);
		const ctrCircle2 = contourCircle(0, 0, R2);
		const ctrCircle3 = contourCircle(0, 0, R3b);
		const ctrCircle4 = contourCircle(0, 0, R4);
		const ctrCircle5 = contourCircle(0, 0, R5);
		const wHollow: tContour[] = [];
		for (let ii = 0; ii < param.N1; ii++) {
			const ia = ii * 2 * wha2;
			const pt = point(0, 0).translatePolar(ia + wha4, R4);
			const iCtr = contour(pt.cx, pt.cy)
				.addCornerRounded(param.R6)
				.addPointAP(ia + wha2, R4)
				.addPointAP(ia + 2 * wha2 - wha4, R4)
				.addSegArc2()
				.addCornerRounded(param.R6);
			if (wh3n4) {
				iCtr.addSegStrokeAP(ia + wha2, wh3R).addCornerRounded(param.R6);
			} else {
				iCtr.addSegStrokeAP(ia + 2 * wha2 - wha3, R3b)
					.addCornerRounded(param.R6)
					.addPointAP(ia + wha2, R3b)
					.addPointAP(ia + wha3, R3b)
					.addSegArc2()
					.addCornerRounded(param.R6);
			}
			iCtr.closeSegStroke();
			wHollow.push(iCtr);
		}
		figWheel.addMainOI([ctrCircle5, ctrCircle2, ...wHollow]);
		figWheel.addSecond(ctrCircle4);
		figWheel.addSecond(ctrCircle3);
		figWheel.addSecond(ctrCircle1);
		// figFrame
		const ctrFrameExt = contour(-param.G1 / 2, -param.L1 / 2)
			.addCornerRounded(param.R7)
			.addSegStrokeR(param.G1, 0)
			.addCornerRounded(param.R7)
			.addSegStrokeR(0, param.L1)
			.addCornerRounded(param.R7)
			.addSegStrokeR(-param.G1, 0)
			.addCornerRounded(param.R7)
			.closeSegStroke();
		figFrame.addMainO(ctrFrameExt);
		// final figure list
		rGeome.fig = {
			faceWheel: figWheel,
			faceFrame: figFrame
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_wheel`,
					face: `${designName}_faceWheel`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_wheel`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'minimir drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const minimirDef: tPageDef = {
	pTitle: 'minimir',
	pDescription: 'support of mirror of the heliostat-model',
	pDef: pDef,
	pGeom: pGeom
};

export { minimirDef };
