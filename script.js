document.addEventListener('DOMContentLoaded', () => {
    // 获取画布和按钮元素
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const restartBtn = document.getElementById('restart-btn');
    const scoreElement = document.getElementById('score');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    
    // 设置游戏参数
    const gridSize = 20;
    const tileCount = 20;
    canvas.width = tileCount * gridSize;
    canvas.height = tileCount * gridSize;
    
    // 游戏状态
    let gameRunning = false;
    let gamePaused = false;
    let gameSpeed = 200; // 毫秒，初始速度较慢
    let baseSpeed = 400; // 基础速度
    let gameLoop;
    
    // 蛇的初始位置和速度
    let snake = [
        { x: 10, y: 10 }
    ];
    let velocityX = 0;
    let velocityY = 0;
    let nextVelocityX = 0;
    let nextVelocityY = 0;
    
    // 食物位置
    let food = {
        x: 5,
        y: 5
    };
    
    // 分数
    let score = 0;
    
    // 初始化游戏
    function initGame() {
        snake = [{ x: 10, y: 10 }];
        velocityX = 0;
        velocityY = 0;
        nextVelocityX = 0;
        nextVelocityY = 0;
        score = 0;
        scoreElement.textContent = score;
        generateFood();
        render();
    }
    
    // 生成食物
    function generateFood() {
        // 随机生成食物位置
        function getRandomPosition() {
            return Math.floor(Math.random() * tileCount);
        }
        
        let newFoodPosition;
        let foodOnSnake;
        
        // 确保食物不会生成在蛇身上
        do {
            foodOnSnake = false;
            newFoodPosition = {
                x: getRandomPosition(),
                y: getRandomPosition()
            };
            
            // 检查食物是否在蛇身上
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === newFoodPosition.x && snake[i].y === newFoodPosition.y) {
                    foodOnSnake = true;
                    break;
                }
            }
        } while (foodOnSnake);
        
        food = newFoodPosition;
    }
    
    // 游戏主循环
    function gameUpdate() {
        if (!gameRunning || gamePaused) return;
        
        // 更新蛇的方向
        velocityX = nextVelocityX;
        velocityY = nextVelocityY;
        
        // 移动蛇
        const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
        
        // 检查是否撞墙
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }
        
        // 检查是否撞到自己
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }
        
        // 在蛇头前添加新的头部
        snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            // 增加分数
            score += 10;
            scoreElement.textContent = score;
            
            // 生成新的食物
            generateFood();
            
            // 增加分数，但不自动增加游戏速度
            // 游戏速度现在由滑块控制
        } else {
            // 如果没有吃到食物，移除尾部
            snake.pop();
        }
        
        // 渲染游戏
        render();
    }
    
    // 渲染游戏
    function render() {
        // 清空画布
        ctx.fillStyle = '#e8f5e9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制蛇
        ctx.fillStyle = '#4CAF50';
        for (let i = 0; i < snake.length; i++) {
            ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
        }
        
        // 绘制蛇头
        ctx.fillStyle = '#388E3C';
        ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 2, gridSize - 2);
        
        // 绘制食物
        ctx.fillStyle = '#F44336';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    }
    
    // 游戏结束
    function gameOver() {
        gameRunning = false;
        clearInterval(gameLoop);
        alert(`游戏结束！你的得分是: ${score}`);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
    
    // 开始游戏
    function startGame() {
        if (!gameRunning) {
            gameRunning = true;
            gamePaused = false;
            initGame();
            
            // 设置初始方向，避免游戏立即结束
            nextVelocityX = 1;
            nextVelocityY = 0;
            
            gameLoop = setInterval(gameUpdate, gameSpeed);
            startBtn.disabled = true;
            pauseBtn.disabled = false;
        }
    }
    
    // 暂停游戏
    function togglePause() {
        if (gameRunning) {
            gamePaused = !gamePaused;
            pauseBtn.textContent = gamePaused ? '继续' : '暂停';
        }
    }
    
    // 重新开始游戏
    function restartGame() {
        clearInterval(gameLoop);
        initGame();
        if (gameRunning) {
            gameLoop = setInterval(gameUpdate, gameSpeed);
        }
        gamePaused = false;
        pauseBtn.textContent = '暂停';
    }
    
    // 键盘控制
    function handleKeyDown(e) {
        // 防止按键导致页面滚动
        if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
            e.preventDefault();
        }
        
        // 如果游戏未运行，不处理按键
        if (!gameRunning || gamePaused) return;
        
        // 根据按键改变方向
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (velocityY !== 1) { // 防止反向移动
                    nextVelocityX = 0;
                    nextVelocityY = -1;
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (velocityY !== -1) {
                    nextVelocityX = 0;
                    nextVelocityY = 1;
                }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (velocityX !== 1) {
                    nextVelocityX = -1;
                    nextVelocityY = 0;
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (velocityX !== -1) {
                    nextVelocityX = 1;
                    nextVelocityY = 0;
                }
                break;
        }
    }
    
    // 添加事件监听器
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartGame);
    document.addEventListener('keydown', handleKeyDown);
    
    // 速度控制滑块事件
    speedSlider.addEventListener('input', function() {
        const speedLevel = parseInt(this.value);
        speedValue.textContent = speedLevel;
        
        // 根据滑块值调整游戏速度
        // 值越大，速度越快（间隔越小）
        // 确保即使在最低速度1时，游戏速度也是合理的
        gameSpeed = baseSpeed - (speedLevel - 1) * 15;
        
        // 防止速度过快或过慢
        if (gameSpeed < 50) gameSpeed = 50;
        if (gameSpeed > 350) gameSpeed = 350;
        
        // 如果游戏正在运行，更新游戏循环
        if (gameRunning && !gamePaused) {
            clearInterval(gameLoop);
            gameLoop = setInterval(gameUpdate, gameSpeed);
        }
    });
    
    // 初始化游戏
    pauseBtn.disabled = true;
    initGame();
});