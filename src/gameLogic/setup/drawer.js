//import something
import {
    whiteChess,
    blackChess
} from './../constant/path.js';

import {
    logic
} from './logic.js';

import observer from './observer.js';
import gamePlay from '../index.js';

//setup shortcut for query selector
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const container = $('.container');
const chesses = $$('.fill');
const drags = $$('.draggable');

//handle click event
const handleClickEvent = (chess)=>{
    const positions = logic(chess, $$('.chess'));
    const dots = $$('.dot');
    const attacked = $$('.attack');
    const attackKing = $$('.attack-king');

    for(let i = 0; i < dots.length; i++) {
        dots[i].style.display = 'none'
    }

    for(let i = 0; i < attackKing.length; i++) {
        attackKing[i].classList.remove('attack-king');
    }

    for(let i = 0; i < attacked.length; i++) {
        attacked[i].classList.remove('attack');
    }

    positions.forEach((position)=>{
        const dot = $(`.square${position.x}${position.y}`);
        if(position.isAttack) {
            dot.classList.add('attack');
        }
        dot.style.display = 'block';
    })
    return positions;
}

//active background of king when it be attacked
export function activeAttackKing(step){
    step.forEach((position)=>{
        const dot = $(`.square${position.x}${position.y}`);
        if(position.isAttackKing) {
            dot.classList.add('attack-king');
        }
        dot.style.display = 'block';
    })
}

//handle dragEvent
export function handleDragEvent() {
    //click event
    let rule = [];

    //loop through each square, add some event for it
    for(let i = 0; i < drags.length; i++) {
        const drag = drags[i];
        
        //add click event on square
        drag.addEventListener('click', ()=>{
            const chess = drag.querySelector('.chess');

            if(chess) {
                handleClickEvent(chess);
            }
        });

        //add drag start event on square
        drag.addEventListener('dragstart', () => {
            const drags = $$('.dragging');

            for(const drag of drags) {
                drag.classList.remove('dragging');
            }

            drag.classList.add('dragging');

            const chess = drag.querySelector('.chess');
            if(chess) {
                //add all steps of this current chess
                rule = [...handleClickEvent(chess)];
            }
        });
    
        //add drag end event on square
        drag.addEventListener('dragend', () => {
            drag.classList.remove('dragging');
        });

        //add drag over evnet on square
        drag.addEventListener('dragover', e => {
            e.preventDefault();
        })

        //add drop event on square
        drag.addEventListener('drop', e => {
            e.preventDefault();
            let childElement = null;

            //get the square is dropped (is replaced by chess)
            //has 2 type, dot or chess
            childElement = drag.querySelector('.dot') || drag.querySelector('.chess');

            //get coordinate of square on matrix
            const square = childElement.classList[2] || childElement.classList[1];

            //get dropped square position
            const squarePosition = [...square.slice(6)];

            //check if this position has existed on chess's step
            if(!rule.some((rule)=>
                (rule.x === parseInt(squarePosition[0]) && rule.y === parseInt(squarePosition[1])
            ))) return;

            //get chess being dragging
            const dragElement = $('.draggable.dragging');
            const chess = dragElement.querySelector('.chess');
            
            //get chess coordinate
            const chessSquare = chess.classList[2];
            //core position
            const movePosition = [...chessSquare.slice(6)];

            //check if moving on one square
            if(chessSquare === square) return;

            const chessColor = chess.classList[1][0];
            const chessName = chess.classList[1].slice(1); 

            //get square is dropped
            const ateChessName = childElement.classList[1].slice(1); 

            //check is your turn
            const isWhiteTurn = gamePlay.isWhiteTurn;

            //get correct turn
            if((chessColor === 'w' && isWhiteTurn) || (chessColor === 'b' && !isWhiteTurn)) {

            } else {
                return;
            }

            //add some attribute if king or rock is moving to handle castling
            if(chessName === 'king' || chessName === 'rock') {
                chess.setAttribute('data-move', true);
            }

            //swap 2 square
            chess.classList.remove(chessSquare);
            chess.classList.add(square);

            childElement.classList.remove(square);
            childElement.classList.add(chessSquare);

            //change state
            drag.appendChild(chess);

            //handle if dropped square if dot or chess
            if(childElement.classList.contains('dot')) {
                drag.removeChild(childElement);
                dragElement.appendChild(childElement);  
            } else {
                //check if chessName = king = endgame 
                drag.removeChild(childElement);
                childElement.classList.remove(...childElement.classList);
                childElement.classList.add('dot');
                childElement.classList.add(chessSquare);
                dragElement.appendChild(childElement);

                //if dropped square is king, PUBLISH event END_GAME for game loop to handle
                if(ateChessName === 'king') {
                    container.classList.add('blur');
                    observer.notifyEvent('END_GAME', {color: chessColor});
                    return;
                }
            }

            //if king is castling, PUBLISH evnet CASTLING for game loop to handle
            if( chessName === 'king' && 
                movePosition[0] == squarePosition[0] && 
                Math.abs(movePosition[1] - squarePosition[1]) === 2
            ) {
                observer.notifyEvent('CASTLING', {
                    position: {
                        x: squarePosition[0], y: squarePosition[1]
                    },
                    color: chessColor
                });
            }

            //clear dot
            const dots = $$('.dot');
            for(let i = 0; i < dots.length; i++) {
                dots[i].style.display = 'none'
            }
            //clear attack
            const attacked = $$('.attack');
            for(let i = 0; i < attacked.length; i++) {
                attacked[i].classList.remove('attack');
            }

            //if pawn is promote, PUBLISH event PROMOTION for game loop to handle
            if(chessName === 'pawn' && (square[6] === '0' || square[6] === '7')) {
                const promotion = $('.promotion');

                container.classList.add('blur');

                promotion.style.display = 'flex';
                promotion.style.opacity = 1;

                observer.notifyEvent('PROMOTION', {square: square, color: chessColor});
            }

            //PUBLISH event CHANGE_TURN for game loop to handle
            observer.notifyEvent('CHANGE_TURN', null);

            //after moving this chess, handle if existing attack_king on your chess board
            //PUBLISH event ATTACK_KING for game loop to handle
            observer.notifyEvent('ATTACK_KING', {chesses: $$('.chess'), color: chess.classList[1][0]});
        })
    }
}

//draw each square on your chess board
export function drawChess(){
    const N = 8; 
    let x, y = 0;
    let chessContainer = whiteChess;

    for(let i = 16; i < 48; i++) {
        x = parseInt(i / N);
        y = i % N;
        
        drags[i].style.top = x * 75 + 'px';
        drags[i].style.left = y * 75 + 'px';

        const dot = drags[i].querySelector('.dot');
        dot.classList.add(`square${x}${y}`);
    }
    // 0 - 23
    for(let i = 0; i < chesses.length; i++){
        const drag = chesses[i];

        const chess = drag.querySelector('.chess');
        //get chess name
        const chessName = chess.classList[1];
        const color = chessName[0].toUpperCase();
        const name = chessName.slice(1).toUpperCase();

        if(color === 'B') {
            chessContainer = blackChess;
            //16 - 31
            x = N - parseInt(i / N) + 1;
            y = i % N;
        }
        else {
            chessContainer = whiteChess;
            // 0 - 15
            x = parseInt(i / N);
            y = i % N;
        }

        //Change background
        drag.draggable = true;
        drag.style.top = x * 75 + 'px';
        drag.style.left = y * 75 + 'px';


        chess.style.backgroundImage = `url(${chessContainer[`${color}_${name}`]})`;
        chess.classList.add(`square${x}${y}`);
    }
}


