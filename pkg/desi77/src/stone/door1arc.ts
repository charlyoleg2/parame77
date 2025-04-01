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
	contour,
	contourCircle,
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
import { triLALrL, triLLLrA } from 'triangule';

const pDef: tParamDef = {
	partName: 'door1arc',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('W1', 'mm', 1500, 100, 4000, 1),
		pNumber('H1', 'mm', 1000, 1, 4000, 1),
		pNumber('H2p', '%', 50, 1, 100, 1),
		pSectionSeparator('brick'),
		pNumber('bW', 'mm', 400, 10, 1000, 1),
		pNumber('bH', 'mm', 200, 10, 1000, 1),
		pNumber('jW', 'mm', 0.2, 0, 200, 0.1),
		pNumber('T1', 'mm', 200, 1, 1000, 1)
	],
	paramSvg: {
		W1: 'door1Arc_nArcs.svg',
		H1: 'door1Arc_nArcs.svg',
		H2p: 'door1Arc_face.svg',
		bH: 'door1Arc_face.svg',
		bW: 'door1Arc_face.svg',
		jW: 'door1Arc_face.svg',
		T1: 'door1Arc_nArcs.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

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
		const aBAC = Math.PI / 2 - aDBE;
		const aGAD = 2 * aBAC;
		const [lGD, trilog1] = triLALrL(param.H2p, aGAD, R1);
		const [aDGA, trilog2] = triLLLrA(param.H2p, R1, lGD);
		const aBGD = Math.PI - aDGA;
		const aFGD = 2 * aBGD;
		const nVaultStone = Math.ceil((aFGD * R1) / param.bH);
		rGeome.logstr += trilog1 + trilog2;
		const bW2 = param.bW / 2;
		const nSideStone = Math.floor(param.H1 / param.bH);
		const nBottomStone = Math.floor(param.W1 / param.bW);
		const firstBottomW = (param.W1 + param.bW - nBottomStone * param.bW) / 2;
		// step-5 : checks on the parameter values
		if (param.H2p < 1) {
			throw `err167: H2p ${param.H2p} is too small`;
		}
		const bHs = param.bH - 2 * param.jW;
		if (bHs < 1.0) {
			throw `err192: bHs ${ffix(bHs)} is negative or almost zero`;
		}
		// step-6 : any logs
		rGeome.logstr += `Hdoor ${ffix(Hdoor)}, Hvault ${ffix(Hvault)} mm\n`;
		rGeome.logstr += `nVaultStone ${ffix(nVaultStone)} vault-stones\n`;
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
		figFace.addSecond(contourCircle(param.W1 / 2, param.H1 + Hvault - R1, R1));
		// side stones
		for (let idx = 0; idx < nSideStone; idx++) {
			const posY = idx * param.bH;
			const ibW = idx % 2 === 0 ? 2 * bW2 : bW2;
			figFace.addMainO(ctrBrick(-ibW, posY, ibW));
			figFace.addMainO(ctrBrick(param.W1, posY, ibW));
		}
		// bottom stones
		figFace.addMainO(ctrBrick(-bW2, -param.bH, firstBottomW));
		for (let idx = 0; idx < nBottomStone; idx++) {
			const posX = -bW2 + firstBottomW + idx * 2 * bW2;
			figFace.addMainO(ctrBrick(posX, -param.bH, 2 * bW2));
		}
		const posXBottom = -bW2 + firstBottomW + nBottomStone * 2 * bW2;
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
