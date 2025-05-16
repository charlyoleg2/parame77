// springSide.ts
// bearing-holder on the side of a ring

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
	partName: 'springSide',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D5', 'mm', 100, 10, 5000, 1),
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
		//pNumber('Jangle', 'degree', 90, 0, 120, 1),
		pNumber('Jradius', 'mm', 2, 0.1, 10, 0.1),
		pNumber('Jneutral', '%', 50, 0, 100, 1),
		pNumber('Jmark', 'mm', 1, 0.1, 10, 0.1)
	],
	paramSvg: {
		D5: 'springSide_top.svg',
		N5: 'springSide_top.svg',
		W2: 'springSide_top.svg',
		D1: 'springSide_face.svg',
		H1: 'springSide_face.svg',
		H2: 'springSide_face.svg',
		R2: 'springSide_face.svg',
		spring: 'springSide_spring.svg',
		E1: 'springSide_face.svg',
		E2: 'springSide_face.svg',
		smEy: 'springSide_spring.svg',
		shEy: 'springSide_spring.svg',
		shPr: 'springSide_spring.svg',
		sNx: 'springSide_spring.svg',
		smEx: 'springSide_spring.svg',
		smExS: 'springSide_spring.svg',
		Th: 'springSide_section.svg',
		//Jangle: 'springSide_face.svg',
		Jradius: 'springSide_face.svg',
		Jneutral: 'springSide_face.svg',
		Jmark: 'springSide_face.svg'
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
		//const aJa = degToRad(param.Jangle);
		const pi2 = Math.PI / 2;
		const aJn = param.Jneutral / 100;
		const aJr = param.Jradius;
		const aJm = param.Jmark;
		const R5 = param.D5 / 2;
		const a5 = (2 * Math.PI) / param.N5;
		const a52 = a5 / 2;
		//const a55 = Math.PI - a5;
		const W22 = param.W2 / 2;
		const Lii = 2 * (R5 - W22) * Math.tan(a52);
		const Lee = 2 * (R5 + W22) * Math.tan(a52);
		const Lm = aJr * Math.tan(a52);
		const Li = Lii - Lm;
		const Le = Lee - Lm;
		const W1 = param.W2 - 2 * aJr;
		const W12 = W1 / 2;
		const Le2 = (Le - Li) / 2;
		const R3 = W1 / 8;
		const D3 = 2 * R3;
		const Lih = Li / 2;
		const Leh = Le / 2;
		//
		const R1 = param.D1 / 2;
		const Hwall = param.H1 + param.H2 + param.R2;
		const Hfoot = aJr + (1 - aJn) * param.Th;
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
		// wall-2
		const aBACb = Math.atan2(param.H2, Leh);
		const lACb = Math.sqrt(Leh ** 2 + param.H2 ** 2);
		const aCADb = Math.asin(param.R2 / lACb);
		const lADb = lACb * Math.cos(aCADb);
		const xADb = lADb * Math.cos(aBACb + aCADb);
		const yADb = lADb * Math.sin(aBACb + aCADb);
		const cotanBADb = xADb / yADb;
		// spring
		const sHeight = param.H1 + param.H2 - R1 - param.E1 - param.E2;
		const sStepY = param.smEy + param.shEy;
		const sNy = Math.floor((sHeight + param.smEy) / sStepY);
		const sRc = (param.shEy * param.shPr) / 200;
		// step-5 : checks on the parameter values
		if (R1 < 0.1) {
			throw `err087: R1 ${ffix(R1)} is too small because of D1 ${param.D1}`;
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
		function calcXref(
			iyRef: number,
			iSel: number,
			idx: number
		): [number, number, number, number] {
			const cotan = iSel === 0 ? cotanBAD : cotanBADb;
			const cL = iSel === 0 ? Li : Le;
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
		function makeCtrWall(
			iJ0: string,
			iJ1: string,
			iJb: string,
			iL: number,
			iL2: number,
			iJ1b: boolean,
			iSel: boolean
		): tContourJ {
			const Xad = iSel ? xADb : xAD;
			const Yad = iSel ? yADb : yAD;
			const rCtr = contourJ(0, Hfoot);
			if (iL2 > 0) {
				rCtr.addSegStrokeR(iL2, 0);
			}
			rCtr.startJunction(iJb, tJDir.eB, tJSide.eABRight).addSegStrokeR(Li, 0);
			if (iL2 > 0) {
				rCtr.addSegStrokeR(iL2, 0);
			}
			if (iSel) {
				rCtr.startJunction(iJ0, tJDir.eA, tJSide.eABLeft);
			} else {
				if (iJ1b) {
					rCtr.startJunction(iJ1, tJDir.eB, tJSide.eABRight);
				}
			}
			rCtr.addSegStrokeR(0, param.H1)
				.addSegStrokeR(-Xad, Yad)
				.addPointA(iL2 + iL / 2, Hwall + Hfoot)
				.addPointA(Xad, param.H1 + Yad + Hfoot)
				.addSegArc2()
				.addSegStrokeR(-Xad, -Yad);
			if (iSel) {
				if (iJ1b) {
					rCtr.startJunction(iJ1, tJDir.eB, tJSide.eABRight);
				}
			} else {
				rCtr.startJunction(iJ0, tJDir.eA, tJSide.eABLeft);
			}
			rCtr.closeSegStroke();
			return rCtr;
		}
		// step-7 : drawing of the figures
		// spring
		const sWi: tContour[] = [];
		const sWe: tContour[] = [];
		if (param.spring === 1) {
			for (let jj = 0; jj < sNy; jj++) {
				const yy = Hfoot + param.E1 + jj * sStepY;
				const yRef = yy + param.shEy / 2;
				const [xRef, lxAZ, lx, nx] = calcXref(yRef, 0, jj);
				const [xRefB, lxAZb, lxb] = calcXref(yRef, 1, jj);
				let xx = xRef;
				let xxb = xRefB;
				sWi.push(makeSpringHollow(lxAZ).translate(xx, yy));
				sWe.push(makeSpringHollow(lxAZb).translate(xxb, yy));
				xx += lxAZ + param.smEx;
				xxb += lxAZb + param.smEx;
				for (let ii = 0; ii < nx - 1; ii++) {
					sWi.push(makeSpringHollow(lx).translate(xx, yy));
					sWe.push(makeSpringHollow(lxb).translate(xxb, yy));
					xx += lx + param.smEx;
					xxb += lxb + param.smEx;
				}
				sWi.push(makeSpringHollow(lxAZ).translate(xx, yy));
				sWe.push(makeSpringHollow(lxAZb).translate(xxb, yy));
			}
		}
		// bearing axis
		const ctrAxisi = contourCircle(Lih, Hfoot + param.H1 + param.H2, R1);
		const ctrAxise = contourCircle(Leh, Hfoot + param.H1 + param.H2, R1);
		// base
		const ctrBase = contourJ(0, 0)
			.startJunction('Jbi0', tJDir.eA, tJSide.eABLeft)
			.addSegStrokeR(Li, 0)
			.addSegStrokeR(0, W1)
			.startJunction('Jbe0', tJDir.eA, tJSide.eABLeft)
			.addSegStrokeR(-Li, 0)
			.closeSegStroke();
		const ctrsHole: tContour[] = [];
		ctrsHole.push(contourCircle(D3, D3, R3));
		ctrsHole.push(contourCircle(Li - D3, D3, R3));
		ctrsHole.push(contourCircle(D3, W1 - D3, R3));
		ctrsHole.push(contourCircle(Li - D3, W1 - D3, R3));
		const faBase = facet([ctrBase, ...ctrsHole]);
		// interior
		const fasInt: Facet[] = [];
		const junctionInt: tJuncs = {};
		for (let ii = 0; ii < param.N5; ii++) {
			const Jcond = ii < param.N5 - 1;
			const iCtr = makeCtrWall(`Ji${ii}`, `Ji${ii + 1}`, `Jbi${ii}`, Li, 0, Jcond, false);
			fasInt.push(facet([iCtr, ctrAxisi, ...sWi]));
			//fasInt.push(facet([iCtr, ctrAxisi]));
			junctionInt[`Ji${ii}`] = { angle: -a5, radius: aJr, neutral: aJn, mark: aJm };
			junctionInt[`Jbi${ii}`] = { angle: pi2, radius: aJr, neutral: aJn, mark: aJm };
			// bottom-half
			if (ii > 0) {
				const iCtr2 = contourJ(0, 0)
					.startJunction(`Jbi${ii}`, tJDir.eA, tJSide.eABLeft)
					.addSegStrokeR(Li, 0)
					.addSegStrokeR(0, W12)
					.addSegStrokeR(-Li, 0)
					.closeSegStroke();
				const iCtr2Hole: tContour[] = [];
				iCtr2Hole.push(contourCircle(D3, D3, R3));
				iCtr2Hole.push(contourCircle(Li - D3, D3, R3));
				fasInt.push(facet([iCtr2, ...iCtr2Hole]));
			}
		}
		//junctionInt[`Ji${param.N5}`] = { angle: -a5, radius: aJr, neutral: aJn, mark: aJm };
		// exterior
		const fasExt: Facet[] = [];
		const junctionExt: tJuncs = {};
		for (let ii = 0; ii < param.N5; ii++) {
			const Jcond = ii < param.N5 - 1;
			const iCtr = makeCtrWall(`Je${ii}`, `Je${ii + 1}`, `Jbe${ii}`, Li, Le2, Jcond, true);
			fasExt.push(facet([iCtr, ctrAxise, ...sWe]));
			//fasExt.push(facet([iCtr, ctrAxise]));
			junctionExt[`Je${ii}`] = { angle: a5, radius: aJr, neutral: aJn, mark: aJm };
			junctionExt[`Jbe${ii}`] = { angle: pi2, radius: aJr, neutral: aJn, mark: aJm };
			// bottom-half
			if (ii > 0) {
				const iCtr2 = contourJ(0, 0)
					.addSegStrokeR(Li, 0)
					.addSegStrokeR(0, W12)
					.startJunction(`Jbe${ii}`, tJDir.eA, tJSide.eABLeft)
					.addSegStrokeR(-Li, 0)
					.closeSegStroke();
				const iCtr2Hole: tContour[] = [];
				iCtr2Hole.push(contourCircle(D3, D3, R3));
				iCtr2Hole.push(contourCircle(Li - D3, D3, R3));
				fasExt.push(facet([iCtr2, ...iCtr2Hole]));
			}
		}
		//junctionInt[`Je${param.N5}`] = { angle: a5, radius: aJr, neutral: aJn, mark: aJm };
		// sheetFold
		const sFold = sheetFold(
			[faBase, ...fasInt, ...fasExt],
			{
				Jbi0: { angle: pi2, radius: aJr, neutral: aJn, mark: aJm },
				Jbe0: { angle: pi2, radius: aJr, neutral: aJn, mark: aJm },
				...junctionInt,
				...junctionExt
			},
			[
				{ x1: 0, y1: 0, a1: 0, l1: Li, ante: [], post: [] },
				{ x1: 0, y1: W1, a1: 0, l1: Le, ante: [], post: [] }
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
		rGeome.logstr += 'springSide drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const springSideDef: tPageDef = {
	pTitle: 'springSide',
	pDescription: 'bearing-holder on the side of a ring',
	pDef: pDef,
	pGeom: pGeom
};

export { springSideDef };
