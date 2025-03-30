// door1arc.ts
// door or window with a 1-arc vault

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
import { triLALrL, triALLrL, triLLLrA } from 'triangule';

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
		pNumber('T1', 'mm', 200, 1, 1000, 1)
	],
	paramSvg: {
		W1: 'door1Arc_nArcs.svg',
		H1: 'door1Arc_nArcs.svg',
		H2p: 'door1Arc_face.svg',
		bH: 'door1Arc_face.svg',
		bW: 'door1Arc_face.svg',
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
		const bW2 = param.bW / 2;
		const R2 = R1 + bW2;
		const R3 = R2 + bW2;
		const aBAC = Math.PI / 2 - aDBE;
		const aGAD = 2 * aBAC;
		const aBGD = Math.PI - aGAD;
		const aFGD = 2 * aBGD;
		const [lGD, trilog1] = triLALrL(param.Hc, aGAD, R1);
		const [aDGA, trilog2] = triLLLrA(param.Hc, R1, lGD);
		const [lAI1, lAI2, trilog3] = triALLrL(aDGA, param.Hc, R3);
		const nStone = Math.ceil((aFGD * lAI1) / param.bH);
		rGeome.logstr += trilog1 + trilog2 + trilog3;
		// step-5 : checks on the parameter values
		if (param.H2p < 1) {
			throw `err167: H2p ${param.H2p} is too small`;
		}
		// step-6 : any logs
		rGeome.logstr += `Hdoor ${ffix(Hdoor)}, Hvault ${ffix(Hvault)} mm\n`;
		rGeome.logstr += `nStone ${ffix(nStone)} vault-stones\n`;
		rGeome.logstr += `dbg093: lAI1 ${ffix(lAI1)}, lAI2 ${ffix(lAI2)} mm\n`;
		// figFace
		const ctrDoor = contour(0, 0)
			.addSegStrokeR(param.W1, 0)
			.addSegStrokeR(0, param.H1)
			.addPointR(-param.W1 / 2, Hvault)
			.addPointR(-param.W1, 0)
			.addSegArc2()
			.closeSegStroke();
		figFace.addMainO(ctrDoor);
		figFace.addSecond(contourCircle(0, 0, param.H2p));
		figFace.addSecond(ctrRectangle(-param.bW, 0, param.bW, param.bH));
		figFace.addSecond(ctrRectangle(-param.bW / 2, param.bH, param.bW / 2, param.bH));
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
