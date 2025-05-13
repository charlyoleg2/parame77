// springWorm.ts
// Flex-part for torque transmission between two axis that might not be perfectly co-axial

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
	//contour,
	contourCircle,
	ctrRectangle,
	figure,
	//degToRad,
	//radToDeg,
	ffix,
	pNumber,
	//pCheckbox,
	pDropdown,
	pSectionSeparator,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';
//import { triLALrL, triALLrL, triLLLrA } from 'triangule';
//import { triALLrLAA } from 'triangule';
//import { ctrPlugExtern } from './libPlugTorque';

const pDef: tParamDef = {
	partName: 'springWorm',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1', 'mm', 30, 2, 200, 1),
		pNumber('E1', 'mm', 2, 0.1, 50, 0.1),
		pNumber('N1', 'groove', 6, 2, 200, 1),
		pNumber('W2', 'mm', 2, 0.1, 50, 0.1),
		pNumber('W3', 'mm', 1, 0.1, 50, 0.1),
		pNumber('S1', 'mm', 1, 0.1, 50, 0.1),
		pSectionSeparator('Extremity caps'),
		pDropdown('leftCaps', ['ext', 'int']),
		pDropdown('rightCaps', ['ext', 'int']),
		pNumber('W1', 'mm', 2, 0.1, 50, 0.1),
		pNumber('W1b', 'mm', 1, 0.1, 50, 0.1)
	],
	paramSvg: {
		D1: 'springWorm_mid.svg',
		E1: 'springWorm_mid.svg',
		S1: 'springWorm_mid.svg',
		W1: 'springWorm_side.svg',
		W1b: 'springWorm_side.svg',
		N1: 'springWorm_side.svg',
		W2: 'springWorm_side.svg',
		W3: 'springWorm_side.svg',
		leftCaps: 'springWorm_side.svg',
		rightCaps: 'springWorm_caps.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figTube = figure();
	const figGroove1 = figure();
	const figGroove2 = figure();
	const figLeft = figure();
	const figRight = figure();
	const figW1b = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const R1 = param.D1 / 2;
		const Ri = R1 - param.E1;
		const R12 = 1.2 * R1;
		const S12 = param.S1 / 2;
		const lenMid = (param.N1 + 1) * param.W2 + param.N1 * param.W3;
		const capsLeftExt = param.leftCaps === 0;
		const capsRightExt = param.rightCaps === 0;
		const lenLeft = capsLeftExt ? param.W1 : param.W1 + param.W1b;
		const lenRight = capsRightExt ? param.W1 : param.W1 + param.W1b;
		const lenTotal = lenLeft + lenMid + lenRight;
		// step-5 : checks on the parameter values
		if (Ri < 0.1) {
			throw `err079: D1 ${param.D1} is too small compare to E1 ${param.E1}`;
		}
		// step-6 : any logs
		rGeome.logstr += `Dint ${ffix(2 * Ri)} mm\n`;
		rGeome.logstr += `Total length ${ffix(lenTotal)} mm\n`;
		// sub-function
		//const [ctrToothE, logE] = ctrPlugExtern(param, RbEmax);
		//rGeome.logstr += logE;
		// figTube
		figTube.addMainOI([contourCircle(0, 0, R1), contourCircle(0, 0, Ri)]);
		figTube.addSecond(ctrRectangle(S12, -R12, R1, 2 * R12));
		figTube.addSecond(ctrRectangle(-R1 - S12, -R12, R1, 2 * R12));
		figTube.addSecond(ctrRectangle(-R12, S12, 2 * R12, R1));
		figTube.addSecond(ctrRectangle(-R12, -R1 - S12, 2 * R12, R1));
		// figGroove12 secondary tubes
		const ctrTubes: tContour[] = [];
		ctrTubes.push(ctrRectangle(0, -R1, param.W1, param.D1));
		if (!capsLeftExt) {
			ctrTubes.push(ctrRectangle(param.W1, -R1, param.W1b, param.D1));
		}
		ctrTubes.push(ctrRectangle(lenLeft, -R1, lenMid, param.D1));
		if (!capsRightExt) {
			ctrTubes.push(ctrRectangle(lenLeft + lenMid, -R1, param.W1b, param.D1));
		}
		ctrTubes.push(ctrRectangle(lenTotal - param.W1, -R1, param.W1, param.D1));
		for (const iCtr of ctrTubes) {
			figGroove1.addSecond(iCtr);
			figGroove2.addSecond(iCtr);
		}
		// figGroove1 and figGroove2
		const xStart = lenLeft + param.W2;
		const xStep = param.W3 + param.W2;
		for (let ii = 0; ii < param.N1; ii++) {
			const ctr1 = ctrRectangle(xStart + ii * xStep, S12, param.W3, R1);
			const ctr2 = ctrRectangle(xStart + ii * xStep, -R1 - S12, param.W3, R1);
			if (ii % 2 === 0) {
				figGroove1.addMainO(ctr1);
				figGroove1.addMainO(ctr2);
				figGroove2.addSecond(ctr1);
				figGroove2.addSecond(ctr2);
			} else {
				figGroove1.addSecond(ctr1);
				figGroove1.addSecond(ctr2);
				figGroove2.addMainO(ctr1);
				figGroove2.addMainO(ctr2);
			}
		}
		// figLeft
		figLeft.addMainOI([contourCircle(0, 0, R1), contourCircle(0, 0, Ri)]);
		// figRight
		figRight.addMainOI([contourCircle(0, 0, R1), contourCircle(0, 0, Ri)]);
		// figW1b
		figW1b.addMainO(contourCircle(0, 0, R1));
		// final figure list
		rGeome.fig = {
			faceTube: figTube,
			faceGroove1: figGroove1,
			faceGroove2: figGroove2,
			faceLeft: figLeft,
			faceRight: figRight,
			faceW1b: figW1b
		};
		// volume
		const designName = rGeome.partName;
		const union_list = [
			`subpax_${designName}_tube`,
			`subpax_${designName}_left`,
			`subpax_${designName}_right`
		];
		if (!capsLeftExt) {
			union_list.push(`subpax_${designName}_leftB`);
		}
		if (!capsRightExt) {
			union_list.push(`subpax_${designName}_rightB`);
		}
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_tube`,
					face: `${designName}_faceTube`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: lenMid,
					rotate: [0, 0, 0],
					translate: [0, 0, lenLeft]
				},
				{
					outName: `subpax_${designName}_left`,
					face: `${designName}_faceLeft`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.W1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_leftB`,
					face: `${designName}_faceW1b`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.W1b,
					rotate: [0, 0, 0],
					translate: [0, 0, param.W1]
				},
				{
					outName: `subpax_${designName}_rightB`,
					face: `${designName}_faceW1b`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.W1b,
					rotate: [0, 0, 0],
					translate: [0, 0, lenLeft + lenMid]
				},
				{
					outName: `subpax_${designName}_right`,
					face: `${designName}_faceRight`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.W1,
					rotate: [0, 0, 0],
					translate: [0, 0, lenTotal - param.W1]
				},
				{
					outName: `subpax_${designName}_groove1`,
					face: `${designName}_faceGroove1`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: 2 * R12,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_groove2`,
					face: `${designName}_faceGroove2`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: 2 * R12,
					rotate: [0, 0, Math.PI / 2],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `ipax_${designName}_plus`,
					boolMethod: EBVolume.eUnion,
					inList: union_list
				},
				{
					outName: `ipax_${designName}_moins`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_groove1`, `subpax_${designName}_groove2`]
				},
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eSubstraction,
					inList: [`ipax_${designName}_plus`, `ipax_${designName}_moins`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'springWorm drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const springWormDef: tPageDef = {
	pTitle: 'springWorm',
	pDescription: 'Flex-part for unperfect coaxial transmission',
	pDef: pDef,
	pGeom: pGeom
};

export { springWormDef };
