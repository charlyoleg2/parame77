// square.ts
// simple square shape for experimenting systemix

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
		pNumber('Di', 'mm', 50, 2, 500, 1),
		pSectionSeparator('Details and thickness'),
		pNumber('R1', 'mm', 0, 0, 50, 1),
		pNumber('T1', 'mm', 30, 1, 500, 1)
	],
	paramSvg: {
		W1: 'square_top.svg',
		Di: 'square_top.svg',
		R1: 'square_top.svg',
		T1: 'square_top.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figSquare = figure();
	const figHeight = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Ri = param.Di / 2;
		const W12 = param.W1 / 2;
		const surface = param.W1 ** 2 - Math.PI * Ri ** 2;
		const volume = surface * param.T1;
		// step-5 : checks on the parameter values
		if (param.W1 < param.Di) {
			throw `err069: W1 ${param.W1} is too small compare to Di ${param.Di}`;
		}
		// step-6 : any logs
		rGeome.logstr += `Surface ${ffix(surface)} mm2, volume ${ffix(volume)} mm3\n`;
		// sub-function
		// figSquare
		const ctrSquare = contour(-W12, -W12)
			.addCornerRounded(param.R1)
			.addSegStrokeR(param.W1, 0)
			.addCornerRounded(param.R1)
			.addSegStrokeR(0, param.W1)
			.addCornerRounded(param.R1)
			.addSegStrokeR(-param.W1, 0)
			.addCornerRounded(param.R1)
			.closeSegStroke();
		const ctrHole = contourCircle(0, 0, Ri);
		figSquare.addMainOI([ctrSquare, ctrHole]);
		// figHeight
		figHeight.addMainO(ctrRectangle(-W12, 0, 2 * W12, param.T1));
		figHeight.addSecond(ctrRectangle(-Ri, 0, 2 * Ri, param.T1));
		// final figure list
		rGeome.fig = {
			faceSquare: figSquare,
			faceHeight: figHeight
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_square`,
					face: `${designName}_faceSquare`,
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
					inList: [`subpax_${designName}_square`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'square drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const squareDef: tPageDef = {
	pTitle: 'square',
	pDescription: 'simple square shape for experimenting systemix',
	pDef: pDef,
	pGeom: pGeom
};

export { squareDef };
