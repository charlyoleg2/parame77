// stoneTower.ts
// a middle-age tower made out of stones

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
	partName: 'stoneTower',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('L1', 'cm', 800, 100, 4000, 1),
		pNumber('W1', 'cm', 500, 100, 4000, 1),
		pNumber('T1', 'cm', 40, 1, 200, 1),
		pNumber('T2', 'cm', 40, 1, 200, 1),
		pNumber('W2', 'cm', 80, 1, 500, 1),
		pSectionSeparator('floor support'),
		pNumber('N4', 'support', 5, 2, 100, 1),
		pNumber('T4', 'cm', 20, 1, 200, 1),
		pNumber('W4', 'cm', 40, 1, 200, 1),
		pNumber('H4', 'cm', 60, 1, 200, 1),
		pNumber('H4b', 'cm', 60, 1, 200, 1),
		pSectionSeparator('floor'),
		pNumber('N1', 'floor', 3, 1, 10, 1),
		pNumber('H1', 'cm', 400, 100, 1000, 1),
		pNumber('Hf', 'cm', 40, 1, 100, 1),
		pNumber('Hs', 'cm', 40, 1, 100, 1),
		pSectionSeparator('top'),
		pNumber('H5', 'cm', 120, 0, 250, 1),
		pNumber('H6', 'cm', 180, 0, 300, 1),
		pNumber('H7', 'cm', 300, 0, 600, 1),
		pSectionSeparator('door'),
		pNumber('H8', 'cm', 220, 100, 400, 1),
		pNumber('W8', 'cm', 100, 40, 400, 1),
		pNumber('N3', 'stairs', 12, 1, 40, 1),
		pSectionSeparator('window-1'),
		pNumber('wN1', 'hollow', 0, 0, 5, 1),
		pNumber('wW1', 'cm', 80, 10, 300, 1),
		pNumber('wH1', 'cm', 200, 10, 500, 1),
		pNumber('wE1', 'cm', 20, 1, 100, 1),
		pNumber('wS1', 'cm', 120, 0, 300, 1),
		pSectionSeparator('window-2'),
		pNumber('wN2', 'hollow', 0, 0, 5, 1),
		pNumber('wW2', 'cm', 80, 10, 300, 1),
		pNumber('wH2', 'cm', 200, 10, 500, 1),
		pNumber('wE2', 'cm', 20, 1, 100, 1),
		pNumber('wS2', 'cm', 120, 0, 300, 1),
		pSectionSeparator('window-3'),
		pNumber('wN3', 'hollow', 0, 0, 5, 1),
		pNumber('wW3', 'cm', 80, 10, 300, 1),
		pNumber('wH3', 'cm', 200, 10, 500, 1),
		pNumber('wE3', 'cm', 20, 1, 100, 1),
		pNumber('wS3', 'cm', 120, 0, 300, 1),
		pSectionSeparator('window-4'),
		pNumber('wN4', 'hollow', 0, 0, 5, 1),
		pNumber('wW4', 'cm', 80, 10, 300, 1),
		pNumber('wH4', 'cm', 200, 10, 500, 1),
		pNumber('wE4', 'cm', 20, 1, 100, 1),
		pNumber('wS4', 'cm', 120, 0, 300, 1)
	],
	paramSvg: {
		L1: 'stoneTower_hplan.svg',
		W1: 'stoneTower_hplan.svg',
		T1: 'stoneTower_hplan.svg',
		T2: 'stoneTower_hplan.svg',
		W2: 'stoneTower_hplan.svg',
		N4: 'stoneTower_hplan.svg',
		T4: 'stoneTower_hplan.svg',
		W4: 'stoneTower_vw.svg',
		H4: 'stoneTower_vw.svg',
		H4b: 'stoneTower_vw.svg',
		N1: 'stoneTower_vw.svg',
		H1: 'stoneTower_vw.svg',
		Hf: 'stoneTower_vw.svg',
		Hs: 'stoneTower_vw.svg',
		H5: 'stoneTower_vw.svg',
		H6: 'stoneTower_vw.svg',
		H7: 'stoneTower_vw.svg',
		H8: 'stoneTower_vw.svg',
		W8: 'stoneTower_vw.svg',
		N3: 'stoneTower_hplan.svg',
		wN1: 'stoneTower_window2.svg',
		wW1: 'stoneTower_window2.svg',
		wH1: 'stoneTower_window2.svg',
		wE1: 'stoneTower_window2.svg',
		wS1: 'stoneTower_window2.svg',
		wN2: 'stoneTower_window2.svg',
		wW2: 'stoneTower_window2.svg',
		wH2: 'stoneTower_window2.svg',
		wE2: 'stoneTower_window2.svg',
		wS2: 'stoneTower_window2.svg',
		wN3: 'stoneTower_window2.svg',
		wW3: 'stoneTower_window2.svg',
		wH3: 'stoneTower_window2.svg',
		wE3: 'stoneTower_window2.svg',
		wS3: 'stoneTower_window2.svg',
		wN4: 'stoneTower_window2.svg',
		wW4: 'stoneTower_window2.svg',
		wH4: 'stoneTower_window2.svg',
		wE4: 'stoneTower_window2.svg',
		wS4: 'stoneTower_window2.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figHplan = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const H3 = param.N1 * (param.H1 + param.Hf);
		const LW3 = param.T1 + param.W2 + param.T2;
		const L3 = param.L1 + 2 * LW3;
		const W3 = param.W1 + 2 * LW3;
		// step-5 : checks on the parameter values
		if (param.L1 < param.N4 * param.W4) {
			throw `err152: L1 ${param.L1} is too small compare to N4 ${param.N4} W4 ${param.W4}`;
		}
		// step-6 : any logs
		rGeome.logstr += `L3 ${ffix(L3)}, W3 ${ffix(W3)}, H3 ${ffix(H3)} cm\n`;
		// sub-function
		// figHplan
		figHplan.addMainOI([
			ctrRectangle(0, 0, L3, W3),
			ctrRectangle(param.T2, param.T2, L3 - 2 * param.T2, W3 - 2 * param.T2)
		]);
		// final figure list
		rGeome.fig = {
			faceHplan: figHplan
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_Hplan`,
					face: `${designName}_faceHplan`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: H3,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eIdentity,
					inList: [`subpax_${designName}_Hplan`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'stoneTower drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const stoneTowerDef: tPageDef = {
	pTitle: 'stoneTower',
	pDescription: 'a middle-age tower made out of stones',
	pDef: pDef,
	pGeom: pGeom
};

export { stoneTowerDef };
