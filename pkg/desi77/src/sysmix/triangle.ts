// triangle.ts
// triangle sandwich for experimenting systemix

import type {
	//tContour,
	//tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	tPageDef
	//tExtrude
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
	//ctrRectangle,
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
//import { triALLrLAA } from 'triangule';

const pDef: tParamDef = {
	partName: 'square',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('W1', 'mm', 100, 5, 500, 1),
		pNumber('T1', 'mm', 20, 1, 500, 1),
		pNumber('E1', 'mm', 10, 1, 500, 1),
		pNumber('N1', 'triangles', 3, 1, 20, 1),
		pSectionSeparator('Details and hole'),
		pNumber('R1', 'mm', 0, 0, 50, 1),
		pNumber('Di', 'mm', 50, 2, 500, 1)
	],
	paramSvg: {
		W1: 'triangle_top.svg',
		T1: 'triangle_side.svg',
		E1: 'triangle_side.svg',
		N1: 'triangle_side.svg',
		R1: 'triangle_top.svg',
		Di: 'triangle_top.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figTriangle = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Ri = param.Di / 2;
		const W12 = param.W1 / 2;
		const W12h = W12 * Math.tan(Math.PI / 6);
		const W1h = W12 * Math.tan(Math.PI / 3);
		const surface = W12 * W1h - Math.PI * Ri ** 2;
		const volume = surface * param.T1;
		const Zoffset = param.T1 + param.E1;
		// step-5 : checks on the parameter values
		if (W12h < Ri) {
			throw `err077: W1 ${param.W1} is too small compare to Di ${param.Di}`;
		}
		// step-6 : any logs
		rGeome.logstr += `Surface ${ffix(surface)} mm2, volume ${ffix(volume)} mm3\n`;
		// sub-function
		// figTriangle
		const ctrTriangle = contour(-W12, -W12h)
			.addCornerRounded(param.R1)
			.addSegStrokeR(param.W1, 0)
			.addCornerRounded(param.R1)
			.addSegStrokeRP((2 * Math.PI) / 3, param.W1)
			.addCornerRounded(param.R1)
			.closeSegStroke();
		const ctrHole = contourCircle(0, 0, Ri);
		figTriangle.addMainOI([ctrTriangle, ctrHole]);
		// final figure list
		rGeome.fig = {
			faceTriangle: figTriangle
		};
		// volume
		const designName = rGeome.partName;
		const Vidx = [...Array(param.N1).keys()];
		rGeome.vol = {
			extrudes: Vidx.map((ii) => ({
				outName: `subpax_${designName}_tri${ii}`,
				face: `${designName}_faceTriangle`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.T1,
				rotate: [0, 0, 0],
				translate: [0, 0, ii * Zoffset]
			})),
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: Vidx.map((ii) => `subpax_${designName}_tri${ii}`)
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'triangle drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const triangleDef: tPageDef = {
	pTitle: 'triangle',
	pDescription: 'triangle sandwich shape for experimenting systemix',
	pDef: pDef,
	pGeom: pGeom
};

export { triangleDef };
