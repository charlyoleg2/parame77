// door1arc.ts
// door or window with a 1-arc vault

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
	ShapePoint,
	point,
	contour,
	contourCircle,
	ctrRectangle,
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
import { triALLrL } from 'triangule';

const pDef: tParamDef = {
	partName: 'door1arc',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('W1', 'mm', 1500, 100, 4000, 1),
		pNumber('H1', 'mm', 1000, 1, 4000, 1),
		pNumber('H2p', '%', 50, 1, 100, 1),
		pSectionSeparator('vault'),
		pNumber('Hc', 'mm', 0, -1000, 1000, 1),
		pDropdown('spread', ['widest', 'odd', 'even']),
		pNumber('vL', 'mm', 400, 10, 1000, 1),
		pNumber('vW', 'mm', 200, 10, 1000, 1),
		pSectionSeparator('brick'),
		pNumber('bL', 'mm', 400, 10, 1000, 1),
		pNumber('bH', 'mm', 200, 10, 1000, 1),
		pNumber('jW', 'mm', 0.2, 0, 200, 0.1),
		pNumber('T1', 'mm', 200, 1, 1000, 1)
	],
	paramSvg: {
		W1: 'door1Arc_nArcs.svg',
		H1: 'door1Arc_nArcs.svg',
		H2p: 'door1Arc_face.svg',
		Hc: 'door1Arc_face.svg',
		spread: 'door1Arc_spread.svg',
		vL: 'door1Arc_vaultStone.svg',
		vW: 'door1Arc_vaultStone.svg',
		bL: 'door1Arc_face.svg',
		bH: 'door1Arc_face.svg',
		jW: 'door1Arc_face.svg',
		T1: 'door1Arc_nArcs.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function calcGL(aMGL: number, R1: number, lAG: number): number {
	let rlGL = R1; // lAG === 0
	if (lAG > 0) {
		let aA = aMGL + Math.PI / 2;
		if (aA > Math.PI) {
			aA = 2 * Math.PI - aA;
		}
		[, rlGL] = triALLrL(aA, lAG, R1);
	} else if (lAG < 0) {
		let aA = Math.PI / 2 - aMGL;
		if (aA < 0) {
			aA = -aA;
		}
		[, rlGL] = triALLrL(aA, -lAG, R1);
	}
	return rlGL;
}

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figFace = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Hvault = ((param.H2p / 100) * param.W1) / 2;
		const Hdoor = param.H1 + Hvault;
		const lBE = Hvault;
		const lDE = param.W1 / 2;
		const aDBE = Math.atan2(lDE, lBE);
		const lDB = Math.sqrt(lBE ** 2 + lDE ** 2);
		const lBC = lDB / 2;
		const lBA = lBC / Math.cos(aDBE);
		const R1 = lBA;
		const lEG = lBA - Hvault - param.Hc;
		const aMGF = Math.atan2(lEG, param.W1 / 2);
		const aFGD = Math.PI - 2 * aMGF;
		// nVaultStone, aVaultStone
		const Lmax = Math.max(calcGL(aMGF, R1, param.Hc), R1 - param.Hc);
		let nVaultStone = Math.ceil((aFGD * (Lmax + param.vL)) / param.vW);
		const nVeven = nVaultStone % 2 === 0 ? true : false;
		if (param.spread === 1 && nVeven) {
			nVaultStone += 1;
		} else if (param.spread === 2 && !nVeven) {
			nVaultStone += 1;
		}
		const aVaultStone = aFGD / nVaultStone;
		//rGeome.logstr += trilog1 + trilog2;
		const bL2 = param.bL / 2;
		const nSideStone = Math.floor(param.H1 / param.bH);
		const nBottomStone = Math.ceil(param.W1 / param.bL) - 1;
		const firstBottomW = (param.W1 + param.bL - nBottomStone * param.bL) / 2;
		// step-5 : checks on the parameter values
		if (param.H2p < 1) {
			throw `err167: H2p ${param.H2p} is too small`;
		}
		if (lEG < 1) {
			throw `err170: lEG ${lEG} is negative or almost zero`;
		}
		const bHs = param.bH - 2 * param.jW;
		if (bHs < 1.0) {
			throw `err192: bHs ${ffix(bHs)} is negative or almost zero`;
		}
		// step-6 : any logs
		rGeome.logstr += `Hdoor ${ffix(Hdoor)}, Hvault ${ffix(Hvault)} mm\n`;
		rGeome.logstr += `nVaultStone ${ffix(nVaultStone)} vault-stones\n`;
		rGeome.logstr += `aVaultStone ${ffix(radToDeg(aVaultStone))} degree ${ffix(aVaultStone * Lmax)} ${ffix(aVaultStone * (Lmax + param.vL))} mm\n`;
		//rGeome.logstr += `dbg100: aGAD ${ffix(aGAD)}, lGD ${ffix(lGD)}\n`;
		//rGeome.logstr += `dbg101: aDGA ${ffix(aDGA)}, aFGD ${ffix(aFGD)}\n`;
		// sub-function
		function ctrBrick(iX: number, iY: number, iW: number): tContour {
			const rCtr = ctrRectangle(
				iX + param.jW,
				iY + param.jW,
				iW - 2 * param.jW,
				param.bH - 2 * param.jW
			);
			return rCtr;
		}
		// figFace
		// hollow
		const ctrDoor = contour(0, 0, 'green')
			.addSegStrokeR(param.W1, 0)
			.addSegStrokeR(0, param.H1)
			.addPointR(-param.W1 / 2, Hvault)
			.addPointR(-param.W1, 0)
			.addSegArc2()
			.closeSegStroke();
		figFace.addSecond(ctrDoor);
		const ccx = param.W1 / 2;
		const ccy = param.H1 + Hvault - R1;
		figFace.addDynamics(contourCircle(ccx, ccy, R1));
		figFace.addPoint(point(ccx, ccy, ShapePoint.eTwoTri));
		figFace.addPoint(point(ccx, ccy + param.Hc, ShapePoint.eSquare));
		// vault stones
		for (let idx = 0; idx < nVaultStone; idx++) {
			const a0 = aMGF + idx * aVaultStone;
			const l0 = calcGL(a0, R1, param.Hc);
			const a1 = a0 + aVaultStone;
			const l1 = calcGL(a1, R1, param.Hc);
			const pt0 = point(param.W1 / 2, param.H1 - lEG).translatePolar(a0, l0);
			const pt1 = point(param.W1 / 2, param.H1 - lEG).translatePolar(a1, l1 + param.vL);
			const ctrV = contour(pt0.cx, pt0.cy)
				.addSegStrokeRP(a0, param.vL)
				.addSegStrokeA(pt1.cx, pt1.cy)
				.addSegStrokeRP(a1 + Math.PI, param.vL)
				.closeSegStroke();
			figFace.addMainO(ctrV);
		}
		// side stones
		for (let idx = 0; idx < nSideStone; idx++) {
			const posY = idx * param.bH;
			const ibW = idx % 2 === 0 ? 2 * bL2 : bL2;
			figFace.addMainO(ctrBrick(-ibW, posY, ibW));
			figFace.addMainO(ctrBrick(param.W1, posY, ibW));
		}
		// bottom stones
		figFace.addMainO(ctrBrick(-bL2, -param.bH, firstBottomW));
		for (let idx = 0; idx < nBottomStone; idx++) {
			const posX = -bL2 + firstBottomW + idx * 2 * bL2;
			figFace.addMainO(ctrBrick(posX, -param.bH, 2 * bL2));
		}
		const posXBottom = -bL2 + firstBottomW + nBottomStone * 2 * bL2;
		figFace.addMainO(ctrBrick(posXBottom, -param.bH, firstBottomW));
		// final figure list
		rGeome.fig = {
			faceDoor: figFace
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_top`,
					face: `${designName}_faceDoor`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eIdentity,
					inList: [`subpax_${designName}_top`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'door1arc drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const door1arcDef: tPageDef = {
	pTitle: 'door1arc',
	pDescription: 'A door or a window with a 1-arc vault',
	pDef: pDef,
	pGeom: pGeom
};

export { door1arcDef };
