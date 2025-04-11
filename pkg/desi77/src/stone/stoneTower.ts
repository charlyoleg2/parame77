// stoneTower.ts
// a middle-age tower made out of stones

import type {
	//tContour,
	//tOuterInner,
	Figure,
	tParamDef,
	tParamVal,
	tExtrude,
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
	pCheckbox,
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
		pCheckbox('externalWall', true),
		pSectionSeparator('window-1'),
		pNumber('wN1', 'hollow', 0, 0, 5, 1),
		pNumber('wW1', 'cm', 80, 10, 300, 1),
		pNumber('wH1', 'cm', 150, 10, 500, 1),
		pNumber('wE1', 'cm', 20, 1, 100, 1),
		pNumber('wS1', 'cm', 120, 0, 300, 1),
		pSectionSeparator('window-2'),
		pNumber('wN2', 'hollow', 1, 0, 5, 1),
		pNumber('wW2', 'cm', 80, 10, 300, 1),
		pNumber('wH2', 'cm', 150, 10, 500, 1),
		pNumber('wE2', 'cm', 20, 1, 100, 1),
		pNumber('wS2', 'cm', 120, 0, 300, 1),
		pSectionSeparator('window-3'),
		pNumber('wN3', 'hollow', 2, 0, 5, 1),
		pNumber('wW3', 'cm', 80, 10, 300, 1),
		pNumber('wH3', 'cm', 150, 10, 500, 1),
		pNumber('wE3', 'cm', 20, 1, 100, 1),
		pNumber('wS3', 'cm', 120, 0, 300, 1),
		pSectionSeparator('window-4'),
		pNumber('wN4', 'hollow', 3, 0, 5, 1),
		pNumber('wW4', 'cm', 80, 10, 300, 1),
		pNumber('wH4', 'cm', 150, 10, 500, 1),
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
		externalWall: 'stoneTower_hplan.svg',
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
	const figDoor = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Hfloor = param.H1 + param.Hf;
		const H3 = param.N1 * Hfloor;
		const LW3 = param.T1 + param.W2 + param.T2;
		const L3 = param.L1 + 2 * LW3;
		const W3 = param.W1 + 2 * LW3;
		const oXY1 = param.T1 + param.W2;
		const sfdX = (param.L1 - param.N4 * param.T4) / (param.N4 - 1);
		const H1low = param.H1 - param.H4 - param.H4b;
		const Hbasement = 10;
		const W22 = param.W2 / 2;
		const wN = [param.wN1, param.wN2, param.wN3, param.wN4];
		const wW = [param.wW1, param.wW2, param.wW3, param.wW4];
		const wH = [param.wH1, param.wH2, param.wH3, param.wH4];
		const wE = [param.wE1, param.wE2, param.wE3, param.wE4];
		const wS = [param.wS1, param.wS2, param.wS3, param.wS4];
		// step-5 : checks on the parameter values
		if (param.L1 < param.N4 * param.W4) {
			throw `err152: L1 ${param.L1} is too small compare to N4 ${param.N4} W4 ${param.W4}`;
		}
		if (param.H8 < param.W8 / 2) {
			throw `err158: H8 ${param.H8} is too small compare to W8 ${param.W8}`;
		}
		if (H1low < param.H8) {
			throw `err161: H1 ${param.H1} is too small compare to H8 ${param.H8}`;
		}
		if (Math.max(param.L1, param.W1) < param.W8) {
			throw `err168: L1 ${param.L1} or W1 ${param.W1} is too small compare to W8 ${param.W8}`;
		}
		for (let idx = 0; idx < 4; idx++) {
			if (wH[idx] < wW[idx] / 2) {
				throw `err169: window-${idx} wH ${wH[idx]} is too small compare to wW ${wW[idx]}`;
			}
			if (H1low < wS[idx] + wH[idx]) {
				throw `err172: H1 ${param.H1} is too small compare to wS ${wS[idx]} and wH ${wH[idx]}`;
			}
			if (
				wN[idx] > 0 &&
				Math.max(param.L1, param.W1) < wN[idx] * wW[idx] + (wN[idx] - 1) * wE[idx]
			) {
				throw `err175: L1 ${param.L1} or W1 ${param.W1} is too small compare to wN ${wN[idx]}, wW ${wW[idx]} and wE ${wE[idx]}`;
			}
		}
		// step-6 : any logs
		rGeome.logstr += `L3 ${ffix(L3)}, W3 ${ffix(W3)}, H3 ${ffix(H3)} cm\n`;
		// sub-function
		function figWindow(
			iwN: number,
			iwW: number,
			iwH: number,
			iwE: number,
			iwS: number,
			iFig: Figure
		): Figure {
			const rFig = figure();
			const wW2 = iwW / 2;
			const oX = ((iwN - 1) * (iwW + iwE)) / 2;
			const dX = iwW + iwE;
			for (let idx = 0; idx < iwN; idx++) {
				const ctr = contour(-wW2, iwS)
					.addSegStrokeA(wW2, iwS)
					.addSegStrokeA(wW2, iwS + iwH - wW2)
					.addPointA(0, iwS + iwH)
					.addPointA(-wW2, iwS + iwH - wW2)
					.addSegArc2()
					.closeSegStroke();
				rFig.addMainO(ctr.translate(-oX + idx * dX, 0));
			}
			rFig.mergeFigure(iFig, true);
			return rFig;
		}
		// figHplan
		const eW1 = ctrRectangle(0, 0, L3, W3);
		const eW2 = ctrRectangle(param.T2, param.T2, L3 - 2 * param.T2, W3 - 2 * param.T2);
		if (param.externalWall) {
			figHplan.addMainOI([eW1, eW2]);
		} else {
			figHplan.addSecond(eW1);
			figHplan.addSecond(eW2);
		}
		figHplan.addMainOI([
			ctrRectangle(oXY1, oXY1, param.L1 + 2 * param.T1, param.W1 + 2 * param.T1),
			ctrRectangle(oXY1 + param.T1, oXY1 + param.T1, param.L1, param.W1)
		]);
		// figDoor
		const ctrDoor = contour(-param.W8 / 2, 0)
			.addSegStrokeA(param.W8 / 2, 0)
			.addSegStrokeA(param.W8 / 2, param.H8 - param.W8 / 2)
			.addPointA(0, param.H8)
			.addPointA(-param.W8 / 2, param.H8 - param.W8 / 2)
			.addSegArc2()
			.closeSegStroke();
		figDoor.addMainO(ctrDoor);
		figDoor.addSecond(ctrRectangle(-param.L1 / 2, 0, param.L1, param.H1));
		figDoor.addSecond(ctrRectangle(-param.W1 / 2, 0, param.W1, param.H1));
		for (let idx = 0; idx < param.N4; idx++) {
			const posX = -param.L1 / 2 + idx * sfdX;
			figDoor.addSecond(ctrRectangle(posX, H1low + param.H4b, param.T4, param.H4));
			figDoor.addSecond(ctrRectangle(posX, H1low, param.T4, param.H4b));
		}
		// figWindow-1234 :  directly implemented in rGeom.fig
		// figFloorSupport
		// final figure list
		rGeome.fig = {
			faceHplan: figHplan,
			faceDoor: figDoor,
			faceWin1: figWindow(wN[0], wW[0], wH[0], wE[0], wS[0], figDoor),
			faceWin2: figWindow(wN[1], wW[1], wH[1], wE[1], wS[1], figDoor),
			faceWin3: figWindow(wN[2], wW[2], wH[2], wE[2], wS[2], figDoor),
			faceWin4: figWindow(wN[3], wW[3], wH[3], wE[3], wS[3], figDoor)
		};
		// volume
		const designName = rGeome.partName;
		const hollowObj: tExtrude[] = [];
		const hollowName: string[] = [];
		for (let idx = 0; idx < param.N1; idx++) {
			const wallIdx = (idx + 2) % 4;
			const bLnW = wallIdx % 2 === 0;
			const TyLnW = bLnW ? param.W1 / 2 : param.L1 / 2;
			const Ty = param.T1 + TyLnW + param.W2 / 2;
			hollowObj.push({
				outName: `subpax_${designName}_doorIn${idx}`,
				face: `${designName}_faceDoor`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: Ty,
				rotate: [Math.PI / 2, 0, (wallIdx * Math.PI) / 2],
				translate: [L3 / 2, W3 / 2, idx * Hfloor]
			});
			hollowName.push(`subpax_${designName}_doorIn${idx}`);
			if (idx > 0) {
				for (let jj = 0; jj < 4; jj++) {
					if (wN[jj] > 0) {
						const wallIdx2 = (wallIdx + jj) % 4;
						const bLnW = wallIdx2 % 2 === 0;
						const TyLnW2 = bLnW ? param.W1 / 2 : param.L1 / 2;
						const Ty2 = param.T1 + TyLnW2 + param.W2 + 2 * param.T2;
						hollowObj.push({
							outName: `subpax_${designName}_win${idx}_${jj}`,
							face: `${designName}_faceWin${jj + 1}`,
							extrudeMethod: EExtrude.eLinearOrtho,
							length: Ty2,
							rotate: [Math.PI / 2, 0, (wallIdx2 * Math.PI) / 2],
							translate: [L3 / 2, W3 / 2, idx * Hfloor]
						});
						hollowName.push(`subpax_${designName}_win${idx}_${jj}`);
					}
				}
			}
		}
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_Hplan`,
					face: `${designName}_faceHplan`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: H3 + Hbasement,
					rotate: [0, 0, 0],
					translate: [0, 0, -Hbasement]
				},
				{
					outName: `subpax_${designName}_door`,
					face: `${designName}_faceDoor`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T2 + 2 * W22,
					rotate: [Math.PI / 2, 0, 0],
					translate: [L3 / 2, param.T2 + W22, 0]
				},
				...hollowObj
			],
			volumes: [
				{
					outName: `subpax_${designName}_hollow`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_door`, ...hollowName]
				},
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eSubstraction,
					inList: [`subpax_${designName}_Hplan`, `subpax_${designName}_hollow`]
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
