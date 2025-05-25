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
	pDropdown,
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
		pNumber('L1', 'mm', 4000, 1000, 20000, 1),
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
		pNumber('Z3', 'mm', 200, 1, 500, 1),
		pNumber('Z4', 'mm', 200, 1, 500, 1),
		pDropdown('gen3D', ['Both', 'Top', 'Bottom']),
		pSectionSeparator('Top-trunk details'),
		pNumber('L4', 'mm', 2000, 100, 20000, 1),
		pNumber('E4', 'mm', 10, 1, 100, 1),
		pNumber('E5', 'mm', 10, 1, 100, 1),
		pNumber('H6', 'mm', 600, 100, 2000, 1),
		pNumber('E7', 'mm', 10, 1, 100, 1),
		pNumber('D7', 'mm', 200, 10, 2000, 1),
		pSectionSeparator('Top-branch details'),
		pNumber('E6', 'mm', 10, 1, 100, 1),
		pNumber('D6', 'mm', 400, 100, 2000, 1),
		pNumber('W8', 'mm', 300, 100, 2000, 1),
		pNumber('L8', 'mm', 6000, 100, 20000, 1)
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
		gen3D: 'heliostat_junction.svg',
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
	const figTopPole = figure();
	const figHorizPole = figure();
	const figHorizPoleInt = figure();
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
		const R1bb = R1 - S1b;
		const S3b = param.E3 / Math.tan(inclination);
		const S3c = param.S3 + S1b - S3b;
		const R5 = R3 - S3c;
		// fixation
		const R2 = param.D2 / 2;
		const lFixation = R1b + param.W1 + R2;
		const aFixation = (2 * Math.PI) / param.N2;
		// topPole
		const d5b = param.Z3 / Math.tan(inclination);
		const S5b = S3c + param.Z4 - d5b;
		const S5t = S5b - param.E5 / Math.tan(inclination);
		const d4b = param.L4 / Math.tan(inclination);
		const R5b = R5 + S5b;
		const R5t = R5 + S5t;
		const R4i = R5b + d4b;
		const E4b = param.E4 / Math.sin(inclination);
		const R4e = R4i + E4b;
		const posY4 = param.L1 + param.Z3 - param.L4;
		const R7b = R5t - param.H6 / Math.tan(inclination);
		const R7t = R7b - param.E7 / Math.tan(inclination) + E4b;
		const R7i = param.D7 / 2;
		//const S7b = R7b - R7i;
		//const S7t = R7t - R7i;
		// gen3D
		const genTop = param.gen3D === 2 ? false : true;
		const genBottom = param.gen3D === 1 ? false : true;
		// horizPole
		const R6e = param.D6 / 2;
		const R6i = R6e - param.E6;
		const posY6 = param.L1 + param.Z3 + param.E5 + param.H6 / 2;
		const L92 = param.L9 / 2;
		//rGeome.logstr += `dbg082: ${S1b} ${S1c} ${R1b}\n`;
		// step-5 : checks on the parameter values
		if (R1 < R3) {
			throw `err176: D1 ${ffix(param.D1)} is too small compare to D3 ${ffix(param.D3)} mm`;
		}
		if (R1b < 0.1) {
			throw `err183: R1b ${ffix(R1b)} is too small because of ${ffix(param.E2)} or ${ffix(param.S1)} mm`;
		}
		if (param.S1 < 2 * (param.W1 + R2)) {
			throw `err142: S1 ${ffix(param.S1)} is too small compare to W1 ${ffix(param.W1)} and D2 ${ffix(2 * R2)} mm`;
		}
		if (H1h < 0.1) {
			throw `err167: H1H ${ffix(param.H1H)} is too small compare to H1W ${ffix(param.H1W)} mm`;
		}
		if (param.Z4 < d5b) {
			throw `err154: Z4 ${ffix(param.Z4)} is too small compare to d5b ${ffix(d5b)} mm`;
		}
		if (R7b < R7i) {
			throw `err169: R7b ${ffix(2 * R7b)} is too small because to D7 ${ffix(2 * R7i)} mm`;
		}
		if (R6i < 0.1) {
			throw `err185: R6i ${ffix(R6i)} is too small because to E6 ${ffix(param.E6)} mm`;
		}
		// step-6 : any logs
		rGeome.logstr += `Cone inclination: ${ffix(radToDeg(inclination))} deg\n`;
		rGeome.logstr += `Diameters: D1 ${ffix(2 * R1)}, D1b ${ffix(2 * R1)}, D3 ${ffix(2 * R3)}, D5 ${ffix(2 * R5)} mm\n`;
		rGeome.logstr += `TopPole: posY4 ${ffix(posY4)}, D4 ${ffix(2 * R4e)} mm\n`;
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
		figBottomDisc.addSecond(contourCircle(0, 0, R1bb));
		figBottomDisc.addSecond(contourCircle(0, 0, R3));
		figBottomDisc.addSecond(contourCircle(0, 0, R5));
		// figBottomPole
		function ctrBottomPole(sig: number): tContour {
			const rCtr = contour(sig * R1, 0)
				.addSegStrokeR(0, param.E1)
				.addSegStrokeR(sig * (R3 - R1), L1b)
				.addSegStrokeR(-sig * S3c, 0)
				.addSegStrokeR(0, -param.E3)
				.addSegStrokeR(sig * param.S3, 0)
				.addSegStrokeA(sig * (R1 - S1b), param.E1)
				.addSegStrokeR(0, -param.E1)
				.closeSegStroke();
			return rCtr;
		}
		figBottomPole.addMainO(ctrBottomPole(-1));
		figBottomPole.addSecond(ctrBottomPole(1));
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
		figDoor.addSecond(ctrBottomPole(1));
		figDoor.addSecond(ctrBottomPole(-1));
		figBottomPole.addSecond(ctrDoor);
		// figTopPole
		function ctrTopPole(sig: number): tContour {
			const rCtr = contour(-sig * R4e, posY4)
				.addSegStrokeR(sig * E4b, 0)
				.addSegStrokeR(sig * (R4i - R5b), param.L4)
				.addSegStrokeR(sig * (R5b - R5), 0)
				.addSegStrokeR(0, param.E5)
				.addSegStrokeR(sig * (R5 - R5t), 0)
				.addSegStrokeR(sig * (R5t - R7b), param.H6)
				.addSegStrokeR(sig * (R7b - R7i), 0)
				.addSegStrokeR(0, param.E7)
				.addSegStrokeR(sig * (R7i - R7t), 0)
				.closeSegStroke();
			return rCtr;
		}
		figTopPole.addMainO(ctrTopPole(1));
		figTopPole.addSecond(ctrTopPole(-1));
		figTopPole.addSecond(ctrBottomPole(1));
		figTopPole.addSecond(ctrBottomPole(-1));
		figTopPole.addSecond(ctrDoor);
		figBottomPole.addSecond(ctrTopPole(-1));
		figBottomPole.addSecond(ctrTopPole(1));
		// figHorizPole
		const ctrHorizExt = contourCircle(0, posY6, R6e);
		const ctrHorizInt = contourCircle(0, posY6, R6i);
		figHorizPole.addMainOI([ctrHorizExt, ctrHorizInt]);
		figHorizPole.addSecond(ctrTopPole(-1));
		figHorizPole.addSecond(ctrTopPole(1));
		// figHorizPoleInt
		figHorizPoleInt.addMainO(ctrHorizInt);
		figHorizPoleInt.addSecond(ctrHorizExt);
		figHorizPoleInt.addSecond(ctrTopPole(-1));
		figHorizPoleInt.addSecond(ctrTopPole(1));
		// final figure list
		rGeome.fig = {
			faceBottomPole: figBottomPole,
			faceDoor: figDoor,
			faceBottomDisc: figBottomDisc,
			faceTopPole: figTopPole,
			faceHorizPole: figHorizPole,
			faceHorizPoleInt: figHorizPoleInt
		};
		// step-8 : recipes of the 3D construction
		// volume
		const designName = rGeome.partName;
		const selectedList: string[] = [];
		if (genTop) {
			selectedList.push(`ipax_${designName}_topPart`);
		}
		if (genBottom) {
			selectedList.push(`ipax_${designName}_bottomPart`);
		}
		rGeome.vol = {
			extrudes: [
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
				},
				{
					outName: `subpax_${designName}_bottomDisc`,
					face: `${designName}_faceBottomDisc`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.E1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_topPole`,
					face: `${designName}_faceTopPole`,
					extrudeMethod: EExtrude.eRotate,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_horizPole`,
					face: `${designName}_faceHorizPole`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.L9,
					rotate: [pi2, 0, 0],
					translate: [0, L92, 0]
				},
				{
					outName: `subpax_${designName}_horizPoleInt`,
					face: `${designName}_faceHorizPoleInt`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.L9,
					rotate: [pi2, 0, 0],
					translate: [0, L92, 0]
				}
			],
			volumes: [
				{
					outName: `ipax_${designName}_bottomPolePlus`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_bottomDisc`, `subpax_${designName}_bottomPole`]
				},
				{
					outName: `ipax_${designName}_bottomPart`,
					boolMethod: EBVolume.eSubstraction,
					inList: [`ipax_${designName}_bottomPolePlus`, `subpax_${designName}_door`]
				},
				{
					outName: `ipax_${designName}_topPlus`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_topPole`, `subpax_${designName}_horizPole`]
				},
				{
					outName: `ipax_${designName}_topMinus`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_horizPoleInt`]
				},
				{
					outName: `ipax_${designName}_topPart`,
					boolMethod: EBVolume.eSubstraction,
					inList: [`ipax_${designName}_topPlus`, `ipax_${designName}_topMinus`]
				},
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: selectedList
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
