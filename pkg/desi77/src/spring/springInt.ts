// springInt.ts
// bearing-holder in the interior of a ring

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
	//figure,
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
//import type { tContourJ, Facet, tJuncs, tHalfProfile } from 'sheetfold';
import type { tContourJ, Facet, tJuncs } from 'sheetfold';
import {
	tJDir,
	tJSide,
	contourJ,
	facet,
	//contourJ2contour,
	//facet2figure,
	sheetFold
} from 'sheetfold';

const pDef: tParamDef = {
	partName: 'springInt',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D5', 'mm', 140, 10, 5000, 1),
		pNumber('N5', 'unit', 8, 3, 100, 1),
		pNumber('W2', 'mm', 20, 1, 200, 1),
		pSectionSeparator('One unit'),
		pNumber('D1', 'mm', 16, 1, 100, 0.1),
		pNumber('H1', 'mm', 5, 1, 100, 1),
		pNumber('H2', 'mm', 15, 1, 100, 1),
		pNumber('R2', 'mm', 15, 1, 100, 1),
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
		pSectionSeparator('Folding'),
		pNumber('Th', 'mm', 1, 0.1, 10, 0.1),
		pNumber('Jangle', 'degree', 90, 0, 120, 1),
		pNumber('Jradius', 'mm', 2, 0.1, 10, 0.1),
		pNumber('Jneutral', '%', 50, 0, 100, 1),
		pNumber('Jmark', 'mm', 1, 0.1, 10, 0.1)
	],
	paramSvg: {
		D5: 'springInt_global.svg',
		N5: 'springInt_global.svg',
		W2: 'springInt_global.svg',
		D1: 'springInt_face.svg',
		H1: 'springInt_face.svg',
		H2: 'springInt_face.svg',
		R2: 'springInt_face.svg',
		spring: 'springInt_spring.svg',
		E1: 'springInt_face.svg',
		E2: 'springInt_face.svg',
		smEy: 'springInt_spring.svg',
		shEy: 'springInt_spring.svg',
		shPr: 'springInt_spring.svg',
		sNx: 'springInt_spring.svg',
		smEx: 'springInt_spring.svg',
		smExS: 'springInt_spring.svg',
		Th: 'springInt_section.svg',
		Jangle: 'springInt_face.svg',
		Jradius: 'springInt_face.svg',
		Jneutral: 'springInt_face.svg',
		Jmark: 'springInt_face.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	//const figWallB = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const aJa = degToRad(param.Jangle);
		const aJn = param.Jneutral / 100;
		const aJr = param.Jradius;
		const aJm = param.Jmark;
		const Hfoot = aJr + (1 - aJn) * param.Th;
		const R5 = param.D5 / 2;
		const R5b = R5 - (Hfoot + param.H1 + param.H2);
		const a5 = (2 * Math.PI) / param.N5;
		const a52 = a5 / 2;
		//const a55 = Math.PI - a5;
		const Lii = 2 * R5b * Math.tan(a52);
		const Lm = aJr * Math.tan(a52);
		const Li = Lii - 2 * Lm;
		const W1 = param.W2 - 2 * Hfoot;
		const R3 = W1 / 8;
		const D3 = 2 * R3;
		const Lih = Li / 2;
		//
		const R1 = param.D1 / 2;
		const Hwall = param.H1 + param.H2 + param.R2;
		// wall-1
		const aBAC = Math.atan2(param.H2, Lih);
		const lAC = Math.sqrt(Lih ** 2 + param.H2 ** 2);
		if (param.R2 > lAC) {
			throw `err141: R2 ${param.R2} is too large comapre to lAC ${ffix(lAC)} mm`;
		}
		const aCAD = Math.asin(param.R2 / lAC);
		const lAD = lAC * Math.cos(aCAD);
		const xAD = lAD * Math.cos(aBAC + aCAD);
		const yAD = lAD * Math.sin(aBAC + aCAD);
		const cotanBAD = xAD / yAD;
		// spring
		const sHeight = param.H1 + param.H2 - R1 - param.E1 - param.E2;
		const sStepY = param.smEy + param.shEy;
		const sNy = Math.floor((sHeight + param.smEy) / sStepY);
		const sRc = (param.shEy * param.shPr) / 200;
		// step-5 : checks on the parameter values
		if (R1 < 0.1) {
			throw `err087: R1 ${ffix(R1)} is too small because of D1 ${param.D1}`;
		}
		if (R5b < aJr) {
			throw `err154: R5b ${ffix(R5b)} is too small because of H2 ${param.D2}, H1 ${param.H1} or Hfoot ${ffix(Hfoot)}`;
		}
		if (Li < 0.1) {
			throw `err158: Li ${ffix(Li)} is too small because of aJr ${ffix(aJr)} radian`;
		}
		if (W1 < 0.1) {
			throw `err161: W1 ${ffix(W1)} is too small because of Hfoot ${ffix(Hfoot)} mm`;
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
		function calcXref(iyRef: number, idx: number): [number, number, number, number] {
			const cotan = cotanBAD;
			const cL = Li;
			const cy = iyRef - Hfoot - param.H1;
			const cx = cy < 0 ? cL : cL - 2 * cy * cotan;
			const cx0 = cL / 2 - cx / 2 + param.smExS;
			const nx = idx % 2 === 0 ? param.sNx + 1 : param.sNx;
			const lx = (cx - 2 * param.smExS + param.smEx) / (param.sNx + 1) - param.smEx;
			const lxAZpre = lx / 2 - param.smEx / 2;
			const lxAZ = idx % 2 === 0 ? lxAZpre : lx;
			if (lxAZ < 2 * sRc) {
				throw `err228: lxAZ ${ffix(lxAZ)} is too small compare to ${param.sNx} or ${param.smEx}`;
			}
			return [cx0, lxAZ, lx, nx];
		}
		function makeCtrWall(iJb: string): tContourJ {
			const Xad = xAD;
			const Yad = yAD;
			const rCtr = contourJ(0, Hfoot)
				.startJunction(iJb, tJDir.eB, tJSide.eABRight)
				.addSegStrokeR(Li, 0)
				.addSegStrokeR(0, param.H1)
				.addSegStrokeR(-Xad, Yad)
				.addPointA(Li / 2, Hwall + Hfoot)
				.addPointA(Xad, param.H1 + Yad + Hfoot)
				.addSegArc2()
				.addSegStrokeR(-Xad, -Yad)
				.closeSegStroke();
			return rCtr;
		}
		function makeFaBottom(
			iJb0: string,
			iJb1: string,
			iJl: string,
			iJr: string,
			iJcond: boolean
		): Facet {
			const ctrBase = contourJ(0, 0)
				.startJunction(iJl, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(Li, 0)
				.startJunction(iJb0, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(0, W1)
				.startJunction(iJr, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(-Li, 0);
			if (iJcond) {
				ctrBase.startJunction(iJb1, tJDir.eB, tJSide.eABRight);
			}
			ctrBase.closeSegStroke();
			const ctrsHole: tContour[] = [];
			ctrsHole.push(contourCircle(D3, D3, R3));
			ctrsHole.push(contourCircle(Li - D3, D3, R3));
			ctrsHole.push(contourCircle(D3, W1 - D3, R3));
			ctrsHole.push(contourCircle(Li - D3, W1 - D3, R3));
			const rFa = facet([ctrBase, ...ctrsHole]);
			return rFa;
		}
		// step-7 : drawing of the figures
		// spring
		const sWi: tContour[] = [];
		if (param.spring === 1) {
			for (let jj = 0; jj < sNy; jj++) {
				const yy = Hfoot + param.E1 + jj * sStepY;
				const yRef = yy + param.shEy / 2;
				const [xRef, lxAZ, lx, nx] = calcXref(yRef, jj);
				let xx = xRef;
				sWi.push(makeSpringHollow(lxAZ).translate(xx, yy));
				xx += lxAZ + param.smEx;
				for (let ii = 0; ii < nx - 1; ii++) {
					sWi.push(makeSpringHollow(lx).translate(xx, yy));
					xx += lx + param.smEx;
				}
				sWi.push(makeSpringHollow(lxAZ).translate(xx, yy));
			}
		}
		// bearing axis
		const ctrAxisi = contourCircle(Lih, Hfoot + param.H1 + param.H2, R1);
		// base
		// interior
		const fas: Facet[] = [];
		const junction: tJuncs = {};
		for (let ii = 0; ii < param.N5; ii++) {
			const Jcond = ii < param.N5 - 1;
			fas.push(makeFaBottom(`Jb${ii}`, `Jb${ii + 1}`, `Jl${ii}`, `Jr${ii}`, Jcond));
			const ctrL = makeCtrWall(`Jl${ii}`);
			const ctrR = makeCtrWall(`Jr${ii}`);
			fas.push(facet([ctrL, ctrAxisi, ...sWi]));
			fas.push(facet([ctrR, ctrAxisi, ...sWi]));
			//fas.push(facet([ctrL, ctrAxisi]));
			junction[`Jb${ii}`] = { angle: -a5, radius: aJr, neutral: aJn, mark: aJm };
			junction[`Jl${ii}`] = { angle: aJa, radius: aJr, neutral: aJn, mark: aJm };
			junction[`Jr${ii}`] = { angle: aJa, radius: aJr, neutral: aJn, mark: aJm };
		}
		// sheetFold
		const sFold = sheetFold(
			[...fas],
			{
				...junction
			},
			[
				{ x1: 0, y1: 0, a1: 0, l1: Li, ante: [], post: [] },
				{ x1: 0, y1: W1, a1: 0, l1: Li, ante: [], post: [] }
			],
			param.Th,
			rGeome.partName
		);
		// final figure list
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
		rGeome.logstr += 'springInt drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const springIntDef: tPageDef = {
	pTitle: 'springInt',
	pDescription: 'bearing-holder in the interior of a ring',
	pDef: pDef,
	pGeom: pGeom
};

export { springIntDef };
