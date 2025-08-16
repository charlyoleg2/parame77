// trackXZ.ts
// simulation of train-capsule on XZ-track

import type {
	tContour,
	//tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	tPageDef
	//tExtrude
	//tVolume
	//tSubInst
	//tSubDesign
} from 'geometrix';
import {
	//withinZeroPi,
	//withinPiPi,
	//ShapePoint,
	point,
	contour,
	//contourCircle,
	ctrRectangle,
	figure,
	degToRad,
	radToDeg,
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
	partName: 'trackXZ',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('W1', 'mm', 1000, 10, 2000, 1),
		pNumber('T1', 'mm', 80, 1, 200, 1),
		pNumber('S1', 'mm', 200, 1, 500, 1),
		pNumber('B1', 'mm', 200, 2, 500, 1),
		pNumber('B2', 'mm', 300, 2, 1000, 1),
		pNumber('H1', 'mm', 100, 1, 500, 1),
		pNumber('H2', 'mm', 200, 1, 500, 1),
		pSectionSeparator('Slope'),
		pNumber('a1', '%', 5, -90, 90, 1),
		pNumber('a3', '%', 20, -90, 90, 1),
		pNumber('a5', '%', 2, -90, 90, 1),
		pNumber('L1', 'm', 30, 0.01, 200, 0.01),
		pNumber('L2', 'm', 5, 0.01, 200, 0.01),
		pNumber('L3', 'm', 20, 0.01, 200, 0.01),
		pNumber('L4', 'm', 3, 0.01, 200, 0.01),
		pNumber('L5', 'm', 20, 0.01, 200, 0.01)
	],
	paramSvg: {
		W1: 'trackXZ_section.svg',
		T1: 'trackXZ_section.svg',
		S1: 'trackXZ_top.svg',
		B1: 'trackXZ_top.svg',
		B2: 'trackXZ_top.svg',
		H1: 'trackXZ_side.svg',
		H2: 'trackXZ_side.svg',
		a1: 'trackXZ_slope.svg',
		a3: 'trackXZ_slope.svg',
		a5: 'trackXZ_slope.svg',
		L1: 'trackXZ_slope.svg',
		L2: 'trackXZ_slope.svg',
		L3: 'trackXZ_slope.svg',
		L4: 'trackXZ_slope.svg',
		L5: 'trackXZ_slope.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figBeam = figure();
	const figRail = figure();
	const figTop = figure();
	const figSection = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const pi2 = Math.PI / 2;
		const Ltot = param.L1 + param.L2 + param.L3 + param.L4 + param.L5;
		// conversion in meters
		const H1 = param.H1 / 1000; // m
		const H2 = param.H2 / 1000;
		const W12 = param.W1 / 2000;
		const T1 = param.T1 / 1000;
		const S1 = param.S1 / 1000;
		const Wbeam2 = param.B1 / 2000; // m
		const Lbeam2 = W12 + T1 + S1; // m
		const Bstep = (param.B1 + param.B2) / 1000; // m
		// slope angles
		const a1 = Math.asin(param.a1 / 100);
		const a3 = Math.asin(param.a3 / 100);
		const a5 = Math.asin(param.a5 / 100);
		const aMin = degToRad(0.1);
		const aDiff13 = Math.abs(a3 - a1);
		const aDiff35 = Math.abs(a5 - a3);
		const aDiffMax = Math.max(aDiff13, aDiff35);
		const a2 = a3 - a1;
		const a4 = a5 - a3;
		const r2 = Math.abs(param.L2 / a2);
		const r4 = Math.abs(param.L4 / a4);
		const pt0 = point(0, 0);
		const pt1 = pt0.translatePolar(a1, param.L1);
		const pt2c = pt1.translatePolar(a1 + Math.sign(a2) * pi2, r2);
		const pt2m = pt2c.translatePolar(a1 - Math.sign(a2) * pi2 + a2 / 2, r2);
		const pt2 = pt2c.translatePolar(a1 - Math.sign(a2) * pi2 + a2, r2);
		const pt3 = pt2.translatePolar(a3, param.L3);
		const pt4c = pt3.translatePolar(a3 + Math.sign(a4) * pi2, r4);
		const pt4m = pt4c.translatePolar(a3 - Math.sign(a4) * pi2 + a4 / 2, r4);
		const pt4 = pt4c.translatePolar(a3 - Math.sign(a4) * pi2 + a4, r4);
		const pt5 = pt4.translatePolar(a5, param.L5);
		const ava = Math.atan2(pt5.cy, pt5.cx);
		const avp = 100 * Math.sin(ava);
		const N0r = Bstep - Wbeam2;
		const N1 = Math.floor(N0r + param.L1 / Bstep);
		const N1r = N0r + param.L1 - N1 * Bstep;
		const N1ra = N1r / r2;
		const a2s = Bstep / r2;
		const N2 = Math.floor((N1r + param.L2) / Bstep);
		const N2r = N1r + param.L2 - N2 * Bstep;
		const N3 = Math.floor((N2r + param.L3) / Bstep);
		const N3r = N2r + param.L3 - N3 * Bstep;
		const N3ra = N3r / r4;
		const a4s = Bstep / r4;
		const N4 = Math.floor((N3r + param.L4) / Bstep);
		const N4r = N3r + param.L4 - N4 * Bstep;
		const N5 = Math.floor((N4r + param.L5) / Bstep);
		const beamNb = N1 + N2 + N3 + N4 + N5;
		const beamNb2 = Math.floor((N0r + Ltot) / Bstep);
		const H12 = H1 + H2;
		//const N5r = N4r + param.L5 - N5 * Bstep;
		// step-5 : checks on the parameter values
		if (aDiff13 < aMin) {
			throw `err107: a1 ${ffix(param.a1)} and a3 ${ffix(param.a3)} (degree) are too closed`;
		}
		if (aDiff35 < aMin) {
			throw `err107: a3 ${ffix(param.a3)} and a5 ${ffix(param.a5)} (degree) are too closed`;
		}
		// step-6 : any logs
		rGeome.logstr += `Slope length: ${ffix(Ltot)}, X ${ffix(pt5.cx)} Y ${ffix(pt5.cy)} m, average ${ffix(avp)} % ${ffix(radToDeg(ava))} degree\n`;
		rGeome.logstr += `Slope max transition: aDiffMax ${ffix(radToDeg(aDiffMax))} degree\n`;
		rGeome.logstr += `Beam number: ${beamNb} ${beamNb2}, size: ${ffix(2 * Lbeam2)} x ${ffix(2 * Wbeam2)} m\n`;
		// sub-function
		function ctrBeam(ix: number, iy: number, ia: number): tContour {
			const pt = point(ix, iy).translatePolar(ia + 2 * pi2, Wbeam2);
			const rCtr = contour(pt.cx, pt.cy)
				.addSegStrokeRP(ia, 2 * Wbeam2)
				.addSegStrokeRP(ia + pi2, H1)
				.addSegStrokeRP(ia + 2 * pi2, 2 * Wbeam2)
				.addSegStrokeRP(ia - pi2, H1)
				.closeSegStroke();
			return rCtr;
		}
		// figSection
		figSection.addSecond(ctrRectangle(-Lbeam2, 0, 2 * Lbeam2, H1));
		figSection.addMainO(ctrRectangle(-Lbeam2 + S1, H1, T1, H2));
		figSection.addMainO(ctrRectangle(W12, H1, T1, H2));
		// figTop
		for (let ii = 0; ii < 11; ii++) {
			figTop.addSecond(ctrRectangle(ii * Bstep, -Lbeam2, 2 * Wbeam2, 2 * Lbeam2));
		}
		figTop.addMainO(ctrRectangle(0, W12, 2 * Wbeam2 + 10 * Bstep, T1));
		figTop.addMainO(ctrRectangle(0, -W12 - T1, 2 * Wbeam2 + 10 * Bstep, T1));
		// figBeam
		const ctrGround = contour(pt0.cx, pt0.cy)
			.addSegStrokeA(pt1.cx, pt1.cy)
			.addPointA(pt2m.cx, pt2m.cy)
			.addPointA(pt2.cx, pt2.cy)
			.addSegArc2()
			.addSegStrokeA(pt3.cx, pt3.cy)
			.addPointA(pt4m.cx, pt4m.cy)
			.addPointA(pt4.cx, pt4.cy)
			.addSegArc2()
			.addSegStrokeA(pt5.cx, pt5.cy);
		figBeam.addSecond(ctrGround);
		for (let ii = 0; ii < N1; ii++) {
			const pp = pt0.translatePolar(a1, (ii + 1) * Bstep - N0r);
			figBeam.addMainO(ctrBeam(pp.cx, pp.cy, a1));
		}
		for (let ii = 0; ii < N2; ii++) {
			const ai = a1 + Math.sign(a2) * (-pi2 + (ii + 1) * a2s - N1ra);
			const pp = pt2c.translatePolar(ai, r2);
			figBeam.addMainO(ctrBeam(pp.cx, pp.cy, ai + Math.sign(a2) * pi2));
		}
		for (let ii = 0; ii < N3; ii++) {
			const pp = pt2.translatePolar(a3, (ii + 1) * Bstep - N2r);
			figBeam.addMainO(ctrBeam(pp.cx, pp.cy, a3));
		}
		for (let ii = 0; ii < N4; ii++) {
			const ai = a3 + Math.sign(a4) * (-pi2 + (ii + 1) * a4s - N3ra);
			const pp = pt4c.translatePolar(ai, r4);
			figBeam.addMainO(ctrBeam(pp.cx, pp.cy, ai + Math.sign(a4) * pi2));
		}
		for (let ii = 0; ii < N5; ii++) {
			const pp = pt4.translatePolar(a5, (ii + 1) * Bstep - N4r);
			figBeam.addMainO(ctrBeam(pp.cx, pp.cy, a5));
		}
		// figRail
		figRail.mergeFigure(figBeam, true);
		const pr0 = pt0.translatePolar(a1 + pi2, H1);
		const pr0b = pt0.translatePolar(a1 + pi2, H12);
		const pr1 = pt1.translatePolar(a1 + pi2, H1);
		const pr1b = pt1.translatePolar(a1 + pi2, H12);
		const pr2m = pt2m.translatePolar((a1 + a3) / 2 + pi2, H1);
		const pr2mb = pt2m.translatePolar((a1 + a3) / 2 + pi2, H12);
		const pr2 = pt2.translatePolar(a3 + pi2, H1);
		const pr2b = pt2.translatePolar(a3 + pi2, H12);
		const pr3 = pt3.translatePolar(a3 + pi2, H1);
		const pr3b = pt3.translatePolar(a3 + pi2, H12);
		const pr4m = pt4m.translatePolar((a3 + a5) / 2 + pi2, H1);
		const pr4mb = pt4m.translatePolar((a3 + a5) / 2 + pi2, H12);
		const pr4 = pt4.translatePolar(a5 + pi2, H1);
		const pr4b = pt4.translatePolar(a5 + pi2, H12);
		const pr5 = pt5.translatePolar(a5 + pi2, H1);
		const pr5b = pt5.translatePolar(a5 + pi2, H12);
		const ctrRail = contour(pr0.cx, pr0.cy)
			.addSegStrokeA(pr1.cx, pr1.cy)
			.addPointA(pr2m.cx, pr2m.cy)
			.addPointA(pr2.cx, pr2.cy)
			.addSegArc2()
			.addSegStrokeA(pr3.cx, pr3.cy)
			.addPointA(pr4m.cx, pr4m.cy)
			.addPointA(pr4.cx, pr4.cy)
			.addSegArc2()
			.addSegStrokeA(pr5.cx, pr5.cy)
			.addSegStrokeA(pr5b.cx, pr5b.cy)
			.addSegStrokeA(pr4b.cx, pr4b.cy)
			.addPointA(pr4mb.cx, pr4mb.cy)
			.addPointA(pr3b.cx, pr3b.cy)
			.addSegArc2()
			.addSegStrokeA(pr2b.cx, pr2b.cy)
			.addPointA(pr2mb.cx, pr2mb.cy)
			.addPointA(pr1b.cx, pr1b.cy)
			.addSegArc2()
			.addSegStrokeA(pr0b.cx, pr0b.cy)
			.closeSegStroke();
		figRail.addMainO(ctrRail);
		figBeam.addSecond(ctrRail);
		// final figure list
		rGeome.fig = {
			faceBeam: figBeam,
			faceRail: figRail,
			faceTop: figTop,
			faceSection: figSection
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_beam`,
					face: `${designName}_faceBeam`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: 2 * Lbeam2,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_rail1`,
					face: `${designName}_faceRail`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: T1,
					rotate: [0, 0, 0],
					translate: [0, 0, S1]
				},
				{
					outName: `subpax_${designName}_rail2`,
					face: `${designName}_faceRail`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: T1,
					rotate: [0, 0, 0],
					translate: [0, 0, Lbeam2 + W12]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [
						`subpax_${designName}_beam`,
						`subpax_${designName}_rail1`,
						`subpax_${designName}_rail2`
					]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'trackXZ drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const trackXZDef: tPageDef = {
	pTitle: 'trackXZ',
	pDescription: 'simulation of train-capsule on XZ-track',
	pDef: pDef,
	pGeom: pGeom
};

export { trackXZDef };
