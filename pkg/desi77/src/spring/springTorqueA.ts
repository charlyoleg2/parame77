// springTorqueA.ts
// a spring disc for torque transmission

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
	pCheckbox,
	//pDropdown,
	pSectionSeparator,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';
//import { triLALrL, triALLrL, triLLLrA } from 'triangule';
//import { triALLrL } from 'triangule';

const pDef: tParamDef = {
	partName: 'springTorqueA',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1', 'mm', 20, 1, 1000, 1),
		pNumber('N1', 'hole', 16, 0, 60, 1),
		pNumber('T1', 'mm', 2, 0.1, 50, 0.1),
		pNumber('E1', 'mm', 1, 0.1, 50, 0.1),
		pSectionSeparator('External ring'),
		pCheckbox('Ring2', true),
		pNumber('D2', 'mm', 80, 1, 1000, 1),
		pNumber('N2', 'hole', 16, 0, 60, 1),
		pNumber('T2', 'mm', 2, 0.1, 50, 0.1),
		pNumber('E2', 'mm', 1, 0.1, 50, 0.1),
		pSectionSeparator('Spoke'),
		pNumber('N3', 'spoke', 5, 0, 60, 1),
		pNumber('E3', 'mm', 3, 0.1, 100, 0.1),
		pNumber('R3', 'mm', 3, 0, 100, 0.1),
		pNumber('Th', 'mm', 3, 0.1, 100, 0.1)
	],
	paramSvg: {
		D1: 'springTorqueA_profile.svg',
		N1: 'springTorqueA_profile.svg',
		T1: 'springTorqueA_profile.svg',
		E1: 'springTorqueA_profile.svg',
		Ring2: 'springTorqueA_profile.svg',
		D2: 'springTorqueA_profile.svg',
		N2: 'springTorqueA_profile.svg',
		T2: 'springTorqueA_profile.svg',
		E2: 'springTorqueA_profile.svg',
		N3: 'springTorqueA_profile.svg',
		E3: 'springTorqueA_profile.svg',
		R3: 'springTorqueA_profile.svg',
		Th: 'springTorqueA_profile.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figProfile = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const R1 = param.D1 / 2;
		const RT1 = param.T1 / 2;
		const R2 = param.D2 / 2;
		const RT2 = param.T2 / 2;
		const Rmax = param.Ring2 ? R2 + RT2 + param.E2 : R1 + RT1 + param.E1;
		const Rmin = R1 - RT1 - param.E1;
		// step-5 : checks on the parameter values
		if (R1 + RT1 + param.E1 + param.R3 > R2 - RT2 - param.E2) {
			throw `err087: D2 ${param.D2} is too small compare to D1 ${param.D1}, R3 ${param.R3}`;
		}
		if (Rmin < 0.1) {
			throw `err093: D1 ${param.D1} is too small compare to T1 ${param.T1}, E1 ${param.E1}`;
		}
		// step-6 : any logs
		rGeome.logstr += `Rmax ${ffix(Rmax)}, Rmin ${ffix(Rmin)} mm\n`;
		// sub-function
		// figProfile
		const ctrExt = contourCircle(0, 0, Rmax);
		const ctrInt = contourCircle(0, 0, Rmin);
		figProfile.addMainOI([ctrExt, ctrInt]);
		// final figure list
		rGeome.fig = {
			faceProfile: figProfile
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_profile`,
					face: `${designName}_faceProfile`,
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
					inList: [`subpax_${designName}_profile`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'springTorqueA drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const springTorqueADef: tPageDef = {
	pTitle: 'springTorqueA',
	pDescription: 'spring disc for torque transmission',
	pDef: pDef,
	pGeom: pGeom
};

export { springTorqueADef };
