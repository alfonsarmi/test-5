var a = true;
var b = false;
var c = a || b;
c |= a && b;

c &= a && c;

[lbl] start:
switch (a)
{
	case true:
		a = false;
		break;
		
	case false:
		b = false;
		break;
		
		default:
		continue;		
		break;
		
		goto;
	
}
goto start;