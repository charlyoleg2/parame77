// bridge.ts
// a bridge for the train-capsule

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
	//withinPiPi,
	//ShapePoint,
	//point,
	//contour,
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
//import { triALLrLAA } from 'triangule';

const pDef: tParamDef = {
	partName: 'bridge',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1', 'mm', 100, 5, 500, 1),
		pNumber('Di', 'mm', 50, 2, 500, 1),
		pSectionSeparator('Thickness'),
		pNumber('T1', 'mm', 30, 1, 500, 1)
	],
	paramSvg: {
		D1: 'bridge_panorama.svg',
		Di: 'bridge_column.svg',
		T1: 'bridge_panorama.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figCylinder = figure();
	const figHeight = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Ri = param.Di / 2;
		const R1 = param.D1 / 2;
		const surface = Math.PI * R1 ** 2 - Math.PI * Ri ** 2;
		const volume = surface * param.T1;
		// step-5 : checks on the parameter values
		if (R1 < Ri) {
			throw `err071: D1 ${param.D1} is too small compare to Di ${param.Di}`;
		}
		// step-6 : any logs
		rGeome.logstr += `Surface ${ffix(surface)} mm2, volume ${ffix(volume)} mm3\n`;
		// sub-function
		// figCylinder
		const ctrCylinder = contourCircle(0, 0, R1);
		const ctrHole = contourCircle(0, 0, Ri);
		figCylinder.addMainOI([ctrCylinder, ctrHole]);
		// figHeight
		figHeight.addMainO(ctrRectangle(-R1, 0, 2 * R1, param.T1));
		figHeight.addSecond(ctrRectangle(-Ri, 0, 2 * Ri, param.T1));
		// final figure list
		rGeome.fig = {
			faceCylinder: figCylinder,
			faceHeight: figHeight
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_cyl`,
					face: `${designName}_faceCylinder`,
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
					inList: [`subpax_${designName}_cyl`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'bridge drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const bridgeDef: tPageDef = {
	pTitle: 'bridge',
	pDescription: 'bridge for the train-capsule',
	pDef: pDef,
	pGeom: pGeom
};

export { bridgeDef };
