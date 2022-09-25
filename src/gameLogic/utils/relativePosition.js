
export function rpWithChessBoard(x, y) {
    if(x > 7 || y > 7 || x < 0 || y < 0) 
        return false;
    return true;
}

export function rpWithArmy(x, y, xArmy, yArmy) {
    if(x === xArmy && y === yArmy) 
        return true;
    return false;
}

