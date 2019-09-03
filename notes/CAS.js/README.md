## AST Goals
- Should be an accurate representation of the users input
- Should be easy to convert to a human friendly representation (text, latex, images, etc)

## AST Nodes
Node Type                   | Description                   															| Examples / Purposed Syntax
----------------------------|-------------------------------------------------------------------------------------------|-------------
MathExpression				|	Equivelent of "Program" in Spidermonkey JS AST, container for all other Nodes			| 
AssignmentExpression		|	Expression assigning a value to a `variable`											| x := 1; y := 3; y += 5; x -= 3
FunctionDeclaration 		|	Declares a callable `function`															| f(x) := x+3
FunctionBranchDeclaration	|   Define a conditional branch in a `function` 											| f(x) := x+2 __if x > 0__
ComparisonExpression 		|	Defines an expression that compares two values and returns a `boolean`					| x > 0; 15 > x < 20; 5 = 1; x = 5; 2x + 5 = 20
BinaryExpression 			|	Defines a binary expression with a left value, right value, and an operator				| * / + - mod % OR XOR AND pow := /^
UnaryExpression*			|   Defines a unary expression with an argument (left or right) and an operator 			| !5, 
GroupExpression				|	Defines a group that contains a math expression to be evaluated. 						| 5 + __(5 + 1)__; 2 &#124; -5 + 1&#124;; 5[3 + (x+ 1)]
MatrixExpression 			|	Defines a matrix literal																| ((a, b, c), (e, f, g))
VectorExpression 			|	Defines a vector literal																| (19, 4)
NumberExpression 			|	Defines a numeric literal	(`number`, `big number`, `complex number`)					| 5; 2 + 5i
IntervalExpression 			|	Defines an interval using interval notation 											| [1, 3]; (-inf, inf), [0, inf) uu [-1,-5]; {x &#124;; x in __R__ if x = x^2}
IntervalRangeExpression 	|	Defines an interval range																| [1, 3], (-inf, inf), [0, inf)
RosterExpression			|	Defines a roster set																	| {1, 2, 3}
Identifier 					|	Reference to a variable or constant, may be a string									| pi;  x; 'Total Sales' := 5
CallExpression				|	Describes a function call and it's arguments											| sin(sqrt(9)); sin x
LimitExpression 			|	Defines a limit																			| limit(x -> c, f(x), L) 
MonomialExpression 			|	Defines a monomial group with a variable and coefficient (defaulting to 1)				| 5x; x
PolynomialExpression		|	Defines a polynomial group and it's terms (monomials)									| 5x + 3y - z
AliasExpression				|   Defines a human-friendly alias for a variable (aliases can be thought of as pointers) 	| 'Total Sales' as x;  'Total Sales' as x := 5
UnitExpression\*\* 			|   Unary expression that defines the unit of measure for a value							| x = $5.00; y = 5lbs; 

_\* It may be favorable to remove unary expressions and operators and have things like the `NOT/!` be parsed as functions in the actual AST. Downside would be there'd be no way to define precedence for these operations and they'd always be executed as function calls_

_\*\* May be removed, it may be favorable to just have them defined as unary expressions but since it's such a specific use-case there may be good reasons for defining them as a seperate expression. You could argue you could put this logic into the parsing for `NumberExpression`'s  but having them as an operator that assigns the units make it easier for evaluators to handle conversions like `x := (5in + 6in)ft` where x is assigned the value of the result of `5in + 6in` after applying the `ft` operator which handles conversion from other units_

### Parser Implementation Notes
- Must have a `context` object that has mappings for all
	- Variables 
	- Constants
	- Functions
	- Binary Operators
	- Unary Operators (and whether they take a left or right argument)
	- Aliases
- Should units be defined as an unary operator that takes a 
- Should expose and allow maniupulation of the `context`
- May allow sharing it's `context` with an `evaluator`
- Should only share it's `context` with one `evaluator` at a time
- May create automatic alias identifiers for long identifiers (`"Total Sales in March" := 5` could define an alias of `TSiM`)
- Automatic aliases should only be created if the shorthand identifier is not already defined

## Evaluator Implentation Notes
- Should expose and allow manipulation of the execution `context`
- Should expose the `parser` bound to it's `context` 
- Must understand all AST nodes defined by the Math AST spec
- Must throw an exception when an undefined operator is used
- Must throw an exception when an undefined function is called
- Must not add any "magic" to the interpration of the AST (for example defining automatic aliases for long identifiers)
- Must support aliases for identifiers (useful internally for creating short-hand names for functions/constants as well)
- Should support long idenitifers such as `"Total Sales" := 5` but leave defining aliases up to the parser
- Aliases must be treated like any other identifier and behave as a getter/setter for the target identifier
- Should not allow redefinition of an alias (they should only ever point to one other idenitifer)
- Must follow basic order of operations (PEMDAS)
- Should allow operators to define their preferred precedence 
- Should allow definitions of unary and binary operators