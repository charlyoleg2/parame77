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
	point,
	contour,
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
		pNumber('L9', 'mm', 8000, 1000, 20000, 1),
		pSectionSeparator('Bottom details'),
		pNumber('E1', 'mm', 10, 1, 100, 1),
		pNumber('E2', 'mm', 10, 1, 100, 1),
		pNumber('E3', 'mm', 10, 1, 100, 1),
		pNumber('S1', 'mm', 100, 1, 500, 1),
		pNumber('S3', 'mm', 100, 1, 500, 1),
		pSectionSeparator('Fixation'),
		pNumber('N2', 'holes', 24, 1, 500, 1),
		pNumber('D2', 'mm', 40, 1, 400, 1),
		pNumber('W1', 'mm', 20, 1, 400, 1),
		pSectionSeparator('Door'),
		pNumber('H1H', 'mm', 1500, 100, 3000, 1),
		pNumber('H1W', 'mm', 600, 100, 1000, 1),
		pNumber('H1P', 'mm', 300, 100, 2000, 1),
		pSectionSeparator('Junction'),
		pNumber('Z3', 'mm', 300, 100, 2000, 1),
		pNumber('Z4', 'mm', 300, 100, 2000, 1),
		pSectionSeparator('Top details'),
		pNumber('L4', 'mm', 300, 100, 2000, 1),
		pNumber('E4', 'mm', 300, 100, 2000, 1),
		pNumber('E5', 'mm', 300, 100, 2000, 1),
		pNumber('E6', 'mm', 300, 100, 2000, 1),
		pNumber('D6', 'mm', 300, 100, 2000, 1),
		pNumber('H6', 'mm', 300, 100, 2000, 1),
		pNumber('E7', 'mm', 300, 100, 2000, 1),
		pNumber('D7', 'mm', 300, 100, 2000, 1),
		pNumber('W8', 'mm', 300, 100, 2000, 1),
		pNumber('L8', 'mm', 300, 100, 2000, 1)
	],
	paramSvg: {
		L1: 'heliostat_bottom.svg',
		D1: 'heliostat_bottom.svg',
		D3: 'heliostat_bottom.svg',
		L9: 'heliostat_junction.svg',
		E1: 'heliostat_bottom.svg',
		E2: 'heliostat_bottom.svg',
		E3: 'heliostat_bottom.svg',
		S1: 'heliostat_bottom.svg',
		S3: 'heliostat_bottom.svg',
		N2: 'heliostat_fixation.svg',
		D2: 'heliostat_fixation.svg',
		W1: 'heliostat_fixation.svg',
		H1H: 'heliostat_bottom.svg',
		H1W: 'heliostat_bottom.svg',
		H1P: 'heliostat_bottom.svg',
		Z3: 'heliostat_junction.svg',
		Z4: 'heliostat_junction.svg',
		L4: 'heliostat_top.svg',
		E4: 'heliostat_top.svg',
		E5: 'heliostat_top.svg',
		E6: 'heliostat_top.svg',
		D6: 'heliostat_top.svg',
		H6: 'heliostat_top.svg',
		E7: 'heliostat_top.svg',
		D7: 'heliostat_top.svg',
		W8: 'heliostat_top.svg',
		L8: 'heliostat_top.svg'
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
	const figBottomPole = figure();
	const figDoor = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const pi2 = Math.PI / 2;
		const H1W2 = param.H1W / 2;
		const H1h = param.H1H - 2 * H1W2;
		const R1 = param.D1 / 2;
		const R3 = param.D3 / 2;
		const L1b = param.L1 - param.E1;
		const inclination = Math.atan2(L1b, R1 - R3);
		const S1b = param.E2 / Math.cos(pi2 - inclination);
		const S1c = param.S1 + S1b;
		const R1b = R1 - S1c;
		const S3b = param.E3 / Math.tan(inclination);
		const S3c = param.S3 + S1b - S3b;
		// fixation
		const R2 = param.D2 / 2;
		const lFixation = R1b + param.W1 + R2;
		const aFixation = (2 * Math.PI) / param.N2;
		//rGeome.logstr += `dbg082: ${S1b} ${S1c} ${R1b}\n`;
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
		const fixationHoles: tContour[] = [];
		for (let ii = 0; ii < param.N2; ii++) {
			const pt = point(0, 0).translatePolar(ii * aFixation, lFixation);
			fixationHoles.push(contourCircle(pt.cx, pt.cy, R2));
		}
		figBottomDisc.addMainOI([
			contourCircle(0, 0, R1),
			contourCircle(0, 0, R1b),
			...fixationHoles
		]);
		// figBottomPole
		const ctrBottomPole = contour(R1, 0)
			.addSegStrokeR(0, param.E1)
			.addSegStrokeR(R3 - R1, L1b)
			.addSegStrokeR(-S3c, 0)
			.addSegStrokeR(0, -param.E3)
			.addSegStrokeR(param.S3, 0)
			.addSegStrokeA(R1 - S1b, param.E1)
			.addSegStrokeR(0, -param.E1)
			.closeSegStroke();
		figBottomPole.addMainO(ctrBottomPole);
		// figDoor
		const ctrDoor = contour(H1W2, param.H1P + H1W2)
			.addSegStrokeR(0, H1h)
			.addPointR(-H1W2, H1W2)
			.addPointR(-2 * H1W2, 0)
			.addSegArc2()
			.addSegStrokeR(0, -H1h)
			.addPointR(H1W2, -H1W2)
			.addPointR(2 * H1W2, 0)
			.addSegArc2();
		figDoor.addMainO(ctrDoor);
		// final figure list
		rGeome.fig = {
			faceBottomDisc: figBottomDisc,
			faceBottomPole: figBottomPole,
			faceDoor: figDoor
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
				},
				{
					outName: `subpax_${designName}_bottomPole`,
					face: `${designName}_faceBottomPole`,
					extrudeMethod: EExtrude.eRotate,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_door`,
					face: `${designName}_faceDoor`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: 2 * R1,
					rotate: [pi2, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `ipax_${designName}_pole`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_bottomDisc`, `subpax_${designName}_bottomPole`]
				},
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eSubstraction,
					inList: [`ipax_${designName}_pole`, `subpax_${designName}_door`]
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
