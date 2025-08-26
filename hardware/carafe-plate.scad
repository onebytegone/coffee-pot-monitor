include <./_shared-vars.scad>

plateThickness = 4;
lipHeight = 2;
lipInnerChamfer = 5;
lipOuterChamfer = 5;
lipWidth = 0;

boltHeadDiameter = 7;
boltHeadThickness = 3;

$fn = 60;

module carafePlate() {
   difference() {
      cylinder(r = carafeWidth / 2 + lipInnerChamfer + lipWidth, h = plateThickness + lipHeight);

      translate([ 0, 0, plateThickness ])
      rotate_extrude(angle=360) {
         translate([ carafeWidth / 2, lipInnerChamfer ])
            circle(r = lipInnerChamfer);
         square([ carafeWidth / 2, lipHeight + 1 ]);
         translate([ 0, lipInnerChamfer ])
            square([ carafeWidth / 2 + lipInnerChamfer, lipHeight + 1 ]);
      }

      rotate_extrude(angle=360) {
         translate([ carafeWidth / 2 + lipInnerChamfer + lipWidth - lipOuterChamfer, -1 ])
         difference() {
            square([ lipOuterChamfer + 1, lipOuterChamfer + 1 ]);
            translate([ 0, lipOuterChamfer ])
               circle(r = lipOuterChamfer);
         }
      }

      translate([ 0, -loadCellCarafeOffset ]) {
         translate([ 0, loadCellBoltDistance / 2, plateThickness + 1 - boltHeadThickness ])
         cylinder(r = boltHeadDiameter / 2, h = boltHeadThickness + 1);

         translate([ 0, loadCellBoltDistance / 2, -1 ])
         cylinder(r = loadCellPlateBoltDiameter / 2, h = plateThickness + 2);

         translate([ 0, -loadCellBoltDistance / 2, plateThickness + 1 - boltHeadThickness  ])
         cylinder(r = boltHeadDiameter / 2, h = boltHeadThickness + 1);

         translate([ 0, -loadCellBoltDistance / 2, -1 ])
         cylinder(r = loadCellPlateBoltDiameter / 2, h = plateThickness + 2);
      }
   }
}

carafePlate();
