include <./_shared-vars.scad>

module coffeeMachine() {
   color("cyan")
   translate([ -footDistanceX - footWidth / 2, footDistanceY - footWidth / 2, 0 ])
   cube([ footWidth, footDepth, 30 ]);

   color("cyan")
   translate([ -footDistanceX - footWidth / 2, -footDepth / 2, 0 ])
   cube([ footWidth, footDepth, 30 ]);

   color("cyan")
   translate([ -footWidth / 2, footDistanceY - footWidth / 2, 0 ])
   cube([ footWidth, footDepth, 30 ]);

   color("cyan")
   translate([ -footWidth / 2, - footDepth / 2, 0 ])
   cube([ footWidth, footDepth, 30 ]);
}

carafePlate();
