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
	const figStoneA = figure();
	const figStoneB = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const W12 = param.W1 / 2;
		const a1 = degToRad(param.a1);
		const sin = Math.sin(a1);
		const cos = Math.cos(a1);
		function calc(iW12: number, iH1: number): [number, number, number, number] {
			const kA = (iW12 * (1 + cos)) / sin;
			const kB = sin ** 2 / (1 + cos);
			const H2 = (iH1 - kA) * kB;
			const R1 = (iW12 * sin + H2 * cos) / sin ** 2;
			const BC = R1 * cos;
			const AD = H2 / Math.tan(a1);
			return [H2, R1, BC, AD];
		}
		const [H2i, R1i, BCi, ADi] = calc(W12, param.H1);
		const H1ib = H2i + BCi + R1i;
		const fsox = param.T2 + param.E1;
		const W12e = W12 + param.T1 * Math.tan(a1 / 2);
		const H1e = param.H1 + 2 * param.T1;
		const [H2e, R1e, BCe, ADe] = calc(W12e, H1e);
		const H1eb = H2e + BCe + R1e;
		// stones
		const e1 = param.E1;
		const e12 = e1 / 2;
		const stoneW = param.T1;
		const stoneW2 = stoneW - e1;
		const AgFirstDx = stoneW / Math.tan(a1);
		const AgStart = W12e + AgFirstDx;
		const AgN = Math.floor(AgStart / stoneW);
		const AgLast = AgStart - AgN * stoneW;
		// surfaces
		const surf1 = R1i ** 2 * (Math.PI - a1);
		const surf2 = (H2i + BCi) * R1i * sin;
		const surf3 = W12 * H2i;
		const surfaceM2 = (surf1 + surf2 + surf3) * 10 ** -6;
		// step-5 : checks on the parameter values
		if (Math.abs(param.H1 - H1ib) > 0.1) {
			throw `err086: H1 ${ffix(param.H1)} and H1ib ${ffix(H1ib)} are not equal`;
		}
		if (Math.abs(H1e - H1eb) > 0.1) {
			throw `err102: H1e ${ffix(H1e)} and H1eb ${ffix(H1eb)} are not equal`;
		}
		if (Math.abs(H2e + BCe - param.T1 - (H2i + BCi)) > 0.1) {
			throw `err106: H2e ${ffix(H2e)} and BCe ${ffix(BCe)} not match the other circle center`;
		}
		// step-6 : any logs
		rGeome.logstr += `Surface ${ffix(surfaceM2)} m2\n`;
		//rGeome.logstr += `dbg095: ADi ${ffix(ADi)} mm\n`;
		rGeome.logstr += `dbg123: AgLast ${ffix(AgLast)} mm\n`;
		// sub-function
		// figProfile
		const ctrProfileI = contour(-W12, 0)
			.addSegStrokeR(2 * W12, 0)
			.addSegStrokeR(ADi, H2i)
			.addPointR(-ADi - W12, BCi + R1i)
			.addPointR(-2 * (ADi + W12), 0)
			.addSegArc2()
			.closeSegStroke();
		const ctrProfileE = contour(-W12e, -param.T1)
			.addSegStrokeR(2 * W12e, 0)
			.addSegStrokeR(ADe, H2e)
			.addPointR(-ADe - W12e, BCe + R1e)
			.addPointR(-2 * (ADe + W12e), 0)
			.addSegArc2()
			.closeSegStroke();
		figProfile.addMainOI([ctrProfileE, ctrProfileI]);
		figProfile.addSecond(contourCircle(0, H2i + BCi, R1i));
		// figSlice
		figSlice.addMainOI([
			ctrRectangle(0, -param.T1, param.T2, param.H1 + 2 * param.T1),
			ctrRectangle(0, 0, param.T2, param.H1)
		]);
		figSlice.addMainOI([
			ctrRectangle(fsox, -param.T1, param.T2, param.H1 + 2 * param.T1),
			ctrRectangle(fsox, 0, param.T2, param.H1)
		]);
		// figStoneA
		figStoneA.mergeFigure(figProfile, true);
		for (let ii = 0; ii < AgN; ii++) {
			const ox = -AgStart + ii * stoneW + e12;
			figStoneA.addMainO(ctrRectangle(ox, -stoneW, stoneW2, stoneW));
		}
		if (AgLast > e1) {
			if (2 * AgLast < stoneW) {
				figStoneA.addMainO(ctrRectangle(-AgLast + e12, -stoneW, 2 * AgLast - e1, stoneW));
			} else {
				figStoneA.addMainO(ctrRectangle(-AgLast + e12, -stoneW, AgLast - e1, stoneW));
				figStoneA.addMainO(ctrRectangle(e12, -stoneW, AgLast - e1, stoneW));
			}
		}
		for (let ii = 0; ii < AgN; ii++) {
			const ox = AgLast + ii * stoneW + e12;
			figStoneA.addMainO(ctrRectangle(ox, -stoneW, stoneW2, stoneW));
		}
		// figStoneB
		figStoneB.mergeFigure(figProfile, true);
		// final figure list
		rGeome.fig = {
			faceProfile: figProfile,
			faceSlice: figSlice,
			faceStoneA: figStoneA,
			faceStoneB: figStoneB
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_A`,
					face: `${designName}_faceStoneA`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_B`,
					face: `${designName}_faceStoneB`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T1,
					rotate: [0, 0, 0],
					translate: [0, 0, fsox]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_A`, `subpax_${designName}_B`]
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
