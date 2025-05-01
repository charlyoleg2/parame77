// springOne.ts
// bearing-holder with integated spring

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
//import { triALLrLAA } from 'triangule';

const pDef: tParamDef = {
	partName: 'springOne',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1', 'mm', 6, 1, 100, 0.1),
		pNumber('Dbearing', 'mm', 18, 1, 100, 0.1),
		pNumber('H1', 'mm', 5, 1, 100, 1),
		pNumber('H2', 'mm', 15, 1, 100, 1),
		pNumber('R2', 'mm', 15, 1, 100, 1),
		pNumber('L1', 'mm', 50, 1, 200, 1),
		pNumber('Rc1', 'mm', 5, 0, 50, 1),
		pSectionSeparator('Spring zone'),
		pCheckbox('spring', true),
		pNumber('E1', 'mm', 2, 1, 100, 1),
		pNumber('E2', 'mm', 2, 1, 100, 1),
		pNumber('sNx', 'xHoles', 2, 2, 20, 1),
		pNumber('sNy', 'yHoles', 5, 1, 100, 1),
		pNumber('shPy', '%', 50, 1, 99, 1),
		pNumber('shPr', '%', 100, 0, 100, 1),
		pNumber('smEx', 'mm', 1, 0.1, 10, 0.1),
		pNumber('smExS', 'mm', 0.5, 0.1, 10, 0.1),
		pSectionSeparator('Screw holes'),
		pNumber('D3', 'mm', 2, 1, 100, 1),
		pNumber('P3', 'mm', 40, 1, 200, 1),
		pNumber('P4', 'mm', 20, 1, 200, 1),
		pSectionSeparator('Borders'),
		pNumber('L2', 'mm', 20, 1, 200, 1),
		pNumber('E3', 'mm', 1, 0, 20, 0.1),
		pNumber('W1', 'mm', 20, 1, 200, 1),
		pNumber('W3', 'mm', 50, 1, 400, 1),
		pNumber('Rc3', 'mm', 2, 0, 50, 1),
		pCheckbox('B2', true),
		pNumber('A2', 'mm', 10, 1, 200, 1),
		pNumber('Rc2', 'mm', 5, 0, 50, 1),
		pSectionSeparator('Folding'),
		pNumber('Th', 'mm', 1, 0.1, 10, 0.1),
		pNumber('Jangle', 'degree', 90, 0, 120, 1),
		pNumber('Jradius', 'mm', 2, 0.1, 10, 0.1),
		pNumber('Jneutral', '%', 50, 0, 100, 1),
		pNumber('Jmark', 'mm', 1, 0.1, 10, 0.1)
	],
	paramSvg: {
		D1: 'springOne_face.svg',
		Dbearing: 'springOne_face.svg',
		H1: 'springOne_face.svg',
		H2: 'springOne_face.svg',
		R2: 'springOne_face.svg',
		L1: 'springOne_face.svg',
		Rc1: 'springOne_face.svg',
		spring: 'springOne_spring.svg',
		E1: 'springOne_face.svg',
		E2: 'springOne_face.svg',
		sNx: 'springOne_spring.svg',
		sNy: 'springOne_spring.svg',
		shPy: 'springOne_spring.svg',
		shPr: 'springOne_spring.svg',
		smEx: 'springOne_spring.svg',
		smExS: 'springOne_spring.svg',
		D3: 'springOne_top.svg',
		P3: 'springOne_top.svg',
		P4: 'springOne_top.svg',
		L2: 'springOne_top.svg',
		E3: 'springOne_top.svg',
		W1: 'springOne_top.svg',
		W3: 'springOne_top.svg',
		Rc3: 'springOne_top.svg',
		B2: 'springOne_face.svg',
		A2: 'springOne_face.svg',
		Rc2: 'springOne_side.svg',
		Th: 'springOne_side.svg',
		Jangle: 'springOne_face.svg',
		Jradius: 'springOne_face.svg',
		Jneutral: 'springOne_face.svg',
		Jmark: 'springOne_face.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figSpring = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const R1 = param.D1 / 2;
		// step-5 : checks on the parameter values
		if (R1 < 0.1) {
			throw `err087: R1 ${R1} is too small because of D1 ${param.D1}`;
		}
		// step-6 : any logs
		rGeome.logstr += `Extern: D1 ${ffix(2 * R1)} mm\n`;
		// sub-function
		// figSpring
		figSpring.addMainO(contourCircle(0, 0, R1));
		// final figure list
		rGeome.fig = {
			faceSpring: figSpring
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_spring`,
					face: `${designName}_faceSpring`,
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
					inList: [`subpax_${designName}_spring`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'springOne drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const springOneDef: tPageDef = {
	pTitle: 'springOne',
	pDescription: 'bearing-holder with integated spring',
	pDef: pDef,
	pGeom: pGeom
};

export { springOneDef };
