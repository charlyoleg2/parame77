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
		pNumber('H1', 'mm', 40, 1, 4000, 1),
		pNumber('H2', 'mm', 50, 1, 4000, 1),
		pNumber('radius', 'mm', 10, 1, 4000, 1),
		pSectionSeparator('corners'),
		pNumber('Rc', 'mm', 10, 0, 400, 1)
	],
	paramSvg: {
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
