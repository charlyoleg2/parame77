// tunnel.ts
// A tunnel for the train-capsule

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
	//withinPiPi,
	//ShapePoint,
	//point,
	contour,
	contourCircle,
	ctrRectangle,
	figure,
	degToRad,
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
//import { triALLrLAA } from 'triangule';

const pDef: tParamDef = {
	partName: 'tunnel',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('W1', 'mm', 2000, 500, 10000, 10),
		pNumber('H1', 'mm', 4000, 500, 10000, 10),
		pNumber('a1', 'degree', 75, 45, 100, 1),
		pSectionSeparator('Stone'),
		pNumber('T1', 'mm', 400, 100, 1000, 1),
		pNumber('T2', 'mm', 200, 100, 1000, 1),
		pNumber('E1', 'mm', 5, 0, 50, 1),
		// to be deleted
		pNumber('D1', 'mm', 100, 5, 500, 1),
		pNumber('Di', 'mm', 50, 2, 500, 1)
	],
	paramSvg: {
		W1: 'tunnel_profile.svg',
		H1: 'tunnel_profile.svg',
		a1: 'tunnel_profile.svg',
		T1: 'tunnel_profile.svg',
		T2: 'tunnel_profile.svg',
		E1: 'tunnel_profile.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figProfile = figure();
	const figSlice = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const W12 = param.W1 / 2;
		const a1 = degToRad(param.a1);
		const sin = Math.sin(a1);
		const cos = Math.cos(a1);
		const kA = (W12 * (1 + cos)) / sin;
		const kB = sin ** 2 / (1 + cos);
		const H2 = (param.H1 - kA) * kB;
		const R1 = (W12 * sin + H2 * cos) / sin ** 2;
		const BC = R1 * cos;
		const H1b = H2 + BC + R1;
		const AD = H2 / Math.tan(a1);
		const surf1 = R1 ** 2 * (Math.PI - a1);
		const surf2 = (H2 + BC) * R1 * sin;
		const surf3 = W12 * H2;
		const surfaceM2 = (surf1 + surf2 + surf3) / 10 * 6;
		// step-5 : checks on the parameter values
		if (Math.abs(param.H1 - H1b) > 0.1) {
			throw `err086: H1 ${param.H1} and H1b ${H1b} are not equal`;
		}
		// step-6 : any logs
		rGeome.logstr += `Surface ${ffix(surfaceM2)} m2\n`;
		//rGeome.logstr += `dbg095: AD ${ffix(AD)} mm\n`;
		// sub-function
		// figProfile
		const ctrProfileI = contour(-W12, 0)
			.addSegStrokeR(2 * W12, 0)
			.addSegStrokeR(AD, H2)
			.addPointR(-AD - W12, BC + R1)
			.addPointR(-2 * (AD + W12), 0)
			.addSegArc2()
			.closeSegStroke();
		figProfile.addMainO(ctrProfileI);
		figProfile.addSecond(contourCircle(0, H2 + BC, R1));
		// figSlice
		figSlice.addMainO(ctrRectangle(0, 0, param.T2, param.H1));
		figSlice.addSecond(ctrRectangle(param.T2 + param.E1, 0, param.T2, param.H1));
		// final figure list
		rGeome.fig = {
			faceProfile: figProfile,
			faceSlice: figSlice
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_slice1`,
					face: `${designName}_faceProfile`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_slice1`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'tunnel drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const tunnelDef: tPageDef = {
	pTitle: 'tunnel',
	pDescription: 'tunnel for the train-capsule',
	pDef: pDef,
	pGeom: pGeom
};

export { tunnelDef };
