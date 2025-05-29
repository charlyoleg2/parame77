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
	degToRad,
	//radToDeg,
	ffix,
	pNumber,
	pCheckbox,
	pDropdown,
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
		pNumber('L1', 'mm', 200, 10, 2000, 1),
		pNumber('N1', 'unit', 4, 1, 12, 1),
		pSectionSeparator('General'),
		pDropdown('gen3D', ['all', 'platform', 'bone', 'hand', 'motor', 'wheel']),
		pNumber('F1', 'mm', 180, 1, 1000, 1),
		pNumber('H1', 'mm', 200, 10, 2000, 1),
		pNumber('T1', 'mm', 10, 1, 100, 1),
		pNumber('E1', 'mm', 10, 1, 100, 1),
		pSectionSeparator('Platform'),
		pNumber('W2', 'mm', 100, 10, 2000, 1),
		pCheckbox('triangleInt', true),
		pCheckbox('triangleExt', true),
		pSectionSeparator('Bone'),
		pNumber('D1', 'mm', 20, 1, 200, 1),
		pNumber('D2', 'mm', 40, 1, 200, 1),
		pNumber('W3', 'mm', 30, 1, 200, 1),
		pNumber('L2', 'mm', 150, 1, 200, 1),
		pNumber('E2', 'mm', 10, 1, 500, 1),
		pSectionSeparator('Unit'),
		pNumber('Dwheel', 'mm', 200, 10, 2000, 1),
		pNumber('Z1', 'mm', 100, 10, 2000, 1),
		pNumber('Z2', 'mm', 160, 10, 2000, 1),
		pNumber('Lwheel', 'mm', 100, 10, 2000, 1),
		pNumber('E3', 'mm', 30, 1, 500, 1),
		pNumber('Lmotor', 'mm', 120, 10, 1000, 1),
		pNumber('Dsteering', 'mm', 40, 1, 500, 1),
		pNumber('Daxis', 'mm', 20, 1, 500, 1),
		pSectionSeparator('Angles'),
		pNumber('a1x', 'degree', 45, 10, 80, 1),
		pNumber('a2x', 'degree', 45, 10, 80, 1),
		pNumber('a11', 'degree', 45, 10, 80, 1),
		pNumber('a21', 'degree', 45, 10, 80, 1),
		pNumber('rx', 'cm', 0, -1000, 1000, 1),
		pNumber('ry', 'cm', 0, -1000, 1000, 1)
	],
	paramSvg: {
		W1: 'rccar_all_xz.svg',
		L1: 'rccar_all_xy.svg',
		N1: 'rccar_all_xy.svg',
		gen3D: 'rccar_all_xy.svg',
		F1: 'rccar_one_xy.svg',
		H1: 'rccar_platform_xz.svg',
		T1: 'rccar_one_xy.svg',
		E1: 'rccar_one_xy.svg',
		W2: 'rccar_platform_xz.svg',
		triangleInt: 'rccar_all_xy.svg',
		triangleExt: 'rccar_all_xy.svg',
		D1: 'rccar_bone.svg',
		D2: 'rccar_bone.svg',
		W3: 'rccar_bone.svg',
		L2: 'rccar_bone.svg',
		E2: 'rccar_motor_xz.svg',
		Dwheel: 'rccar_motor_xz.svg',
		Z1: 'rccar_motor_xz.svg',
		Z2: 'rccar_motor_xz.svg',
		Lwheel: 'rccar_motor_xz.svg',
		E3: 'rccar_motor_xz.svg',
		Lmotor: 'rccar_motor_xz.svg',
		Dsteering: 'rccar_motor_xz.svg',
		Daxis: 'rccar_motor_xz.svg',
		a1x: 'rccar_all_xz.svg',
		a2x: 'rccar_all_xz.svg',
		a11: 'rccar_all_xz.svg',
		a21: 'rccar_all_xz.svg',
		rx: 'rccar_all_xy.svg',
		ry: 'rccar_all_xy.svg'
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
		const Ltotal = param.N1 * (param.L1 + param.T1) + param.T1;
		const platSurface = (Ltotal * param.W1) / 10 ** 6;
		const Rwheel = param.Dwheel / 2;
		//const Raxis = param.Daxis / 2;
		//const Rsteering = param.Dsteering / 2;
		const A1x = degToRad(param.a1x);
		const posZplatform = Rwheel + param.Z1 + param.L2 * Math.sin(A1x);
		const Hplatform = posZplatform + param.H1;
		// step-5 : checks on the parameter values
		if (param.L1 < param.F1) {
			throw `err176: L1 ${ffix(param.L1)} is too small compare to F1 ${ffix(param.F1)} mm`;
		}
		if (param.H1 < param.Z2 + param.T1) {
			throw `err130: H1 ${ffix(param.H1)} is too small compare to Z2 ${ffix(param.Z2)} and T1 ${ffix(param.T1)} mm`;
		}
		// step-6 : any logs
		rGeome.logstr += `Platform Ltotal ${ffix(Ltotal / 1000)} m, surface ${ffix(platSurface)} m2\n`;
		rGeome.logstr += `Hplatform ${ffix(Hplatform)} mm\n`;
		// step-7 : drawing of the figures
		// sub-function
		// figPlatform
		figPlatform.addMainO(ctrRectangle(-W12, 0, 2 * W12, param.T1));
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
