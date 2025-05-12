// springOne.ts
// bearing-holder with integated spring

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
	//withinPiPi,
	//ShapePoint,
	//point,
	contour,
	contourCircle,
	//ctrRectangle,
	figure,
	degToRad,
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
import type { tContourJ, Facet, tJuncs, tHalfProfile } from 'sheetfold';
import {
	tJDir,
	tJSide,
	contourJ,
	facet,
	//contourJ2contour,
	facet2figure,
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
		pNumber('smEy', 'mm', 1, 0.1, 10, 0.1),
		pNumber('shEy', 'mm', 1, 0.1, 10, 0.1),
		pNumber('shPr', '%', 90, 0, 99, 1),
		pNumber('sNx', 'xHoles', 2, 2, 200, 1),
		pNumber('smEx', 'mm', 1, 0.1, 10, 0.1),
		pNumber('smExS', 'mm', 0.5, 0.1, 10, 0.1),
		pSectionSeparator('Screw holes'),
		pNumber('D3', 'mm', 6, 1, 100, 1),
		pNumber('P3', 'mm', 70, 1, 200, 1),
		pNumber('P4', 'mm', 30, 1, 200, 1),
		pSectionSeparator('Borders'),
		pNumber('L2', 'mm', 20, 1, 200, 1),
		pNumber('E3', 'mm', 1, 0, 20, 0.1),
		pNumber('W1', 'mm', 20, 1, 200, 1),
		pNumber('W3', 'mm', 50, 1, 400, 1),
		pNumber('Rc3', 'mm', 0.5, 0, 10, 0.1),
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
		smEy: 'springOne_spring.svg',
		shEy: 'springOne_spring.svg',
		shPr: 'springOne_spring.svg',
		sNx: 'springOne_spring.svg',
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
	const figWallB = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const R1 = param.D1 / 2;
		const R3 = param.D3 / 2;
		const Hwall = param.H1 + param.H2 + param.R2;
		const aJa = degToRad(param.Jangle);
		const aJn = param.Jneutral / 100;
		const aJr = param.Jradius;
		const aJm = param.Jmark;
		const Hfoot = param.Jradius + (1 - aJn) * param.Th;
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
		const cotanBAD = xAD / yAD;
		// wall-2
		const L12b = L12 + xFoot;
		const aBACb = Math.atan2(param.H2, L12b);
		const lACb = Math.sqrt(L12b ** 2 + param.H2 ** 2);
		const aCADb = Math.asin(param.R2 / lACb);
		const lADb = lACb * Math.cos(aCADb);
		const xADb = lADb * Math.cos(aBACb + aCADb);
		const yADb = lADb * Math.sin(aBACb + aCADb);
		const cotanBADb = xADb / yADb;
		// bottom
		const L2b = param.L2 - param.E3;
		const L1b = param.L1 + 2 * param.E3;
		const W3b = (param.W3 - param.W1) / 2;
		const midBottomX = L2b + L1b / 2;
		const midBottomY = param.W3 / 2;
		const P32 = param.P3 / 2;
		const P42 = param.P4 / 2;
		const L122 = param.L1 + 2 * param.L2;
		// spring
		const sHeight = param.H1 + param.H2 - R1 - param.E1 - param.E2;
		const sStepY = param.smEy + param.shEy;
		const sNy = Math.floor((sHeight + param.smEy) / sStepY);
		const sRc = (param.shEy * param.shPr) / 200;
		// step-5 : checks on the parameter values
		if (R1 < 0.1) {
			throw `err087: R1 ${ffix(R1)} is too small because of D1 ${param.D1}`;
		}
		if (L2b < 0.1) {
			throw `err165: L2b ${ffix(L2b)} is too small because of E3 ${param.E3}`;
		}
		if (param.E3 < param.Rc3) {
			throw `err170: E3 ${param.E3} is too small compare to Rc3 ${param.Rc3}`;
		}
		if (W3b < param.Rc3) {
			throw `err174: W3b ${ffix(W3b)} is too small compare to Rc3 ${param.Rc3}`;
		}
		if (param.spring === 1) {
			if (sHeight < 0.1) {
				throw `err189: sHeight ${ffix(sHeight)} is too small because of E1 ${param.E1} or E2 ${param.E2}`;
			}
		}
		// step-6 : any logs
		rGeome.logstr += `Bearing holder wall: Hwall ${ffix(Hwall)}, Hfoot ${ffix(Hfoot)} mm\n`;
		if (param.spring === 1) {
			rGeome.logstr += `spring: sNy ${sNy}, sRc ${ffix(sRc)} mm\n`;
		} else {
			rGeome.logstr += `No spring\n`;
		}
		// sub-function
		// step-7 : drawing of the figures
		// spring
		function makeSpringHollow(iLen: number): tContour {
			const rCtr = contour(0, 0)
				.addCornerRounded(sRc)
				.addSegStrokeR(iLen, 0)
				.addCornerRounded(sRc)
				.addSegStrokeR(0, param.shEy)
				.addCornerRounded(sRc)
				.addSegStrokeR(-iLen, 0)
				.addCornerRounded(sRc)
				.closeSegStroke();
			return rCtr;
		}
		function calcXref(iyRef: number, iSel: number, idx: number): [number, number, number] {
			const cotan = iSel === 0 ? cotanBAD : cotanBADb;
			const cL = iSel === 0 ? 2 * L12 : 2 * L12b;
			const cy = iyRef - Hfoot - param.H1;
			const cx = cy < 0 ? cL : cL - 2 * cy * cotan;
			const cx0 = param.L1 / 2 - cx / 2 + param.smExS;
			const nx = idx % 2 === 0 ? param.sNx + 1 : param.sNx;
			const lx = (cx - 2 * param.smExS + param.smEx) / nx - param.smEx;
			if (lx < 2 * sRc) {
				throw `err228: lx ${ffix(lx)} is too small compare to ${param.sNx} or ${param.smEx}`;
			}
			return [cx0, lx, nx];
		}
		const sW1: tContour[] = [];
		const sWB: tContour[] = [];
		if (param.spring === 1) {
			for (let jj = 0; jj < sNy; jj++) {
				const yy = Hfoot + param.E1 + jj * sStepY;
				const yRef = yy + param.shEy / 2;
				const [xRef, lx, nx] = calcXref(yRef, 0, jj);
				const [xRefB, lxb] = calcXref(yRef, 1, jj);
				for (let ii = 0; ii < nx; ii++) {
					const xx = xRef + ii * (lx + param.smEx);
					const xxb = xRefB + ii * (lxb + param.smEx);
					sW1.push(makeSpringHollow(lx).translate(xx, yy));
					sWB.push(makeSpringHollow(lxb).translate(xxb, yy));
				}
			}
		}
		// facet Wall
		function makeCtrWall(iJunctionName: string): tContourJ {
			const rCtr = contourJ(0, Hfoot)
				.startJunction(iJunctionName, tJDir.eB, tJSide.eABRight)
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
			return rCtr;
		}
		const ctrWall1 = makeCtrWall('J1');
		const ctrWall2 = makeCtrWall('J2');
		const ctrAxis = contourCircle(L12, Hfoot + param.H1 + param.H2, R1);
		const ctrBearing = contourCircle(L12, Hfoot + param.H1 + param.H2, param.Dbearing / 2);
		const faWall1 = facet([ctrWall1, ctrAxis, ...sW1]);
		const faWall2 = facet([ctrWall2, ctrAxis, ...sW1]);
		// facet Bottom
		const ctrBottom = contourJ(0, 0)
			.addSegStrokeR(L2b, 0)
			.addSegStrokeR(0, W3b)
			.addCornerRounded(param.Rc3)
			.addSegStrokeR(param.E3, 0)
			.startJunction('J1', tJDir.eA, tJSide.eABLeft)
			.addSegStrokeR(param.L1, 0)
			.addSegStrokeR(param.E3, 0)
			.addCornerRounded(param.Rc3)
			.addSegStrokeR(0, -W3b)
			.addSegStrokeR(L2b, 0);
		if (param.B2 === 1) {
			ctrBottom.startJunction('J4', tJDir.eA, tJSide.eABLeft);
		}
		ctrBottom
			.addSegStrokeR(0, param.W3)
			.addSegStrokeR(-L2b, 0)
			.addSegStrokeR(0, -W3b)
			.addCornerRounded(param.Rc3)
			.addSegStrokeR(-param.E3, 0)
			.startJunction('J2', tJDir.eA, tJSide.eABLeft)
			.addSegStrokeR(-param.L1, 0)
			.addSegStrokeR(-param.E3, 0)
			.addCornerRounded(param.Rc3)
			.addSegStrokeR(0, W3b)
			.addSegStrokeR(-L2b, 0);
		if (param.B2 === 1) {
			ctrBottom.startJunction('J3', tJDir.eA, tJSide.eABLeft);
		}
		ctrBottom.closeSegStroke();
		const hollowBottom: tContour[] = [];
		hollowBottom.push(contourCircle(midBottomX - P32, midBottomY - P42, R3));
		hollowBottom.push(contourCircle(midBottomX - P32, midBottomY + P42, R3));
		hollowBottom.push(contourCircle(midBottomX + P32, midBottomY - P42, R3));
		hollowBottom.push(contourCircle(midBottomX + P32, midBottomY + P42, R3));
		const faBottom = facet([ctrBottom, ...hollowBottom]);
		// facet Side
		function makeCtrSide(iJunctionName: string): tContourJ {
			const rCtr = contourJ(0, 0)
				.startJunction(iJunctionName, tJDir.eB, tJSide.eABRight)
				.addSegStrokeR(param.W3, 0)
				.addSegStrokeR(0, param.A2)
				.addCornerRounded(param.Rc2)
				.addSegStrokeR(-param.W3, 0)
				.addCornerRounded(param.Rc2)
				.closeSegStroke();
			return rCtr;
		}
		const faSide: Facet[] = [];
		const junctionSide: tJuncs = {};
		if (param.B2 === 1) {
			faSide.push(facet([makeCtrSide('J3')]));
			faSide.push(facet([makeCtrSide('J4')]));
			junctionSide['J3'] = { angle: aJa, radius: aJr, neutral: aJn, mark: aJm };
			junctionSide['J4'] = { angle: aJa, radius: aJr, neutral: aJn, mark: aJm };
		}
		// sheetFold
		let half1: tHalfProfile = [];
		let half2: tHalfProfile = [];
		if (param.B2 === 1) {
			half1 = ['J3', param.A2];
			half2 = ['J4', param.A2];
		}
		const sFold = sheetFold(
			[faBottom, faWall1, faWall2, ...faSide],
			{
				J1: { angle: aJa, radius: aJr, neutral: aJn, mark: aJm },
				J2: { angle: aJa, radius: aJr, neutral: aJn, mark: aJm },
				...junctionSide
			},
			[
				{ x1: 0, y1: 0, a1: 0, l1: param.W1, ante: ['J1', Hwall], post: ['J2', Hwall] },
				{ x1: 0, y1: Hfoot + 1.5 * Hwall, a1: 0, l1: L122, ante: half1, post: half2 }
			],
			param.Th,
			rGeome.partName
		);
		// figWallB
		const ctrWallB = contourJ(0, 0)
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
		figWallB.addMainOI([ctrWallB, ctrAxis, ...sWB]);
		//figWallB.addMainOI([contourJ2contour(ctrWall1), ctrAxis]);
		//const figWallB = facet2figure(faWall);
		figWallB.addSecond(ctrBearing);
		//figWallB.addSecond(contourJ2contour(ctrWall1));
		figWallB.mergeFigure(facet2figure(faWall1), true);
		// final figure list
		rGeome.fig = {
			faceWallB: figWallB
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
