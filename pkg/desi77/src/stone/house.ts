// house.ts
// envelop of an house

import type {
	tContour,
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
	contour,
	//contourCircle,
	//ctrRectangle,
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
	partName: 'house',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('WA', 'cm', 600, 100, 2000, 1),
		pNumber('WB', 'cm', 600, 100, 2000, 1),
		pNumber('WC', 'cm', 600, 100, 2000, 1),
		pNumber('WD', 'cm', 600, 100, 2000, 1),
		pSectionSeparator('Heights'),
		pNumber('HA1', 'cm', 500, 200, 2000, 1),
		pNumber('HA2', 'cm', 1100, 200, 2000, 1),
		pNumber('HB1', 'cm', 500, 200, 2000, 1),
		pNumber('HB2', 'cm', 1100, 200, 2000, 1),
		pNumber('HC1', 'cm', 500, 200, 2000, 1),
		pNumber('HC2', 'cm', 1100, 200, 2000, 1),
		pNumber('HD1', 'cm', 500, 200, 2000, 1),
		pNumber('HD2', 'cm', 1100, 200, 2000, 1)
	],
	paramSvg: {
		WA: 'house_top.svg',
		WB: 'house_top.svg',
		WC: 'house_top.svg',
		WD: 'house_top.svg',
		HA1: 'house_pignon.svg',
		HA2: 'house_pignon.svg',
		HB1: 'house_pignon.svg',
		HB2: 'house_pignon.svg',
		HC1: 'house_pignon.svg',
		HC2: 'house_pignon.svg',
		HD1: 'house_pignon.svg',
		HD2: 'house_pignon.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figPA = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		//const WA2 = param.WA / 2;
		//const WB2 = param.WB / 2;
		//const WC2 = param.WC / 2;
		//const WD2 = param.WD / 2;
		const HAtotal = param.HA1 + param.HA2;
		const HBtotal = param.HB1 + param.HB2;
		const HCtotal = param.HC1 + param.HC2;
		const HDtotal = param.HD1 + param.HD2;
		// step-5 : checks on the parameter values
		if (HAtotal < HBtotal) {
			throw `err167: HAtotal ${ffix(HAtotal)} is too small compare to HBtotal ${ffix(HBtotal)}`;
		}
		// step-6 : any logs
		rGeome.logstr += `HAtotal ${ffix(HAtotal / 100)} m\n`;
		rGeome.logstr += `HBtotal ${ffix(HBtotal / 100)} m\n`;
		rGeome.logstr += `HCtotal ${ffix(HCtotal / 100)} m\n`;
		rGeome.logstr += `HDtotal ${ffix(HDtotal / 100)} m\n`;
		// step-7 : drawing of the figures
		// sub-function
		function makeCtrPignon(iW: number, iH1: number, iH2: number): tContour {
			const rCtr = contour(0, 0)
				.addSegStrokeR(iW, 0)
				.addSegStrokeR(0, iH1)
				.addSegStrokeR(-iW / 2, iH2)
				.addSegStrokeR(-iW / 2, -iH2)
				.closeSegStroke();
			return rCtr;
		}
		// pA
		figPA.addMainO(makeCtrPignon(param.WA, param.HA1, param.HA2));
		// final figure list
		rGeome.fig = {
			facePA: figPA
		};
		// step-8 : recipes of the 3D construction
		// volume
		const designName = rGeome.partName;
		const pi2 = Math.PI / 2;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_pA`,
					face: `${designName}_facePA`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.W2,
					rotate: [0, 0, 0],
					translate: [pi2, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_pA`]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'house drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const houseDef: tPageDef = {
	pTitle: 'house',
	pDescription: 'the envelop of an house with large roof',
	pDef: pDef,
	pGeom: pGeom
};

export { houseDef };
