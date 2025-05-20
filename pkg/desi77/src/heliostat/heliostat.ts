// heliostat.ts
// the skeleton of the heliostat

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
	radToDeg,
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
		pNumber('L1', 'mm', 8000, 1000, 20000, 1),
		pNumber('D1', 'mm', 1000, 100, 4000, 1),
		pNumber('D3', 'mm', 600, 100, 2000, 1),
		pSectionSeparator('Door'),
		pNumber('H1H', 'mm', 1500, 100, 3000, 1),
		pNumber('H1W', 'mm', 600, 100, 1000, 1),
		pNumber('H1P', 'mm', 300, 100, 2000, 1)
	],
	paramSvg: {
		L1: 'heliostat_bottom.svg',
		D1: 'heliostat_bottom.svg',
		D3: 'heliostat_bottom.svg',
		H1H: 'heliostat_bottom.svg',
		H1W: 'heliostat_bottom.svg',
		H1P: 'heliostat_bottom.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figBottomDisc = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const H1W2 = param.H1W / 2;
		const H1h = param.H1H - 2 * H1W2;
		const R1 = param.D1 / 2;
		const R3 = param.D3 / 2;
		const inclination = Math.atan2(param.L1, R1 - R3);
		const S1b = param.E2 / Math.cos(inclination);
		const S1c = param.S1 + S1b;
		const R1b = R1 - S1c;
		//const pi2 = Math.PI / 2;
		// step-5 : checks on the parameter values
		if (R1 < R3) {
			throw `err176: D1 ${ffix(param.D1)} is too small compare to D3 ${ffix(param.D3)} mm`;
		}
		if (R1b < 0.1) {
			throw `err183: R1b ${ffix(R1b)} is too small because of ${ffix(param.E2)} or ${ffix(param.S1)} mm`;
		}
		if (H1h < 0.1) {
			throw `err167: H1H ${ffix(param.H1H)} is too small compare to H1W ${ffix(param.H1W)} mm`;
		}
		// step-6 : any logs
		rGeome.logstr += `Cone inclination: ${ffix(radToDeg(inclination))} deg\n`;
		// step-7 : drawing of the figures
		// sub-function
		// figBottomDisc
		//figBottomDisc.addMainOI([contourCircle(0, 0, R1), contourCircle(0, 0, R1b)]);
		figBottomDisc.addMainO(contourCircle(0, 0, R1));
		// final figure list
		rGeome.fig = {
			faceBottomDisc: figBottomDisc
		};
		// step-8 : recipes of the 3D construction
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_bottomDisc`,
					face: `${designName}_faceBottomDisc`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.E1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_bottomDisc`]
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
