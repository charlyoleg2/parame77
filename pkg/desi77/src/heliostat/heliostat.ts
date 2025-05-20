// heliostat.ts
// the skeleton of the heliostat

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
	partName: 'heliostat',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('WA', 'cm', 1000, 100, 2000, 1),
		pNumber('WB', 'cm', 800, 100, 2000, 1),
		pNumber('WC', 'cm', 800, 100, 2000, 1),
		pNumber('WD', 'cm', 500, 100, 2000, 1),
		pNumber('WE', 'cm', 400, 100, 2000, 1),
		pSectionSeparator('Heights'),
		pNumber('HA1', 'cm', 400, 200, 2000, 1),
		pNumber('HA2', 'cm', 1200, 200, 2000, 1),
		pNumber('HB1', 'cm', 600, 200, 2000, 1),
		pNumber('HB2', 'cm', 1100, 200, 2000, 1),
		pNumber('HC1', 'cm', 700, 200, 2000, 1),
		pNumber('HC2', 'cm', 600, 200, 2000, 1),
		pNumber('HD1', 'cm', 700, 200, 2000, 1),
		pNumber('HD2', 'cm', 600, 200, 2000, 1),
		pNumber('HE1', 'cm', 1000, 200, 2000, 1),
		pNumber('HE2', 'cm', 600, 200, 2000, 1),
		pSectionSeparator('L-Lengths'),
		pNumber('L1', 'cm', 1200, 200, 2000, 1),
		pNumber('L2', 'cm', 200, 200, 2000, 1),
		pNumber('L3', 'cm', 1500, 200, 2000, 1),
		pNumber('S1', 'cm', 200, 50, 2000, 1),
		pNumber('S2', 'cm', 300, 50, 2000, 1),
		pNumber('S3', 'cm', 100, 50, 2000, 1),
		pNumber('Ht', 'cm', 400, 50, 2000, 1),
		pSectionSeparator('M-Lengths'),
		pNumber('M1', 'cm', 200, 50, 2000, 1),
		pNumber('M2', 'cm', 400, 50, 2000, 1),
		pNumber('M3', 'cm', 800, 50, 2000, 1),
		pNumber('M4', 'cm', 100, 50, 2000, 1),
		pSectionSeparator('Nest'),
		pNumber('AE1', 'cm', 400, 50, 2000, 1),
		pNumber('AE2', 'cm', 300, 50, 2000, 1),
		pNumber('BE1', 'cm', 400, 50, 2000, 1),
		pNumber('BE2', 'cm', 400, 50, 2000, 1)
	],
	paramSvg: {
		WA: 'heliostat_bottom.svg',
		WB: 'heliostat_bottom.svg',
		WC: 'heliostat_bottom.svg',
		WD: 'heliostat_bottom.svg',
		WE: 'heliostat_bottom.svg',
		HA1: 'heliostat_bottom.svg',
		HA2: 'heliostat_bottom.svg',
		HB1: 'heliostat_bottom.svg',
		HB2: 'heliostat_bottom.svg',
		HC1: 'heliostat_bottom.svg',
		HC2: 'heliostat_bottom.svg',
		HD1: 'heliostat_bottom.svg',
		HD2: 'heliostat_bottom.svg',
		HE1: 'heliostat_bottom.svg',
		HE2: 'heliostat_bottom.svg',
		L1: 'heliostat_bottom.svg',
		L2: 'heliostat_bottom.svg',
		L3: 'heliostat_bottom.svg',
		S1: 'heliostat_bottom.svg',
		S2: 'heliostat_bottom.svg',
		S3: 'heliostat_bottom.svg',
		Ht: 'heliostat_bottom.svg',
		M1: 'heliostat_bottom.svg',
		M2: 'heliostat_bottom.svg',
		M3: 'heliostat_bottom.svg',
		M4: 'heliostat_bottom.svg',
		AE1: 'heliostat_bottom.svg',
		AE2: 'heliostat_bottom.svg',
		BE1: 'heliostat_bottom.svg',
		BE2: 'heliostat_bottom.svg'
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
		const WA2 = param.WA / 2;
		const HAtotal = param.HA1 + param.HA2;
		// step-5 : checks on the parameter values
		if (1 > HAtotal) {
			throw `err167: HBtotal ${ffix(HAtotal)} is too small compare to HAtotal ${ffix(HAtotal)}`;
		}
		// step-6 : any logs
		rGeome.logstr += `HAtotal ${ffix(HAtotal / 100)} m\n`;
		// step-7 : drawing of the figures
		// sub-function
		const pi2 = Math.PI / 2;
		function makeCtrPignon(iW2: number, iH1: number, iH2: number): tContour {
			const rCtr = contour(-iW2, 0)
				.addSegStrokeR(2 * iW2, 0)
				.addSegStrokeR(0, iH1)
				.addSegStrokeR(-iW2, iH2)
				.addSegStrokeR(-iW2, -iH2)
				.closeSegStroke();
			return rCtr;
		}
		// figPA
		figPA.addMainO(makeCtrPignon(WA2, param.HA1, param.HA2));
		// final figure list
		rGeome.fig = {
			facePA: figPA
		};
		// step-8 : recipes of the 3D construction
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_pAw`,
					face: `${designName}_facePA`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: 100,
					rotate: [pi2, 0, 3 * pi2],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_pAw`]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'heliostat drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const heliostatDef: tPageDef = {
	pTitle: 'heliostat',
	pDescription: 'the structure of an heliostat',
	pDef: pDef,
	pGeom: pGeom
};

export { heliostatDef };
