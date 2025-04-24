// springTorqueC.ts
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
	//withinZeroPi,
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
import { ctrPlugExtern } from './libPlugTorque';

const pDef: tParamDef = {
	partName: 'springTorqueC',
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
		pNumber('Ns', 'spring', 6, 1, 60, 1),
		pDropdown('zig', ['alt', 'one', 'two']),
		pDropdown('zag', ['stroke', 'arc']),
		pNumber('aEs', '%', 20, 1, 90, 1),
		pNumber('Esi', '%', 10, 0, 90, 1),
		pNumber('Ese', '%', 10, 0, 90, 1),
		pNumber('Nk', 'zigzag', 4, 2, 100, 1),
		pNumber('Wk', 'mm', 1, 0.1, 20, 0.1),
		pNumber('Rrsi', 'mm', 1, 0, 20, 0.1),
		pNumber('Rrse', 'mm', 1, 0, 20, 0.1),
		pSectionSeparator('Tooth Profile'),
		pNumber('Nt', 'teeth', 8, 1, 1000, 1),
		pNumber('Dt', 'mm', 20, 0.1, 1000, 0.1),
		pNumber('Ht', 'mm', 2, 0.1, 100, 0.1),
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
		De: 'springTorqueC_profile.svg',
		Ne: 'springTorqueC_profile.svg',
		DTe: 'springTorqueC_profile.svg',
		Ee: 'springTorqueC_profile.svg',
		Teeth: 'springTorqueC_profile.svg',
		Th: 'springTorqueC_profile.svg',
		Di: 'springTorqueC_profile.svg',
		Ni: 'springTorqueC_profile.svg',
		DTi: 'springTorqueC_profile.svg',
		Ei: 'springTorqueC_profile.svg',
		Ns: 'springTorqueC_profile.svg',
		zig: 'springTorqueC_profile.svg',
		zag: 'springTorqueC_profile.svg',
		aEs: 'springTorqueC_profile.svg',
		Esi: 'springTorqueC_profile.svg',
		Ese: 'springTorqueC_profile.svg',
		Nk: 'springTorqueC_profile.svg',
		Wk: 'springTorqueC_profile.svg',
		Rrsi: 'springTorqueC_profile.svg',
		Rrse: 'springTorqueC_profile.svg',
		Nt: 'plugTorque_teeth_radial.svg',
		Dt: 'plugTorque_teeth_radial.svg',
		Ht: 'plugTorque_teeth_radial.svg',
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
//function calcAzig(cx1: number, cx2: number, r1: number, r2: number): [number, number] {
//	let ra12 = Math.PI / 2;
//	let ra21 = -Math.PI / 2;
//	if (cx2 > cx1) {
//		const triOpp = cx2 - cx1;
//		const triAdj = r1 + r2;
//		const lDiag = Math.sqrt(triAdj ** 2 + triOpp ** 2);
//		const aDiag = Math.atan2(triOpp, triAdj);
//		const lDiag1 = (lDiag * r1) / triAdj;
//		const aTri1 = Math.acos(r1 / lDiag1);
//		ra12 = Math.PI / 2 - aDiag - aTri1;
//		ra21 = -Math.PI / 2 - aDiag - aTri1;
//	}
//	return [ra12, ra21];
//}
//function calcAzag(cx2: number, cx1: number, r2: number, r1: number): [number, number] {
//	let ra22 = Math.PI / 2;
//	let ra11 = -Math.PI / 2;
//	if (cx2 > cx1) {
//		const triOpp = cx2 - cx1;
//		const triAdj = r1 + r2;
//		const lDiag = Math.sqrt(triAdj ** 2 + triOpp ** 2);
//		const aDiag = Math.atan2(triOpp, triAdj);
//		const lDiag2 = (lDiag * r2) / triAdj;
//		const aTri2 = Math.acos(r2 / lDiag2);
//		ra22 = Math.PI / 2 + aDiag + aTri2;
//		ra11 = -Math.PI / 2 + aDiag + aTri2;
//	}
//	return [ra22, ra11];
//}

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
		const Rk = dRLs / (2 * (param.Nk - 1));
		const Ek = 2 * Rk - param.Wk;
		// step-5 : checks on the parameter values
		if (Rmin1 < 0.1) {
			throw `err120: Di ${param.Di} is too small compare to DTi ${param.DTi}, Ei ${param.Ei}`;
		}
		if (dRLs < 2 * param.Ws) {
			throw `err133: dRLs ${dRLs} is too small compare to Ws ${param.Ws}`;
		}
		if (Esi < 0.2 * param.Rrsi) {
			throw `err136: Esi ${Esi} is too small compare to Rrsi ${param.Rrsi}`;
		}
		if (Ese < 0.2 * param.Rrse) {
			throw `err139: Ese ${Ese} is too small compare to Rrse ${param.Rrse}`;
		}
		if (Ek < 0.1) {
			throw `err145: Ek ${Ek} is too small`;
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
		const pts0: Point[] = [];
		const pts1: Point[] = [];
		//const ptl: number[] = [];
		const k2cos = Math.cos(aSpring);
		const k2sin = Math.sin(aSpring);
		const k2cx = Rk * k2sin;
		const k2cy = -Rk * k2cos;
		const k2Parity1 = param.zig === 2 ? 1 : 0;
		for (let ii = 0; ii < param.Nk; ii++) {
			const k2Parity2 = param.zig === 1 ? 0 : 1;
			const kl = Rsi + Esi + 2 * ii * Rk;
			//ptl.push(kl);
			if (ii % 2 === k2Parity1) {
				pts0.push(point(kl, Rk));
			} else {
				const kx = kl * k2cos + k2cx;
				const ky = kl * k2sin + k2cy;
				pts0.push(point(kx, ky));
			}
			if (ii % 2 === k2Parity2) {
				pts1.push(point(kl, Rk));
			} else {
				const kx = kl * k2cos + k2cx;
				const ky = kl * k2sin + k2cy;
				pts1.push(point(kx, ky));
			}
		}
		const Wk2 = param.Wk / 2;
		const a18 = Math.asin(Wk2 / Rsi);
		const a27 = Math.asin(Wk2 / (Rsi + Esi));
		const a36 = Math.asin(Wk2 / (Rse - Ese));
		const a45 = Math.asin(Wk2 / Rse);
		function pppI(a1: number, iParity: number, l2: number): Point {
			const a2 = iParity === 0 ? a1 : aSpring - a1;
			return point(0, 0).translatePolar(a2, l2);
		}
		const eParity = param.Nk % 2;
		function pppE(a1: number, iParity: number, l2: number): Point {
			const eeParity = (eParity + iParity) % 2;
			const a2 = eeParity === 1 ? a1 : aSpring - a1;
			return point(0, 0).translatePolar(a2, l2);
		}
		const ppp0: Point[] = [];
		ppp0.push(pppI(a18, 0, Rsi)); // 0
		ppp0.push(pppI(a27, 0, Rsi + Esi)); // 1
		ppp0.push(pppE(-a36, 0, Rse - Ese)); // 2
		ppp0.push(pppE(-a45, 0, Rse)); // 3
		ppp0.push(pppE(a45, 0, Rse).rotateOrig(aSpringStep)); // 4
		ppp0.push(pppE(a36, 0, Rse - Ese).rotateOrig(aSpringStep)); // 5
		ppp0.push(pppI(-a27, 0, Rsi + Esi).rotateOrig(aSpringStep)); // 6
		ppp0.push(pppI(-a18, 0, Rsi).rotateOrig(aSpringStep)); // 7
		const ppp1: Point[] = [];
		ppp1.push(pppI(-a18, 1, Rsi)); // 0
		ppp1.push(pppI(-a27, 1, Rsi + Esi)); // 1
		ppp1.push(pppE(a36, 1, Rse - Ese)); // 2
		ppp1.push(pppE(a45, 1, Rse)); // 3
		ppp1.push(pppE(-a45, 1, Rse).rotateOrig(aSpringStep)); // 4
		ppp1.push(pppE(-a36, 1, Rse - Ese).rotateOrig(aSpringStep)); // 5
		ppp1.push(pppI(a27, 1, Rsi + Esi).rotateOrig(aSpringStep)); // 6
		ppp1.push(pppI(a18, 1, Rsi).rotateOrig(aSpringStep)); // 7
		//const Rks = Rk - Wk2;
		//const Rkl = Rk + Wk2;
		function iiParity(ii: number): [number, number] {
			let ip0 = ii % 2;
			let ip1 = ii < param.Ns - 1 ? (ii + 1) % 2 : 0;
			if (param.zig === 1) {
				ip0 = 0;
				ip1 = 0;
			} else if (param.zig === 2) {
				ip0 = 1;
				ip1 = 1;
			}
			return [ip0, ip1];
		}
		// step-6 : any logs
		rGeome.logstr += `Dmax ${ffix(2 * Rmax)}, Dmin1 ${ffix(2 * Rmin1)} mm\n`;
		rGeome.logstr += `Spring area: aSpring ${ffix(radToDeg(aSpring))} degree, dRLs ${ffix(dRLs)} mm\n`;
		rGeome.logstr += `Spring zigzag: Ek ${ffix(Ek)}, Rk ${ffix(Rk)} mm\n`;
		// sub-function
		// figProfile
		const ctrExt = contourCircle(0, 0, Rmax);
		const ctrsH: tContour[] = [];
		if (param.Teeth === 1) {
			const [ctrToothE, logE] = ctrPlugExtern(param, Rmin1);
			rGeome.logstr += logE;
			ctrsH.push(ctrToothE);
		} else {
			ctrsH.push(contourCircle(0, 0, Rmin1));
		}
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
			figProfile.addSecond(contourCircle(pts0[ii].cx, pts0[ii].cy, Rk));
			const pt1 = pts1[ii].rotateOrig(aSpringStep);
			figProfile.addSecond(contourCircle(pt1.cx, pt1.cy, Rk));
		}
		// partial-1
		//const ctrPartial1 = contour(pt1.cx, pt1.cy);
		//for (let ii = 0; ii < param.Nk; ii++) {
		//	let a11 = -Math.PI / 2;
		//	//const a12 = Math.PI / 2;
		//	//const a21 = -Math.PI / 2;
		//	const [a12, a21] = calcAzig(pts1[ii].cx, pts2[ii].cx, Rks, Rkl);
		//	let a22 = Math.PI / 2;
		//	if (ii > 0) {
		//		const [, tmpa11] = calcAzag(pts2[ii - 1].cx, pts1[ii].cx, Rkl, Rks);
		//		a11 = tmpa11;
		//	}
		//	if (ii < param.Nk - 1) {
		//		const [tmpa22] = calcAzag(pts2[ii].cx, pts1[ii + 1].cx, Rkl, Rks);
		//		a22 = tmpa22;
		//	}
		//	const p11 = pts1[ii].translatePolar(a11, Rks);
		//	const p1b = pts1[ii].translatePolar(a11 + withinZeroPi((a12 - a11) / 2), Rks);
		//	const p12 = pts1[ii].translatePolar(a12, Rks);
		//	const p21 = pts2[ii].translatePolar(a21, Rkl);
		//	const p2b = pts2[ii].translatePolar(a21 - withinZeroPi((a21 - a22) / 2), Rkl);
		//	const p22 = pts2[ii].translatePolar(a22, Rkl);
		//	ctrPartial1
		//		.addSegStrokeA(p11.cx, p11.cy)
		//		.addPointA(p1b.cx, p1b.cy)
		//		.addPointA(p12.cx, p12.cy)
		//		.addSegArc2()
		//		.addSegStrokeA(p21.cx, p21.cy);
		//	if (ii < param.Nk - 1) {
		//		ctrPartial1.addPointA(p2b.cx, p2b.cy).addPointA(p22.cx, p22.cy).addSegArc2();
		//	}
		//}
		//const [, lasta21] = calcAzig(pts1[param.Nk - 1].cx, pts2[param.Nk - 1].cx, Rks, Rkl);
		//const a2c = Math.PI / 2 + aSpring;
		//const a2b = lasta21 - withinZeroPi((lasta21 - a2c) / 2);
		//const pt2b = pts2[param.Nk - 1].translatePolar(a2b, Rkl);
		//const pt2c = pts2[param.Nk - 1].translatePolar(a2c, Rkl);
		//const pt3b = pts2[param.Nk - 1].translatePolar(a2b, Rks);
		//const pt3c = pts2[param.Nk - 1].translatePolar(a2c, Rks);
		//ctrPartial1
		//	.addPointA(pt2b.cx, pt2b.cy)
		//	.addPointA(pt2c.cx, pt2c.cy)
		//	.addSegArc2()
		//	.addSegStrokeA(pt2.cx, pt2.cy);
		////figProfile.addSecond(ctrPartial1);
		//// partial-2
		//const [, firsta22] = calcAzig(pts1[param.Nk - 1].cx, pts2[param.Nk - 1].cx, Rkl, Rks);
		//const firstp22 = pts2[param.Nk - 1].translatePolar(firsta22, Rks);
		//const ctrPartial2 = contour(pt3.cx, pt3.cy)
		//	.addSegStrokeA(pt3c.cx, pt3c.cy)
		//	.addPointA(pt3b.cx, pt3b.cy)
		//	.addPointA(firstp22.cx, firstp22.cy)
		//	.addSegArc2();
		//for (let ii = param.Nk - 1; ii >= 0; ii--) {
		//	let a21 = Math.PI / 2;
		//	//const a22 = -Math.PI / 2;
		//	//const a11 = Math.PI / 2;
		//	let a12 = -Math.PI / 2;
		//	const [a11, a22] = calcAzig(pts1[ii].cx, pts2[ii].cx, Rkl, Rks);
		//	if (ii > 0) {
		//		const [, tmpa12] = calcAzag(pts2[ii - 1].cx, pts1[ii].cx, Rks, Rkl);
		//		a12 = tmpa12;
		//	}
		//	if (ii < param.Nk - 1) {
		//		const [tmpa21] = calcAzag(pts2[ii].cx, pts1[ii + 1].cx, Rks, Rkl);
		//		a21 = tmpa21;
		//	}
		//	const p11 = pts1[ii].translatePolar(a11, Rkl);
		//	const p1b = pts1[ii].translatePolar(a11 - withinZeroPi((a11 - a12) / 2), Rkl);
		//	const p12 = pts1[ii].translatePolar(a12, Rkl);
		//	const p21 = pts2[ii].translatePolar(a21, Rks);
		//	const p2b = pts2[ii].translatePolar(a21 + withinZeroPi((a22 - a21) / 2), Rks);
		//	const p22 = pts2[ii].translatePolar(a22, Rks);
		//	if (ii < param.Nk - 1) {
		//		ctrPartial2
		//			.addSegStrokeA(p21.cx, p21.cy)
		//			.addPointA(p2b.cx, p2b.cy)
		//			.addPointA(p22.cx, p22.cy)
		//			.addSegArc2();
		//	}
		//	ctrPartial2
		//		.addSegStrokeA(p11.cx, p11.cy)
		//		.addPointA(p1b.cx, p1b.cy)
		//		.addPointA(p12.cx, p12.cy)
		//		.addSegArc2();
		//}
		//ctrPartial2.addSegStrokeA(pt4.cx, pt4.cy);
		////figProfile.addSecond(ctrPartial2);
		// ctrSpringHollow
		function ctrSpringHollow(ii: number): tContour {
			const [ip1, ip2] = iiParity(ii);
			const pp1 = ip1 === 0 ? ppp0 : ppp1;
			const pp2 = ip2 === 0 ? ppp0 : ppp1;
			const ctr = contour(pp1[0].cx, pp1[0].cy)
				.addCornerRounded(param.Rrsi)
				.addSegStrokeA(pp1[1].cx, pp1[1].cy)
				.addSegStrokeA(pp1[2].cx, pp1[2].cy)
				.addSegStrokeA(pp1[3].cx, pp1[3].cy)
				.addCornerRounded(param.Rrse)
				//.addSegStrokeA(pp2[4].cx, pp2[4].cy)
				.addPointA(pp2[4].cx, pp2[4].cy)
				.addSegArc(Rse, false, true)
				.addCornerRounded(param.Rrse)
				.addSegStrokeA(pp2[5].cx, pp2[5].cy)
				.addSegStrokeA(pp2[6].cx, pp2[6].cy)
				.addSegStrokeA(pp2[7].cx, pp2[7].cy)
				.addCornerRounded(param.Rrsi)
				//.closeSegStroke();
				.closeSegArc(Rsi, false, false);
			return ctr.rotate(0, 0, ii * aSpringStep);
		}
		for (let ii = 0; ii < param.Ns; ii++) {
			ctrsH.push(ctrSpringHollow(ii));
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
		rGeome.logstr += 'springTorqueC drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const springTorqueCDef: tPageDef = {
	pTitle: 'springTorqueC',
	pDescription: 'spring disc for smooth torque transmission',
	pDef: pDef,
	pGeom: pGeom
};

export { springTorqueCDef };
