// stoneTower.ts
// a middle-age tower made out of stones

import type {
	tContour,
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
	radToDeg,
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
		pCheckbox('showFloor', false),
		pSectionSeparator('top'),
		pNumber('H5', 'cm', 120, 0, 250, 1),
		pNumber('H6', 'cm', 180, 0, 300, 1),
		pNumber('H7', 'cm', 300, 0, 600, 1),
		pSectionSeparator('door'),
		pNumber('H8', 'cm', 220, 100, 400, 1),
		pNumber('W8', 'cm', 100, 40, 400, 1),
		pNumber('N3', 'stairs', 12, 1, 40, 1),
		pCheckbox('showExtWall', true),
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
		showFloor: 'stoneTower_vw.svg',
		H5: 'stoneTower_vw.svg',
		H6: 'stoneTower_vw.svg',
		H7: 'stoneTower_vw.svg',
		H8: 'stoneTower_vw.svg',
		W8: 'stoneTower_vw.svg',
		N3: 'stoneTower_hplan.svg',
		showExtWall: 'stoneTower_hplan.svg',
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

const initDoorIn = 2;

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figHplan = figure();
	const figDoor = figure();
	const figCorridor = figure();
	const figFloorSupport = figure();
	const figTopExt = figure();
	const figTopCabFront = figure();
	const figTopCabMid = figure();
	const figTopCabRear = figure();
	//const figFloors = figure();
	//const figStairsW1 = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Hfloor = param.H1 + param.Hf;
		const H3 = param.N1 * Hfloor;
		const H3b = H3 + param.H6 + param.H7;
		const LW3 = param.T1 + param.W2 + param.T2;
		const L3 = param.L1 + 2 * LW3;
		const W3 = param.W1 + 2 * LW3;
		const oXY1 = param.T2 + param.W2;
		const sfdX = (param.L1 - param.N4 * param.T4) / (param.N4 - 1);
		const H1low = param.H1 - param.H4 - param.H4b;
		const Hbasement = 10;
		const W22 = param.W2 / 2;
		const wN = [param.wN1, param.wN2, param.wN3, param.wN4];
		const wW = [param.wW1, param.wW2, param.wW3, param.wW4];
		const wH = [param.wH1, param.wH2, param.wH3, param.wH4];
		const wE = [param.wE1, param.wE2, param.wE3, param.wE4];
		const wS = [param.wS1, param.wS2, param.wS3, param.wS4];
		const sfoX = param.T2 + param.W2 + param.T1;
		const sfoY = sfoX;
		const sfdX2 = sfdX + param.T4;
		const aCabRoof = Math.atan2(param.H7, param.T1 + param.W1 / 2);
		const aCabRoof2 = (Math.PI / 2 - aCabRoof) / 2;
		const crdY1 = param.T1 / Math.cos(aCabRoof);
		const crdY2 = param.T1 * Math.tan(aCabRoof2);
		const stairsH = Hfloor / 2 / (param.N3 + 1);
		const stairsHT = stairsH * 0.15;
		const stairsL = [
			(param.L1 / 2 - param.W8 / 2 + param.T1) / param.N3,
			(param.W1 / 2 - param.W8 / 2 + param.T1) / param.N3
		];
		// step-5 : checks on the parameter values
		//if (param.L1 < param.N4 * param.W4) {
		if (sfdX < 0) {
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
		if (param.H1 < param.W2 / 2 + param.Hs) {
			throw `err193: H1 ${param.H1} is too small compare to W2 ${param.W2} and Hs ${param.Hs}`;
		}
		// step-6 : any logs
		rGeome.logstr += `L3 ${ffix(L3)}, W3 ${ffix(W3)}, H3 ${ffix(H3)}, H3b ${ffix(H3b)} cm\n`;
		rGeome.logstr += `aCabRoof ${ffix(radToDeg(aCabRoof))} degree\n`;
		// sub-function
		function ctrsWindows(idx: number): tContour[] {
			const rCtrs: tContour[] = [];
			const iwN = wN[idx];
			const iwW = wW[idx];
			const iwH = wH[idx];
			const iwE = wE[idx];
			const iwS = wS[idx];
			const wW2 = iwW / 2;
			const oX = ((iwN - 1) * (iwW + iwE)) / 2;
			const dX = iwW + iwE;
			for (let ii = 0; ii < iwN; ii++) {
				const ctr = contour(-wW2, iwS)
					.addSegStrokeA(wW2, iwS)
					.addSegStrokeA(wW2, iwS + iwH - wW2)
					.addPointA(0, iwS + iwH)
					.addPointA(-wW2, iwS + iwH - wW2)
					.addSegArc2()
					.closeSegStroke();
				rCtrs.push(ctr.translate(-oX + ii * dX, 0));
			}
			return rCtrs;
		}
		function figWindow(idx: number, iFig: Figure): Figure {
			const rFig = figure();
			const ctrs = ctrsWindows(idx);
			for (const iCtr of ctrs) {
				rFig.addMainO(iCtr);
			}
			rFig.mergeFigure(iFig, true);
			return rFig;
		}
		// figHplan
		const eW1 = ctrRectangle(0, 0, L3, W3);
		const eW2 = ctrRectangle(param.T2, param.T2, L3 - 2 * param.T2, W3 - 2 * param.T2);
		const eW3 = ctrRectangle(oXY1, oXY1, param.L1 + 2 * param.T1, param.W1 + 2 * param.T1);
		const eW4 = ctrRectangle(oXY1 + param.T1, oXY1 + param.T1, param.L1, param.W1);
		if (param.showExtWall) {
			figHplan.addMainOI([eW1, eW2]);
		} else {
			figHplan.addSecond(eW1);
			figHplan.addSecond(eW2);
		}
		figHplan.addMainOI([eW3, eW4]);
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
		const ctrsFSL: tContour[] = [];
		for (let idx = 0; idx < param.N4; idx++) {
			const posX = idx * (sfdX + param.T4);
			ctrsFSL.push(ctrRectangle(posX, H1low + param.H4b, param.T4, param.H4));
			ctrsFSL.push(ctrRectangle(posX, H1low, param.T4, param.H4b));
		}
		for (const iCtr of ctrsFSL) {
			figDoor.addSecond(iCtr.translate(-param.L1 / 2, 0));
		}
		// figWindow-1234 :  directly implemented in rGeom.fig
		// figCorridor
		const ctrCorriVault = contour(0, param.H1 + param.Hf - param.Hs - param.W2 / 2)
			.addPointR(param.W2 / 2, param.W2 / 2)
			.addPointR(param.W2, 0)
			.addSegArc2()
			.addSegStrokeR(0, param.W2 / 2 + param.Hs)
			.addSegStrokeR(-param.W2, 0)
			.closeSegStroke();
		figCorridor.addMainO(ctrCorriVault);
		figCorridor.addSecond(ctrRectangle(-param.T2, 0, param.T2, param.H1 + param.Hf));
		figCorridor.addSecond(ctrRectangle(param.W2, 0, param.T2, param.H1 + param.Hf));
		// figFloorSupport
		const ctrFS1 = contour(0, H1low)
			.addSegStrokeR(param.W4, param.H4b)
			.addSegStrokeR(0, param.H4)
			.addSegStrokeR(-param.W4, 0)
			.closeSegStroke();
		const ctrFS2 = contour(param.W1, H1low)
			.addSegStrokeR(0, param.H4 + param.H4b)
			.addSegStrokeR(-param.W4, 0)
			.addSegStrokeR(0, -param.H4)
			.closeSegStroke();
		figFloorSupport.addMainO(ctrFS1);
		figFloorSupport.addMainO(ctrFS2);
		function ctrsOneFloor(iLnW: boolean, withFS: boolean): tContour[] {
			const rCtrs: tContour[] = [];
			const T2W2T1 = param.T2 + param.W2 + param.T1;
			const LW = iLnW ? param.L1 : param.W1;
			rCtrs.push(ctrRectangle(-param.T1, 0, param.T1, param.H1 + param.Hf));
			rCtrs.push(ctrRectangle(-T2W2T1, 0, param.T2, param.H1 + param.Hf));
			rCtrs.push(ctrRectangle(LW, 0, param.T1, param.H1 + param.Hf));
			rCtrs.push(ctrRectangle(LW + param.T1 + param.W2, 0, param.T2, param.H1 + param.Hf));
			rCtrs.push(ctrCorriVault.translate(-param.W2 - param.T1, 0));
			rCtrs.push(ctrCorriVault.translate(LW + param.T1, 0));
			if (withFS) {
				if (iLnW) {
					//for (const iCtr of ctrsFSL) {
					//	rCtrs.push(iCtr);
					//}
					rCtrs.push(...ctrsFSL);
				} else {
					rCtrs.push(ctrFS1);
					rCtrs.push(ctrFS2);
				}
			}
			return rCtrs;
		}
		for (const ictr of ctrsOneFloor(false, false)) {
			figFloorSupport.addSecond(ictr);
		}
		figFloorSupport.addSecond(ctrRectangle(0, param.H1, param.W1, param.Hf));
		// figTopExt
		figTopExt.addMainOI([eW1, eW2]);
		figTopExt.addSecond(eW1);
		figTopExt.addSecond(eW2);
		// figTopCabFront
		const ctrTopCabFront = contour(param.T2 + param.W2, param.N1 * Hfloor)
			.addSegStrokeR(param.W1 / 2 - param.W8 / 2 + param.T1, 0)
			.addSegStrokeR(0, param.H8 - param.W8 / 2)
			.addPointR(param.W8 / 2, param.W8 / 2)
			.addPointR(param.W8, 0)
			.addSegArc2()
			.addSegStrokeR(0, -param.H8 + param.W8 / 2)
			.addSegStrokeR(param.W1 / 2 - param.W8 / 2 + param.T1, 0)
			.addSegStrokeR(0, param.H6)
			.addSegStrokeR(-param.W1 / 2 - param.T1, param.H7)
			.addSegStrokeR(-param.W1 / 2 - param.T1, -param.H7)
			.closeSegStroke();
		const ctrTopExt1 = ctrRectangle(0, param.N1 * Hfloor, param.T2, param.H5);
		const ctrTopExt2 = ctrRectangle(W3 - param.T2, param.N1 * Hfloor, param.T2, param.H5);
		figTopCabFront.addMainO(ctrTopCabFront);
		figTopCabFront.addSecond(ctrTopExt1);
		figTopCabFront.addSecond(ctrTopExt2);
		// figTopCabMid
		const ctrTopCabMid = contour(param.T2 + param.W2, param.N1 * Hfloor)
			.addSegStrokeR(param.T1, 0)
			.addSegStrokeR(0, param.H6 - crdY2)
			.addSegStrokeR(param.W1 / 2, param.H7 - crdY1 + crdY2)
			.addSegStrokeR(param.W1 / 2, -param.H7 + crdY1 - crdY2)
			.addSegStrokeR(0, -param.H6 + crdY2)
			.addSegStrokeR(param.T1, 0)
			.addSegStrokeR(0, param.H6)
			.addSegStrokeR(-param.W1 / 2 - param.T1, param.H7)
			.addSegStrokeR(-param.W1 / 2 - param.T1, -param.H7)
			.closeSegStroke();
		figTopCabMid.addMainO(ctrTopCabMid);
		figTopCabMid.addSecond(ctrTopExt1);
		figTopCabMid.addSecond(ctrTopExt2);
		figTopCabMid.addSecond(ctrTopCabFront);
		// figTopCabRear
		const ctrTopCabRear = contour(param.T2 + param.W2, param.N1 * Hfloor)
			.addSegStrokeR(param.W1 + 2 * param.T1, 0)
			.addSegStrokeR(0, param.H6)
			.addSegStrokeR(-param.W1 / 2 - param.T1, param.H7)
			.addSegStrokeR(-param.W1 / 2 - param.T1, -param.H7)
			.closeSegStroke();
		figTopCabRear.addMainO(ctrTopCabRear);
		figTopCabRear.addSecond(ctrTopExt1);
		figTopCabRear.addSecond(ctrTopExt2);
		figTopCabRear.addSecond(ctrTopCabMid);
		// figFloors
		function figWall(iLnW: boolean, mainFloor = false): Figure {
			const rFig = figure();
			const LW = iLnW ? param.L1 : param.W1;
			const T2W2T1 = param.T2 + param.W2 + param.T1;
			if (iLnW) {
				const T2W2 = param.T2 + param.W2;
				const L1T1T1 = param.L1 + 2 * param.T1;
				rFig.addSecond(ctrRectangle(0, H3, L3, param.H5));
				rFig.addSecond(ctrRectangle(T2W2, H3, L1T1T1, param.H6));
				rFig.addSecond(ctrRectangle(T2W2, H3 + param.H6, L1T1T1, param.H7));
			} else {
				rFig.mergeFigure(figTopCabFront, true);
			}
			for (let ii = 0; ii < param.N1; ii++) {
				for (const ictr of ctrsOneFloor(iLnW, true)) {
					rFig.addSecond(ictr.translate(param.T2 + param.W2 + param.T1, ii * Hfloor));
				}
				const ctrFloor = ctrRectangle(T2W2T1, param.H1 + ii * Hfloor, LW, param.Hf);
				if (param.showFloor && mainFloor) {
					rFig.addMainO(ctrFloor);
				} else {
					rFig.addSecond(ctrFloor);
				}
			}
			return rFig;
		}
		const figFloors = figWall(false, true);
		// figStairs
		function figStairs(iSide: number, iSwap: boolean): Figure {
			const rFig = figure();
			const LnW = iSide % 2 === 0;
			const stL = LnW ? stairsL[0] : stairsL[1];
			const stLW = LnW ? param.L1 : param.W1;
			const oppos = iSwap ? -1 : 1;
			const dOrig = iSwap ? -stL : 0;
			const dOrig2 = iSwap ? 0 : -stL;
			rFig.mergeFigure(figWall(LnW), true);
			const stairsL1ox1 = param.T2 + param.W2;
			const stairsL1ox2 = stairsL1ox1 + param.T1 + stLW / 2;
			const stairsL1ox4 = stairsL1ox1 + 2 * param.T1 + stLW;
			const oX2 = iSwap ? param.T2 : stairsL1ox4;
			const oX3 = iSwap ? stairsL1ox4 : param.T2;
			for (let ii = 0; ii < param.N1; ii++) {
				if ((ii + iSide) % 4 === 0) {
					rFig.addSecond(ctrDoor.translate(stairsL1ox2, ii * Hfloor));
					for (let jj = 0; jj < param.N3; jj++) {
						const oX1 = stairsL1ox2 + oppos * (param.W8 / 2 + jj * stL) + dOrig;
						const oY1 = ii * Hfloor + (jj + 1) * stairsH - stairsHT;
						rFig.addMainO(ctrRectangle(oX1, oY1, stL, stairsHT));
					}
					const oY2 = (ii + 0.5) * Hfloor - stairsHT;
					rFig.addMainO(ctrRectangle(oX2, oY2, param.W2, stairsHT));
				}
				if ((ii + iSide + 1) % 4 === 0) {
					const oY3 = (ii + 0.5) * Hfloor - stairsHT;
					rFig.addSecond(ctrRectangle(oX3, oY3, param.W2, stairsHT));
					for (let jj = 0; jj < param.N3; jj++) {
						const oX4 = stairsL1ox2 - oppos * (param.W8 / 2 + jj * stL) + dOrig2;
						const oY4 = (ii + 0.5) * Hfloor + (param.N3 - jj) * stairsH - stairsHT;
						rFig.addMainO(ctrRectangle(oX4, oY4, stL, stairsHT));
					}
				}
				if (ii > 0) {
					const ctrs = ctrsWindows((ii + iSide) % 4);
					for (const iCtr of ctrs) {
						rFig.addSecond(iCtr.translate(stairsL1ox2, ii * Hfloor));
					}
				}
			}
			return rFig;
		}
		// final figure list
		rGeome.fig = {
			faceHplan: figHplan,
			faceDoor: figDoor,
			faceWin1: figWindow(0, figDoor),
			faceWin2: figWindow(1, figDoor),
			faceWin3: figWindow(2, figDoor),
			faceWin4: figWindow(3, figDoor),
			faceCorri: figCorridor,
			faceFS: figFloorSupport,
			faceTopExt: figTopExt,
			faceTCFront: figTopCabFront,
			faceTCMid: figTopCabMid,
			faceTCRear: figTopCabRear,
			faceFloors: figFloors,
			faceStairsL1: figStairs(2, false),
			faceStairsW2: figStairs(1, false),
			faceStairsL2: figStairs(0, true),
			faceStairsW1: figStairs(3, true)
		};
		// volume
		const designName = rGeome.partName;
		const hollowObj: tExtrude[] = [];
		const hollowName: string[] = [];
		for (let idx = 0; idx < param.N1; idx++) {
			const wallIdx = (idx + initDoorIn) % 4;
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
		// adding stones
		const corriObj: tExtrude[] = [];
		const corriName: string[] = [];
		const corriPosX = [
			param.T2 + param.W2,
			param.T2 + param.W2 + 2 * param.T1 + param.L1,
			param.T2 + param.W2,
			param.T2
		];
		const corriPosY = [
			param.T2,
			param.T2 + param.W2 + param.W1 + 2 * param.T1,
			param.T2 + param.W2 + 2 * param.T1 + param.W1,
			param.T2 + param.W2 + param.W1 + 2 * param.T1
		];
		for (let ii = 0; ii < param.N1; ii++) {
			// corridor vault
			for (let jj = 0; jj < 4; jj++) {
				const Ty = jj % 2 === 0 ? param.L1 : param.W1;
				const wallIdx = jj % 2 === 0 ? 1 : 0;
				corriObj.push({
					outName: `subpax_${designName}_corri${ii}_${jj}`,
					face: `${designName}_faceCorri`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: Ty + 2 * param.T1,
					rotate: [Math.PI / 2, 0, (wallIdx * Math.PI) / 2],
					translate: [corriPosX[jj], corriPosY[jj], ii * Hfloor]
				});
				corriName.push(`subpax_${designName}_corri${ii}_${jj}`);
			}
			// floor support
			for (let jj = 0; jj < param.N4; jj++) {
				corriObj.push({
					outName: `subpax_${designName}_fs${ii}_${jj}`,
					face: `${designName}_faceFS`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T4,
					rotate: [Math.PI / 2, 0, Math.PI / 2],
					translate: [sfoX + jj * sfdX2, sfoY, ii * Hfloor]
				});
				corriName.push(`subpax_${designName}_fs${ii}_${jj}`);
			}
		}
		// top-external
		corriObj.push({
			outName: `subpax_${designName}_topExt`,
			face: `${designName}_faceTopExt`,
			extrudeMethod: EExtrude.eLinearOrtho,
			length: param.H5,
			rotate: [0, 0, 0],
			translate: [0, 0, param.N1 * Hfloor]
		});
		corriName.push(`subpax_${designName}_topExt`);
		// top-cabine
		corriObj.push({
			outName: `subpax_${designName}_TCFront`,
			face: `${designName}_faceTCFront`,
			extrudeMethod: EExtrude.eLinearOrtho,
			length: param.T1,
			rotate: [Math.PI / 2, 0, Math.PI / 2],
			translate: [oXY1, 0, 0]
		});
		corriName.push(`subpax_${designName}_TCFront`);
		corriObj.push({
			outName: `subpax_${designName}_TCMid`,
			face: `${designName}_faceTCMid`,
			extrudeMethod: EExtrude.eLinearOrtho,
			length: 2 * param.T1 + param.L1,
			rotate: [Math.PI / 2, 0, Math.PI / 2],
			translate: [oXY1, 0, 0]
		});
		corriName.push(`subpax_${designName}_TCMid`);
		corriObj.push({
			outName: `subpax_${designName}_TCRear`,
			face: `${designName}_faceTCRear`,
			extrudeMethod: EExtrude.eLinearOrtho,
			length: param.T1,
			rotate: [Math.PI / 2, 0, Math.PI / 2],
			translate: [oXY1 + param.T1 + param.L1, 0, 0]
		});
		corriName.push(`subpax_${designName}_TCRear`);
		corriObj.push({
			outName: `subpax_${designName}_stairsL1`,
			face: `${designName}_faceStairsL1`,
			extrudeMethod: EExtrude.eLinearOrtho,
			length: param.W2,
			rotate: [Math.PI / 2, 0, 0],
			translate: [0, param.W2 + param.T2, 0]
		});
		corriName.push(`subpax_${designName}_stairsL1`);
		corriObj.push({
			outName: `subpax_${designName}_stairsL2`,
			face: `${designName}_faceStairsL2`,
			extrudeMethod: EExtrude.eLinearOrtho,
			length: param.W2,
			rotate: [Math.PI / 2, 0, 0],
			translate: [0, param.T2 + 2 * param.W2 + 2 * param.T1 + param.W1, 0]
		});
		corriName.push(`subpax_${designName}_stairsL2`);
		corriObj.push({
			outName: `subpax_${designName}_stairsW1`,
			face: `${designName}_faceStairsW1`,
			extrudeMethod: EExtrude.eLinearOrtho,
			length: param.W2,
			rotate: [Math.PI / 2, 0, Math.PI / 2],
			translate: [param.T2, 0, 0]
		});
		corriName.push(`subpax_${designName}_stairsW1`);
		corriObj.push({
			outName: `subpax_${designName}_stairsW2`,
			face: `${designName}_faceStairsW2`,
			extrudeMethod: EExtrude.eLinearOrtho,
			length: param.W2,
			rotate: [Math.PI / 2, 0, Math.PI / 2],
			translate: [param.T2 + param.W2 + 2 * param.T1 + param.L1, 0, 0]
		});
		corriName.push(`subpax_${designName}_stairsW2`);
		if (param.showFloor) {
			corriObj.push({
				outName: `subpax_${designName}_Floors`,
				face: `${designName}_faceFloors`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.L1,
				rotate: [Math.PI / 2, 0, Math.PI / 2],
				translate: [oXY1 + param.T1, 0, 0]
			});
			corriName.push(`subpax_${designName}_Floors`);
		}
		// volumes together
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
				...hollowObj,
				...corriObj
			],
			volumes: [
				{
					outName: `ipax_${designName}_stone`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_Hplan`, ...corriName]
				},
				{
					outName: `ipax_${designName}_hollow`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_door`, ...hollowName]
				},
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eSubstraction,
					inList: [`ipax_${designName}_stone`, `ipax_${designName}_hollow`]
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
