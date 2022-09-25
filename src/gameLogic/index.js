import {
    drawChess,
    handleDragEvent,
    activeAttackKing
} from './setup/drawer.js';

import {
    getAllNextPace
} from './setup/logic.js'

import {
    blackChess,
    whiteChess
} from './constant/path.js'

import observer from './setup/observer.js';
//setup shortcut for query selector
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const container = $('.container');
const promotion = $('.promotion');

const gamePlay = {
    isWhiteTurn: true,
    execute: (event, data)=>{
        switch(event) {
            case 'CHANGE_TURN':
                gamePlay.changeTurn();
                const colorClass = gamePlay.isWhiteTurn ? 'white' : 'black';
                const turn = $('.turn');
                const list = turn.classList;
                turn.classList.remove(list[list.length - 1]);
                turn.classList.add(colorClass);

                turn.innerHTML = `<h3>${colorClass.toUpperCase()} TURN</h3>`;
                break;
            case 'ATTACK_KING':
                const {color, chesses} = data;
                const step = getAllNextPace(chesses, color);
                step.forEach((step)=>{
                    activeAttackKing(step.pace);
                })
                break;
            case 'CASTLING':
                gamePlay.handleCastling(data);
                console.log('CASTLING')
                break;
            case 'PROMOTION':
                gamePlay.handlePromotion(data);
                console.log('PROMOTION')
                break;
            case 'END_GAME':
                gamePlay.handleEndgame(data);
                break;
        }
    },
    handleCastling: (data)=>{
        const {
            position,
            color
        } = data;

        const rocks = $$(`.${color}rock`);

        //get rock nearest
        const rock = [...rocks].find((rock)=>{
            const rockList = rock.classList;
            const square = rockList[2];

            const rockPosition = [...square.slice(6)];
            const yRock = parseInt(rockPosition[1]);

            return Math.abs(yRock - position.y) <= 2;
        })

        console.log(rock);

        const pushY = position.y >= 4 ? -1 : 1;
        //get dot to swap

        const dot = $(`.square${parseInt(position.x)}${parseInt(position.y) + pushY}`);
        const dotParent = dot.parentElement;

        //get rock to swap
        const rockList = rock.classList;
        const square = rockList[2];
        const rockPosition = [...square.slice(6)];
        const xRock = parseInt(rockPosition[0]);
        const yRock = parseInt(rockPosition[1]);

        const rockParent = rock.parentElement;

        //swap classlist
        rock.classList.remove(`square${xRock}${yRock}`);
        dot.classList.remove(`square${parseInt(position.x)}${parseInt(position.y) + pushY}`);

        rock.classList.add(`square${parseInt(position.x)}${parseInt(position.y) + pushY}`);
        dot.classList.add(`square${xRock}${yRock}`);

        rockParent.removeChild(rock);
        dotParent.removeChild(dot);

        rockParent.appendChild(dot);
        dotParent.appendChild(rock);
    },
    handleEndgame: (data)=>{
        const {
            color
        } = data;
        let fullColor = color === 'w' ? 'WHITE CHESS WIN' : 'BLACK CHESS WIN'
        const gameOver = $('.game-over');
        gameOver.style.display = 'flex';
        gameOver.style.opacity = 1;
        gameOver.innerHTML = `<h3>${fullColor}</h3>`

        const reGame = ()=>{
            container.classList.remove('blur');
            gameOver.style.display = 'none';
            gameOver.style.opacity = 0;
            gameOver.innerHTML = '';
            container.removeEventListener('click', reGame);
            window.location.reload();
        };

        container.addEventListener('click', reGame);
    },

    handlePromotion: (data)=>{
        const {
            square,
            color
        } = data;

        let chessContainer = blackChess;

        if(color === 'w') 
            chessContainer = whiteChess;

        const add = [`${color.toUpperCase()}_QUEEN`, `${color.toUpperCase()}_ROCK`, 
                     `${color.toUpperCase()}_KNIGHT`, `${color.toUpperCase()}_BISHOP`,
                     `${color.toUpperCase()}_PAWN`];

        const handlePromoterClick = (e) => {
            // e.stoppropagation();
            const promoter = e.target;

            const chess = $(`.${square}`);
            const chessInfo = promoter.classList[1];
            const arr = chessInfo.split('_');
            
            chess.classList.remove(...chess.classList);
            chess.classList.add('chess')
            chess.classList.add(`${color}${arr[1].toLowerCase()}`);
            chess.classList.add(`${square}`);

            chess.style.backgroundImage = `url(${chessContainer[chessInfo]})`;


            container.style.opacity = 1;
            promotion.style.opacity = 0;
            promotion.style.display = 'none';

            $$('.promote').forEach((pro)=>{
                pro.classList.remove(...pro.classList);
                pro.removeEventListener('click', handlePromoterClick);
                pro.classList.add('promote');
            })

        }
        const promoter = $$('.promote');
        promoter.forEach((pro, index)=>{
            pro.style.backgroundImage = `url(${chessContainer[add[index]]})`;
            pro.classList.add(add[index])
            pro.addEventListener('click', handlePromoterClick);
        })
    },
    changeTurn: ()=>{gamePlay.isWhiteTurn = !gamePlay.isWhiteTurn},
    start: ()=>{
        observer.addSubscriber(gamePlay);
        drawChess();
        handleDragEvent();
    }
}

gamePlay.start();
export default gamePlay;