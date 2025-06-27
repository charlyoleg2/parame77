// springTorqueC.ts
// a spring disc for smooth torque transmission

import type {
	Point,
	Contour,
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
		pDropdown('zag', ['arc', 'stroke']),
		pNumber('aEs', '%', 20, 1, 99, 1),
		pNumber('Esi', '%', 10, 0, 90, 1),
		pNumber('Ese', '%', 10, 0, 90, 1),
		pNumber('Nk', 'zigzag', 4, 2, 100, 1),
		pNumber('Wk', 'mm', 1, 0.1, 20, 0.1),
		pNumber('Rrsi', 'mm', 0.1, 0, 20, 0.1),
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
function calcZagP2(pA: Point, pE: Point, lAB: number, lDE: number, iSign: number): Point {
	const xAE = pE.cx - pA.cx;
	const yAE = pE.cy - pA.cy;
	const lAE = Math.sqrt(xAE ** 2 + yAE ** 2);
	const aAE = Math.atan2(yAE, xAE);
	const lAC = (lAB * lAE) / (lAB + lDE);
	const aCAB = Math.acos(lAB / lAC);
	const rPt = pA.translatePolar(aAE + iSign * aCAB, lAB);
	return rPt;
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
		const Rk = dRLs / (2 * (param.Nk - 1));
		const Ek = 2 * Rk - param.Wk;
		// step-5 : checks on the parameter values
		if (Rmin1 < 0.1) {
			throw `err120: Di ${param.Di} is too small compare to DTi ${param.DTi}, Ei ${param.Ei}`;
		}
		if (dRLs < 2 * param.Wk) {
			throw `err133: dRLs ${dRLs} is too small compare to Wk ${param.Wk}`;
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
		const ptl: number[] = [];
		const k2Parity1 = param.zig === 2 ? 1 : 0;
		for (let ii = 0; ii < param.Nk; ii++) {
			const k2Parity2 = param.zig === 1 ? 0 : 1;
			const kl = Rsi + Esi + 2 * ii * Rk;
			ptl.push(kl);
			const ka = Math.asin(Rk / kl);
			const kap1 = ii % 2 === k2Parity1 ? ka : aSpring - ka;
			pts0.push(point(kl * Math.cos(kap1), kl * Math.sin(kap1)));
			const kap2 = ii % 2 === k2Parity2 ? ka : aSpring - ka;
			pts1.push(point(kl * Math.cos(kap2), kl * Math.sin(kap2)));
		}
		const aArcMin = Math.asin(Rk / (Rsi + Esi));
		let zagArc = param.zag === 0;
		const Wk2 = param.Wk / 2;
		function prePoints(ll: number): [number, number] {
			const ka = Math.asin(Rk / ll);
			const kx = ll * Math.cos(ka);
			const ra = Math.atan2(Wk2, kx);
			const rl = Math.sqrt(kx ** 2 + Wk2 ** 2);
			return [ra, rl];
		}
		const a18 = Math.asin(Wk2 / Rsi);
		//const a27 = Math.asin(Wk2 / (Rsi + Esi));
		//const a36 = Math.asin(Wk2 / (Rse - Ese));
		const [a27, l27] = prePoints(Rsi + Esi);
		const [a36, l36] = prePoints(Rse - Ese);
		const a45 = Math.asin(Wk2 / Rse);
		function pppI(a1: number, iParity: number, l2: number): Point {
			const a2 = iParity === 0 ? a1 : aSpring + a1;
			return point(0, 0).translatePolar(a2, l2);
		}
		const extParity = param.Nk % 2;
		function externParity(iParity: number): number {
			const eeParity = (extParity + iParity + 1) % 2;
			return eeParity;
		}
		function pppE(a1: number, iParity: number, l2: number): Point {
			const a2 = externParity(iParity) === 0 ? a1 : aSpring + a1;
			return point(0, 0).translatePolar(a2, l2);
		}
		const ppp0: Point[] = [];
		ppp0.push(pppI(a18, 0, Rsi)); // 0
		ppp0.push(pppI(a27, 0, l27)); // 1
		ppp0.push(pppE(a36, 0, l36)); // 2
		ppp0.push(pppE(a45, 0, Rse)); // 3
		ppp0.push(pppE(-a45, 0, Rse).rotateOrig(aSpringStep)); // 4
		ppp0.push(pppE(-a36, 0, l36).rotateOrig(aSpringStep)); // 5
		ppp0.push(pppI(-a27, 0, l27).rotateOrig(aSpringStep)); // 6
		ppp0.push(pppI(-a18, 0, Rsi).rotateOrig(aSpringStep)); // 7
		const ppp1: Point[] = [];
		ppp1.push(pppI(a18, 1, Rsi)); // 0
		ppp1.push(pppI(a27, 1, l27)); // 1
		ppp1.push(pppE(a36, 1, l36)); // 2
		ppp1.push(pppE(a45, 1, Rse)); // 3
		ppp1.push(pppE(-a45, 1, Rse).rotateOrig(aSpringStep)); // 4
		ppp1.push(pppE(-a36, 1, l36).rotateOrig(aSpringStep)); // 5
		ppp1.push(pppI(-a27, 1, l27).rotateOrig(aSpringStep)); // 6
		ppp1.push(pppI(-a18, 1, Rsi).rotateOrig(aSpringStep)); // 7
		const Rks = Rk - Wk2;
		const Rkl = Rk + Wk2;
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
		function pppb(ip1: number, ip2: number): [Point, Point] {
			const ai1 = ip1 === 0 ? 0 : aSpring;
			const ai2 = ip2 === 0 ? aSpringStep : aSpringStep + aSpring;
			const aib = ai1 + (ai2 - ai1) / 2;
			const ae1 = externParity(ip1) === 0 ? 0 : aSpring;
			const ae2 = externParity(ip2) === 0 ? aSpringStep : aSpringStep + aSpring;
			const aeb = ae1 + (ae2 - ae1) / 2;
			const rpib = point(0, 0).translatePolar(aib, Rsi);
			const rpeb = point(0, 0).translatePolar(aeb, Rse);
			return [rpib, rpeb];
		}
		// step-6 : any logs
		rGeome.logstr += `Dmax ${ffix(2 * Rmax)}, Dmin1 ${ffix(2 * Rmin1)} mm\n`;
		rGeome.logstr += `Spring area: aSpring ${ffix(radToDeg(aSpring))} degree, dRLs ${ffix(dRLs)} mm\n`;
		rGeome.logstr += `Spring zigzag: Ek ${ffix(Ek)}, Rk ${ffix(Rk)} mm\n`;
		if (aSpring < 2 * aArcMin) {
			zagArc = false;
			rGeome.logstr += `Spring zigzag forced to stroke because of aArcMin ${ffix(radToDeg(aArcMin))} degree\n`;
		}
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
			if (ii > 0) {
				figProfile.addSecond(contourCircle(0, 0, ptl[ii] - Rk));
			}
		}
		// partial-1
		function ctrPartial1(iParity: number): Contour {
			const pts = iParity === 0 ? pts0 : pts1;
			const aStart1 = iParity === 0 ? -Math.PI / 2 : Math.PI / 2 + aSpring;
			const siRk = iParity === 0 ? Rks : Rkl;
			const startPt1 = pts[0].translatePolar(aStart1, siRk);
			const rCtr = contour(startPt1.cx, startPt1.cy);
			for (let ii = 0; ii < param.Nk; ii++) {
				const iiParity = (ii + iParity) % 2;
				const apt = Math.atan2(pts[ii].cy, pts[ii].cx);
				const aMid = iiParity === 0 ? apt - Math.PI / 2 : apt + Math.PI / 2;
				const aSign = iiParity === 0 ? 1 : -1;
				const iRk = iiParity === 0 ? Rks : Rkl;
				const iRk2 = iiParity === 0 ? Rkl : Rks;
				if (ii > 0) {
					if (zagArc) {
						const p1 = point(0, 0).translatePolar(aSpring / 2, ptl[ii] - iRk);
						const p2 = pts[ii].translatePolar(aMid - (aSign * Math.PI) / 2, iRk);
						rCtr.addPointA(p1.cx, p1.cy).addPointA(p2.cx, p2.cy).addSegArc2();
					} else {
						const p2 = calcZagP2(pts[ii], pts[ii - 1], iRk, iRk2, aSign);
						rCtr.addSegStrokeA(p2.cx, p2.cy);
					}
				}
				let da3 = aMid;
				let da4 = aMid + (aSign * Math.PI) / 2;
				if (ii === 0) {
					da3 = aMid + (aSign * Math.PI) / 4;
				} else if (ii === param.Nk - 1) {
					da3 = aMid - (aSign * Math.PI) / 4;
					da4 = iiParity === 0 ? -Math.PI / 2 : Math.PI / 2 + aSpring;
				}
				if (ii === param.Nk - 1) {
					const p4 = pts[ii].translatePolar(da4, iRk);
					rCtr.addPointA(p4.cx, p4.cy).addSegArc(iRk, false, iiParity === 0);
				} else if (zagArc) {
					const p3 = pts[ii].translatePolar(da3, iRk);
					const p4 = pts[ii].translatePolar(da4, iRk);
					rCtr.addPointA(p3.cx, p3.cy).addPointA(p4.cx, p4.cy).addSegArc2();
				} else {
					const p3 = pts[ii].translatePolar(da3, iRk);
					const p4 = calcZagP2(pts[ii], pts[ii + 1], iRk, iRk2, -aSign);
					if (ii > 0 && aSpring > aArcMin) {
						rCtr.addPointA(p3.cx, p3.cy).addPointA(p4.cx, p4.cy).addSegArc2();
					} else {
						rCtr.addPointA(p4.cx, p4.cy).addSegArc(iRk, false, iiParity === 0);
					}
				}
			}
			return rCtr;
		}
		//figProfile.addSecond(ctrPartial1(0));
		// partial-2
		function ctrPartial2(iParity: number): Contour {
			const pts = iParity === 0 ? pts0 : pts1;
			const eParity = externParity(iParity);
			const aStart1 = eParity === 0 ? -Math.PI / 2 : Math.PI / 2 + aSpring;
			const siRk = eParity === 0 ? Rkl : Rks;
			const startPt1 = pts[param.Nk - 1].translatePolar(aStart1, siRk);
			const rCtr = contour(startPt1.cx, startPt1.cy);
			for (let ii = param.Nk - 1; ii >= 0; ii--) {
				const iiParity = (ii + iParity) % 2;
				const apt = Math.atan2(pts[ii].cy, pts[ii].cx);
				const aMid = iiParity === 0 ? apt - Math.PI / 2 : apt + Math.PI / 2;
				const aSign = iiParity === 0 ? -1 : 1;
				const iRk = iiParity === 0 ? Rkl : Rks;
				const iRk2 = iiParity === 0 ? Rks : Rkl;
				if (ii < param.Nk - 1) {
					if (zagArc) {
						const p1 = point(0, 0).translatePolar(aSpring / 2, ptl[ii] + iRk);
						const p2 = pts[ii].translatePolar(aMid - (aSign * Math.PI) / 2, iRk);
						rCtr.addPointA(p1.cx, p1.cy).addPointA(p2.cx, p2.cy).addSegArc2();
					} else {
						const p2 = calcZagP2(pts[ii], pts[ii + 1], iRk, iRk2, aSign);
						rCtr.addSegStrokeA(p2.cx, p2.cy);
					}
				}
				let da3 = aMid;
				let da4 = aMid + (aSign * Math.PI) / 2;
				if (ii === param.Nk - 1) {
					da3 = aMid + (aSign * Math.PI) / 4;
				} else if (ii === 0) {
					da3 = aMid - (aSign * Math.PI) / 4;
					da4 = iiParity === 0 ? -Math.PI / 2 : Math.PI / 2 + aSpring;
				}
				if (ii === 0) {
					const p4 = pts[ii].translatePolar(da4, iRk);
					rCtr.addPointA(p4.cx, p4.cy).addSegArc(iRk, false, iiParity === 1);
				} else if (zagArc) {
					const p3 = pts[ii].translatePolar(da3, iRk);
					const p4 = pts[ii].translatePolar(da4, iRk);
					rCtr.addPointA(p3.cx, p3.cy).addPointA(p4.cx, p4.cy).addSegArc2();
				} else {
					const p3 = pts[ii].translatePolar(da3, iRk);
					const p4 = calcZagP2(pts[ii], pts[ii - 1], iRk, iRk2, -aSign);
					if (ii < param.Nk - 1 && aSpring > aArcMin) {
						rCtr.addPointA(p3.cx, p3.cy).addPointA(p4.cx, p4.cy).addSegArc2();
					} else {
						rCtr.addPointA(p4.cx, p4.cy).addSegArc(iRk, false, iiParity === 1);
					}
				}
			}
			return rCtr;
		}
		//figProfile.addSecond(ctrPartial2(0));
		// ctrSpringHollow
		function ctrSpringHollow(ii: number): tContour {
			const [ip1, ip2] = iiParity(ii);
			const pp1 = ip1 === 0 ? ppp0 : ppp1;
			const pp2 = ip2 === 0 ? ppp0 : ppp1;
			const [ppib, ppeb] = pppb(ip1, ip2);
			const ctr = contour(pp1[0].cx, pp1[0].cy)
				.addCornerRounded(param.Rrsi)
				.addSegStrokeA(pp1[1].cx, pp1[1].cy)
				.addPartial(ctrPartial1(ip1))
				//.addSegStrokeA(pp1[2].cx, pp1[2].cy)
				.addSegStrokeA(pp1[3].cx, pp1[3].cy)
				.addCornerRounded(param.Rrse)
				//.addSegStrokeA(pp2[4].cx, pp2[4].cy)
				.addPointA(ppeb.cx, ppeb.cy)
				.addPointA(pp2[4].cx, pp2[4].cy)
				//.addSegArc(Rse, false, true)
				.addSegArc2()
				.addCornerRounded(param.Rrse)
				.addSegStrokeA(pp2[5].cx, pp2[5].cy)
				.addPartial(ctrPartial2(ip2).rotate(0, 0, aSpringStep))
				//.addSegStrokeA(pp2[6].cx, pp2[6].cy)
				.addSegStrokeA(pp2[7].cx, pp2[7].cy)
				.addCornerRounded(param.Rrsi)
				//.closeSegStroke();
				//.closeSegArc(Rsi, false, false);
				.addPointA(ppib.cx, ppib.cy)
				.addPointA(pp1[0].cx, pp1[0].cy)
				.addSegArc2();
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
