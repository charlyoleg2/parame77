// trackXZ.ts
// simulation of train-capsule on XZ-track

import type {
	//tContour,
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
	//point,
	//contour,
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
//import { triALLrLAA } from 'triangule';

const pDef: tParamDef = {
	partName: 'trackXZ',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('W1', 'mm', 1000, 10, 2000, 1),
		pNumber('T1', 'mm', 80, 1, 200, 1),
		pNumber('S1', 'mm', 200, 1, 500, 1),
		pNumber('B1', 'mm', 200, 2, 500, 1),
		pNumber('B2', 'mm', 300, 2, 1000, 1),
		pNumber('H1', 'mm', 100, 1, 500, 1),
		pNumber('H2', 'mm', 200, 1, 500, 1),
		pSectionSeparator('Slope'),
		pNumber('a1', 'degree', 30, -180, 180, 1),
		pNumber('a3', 'degree', -120, -180, 180, 1),
		pNumber('a5', 'degree', 70, -180, 180, 1),
		pNumber('L1', 'm', 30, 0.01, 200, 0.01),
		pNumber('L2', 'm', 1, 0.01, 200, 0.01),
		pNumber('L3', 'm', 20, 0.01, 200, 0.01),
		pNumber('L4', 'm', 20, 0.01, 200, 0.01),
		pNumber('L5', 'm', 20, 0.01, 200, 0.01)
	],
	paramSvg: {
		W1: 'trackXZ_section.svg',
		T1: 'trackXZ_section.svg',
		S1: 'trackXZ_top.svg',
		B1: 'trackXZ_top.svg',
		B2: 'trackXZ_top.svg',
		H1: 'trackXZ_side.svg',
		H2: 'trackXZ_side.svg',
		a0: 'trackXZ_slope.svg',
		a1: 'trackXZ_slope.svg',
		a2: 'trackXZ_slope.svg',
		L1: 'trackXZ_slope.svg',
		L2: 'trackXZ_slope.svg',
		L3: 'trackXZ_slope.svg',
		L4: 'trackXZ_slope.svg',
		L5: 'trackXZ_slope.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figSection = figure();
	const figTop = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Ltot = param.L1 + param.L2 + param.L3 + param.L4 + param.L5;
		// conversion in meters
		const H1 = param.H1 / 1000; // m
		const H2 = param.H2 / 1000;
		const W12 = param.W1 / 2000;
		const T1 = param.T1 / 1000;
		const S1 = param.S1 / 1000;
		const Wbeam2 = param.B1 / 2000; // m
		const Lbeam2 = W12 + T1 + S1; // m
		const Bstep = (param.B1 + param.B2) / 1000; // m
		// slope angles
		const a1 = degToRad(param.a1);
		const a3 = degToRad(param.a3);
		const a5 = degToRad(param.a5);
		const aMin = degToRad(0.1);
		const aDiff13 = Math.abs(a3 - a1);
		const aDiff35 = Math.abs(a5 - a3);
		const aDiffMax = Math.max(aDiff13, aDiff35);
		// step-5 : checks on the parameter values
		if (aDiff13 < aMin) {
			throw `err107: a1 ${ffix(param.a1)} and a3 ${ffix(param.a3)} (degree) are too closed`;
		}
		if (aDiff35 < aMin) {
			throw `err107: a3 ${ffix(param.a3)} and a5 ${ffix(param.a5)} (degree) are too closed`;
		}
		// step-6 : any logs
		rGeome.logstr += `Slope length: ${ffix(Ltot)} m\n`;
		rGeome.logstr += `Slope max transition: aDiffMax ${ffix(radToDeg(aDiffMax))} degree\n`;
		// sub-function
		// figSection
		figSection.addSecond(ctrRectangle(-Lbeam2, 0, 2 * Lbeam2, H1));
		figSection.addMainO(ctrRectangle(-Lbeam2 + S1, H1, T1, H2));
		figSection.addMainO(ctrRectangle(W12, H1, T1, H2));
		// figTop
		for (let ii = 0; ii < 11; ii++) {
			figTop.addSecond(ctrRectangle(ii * Bstep, 0, 2 * Wbeam2, H1));
		}
		figTop.addMainO(ctrRectangle(0, H1, 2 * Wbeam2 + 10 * Bstep, H2));
		// final figure list
		rGeome.fig = {
			faceTop: figTop,
			faceSection: figSection
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_beam`,
					face: `${designName}_faceBeam`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: 2 * Lbeam2,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_beam`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'trackXZ drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const trackXZDef: tPageDef = {
	pTitle: 'trackXZ',
	pDescription: 'simulation of train-capsule on XZ-track',
	pDef: pDef,
	pGeom: pGeom
};

export { trackXZDef };
