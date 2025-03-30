// door1arc.ts
// door or window with a 1-arc vault

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
	partName: 'door1arc',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('W1', 'mm', 40, 1, 4000, 1),
		pNumber('H1', 'mm', 50, 1, 4000, 1),
		pNumber('H2p', '%', 50, 1, 100, 1),
		pSectionSeparator('brick'),
		pNumber('bW', 'mm', 400, 10, 1000, 1),
		pNumber('bH', 'mm', 200, 10, 1000, 1),
		pNumber('T1', 'mm', 200, 10, 1000, 1)
	],
	paramSvg: {
		W1: 'door1Arc_nArcs.svg',
		H1: 'door1Arc_nArcs.svg',
		H2p: 'door1Arc_face.svg',
		bH: 'door1Arc_face.svg',
		bW: 'door1Arc_face.svg',
		T1: 'door1Arc_nArcs.svg'
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
		const ctrPoleFace = contour(-param.H1 / 2, -param.H2p / 2)
			.addSegStrokeA(param.H1 / 2, -param.H2p / 2)
			.addSegStrokeA(param.H1 / 2, param.H2p / 2)
			.addSegStrokeA(-param.H1 / 2, param.H2p / 2)
			.closeSegStroke();
		face1.push(ctrPoleFace);
		face1.push(contourCircle(0, 0, param.H2p));
		figFace.addMainOI(face1);
		// final figure list
		rGeome.fig = {
			faceDoor: figFace
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_top`,
					face: `${designName}_faceDoor`,
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
					inList: [`subpax_${designName}_top`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'door1arc drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const door1arcDef: tPageDef = {
	pTitle: 'door1arc',
	pDescription: 'A door or a window with a 1-arc vault',
	pDef: pDef,
	pGeom: pGeom
};

export { door1arcDef };
