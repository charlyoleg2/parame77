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
	//point,
	//contour,
	//contourCircle,
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
		pNumber('W6', 'mm', 300, 10, 2000, 1),
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
	const figPlatform = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		//const pi2 = Math.PI / 2;
		const W12 = param.W1 / 2;
		const platSurface = (param.L1 * param.W1) / 10 ** 6;
		// step-5 : checks on the parameter values
		if (param.L1 < param.W1) {
			throw `err176: L1 ${ffix(param.L1)} is too small compare to W1 ${ffix(param.W1)} mm`;
		}
		// step-6 : any logs
		rGeome.logstr += `Platform surface: ${ffix(platSurface)} m2\n`;
		// step-7 : drawing of the figures
		// sub-function
		// figPlatform
		figPlatform.addMainO(ctrRectangle(-W12, 0, 2 * W12, param.E1));
		// final figure list
		rGeome.fig = {
			facePlatform: figPlatform
		};
		// step-8 : recipes of the 3D construction
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_platform`,
					face: `${designName}_facePlatform`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.L1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_platform`]
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
