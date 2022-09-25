import {
    rpWithChessBoard,
    rpWithArmy
} from './../utils/relativePosition.js'
//return array contain all movement of pawn

//setup shortcut for query selector
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

//get all next step of pawn
function pawnLogic(chess, chesses) {
    const list = chess.classList;

    const color = list[1][0];
    const position = [...list[2].slice(6)];

    //get coordinate of pawn
    const x = parseInt(position[0]);
    const y = parseInt(position[1]);

    const result = [];
    const push = color === 'w' ? 1 : -1;

    //if first step not already move, pawn can move both one and two square
    if((x === 1 && color === 'w') || (x == 6 && color === 'b')) {
        result.push({x: x + 2*push, y: y});
    }
    result.push({x: x + push, y: y});

    const length = result.length;
    result.forEach((pos, index)=>{
        //if pawn go outside the chessboard
        if(!rpWithChessBoard(pos.x, pos.y)) {
            return result[index]['isDeleted'] = true;
        }

        //check relative position of all pawn next step with all chesses on the chess board
        for(let i = 0; i < chesses.length; i++){
            const chessList = chesses[i].classList;
    
            const chessColor = chessList[1][0];  
            const chessName = chessList[1].slice(1);  

            const chessPosition = [...chessList[2].slice(6)];
    
            //get another chess position
            const cpX = parseInt(chessPosition[0]);
            const cpY = parseInt(chessPosition[1]);

            //if this position is your current pawn
            if(cpX === x && cpY === y) continue;

            //handle step one of pawn (go 2 square)
            if(rpWithArmy(x + push, y - 1, cpX, cpY) || rpWithArmy(x + push, y + 1, cpX, cpY) && index === 0) {
                if(color === chessColor) continue;
                if(chessName === 'king')
                    result.push({x: cpX, y: cpY, isAttackKing: true});
                result.push({x: cpX, y: cpY, isAttack: true});
            }

            //check relative position with another chess
            if(!rpWithArmy(pos.x, pos.y, cpX, cpY)) continue;
            
            //if has another chess on your pawn way, delete it
            result[index]['isDeleted'] = true;

            result.forEach((r, index)=>{
                if(r.x === cpX + push && r.y === cpY) {
                    result[index]['isDeleted'] = true;
                }
            })
        }
    })
    return result;
}

//get all next step of rock
function rockLogic(chess, chesses) {
    const list = chess.classList;

    const color = list[1][0];
    const position = [...list[2].slice(6)];

    const x = parseInt(position[0]);
    const y = parseInt(position[1]);

    const result = [];

    //push all step may be move of rock
    for(let i = 1; i < 8; i++) {
        result.push({x: x + i, y});
        result.push({x: x - i, y: y});
        result.push({x: x, y: y + i});
        result.push({x: x, y: y - i});
    }
    
    //loop through all step, handle each step
    result.forEach((pos, index)=>{
        //if this coordinate outside the chess board
        if(!rpWithChessBoard(pos.x, pos.y)) {
            return result[index]['isDeleted'] = true;
        }

        //loop through another chess, check each one
        for(let i = 0; i < chesses.length; i++){
            const chessList = chesses[i].classList;
    
            const chessColor = chessList[1][0];    
            const chessName = chessList[1].slice(1);
            const chessPosition = [...chessList[2].slice(6)];
    
            const cpX = parseInt(chessPosition[0]);
            const cpY = parseInt(chessPosition[1]);

            //the same rock
            if(cpX === x && cpY === y) continue;
    
            //if has chess on your rock way
            if(!rpWithArmy(pos.x, pos.y, cpX, cpY)) continue;

            //your team close-up
            if(color === chessColor) {
                result[index]['isDeleted'] = true;
            } else {
                if(chessName === 'king')
                    result[index]['isAttackKing'] = true;
                else
                    result[index]['isAttack'] = true;
            }

            //if has it, delete all steps in front or behind this rock
            const pushX = (cpX === x) ? 0 : (cpX > x ? 1 : -1);
            const pushY = (cpY === y) ? 0 : (cpY > y ? 1 : -1);

            let time = 1;
            result.forEach((r, i)=>{
                if(r.x === cpX + pushX * time && r.y === cpY + pushY * time) {
                    time++;
                    result[i]['isDeleted'] = true;
                }
            })
        }   
    })
    return result;
}


function bishopLogic(chess, chesses) {
    const list = chess.classList;

    const color = list[1][0];
    const position = [...list[2].slice(6)];

    const x = parseInt(position[0]);
    const y = parseInt(position[1]);

    const result = [];

    for(let i = 1; i < 8; i++) {
        result.push({x: x + i, y: y + i});
        result.push({x: x - i, y: y - i});
        result.push({x: x + i, y: y - i});
        result.push({x: x - i, y: y + i});
    }
    
    result.forEach((pos, index)=>{
        if(!rpWithChessBoard(pos.x, pos.y)) {
            return result[index]['isDeleted'] = true;
        }

        for(let i = 0; i < chesses.length; i++){
            const chessList = chesses[i].classList;
    
            const chessColor = chessList[1][0];    
            const chessName = chessList[1].slice(1);
            const chessPosition = [...chessList[2].slice(6)];
    
            const cpX = parseInt(chessPosition[0]);
            const cpY = parseInt(chessPosition[1]);

            if(cpX === x && cpY === y) continue;
    
            if(!rpWithArmy(pos.x, pos.y, cpX, cpY)) continue;

            //your team close-up
            if(color === chessColor) {
                result[index]['isDeleted'] = true;
            } else {
                if(chessName === 'king')
                    result[index]['isAttackKing'] = true;
                else
                    result[index]['isAttack'] = true;
            }

            const xPush = x - cpX > 0 ? -1 : 1;
            const yPush = y - cpY > 0 ? -1 : 1;

            let time = 1;
            result.forEach((r, i)=>{
                if (r.x === cpX + xPush*time && r.y === cpY + yPush*time) {
                    time++;
                    result[i]['isDeleted'] = true;
                }
            })
        }   
    })
    return result;
}

function knightLogic(chess, chesses) {
    const list = chess.classList;

    const color = list[1][0];
    const position = [...list[2].slice(6)];

    const x = parseInt(position[0]);
    const y = parseInt(position[1]);

    const result = [];
    result.push({x: x + 1, y: y + 2});
    result.push({x: x + 1, y: y - 2});
    result.push({x: x - 1, y: y + 2});
    result.push({x: x - 1, y: y - 2});
    result.push({x: x + 2, y: y + 1});
    result.push({x: x + 2, y: y - 1});
    result.push({x: x - 2, y: y + 1});
    result.push({x: x - 2, y: y - 1});
    
    result.forEach((pos, index)=>{
        if(!rpWithChessBoard(pos.x, pos.y)) {
            return result[index]['isDeleted'] = true;
        }

        for(let i = 0; i < chesses.length; i++){
            const chessList = chesses[i].classList;
    
            const chessColor = chessList[1][0];    
            const chessName = chessList[1].slice(1);
            const chessPosition = [...chessList[2].slice(6)];
    
            const cpX = parseInt(chessPosition[0]);
            const cpY = parseInt(chessPosition[1]);

            if(cpX === x && cpY === y) continue;
    
            if(!rpWithArmy(pos.x, pos.y, cpX, cpY)) continue;

            //your team close-up
            if(color === chessColor) {
                result[index]['isDeleted'] = true;
            } else {
                if(chessName === 'king')
                    result[index]['isAttackKing'] = true;
                else
                    result[index]['isAttack'] = true;
            }
        }   
    })
    return result;
}

function queenLogic(chess, chesses) {
    const bishop = bishopLogic(chess, chesses);
    const rock = rockLogic(chess, chesses);
    return [...bishop, ...rock];
}



function kingLogic(chess, chesses) {
    const list = chess.classList;

    const color = list[1][0];
    const position = [...list[2].slice(6)];

    const x = parseInt(position[0]);
    const y = parseInt(position[1]);

    const result = [];

    result.push({x: x + 1, y: y + 1});
    result.push({x: x + 1, y: y - 1});
    result.push({x: x - 1, y: y + 1});
    result.push({x: x - 1, y: y - 1});
    result.push({x: x, y: y + 1});
    result.push({x: x, y: y - 1});
    result.push({x: x + 1, y: y});
    result.push({x: x - 1, y: y});

    const isKingMove = chess.getAttribute('data-move');
    let hasCastling = false;

    //check if king has a castling step or not
    if(!isKingMove) {
        const rocks = $$(`.${color}rock`);

        let rock = null;
        rock = [...rocks].filter((rock)=>{
            return rock.getAttribute('data-move') !== true;
        })

        //loop through all rocks, check each other
        if(rock) {
            rock.forEach((rock)=>{
                const rockList = rock.classList;
                const square = rockList[2];

                const position = [...square.slice(6)];
                const yRock = parseInt(position[1]);

                //rock is left 
                if(y > yRock) {
                    result.push({x: x, y: y - 2});
                } else {
                    result.push({x: x, y: y + 2});
                }
            })
            hasCastling = true;
        }
    }
    
    //step through all steps, check each one
    result.forEach((pos, index)=>{
        if(!rpWithChessBoard(pos.x, pos.y)) {
            return result[index]['isDeleted'] = true;
        }

        for(let i = 0; i < chesses.length; i++){
            const chessList = chesses[i].classList;
    
            const chessColor = chessList[1][0]; 
            const chessName = chessList[1].slice(1);
            const chessPosition = [...chessList[2].slice(6)];
    
            const cpX = parseInt(chessPosition[0]);
            const cpY = parseInt(chessPosition[1]);

            if(cpX === x && cpY === y) continue;

            if(!rpWithArmy(pos.x, pos.y, cpX, cpY)) continue;

            //your team close-up
            if(color === chessColor) {
                result[index]['isDeleted'] = true;
            } else {
                if(chessName === 'king')
                    result[index]['isAttackKing'] = true;
                else
                    result[index]['isAttack'] = true;
            }
            if(!hasCastling) continue;

            for(let i = 1; i < 7; i++) {
                //king position
                if(y === i) continue;
                const square = `.square${x}${i}`;
                const dot = $(square);
                const pushY = y > i ? 2 : -2;

                if(dot.classList.contains('dot')) continue;

                result.forEach((r, index)=>{
                    if(x === r.x && y - pushY === r.y) {
                        result[index]['isDeleted'] = true;
                    }
                })
            }
        }   
    })

    return result;
}

export function logic(chess, chesses) {
    const chessName = chess.classList[1].slice(1);

    let result = [];
    switch(chessName) {
        case 'pawn': 
            result = pawnLogic(chess, chesses);
            break;
        case 'rock': 
            result = rockLogic(chess, chesses);
            break;
        case 'knight': 
            result = knightLogic(chess, chesses);
            break;
        case 'queen': 
            result = queenLogic(chess, chesses);
            break;
        case 'bishop': 
            result = bishopLogic(chess, chesses);
            break;
        case 'king':
            result = kingLogic(chess, chesses);
            break;
    }
    result = result.filter((pos)=>pos.isDeleted != true);
    return result;
}

//gel all next step of chess to warn king when it be attacked
export function getAllNextPace(chesses, color) {
    const filterRockStep = (step, currentStep, attackKingStep)=>{
        const {
            cpX,
            cpY
        } = currentStep;
        let pushX, pushY;
        pushX = (cpX === attackKingStep.x) ? 0 : (cpX > attackKingStep.x ? -1 : 1);
        pushY = (cpY === attackKingStep.y) ? 0 : (cpY > attackKingStep.y ? -1 : 1);
        let time = 1;

        const temp = step.filter((r, i)=>{
            const condition = (r.x === cpX + pushX * time) && (r.y === cpY + pushY * time);
            if(condition) {
                time++;
                return true;
            }
            return false;
        })
        return temp;
    }
    const filterBishopStep = (step, currentStep, attackKingStep)=>{
        const {
            cpX,
            cpY
        } = currentStep;
        let pushX, pushY;
        pushX = attackKingStep.x - cpX > 0 ? 1 : -1;
        pushY = attackKingStep.y - cpY > 0 ? 1 : -1;
        let time = 1;
        const temp = step.filter((r, i)=>{
            if (r.x === cpX + pushX*time && r.y === cpY + pushY*time) {
                time++;
                return r;
            }
        })
        return temp;
    }

    let result = [];
    for(let i = 0; i < chesses.length; i++) {
        const chessList = chesses[i].classList;
        const chessName = chessList[1].slice(1);
        const chessPosition = [...chessList[2].slice(6)];
        const cpX = parseInt(chessPosition[0]);
        const cpY = parseInt(chessPosition[1]);

        const step = logic(chesses[i], chesses);
        const attackKingStep = step.find((step)=>step.isAttackKing === true);

        if(!attackKingStep) continue;

        let pace = [];
        let temp = null;
        switch(chessName) {
            case 'pawn':
            case 'king':
            case 'knight':
                pace.push({...attackKingStep});
                break; 
            case 'rock': 
                temp = filterRockStep(step, {cpX, cpY}, attackKingStep);
                pace = [...pace, ...temp];
                break;
            case 'queen':
                const isRockStep = (cpX == attackKingStep.x) || (cpY == attackKingStep.y);
                if(isRockStep) temp = filterRockStep(step,{cpX, cpY}, attackKingStep);
                else temp = filterBishopStep(step,{cpX, cpY}, attackKingStep);
                pace = [...pace, ...temp];
                break;
            case 'bishop': 
                temp = filterBishopStep(step,{cpX, cpY}, attackKingStep);
                pace = [...pace, ...temp];
                break;
        }
        result.push({name: chessName, pace: pace});
    }
    return result;
}
