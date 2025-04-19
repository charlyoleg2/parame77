// plugTorque.ts
// plugable torque transmission

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
	contourCircle,
	//ctrRectangle,
	figure,
	//degToRad,
	//radToDeg,
	ffix,
	pNumber,
	//pCheckbox,
	pDropdown,
	pSectionSeparator,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';
//import { triLALrL, triALLrL, triLLLrA } from 'triangule';
//import { triALLrL } from 'triangule';

const pDef: tParamDef = {
	partName: 'plugTorque',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('Nt', 'teeth', 8, 1, 1000, 1),
		pNumber('Dt', 'mm', 20, 0.1, 1000, 0.1),
		pNumber('Th', 'mm', 1, 0.1, 100, 0.1),
		pDropdown('make3D', ['both', 'intern', 'extern']),
		pSectionSeparator('Tooth profile'),
		pNumber('D2', 'mm', 80, 1, 1000, 1),
		pNumber('N2', 'hole', 16, 0, 400, 1),
		pNumber('T2', 'mm', 2, 0.1, 50, 0.1),
		pNumber('E2', 'mm', 1, 0.1, 50, 0.1),
		pSectionSeparator('Spoke'),
		pNumber('N3', 'spoke', 5, 0, 60, 1),
		pNumber('E3', 'mm', 3, 0.1, 100, 0.1),
		pNumber('R3', 'mm', 3, 0, 100, 0.1)
	],
	paramSvg: {
		Nt: 'plugTorque_teeth_radial.svg',
		Dt: 'plugTorque_teeth_adden.svg',
		Th: 'plugTorque_teeth_deden.svg',
		make3D: 'plugTorque_parts.svg',
		D2: 'plugTorque_parts.svg',
		N2: 'plugTorque_parts.svg',
		T2: 'plugTorque_parts.svg',
		E2: 'plugTorque_parts.svg',
		N3: 'plugTorque_parts.svg',
		E3: 'plugTorque_parts.svg',
		R3: 'plugTorque_parts.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figIntern = figure();
	//const figExtern = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Rt = param.Dt / 2;
		// step-5 : checks on the parameter values
		if (Rt < 0) {
			throw `err087: Dt ${param.Dt} is too small compare to Nt ${param.Nt}`;
		}
		// step-6 : any logs
		rGeome.logstr += `Extern: Dmax ${ffix(2 * Rt)} mm\n`;
		// sub-function
		// figIntern
		figIntern.addMainO(contourCircle(0, 0, Rt));
		// final figure list
		rGeome.fig = {
			faceIntern: figIntern
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_intern`,
					face: `${designName}_faceIntern`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.Th,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eIdentity,
					inList: [`subpax_${designName}_intern`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'plugTorque drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const plugTorqueDef: tPageDef = {
	pTitle: 'plugTorque',
	pDescription: 'plugable torque transmission',
	pDef: pDef,
	pGeom: pGeom
};

export { plugTorqueDef };
