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
	ctrRectangle,
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
		pNumber('Ht', 'cm', 400, 50, 2000, 1),
		pSectionSeparator('M-Lengths'),
		pNumber('M1', 'cm', 200, 50, 2000, 1),
		pNumber('M2', 'cm', 400, 50, 2000, 1),
		pNumber('M3', 'cm', 800, 50, 2000, 1),
		pNumber('M4', 'cm', 100, 50, 2000, 1),
		pSectionSeparator('Nest'),
		pNumber('AE1', 'cm', 200, 50, 2000, 1),
		pNumber('AE2', 'cm', 200, 50, 2000, 1),
		pNumber('BE1', 'cm', 200, 50, 2000, 1),
		pNumber('BE2', 'cm', 200, 50, 2000, 1)
	],
	paramSvg: {
		WA: 'house_top.svg',
		WB: 'house_top.svg',
		WC: 'house_top.svg',
		WD: 'house_top.svg',
		WE: 'house_top.svg',
		HA1: 'house_pignon.svg',
		HA2: 'house_pignon.svg',
		HB1: 'house_pignon.svg',
		HB2: 'house_pignon.svg',
		HC1: 'house_pignon.svg',
		HC2: 'house_pignon.svg',
		HD1: 'house_pignon.svg',
		HD2: 'house_pignon.svg',
		HE1: 'house_pignon.svg',
		HE2: 'house_pignon.svg',
		L1: 'house_top.svg',
		L2: 'house_top.svg',
		L3: 'house_top.svg',
		S1: 'house_top.svg',
		S2: 'house_top.svg',
		Ht: 'house_top.svg',
		M1: 'house_top.svg',
		M2: 'house_top.svg',
		M3: 'house_top.svg',
		M4: 'house_top.svg',
		AE1: 'house_top.svg',
		AE2: 'house_top.svg',
		BE1: 'house_top.svg',
		BE2: 'house_top.svg'
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
	const figPB = figure();
	const figPC = figure();
	const figPD = figure();
	const figPE = figure();
	const figTerrasse = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const WA2 = param.WA / 2;
		const WB2 = param.WB / 2;
		const WC2 = param.WC / 2;
		const WD2 = param.WD / 2;
		const WE2 = param.WE / 2;
		const HAtotal = param.HA1 + param.HA2;
		const HBtotal = param.HB1 + param.HB2;
		const HCtotal = param.HC1 + param.HC2;
		const HDtotal = param.HD1 + param.HD2;
		const HEtotal = param.HE1 + param.HE2;
		// step-5 : checks on the parameter values
		if (HBtotal < HAtotal) {
			throw `err167: HBtotal ${ffix(HBtotal)} is too small compare to HAtotal ${ffix(HAtotal)}`;
		}
		// step-6 : any logs
		rGeome.logstr += `HAtotal ${ffix(HAtotal / 100)} m\n`;
		rGeome.logstr += `HBtotal ${ffix(HBtotal / 100)} m\n`;
		rGeome.logstr += `HCtotal ${ffix(HCtotal / 100)} m\n`;
		rGeome.logstr += `HDtotal ${ffix(HDtotal / 100)} m\n`;
		rGeome.logstr += `HEtotal ${ffix(HEtotal / 100)} m\n`;
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
		function makeCtrPtop(
			iW2: number,
			iL: number,
			iOrientation: number,
			iX: number,
			iY: number
		): tContour {
			const rCtr = ctrRectangle(-iW2, 0, 2 * iW2, iL)
				.rotate(0, 0, (2 + iOrientation) * pi2)
				.translate(iX, iY);
			return rCtr;
		}
		// figPA, figPB, figPC, figPD, figPE
		figPA.addMainO(makeCtrPignon(WA2, param.HA1, param.HA2));
		figPB.addMainO(makeCtrPignon(WB2, param.HB1, param.HB2));
		figPC.addMainO(makeCtrPignon(WC2, param.HC1, param.HC2));
		figPD.addMainO(makeCtrPignon(WD2, param.HD1, param.HD2));
		figPE.addMainO(makeCtrPignon(WE2, param.HE1, param.HE2));
		// second contours
		figPA.mergeFigure(figPB.translate(WA2 + WB2, 0), true);
		figPA.mergeFigure(figPC.translate(WA2 + 2 * WB2 + WC2, 0), true);
		figPA.mergeFigure(figPD.translate(WA2 + 2 * (WB2 + WC2) + WD2, 0), true);
		figPA.mergeFigure(figPE.translate(WA2 + 2 * (WB2 + WC2 + WD2) + WE2, 0), true);
		figPA.addSecond(ctrRectangle(-WA2 - param.S2, 0, param.S2, param.Ht));
		// figTerrasse
		const xTerrasse1 = WB2 + 2 * WC2 + param.L1;
		const xTerrasse2 = WB2 + param.L3 / 2;
		const pALenW = xTerrasse1;
		const pALenE = WB2 + param.L2;
		const pBLenN = WA2 + param.M2;
		const pBLenS = WA2 + param.M3 + param.M4;
		figTerrasse.addMainO(makeCtrPtop(WA2 / 2, param.S1, 3, -xTerrasse1, 0));
		figTerrasse.addMainO(makeCtrPtop(param.L3 / 2, param.S2, 0, -xTerrasse2, -WA2));
		figTerrasse.addSecond(makeCtrPtop(WA2, pALenW, 3, 0, 0));
		figTerrasse.addSecond(makeCtrPtop(WA2, pALenE, 1, 0, 0));
		figTerrasse.addSecond(makeCtrPtop(WB2, pBLenN, 2, 0, 0));
		figTerrasse.addSecond(makeCtrPtop(WB2, pBLenS, 0, 0, 0));
		// final figure list
		rGeome.fig = {
			facePA: figPA,
			facePB: figPB,
			facePC: figPE,
			facePD: figPD,
			facePE: figPE,
			faceTerrasse: figTerrasse
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
					length: pALenW,
					rotate: [pi2, 0, 3 * pi2],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_pAe`,
					face: `${designName}_facePA`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: pALenE,
					rotate: [pi2, 0, 1 * pi2],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_pBn`,
					face: `${designName}_facePB`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: pBLenN,
					rotate: [pi2, 0, 2 * pi2],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_pBs`,
					face: `${designName}_facePB`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: pBLenS,
					rotate: [pi2, 0, 0 * pi2],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_terras`,
					face: `${designName}_faceTerrasse`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.Ht,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [
						`subpax_${designName}_pAw`,
						`subpax_${designName}_pAe`,
						`subpax_${designName}_pBn`,
						`subpax_${designName}_pBs`,
						`subpax_${designName}_terras`
					]
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
