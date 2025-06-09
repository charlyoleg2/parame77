// rccar.ts
// high-level concept of the rc-car

import type {
	tContour,
	//tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	tPageDef,
	tExtrude
	//tSubInst
	//tSubDesign
} from 'geometrix';
import {
	//withinZeroPi,
	withinHPiHPi,
	ShapePoint,
	point,
	contour,
	contourCircle,
	ctrRectangle,
	figure,
	degToRad,
	//radToDeg,
	ffix,
	pNumber,
	pCheckbox,
	pDropdown,
	pSectionSeparator,
	//transform2d,
	transform3d,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';
//import { triLALrL, triALLrL, triLLLrA } from 'triangule';
//import { triALLrL } from 'triangule';

const pDef: tParamDef = {
	partName: 'rccar',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('N1', 'unit', 4, 1, 12, 1),
		pNumber('L1', 'mm', 300, 10, 2000, 1),
		pNumber('W1', 'mm', 1200, 10, 2000, 1),
		pSectionSeparator('General'),
		pDropdown('gen3D', ['all', 'platform', 'bone', 'hand', 'motor', 'wheel']),
		pNumber('T1', 'mm', 10, 1, 100, 1),
		pNumber('E1', 'mm', 10, 1, 100, 1),
		pNumber('E2', 'mm', 10, 1, 500, 1),
		pNumber('E3', 'mm', 30, 1, 500, 1),
		pSectionSeparator('Platform'),
		pNumber('H1', 'mm', 230, 10, 2000, 1),
		pNumber('W2', 'mm', 100, 10, 2000, 1),
		pCheckbox('triangleInt', true),
		pCheckbox('triangleExt', false),
		pSectionSeparator('Bone'),
		pNumber('D1', 'mm', 20, 1, 200, 1),
		pNumber('D2', 'mm', 40, 1, 200, 1),
		pNumber('W3', 'mm', 30, 1, 200, 1),
		pNumber('L2', 'mm', 150, 1, 200, 1),
		pSectionSeparator('Unit'),
		pNumber('F1', 'mm', 180, 1, 1000, 1),
		pNumber('Dwheel', 'mm', 250, 10, 2000, 1),
		pNumber('Z1', 'mm', 100, 10, 2000, 1),
		pNumber('Z2', 'mm', 160, 10, 2000, 1),
		pNumber('Lwheel', 'mm', 100, 10, 2000, 1),
		pNumber('Lmotor', 'mm', 140, 10, 1000, 1),
		pNumber('Dsteering', 'mm', 40, 1, 500, 1),
		pNumber('Daxis', 'mm', 20, 1, 500, 1),
		pSectionSeparator('Angles'),
		pNumber('aBoneMin', 'degree', -40, -80, 0, 1),
		pNumber('aBoneMax', 'degree', 20, -80, 80, 1),
		pNumber('aBoneLeft', '%', 0, 0, 100, 1),
		pNumber('aBoneRight', '%', 0, 0, 100, 1),
		pDropdown('wheel', ['straight', 'turn']),
		pNumber('ra', 'degree', 0, -90, 90, 1),
		pNumber('rx', 'cm', 0, -1000, 1000, 1),
		pNumber('ry', 'cm', 0, -1000, 1000, 1)
	],
	paramSvg: {
		N1: 'rccar_all_xy.svg',
		L1: 'rccar_all_xy.svg',
		W1: 'rccar_all_xz.svg',
		gen3D: 'rccar_all_xy.svg',
		T1: 'rccar_one_xy.svg',
		E1: 'rccar_one_xy.svg',
		E2: 'rccar_motor_xz.svg',
		E3: 'rccar_motor_xz.svg',
		H1: 'rccar_platform_xz.svg',
		W2: 'rccar_platform_xz.svg',
		triangleInt: 'rccar_all_xy.svg',
		triangleExt: 'rccar_all_xy.svg',
		D1: 'rccar_bone.svg',
		D2: 'rccar_bone.svg',
		W3: 'rccar_bone.svg',
		L2: 'rccar_bone.svg',
		F1: 'rccar_one_xy.svg',
		Dwheel: 'rccar_motor_xz.svg',
		Z1: 'rccar_motor_xz.svg',
		Z2: 'rccar_motor_xz.svg',
		Lwheel: 'rccar_motor_xz.svg',
		Lmotor: 'rccar_motor_xz.svg',
		Dsteering: 'rccar_motor_xz.svg',
		Daxis: 'rccar_motor_xz.svg',
		aBoneMin: 'rccar_all_xz.svg',
		aBoneMax: 'rccar_all_xz.svg',
		aBoneLeft: 'rccar_all_xz.svg',
		aBoneRight: 'rccar_all_xz.svg',
		wheel: 'rccar_all_xy.svg',
		ra: 'rccar_all_xy.svg',
		rx: 'rccar_all_xy.svg',
		ry: 'rccar_all_xy.svg'
	},
	sim: {
		tMax: 200,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figPlatform = figure();
	const figTriangle = figure();
	const figPFfixation = figure();
	const figBones = figure();
	const figHandFixation = figure();
	const figHandPlateR = figure();
	const figHandPlateL = figure();
	const figHandBackR = figure();
	const figHandBackL = figure();
	const figMotorBulkR = figure();
	const figMotorBulkL = figure();
	const figMFoot = figure();
	const figWheel = figure();
	const figTop = figure();
	const figSide = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const pi = Math.PI;
		const pi2 = pi / 2;
		const W12 = param.W1 / 2;
		const W22 = param.W2 / 2;
		const H1b = param.H1 - param.T1;
		const W22b = W12 - W22;
		const W2c = param.W2 - 2 * param.T1;
		const H1c = param.H1 - 2 * param.T1;
		const Ltotal = param.N1 * (param.L1 + param.T1) + param.T1;
		const platSurface = (Ltotal * param.W1) / 10 ** 6;
		const R2 = param.D2 / 2;
		const R1 = param.D1 / 2;
		const F12 = param.F1 / 2;
		const LF2 = (param.L1 - param.F1) / 2;
		const LF2b = LF2 + param.T1 + param.E1;
		const LF23 = LF2 + 2 * (param.T1 + param.E1);
		const LF24 = LF23 + param.T1;
		const F1b = param.F1 - 6 * param.T1 - 4 * param.E1;
		const LF25 = LF24 + F1b;
		const LF25b = LF25 + param.T1 + param.E1;
		const LF28 = LF25 + 2 * (param.T1 + param.E1);
		const Rwheel = param.Dwheel / 2;
		const Raxis = param.Daxis / 2;
		const Rsteering = param.Dsteering / 2;
		const Z2b = param.Z2 - 4 * R2;
		const Z2c = param.Z2 - param.T1;
		const AbMin = degToRad(param.aBoneMin);
		const AbMax = degToRad(param.aBoneMax);
		const posZplatform = Rwheel + param.Z1 + param.L2 * Math.sin(AbMin);
		const Hplatform = posZplatform + param.H1;
		const W32 = param.W3 / 2;
		if (R2 < W32) {
			throw `err152: D2 ${ffix(param.D2)} is too small compare to W3 ${ffix(param.W3)} mm`;
		}
		const W32X = Math.sqrt(R2 ** 2 - W32 ** 2);
		const L2b = param.L2 - 2 * W32X;
		function calcPercent(aInit: number): number {
			const percent2 = (aInit + t) % 200;
			const rP = percent2 > 100 ? 200 - percent2 : percent2;
			return rP / 100;
		}
		const aBR = AbMin + calcPercent(param.aBoneRight) * (AbMax - AbMin);
		const aBL = pi - AbMin - calcPercent(param.aBoneLeft) * (AbMax - AbMin);
		const boneTopxRs = param.L2 * Math.cos(aBR);
		const boneTopxLs = param.L2 * Math.cos(aBL);
		const boneTopxR = 2 * R2 + boneTopxRs;
		const boneTopxL = 2 * R2 - boneTopxLs;
		const boneSideyRs = param.L2 * Math.sin(aBR);
		const boneSideyLs = param.L2 * Math.sin(aBL);
		const boneSideyR = 2 * R2 * Math.sign(aBR) + boneSideyRs;
		//const boneSideyL = 2 * R2 * Math.sign(aBL) + boneSideyLs;
		const ra = degToRad(param.ra);
		const rx10 = 10 * param.rx;
		const ry10 = 10 * param.ry;
		const hPlen = 2 * F12 + param.E2 + param.T1;
		const hFposR = W22 + param.E2 + R2 + boneTopxRs - R2;
		const hFposL = -W22 - param.E2 - R2 + boneTopxLs - R2 - param.E2;
		const hBposR = W22 + 2 * (param.E2 + R2) + boneTopxRs;
		const hBposL = -W22 - 2 * (param.E2 + R2) + boneTopxLs;
		const hPposR = W22 + 2 * (param.E2 + R2) + boneTopxRs + param.T1 + param.E2 + F12;
		const hPposL = -W22 - 2 * (param.E2 + R2) + boneTopxLs - param.T1 - param.E2 - F12;
		let wheelRA = new Array<number>(param.N1).fill(ra);
		let wheelLA = new Array<number>(param.N1).fill(pi + ra);
		function adjustWheelAngle(dY: number, dX: number, ref: number): number {
			const rawA = Math.atan2(dY, dX);
			const rA = ref + withinHPiHPi(rawA - ref);
			return rA;
		}
		if (param.wheel === 1) {
			const tWheelRA: number[] = [];
			const tWheelLA: number[] = [];
			const bTxs = param.L2 * Math.cos(AbMin);
			const XpR = W22 + 2 * (param.E2 + R2) + bTxs + param.T1 + param.E2 + F12;
			const XpL = -W22 - 2 * (param.E2 + R2) - bTxs - param.T1 - param.E2 - F12;
			for (let ii = 0; ii < param.N1; ii++) {
				const Yp = ii * (param.L1 + param.T1) + param.T1 + param.L1 / 2;
				tWheelRA.push(adjustWheelAngle(Yp - ry10, XpR - rx10, 0));
				tWheelLA.push(adjustWheelAngle(Yp - ry10, XpL - rx10, pi));
			}
			wheelRA = tWheelRA;
			wheelLA = tWheelLA;
		}
		const motorExtraL = param.Lmotor - F12;
		const motorHeight = param.Z2 - 2 * (param.T1 + param.E1);
		const motorLen = F12 + param.Lmotor;
		const mFootWidth = motorExtraL - param.E2;
		const mFootR = Raxis + param.E1 + param.T1;
		const mFootHeight = motorHeight + param.E1 + param.T1 + param.Z1 + mFootR;
		const dWheelAxis = Rwheel - Raxis;
		const roundedWheel = Math.min(param.Lwheel / 3, dWheelAxis / 2);
		// step-5 : checks on the parameter values
		if (LF2 < 0.1) {
			throw `err176: L1 ${ffix(param.L1)} is too small compare to F1 ${ffix(param.F1)} mm`;
		}
		if (param.H1 < param.Z2 + param.T1) {
			throw `err130: H1 ${ffix(param.H1)} is too small compare to Z2 ${ffix(param.Z2)} and T1 ${ffix(param.T1)} mm`;
		}
		if (Z2b < 0.1) {
			throw `err149: Z2 ${ffix(param.Z2)} is too small compare to D2 ${ffix(param.D2)} mm`;
		}
		if (W2c < 0.1) {
			throw `err153: W2 ${ffix(param.W2)} is too small compare to T1 ${ffix(param.T1)} mm`;
		}
		if (H1c < 0.1) {
			throw `err156: H1c ${ffix(param.H1)} is too small compare to T1 ${ffix(param.T1)} mm`;
		}
		if (F1b < 0.1) {
			throw `err167: F1 ${ffix(param.F1)} is too small compare to T1 ${ffix(param.T1)} and E1 ${ffix(param.E1)} mm`;
		}
		if (AbMax < AbMin) {
			throw `err181: aBoneMax ${ffix(param.aBoneMax)} is too small compare to aBoneMin ${ffix(param.BoneMin)} degree`;
		}
		if (mFootWidth < param.T1) {
			throw `err218: Lmotor ${ffix(param.Lmotor)} is too small compare to F1 ${ffix(param.F1)}`;
		}
		if (motorHeight < param.T1) {
			throw `err226: Z2 ${ffix(param.Z2)} is too small compare to T1 ${ffix(param.T1)} and E1 ${ffix(param.E1)} mm`;
		}
		if (param.Z1 < mFootR) {
			throw `err256: Z1 ${ffix(param.Z1)} is too small compare to mFootR ${ffix(mFootR)} mm`;
		}
		if (Rwheel < mFootR) {
			throw `err259: Dwheel ${ffix(param.Dwheel)} is too small compare to mFootR ${ffix(mFootR)} mm`;
		}
		// step-6 : any logs
		rGeome.logstr += `Platform Ltotal ${ffix(Ltotal / 1000)} m, surface ${ffix(platSurface)} m2\n`;
		rGeome.logstr += `Hplatform ${ffix(Hplatform)} mm\n`;
		// step-7 : drawing of the figures
		// sub-function
		// figPlatform
		const ctrPlatformMain = contour(-W22, 0)
			.addSegStrokeR(param.W2, 0)
			.addSegStrokeR(0, H1b)
			.addSegStrokeR(W22b, 0)
			.addSegStrokeR(0, param.T1)
			.addSegStrokeR(-param.W1, 0)
			.addSegStrokeR(0, -param.T1)
			.addSegStrokeR(W22b, 0)
			.closeSegStroke();
		const ctrPlatformInt = ctrRectangle(-W22 + param.T1, param.T1, W2c, H1c);
		figPlatform.addMainOI([ctrPlatformMain, ctrPlatformInt]);
		const ctrTriangleL = contour(-W22, 0)
			.addSegStrokeR(param.T1, 0)
			.addSegStrokeR(0, param.H1)
			.addSegStrokeR(-W22b - param.T1, 0)
			.addSegStrokeR(0, -param.T1)
			.closeSegStroke();
		const ctrTriangleR = contour(W22, 0)
			.addSegStrokeR(W22b, H1b)
			.addSegStrokeR(0, param.T1)
			.addSegStrokeR(-W22b - param.T1, 0)
			.addSegStrokeR(0, -param.H1)
			.closeSegStroke();
		figTriangle.addMainO(ctrTriangleL);
		figTriangle.addMainO(ctrTriangleR);
		figPlatform.addSecond(ctrTriangleL);
		figPlatform.addSecond(ctrTriangleR);
		// figPFfixation
		function makePFfixExt(sign: number, tpA: number, tpL: number): tContour[] {
			const dW22 = sign * (W22 - param.T1);
			const dW22b = -sign * (W22 + 2 * (param.E2 + R2) + param.T1);
			const dW22c = tpL > 0 ? dW22b : dW22;
			const dx1 = sign * (param.E2 + R2);
			const dx2 = sign * param.T1 + dx1;
			const dR2 = sign * R2;
			const dW22d = tpL > 0 ? -dW22 - dx2 : dW22 + dx2;
			const rCtrExt = contour(dW22c, 0, 'green')
				.addSegStrokeR(dx2, 0)
				.addPointR(dR2, R2)
				.addPointR(0, 2 * R2)
				.addSegArc2()
				.addSegStrokeR(-dx1, 0)
				.addSegStrokeR(0, Z2b)
				.addSegStrokeR(dx1, 0)
				.addPointR(dR2, R2)
				.addPointR(0, 2 * R2)
				.addSegArc2()
				.addSegStrokeR(-dx2, 0)
				.closeSegStroke()
				.translatePolar(tpA, tpL);
			const rCtr1 = contourCircle(dW22d, R2, R1).translatePolar(tpA, tpL);
			const rCtr2 = contourCircle(dW22d, Z2b + 3 * R2, R1).translatePolar(tpA, tpL);
			return [rCtrExt, rCtr1, rCtr2];
		}
		figPFfixation.addMainOI(makePFfixExt(1, 0, 0));
		figPFfixation.addMainOI(makePFfixExt(-1, 0, 0));
		figPlatform.mergeFigure(figPFfixation, true);
		// figBones
		const ctrBone = contour(W32X, W32)
			.addPointR(-W32X - R2, -W32)
			.addPointR(0, -2 * W32)
			.addSegArc2()
			.addSegStrokeR(L2b, 0)
			.addPointR(W32X + R2, W32)
			.addPointR(0, 2 * W32)
			.addSegArc2()
			.closeSegStroke();
		const ctrBoneR = ctrBone.rotate(0, 0, aBR);
		const ctrBoneL = ctrBone.rotate(0, 0, aBL);
		const ptR1 = point(W22 + param.E2 + R2, R2);
		const ptR1b = ptR1.translatePolar(aBR, param.L2);
		const ptR2 = point(W22 + param.E2 + R2, Z2b + 3 * R2);
		const ptR2b = ptR2.translatePolar(aBR, param.L2);
		const ptL1 = point(-W22 - param.E2 - R2, R2);
		const ptL1b = ptL1.translatePolar(aBL, param.L2);
		const ptL2 = point(-W22 - param.E2 - R2, Z2b + 3 * R2);
		const ptL2b = ptL2.translatePolar(aBL, param.L2);
		figBones.addMainOI([
			ctrBoneR.translate(ptR1.cx, ptR1.cy),
			contourCircle(ptR1.cx, ptR1.cy, R1),
			contourCircle(ptR1b.cx, ptR1b.cy, R1)
		]);
		figBones.addMainOI([
			ctrBoneR.translate(ptR2.cx, ptR2.cy),
			contourCircle(ptR2.cx, ptR2.cy, R1),
			contourCircle(ptR2b.cx, ptR2b.cy, R1)
		]);
		figBones.addMainOI([
			ctrBoneL.translate(ptL1.cx, ptL1.cy),
			contourCircle(ptL1.cx, ptL1.cy, R1),
			contourCircle(ptL1b.cx, ptL1b.cy, R1)
		]);
		figBones.addMainOI([
			ctrBoneL.translate(ptL2.cx, ptL2.cy),
			contourCircle(ptL2.cx, ptL2.cy, R1),
			contourCircle(ptL2b.cx, ptL2b.cy, R1)
		]);
		figPlatform.mergeFigure(figBones, true);
		// figHandFixation
		figHandFixation.addMainOI(makePFfixExt(-1, aBR, param.L2));
		figHandFixation.addMainOI(makePFfixExt(1, aBL, param.L2));
		figPlatform.mergeFigure(figHandFixation, true);
		// figHandPlateR figHandPlateL
		function makeHandPlate(az: number, addL: number, ipX: number, ipY: number): tContour[] {
			const rCtrExt = contour(ipX, ipY + F12)
				.addPointR(-F12, -F12)
				.addPointR(0, -2 * F12)
				.addSegArc2()
				.addSegStrokeR(F12 + addL, 0)
				.addSegStrokeR(0, 2 * F12)
				.closeSegStroke()
				.rotate(ipX, ipY, az);
			const rCtrHole = contourCircle(ipX, ipY, Rsteering);
			return [rCtrExt, rCtrHole];
		}
		for (let ii = 0; ii < param.N1; ii++) {
			const tPosY = ii * (param.L1 + param.T1) + param.T1 + param.L1 / 2;
			figHandPlateR.addMainOI(makeHandPlate(pi, param.T1 + param.E2, hPposR, tPosY));
			figHandPlateL.addMainOI(makeHandPlate(0, param.T1 + param.E2, hPposL, tPosY));
		}
		figPlatform.addSecond(ctrRectangle(hBposR, boneSideyRs, hPlen, param.T1));
		figPlatform.addSecond(ctrRectangle(hBposR, boneSideyRs + Z2c, hPlen, param.T1));
		figPlatform.addSecond(ctrRectangle(hBposL - hPlen, boneSideyLs, hPlen, param.T1));
		figPlatform.addSecond(ctrRectangle(hBposL - hPlen, boneSideyLs + Z2c, hPlen, param.T1));
		// figHandBackR figHandBackL
		for (let ii = 0; ii < param.N1; ii++) {
			const tPosY = ii * (param.L1 + param.T1) + param.T1 + LF2;
			figHandBackR.addMainO(ctrRectangle(hBposR, tPosY, param.T1, 2 * F12));
			figHandBackL.addMainO(ctrRectangle(hBposL - param.T1, tPosY, param.T1, 2 * F12));
		}
		figPlatform.addSecond(ctrRectangle(hBposR, boneSideyRs, param.T1, param.Z2));
		figPlatform.addSecond(ctrRectangle(hBposL - param.T1, boneSideyLs, param.T1, param.Z2));
		// figMotorBulkR figMotorBulkL
		for (let ii = 0; ii < param.N1; ii++) {
			const tPosY = ii * (param.L1 + param.T1) + param.T1 + param.L1 / 2;
			figMotorBulkR.addMainOI(makeHandPlate(wheelRA[ii], motorExtraL, hPposR, tPosY));
			figMotorBulkL.addMainOI(makeHandPlate(wheelLA[ii], motorExtraL, hPposL, tPosY));
		}
		const mBRpX = hBposR + param.T1 + param.E2;
		const mBRpY = boneSideyRs + param.T1 + param.E1;
		const mBLpX = hBposL - param.T1 - param.E2 - motorLen;
		const mBLpY = boneSideyLs + param.T1 + param.E1;
		figPlatform.addSecond(ctrRectangle(mBRpX, mBRpY, motorLen, motorHeight));
		figPlatform.addSecond(ctrRectangle(mBLpX, mBLpY, motorLen, motorHeight));
		const mFRpX = mBRpX + F12 + param.Lmotor - mFootWidth;
		const mFRpY = boneSideyRs - param.Z1 - mFootR;
		const mFLpX = mBLpX;
		const mFLpY = boneSideyLs - param.Z1 - mFootR;
		figPlatform.addSecond(ctrRectangle(mFRpX, mFRpY, mFootWidth, mFootHeight));
		figPlatform.addSecond(ctrRectangle(mFLpX, mFLpY, mFootWidth, mFootHeight));
		// figMFoot
		function makeMFoot(itx: number, ity: number): tContour[] {
			const rCtrExt = contour(itx - mFootR, ity, 'green')
				.addPointR(mFootR, -mFootR)
				.addPointR(2 * mFootR, 0)
				.addSegArc2()
				.addSegStrokeR(F12 - mFootR, param.Z1 + param.T1 + param.E1)
				.addSegStrokeR(0, motorHeight)
				.addSegStrokeR(-2 * F12, 0)
				.addSegStrokeR(0, -motorHeight)
				.closeSegStroke();
			const rCtrHole = contourCircle(itx, ity, Raxis + param.E1);
			return [rCtrExt, rCtrHole];
		}
		figMFoot.addMainOI(makeMFoot(0, 0));
		// figWheel
		function makeCtrWheel(xSign: number, ia: number, itx: number, ity: number): tContour {
			const rCtr = contour(itx, ity)
				.addSegStrokeR(xSign * Raxis, 0)
				.addSegStrokeR(0, mFootWidth + param.E3)
				.addSegStrokeR(xSign * dWheelAxis, 0)
				.addCornerRounded(roundedWheel)
				.addSegStrokeR(0, param.Lwheel)
				.addCornerRounded(roundedWheel)
				.addSegStrokeR(-xSign * Rwheel, 0)
				.closeSegStroke()
				.rotate(itx, ity, ia);
			return rCtr;
		}
		figWheel.addMainO(makeCtrWheel(1, 0, 0, 0));
		figWheel.addSecond(makeCtrWheel(-1, 0, 0, 0));
		figPlatform.addSecond(makeCtrWheel(1, -pi2, mFRpX, mFRpY + mFootR));
		figPlatform.addSecond(makeCtrWheel(-1, -pi2, mFRpX, mFRpY + mFootR));
		figPlatform.addSecond(makeCtrWheel(1, pi2, mFLpX + mFootWidth, mFLpY + mFootR));
		figPlatform.addSecond(makeCtrWheel(-1, pi2, mFLpX + mFootWidth, mFLpY + mFootR));
		// figTop
		figTop.addMainOI([
			ctrRectangle(-W12, 0, param.W1, Ltotal),
			ctrRectangle(-W22 + param.T1, 0, W2c, Ltotal)
		]);
		figTop.addSecond(ctrRectangle(-W22, 0, param.W2, Ltotal));
		if (param.triangleExt) {
			for (let ii = 0; ii < 2; ii++) {
				const tPosY = ii * (param.L1 + param.T1) * param.N1;
				figTop.addSecond(ctrRectangle(-W12, tPosY, W22b, param.T1));
				figTop.addSecond(ctrRectangle(W22, tPosY, W22b, param.T1));
			}
		}
		if (param.triangleInt) {
			for (let ii = 1; ii < param.N1; ii++) {
				const tPosY = ii * (param.L1 + param.T1);
				figTop.addSecond(ctrRectangle(-W12, tPosY, W22b, param.T1));
				figTop.addSecond(ctrRectangle(W22, tPosY, W22b, param.T1));
			}
		}
		// figTop platform fixation
		const tL2 = param.E2 + 2 * R2;
		const tPosX2 = -W22 - tL2;
		for (let ii = 0; ii < param.N1; ii++) {
			const tPosY = param.T1 + ii * (param.L1 + param.T1);
			for (const tPosY2 of [LF2, LF23, LF25, LF28]) {
				const tPosY3 = tPosY + tPosY2;
				figTop.addSecond(ctrRectangle(W22, tPosY3, tL2, param.T1));
				figTop.addSecond(ctrRectangle(tPosX2, tPosY3, tL2, param.T1));
			}
		}
		// figTop bones
		const tPosX3 = -W22 - param.E2 - boneTopxL;
		for (let ii = 0; ii < param.N1; ii++) {
			const tPosY = param.T1 + ii * (param.L1 + param.T1);
			for (const tPosY2 of [LF2, LF25]) {
				const tPosY3 = tPosY + tPosY2 + param.T1 + param.E1;
				figTop.addSecond(ctrRectangle(W22 + param.E2, tPosY3, boneTopxR, param.T1));
				figTop.addSecond(ctrRectangle(tPosX3, tPosY3, boneTopxL, param.T1));
			}
		}
		// figTop hand fixation
		for (let ii = 0; ii < param.N1; ii++) {
			const tPosY = param.T1 + ii * (param.L1 + param.T1);
			for (const tPosY2 of [LF2, LF23, LF25, LF28]) {
				const tPosY3 = tPosY + tPosY2;
				figTop.addSecond(ctrRectangle(hFposR, tPosY3, tL2, param.T1));
				figTop.addSecond(ctrRectangle(hFposL, tPosY3, tL2, param.T1));
			}
		}
		// figTop hand plate
		figTop.mergeFigure(figHandPlateR, true);
		figTop.mergeFigure(figHandPlateL, true);
		figTop.mergeFigure(figHandBackR, true);
		figTop.mergeFigure(figHandBackL, true);
		figTop.mergeFigure(figMotorBulkR, true);
		figTop.mergeFigure(figMotorBulkL, true);
		figTop.addPoint(point(rx10, ry10, ShapePoint.eBigSquare));
		// figTop wheel
		function makeTopWheel(itx: number, ity: number, ia: number): tContour[] {
			const tL = param.Lmotor - mFootWidth;
			const tCos = tL * Math.cos(ia);
			const tSin = tL * Math.sin(ia);
			const ctrWheel1 = makeCtrWheel(1, -pi2 + ia, itx + tCos, ity + tSin);
			const ctrWheel2 = makeCtrWheel(-1, -pi2 + ia, itx + tCos, ity + tSin);
			const ctrMFootPre = ctrRectangle(itx + tL, ity - F12, mFootWidth, 2 * F12);
			const ctrMFoot = ctrMFootPre.rotate(itx, ity, ia);
			return [ctrWheel1, ctrWheel2, ctrMFoot];
		}
		for (let ii = 0; ii < param.N1; ii++) {
			const tPosY = ii * (param.L1 + param.T1) + param.T1 + param.L1 / 2;
			for (const iCtr of makeTopWheel(hPposR, tPosY, wheelRA[ii])) {
				figTop.addSecond(iCtr); // motor-foot and wheel : right
			}
			for (const iCtr of makeTopWheel(hPposL, tPosY, wheelLA[ii])) {
				figTop.addSecond(iCtr); // motor-foot and wheel : left
			}
		}
		// figSide
		figSide.addMainO(ctrRectangle(0, 0, Ltotal, param.H1));
		figSide.addSecond(ctrRectangle(0, H1b, Ltotal, param.T1));
		if (param.triangleExt) {
			for (let ii = 0; ii < 2; ii++) {
				const tPosY = ii * (param.L1 + param.T1) * param.N1;
				figSide.addSecond(ctrRectangle(tPosY, 0, param.T1, H1b));
			}
		}
		if (param.triangleInt) {
			for (let ii = 1; ii < param.N1; ii++) {
				const tPosY = ii * (param.L1 + param.T1);
				figSide.addSecond(ctrRectangle(tPosY, 0, param.T1, H1b));
			}
		}
		// figSide platform fixation
		const tH2 = 2 * R2;
		for (let ii = 0; ii < param.N1; ii++) {
			const tPosY = param.T1 + ii * (param.L1 + param.T1);
			for (const tPosY2 of [LF2, LF23, LF25, LF28]) {
				const tPosY3 = tPosY + tPosY2;
				figSide.addSecond(ctrRectangle(tPosY3, 0, param.T1, tH2));
				figSide.addSecond(ctrRectangle(tPosY3, tH2 + Z2b, param.T1, tH2));
			}
		}
		// figSide bone
		for (let ii = 0; ii < param.N1; ii++) {
			const tPosY = param.T1 + ii * (param.L1 + param.T1);
			for (const tPosY2 of [LF2, LF25]) {
				const tPosY3 = tPosY + tPosY2 + param.T1 + param.E1;
				if (boneSideyR > 0) {
					figSide.addSecond(ctrRectangle(tPosY3, 0, param.T1, boneSideyR));
					figSide.addSecond(ctrRectangle(tPosY3, 2 * R2 + Z2b, param.T1, boneSideyR));
				} else {
					const tLy = -boneSideyR;
					figSide.addSecond(ctrRectangle(tPosY3, 2 * R2 - tLy, param.T1, tLy));
					figSide.addSecond(ctrRectangle(tPosY3, 4 * R2 + Z2b - tLy, param.T1, tLy));
				}
			}
		}
		// figSide hand fixation
		for (let ii = 0; ii < param.N1; ii++) {
			const tPosY = param.T1 + ii * (param.L1 + param.T1);
			for (const tPosY2 of [LF2, LF23, LF25, LF28]) {
				const tPosY3 = tPosY + tPosY2;
				figSide.addSecond(ctrRectangle(tPosY3, boneSideyRs, param.T1, tH2));
				figSide.addSecond(ctrRectangle(tPosY3, boneSideyRs + tH2 + Z2b, param.T1, tH2));
			}
		}
		// figSide hand-plate, hand-back, motor-bulk, motor-foot
		const ZhpR = [boneSideyRs, boneSideyRs + Z2c];
		const ZhpL = [boneSideyLs, boneSideyLs + Z2c];
		for (let ii = 0; ii < param.N1; ii++) {
			const tPosY = param.T1 + ii * (param.L1 + param.T1);
			const tPosY3 = tPosY + LF2;
			figSide.addSecond(ctrRectangle(tPosY3, ZhpR[0], param.F1, param.T1)); // hand-plate-0
			figSide.addSecond(ctrRectangle(tPosY3, ZhpR[1], param.F1, param.T1)); // hand-plate-1
			figSide.addSecond(ctrRectangle(tPosY3, ZhpR[0], param.F1, param.Z2)); // hand-back
			figSide.addSecond(ctrRectangle(tPosY3, mBRpY, param.F1, motorHeight)); // motor-bulk
			// motor-foot
			const axisX = tPosY + param.L1 / 2;
			const axisY = ZhpR[0] - param.Z1;
			for (const iCtr of makeMFoot(axisX, axisY)) {
				figSide.addSecond(iCtr); // motor-foot
			}
			figSide.addSecond(contourCircle(axisX, axisY, Raxis)); // wheel-axis
			figSide.addSecond(contourCircle(axisX, axisY, Rwheel)); // wheel
		}
		// final figure list
		rGeome.fig = {
			facePlatform: figPlatform,
			faceTop: figTop,
			faceSide: figSide,
			faceTriangle: figTriangle,
			facePFfixation: figPFfixation,
			faceBones: figBones,
			faceHandFixation: figHandFixation,
			faceHandPlateR: figHandPlateR,
			faceHandPlateL: figHandPlateL,
			faceHandBackR: figHandBackR,
			faceHandBackL: figHandBackL,
			faceMotorBulkR: figMotorBulkR,
			faceMotorBulkL: figMotorBulkL,
			faceMFoot: figMFoot,
			faceWheel: figWheel
		};
		// step-8 : recipes of the 3D construction
		// volume
		const designName = rGeome.partName;
		const list3D: string[] = [];
		// listPlatform
		const listPlatform: string[] = [];
		const volPlatformMain: tExtrude = {
			outName: `subpax_${designName}_platformMain`,
			face: `${designName}_facePlatform`,
			extrudeMethod: EExtrude.eLinearOrtho,
			length: Ltotal,
			rotate: [0, 0, 0],
			translate: [0, 0, 0]
		};
		const volTriangle: tExtrude[] = [];
		function extrudeTriangle(posZ: number, idx: number): tExtrude {
			const rVol: tExtrude = {
				outName: `subpax_${designName}_platformTriangle${idx}`,
				face: `${designName}_faceTriangle`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.T1,
				rotate: [0, 0, 0],
				translate: [0, 0, posZ]
			};
			return rVol;
		}
		function extrudePFfixation(posZ: number, idx: number): tExtrude {
			const rVol: tExtrude = {
				outName: `subpax_${designName}_PFfixation${idx}`,
				face: `${designName}_facePFfixation`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.T1,
				rotate: [0, 0, 0],
				translate: [0, 0, posZ]
			};
			return rVol;
		}
		for (let ii = 0; ii < param.N1; ii++) {
			const tPosY = param.T1 + ii * (param.L1 + param.T1);
			for (const [jj, tPosY2] of [LF2, LF23, LF25, LF28].entries()) {
				const tPosY3 = tPosY + tPosY2;
				const idx = 4 * ii + jj;
				volTriangle.push(extrudePFfixation(tPosY3, idx));
				listPlatform.push(`subpax_${designName}_PFfixation${idx}`);
			}
		}
		listPlatform.push(`subpax_${designName}_platformMain`);
		if (param.triangleExt) {
			volTriangle.push(extrudeTriangle(0, 0));
			volTriangle.push(extrudeTriangle(Ltotal - param.T1, param.N1 + 1));
			listPlatform.push(`subpax_${designName}_platformTriangle${0}`);
			listPlatform.push(`subpax_${designName}_platformTriangle${param.N1 + 1}`);
		}
		if (param.triangleInt) {
			for (let ii = 1; ii < param.N1; ii++) {
				volTriangle.push(extrudeTriangle(ii * (param.T1 + param.L1), ii + 1));
				listPlatform.push(`subpax_${designName}_platformTriangle${ii + 1}`);
			}
		}
		// listBones
		const listBones: string[] = [];
		const volBones: tExtrude[] = [];
		function extrudeBones(posZ: number, idx: number): tExtrude {
			const rVol: tExtrude = {
				outName: `subpax_${designName}_bones${idx}`,
				face: `${designName}_faceBones`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.T1,
				rotate: [0, 0, 0],
				translate: [0, 0, posZ]
			};
			return rVol;
		}
		for (let ii = 0; ii < param.N1; ii++) {
			const tPosY = param.T1 + ii * (param.L1 + param.T1);
			for (const [jj, tPosY2] of [LF2b, LF25b].entries()) {
				const tPosY3 = tPosY + tPosY2;
				const idx = 2 * ii + jj;
				volBones.push(extrudeBones(tPosY3, idx));
				listBones.push(`subpax_${designName}_bones${idx}`);
			}
		}
		// listHand
		const listHands: string[] = [];
		const volHands: tExtrude[] = [];
		function extrudeHandFixation(posZ: number, idx: number): tExtrude {
			const rVol: tExtrude = {
				outName: `subpax_${designName}_handFixation${idx}`,
				face: `${designName}_faceHandFixation`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.T1,
				rotate: [0, 0, 0],
				translate: [0, 0, posZ]
			};
			return rVol;
		}
		for (let ii = 0; ii < param.N1; ii++) {
			const tPosY = param.T1 + ii * (param.L1 + param.T1);
			for (const [jj, tPosY2] of [LF2, LF23, LF25, LF28].entries()) {
				const tPosY3 = tPosY + tPosY2;
				const idx = 4 * ii + jj;
				volHands.push(extrudeHandFixation(tPosY3, idx));
				listHands.push(`subpax_${designName}_handFixation${idx}`);
			}
		}
		function extrudeHandPlate(posY: number, iRL: string, idx: number): tExtrude {
			const rVol: tExtrude = {
				outName: `subpax_${designName}_handPlate${iRL}${idx}`,
				face: `${designName}_faceHandPlate${iRL}`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.T1,
				rotate: [pi2, 0, 0],
				translate: [0, posY + param.T1, 0]
			};
			return rVol;
		}
		volHands.push(extrudeHandPlate(ZhpR[0], 'R', 1));
		volHands.push(extrudeHandPlate(ZhpR[1], 'R', 2));
		volHands.push(extrudeHandPlate(ZhpL[0], 'L', 1));
		volHands.push(extrudeHandPlate(ZhpL[1], 'L', 2));
		listHands.push(`subpax_${designName}_handPlateR1`);
		listHands.push(`subpax_${designName}_handPlateR2`);
		listHands.push(`subpax_${designName}_handPlateL1`);
		listHands.push(`subpax_${designName}_handPlateL2`);
		function extrudeHandBack(posY: number, iRL: string): tExtrude {
			const rVol: tExtrude = {
				outName: `subpax_${designName}_handBack${iRL}`,
				face: `${designName}_faceHandBack${iRL}`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.Z2,
				rotate: [pi2, 0, 0],
				translate: [0, posY + param.T1, 0]
			};
			return rVol;
		}
		volHands.push(extrudeHandBack(ZhpR[1], 'R'));
		volHands.push(extrudeHandBack(ZhpL[1], 'L'));
		listHands.push(`subpax_${designName}_handBackR`);
		listHands.push(`subpax_${designName}_handBackL`);
		// listMotors
		const listMotors: string[] = [];
		const volMotors: tExtrude[] = [];
		function extrudeMotorBulk(posY: number, iRL: string): tExtrude {
			const rVol: tExtrude = {
				outName: `subpax_${designName}_motorBulk${iRL}`,
				face: `${designName}_faceMotorBulk${iRL}`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: motorHeight,
				rotate: [pi2, 0, 0],
				translate: [0, posY - param.E1, 0]
			};
			return rVol;
		}
		volMotors.push(extrudeMotorBulk(ZhpR[1], 'R'));
		volMotors.push(extrudeMotorBulk(ZhpL[1], 'L'));
		listMotors.push(`subpax_${designName}_motorBulkR`);
		listMotors.push(`subpax_${designName}_motorBulkL`);
		function extrudeMFoot(
			posX: number,
			posY: number,
			posZ: number,
			az: number,
			idx: string
		): tExtrude {
			const tL = param.Lmotor - mFootWidth;
			const tCos = tL * Math.cos(az);
			const tSin = tL * Math.sin(az);
			const tm = transform3d()
				.addRotation(0, pi2 - az, 0)
				.addTranslation(posX + tCos, posY, posZ + tSin);
			const rVol: tExtrude = {
				outName: `subpax_${designName}_mFoot${idx}`,
				face: `${designName}_faceMFoot`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: mFootWidth,
				rotate: tm.getRotation(),
				translate: tm.getTranslation()
			};
			return rVol;
		}
		for (let ii = 0; ii < param.N1; ii++) {
			const idx0 = (2 * ii).toString().padStart(2, '0');
			const idx1 = (2 * ii + 1).toString().padStart(2, '0');
			const tPosZ = ii * (param.L1 + param.T1) + param.T1 + param.L1 / 2;
			volMotors.push(extrudeMFoot(hPposR, ZhpR[0] - param.Z1, tPosZ, wheelRA[ii], idx0));
			listMotors.push(`subpax_${designName}_mFoot${idx0}`);
			volMotors.push(extrudeMFoot(hPposL, ZhpL[0] - param.Z1, tPosZ, wheelLA[ii], idx1));
			listMotors.push(`subpax_${designName}_mFoot${idx1}`);
		}
		// listWheels
		const listWheels: string[] = [];
		const volWheels: tExtrude[] = [];
		function extrudeWheel(
			posX: number,
			posY: number,
			posZ: number,
			az: number,
			idx: string
		): tExtrude {
			const tL = param.Lmotor - mFootWidth;
			const tCos = tL * Math.cos(az);
			const tSin = tL * Math.sin(az);
			const tm = transform3d()
				.addRotation(0, pi2 - az, 0)
				.addTranslation(posX + tCos, posY, posZ + tSin);
			const rVol: tExtrude = {
				outName: `subpax_${designName}_wheel${idx}`,
				face: `${designName}_faceWheel`,
				extrudeMethod: EExtrude.eRotate,
				rotate: tm.getRotation(),
				translate: tm.getTranslation()
			};
			return rVol;
		}
		for (let ii = 0; ii < param.N1; ii++) {
			const idx0 = (2 * ii).toString().padStart(2, '0');
			const idx1 = (2 * ii + 1).toString().padStart(2, '0');
			const tPosZ = ii * (param.L1 + param.T1) + param.T1 + param.L1 / 2;
			volWheels.push(extrudeWheel(hPposR, ZhpR[0] - param.Z1, tPosZ, wheelRA[ii], idx0));
			listWheels.push(`subpax_${designName}_wheel${idx0}`);
			volWheels.push(extrudeWheel(hPposL, ZhpL[0] - param.Z1, tPosZ, wheelLA[ii], idx1));
			listWheels.push(`subpax_${designName}_wheel${idx1}`);
		}
		// list3D
		if (param.gen3D === 0 || param.gen3D === 1) {
			list3D.push(...listPlatform);
		}
		if (param.gen3D === 0 || param.gen3D === 2) {
			list3D.push(...listBones);
		}
		if (param.gen3D === 0 || param.gen3D === 3) {
			list3D.push(...listHands);
		}
		if (param.gen3D === 0 || param.gen3D === 4) {
			list3D.push(...listMotors);
		}
		if (param.gen3D === 0 || param.gen3D === 5) {
			list3D.push(...listWheels);
		}
		rGeome.vol = {
			extrudes: [
				volPlatformMain,
				...volTriangle,
				...volBones,
				...volHands,
				...volMotors,
				...volWheels
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: list3D
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'RC-car drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const rccarDef: tPageDef = {
	pTitle: 'rccar',
	pDescription: 'high-level concept of the RC-car',
	pDef: pDef,
	pGeom: pGeom
};

export { rccarDef };
