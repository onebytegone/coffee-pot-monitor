include <./_shared-vars.scad>;
include <./lib/Round-Anything/polyround.scad>;

baseArmThickness = 4;
baseArmWidth = 20;
armStiffenerThickness = 3;
armStiffenerWidth = 5;
diagonalLength = sqrt(footDistanceX * footDistanceX + footDistanceY * footDistanceY);
footWallThickness = 3;
footWallWidth = 3;
footOuterRadius = 3;
footInnerRadius = 2;

mcuBoardWidth = 32;
mcuBoardLength = 55;
mcuBoardHolderHeight = 10;
mcuBoardHolderWallThickness = 1.5;
usbConnectorHeight = 8;
usbConnectorWidth = 15;

attachArmsRadius = 3;
attachArmsThickness = 4;
attachArmsLift = 3;
attachArmSlideLength = 18;
attachArmBaseLength = footDistanceX / 2 + footWidth / 2 + footWallWidth - attachArmSlideLength / 2;
attachArmsWidth = assemblyBoltDiameter + assemblyBoltInset * 2 + 4;
attachArmsLength = attachArmBaseLength + attachArmSlideLength + attachArmsWidth / 2;

crossMemberAngle = atan(footDistanceY / footDistanceX);

module coffeeMachineBase() {
   translate([ -footDistanceX - footWidth / 2 - footWallWidth, footDistanceY - footWidth / 2 - footWallWidth, 0 ])
   footSupport();

   translate([ -footDistanceX - footWidth / 2 - footWallWidth, -footDepth / 2 - footWallWidth, 0 ])
   footSupport();

   translate([ -footWidth / 2 - footWallWidth, footDistanceY - footWidth / 2 - footWallWidth, 0 ])
   difference() {
      footSupport();
      translate([ footWallWidth + footWidth / 2, -1, coffeeMachineLiftHeight ])
      cube([ footWidth / 2,  footWallWidth + 2, footWallThickness + 1 ], footInnerRadius);
   }

   translate([ -footWidth / 2 - footWallWidth, -footDepth / 2 - footWallWidth, 0 ])
   difference() {
      footSupport();
      translate([ footWallWidth + footWidth / 2, footDepth + footWallWidth - 1, coffeeMachineLiftHeight ])
      cube([ footWidth / 2,  footWallWidth + 2, footWallThickness + 1 ], footInnerRadius);
   }

   difference() {
      union() {
         translate([ -footDistanceX / 2, footDistanceY / 2, 0 ])
         crossMember();

         translate([ -footDistanceX / 2, footDistanceY / 2, 0 ])
         mirror([0, 1, 0])
         crossMember();

         translate([ -footDistanceX / 2 + (mcuBoardLength / 2 + mcuBoardHolderWallThickness - attachArmsWidth) * tan(crossMemberAngle), footDistanceY / 2 - mcuBoardLength / 2 - mcuBoardHolderWallThickness, 0 ])
         roundedCube([
            mcuBoardWidth + mcuBoardHolderWallThickness * 2,
            mcuBoardLength + mcuBoardHolderWallThickness * 2,
            mcuBoardHolderHeight + attachArmsThickness + attachArmsLift
         ], 3);
      }

      translate([
         -footDistanceX / 2 + (mcuBoardLength / 2 + mcuBoardHolderWallThickness - attachArmsWidth) * tan(crossMemberAngle) + mcuBoardHolderWallThickness,
         footDistanceY / 2 - mcuBoardLength / 2,
         attachArmsThickness + attachArmsLift
      ]) {
         roundedCube([ mcuBoardWidth, mcuBoardLength, mcuBoardHolderHeight + 1 ], 2);
         translate([ mcuBoardWidth / 2 - usbConnectorWidth / 2, mcuBoardLength - 1, mcuBoardHolderHeight - usbConnectorHeight ])
         cube([ usbConnectorWidth, mcuBoardHolderWallThickness + 2, usbConnectorHeight + 1 ], 2);
      }
   }
}

module footSupport() {
   difference() {
      roundedCube([ footWidth + footWallWidth * 2, footDepth + footWallWidth * 2, coffeeMachineLiftHeight + footWallThickness ], footOuterRadius);
      translate([ footWallWidth, footWallWidth, coffeeMachineLiftHeight ])
      roundedCube([ footWidth, footDepth, footWallThickness + 1 ], footInnerRadius);
   }
}

module crossMember() {
   rotate([ 0, 0, crossMemberAngle ]) {
      translate([ -diagonalLength / 2, -baseArmWidth / 2, 0 ])
      cube([ diagonalLength, baseArmWidth, baseArmThickness ]);

      translate([ -diagonalLength / 2, -armStiffenerWidth / 2, baseArmThickness ])
      cube([ diagonalLength, armStiffenerWidth, armStiffenerThickness ]);
   }


   translate([ 0, assemblyBoltDistance / 2 ])
   difference() {
      union() {
         translate([ 0, - attachArmsWidth / 2, 0 ])
         linear_extrude(height = attachArmsThickness + attachArmsLift)
         polygon(polyRound([
            [ assemblyBoltDistance / 2 - attachArmsWidth / 2 * tan(crossMemberAngle), 0, 0 ],
            [ attachArmsLength, 0, attachArmsWidth / 2 ],
            [ attachArmsLength, attachArmsWidth, attachArmsWidth / 2 ],
            [ assemblyBoltDistance / 2 + attachArmsWidth / 2 * tan(crossMemberAngle), attachArmsWidth, 0 ],
         ]));

         translate([ attachArmBaseLength - assemblyBoltInset - armStiffenerWidth, -assemblyBoltDistance / 2, 0 ])
         cube([ armStiffenerWidth, footDistanceY / 2, attachArmsThickness + attachArmsLift ]);
      }

      translate([ attachArmBaseLength, 0, attachArmsLift - 1 ])
      cylinder(r = assemblyBoltDiameter / 2, h = attachArmsThickness + 2);
      translate([ attachArmBaseLength + attachArmSlideLength, 0, attachArmsLift - 1 ])
      cylinder(r = assemblyBoltDiameter / 2, h = attachArmsThickness + 2);
      translate([ attachArmBaseLength, - assemblyBoltDiameter / 2, attachArmsLift - 1 ])
      cube([ attachArmSlideLength, assemblyBoltDiameter, attachArmsThickness + 2 ]);

      translate([ attachArmBaseLength - assemblyBoltInset, - attachArmsWidth / 2 - 1, -1 ])
      cube([ attachArmsLength - attachArmBaseLength + assemblyBoltInset + 1, attachArmsWidth + 2, attachArmsLift + 1 ]);
   }
}

module roundedCube(size = [10, 10, 10], radius = 1) {
   linear_extrude(height = size[2])
   polygon(polyRound([
      [ 0, 0, radius ],
      [ size[0], 0, radius ],
      [ size[0], size[1], radius ],
      [ 0, size[1], radius ],
   ]));
}

coffeeMachineBase();
