// pcar.ts
// the envelop of a passager car

import type {
	//tContour,
	tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	tPageDef
	//tSubInst
	//tSubDesign
} from 'geometrix';
import {
	contour,
	contourCircle,
	figure,
	//degToRad,
	//radToDeg,
	//ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
	pSectionSeparator,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';

const pDef: tParamDef = {
	partName: 'pcar',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('LB1', 'mm', 1000, 100, 4000, 1),
		pNumber('LB2', 'mm', 3500, 100, 8000, 1),
		pNumber('LB3', 'mm', 1500, 100, 4000, 1),
		pNumber('LT1', 'mm', 800, 100, 4000, 1),
		pNumber('LT3', 'mm', 1200, 100, 4000, 1),
		pNumber('LT4', 'mm', 1600, 100, 4000, 1),
		pNumber('HF1', 'mm', 600, 100, 3000, 1),
		pNumber('HF3', 'mm', 500, 100, 3000, 1),
		pNumber('HF4', 'mm', 800, 100, 3000, 1),
		pNumber('HB1', 'mm', 800, 100, 3000, 1),
		pSectionSeparator('Wheels'),
		pNumber('HW1', 'mm', 200, 1, 1000, 1),
		pNumber('DW1', 'mm', 100, 1, 500, 1),
		pNumber('DW2', 'mm', 600, 1, 2000, 1),
		pNumber('DW3', 'mm', 800, 1, 2000, 1),
		pNumber('WW1', 'mm', 300, 1, 1000, 1),
		pNumber('WW2', 'mm', 200, 1, 1000, 1),
		pNumber('RW2', 'mm', 50, 1, 1000, 1),
		pSectionSeparator('Side'),
		pNumber('C1', 'mm', 50, 1, 500, 1),
		pNumber('C2', 'mm', 50, 1, 500, 1),
		pNumber('C3', 'mm', 50, 1, 500, 1),
		pNumber('C4', 'mm', 50, 1, 500, 1),
		pNumber('Rs1', 'mm', 100, 1, 500, 1),
		pNumber('Rs2', 'mm', 100, 1, 500, 1),
		pNumber('Rs3', 'mm', 100, 1, 500, 1),
		pNumber('Rs4', 'mm', 100, 1, 500, 1),
		pNumber('Rs5', 'mm', 100, 1, 500, 1),
		pNumber('Rs6', 'mm', 100, 1, 500, 1),
		pNumber('Rs7', 'mm', 100, 1, 500, 1),
		pSectionSeparator('Top'),
		pNumber('Wt1', 'mm', 600, 1, 2000, 1),
		pNumber('Wt2', 'mm', 800, 1, 2000, 1),
		pNumber('Ct1', 'mm', 50, 1, 500, 1),
		pNumber('Ct2', 'mm', 50, 1, 500, 1),
		pNumber('Ct3', 'mm', 50, 1, 500, 1),
		pNumber('Rt1', 'mm', 100, 1, 500, 1),
		pNumber('Rt2', 'mm', 100, 1, 500, 1),
		pSectionSeparator('Front'),
		pNumber('Wf1', 'mm', 800, 1, 2000, 1),
		pNumber('Wf2', 'mm', 150, 1, 1000, 1),
		pNumber('Cf1', 'mm', 50, 1, 500, 1),
		pNumber('Cf2', 'mm', 50, 1, 500, 1),
		pNumber('Cf3', 'mm', 50, 1, 500, 1),
		pNumber('Rf1', 'mm', 100, 1, 500, 1),
		pNumber('Rf2', 'mm', 100, 1, 500, 1),
		pNumber('Rf3', 'mm', 100, 1, 500, 1),
		pSectionSeparator('to be deleted'),
		pNumber('H1', 'mm', 40, 1, 4000, 1),
		pNumber('H2', 'mm', 50, 1, 4000, 1),
		pNumber('radius', 'mm', 10, 1, 4000, 1),
		pNumber('Rc', 'mm', 10, 0, 400, 1)
	],
	paramSvg: {
		LB1: 'pcar_side.svg',
		LB2: 'pcar_side.svg',
		LB3: 'pcar_side.svg',
		LT1: 'pcar_side.svg',
		LT3: 'pcar_side.svg',
		LT4: 'pcar_side.svg',
		HF1: 'pcar_side.svg',
		HF3: 'pcar_side.svg',
		HF4: 'pcar_side.svg',
		HB1: 'pcar_side.svg',
		HW1: 'pcar_side.svg',
		DW1: 'pcar_side.svg',
		DW2: 'pcar_side.svg',
		DW3: 'pcar_side.svg',
		WW1: 'pcar_front.svg',
		WW2: 'pcar_front.svg',
		RW2: 'pcar_front.svg',
		C1: 'pcar_side.svg',
		C2: 'pcar_side.svg',
		C3: 'pcar_side.svg',
		C4: 'pcar_side.svg',
		Rs1: 'pcar_side.svg',
		Rs2: 'pcar_side.svg',
		Rs3: 'pcar_side.svg',
		Rs4: 'pcar_side.svg',
		Rs5: 'pcar_side.svg',
		Rs6: 'pcar_side.svg',
		Rs7: 'pcar_side.svg',
		Wt1: 'pcar_top.svg',
		Wt2: 'pcar_top.svg',
		Ct1: 'pcar_top.svg',
		Ct2: 'pcar_top.svg',
		Ct3: 'pcar_top.svg',
		Ct4: 'pcar_top.svg',
		Rt1: 'pcar_top.svg',
		Rt2: 'pcar_top.svg',
		Wf1: 'pcar_front.svg',
		Wf2: 'pcar_front.svg',
		Cf1: 'pcar_front.svg',
		Cf2: 'pcar_front.svg',
		Cf3: 'pcar_front.svg',
		Rf1: 'pcar_front.svg',
		Rf2: 'pcar_front.svg',
		Rf3: 'pcar_front.svg',
		H1: 'pcar_side.svg',
		H2: 'pcar_side.svg',
		radius: 'pcar_top.svg',
		Rc: 'pcar_front.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figFace = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// figFace
		const face1: tOuterInner = [];
		const ctrPoleFace = contour(-param.H1 / 2, -param.H2 / 2)
			.addCornerRounded(param.Rc)
			.addSegStrokeA(param.H1 / 2, -param.H2 / 2)
			.addSegStrokeA(param.H1 / 2, param.H2 / 2)
			.addCornerRounded(param.Rc)
			.addSegStrokeA(-param.H1 / 2, param.H2 / 2)
			.closeSegStroke();
		face1.push(ctrPoleFace);
		face1.push(contourCircle(0, 0, param.radius));
		figFace.addMainOI(face1);
		// final figure list
		rGeome.fig = {
			faceVoila: figFace
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_top`,
					face: `${designName}_faceVoila`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: 10,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eIdentity,
					inList: [`subpax_${designName}_top`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'pcar drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const pcarDef: tPageDef = {
	pTitle: 'pcar',
	pDescription: 'the envelop of a passager car',
	pDef: pDef,
	pGeom: pGeom
};

export { pcarDef };
