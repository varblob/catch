# catch

## Things students will do

- Have trouble understanding variable scope and hence have difficulty deciding where the variable should be declared, accessed, and assigned
  - As soon as students start to have multiple functions that share state, they will need to have at least a vague understanding of variable scope.  At one level of depth students seem to have a fairly easy time of understanding that they need to declare the variable outside the function to be shared.  They can do this without understanding the details of variable scope and will fail to correctly answer most variable scope related questions as they are thinking of it more as a special case than fully understanding the concept. Students who are struggling can get by with this limited understanding but more advanced students should be taught the details of variable scoping by walking them through a series of questions designed to demonstrate the different variable declaration, assignment, access, and collision scenarios. This concept will definitely require reinforcement.
- Function arguments
  - Students often try to assign to the variable in the function input eg `myFunction(bah=4)` instead of `myFunction(4)`
  - When passing in a variable to the function they may also have trouble
    ```
      var food = 5;
      myFunction(5);
    ```
- Not think about restarting the application or game (state cleanup)
  - This is not of critical importance but is a great way to increase the difficulty for more advanced students.
- Not break things into functions
  - When duplicating
    - Students will sometimes duplicate the code, they should be actively told not to do this and instead to make a new function.
  - when creating logical groupings of code
    - It is often helpful to break code that is related or complex into a function even if not used in duplicate.  Students should be encouraged to do this but not required.  
- Not store things in variables and access directly from array or dom
  - This can create problems as the complexity of work being done in the for loop increases.  Students should be encouraged but not required to create variables when things start to get more complex.
- Not separate view from model
  - This is a challenging concept for students to grasp.  Advanced students should be encouraged to break apart model and view.  This means most of the time students will be doing logical operations on jquery objects, this is ok.
- Not cleanup dom elements
  - Dom elements that are no longer in use will not be removed from the dom.  Advanced students should be encouraged to cleanup unused dom elements but for the rest this is ok.

## Game

### Components

- drop
  - things that fall from the top of the screen
  - only moves on the y axis
- pad
  - the thing that catches the drops
  - only moves on the x axis
- game area
  - the bounds that contain the game

### Mechanics

- When the drop is caught the players score goes up


## Architectural choices

- Coordinates
  - grid based
    - a grid based coordinate system multiplies all x and y when drawing.  For instance a 1x1 is actualy 10px by 10px
    - advantages
      - if you're going to go on to do the snake game this is a much prefered way to do it as the collision is much easier.  Knowing if a head is hitting a body element or food is as simple as `head.x === food.x && head.y === food.y`.
      - It makes collision slightly easier in the y direction for catch as you can make the pad 1 grid element in height (pad.y === drop.y).  You still need to do a clamped x (pad.x < drop.x < pad.x + pad.width)
  - pixel based
    - use the actual pixels
    - advantages
      - don't need to do the view conversion
