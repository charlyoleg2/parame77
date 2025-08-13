// minihelio.ts
// a table-top model of an heliostat

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
	point,
	contour,
	contourCircle,
	ctrRectangle,
	figure,
	degToRad,
	radToDeg,
	ffix,
	pNumber,
	pCheckbox,
	//pDropdown,
	pSectionSeparator,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';
//import { triLALrL, triALLrL, triLLLrA } from 'triangule';
//import { triALLrLAA } from 'triangule';

const pDef: tParamDef = {
	partName: 'minihelio',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('N1', 'mirror', 3, 1, 20, 1),
		pNumber('W1', 'mm', 100, 5, 2000, 1),
		pNumber('W2', 'mm', 5, 1, 200, 1),
		pNumber('H4', 'mm', 30, 1, 2000, 1),
		pNumber('H5', 'mm', 10, 1, 2000, 1),
		pNumber('H6', 'mm', 120, 5, 2000, 1),
		pNumber('H7', 'mm', 10, 1, 2000, 1),
		pNumber('H8', 'mm', 50, 1, 2000, 1),
		pNumber('D8', 'mm', 3, 1, 50, 1),
		pSectionSeparator('Frame side'),
		pNumber('T1', 'mm', 1, 0.5, 10, 0.1),
		pNumber('T2', 'mm', 1, 0.5, 10, 0.1),
		pNumber('W3', 'mm', 50, 1, 500, 1),
		pNumber('W4', 'mm', 10, 1, 500, 1),
		pNumber('W5', 'mm', 30, 1, 500, 1),
		pNumber('HW3', 'mm', 40, 1, 2000, 1),
		pNumber('HW53', 'mm', 60, 1, 2000, 1),
		pSectionSeparator('Foot'),
		pNumber('D1', 'mm', 30, 5, 1000, 1),
		pNumber('D2', 'mm', 40, 5, 1000, 1),
		pNumber('D3', 'mm', 20, 5, 1000, 1),
		pNumber('H1', 'mm', 20, 5, 2000, 1),
		pNumber('H2', 'mm', 40, 5, 2000, 1),
		pNumber('H3', 'mm', 80, 5, 2000, 1),
		pSectionSeparator('Mirror'),
		pNumber('Wm', 'mm', 60, 5, 2000, 1),
		pNumber('Hm', 'mm', 60, 5, 2000, 1),
		pNumber('Tm', 'mm', 1, 0.5, 10, 0.1),
		pNumber('Dm', 'mm', 2, 0.1, 50, 0.1),
		pNumber('Sm', 'mm', 5, 1, 200, 1),
		pSectionSeparator('Simulation'),
		pNumber('aSunMin', 'degree', 0, -10, 120, 1),
		pNumber('aSunMax', 'degree', 80, -10, 120, 1),
		pNumber('aSolidSun', 'degree', 0.54, 0.1, 1.0, 0.01),
		pNumber('Lt', 'm', 0.5, 0.1, 200, 0.1),
		pNumber('Ht1', 'm', 0.2, 0.1, 20, 0.1),
		pNumber('Ht2', 'm', 0.1, 0.1, 20, 0.1),
		pSectionSeparator('3D parts'),
		pCheckbox('d3_foot', true),
		pCheckbox('d3_frame', true),
		pCheckbox('d3_mirrors', false)
	],
	paramSvg: {
		N1: 'minihelio_front.svg',
		W1: 'minihelio_front.svg',
		W2: 'minihelio_front.svg',
		H4: 'minihelio_front.svg',
		H5: 'minihelio_front.svg',
		H6: 'minihelio_front.svg',
		H7: 'minihelio_front.svg',
		H8: 'minihelio_front.svg',
		D8: 'minihelio_front.svg',
		T1: 'minihelio_side.svg',
		T2: 'minihelio_side.svg',
		W3: 'minihelio_side.svg',
		W4: 'minihelio_side.svg',
		W5: 'minihelio_side.svg',
		HW3: 'minihelio_side.svg',
		HW53: 'minihelio_side.svg',
		D1: 'minihelio_front.svg',
		D2: 'minihelio_front.svg',
		D3: 'minihelio_front.svg',
		H1: 'minihelio_front.svg',
		H2: 'minihelio_front.svg',
		H3: 'minihelio_front.svg',
		Wm: 'minihelio_mirror.svg',
		Hm: 'minihelio_mirror.svg',
		Tm: 'minihelio_mirror.svg',
		Dm: 'minihelio_mirror.svg',
		Sm: 'minihelio_mirror.svg',
		aSunMin: 'minihelio_side.svg',
		aSunMax: 'minihelio_side.svg',
		aSolidSun: 'minihelio_side.svg',
		Lt: 'minihelio_side.svg',
		Ht1: 'minihelio_side.svg',
		Ht2: 'minihelio_side.svg',
		d3_foot: 'minihelio_side.svg',
		d3_frame: 'minihelio_side.svg',
		d3_mirrors: 'minihelio_side.svg'
	},
	sim: {
		tMax: 100,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figFoot = figure();
	const figFrameBand = figure();
	const figFrameBottom = figure();
	const figFrameTop = figure();
	const figFrameSide = figure();
	const figFrameMid = figure();
	const figMirrorSide = figure();
	const figMirrorAxis = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const pi2 = Math.PI / 2;
		const aSunMin = degToRad(param.aSunMin);
		const aSunMax = degToRad(param.aSunMax);
		const aSun = aSunMin + (t * (aSunMax - aSunMin)) / 100;
		const R1 = param.D1 / 2;
		const R2 = param.D2 / 2;
		const R3 = param.D3 / 2;
		const R8 = param.D8 / 2;
		const Rm = param.Dm / 2;
		const R12 = R2 - R1;
		const R23 = R2 - R3;
		const Wbottom2 = param.W1 / 2 - param.H4;
		const H123 = param.H1 + param.H2 + param.H3;
		const H567 = param.H5 + param.T2 + param.N1 * (param.H6 + param.T2) + param.H7;
		const W12 = param.W1 / 2;
		const W1b = param.W1 - 2 * param.T2;
		const W1b2 = W1b / 2;
		const H15 = H123 + param.H4 + param.H5;
		const H6b = param.H6 + param.T2;
		const H18pre = H15 + param.T2 + param.H8;
		const H18b = H18pre - Rm;
		const H18 = H18pre - param.Hm / 2;
		const L8 = (param.W1 - param.Wm) / 2;
		const H17 = H15 + param.T2 + param.N1 * (param.H6 + param.T2) + param.H7;
		const H42 = param.H4 - param.T2;
		const Hframe =
			param.H4 + param.H5 + param.T2 + param.N1 * (param.H6 + param.T2) + param.H7 + W12;
		const H47 = Hframe - 2 * param.T2;
		const W35 = (param.W3 - param.W5) / 2;
		const Hside = Hframe - W12 - param.H4;
		const Hside1 = param.HW3 - param.H4;
		const Hside2 = Hside - Hside1 - param.HW53;
		const Lt = param.Lt * 1000;
		const Ht1 = param.Ht1 * 1000;
		const Ht2 = param.Ht2 * 1000;
		const Hm2 = param.Hm / 2 - Rm;
		const mirrorSurface = param.Hm * param.Wm;
		const mirrorSurfaceN = param.N1 * mirrorSurface;
		const mh2 = param.Hm / 2;
		const aSSun2 = degToRad(param.aSolidSun) / 2;
		// step-5 : checks on the parameter values
		if (R12 < 0.1) {
			throw `err134: D2 ${ffix(param.D2)} is too small compare to D1 ${ffix(param.D1)} mm`;
		}
		if (R23 < 0.1) {
			throw `err139: D2 ${ffix(param.D2)} is too small compare to D3 ${ffix(param.D3)} mm`;
		}
		if (param.H2 < param.T1) {
			throw `err142: H2 ${ffix(param.H2)} is too small compare to T1 ${ffix(param.T1)} mm`;
		}
		if (Wbottom2 < R3) {
			throw `err151: W1 ${ffix(param.W1)} is too small compare to H4 ${ffix(param.H4)} mm`;
		}
		if (W1b < 0) {
			throw `err158: W1 ${ffix(param.W1)} is too small compare to T2 ${ffix(param.T2)} mm`;
		}
		if (param.W3 < param.D3) {
			throw `err172: W3 ${ffix(param.W3)} is too small compare to D3 ${ffix(param.D3)} mm`;
		}
		if (W35 < 0.1) {
			throw `err175: W3 ${ffix(param.W3)} is too small compare to W5 ${ffix(param.W5)} mm`;
		}
		if (param.W5 < param.W4 + 2 * param.T2) {
			throw `err178: W5 ${ffix(param.W5)} is too small compare to W4 ${ffix(param.W4)} mm`;
		}
		if (Hside1 < 0.1) {
			throw `err182: HW3 ${ffix(param.HW3)} is too small compare to H4 ${ffix(param.H4)} mm`;
		}
		if (Hside2 < 0.1) {
			throw `err192: Hside2 ${ffix(Hside2)} is too small because of HW3 ${ffix(param.HW3)} or HW53 ${ffix(param.HW53)} mm`;
		}
		if (Hm2 < 0) {
			throw `err096: Hm ${ffix(param.Hm)} is too small compare to Dm ${ffix(param.Dm)} mm`;
		}
		if (param.Sm < Rm) {
			throw `err099: Sm ${ffix(param.Sm)} is too small compare to Dm ${ffix(param.Dm)} mm`;
		}
		if (param.D8 < param.Dm) {
			throw `err102: D8 ${ffix(param.D8)} is too small compare to Dm ${ffix(param.Dm)} mm`;
		}
		// step-6 : any logs
		rGeome.logstr += `Mirror surface: One: ${ffix(mirrorSurface)}, N: ${param.N1} : ${ffix(mirrorSurfaceN)} mm2\n`;
		rGeome.logstr += `Height: Foot: ${ffix(H123)}, Frame: ${ffix(Hframe)}, Total : ${ffix(H123 + Hframe)} mm\n`;
		rGeome.logstr += `aSun: ${ffix(radToDeg(aSun))} degree\n`;
		// sub-function
		function ctrFoot(sign: number): tContour {
			const rCtr = contour(sign * R1, 0)
				.addSegStrokeR(0, param.H1)
				.addSegStrokeR(sign * R12, 0)
				.addSegStrokeR(0, param.H2)
				.addSegStrokeR(-sign * R23, param.H3)
				.addSegStrokeR(-sign * param.T1, 0)
				.addSegStrokeR(sign * R23, -param.H3)
				.addSegStrokeR(0, -param.H2 + param.T1)
				.addSegStrokeR(-sign * R12, 0)
				.addSegStrokeR(0, -param.H1 - param.T1)
				.closeSegStroke();
			return rCtr;
		}
		function ctrOval(iDelta: number): tContour {
			const r4 = param.H4 - iDelta;
			const r1 = W12 - iDelta;
			const rCtr = contour(Wbottom2, H123 + iDelta)
				.addPointR(r4, r4)
				.addSegArc(r4, false, true)
				.addSegStrokeR(0, H567)
				.addPointR(-r1, r1)
				.addPointR(-2 * r1, 0)
				.addSegArc2()
				.addSegStrokeR(0, -H567)
				.addPointR(r4, -r4)
				.addSegArc(r4, false, true)
				.closeSegStroke();
			return rCtr;
		}
		function calcYray(
			iYm: number,
			iXt: number,
			iYt: number,
			iRm: number,
			ia1: number,
			iXd: number,
			iaSun: number
		): [number, number, number] {
			const a2 = iaSun - ia1;
			const aReflection = ia1 - a2; // 2 * ia1 - iaSun
			const xh1 = iXd * Math.cos(ia1 + Math.PI / 2);
			const yh1 = iXd * Math.sin(ia1 + Math.PI / 2);
			const xh2 = iRm * Math.cos(ia1);
			const yh2 = iRm * Math.sin(ia1);
			const xh = -xh1 - xh2 + iXt;
			const yh = yh1 + yh2 + iYm - iYt;
			const yReflection = xh * Math.tan(aReflection);
			const yRay = yReflection + yh;
			const bigYray = 100 + 10 * (iYm + iYt);
			const rY = a2 < Math.PI / 2 ? yRay : Math.sign(a2) * bigYray;
			const rXm = xh1 + xh2;
			const rYm = yh1 + yh2;
			return [rY, rXm, rYm];
		}
		function ctrSunRay(
			iYm: number,
			iXt: number,
			iYt: number,
			iRm: number,
			ia1: number,
			iXd: number,
			iaSun: number,
			iColor: string
		): tContour {
			const [yRay, xhm, yhm] = calcYray(iYm, iXt, iYt, iRm, ia1, iXd, iaSun);
			const pt1 = point(xhm, iYm + yhm);
			const pt2 = pt1.translatePolar(iaSun, 20 * iRm);
			const rCtr = contour(pt2.cx, pt2.cy, iColor).addSegStrokeA(pt1.cx, pt1.cy);
			const yRayMax = 2 * (iYm + iYt); // Don't draw sun-ray if number are to big
			if (Math.abs(yRay) < yRayMax) {
				rCtr.addSegStrokeA(iXt, iYt + yRay);
			}
			return rCtr;
		}
		// using Monte-Carlo because of complex equation acos(f(a1))=aSun-a3-2*a1
		function searchA1(
			iYm: number,
			iXt: number,
			iYt: number,
			iRm: number,
			iXd: number,
			iaSun: number
		): [number, number] {
			let rA1 = iaSun / 2;
			let rCnt = 0;
			let [tY, xhm, yhm] = calcYray(iYm, iXt, iYt, iRm, rA1, iXd, iaSun);
			while (Math.abs(tY) > 0.5 && rCnt < 100) {
				const aErr =
					Math.atan((iYm + yhm - iYt + tY) / (iXt - xhm)) -
					Math.atan((iYm + yhm - iYt) / (iXt - xhm));
				const a1Step = 0.5 * Math.abs(aErr);
				rA1 -= Math.sign(tY) * a1Step;
				//rA1 = Math.min(Math.max(rA1, -Math.PI / 4), Math.PI / 2);
				rCnt += 1;
				[tY, xhm, yhm] = calcYray(iYm, iXt, iYt, iRm, rA1, iXd, iaSun);
			}
			return [rA1, rCnt];
		}
		// figFoot
		figFoot.addMainO(ctrFoot(1));
		figFoot.addSecond(ctrFoot(-1));
		figFoot.addSecond(ctrOval(0));
		figFoot.addSecond(ctrOval(param.T2));
		figFoot.addSecond(ctrOval(param.T2 + param.W2));
		// figFrameBand
		figFrameBand.addMainOI([ctrOval(param.T2), ctrOval(param.T2 + param.W2)]);
		figFrameBand.addSecond(ctrOval(0));
		figFrameBand.addSecond(ctrFoot(1));
		figFrameBand.addSecond(ctrFoot(-1));
		// figFrameMid
		figFrameMid.mergeFigure(figFoot, true);
		for (let ii = 0; ii < param.N1 + 1; ii++) {
			figFrameMid.addMainO(ctrRectangle(-W1b / 2, H15 + ii * H6b, W1b, param.T2));
		}
		for (let ii = 0; ii < param.N1; ii++) {
			figFrameMid.addSecond(ctrRectangle(-param.Wm / 2, H18 + ii * H6b, param.Wm, param.Hm));
			figFrameMid.addSecond(ctrRectangle(-param.W1 / 2, H18b + ii * H6b, L8, param.Dm));
			figFrameMid.addSecond(ctrRectangle(param.Wm / 2, H18b + ii * H6b, L8, param.Dm));
		}
		// figFrameTop
		figFrameTop.mergeFigure(figFrameMid, true);
		const ctrFrameTop = contour(-W1b2, H17)
			.addPointR(W1b2, W1b2)
			.addPointR(2 * W1b2, 0)
			.addSegArc2()
			.addSegStrokeR(param.T2, 0)
			.addPointR(-W12, W12)
			.addPointR(-2 * W12, 0)
			.addSegArc2()
			.closeSegStroke();
		figFrameTop.addMainO(ctrFrameTop);
		// figFrameBottom
		figFrameBottom.mergeFigure(figFrameMid, true);
		const ctrFrameBottom = contour(Wbottom2, H123)
			.addPointR(param.H4, param.H4)
			.addSegArc(param.H4, false, true)
			.addSegStrokeR(-param.T2, 0)
			.addPointR(-H42, -H42)
			.addSegArc(H42, false, false)
			.addSegStrokeR(-2 * Wbottom2, 0)
			.addPointR(-H42, H42)
			.addSegArc(H42, false, false)
			.addSegStrokeR(-param.T2, 0)
			.addPointR(param.H4, -param.H4)
			.addSegArc(param.H4, false, true)
			.closeSegStroke();
		figFrameBottom.addMainO(ctrFrameBottom);
		// figFrameSide
		figFrameSide.addSecond(ctrFoot(1));
		figFrameSide.addSecond(ctrFoot(-1));
		figFrameSide.addSecond(ctrRectangle(-param.W3 / 2, H123, param.W3, param.H4));
		figFrameSide.addSecond(ctrRectangle(-param.W3 / 2, H123, param.W3, param.T2));
		figFrameSide.addSecond(ctrRectangle(-param.W5 / 2, H17, param.W5, W12));
		figFrameSide.addSecond(
			ctrRectangle(-param.W5 / 2, H17 + W12 - param.T2, param.W5, param.T2)
		);
		figFrameSide.addSecond(
			ctrRectangle(-param.W4 / 2 - param.T2, H123 + param.T2, param.T2, H47)
		);
		figFrameSide.addSecond(ctrRectangle(param.W4 / 2, H123 + param.T2, param.T2, H47));
		for (let ii = 0; ii < param.N1 + 1; ii++) {
			figFrameSide.addSecond(ctrRectangle(-param.W4 / 2, H15 + ii * H6b, param.W4, param.T2));
		}
		const ctrSideHoles: tContour[] = [];
		for (let ii = 0; ii < param.N1; ii++) {
			figFrameSide.addSecond(contourCircle(0, H18pre + ii * H6b, Rm));
			ctrSideHoles.push(contourCircle(0, H18pre + ii * H6b, R8));
		}
		figFrameSide.addSecond(ctrRectangle(Lt, Ht1, Ht2 * 0.05, Ht2));
		const ctrSide = contour(param.W3 / 2, H123 + param.H4)
			.addSegStrokeR(0, Hside1)
			.addPointR(-W35, param.HW53)
			.addSegArc3(-Math.PI / 2, false)
			.addSegStrokeR(0, Hside2)
			.addSegStrokeR(-param.W5, 0)
			.addSegStrokeR(0, -Hside2)
			.addPointR(-W35, -param.HW53)
			.addSegArc3(-Math.PI / 2, true)
			.addSegStrokeR(0, -Hside1)
			.closeSegStroke();
		figFrameSide.addMainOI([ctrSide, ...ctrSideHoles]);
		// figMirrorSide figMirrorAxis
		const ctrMirrorSide = contour(-Rm, 0)
			.addPointR(Rm, -Rm)
			.addPointR(2 * Rm, 0)
			.addSegArc2()
			.addSegStrokeR(0, param.Sm)
			.addSegStrokeR(Hm2, 0)
			.addSegStrokeR(0, param.Tm)
			.addSegStrokeR(-param.Hm, 0)
			.addSegStrokeR(0, -param.Tm)
			.addSegStrokeR(Hm2, 0)
			.closeSegStroke();
		const ctrMirrorAxis = contourCircle(0, 0, Rm);
		//figMirrorSide.addMainO(ctrMirrorSide);
		//figMirrorSide.addSecond(ctrMirrorAxis);
		//figMirrorAxis.addMainO(ctrMirrorAxis);
		//figMirrorAxis.addSecond(ctrMirrorSide);
		figMirrorSide.mergeFigure(figFrameSide, true);
		figMirrorAxis.mergeFigure(figFrameSide, true);
		// simulation
		let sunLinearAcc = 0;
		let tyS1 = 0;
		let tyS2 = Ht2;
		let tyS3 = -Ht2;
		let tyS4 = 0;
		let a1Min = Math.PI / 2;
		let a1Max = -Math.PI / 2;
		for (let ii = 0; ii < param.N1; ii++) {
			const yM = H18pre + ii * H6b;
			const yT = Ht1 + Ht2 / 2;
			const Rm = param.Sm + param.Tm;
			//const ia = ((ii + 1) * aSun) / 6;
			const [ia, cycleCnt] = searchA1(yM, Lt, yT, Rm, 0, aSun);
			figFrameSide.addSecond(ctrMirrorSide.rotate(0, 0, ia - Math.PI / 2).translate(0, yM));
			const [yS] = calcYray(yM, Lt, yT, Rm, ia, 0, aSun);
			const [yS1] = calcYray(yM, Lt, yT, Rm, ia, mh2, aSun - aSSun2);
			const [yS2] = calcYray(yM, Lt, yT, Rm, ia, mh2, aSun + aSSun2);
			const [yS4] = calcYray(yM, Lt, yT, Rm, ia, -mh2, aSun + aSSun2);
			const [yS3] = calcYray(yM, Lt, yT, Rm, ia, -mh2, aSun - aSSun2);
			figFrameSide.addDynamics(ctrSunRay(yM, Lt, yT, Rm, ia, 0, aSun, 'yellow'));
			figFrameSide.addDynamics(ctrSunRay(yM, Lt, yT, Rm, ia, mh2, aSun - aSSun2, 'red'));
			figFrameSide.addDynamics(ctrSunRay(yM, Lt, yT, Rm, ia, mh2, aSun + aSSun2, 'orange'));
			figFrameSide.addDynamics(ctrSunRay(yM, Lt, yT, Rm, ia, -mh2, aSun + aSSun2, 'red'));
			figFrameSide.addDynamics(ctrSunRay(yM, Lt, yT, Rm, ia, -mh2, aSun - aSSun2, 'orange'));
			const sunLinear = 2 * mh2 * Math.cos(aSun - ia); // m
			const tHigh = yS2 - yS3; // m
			const tLow = yS1 - yS4; // m
			rGeome.logstr += `Mirror ${ii + 1}: yS ${ffix(yS)} mm, ia ${ffix(radToDeg(ia))} degree, cycleCnt ${cycleCnt}, linear ${ffix(sunLinear)} mm, target: ${ffix(tHigh)} ${ffix(tLow)} mm ${ffix((100 * tHigh) / tLow)} %\n`;
			sunLinearAcc += sunLinear;
			tyS1 = Math.max(tyS1, yS1);
			tyS2 = Math.min(tyS2, yS2);
			tyS3 = Math.max(tyS3, yS3);
			tyS4 = Math.min(tyS4, yS4);
			a1Min = Math.min(a1Min, ia);
			a1Max = Math.max(a1Max, ia);
			// figMirrorSide figMirrorAxis
			figMirrorSide.addMainO(ctrMirrorSide.rotate(0, 0, ia - Math.PI / 2).translate(0, yM));
			figMirrorSide.addSecond(ctrMirrorAxis.translate(0, yM));
			figMirrorAxis.addMainO(ctrMirrorAxis.translate(0, yM));
			figMirrorAxis.addSecond(ctrMirrorSide.rotate(0, 0, ia - Math.PI / 2).translate(0, yM));
		}
		rGeome.logstr += `mirror angles: min ${ffix(radToDeg(a1Min))} max ${ffix(radToDeg(a1Max))} diff ${ffix(radToDeg(a1Max - a1Min))} degree\n`;
		//rGeome.logstr += `dbg450: tyS1234 ${ffix(tyS1)} ${ffix(tyS2)} ${ffix(tyS3)} ${ffix(tyS4)}\n`;
		const targetHigh = tyS2 - tyS3;
		const targetLow = tyS1 - tyS4;
		rGeome.logstr += `sunLinearAcc: ${ffix(sunLinearAcc)} mm, target: ${ffix(targetHigh)} ${ffix(targetLow)} mm ${ffix((100 * targetHigh) / targetLow)} %\n`;
		rGeome.logstr += `sun concentration: ${ffix((100 * sunLinearAcc) / targetLow)} %\n`;
		rGeome.logstr += `target usage: bottom ${ffix(tyS4 + Ht2 / 2)} top ${ffix(Ht2 / 2 - tyS1)} mm, ${ffix((100 * targetLow) / Ht2)} %\n`;
		// final figure list
		rGeome.fig = {
			faceFoot: figFoot,
			faceFrameBand: figFrameBand,
			faceFrameTop: figFrameTop,
			faceFrameBottom: figFrameBottom,
			faceFrameSide: figFrameSide,
			faceFrameMid: figFrameMid,
			faceMirrorSide: figMirrorSide,
			faceMirrorAxis: figMirrorAxis
		};
		// volume
		const designName = rGeome.partName;
		const d3Foot: string[] = [];
		const d3Frame: string[] = [];
		const d3Mirror: string[] = [];
		if (param.d3_foot === 1) {
			d3Foot.push(`subpax_${designName}_foot`);
		}
		if (param.d3_frame === 1) {
			d3Frame.push(`subpax_${designName}_frameBand1`);
			d3Frame.push(`subpax_${designName}_frameBand2`);
			d3Frame.push(`subpax_${designName}_frameTop`);
			d3Frame.push(`subpax_${designName}_frameBottom`);
			d3Frame.push(`subpax_${designName}_frameMid`);
			d3Frame.push(`subpax_${designName}_frameSide1`);
			d3Frame.push(`subpax_${designName}_frameSide2`);
		}
		if (param.d3_mirrors === 1) {
			d3Mirror.push(`subpax_${designName}_mirrorSide`);
			d3Mirror.push(`subpax_${designName}_mirrorAxis`);
		}
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_foot`,
					face: `${designName}_faceFoot`,
					extrudeMethod: EExtrude.eRotate,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_frameBand1`,
					face: `${designName}_faceFrameBand`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T2,
					rotate: [pi2, 0, 0],
					translate: [0, -param.W4 / 2, 0]
				},
				{
					outName: `subpax_${designName}_frameBand2`,
					face: `${designName}_faceFrameBand`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T2,
					rotate: [pi2, 0, 0],
					translate: [0, param.W4 / 2 + param.T2, 0]
				},
				{
					outName: `subpax_${designName}_frameTop`,
					face: `${designName}_faceFrameTop`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.W5,
					rotate: [pi2, 0, 0],
					translate: [0, param.W5 / 2, 0]
				},
				{
					outName: `subpax_${designName}_frameBottom`,
					face: `${designName}_faceFrameBottom`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.W3,
					rotate: [pi2, 0, 0],
					translate: [0, param.W3 / 2, 0]
				},
				{
					outName: `subpax_${designName}_frameMid`,
					face: `${designName}_faceFrameMid`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.W4,
					rotate: [pi2, 0, 0],
					translate: [0, param.W4 / 2, 0]
				},
				{
					outName: `subpax_${designName}_frameSide1`,
					face: `${designName}_faceFrameSide`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T2,
					rotate: [pi2, 0, pi2],
					translate: [W1b2, 0, 0]
				},
				{
					outName: `subpax_${designName}_frameSide2`,
					face: `${designName}_faceFrameSide`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T2,
					rotate: [pi2, 0, pi2],
					translate: [-W1b2 - param.T2, 0, 0]
				},
				{
					outName: `subpax_${designName}_mirrorSide`,
					face: `${designName}_faceMirrorSide`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.Wm,
					rotate: [pi2, 0, pi2],
					translate: [-param.Wm / 2, 0, 0]
				},
				{
					outName: `subpax_${designName}_mirrorAxis`,
					face: `${designName}_faceMirrorAxis`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.W1,
					rotate: [pi2, 0, pi2],
					translate: [-param.W1 / 2, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [...d3Foot, ...d3Frame, ...d3Mirror]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'minihelio drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const minihelioDef: tPageDef = {
	pTitle: 'minihelio',
	pDescription: 'table-top model of an heliostat',
	pDef: pDef,
	pGeom: pGeom
};

export { minihelioDef };
