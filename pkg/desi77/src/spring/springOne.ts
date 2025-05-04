// springOne.ts
// bearing-holder with integated spring

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
	//contour,
	contourCircle,
	//ctrRectangle,
	figure,
	//degToRad,
	//radToDeg,
	ffix,
	pNumber,
	pCheckbox,
	//pDropdown,
	pSectionSeparator,
	//EExtrude,
	//EBVolume,
	initGeom
} from 'geometrix';
//import { triLALrL, triALLrL, triLLLrA } from 'triangule';
//import { triALLrLAA } from 'triangule';
//import type { Facet, tJuncs, tHalfProfile } from 'sheetfold';
import {
	//tJDir,
	//tJSide,
	contourJ,
	facet,
	contourJ2contour,
	//facet2figure,
	sheetFold
} from 'sheetfold';

const pDef: tParamDef = {
	partName: 'springOne',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1', 'mm', 16, 1, 100, 0.1),
		pNumber('Dbearing', 'mm', 35, 1, 100, 0.1),
		pNumber('H1', 'mm', 5, 1, 100, 1),
		pNumber('H2', 'mm', 15, 1, 100, 1),
		pNumber('R2', 'mm', 15, 1, 100, 1),
		pNumber('L1', 'mm', 50, 1, 200, 1),
		pNumber('Rc1', 'mm', 5, 0, 50, 1),
		pSectionSeparator('Spring zone'),
		pCheckbox('spring', true),
		pNumber('E1', 'mm', 2, 1, 100, 1),
		pNumber('E2', 'mm', 2, 1, 100, 1),
		pNumber('sNx', 'xHoles', 2, 2, 20, 1),
		pNumber('sNy', 'yHoles', 5, 1, 100, 1),
		pNumber('shPy', '%', 50, 1, 99, 1),
		pNumber('shPr', '%', 100, 0, 100, 1),
		pNumber('smEx', 'mm', 1, 0.1, 10, 0.1),
		pNumber('smExS', 'mm', 0.5, 0.1, 10, 0.1),
		pSectionSeparator('Screw holes'),
		pNumber('D3', 'mm', 2, 1, 100, 1),
		pNumber('P3', 'mm', 40, 1, 200, 1),
		pNumber('P4', 'mm', 20, 1, 200, 1),
		pSectionSeparator('Borders'),
		pNumber('L2', 'mm', 20, 1, 200, 1),
		pNumber('E3', 'mm', 1, 0, 20, 0.1),
		pNumber('W1', 'mm', 20, 1, 200, 1),
		pNumber('W3', 'mm', 50, 1, 400, 1),
		pNumber('Rc3', 'mm', 2, 0, 50, 1),
		pCheckbox('B2', true),
		pNumber('A2', 'mm', 10, 1, 200, 1),
		pNumber('Rc2', 'mm', 5, 0, 50, 1),
		pSectionSeparator('Folding'),
		pNumber('Th', 'mm', 1, 0.1, 10, 0.1),
		pNumber('Jangle', 'degree', 90, 0, 120, 1),
		pNumber('Jradius', 'mm', 2, 0.1, 10, 0.1),
		pNumber('Jneutral', '%', 50, 0, 100, 1),
		pNumber('Jmark', 'mm', 1, 0.1, 10, 0.1)
	],
	paramSvg: {
		D1: 'springOne_face.svg',
		Dbearing: 'springOne_face.svg',
		H1: 'springOne_face.svg',
		H2: 'springOne_face.svg',
		R2: 'springOne_face.svg',
		L1: 'springOne_face.svg',
		Rc1: 'springOne_face.svg',
		spring: 'springOne_spring.svg',
		E1: 'springOne_face.svg',
		E2: 'springOne_face.svg',
		sNx: 'springOne_spring.svg',
		sNy: 'springOne_spring.svg',
		shPy: 'springOne_spring.svg',
		shPr: 'springOne_spring.svg',
		smEx: 'springOne_spring.svg',
		smExS: 'springOne_spring.svg',
		D3: 'springOne_top.svg',
		P3: 'springOne_top.svg',
		P4: 'springOne_top.svg',
		L2: 'springOne_top.svg',
		E3: 'springOne_top.svg',
		W1: 'springOne_top.svg',
		W3: 'springOne_top.svg',
		Rc3: 'springOne_top.svg',
		B2: 'springOne_face.svg',
		A2: 'springOne_face.svg',
		Rc2: 'springOne_side.svg',
		Th: 'springOne_side.svg',
		Jangle: 'springOne_face.svg',
		Jradius: 'springOne_face.svg',
		Jneutral: 'springOne_face.svg',
		Jmark: 'springOne_face.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figWall2 = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const R1 = param.D1 / 2;
		const Hwall = param.H1 + param.H2 + param.R2;
		const Jneutral = param.Jneutral / 100.0;
		const Hfoot = param.Jradius + (1 - Jneutral) * param.Th;
		const xFoot = 2 * param.E3;
		// wall-1
		const L12 = param.L1 / 2;
		const aBAC = Math.atan2(param.H2, L12);
		const lAC = Math.sqrt(L12 ** 2 + param.H2 ** 2);
		if (param.R2 > lAC) {
			throw `err141: R2 ${param.R2} is too large comapre to lAC ${ffix(lAC)} mm`;
		}
		const aCAD = Math.asin(param.R2 / lAC);
		const lAD = lAC * Math.cos(aCAD);
		const xAD = lAD * Math.cos(aBAC + aCAD);
		const yAD = lAD * Math.sin(aBAC + aCAD);
		// wall-2
		const L12b = L12 + xFoot;
		const aBACb = Math.atan2(param.H2, L12b);
		const lACb = Math.sqrt(L12b ** 2 + param.H2 ** 2);
		const aCADb = Math.asin(param.R2 / lACb);
		const lADb = lACb * Math.cos(aCADb);
		const xADb = lADb * Math.cos(aBACb + aCADb);
		const yADb = lADb * Math.sin(aBACb + aCADb);
		// step-5 : checks on the parameter values
		if (R1 < 0.1) {
			throw `err087: R1 ${R1} is too small because of D1 ${param.D1}`;
		}
		// step-6 : any logs
		rGeome.logstr += `Bearing holder wall: Hwall ${ffix(Hwall)}, Hfoot ${ffix(Hfoot)} mm\n`;
		// sub-function
		// step-7 : drawing of the figures
		const ctrWall = contourJ(0, Hfoot)
			.addSegStrokeR(param.L1, 0)
			.addSegStrokeR(0, param.H1)
			.addCornerRounded(param.Rc1)
			.addSegStrokeR(-xAD, yAD)
			.addPointA(L12, Hwall + Hfoot)
			.addPointA(xAD, param.H1 + yAD + Hfoot)
			.addSegArc2()
			.addSegStrokeR(-xAD, -yAD)
			.addCornerRounded(param.Rc1)
			.closeSegStroke();
		const ctrAxis = contourCircle(L12, Hfoot + param.H1 + param.H2, R1);
		const ctrBearing = contourCircle(L12, Hfoot + param.H1 + param.H2, param.Dbearing / 2);
		const faWall = facet([ctrWall, ctrAxis]);
		// sheetFold
		//const half1 = ['J1', param.L1];
		//const half2 = ['J1', param.L1, 'J5', param.L1];
		const sFold = sheetFold(
			[faWall],
			{},
			[
				{ x1: 0, y1: 0, a1: 0, l1: param.L1, ante: [], post: [] },
				{ x1: 0, y1: 1.5 * param.W1, a1: 0, l1: param.W1, ante: [], post: [] }
			],
			param.Th,
			rGeome.partName
		);
		// figWall2
		const ctrWall2 = contourJ(0, 0)
			.addSegStrokeR(param.L1, 0)
			.addSegStrokeR(0, Hfoot)
			.addSegStrokeR(xFoot, 0)
			.addSegStrokeR(0, param.H1)
			.addCornerRounded(param.Rc1)
			.addSegStrokeR(-xADb, yADb)
			.addPointA(L12, Hwall + Hfoot)
			.addPointA(xADb - xFoot, param.H1 + yADb + Hfoot)
			.addSegArc2()
			.addSegStrokeR(-xADb, -yADb)
			.addCornerRounded(param.Rc1)
			.addSegStrokeR(0, -param.H1)
			.addSegStrokeR(xFoot, 0)
			.closeSegStroke();
		figWall2.addMainOI([ctrWall2, ctrAxis]);
		//figWall2.addMainOI([contourJ2contour(ctrWall), ctrAxis]);
		//const figWall2 = facet2figure(faWall);
		figWall2.addSecond(ctrBearing);
		figWall2.addSecond(contourJ2contour(ctrWall));
		// final figure list
		rGeome.fig = {
			faceWall2: figWall2
		};
		const ffObj = sFold.makeFigures();
		for (const iFace of Object.keys(ffObj)) {
			rGeome.fig[iFace] = ffObj[iFace];
		}
		// step-8 : recipes of the 3D construction
		rGeome.vol = sFold.makeVolume();
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'springOne drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const springOneDef: tPageDef = {
	pTitle: 'springOne',
	pDescription: 'bearing-holder with integated spring',
	pDef: pDef,
	pGeom: pGeom
};

export { springOneDef };
