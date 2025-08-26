include <./_shared-vars.scad>
include <./lib/Round-Anything/polyround.scad>;

attachPointBaseThickness = 0.5;
attachPointWallThickness = 3;
attachPointLength = loadCellPlateBoltInset * 2 + loadCellBoltDistance + loadCellBaseBoltDiameter / 2;
attachPointShortWallLength = attachPointLength / 2;
attachPointWidth = loadCellWidth + attachPointWallThickness * 2;
attachPointHeight = attachPointBaseThickness + loadCellThickness;

backAttachPointSupportLength = 10;
supportWidth = 10;
supportTipHeight = 4;

wireChannel = 3;
wireChannelOffset = 9;

baseLength = backAttachPointSupportLength + attachPointWallThickness + attachPointLength;

boltHeadHeight = 3.5;
boltHeadDiameter = 9.5;

assemblyNutThickness = 2.5;
assemblyNutWidth = 6.3;
assemblyNutHeight = 5.55;
assemblyBoltDiameter = 3;
assemblyBoltDistance = 45;
assemblyBoltInset = 3;

armAngle = 50;
armAngledLength = 50;
armStraightLength = 65;
armSizeX = armAngledLength * cos(armAngle);
armSizeY = armAngledLength * sin(armAngle);
armWidth = 12;
armOutsideOffsetX = armWidth * sin(armAngle);
armOutsideOffsetY = armWidth * cos(armAngle);
armStraightExtraX = supportWidth / 2 * sin(armAngle);
armStraightWidth = supportWidth * cos(armAngle);
armThickness = 3;
armSupportHeight = attachPointHeight / 2;
shoulderWidth = 60;

armEndRadius = 5;
innerRadius = 2;
outerRadius = 4;

module loadCellBase() {
   difference() {
      union() {
         translate([ -attachPointWallThickness, -attachPointWidth / 2, -attachPointBaseThickness ])
         difference() {
            union() {
               cube([ attachPointLength + attachPointWallThickness, attachPointWidth - attachPointWallThickness - 0.01, attachPointHeight ]);

               translate([ 0, attachPointWidth - attachPointWallThickness - 1, 0 ])
               cube([ attachPointShortWallLength + attachPointWallThickness, attachPointWallThickness + 1, attachPointHeight ]);

               translate([ attachPointWallThickness, loadCellWidth + attachPointWallThickness, 0 ])
               rotate([ 90, 0, armAngle ])
               difference() {
                  translate([ 0, 0, -supportWidth / 2 ])
                  linear_extrude(supportWidth)
                  polygon([
                     [ 0, 0 ],
                     [ armAngledLength, 0 ],
                     [ armAngledLength, supportTipHeight ],
                     [ 0, armSupportHeight ],
                  ]);

                  translate([ wireChannelOffset, 0.01, -supportWidth/2 - 1 ])
                  cube([ wireChannel, wireChannel, supportWidth + 2 ]);
               }

               translate([ attachPointWallThickness, attachPointWallThickness, 0 ])
               rotate([ 90, 0, -armAngle ])
               translate([ 0, 0, -supportWidth / 2 ])
               linear_extrude(supportWidth)
               polygon([
                  [ 0, 0 ],
                  [ armAngledLength, 0 ],
                  [ armAngledLength, supportTipHeight ],
                  [ 0, armSupportHeight ],
               ]);

               translate([ armSizeX + attachPointWallThickness - armStraightExtraX, -armSizeY + attachPointWallThickness - armStraightWidth / 2, 0 ])
               cube([ armStraightLength, armStraightWidth, supportTipHeight ]);

               translate([ armSizeX + attachPointWallThickness - armStraightExtraX, armSizeY - armStraightWidth / 2 + loadCellWidth + attachPointWallThickness, 0 ])
               cube([ armStraightLength, armStraightWidth, supportTipHeight ]);

               translate([ attachPointWallThickness, attachPointWidth / 2, -armThickness ])
               linear_extrude(armThickness)
               polygon(polyRound([
                  [ -backAttachPointSupportLength - attachPointWallThickness, -shoulderWidth / 2, outerRadius ],
                  [ baseLength / 2 - backAttachPointSupportLength - attachPointWallThickness, -shoulderWidth / 2, outerRadius ],
                  [ armSizeX - armOutsideOffsetX, -armSizeY - loadCellWidth / 2 - armOutsideOffsetY, outerRadius ],
                  [ armSizeX + armStraightLength, -armSizeY - loadCellWidth / 2 - armOutsideOffsetY, outerRadius ],
                  [ armSizeX + armStraightLength, -armSizeY - loadCellWidth / 2 + armOutsideOffsetY, outerRadius ],
                  [ armSizeX + armOutsideOffsetX, -armSizeY - loadCellWidth / 2 + armOutsideOffsetY, outerRadius ],
                  [ baseLength - backAttachPointSupportLength - attachPointWallThickness, -loadCellWidth / 2, innerRadius ],
                  [ baseLength - backAttachPointSupportLength - attachPointWallThickness, loadCellWidth / 2, innerRadius ],


                  [ armSizeX + armOutsideOffsetX, armSizeY + loadCellWidth / 2 - armOutsideOffsetY, outerRadius ],
                  [ armSizeX + armStraightLength, armSizeY + loadCellWidth / 2 - armOutsideOffsetY, outerRadius ],
                  [ armSizeX + armStraightLength, armSizeY + loadCellWidth / 2 + armOutsideOffsetY, outerRadius ],
                  [ armSizeX - armOutsideOffsetX, armSizeY + loadCellWidth / 2 + armOutsideOffsetY, outerRadius ],
                  [ baseLength / 2 - backAttachPointSupportLength - attachPointWallThickness, shoulderWidth / 2, outerRadius ],

                  [ -backAttachPointSupportLength - attachPointWallThickness, shoulderWidth / 2, outerRadius ],
               ]));

            }

            translate([ attachPointWallThickness, attachPointWallThickness, attachPointBaseThickness ])
               cube([ attachPointLength + 1, loadCellWidth, attachPointHeight + 10 ]);
            translate([ attachPointWallThickness + loadCellPlateBoltInset, attachPointWidth / 2, - armThickness -1  ])
               cylinder(r = loadCellBaseBoltDiameter / 2, h = attachPointBaseThickness + armThickness + 2);

            translate([ attachPointWallThickness + loadCellPlateBoltInset, attachPointWidth / 2, - armThickness - 0.01  ])
               cylinder(loadCellBaseBoltDiameter / 2, boltHeadDiameter / 2, h = boltHeadHeight);

            translate([ attachPointWallThickness + loadCellPlateBoltInset + loadCellBoltDistance, attachPointWidth / 2, - armThickness -1  ])
               cylinder(r = loadCellBaseBoltDiameter / 2, h = attachPointBaseThickness + armThickness + 2);

            translate([ attachPointWallThickness + loadCellPlateBoltInset + loadCellBoltDistance, attachPointWidth / 2, - armThickness -0.01  ])
               cylinder(loadCellBaseBoltDiameter / 2, boltHeadDiameter / 2, h = boltHeadHeight);

            translate([ -backAttachPointSupportLength + assemblyBoltInset, attachPointWidth / 2 - assemblyBoltDistance / 2 -assemblyNutWidth/2, -armThickness -1 ])
            cube([ assemblyNutHeight, assemblyNutWidth, assemblyNutThickness ]);

            translate([ -backAttachPointSupportLength + assemblyBoltInset + assemblyNutHeight / 2, attachPointWidth / 2 - assemblyBoltDistance / 2, -armThickness -1 ])
            cylinder(r = assemblyBoltDiameter / 2, h = armThickness + 2);

            translate([ -backAttachPointSupportLength + assemblyBoltInset, attachPointWidth / 2 + assemblyBoltDistance / 2 - assemblyNutWidth/2, -armThickness -1 ])
            cube([ assemblyNutHeight, assemblyNutWidth, assemblyNutThickness ]);

            translate([ -backAttachPointSupportLength + assemblyBoltInset + assemblyNutHeight / 2, attachPointWidth / 2 + assemblyBoltDistance / 2, -armThickness -1 ])
            cylinder(r = assemblyBoltDiameter / 2, h = armThickness + 2);
         }


         translate([ -attachPointWallThickness, supportWidth / 2, -attachPointBaseThickness ])
         rotate([ 90, 0 ])
         linear_extrude(supportWidth)
         polygon([
            [ 0, 0 ],
            [ 0, attachPointHeight ],
            [ -backAttachPointSupportLength, 0 ],
         ]);
      }
   }
}

loadCellBase();
