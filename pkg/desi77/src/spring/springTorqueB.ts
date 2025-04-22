// springTorqueB.ts
// a spring disc for smooth torque transmission

import type {
	Point,
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
	withinZeroPi,
	//withinZero2Pi,
	//ShapePoint,
	point,
	contour,
	contourCircle,
	//ctrRectangle,
	figure,
	//degToRad,
	radToDeg,
	ffix,
	pNumber,
	pCheckbox,
	pDropdown,
	pSectionSeparator,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';
//import { triLALrL, triALLrL, triLLLrA } from 'triangule';
//import { triALLrL } from 'triangule';

const pDef: tParamDef = {
	partName: 'springTorqueB',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('De', 'mm', 80, 1, 1000, 1),
		pNumber('Ne', 'hole', 16, 0, 400, 1),
		pNumber('DTe', 'mm', 2, 0.1, 50, 0.1),
		pNumber('Ee', 'mm', 1, 0.1, 50, 0.1),
		pCheckbox('Teeth', true),
		pNumber('Th', 'mm', 3, 0.1, 100, 0.1),
		pSectionSeparator('Internal ring'),
		pNumber('Di', 'mm', 30, 1, 1000, 1),
		pNumber('Ni', 'hole', 8, 0, 400, 1),
		pNumber('DTi', 'mm', 2, 0.1, 50, 0.1),
		pNumber('Ei', 'mm', 1, 0.1, 50, 0.1),
		pSectionSeparator('Spring'),
		pNumber('Ns', 'spring', 6, 4, 60, 1),
		pNumber('aEs', '%', 10, 1, 90, 1),
		pNumber('Esi', '%', 10, 1, 90, 1),
		pNumber('Ese', '%', 10, 1, 90, 1),
		pNumber('Nk', 'zigzag', 3, 1, 100, 1),
		pNumber('Wk', 'mm', 1, 0.1, 20, 0.1),
		pNumber('Wc', 'mm', 1, 0.1, 20, 0.1),
		pNumber('Rrsi', 'mm', 1, 0.1, 20, 0.1),
		pNumber('Rrse', 'mm', 1, 0.1, 20, 0.1),
		pSectionSeparator('Tooth Profile'),
		pNumber('ate', '%', 52, 1, 99, 1),
		pNumber('ah', '%', 100, 1, 400, 1),
		pNumber('dh', '%', 100, 1, 400, 1),
		pNumber('aeh', '%', 10, 0, 100, 1),
		pNumber('aM', 'degree', 0, -30, 30, 0.1),
		pSectionSeparator('Tooth profile details'),
		pDropdown('SnAae', ['stroke', 'arc']),
		pDropdown('SnAde', ['stroke', 'arc']),
		pNumber('Rae', 'mm', 1, 0, 50, 0.1),
		pNumber('Rde', 'mm', 1, 0, 50, 0.1)
	],
	paramSvg: {
		De: 'springTorqueB_profile.svg',
		Ne: 'springTorqueB_profile.svg',
		DTe: 'springTorqueB_profile.svg',
		Ee: 'springTorqueB_profile.svg',
		Teeth: 'springTorqueB_profile.svg',
		Th: 'springTorqueB_profile.svg',
		Di: 'springTorqueB_profile.svg',
		Ni: 'springTorqueB_profile.svg',
		DTi: 'springTorqueB_profile.svg',
		Ei: 'springTorqueB_profile.svg',
		Ns: 'springTorqueB_profile.svg',
		aEs: 'springTorqueB_profile.svg',
		Esi: 'springTorqueB_profile.svg',
		Ese: 'springTorqueB_profile.svg',
		Nk: 'springTorqueB_profile.svg',
		Wk: 'springTorqueB_profile.svg',
		Wc: 'springTorqueB_profile.svg',
		Rrsi: 'springTorqueB_profile.svg',
		Rrse: 'springTorqueB_profile.svg',
		ate: 'plugTorque_teeth_radial.svg',
		dh: 'plugTorque_teeth_radial.svg',
		ah: 'plugTorque_teeth_radial.svg',
		aeh: 'plugTorque_teeth_radial.svg',
		aM: 'plugTorque_teeth_adden.svg',
		SnAae: 'plugTorque_teeth_radial.svg',
		SnAde: 'plugTorque_teeth_radial.svg',
		Rae: 'plugTorque_teeth_radial.svg',
		Rde: 'plugTorque_teeth_radial.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

// helper functions
function calcAzig(cx1: number, cx2: number, r1: number, r2: number): [number, number] {
	let ra12 = Math.PI / 2;
	let ra21 = -Math.PI / 2;
	if (cx2 > cx1) {
		const triOpp = cx2 - cx1;
		const triAdj = r1 + r2;
		const lDiag = Math.sqrt(triAdj ** 2 + triOpp ** 2);
		const aDiag = Math.atan2(triOpp, triAdj);
		const lDiag1 = (lDiag * r1) / triAdj;
		const aTri1 = Math.acos(r1 / lDiag1);
		ra12 = Math.PI / 2 - aDiag - aTri1;
		ra21 = -Math.PI / 2 - aDiag - aTri1;
	}
	return [ra12, ra21];
}
function calcAzag(cx2: number, cx1: number, r2: number, r1: number): [number, number] {
	let ra22 = Math.PI / 2;
	let ra11 = -Math.PI / 2;
	if (cx2 > cx1) {
		const triOpp = cx2 - cx1;
		const triAdj = r1 + r2;
		const lDiag = Math.sqrt(triAdj ** 2 + triOpp ** 2);
		const aDiag = Math.atan2(triOpp, triAdj);
		const lDiag2 = (lDiag * r2) / triAdj;
		const aTri2 = Math.acos(r2 / lDiag2);
		ra22 = Math.PI / 2 + aDiag + aTri2;
		ra11 = -Math.PI / 2 + aDiag + aTri2;
	}
	return [ra22, ra11];
}

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figProfile = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Re = param.De / 2;
		const RTe = param.DTe / 2;
		const Ri = param.Di / 2;
		const RTi = param.DTi / 2;
		const Rmax = Re + RTe + param.Ee;
		const Rmin1 = Ri - RTi - param.Ei;
		const Rse = Re - RTe - param.Ee;
		const Rsi = Ri + RTi + param.Ei;
		const dRs = Rse - Rsi;
		const Esi = (dRs * param.Esi) / 100;
		const Ese = (dRs * param.Ese) / 100;
		const dRLs = dRs - Esi - Ese;
		const aSpringStep = (2 * Math.PI) / param.Ns;
		const aEs = (aSpringStep * param.aEs) / 100;
		const aSpring = aSpringStep - aEs;
		const HLs = (Rse - Ese) * Math.sin(aSpring);
		const iHLs = HLs / (2 * param.Nk);
		const Rk = iHLs / 2;
		const Ek = iHLs - param.Wk;
		// step-5 : checks on the parameter values
		if (Rmin1 < 0.1) {
			throw `err120: Di ${param.Di} is too small compare to DTi ${param.DTi}, Ei ${param.Ei}`;
		}
		if (dRLs < 2 * param.Ws) {
			throw `err133: dRLs ${dRLs} is too small compare to Ws ${param.Ws}`;
		}
		if (Esi < 0.6 * param.Ws) {
			throw `err136: Esi ${Esi} is too small compare to Ws ${param.Ws}`;
		}
		if (Ese < 0.6 * param.Ws) {
			throw `err139: Ese ${Ese} is too small compare to Ws ${param.Ws}`;
		}
		if (Ek < 0.1) {
			throw `err145: Ek ${Ek} is too small`;
		}
		if (dRLs < 2 * Rk) {
			throw `err148: dRLs ${dRLs} is too small compare to Rk ${Rk}. Increase Nk ${param.Nk}`;
		}
		// step-5.1 : further calculation
		const aHMinI = 2 * Math.asin((RTi + 0.5 * param.Ei) / Ri);
		const aHI = param.Ni > 0 ? (2 * Math.PI) / param.Ni : 3.14;
		if (aHI < aHMinI) {
			throw `err126: aHI ${ffix(radToDeg(aHI))} is too small compare to aHMinI ${ffix(radToDeg(aHMinI))} degree`;
		}
		const aHMinE = 2 * Math.asin((RTe + 0.5 * param.Ee) / Re);
		const aHE = param.Ne > 0 ? (2 * Math.PI) / param.Ne : 3.14;
		if (aHE < aHMinE) {
			throw `err131: aHE ${ffix(radToDeg(aHE))} is too small compare to aHMinE ${ffix(radToDeg(aHMinE))} degree`;
		}
		const pts1: Point[] = [];
		const Rk1 = Rsi + Esi + dRLs - Rk; // Rse - Ese - Rk
		for (let ii = 0; ii < param.Nk; ii++) {
			const ky = (ii * 4 + 1) * Rk;
			//const ka = Math.asin(ky / Rk1);
			const kx = Math.sqrt(Rk1 ** 2 - ky ** 2);
			pts1.push(point(kx, ky));
		}
		const pts2: Point[] = [];
		const Rk2 = Rsi + Esi + Rk;
		const ak2 = aSpring < Math.PI / 2 - 0.0001 ? 1 / Math.tan(aSpring) : 0; // cotan(aSpring)
		const kak2 = Rk / Math.sin(aSpring);
		for (let ii = 0; ii < param.Nk; ii++) {
			const ky = (ii * 4 + 3) * Rk;
			let kx = ak2 * ky + kak2;
			if (kx ** 2 + ky ** 2 < Rk2 ** 2) {
				kx = Math.sqrt(Rk2 ** 2 - ky ** 2);
			}
			pts2.push(point(kx, ky));
		}
		const Wk2 = param.Wk / 2;
		const a14 = Math.asin(Wk2 / Rsi);
		const a23 = Math.asin(Wk2 / Rse);
		const pt1 = point(0, 0).translatePolar(a14, Rsi);
		const pt2 = point(0, 0).translatePolar(aSpring + a23, Rse);
		const pt3 = point(0, 0).translatePolar(aSpring - a23, Rse);
		const pt4 = point(0, 0).translatePolar(-a14, Rsi);
		const Rks = Rk - Wk2;
		const Rkl = Rk + Wk2;
		// step-6 : any logs
		rGeome.logstr += `Dmax ${ffix(2 * Rmax)}, Dmin ${ffix(2 * Rmin1)} mm\n`;
		rGeome.logstr += `Spring area: aSpring ${ffix(radToDeg(aSpring))} degree, dRLs ${ffix(dRLs)}, HLs ${ffix(HLs)} mm\n`;
		rGeome.logstr += `Spring zigzag: Ek ${ffix(Ek)}, Rk ${ffix(Rk)} mm\n`;
		// sub-function
		// figProfile
		const ctrExt = contourCircle(0, 0, Rmax);
		const ctrsH: tContour[] = [];
		ctrsH.push(contourCircle(0, 0, Rmin1));
		for (let ii = 0; ii < param.Ni; ii++) {
			const p1 = point(0, 0).translatePolar(ii * aHI, Ri);
			ctrsH.push(contourCircle(p1.cx, p1.cy, RTi));
		}
		for (let ii = 0; ii < param.Ne; ii++) {
			const p1 = point(0, 0).translatePolar(ii * aHE, Re);
			ctrsH.push(contourCircle(p1.cx, p1.cy, RTe));
		}
		// spring
		const ctrSpringEnv = contour(Rsi + Esi, 0)
			.addSegStrokeAP(0, Rse - Ese)
			.addPointAP(aSpring / 2, Rse - Ese)
			.addPointAP(aSpring, Rse - Ese)
			.addSegArc2()
			.addSegStrokeAP(aSpring, Rsi + Esi)
			.addPointAP(aSpring / 2, Rsi + Esi)
			.addPointAP(0, Rsi + Esi)
			.addSegArc2();
		figProfile.addSecond(ctrSpringEnv);
		figProfile.addSecond(ctrSpringEnv.rotate(0, 0, aSpringStep));
		figProfile.addSecond(ctrSpringEnv.rotate(0, 0, -aSpringStep));
		for (let ii = 0; ii < param.Nk; ii++) {
			figProfile.addSecond(contourCircle(pts1[ii].cx, pts1[ii].cy, Rk));
			figProfile.addSecond(contourCircle(pts2[ii].cx, pts2[ii].cy, Rk));
		}
		// partial-1
		const ctrPartial1 = contour(pt1.cx, pt1.cy);
		for (let ii = 0; ii < param.Nk; ii++) {
			let a11 = -Math.PI / 2;
			//const a12 = Math.PI / 2;
			//const a21 = -Math.PI / 2;
			const [a12, a21] = calcAzig(pts1[ii].cx, pts2[ii].cx, Rks, Rkl);
			let a22 = Math.PI / 2;
			if (ii > 0) {
				const [, tmpa11] = calcAzag(pts2[ii - 1].cx, pts1[ii].cx, Rkl, Rks);
				a11 = tmpa11;
			}
			if (ii < param.Nk - 1) {
				const [tmpa22] = calcAzag(pts2[ii].cx, pts1[ii + 1].cx, Rkl, Rks);
				a22 = tmpa22;
			}
			const p11 = pts1[ii].translatePolar(a11, Rks);
			const p1b = pts1[ii].translatePolar(a11 + withinZeroPi((a12 - a11) / 2), Rks);
			const p12 = pts1[ii].translatePolar(a12, Rks);
			const p21 = pts2[ii].translatePolar(a21, Rkl);
			const p2b = pts2[ii].translatePolar(a21 - withinZeroPi((a21 - a22) / 2), Rkl);
			const p22 = pts2[ii].translatePolar(a22, Rkl);
			ctrPartial1
				.addSegStrokeA(p11.cx, p11.cy)
				.addPointA(p1b.cx, p1b.cy)
				.addPointA(p12.cx, p12.cy)
				.addSegArc2()
				.addSegStrokeA(p21.cx, p21.cy);
			if (ii < param.Nk - 1) {
				ctrPartial1.addPointA(p2b.cx, p2b.cy).addPointA(p22.cx, p22.cy).addSegArc2();
			}
		}
		const [, lasta21] = calcAzig(pts1[param.Nk - 1].cx, pts2[param.Nk - 1].cx, Rks, Rkl);
		const a2c = Math.PI / 2 + aSpring;
		const a2b = lasta21 - withinZeroPi((lasta21 - a2c) / 2);
		const pt2b = pts2[param.Nk - 1].translatePolar(a2b, Rkl);
		const pt2c = pts2[param.Nk - 1].translatePolar(a2c, Rkl);
		const pt3b = pts2[param.Nk - 1].translatePolar(a2b, Rks);
		const pt3c = pts2[param.Nk - 1].translatePolar(a2c, Rks);
		ctrPartial1
			.addPointA(pt2b.cx, pt2b.cy)
			.addPointA(pt2c.cx, pt2c.cy)
			.addSegArc2()
			.addSegStrokeA(pt2.cx, pt2.cy);
		//figProfile.addSecond(ctrPartial1);
		// partial-2
		const [, firsta22] = calcAzig(pts1[param.Nk - 1].cx, pts2[param.Nk - 1].cx, Rkl, Rks);
		const firstp22 = pts2[param.Nk - 1].translatePolar(firsta22, Rks);
		const ctrPartial2 = contour(pt3.cx, pt3.cy)
			.addSegStrokeA(pt3c.cx, pt3c.cy)
			.addPointA(pt3b.cx, pt3b.cy)
			.addPointA(firstp22.cx, firstp22.cy)
			.addSegArc2();
		for (let ii = param.Nk - 1; ii >= 0; ii--) {
			let a21 = Math.PI / 2;
			//const a22 = -Math.PI / 2;
			//const a11 = Math.PI / 2;
			let a12 = -Math.PI / 2;
			const [a11, a22] = calcAzig(pts1[ii].cx, pts2[ii].cx, Rkl, Rks);
			if (ii > 0) {
				const [, tmpa12] = calcAzag(pts2[ii - 1].cx, pts1[ii].cx, Rks, Rkl);
				a12 = tmpa12;
			}
			if (ii < param.Nk - 1) {
				const [tmpa21] = calcAzag(pts2[ii].cx, pts1[ii + 1].cx, Rks, Rkl);
				a21 = tmpa21;
			}
			const p11 = pts1[ii].translatePolar(a11, Rkl);
			const p1b = pts1[ii].translatePolar(a11 - withinZeroPi((a11 - a12) / 2), Rkl);
			const p12 = pts1[ii].translatePolar(a12, Rkl);
			const p21 = pts2[ii].translatePolar(a21, Rks);
			const p2b = pts2[ii].translatePolar(a21 + withinZeroPi((a22 - a21) / 2), Rks);
			const p22 = pts2[ii].translatePolar(a22, Rks);
			if (ii < param.Nk - 1) {
				ctrPartial2
					.addSegStrokeA(p21.cx, p21.cy)
					.addPointA(p2b.cx, p2b.cy)
					.addPointA(p22.cx, p22.cy)
					.addSegArc2();
			}
			ctrPartial2
				.addSegStrokeA(p11.cx, p11.cy)
				.addPointA(p1b.cx, p1b.cy)
				.addPointA(p12.cx, p12.cy)
				.addSegArc2();
		}
		ctrPartial2.addSegStrokeA(pt4.cx, pt4.cy);
		//figProfile.addSecond(ctrPartial2);
		// ctrSpringHollow
		const ctrSpringHollow = contour(pt1.cx, pt1.cy)
			.addCornerRounded(param.Rrsi)
			.addPartial(ctrPartial1)
			.addCornerRounded(param.Rrse)
			.addPointAP(aSpring + aSpringStep / 2, Rse)
			.addPointAP(aSpring + aSpringStep - a23, Rse)
			.addSegArc2()
			.addCornerRounded(param.Rrse)
			.addPartial(ctrPartial2.rotate(0, 0, aSpringStep))
			.addCornerRounded(param.Rrsi)
			.addPointAP(aSpringStep / 2, Rsi)
			.addPointAP(a14, Rsi)
			.addSegArc2();
		for (let ii = 0; ii < param.Ns; ii++) {
			ctrsH.push(ctrSpringHollow.rotate(0, 0, ii * aSpringStep));
		}
		// figProfile Main
		figProfile.addMainOI([ctrExt, ...ctrsH]);
		// final figure list
		rGeome.fig = {
			faceProfile: figProfile
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_profile`,
					face: `${designName}_faceProfile`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.Th,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eIdentity,
					inList: [`subpax_${designName}_profile`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'springTorqueB drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const springTorqueBDef: tPageDef = {
	pTitle: 'springTorqueB',
	pDescription: 'spring disc for smooth torque transmission',
	pDef: pDef,
	pGeom: pGeom
};

export { springTorqueBDef };
