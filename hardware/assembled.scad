use <./carafe-plate.scad>;
use <./carafe-plate-support.scad>;
use <./coffee-machine.scad>;
use <./coffee-machine-base.scad>;
use <./load-cell-base.scad>;
include <./_shared-vars.scad>;

rotate([ 0, 0, 90 ])
translate([ 0, -loadCellCarafeOffset ])
rotate([ 0, 180 ])
carafePlateSupport();

rotate([ 0, 0, 90 ])
carafePlate();

color("red")
rotate([ 0, 0, 90 ])
translate([ -loadCellWidth / 2, -loadCellPlateBoltInset - loadCellBoltDistance / 2 - loadCellCarafeOffset, -loadCellThickness - 2 ])
cube([ loadCellWidth, loadCellLength, loadCellThickness ]);

translate([ loadCellCarafeOffset * 2 -loadCellLength, 0,  -loadCellThickness - 2 ])
loadCellBase();

translate([-5,0,0 ]){

translate([ -carafeWidth / 2 - footWidth/ 2, - footDistanceY / 2, 0 ])
coffeeMachine();

translate([ -carafeWidth / 2 - footWidth/ 2, - footDistanceY / 2, -coffeeMachineLiftHeight ])
coffeeMachineBase();
}
