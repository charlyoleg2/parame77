// rccar.ts
// high-level concept of the rc-car

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
	partName: 'rccar',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('W1', 'mm', 400, 10, 2000, 1),
		pNumber('L1', 'mm', 1000, 100, 8000, 1),
		pSectionSeparator('Platform'),
		pNumber('E1', 'mm', 10, 1, 100, 1),
		pSectionSeparator('Angles'),
		pNumber('a1', 'degree', 45, 10, 80, 1),
		pNumber('a2', 'degree', 45, 10, 80, 1)
	],
	paramSvg: {
		W1: 'rccar_angles.svg',
		L1: 'rccar_angles.svg',
		E1: 'rccar_angles.svg',
		a1: 'rccar_angles.svg',
		a2: 'rccar_angles.svg'
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
		rGeome.logstr += 'RC-car drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const rccarDef: tPageDef = {
	pTitle: 'rccar',
	pDescription: 'high-level concept of the RC-car',
	pDef: pDef,
	pGeom: pGeom
};

export { rccarDef };
