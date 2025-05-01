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
		pNumber('H1', 'mm', 5, 1, 100, 1),
		pNumber('H2', 'mm', 15, 1, 100, 1),
		pNumber('Th', 'mm', 1, 0.1, 10, 0.1),
		pCheckbox('make3D', true),
		pNumber('D1', 'mm', 5, 1, 100, 1),
		pSectionSeparator('Tooth profile')
	],
	paramSvg: {
		H1: 'springOne_face.svg',
		H2: 'springOne_spring.svg',
		Th: 'springOne_side.svg',
		D1: 'springOne_side.svg',
		make3D: 'springOne_top.svg'
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
