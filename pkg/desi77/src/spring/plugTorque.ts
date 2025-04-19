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
		pNumber('ati', '%', 50, 1, 99, 0.1),
		pNumber('ate', '%', 50, 1, 99, 1),
		pNumber('ah', '%', 100, 1, 400, 1),
		pNumber('dh', '%', 100, 1, 400, 1),
		pNumber('aeh', '%', 10, 0, 100, 1),
		pNumber('deh', '%', 10, 0, 100, 1),
		pNumber('aM', 'degree', 0, -30, 30, 0.1),
		pSectionSeparator('Tooth profile details'),
		pDropdown('SnAai', ['stroke', 'arc']),
		pDropdown('SnAae', ['stroke', 'arc']),
		pDropdown('SnAdi', ['stroke', 'arc']),
		pDropdown('SnAde', ['stroke', 'arc']),
		pNumber('Rai', 'mm', 1, 0.1, 50, 0.1),
		pNumber('Rae', 'mm', 1, 0.1, 50, 0.1),
		pNumber('Rdi', 'mm', 1, 0.1, 50, 0.1),
		pNumber('Rde', 'mm', 1, 0.1, 50, 0.1),
		pSectionSeparator('Internal part'),
		pNumber('Ni', 'holes', 5, 0, 1000, 1),
		pNumber('Di', 'mm', 10, 0.1, 1000, 0.1),
		pNumber('DTi', 'mm', 3, 0.1, 100, 0.1),
		pNumber('Ei', 'mm', 2, 0.1, 100, 0.1),
		pSectionSeparator('External part'),
		pNumber('Ne', 'holes', 5, 0, 1000, 1),
		pNumber('De', 'mm', 50, 0.1, 1000, 0.1),
		pNumber('DTe', 'mm', 3, 0.1, 100, 0.1),
		pNumber('Ee', 'mm', 2, 0.1, 100, 0.1)
	],
	paramSvg: {
		Nt: 'plugTorque_teeth_radial.svg',
		Dt: 'plugTorque_teeth_radial.svg',
		Th: 'plugTorque_parts.svg',
		make3D: 'plugTorque_parts.svg',
		ati: 'plugTorque_teeth_radial.svg',
		ate: 'plugTorque_teeth_radial.svg',
		ah: 'plugTorque_teeth_radial.svg',
		dh: 'plugTorque_teeth_radial.svg',
		aeh: 'plugTorque_teeth_radial.svg',
		deh: 'plugTorque_teeth_radial.svg',
		aM: 'plugTorque_teeth_adden.svg',
		SnAai: 'plugTorque_teeth_radial.svg',
		SnAae: 'plugTorque_teeth_radial.svg',
		SnAdi: 'plugTorque_teeth_radial.svg',
		SnAde: 'plugTorque_teeth_radial.svg',
		Rai: 'plugTorque_teeth_adden.svg',
		Rae: 'plugTorque_teeth_adden.svg',
		Rdi: 'plugTorque_teeth_deden.svg',
		Rde: 'plugTorque_teeth_deden.svg',
		Ni: 'plugTorque_parts.svg',
		Di: 'plugTorque_parts.svg',
		DTi: 'plugTorque_parts.svg',
		Ei: 'plugTorque_parts.svg',
		Ne: 'plugTorque_parts.svg',
		De: 'plugTorque_parts.svg',
		DTe: 'plugTorque_parts.svg',
		Ee: 'plugTorque_parts.svg'
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
