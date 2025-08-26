include <./_shared-vars.scad>

topPlateThickness = 2;
attachPointWallThickness = 3;
attachPointLength = loadCellPlateBoltInset * 2 + loadCellBoltDistance + loadCellPlateBoltDiameter / 2;
attachPointWidth = loadCellWidth + attachPointWallThickness * 2;
attachPointHeight = topPlateThickness + loadCellThickness;
supportArmLength = carafeWidth / 2 * 0.9;
supportArmThickness = 5;
supportArmTipThickness = 3;

module carafePlateSupport() {
   rotate([ 0, 0, 90 ])
   translate([ -loadCellPlateBoltInset - loadCellBoltDistance / 2- attachPointWallThickness, -attachPointWidth / 2, 0 ])
   difference() {
      union() {
         cube([ attachPointLength + attachPointWallThickness, attachPointWidth, attachPointHeight ]);

         supportArm(-55, supportArmLength * 1.2, supportArmThickness * 1.2);
         supportArm(-15);
         supportArm(20, supportArmLength * .9);
         supportArm(55, supportArmLength * .8);
         supportArm(90, supportArmLength - loadCellCarafeOffset);
         supportArm(125, supportArmLength * .8);
         supportArm(160, supportArmLength * .9);
         supportArm(195);
         supportArm(235, supportArmLength * 1.2, supportArmThickness * 1.2);
      }
      translate([ attachPointWallThickness, attachPointWallThickness, topPlateThickness ])
         cube([ attachPointLength + 1, loadCellWidth, attachPointHeight + 10 ]);

      translate([ attachPointWallThickness + loadCellPlateBoltInset, attachPointWidth / 2, -1  ])
        cylinder(r = loadCellPlateBoltDiameter / 2, h = topPlateThickness + 2);

      translate([ attachPointWallThickness + loadCellPlateBoltInset + loadCellBoltDistance, attachPointWidth / 2, -1  ])
         cylinder(r = loadCellPlateBoltDiameter / 2, h = topPlateThickness + 2);
   }
}

module supportArm(zRot = 0, length = supportArmLength, width = supportArmThickness) {
   translate([ attachPointLength / 2 + attachPointWallThickness, attachPointWidth / 2, 0 ])
   rotate([ 0, -90, zRot ])
   translate([ 0, 0, -width / 2 ])
   linear_extrude(height = width)
   polygon(points = [
      [ 0, length ],
      [ supportArmTipThickness, length ],
      [ attachPointHeight, 0 ],
      [ 0, 0 ],
   ]);
}

carafePlateSupport();
