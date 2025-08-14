// bridge.ts
// a bridge for the train-capsule

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
	//contourCircle,
	//ctrRectangle,
	figure,
	//degToRad,
	//radToDeg,
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
//import { triALLrLAA } from 'triangule';

const pDef: tParamDef = {
	partName: 'bridge',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('N1', 'arc', 10, 1, 100, 1),
		pNumber('W1', 'm', 20, 1, 100, 0.1),
		pNumber('W2', 'm', 2, 1, 100, 0.1),
		pNumber('H1', 'm', 2, 1, 100, 0.1),
		pNumber('H2', 'm', 30, 1, 100, 0.1),
		pDropdown('arcStyle', ['gothic', 'half-circle', 'rectangular']),
		pNumber('Ea', 'm', 10, 1, 100, 0.1),
		pSectionSeparator('Transversal'),
		pNumber('W3', 'm', 10, 1, 100, 1),
		pNumber('W4', 'm', 30, 1, 100, 1),
		pNumber('H3', 'm', 5, 1, 500, 1),
		pNumber('H4', 'm', 20, 1, 500, 1),
		pDropdown('sideStyle', ['straight', 'arc']),
		pSectionSeparator('Valley extremity'),
		pNumber('Ix1', 'm', 5, 0, 50, 0.1),
		pNumber('Ih11', 'm', 2, 1, 50, 1),
		pNumber('Ih12', 'm', 2, 1, 50, 1),
		pNumber('Ix2', 'm', 5, 0, 50, 0.1),
		pNumber('Ih21', 'm', 2, 1, 50, 1),
		pNumber('Ih22', 'm', 2, 1, 50, 1),
		pSectionSeparator('Valley'),
		pNumber('p1x', '%', 20, 1, 99, 1),
		pNumber('p1y', 'm', -10, -300, 10, 1),
		pNumber('p2x', '%', 40, 1, 99, 1),
		pNumber('p2y', 'm', -20, -300, 10, 1),
		pNumber('p3x', '%', 60, 1, 99, 1),
		pNumber('p3y', 'm', -25, -300, 10, 1),
		pNumber('p4x', '%', 80, 1, 99, 1),
		pNumber('p4y', 'm', -15, -300, 10, 1)
	],
	paramSvg: {
		N1: 'bridge_panorama.svg',
		W1: 'bridge_panorama.svg',
		W2: 'bridge_panorama.svg',
		H1: 'bridge_panorama.svg',
		H2: 'bridge_panorama.svg',
		arcStyle: 'bridge_arc.svg',
		Ea: 'bridge_column.svg',
		W3: 'bridge_column.svg',
		W4: 'bridge_column.svg',
		H3: 'bridge_column.svg',
		H4: 'bridge_column.svg',
		sideStyle: 'bridge_column.svg',
		Ix1: 'bridge_panorama.svg',
		Ih11: 'bridge_panorama.svg',
		Ih12: 'bridge_panorama.svg',
		Ix2: 'bridge_panorama.svg',
		Ih21: 'bridge_panorama.svg',
		Ih22: 'bridge_panorama.svg',
		p1x: 'bridge_panorama.svg',
		p1y: 'bridge_panorama.svg',
		p2x: 'bridge_panorama.svg',
		p2y: 'bridge_panorama.svg',
		p3x: 'bridge_panorama.svg',
		p3y: 'bridge_panorama.svg',
		p4x: 'bridge_panorama.svg',
		p4y: 'bridge_panorama.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figArcade = figure();
	const figColumn = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const pi2 = Math.PI / 2;
		const W12 = param.W1 / 2;
		const W32 = param.W3 / 2;
		const W42 = param.W4 / 2;
		const Hg = W12 + param.Ea;
		const H12 = param.H1 + param.H2;
		const La = param.W2 + param.N1 * (param.W1 + param.W2);
		const Lb = La - param.Ix1 - param.Ix2;
		// step-5 : checks on the parameter values
		if (param.H2 < W12 && param.arcStyle === 1) {
			throw `err116: H2 ${param.H2} is too small compare to W1 ${param.W1} m`;
		}
		if (param.H2 < Hg && param.arcStyle === 0) {
			throw `err125: H2 ${param.H2} is too small compare to W1 ${param.W1} and Ea ${param.Ea} m`;
		}
		// step-6 : any logs
		rGeome.logstr += `Bridge length: ${ffix(Lb)} m\n`;
		// sub-function
		// figArcade
		const ctrArcade = contour(0, 0).addSegStrokeR(0, -H12).addSegStrokeR(param.W2, 0);
		for (let ii = 0; ii < param.N1; ii++) {
			switch (param.arcStyle) {
				case 1:
					// half-circle
					ctrArcade
						.addSegStrokeR(0, param.H2 - W12)
						.addPointR(W12, W12)
						.addPointR(2 * W12, 0)
						.addSegArc2()
						.addSegStrokeR(0, -param.H2 + W12)
						.addSegStrokeR(param.W2, 0);
					break;
				case 0:
					// gothic
					ctrArcade
						.addSegStrokeR(0, param.H2 - Hg)
						.addPointR(W12, Hg)
						.addSegArc3(pi2, true)
						.addPointR(W12, -Hg)
						.addSegArc3(pi2, false)
						.addSegStrokeR(0, -param.H2 + Hg)
						.addSegStrokeR(param.W2, 0);
					break;
				default:
					// rectangular
					ctrArcade
						.addSegStrokeR(0, param.H2)
						.addSegStrokeR(param.W1, 0)
						.addSegStrokeR(0, -param.H2)
						.addSegStrokeR(param.W2, 0);
			}
		}
		ctrArcade.addSegStrokeR(0, H12).closeSegStroke();
		figArcade.addMainO(ctrArcade);
		// figColumn
		const ctrColumn = contour(-W32, 0)
			.addSegStrokeR(W32 - W42, -H12)
			.addSegStrokeR(2 * W42, 0)
			.addSegStrokeR(0, H12)
			.closeSegStroke();
		figColumn.addMainO(ctrColumn);
		// final figure list
		rGeome.fig = {
			faceArcade: figArcade,
			faceColumn: figColumn
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_arcade`,
					face: `${designName}_faceArcade`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.W3,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_arcade`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'bridge drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const bridgeDef: tPageDef = {
	pTitle: 'bridge',
	pDescription: 'bridge for the train-capsule',
	pDef: pDef,
	pGeom: pGeom
};

export { bridgeDef };
